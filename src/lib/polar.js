// Polar.sh Payment Integration for ThumbnailMAX
// Merchant of Record - handles all tax/VAT automatically

// =============================================================================
// TEST MODE - Testerlar için tüm Pro özellikleri açık, ödeme UI gizli
// Production'a geçerken false yapılacak
// =============================================================================
export const TEST_MODE = true;

// =============================================================================
// CONFIGURATION - Polar.sh Dashboard'dan alınacak değerler
// =============================================================================
export const POLAR_CONFIG = {
  // Polar.sh Organization slug
  organizationId: import.meta.env.VITE_POLAR_ORG_ID || '873bbae8-d218-4673-a435-ff4162853de3',

  // Product IDs
  products: {
    pro_monthly: import.meta.env.VITE_POLAR_PRO_MONTHLY_ID || 'da6e1211-cd0c-48fc-afd7-7b27a0b8def6',
    pro_yearly: import.meta.env.VITE_POLAR_PRO_YEARLY_ID || '53cad33a-69df-48d6-9233-264a04af9f70',
  },

  // Checkout Link URL (Polar Dashboard'dan oluşturulan)
  checkoutUrl: import.meta.env.VITE_POLAR_CHECKOUT_URL || 'https://buy.polar.sh/polar_cl_uFAhxcbQm4stiIQsycezaMwdw4k7CPaUNgsYA1GBqYe',

  // Environment: 'production' or 'sandbox'
  environment: import.meta.env.VITE_POLAR_ENV || 'sandbox',
};

// =============================================================================
// PLAN DEFINITIONS
// =============================================================================
export const PLANS = {
  free: {
    id: 'free',
    name: 'Ücretsiz',
    price: 0,
    period: null,
    features: [
      'Günde 5 thumbnail oluşturma',
      'Gemini 2.0 Flash modeli',
      '3 CTR arketipi',
      '2 tipografi stili',
      'Standart kalite (720p)',
      'ThumbnailMAX filigranı',
    ],
    limits: {
      dailyGenerations: 5,
      allowedModels: ['gemini-2.0-flash'],
      allowedArchetypes: ['shocked_threat', 'power_fantasy', 'before_after', 'reaction_face', 'expert_authority', 'challenge_fun'],
      allowedTypoStyles: ['auto_harmony', 'maximum_impact'],
      maxResolution: '720p',
      watermark: true,
      conceptImage: false,
      topicResearch: false,
      textRemoval: false,
      editor: false,
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 9.99,
    yearlyPrice: 79.99, // ~33% indirim
    features: [
      'Sınırsız thumbnail oluşturma',
      'Tüm AI modelleri (Gemini 3 Pro dahil)',
      '6 CTR arketipi',
      '5 tipografi stili',
      '4K kalite çıktı',
      'Filigran yok',
      'Konsept görsel analizi',
      'AI konu araştırması',
      'Metin silme özelliği',
      'Gelişmiş editör',
      'Öncelikli destek',
    ],
    limits: {
      dailyGenerations: Infinity,
      allowedModels: ['gemini-3-pro-image-preview', 'gemini-2.0-flash-exp', 'gemini-2.0-flash'],
      allowedArchetypes: ['shocked_threat', 'power_fantasy', 'mystery_object', 'almost_fail', 'scale_contrast', 'before_after', 'reaction_face', 'expert_authority', 'food_desire', 'travel_wonder', 'transformation', 'breaking_news', 'music_energy', 'challenge_fun', 'mystery_reveal'],
      allowedTypoStyles: ['auto_harmony', 'cinematic_epic', 'gaming_neon', 'maximum_impact', 'elegant_modern'],
      maxResolution: '4k',
      watermark: false,
      conceptImage: true,
      topicResearch: true,
      textRemoval: true,
      editor: true,
    },
  },
};

// =============================================================================
// LICENSE KEY MANAGEMENT
// =============================================================================
const LICENSE_STORAGE_KEY = 'thumbmax_license_key';
const LICENSE_STATUS_KEY = 'thumbmax_license_status';
const LICENSE_CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 saat

/**
 * License key'i localStorage'a kaydet
 */
export function saveLicenseKey(key) {
  localStorage.setItem(LICENSE_STORAGE_KEY, key);
}

/**
 * Kayıtlı license key'i getir
 */
export function getLicenseKey() {
  return localStorage.getItem(LICENSE_STORAGE_KEY) || '';
}

/**
 * License key'i sil (çıkış yap)
 */
export function removeLicenseKey() {
  localStorage.removeItem(LICENSE_STORAGE_KEY);
  localStorage.removeItem(LICENSE_STATUS_KEY);
}

/**
 * Polar.sh API üzerinden license key doğrula
 * Not: Bu client-side validation'dır. Production'da backend kullanılması önerilir.
 */
export async function validateLicenseKey(licenseKey) {
  if (!licenseKey || licenseKey.trim() === '') {
    return { valid: false, error: 'Lisans anahtarı boş olamaz' };
  }

  try {
    const response = await fetch(
      'https://api.polar.sh/v1/customer-portal/license-keys/validate',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: licenseKey.trim(),
          organization_id: POLAR_CONFIG.organizationId,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        valid: false,
        error: errorData.detail || 'Lisans doğrulanamadı',
      };
    }

    const data = await response.json();

    // License key durumunu cache'le
    const status = {
      valid: data.valid === true,
      plan: 'pro',
      expiresAt: data.expires_at,
      activations: data.activations,
      checkedAt: Date.now(),
    };

    localStorage.setItem(LICENSE_STATUS_KEY, JSON.stringify(status));

    return {
      valid: status.valid,
      plan: 'pro',
      expiresAt: data.expires_at,
    };
  } catch (err) {
    // Network hatası - cache'den kontrol et
    const cached = getCachedLicenseStatus();
    if (cached && cached.valid) {
      return { valid: true, plan: 'pro', cached: true };
    }
    return { valid: false, error: 'Bağlantı hatası. Lütfen tekrar deneyin.' };
  }
}

/**
 * License key'i aktive et (cihaz bazlı)
 */
export async function activateLicenseKey(licenseKey, label) {
  try {
    const response = await fetch(
      'https://api.polar.sh/v1/customer-portal/license-keys/activate',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: licenseKey.trim(),
          organization_id: POLAR_CONFIG.organizationId,
          label: label || `ThumbnailMAX-${navigator.userAgent.slice(0, 30)}`,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { success: false, error: errorData.detail || 'Aktivasyon başarısız' };
    }

    const data = await response.json();
    saveLicenseKey(licenseKey.trim());

    return { success: true, data };
  } catch (err) {
    return { success: false, error: 'Bağlantı hatası' };
  }
}

/**
 * Cache'lenmiş lisans durumunu getir
 */
export function getCachedLicenseStatus() {
  try {
    const cached = localStorage.getItem(LICENSE_STATUS_KEY);
    if (!cached) return null;

    const status = JSON.parse(cached);

    // Süre dolmuşsa null döndür
    if (status.expiresAt && new Date(status.expiresAt) < new Date()) {
      removeLicenseKey();
      return null;
    }

    return status;
  } catch {
    return null;
  }
}

/**
 * Kullanıcının aktif planını belirle
 */
export function getCurrentPlan() {
  // Test modunda her zaman Pro plan döndür
  if (TEST_MODE) return PLANS.pro;

  const licenseKey = getLicenseKey();
  if (!licenseKey) return PLANS.free;

  const cached = getCachedLicenseStatus();
  if (cached && cached.valid) {
    return PLANS.pro;
  }

  return PLANS.free;
}

/**
 * Belirli bir özelliğin kullanılabilir olup olmadığını kontrol et
 */
export function canUseFeature(feature, plan) {
  const currentPlan = plan || getCurrentPlan();
  return currentPlan.limits[feature] === true || currentPlan.limits[feature] === Infinity;
}

/**
 * Günlük kullanım sayacı
 */
const DAILY_USAGE_KEY = 'thumbmax_daily_usage';

export function getDailyUsage() {
  try {
    const data = JSON.parse(localStorage.getItem(DAILY_USAGE_KEY) || '{}');
    const today = new Date().toISOString().split('T')[0];

    if (data.date !== today) {
      return { date: today, count: 0 };
    }
    return data;
  } catch {
    return { date: new Date().toISOString().split('T')[0], count: 0 };
  }
}

export function incrementDailyUsage() {
  const usage = getDailyUsage();
  usage.count += 1;
  localStorage.setItem(DAILY_USAGE_KEY, JSON.stringify(usage));
  return usage;
}

export function canGenerate(plan) {
  const currentPlan = plan || getCurrentPlan();
  if (currentPlan.limits.dailyGenerations === Infinity) return true;

  const usage = getDailyUsage();
  return usage.count < currentPlan.limits.dailyGenerations;
}

export function getRemainingGenerations(plan) {
  const currentPlan = plan || getCurrentPlan();
  if (currentPlan.limits.dailyGenerations === Infinity) return Infinity;

  const usage = getDailyUsage();
  return Math.max(0, currentPlan.limits.dailyGenerations - usage.count);
}

// =============================================================================
// CHECKOUT URL BUILDER
// =============================================================================

/**
 * Polar.sh checkout URL'i döndür
 */
export function getCheckoutUrl() {
  return POLAR_CONFIG.checkoutUrl;
}

/**
 * Aylık Pro checkout URL
 */
export function getProMonthlyCheckoutUrl() {
  return POLAR_CONFIG.checkoutUrl;
}

/**
 * Yıllık Pro checkout URL
 */
export function getProYearlyCheckoutUrl() {
  return POLAR_CONFIG.checkoutUrl;
}
