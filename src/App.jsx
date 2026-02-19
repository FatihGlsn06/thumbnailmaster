import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Image as ImageIcon, Sparkles, Download, RefreshCcw,
  Type, BrainCircuit, Check, Monitor, Wand2, AlertTriangle, Palette, Eye,
  Layers, Key, EyeOff, Zap, Play, Youtube, Edit3,
  ChevronDown, Star, ArrowRight, MoreVertical, Search, Bell, Mic,
  Menu, Home, Compass, PlaySquare, Clock, ThumbsUp, Film, Gamepad2,
  Music, Radio, Trophy, Lightbulb, Shirt, X, User, Smartphone, Grid3X3,
  TrendingUp, Target, MousePointer, BarChart3, Send, MessageSquare
} from 'lucide-react';
import { WebGLShader } from '@/components/ui/web-gl-shader';
import { LiquidButton, MetalButton } from '@/components/ui/liquid-glass-button';
import { Logo, LogoIcon, LogoMinimal } from '@/components/ui/logo';
import ThumbnailEditor from '@/components/ThumbnailEditor';
import PricingSection from '@/components/PricingSection';
import LicenseKeyModal from '@/components/LicenseKeyModal';
import { ProBadge, ProLockOverlay, UsageBadge } from '@/components/ProBadge';
import { useI18n } from '@/lib/i18n';
import {
  getCurrentPlan, canGenerate, getRemainingGenerations,
  incrementDailyUsage, getLicenseKey, validateLicenseKey,
  PLANS, TEST_MODE,
} from '@/lib/polar';

// =============================================================================
// SMART CONTENT DETECTION - İçerik tipine göre otomatik parametre ayarı
// =============================================================================
const CONTENT_CATEGORIES = {
  gaming: {
    id: 'gaming',
    keywords: [
      // Generic gaming terms (fallback - AI classification is primary)
      'game', 'oyun', 'gaming', 'gamer', 'gameplay', 'walkthrough', 'playthrough', 'lets play',
      'fps', 'rpg', 'mmorpg', 'moba', 'rts', 'battle royale', 'roguelike', 'soulslike',
      'boss fight', 'raid', 'pvp', 'speedrun', 'dlc', 'esport', 'esports',
      'oynuyorum', 'oynadım', 'oynuyoruz', 'oynanış',
      // Platforms (strong gaming signal)
      'steam', 'playstation', 'xbox', 'nintendo', 'ps5', 'epic games', 'gamepass',
    ],
    temperature: 0.7,
    defaultArchetypes: ['shocked_threat', 'power_fantasy', 'scale_contrast', 'almost_fail'],
    promptStyle: 'epic',
    visualMood: 'Cinematic, epic, high-energy, dramatic lighting with vibrant color accents',
  },
  education: {
    id: 'education',
    keywords: ['tutorial', 'nasıl', 'how to', 'öğren', 'learn', 'eğitim', 'ders', 'course', 'lesson', 'tips', 'trick', 'guide', 'rehber', 'bilgi', 'bilim', 'science', 'matematik', 'tarih', 'history', 'fizik', 'kimya', 'biyoloji', 'edebiyat', 'felsefe', 'psikoloji', 'explain', 'explained', 'açıklama', 'nedir', 'what is', 'fact', 'gerçek', 'analiz', 'analysis', 'documentary', 'belgesel', 'araştırma', 'research', 'ramazan', 'namaz', 'ibadet', 'oruç', 'dua', 'kuran', 'quran', 'din', 'islam', 'hristiyanlık', 'budizm', 'meditasyon', 'meditation', 'spirituality', 'maneviyat', 'felsefe', 'philosophy', 'hadis', 'sünnet', 'cami', 'kilise', 'sinagog', 'bayram', 'iftar', 'sahur', 'teravih', 'zekat', 'hac', 'umre', 'mevlid', 'kandil', 'cuma', 'hutbe', 'vaaz', 'ilmihal', 'fıkıh', 'tefsir', 'siyer', 'peygamber', 'sahabe', 'kitap', 'book', 'okuma', 'reading', 'özet', 'summary', 'inceleme', 'review', 'motivasyon', 'motivation', 'kişisel gelişim', 'self improvement', 'psychology', 'mindset'],
    temperature: 0.5,
    defaultArchetypes: ['expert_authority', 'mystery_reveal', 'reaction_face'],
    promptStyle: 'clean',
    visualMood: 'Professional, clean, trustworthy, soft lighting with clear focal points',
  },
  vlog: {
    id: 'vlog',
    keywords: ['vlog', 'günlük', 'daily', 'storytime', 'story time', 'hayatım', 'life', 'reaction', 'tepki', 'challenge', 'denedim', 'tried', 'podcast', 'sohbet', 'chat', 'q&a', 'soru cevap', 'mukbang', 'unboxing', 'kutu açılımı', 'haul', 'alışveriş', 'shopping', 'day in my life', 'routine', 'rutin', 'grwm', 'get ready', 'hazırlan', 'tag', 'trend', 'tiktok'],
    temperature: 0.6,
    defaultArchetypes: ['reaction_face', 'challenge_fun', 'breaking_news'],
    promptStyle: 'energetic',
    visualMood: 'Bright, energetic, authentic, natural lighting with bold pops of color',
  },
  food: {
    id: 'food',
    keywords: ['yemek', 'food', 'tarif', 'recipe', 'cooking', 'pişir', 'mutfak', 'kitchen', 'chef', 'şef', 'restoran', 'restaurant', 'lezzet', 'taste', 'yedim', 'ate', 'eat', 'burger', 'pizza', 'pasta', 'tatlı', 'dessert', 'cake', 'kahvaltı', 'breakfast', 'dinner', 'lunch', 'street food', 'sokak lezzeti', 'mukbang', 'asmr food'],
    temperature: 0.6,
    defaultArchetypes: ['food_desire', 'reaction_face', 'transformation'],
    promptStyle: 'warm',
    visualMood: 'Warm tones, appetizing, close-up detail, golden-hour style lighting, steam and texture',
  },
  travel: {
    id: 'travel',
    keywords: ['seyahat', 'travel', 'gezi', 'trip', 'tur', 'tour', 'otel', 'hotel', 'havalimanı', 'airport', 'uçak', 'flight', 'ülke', 'country', 'şehir', 'city', 'plaj', 'beach', 'dağ', 'mountain', 'doğa', 'nature', 'kamp', 'camp', 'hiking', 'yürüyüş', 'backpack', 'manzara', 'landscape', 'keşfet', 'explore', 'adventure', 'macera'],
    temperature: 0.7,
    defaultArchetypes: ['travel_wonder', 'reaction_face', 'scale_contrast'],
    promptStyle: 'cinematic',
    visualMood: 'Breathtaking, wide-angle, golden hour, vivid natural colors, sense of awe and scale',
  },
  tech: {
    id: 'tech',
    keywords: ['teknoloji', 'tech', 'technology', 'telefon', 'phone', 'iphone', 'samsung', 'android', 'ios', 'apple', 'google', 'ai', 'yapay zeka', 'artificial intelligence', 'robot', 'software', 'yazılım', 'code', 'coding', 'programlama', 'programming', 'app', 'uygulama', 'review', 'inceleme', 'laptop', 'pc', 'bilgisayar', 'computer', 'gadget', 'gpu', 'cpu', 'setup', 'unboxing', 'comparison', 'karşılaştırma', 'benchmark', 'test'],
    temperature: 0.5,
    defaultArchetypes: ['expert_authority', 'reaction_face', 'mystery_reveal'],
    promptStyle: 'futuristic',
    visualMood: 'Sleek, modern, minimalist with neon accents, clean product showcase lighting',
  },
  music: {
    id: 'music',
    keywords: ['müzik', 'music', 'şarkı', 'song', 'albüm', 'album', 'konser', 'concert', 'rap', 'hip hop', 'pop', 'rock', 'metal', 'edm', 'dj', 'beat', 'cover', 'remix', 'karaoke', 'enstrüman', 'instrument', 'gitar', 'guitar', 'piyano', 'piano', 'davul', 'drums', 'dans', 'dance', 'choreography', 'koreografi', 'performans', 'performance', 'spotify', 'clip', 'klip'],
    temperature: 0.8,
    defaultArchetypes: ['music_energy', 'reaction_face', 'challenge_fun'],
    promptStyle: 'neon',
    visualMood: 'Neon-lit, high energy, sound wave visuals, concert atmosphere, vibrant and pulsing',
  },
  fitness: {
    id: 'fitness',
    keywords: ['fitness', 'spor', 'sport', 'gym', 'egzersiz', 'exercise', 'workout', 'antrenman', 'training', 'kas', 'muscle', 'diyet', 'diet', 'kilo', 'weight', 'zayıfla', 'bulk', 'protein', 'supplement', 'koşu', 'run', 'yoga', 'pilates', 'bodybuilding', 'crossfit', 'martial arts', 'dövüş', 'boks', 'boxing', 'mma', 'transformation', 'dönüşüm', 'before after', 'öncesi sonrası', 'motivation', 'motivasyon'],
    temperature: 0.6,
    defaultArchetypes: ['transformation', 'power_fantasy', 'expert_authority'],
    promptStyle: 'bold',
    visualMood: 'High contrast, motivational, powerful poses, dramatic side lighting, gritty texture',
  },
};

// Genel/Varsayılan kategori - hiçbir kategoriye uymayan konular için
const GENERAL_CATEGORY = {
  id: 'general',
  keywords: [],
  temperature: 0.6,
  defaultArchetypes: ['reaction_face', 'expert_authority', 'mystery_reveal'],
  promptStyle: 'balanced',
  visualMood: 'Professional, balanced, visually engaging, clean composition with purposeful lighting and natural color palette',
};

/**
 * Akıllı İçerik Algılama - topic ve description'dan otomatik kategori belirle
 */
function detectContentCategory(topic, description = '') {
  const text = `${topic} ${description}`.toLowerCase();
  const scores = {};

  // Keyword-based detection is just a FALLBACK - AI classification (from research) is primary
  for (const [catId, cat] of Object.entries(CONTENT_CATEGORIES)) {
    scores[catId] = 0;
    for (const keyword of cat.keywords) {
      if (text.includes(keyword.toLowerCase())) {
        scores[catId] += keyword.length > 5 ? 3 : keyword.length > 3 ? 2 : 1;
      }
    }
  }

  // Find the category with the highest score
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);

  // If top score is 0 or very low, use general/neutral category (NOT gaming!)
  if (sorted[0][1] < 2) {
    return GENERAL_CATEGORY;
  }

  return CONTENT_CATEGORIES[sorted[0][0]];
}

// HIGH-CTR THUMBNAIL ARCHETYPES - Gaming + Universal
const CTR_ARCHETYPES = [
  // --- GAMING ARCHETYPES ---
  {
    id: 'shocked_threat',
    nameKey: 'arch_shocked_threat',
    descKey: 'arch_shocked_threat_desc',
    icon: '😱',
    ctrBoost: 25,
    category: 'gaming',
    prompt: 'SHOCKED FACE + THREAT COMPOSITION: The person\'s face must be LARGE - taking up 40-50% of the frame height. Face should be centered or slightly below center. Shocked/scared expression with wide eyes and open mouth. Threatening creatures or elements surrounding the person from all sides. The threats should frame the face but not cover it. Dramatic colored lighting (green, red, blue glow) illuminating the face. Text overlay at the BOTTOM of the image, large and bold.',
    bestFor: ['Horror', 'FPS', 'Boss fights', 'Jump scares']
  },
  {
    id: 'power_fantasy',
    nameKey: 'arch_power_fantasy',
    descKey: 'arch_power_fantasy_desc',
    icon: '⚔️',
    ctrBoost: 22,
    category: 'gaming',
    prompt: 'POWER FANTASY COMPOSITION: The person should be prominent - taking up 40-50% of the frame. Centered or slightly off-center positioning. Confident, powerful expression. Glowing aura or energy effect around the subject. Epic background but blurred/subdued to make person pop. Heroic lighting with rim light. Text overlay at the BOTTOM, large and bold.',
    bestFor: ['RPG', 'ARPG', 'Progression', 'Build showcases']
  },
  {
    id: 'mystery_object',
    nameKey: 'arch_mystery_object',
    descKey: 'arch_mystery_object_desc',
    icon: '❓',
    ctrBoost: 20,
    category: 'gaming',
    prompt: 'MYSTERY OBJECT COMPOSITION: Person\'s face large (35-45% of frame) showing curious/intrigued expression. A strange glowing object near them drawing attention. The person should be looking at or reacting to the mysterious object. Spotlight effect on the object. Text overlay at the BOTTOM, large and bold.',
    bestFor: ['Indie games', 'Mods', 'Weird mechanics', 'Easter eggs']
  },
  {
    id: 'almost_fail',
    nameKey: 'arch_almost_fail',
    descKey: 'arch_almost_fail_desc',
    icon: '💀',
    ctrBoost: 23,
    category: 'gaming',
    prompt: 'ALMOST-FAIL COMPOSITION: Person\'s face large (40-50% of frame) showing panic/stress expression. Critical moment frozen - danger approaching. Red warning tints or indicators visible. The person should look like they\'re about to lose. Tension should be palpable. Text overlay at the BOTTOM, large and bold.',
    bestFor: ['Clutch moments', 'Speedruns', 'Challenge runs', 'PvP']
  },
  {
    id: 'scale_contrast',
    nameKey: 'arch_scale_contrast',
    descKey: 'arch_scale_contrast_desc',
    icon: '🐜',
    ctrBoost: 21,
    category: 'gaming',
    prompt: 'SCALE CONTRAST COMPOSITION: Show extreme size contrast. Either the person is small facing a MASSIVE threat that fills the background, OR the person\'s face is large (40-50%) with tiny enemies swarming around them. The scale difference must be immediately obvious and dramatic. Text overlay at the BOTTOM, large and bold.',
    bestFor: ['Boss fights', 'Mods', 'Glitches', 'Size comparison']
  },
  {
    id: 'before_after',
    nameKey: 'arch_before_after',
    descKey: 'arch_before_after_desc',
    icon: '📊',
    ctrBoost: 18,
    category: 'gaming',
    prompt: 'BEFORE/AFTER COMPOSITION: Clear left/right split showing transformation. Person can appear on both sides or just one side (40-50% of frame). Left side should look weak/poor/struggling. Right side should look powerful/rich/successful. Clear visual arrow or divider between sides. Text overlay at the BOTTOM, large and bold.',
    bestFor: ['Builds', 'Economy', 'Strategy', 'Tutorials']
  },
  // --- UNIVERSAL ARCHETYPES ---
  {
    id: 'reaction_face',
    nameKey: 'arch_reaction_face',
    descKey: 'arch_reaction_face_desc',
    icon: '🤯',
    ctrBoost: 24,
    category: 'universal',
    prompt: 'REACTION FACE COMPOSITION: The person\'s face must be EXTREMELY LARGE - taking up 50-60% of the frame height. Face front-and-center. EXAGGERATED expression: eyes wide open, mouth open in shock/excitement/disbelief. The background should support the reaction - showing whatever they are reacting TO. Use bright, contrasting colors. The expression is the STAR of this thumbnail. The viewer should instantly feel the emotion. Add a subtle colored glow/rim light on the face edges.',
    bestFor: ['Vlog', 'Reaction', 'Unboxing', 'Challenge', 'News']
  },
  {
    id: 'expert_authority',
    nameKey: 'arch_expert_authority',
    descKey: 'arch_expert_authority_desc',
    icon: '🎓',
    ctrBoost: 20,
    category: 'universal',
    prompt: 'EXPERT AUTHORITY COMPOSITION: The person positioned on one side (left or right third), taking up 40-45% of frame height. Confident, knowing expression - slight smile or serious expert look. Clean, professional background with subtle relevant visual elements (icons, diagrams, product shots) on the opposite side. Key information or the subject matter should be visually represented beside the person. Soft, professional lighting. The person should look TRUSTWORTHY and KNOWLEDGEABLE. Clean color palette - blues, whites, and one accent color.',
    bestFor: ['Tutorial', 'Education', 'Tech review', 'How-to', 'Tips']
  },
  {
    id: 'food_desire',
    nameKey: 'arch_food_desire',
    descKey: 'arch_food_desire_desc',
    icon: '🍕',
    ctrBoost: 21,
    category: 'universal',
    prompt: 'FOOD DESIRE COMPOSITION: Split focus between APPETIZING food close-up and the person. The food should look IRRESISTIBLE - glistening, steaming, perfectly lit with warm golden tones. The person (30-40% of frame) should show DESIRE or DELIGHT expression - eyes wide, mouth watering, reaching toward food. Use warm color temperature (golden, amber, rich browns). Shallow depth of field on food details. Steam, melting cheese, dripping sauce - make it MOUTHWATERING. The viewer must feel HUNGRY looking at this.',
    bestFor: ['Food', 'Recipe', 'Restaurant', 'Mukbang', 'Cooking']
  },
  {
    id: 'travel_wonder',
    nameKey: 'arch_travel_wonder',
    descKey: 'arch_travel_wonder_desc',
    icon: '🌍',
    ctrBoost: 22,
    category: 'universal',
    prompt: 'TRAVEL WONDER COMPOSITION: BREATHTAKING landscape or location filling most of the frame. The person positioned in the lower third (25-35% of frame), looking UP or OUT at the magnificent view with an expression of AWE and WONDER. Arms may be spread or pointing. The location should look SPECTACULAR - vivid colors, dramatic lighting (golden hour, blue hour, dramatic clouds). Use leading lines in the landscape pointing to the person. The scale contrast between the tiny person and VAST environment creates visual impact. The viewer should think "I WANT TO GO THERE!"',
    bestFor: ['Travel', 'Nature', 'Adventure', 'Exploration', 'City tour']
  },
  {
    id: 'transformation',
    nameKey: 'arch_transformation',
    descKey: 'arch_transformation_desc',
    icon: '✨',
    ctrBoost: 23,
    category: 'universal',
    prompt: 'TRANSFORMATION COMPOSITION: Clear LEFT/RIGHT or BEFORE/AFTER split. Use a diagonal or lightning-bolt divider line. LEFT side (before): Dull, muted colors, tired/sad expression, lower quality appearance. RIGHT side (after): Vibrant, glowing, confident expression, dramatically improved appearance. The person appears on BOTH sides showing the contrast. Add directional arrows or flow from left to right. The transformation should be DRAMATIC and immediately obvious. Color grading: desaturated left, vivid right. The viewer should think "HOW did they do that?!"',
    bestFor: ['Fitness', 'Makeover', 'DIY', 'Before/After', 'Progress']
  },
  {
    id: 'breaking_news',
    nameKey: 'arch_breaking_news',
    descKey: 'arch_breaking_news_desc',
    icon: '🚨',
    ctrBoost: 24,
    category: 'universal',
    prompt: 'BREAKING NEWS COMPOSITION: URGENT, NEWS-STYLE layout. Person\'s face large (40-50% of frame) with a serious/shocked/concerned expression. RED accent elements: red glow, red highlights, red banner areas. The background should show the SUBJECT of the news/drama - slightly blurred but recognizable. High contrast, slightly desaturated except for RED accents. Create a sense of URGENCY and IMPORTANCE. The viewer must feel "I need to know what happened!" Use dramatic shadows on the face with one strong light source.',
    bestFor: ['News', 'Drama', 'Controversy', 'Updates', 'Announcements']
  },
  {
    id: 'music_energy',
    nameKey: 'arch_music_energy',
    descKey: 'arch_music_energy_desc',
    icon: '🎵',
    ctrBoost: 21,
    category: 'universal',
    prompt: 'MUSIC ENERGY COMPOSITION: The person (40-50% of frame) in a PERFORMANCE pose - singing, playing instrument, dancing, or feeling the music with closed eyes. NEON and VIBRANT color palette - electric blue, hot pink, purple, cyan. Add visual SOUND ELEMENTS: equalizer bars, sound waves, music notes, light beams that pulse outward. Background should feel like a CONCERT or STUDIO with colored lights. Add lens flares and light leaks. The energy should be PALPABLE - the viewer should almost HEAR the music. Dynamic, motion-blur effects on edges.',
    bestFor: ['Music', 'Dance', 'Concert', 'Cover', 'Performance']
  },
  {
    id: 'challenge_fun',
    nameKey: 'arch_challenge_fun',
    descKey: 'arch_challenge_fun_desc',
    icon: '🎉',
    ctrBoost: 22,
    category: 'universal',
    prompt: 'CHALLENGE FUN COMPOSITION: The person (40-50% of frame) with an EXAGGERATED fun expression - laughing, screaming with joy, silly face. BRIGHT, COLORFUL, PLAYFUL background with relevant props or challenge elements. Use BOLD primary colors (red, yellow, blue, green). Add dynamic elements: confetti, splashes, flying objects, action lines. The composition should feel CHAOTIC but FUN. Multiple focal points creating visual excitement. The viewer should think "This looks HILARIOUS, I have to watch!" High energy, high saturation, comic-book style impact.',
    bestFor: ['Challenge', 'Comedy', 'Entertainment', 'Prank', 'Fun']
  },
  {
    id: 'mystery_reveal',
    nameKey: 'arch_mystery_reveal',
    descKey: 'arch_mystery_reveal_desc',
    icon: '🔍',
    ctrBoost: 23,
    category: 'universal',
    prompt: 'MYSTERY REVEAL COMPOSITION: Create a CURIOSITY GAP. The person (35-45% of frame) with an intrigued/shocked expression, looking at or pointing to something partially hidden/blurred/censored. Use a spotlight or reveal effect - darkness surrounding a bright focal point. One element should be intentionally OBSCURED (blurred, pixelated, behind a shadow, partially cropped) to create mystery. Use cool, mysterious color palette (deep blues, purples, dark teals) with one bright accent. Add question mark elements or red circles/arrows pointing to the mystery. The viewer MUST feel "What IS that?!"',
    bestFor: ['Mystery', 'Theory', 'Secret', 'Investigation', 'Reveal']
  },
];

// CTR Score Calculator
const calculateCTRScore = (settings, t) => {
  let score = 50; // Base score
  const issues = [];
  const boosts = [];

  // Archetype bonus
  if (settings.archetype) {
    const arch = CTR_ARCHETYPES.find(a => a.id === settings.archetype);
    if (arch) {
      score += arch.ctrBoost;
      boosts.push({ text: `${t(arch.nameKey)} ${t('archetypeBoost')}`, value: `+${arch.ctrBoost}` });
    }
  }

  // Topic description bonus
  if (settings.topicDescription && settings.topicDescription.length > 50) {
    score += 10;
    boosts.push({ text: t('detailedDescription'), value: '+10' });
  } else if (!settings.topicDescription) {
    score -= 5;
    issues.push({ text: t('missingDescription'), fix: t('addDescription'), impact: 5 });
  }

  // Overlay text check
  if (settings.overlayText) {
    const words = settings.overlayText.trim().split(/\s+/).length;
    if (words <= 3) {
      score += 8;
      boosts.push({ text: t('shortText'), value: '+8' });
    } else if (words > 5) {
      score -= 10;
      issues.push({ text: t('textTooLong'), fix: t('shortenText'), impact: 10 });
    }
  } else {
    score -= 5;
    issues.push({ text: t('noThumbnailText'), fix: t('addAttentionText'), impact: 5 });
  }

  // Typography style bonus (2026 - color harmony focused)
  const highCtrTypoStyles = ['auto_harmony', 'bold_impact', 'gaming_neon', 'simple_brush'];
  const goodTypoStyles = ['cinematic_epic', 'comic_action', 'elegant_modern'];

  if (highCtrTypoStyles.includes(settings.typoStyle)) {
    score += 10;
    boosts.push({ text: t('colorMatchedStyle'), value: '+10' });
  } else if (goodTypoStyles.includes(settings.typoStyle)) {
    score += 6;
    boosts.push({ text: t('qualityTypo'), value: '+6' });
  }

  // Photo/visual bonus
  if (settings.hasPhoto) {
    score += 8;
    boosts.push({ text: t('containsFace'), value: '+8' });
  }

  // Optimization bonus - when "Make it more clickable" was used
  if (settings.isOptimized) {
    score += 15;
    boosts.push({ text: t('aiOptimizationApplied'), value: '+15' });
  }

  // Clamp score
  score = Math.max(0, Math.min(100, score));

  // Determine CTR likelihood
  let likelihood = t('ctrLow');
  let likelihoodColor = 'text-red-400';
  if (score >= 80) {
    likelihood = t('ctrVeryHigh');
    likelihoodColor = 'text-green-400';
  } else if (score >= 65) {
    likelihood = t('ctrHigh');
    likelihoodColor = 'text-emerald-400';
  } else if (score >= 50) {
    likelihood = t('ctrMedium');
    likelihoodColor = 'text-yellow-400';
  }

  return { score, likelihood, likelihoodColor, issues, boosts };
};

// CTR Score Display Component
const CTRScoreCard = ({ score, likelihood, likelihoodColor, issues, boosts, onMakeClickable, isLoading, t }) => (
  <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-2xl p-4 border border-white/10">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Target className="w-5 h-5 text-blue-400" />
        <span className="text-sm font-bold text-white">{t('ctrEstimate')}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-2xl font-black ${likelihoodColor}`}>{score}</span>
        <span className="text-xs text-slate-400">/100</span>
      </div>
    </div>

    {/* Score Bar */}
    <div className="h-2 bg-black/40 rounded-full mb-3 overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className={`h-full rounded-full ${
          score >= 80 ? 'bg-green-500' : score >= 65 ? 'bg-emerald-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
        }`}
      />
    </div>

    <p className={`text-sm font-bold mb-4 ${likelihoodColor}`}>
      {t('ctrLikelihood')}: {likelihood}
    </p>

    {/* Boosts */}
    {boosts.length > 0 && (
      <div className="mb-3">
        <p className="text-[10px] text-slate-500 uppercase mb-1">{t('boosts')}</p>
        <div className="space-y-1">
          {boosts.slice(0, 3).map((b, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <span className="text-slate-300">{b.text}</span>
              <span className="text-green-400 font-bold">{b.value}</span>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Issues */}
    {issues.length > 0 && (
      <div className="mb-4">
        <p className="text-[10px] text-slate-500 uppercase mb-1">{t('issuesToFix')}</p>
        <div className="space-y-1">
          {issues.slice(0, 3).map((issue, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <span className="text-slate-400">{issue.text}</span>
              <span className="text-red-400 font-bold">-{issue.impact}</span>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Make it more clickable button */}
    <button
      onClick={onMakeClickable}
      disabled={isLoading}
      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
    >
      {isLoading ? (
        <RefreshCcw className="w-4 h-4 animate-spin" />
      ) : (
        <MousePointer className="w-4 h-4" />
      )}
      {t('makeMoreClickable')}
    </button>
  </div>
);

// Aurora Background Component
const AuroraBackground = ({ children }) => (
  <div className="relative min-h-screen overflow-hidden bg-[#030014]">
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute -inset-[10px] opacity-50"
        style={{
          background: `
            radial-gradient(ellipse 80% 80% at 50% -20%, rgba(120, 119, 198, 0.3), transparent),
            radial-gradient(ellipse 60% 60% at 0% 100%, rgba(59, 130, 246, 0.2), transparent),
            radial-gradient(ellipse 60% 60% at 100% 100%, rgba(139, 92, 246, 0.2), transparent)
          `,
          animation: 'aurora 15s ease-in-out infinite alternate'
        }}
      />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
    <div className="relative z-10">{children}</div>
  </div>
);

// Real popular YouTube videos data with verified working thumbnails
const fakeVideos = [
  { channel: 'MrBeast', avatar: '🟣', title: '$456,000 Squid Game In Real Life!', views: '620M views', time: '2 years ago', duration: '25:41', color: 'from-purple-500 to-blue-500', thumbnail: 'https://img.youtube.com/vi/0e3GPea1Tyg/maxresdefault.jpg' },
  { channel: 'MrBeast', avatar: '🟣', title: 'Would You Rather Have $100,000 OR...', views: '208M views', time: '1 year ago', duration: '21:22', color: 'from-purple-500 to-pink-500', thumbnail: 'https://img.youtube.com/vi/erLbbextvlY/maxresdefault.jpg' },
  { channel: 'MrBeast', avatar: '🟣', title: 'Lamborghini vs Shredder', views: '145M views', time: '2 years ago', duration: '12:18', color: 'from-purple-600 to-blue-500', thumbnail: 'https://img.youtube.com/vi/9bqk6ZUsKyA/maxresdefault.jpg' },
  { channel: 'PewDiePie', avatar: '🔴', title: 'Bitch Lasagna', views: '305M views', time: '6 years ago', duration: '2:16', color: 'from-red-500 to-orange-500', thumbnail: 'https://img.youtube.com/vi/6Dh-RL__uN4/maxresdefault.jpg' },
  { channel: 'MrBeast', avatar: '🟣', title: 'I Put 100 Million Orbeez In A Pool', views: '130M views', time: '4 years ago', duration: '8:32', color: 'from-purple-400 to-blue-500', thumbnail: 'https://img.youtube.com/vi/3TflpIllQHY/maxresdefault.jpg' },
  { channel: 'MrBeast', avatar: '🟣', title: 'I Survived 24 Hours In Ice', views: '95M views', time: '3 years ago', duration: '15:42', color: 'from-blue-400 to-cyan-500', thumbnail: 'https://img.youtube.com/vi/6lBT7no3gT8/maxresdefault.jpg' },
  { channel: 'MrBeast', avatar: '🟣', title: 'Last To Leave $800,000 Island', views: '162M views', time: '3 years ago', duration: '22:15', color: 'from-purple-500 to-blue-600', thumbnail: 'https://img.youtube.com/vi/uchw23X0o50/maxresdefault.jpg' },
  { channel: 'MrBeast', avatar: '🟣', title: 'I Gave People $1,000,000 But...', views: '128M views', time: '2 years ago', duration: '18:33', color: 'from-green-500 to-emerald-600', thumbnail: 'https://img.youtube.com/vi/DuQbOQwVaNE/maxresdefault.jpg' },
  { channel: 'MrBeast', avatar: '🟣', title: 'Survive 100 Days, Win $500,000', views: '189M views', time: '2 years ago', duration: '24:18', color: 'from-orange-500 to-red-500', thumbnail: 'https://img.youtube.com/vi/gHzuabZUd6c/maxresdefault.jpg' },
  { channel: 'MrBeast', avatar: '🟣', title: 'I Opened A Free Car Dealership', views: '142M views', time: '2 years ago', duration: '16:08', color: 'from-blue-500 to-indigo-600', thumbnail: 'https://img.youtube.com/vi/F3JFmp1W7kw/maxresdefault.jpg' },
  { channel: 'MrBeast', avatar: '🟣', title: '$1 vs $500,000 Plane Ticket!', views: '185M views', time: '1 year ago', duration: '20:45', color: 'from-purple-600 to-pink-500', thumbnail: 'https://img.youtube.com/vi/j5nZhf8SjXw/maxresdefault.jpg' },
];

// Fake Thumbnail Component
const FakeThumbnail = ({ text, bg, color }) => (
  <div
    className="w-full h-full flex items-center justify-center relative overflow-hidden"
    style={{ background: bg }}
  >
    {/* Decorative elements */}
    <div className="absolute inset-0 opacity-30">
      <div className="absolute top-2 left-2 w-16 h-16 rounded-full bg-white/20 blur-xl" />
      <div className="absolute bottom-4 right-4 w-24 h-24 rounded-full bg-black/20 blur-2xl" />
    </div>
    {/* Fake face circle */}
    <div className={`absolute left-4 top-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-gradient-to-br ${color} border-4 border-white/30 shadow-2xl flex items-center justify-center`}>
      <div className="w-8 h-8 rounded-full bg-white/40" />
    </div>
    {/* Text overlay */}
    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-right">
      <p className="text-white font-black text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-tight" style={{ WebkitTextStroke: '1px black' }}>
        {text}
      </p>
    </div>
    {/* Bottom gradient */}
    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/50 to-transparent" />
  </div>
);

// YouTube Video Card Component
const YouTubeVideoCard = ({ thumbnail, title, channel, views, time, duration, avatar, color, isHighlighted, thumbText, thumbBg }) => {
  const { t } = useI18n();
  return (
  <div className={`group cursor-pointer ${isHighlighted ? 'ring-2 ring-red-500 ring-offset-2 ring-offset-[#0f0f0f] rounded-xl' : ''}`}>
    {/* Thumbnail */}
    <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-black">
      {thumbnail ? (
        <img src={thumbnail} alt={title} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200" />
      ) : thumbText && thumbBg ? (
        <FakeThumbnail text={thumbText} bg={thumbBg} color={color} />
      ) : (
        <div className={`w-full h-full bg-gradient-to-br ${color} flex items-center justify-center`}>
          <Play className="w-12 h-12 text-white/80" />
        </div>
      )}
      <div className="absolute bottom-1 right-1 bg-black/90 text-white text-[10px] px-1 py-0.5 rounded font-medium">
        {duration}
      </div>
      {isHighlighted && (
        <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] px-2 py-1 rounded font-bold animate-pulse shadow-lg">
          {t('yourVideo')}
        </div>
      )}
    </div>

    {/* Info */}
    <div className="flex gap-3">
      <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-sm flex-shrink-0`}>
        {avatar}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-white text-sm font-medium line-clamp-2 leading-tight mb-1 group-hover:text-blue-400 transition-colors">
          {title}
        </h3>
        <p className="text-[#aaa] text-xs hover:text-white transition-colors">{channel}</p>
        <p className="text-[#aaa] text-xs">
          {views} • {time}
        </p>
      </div>
      <button className="text-white/0 group-hover:text-white/60 transition-all self-start mt-1">
        <MoreVertical className="w-5 h-5" />
      </button>
    </div>
  </div>
  );
};

// Full YouTube Mockup Modal with Multiple Views
const YouTubeMockup = ({ thumbnail, title, channelName, onClose, position = 'top' }) => {
  const { t } = useI18n();
  const [viewMode, setViewMode] = useState('desktop'); // 'desktop', 'mobile', 'search'

  // ESC key to close
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const userVideo = {
    thumbnail,
    title: title || t('myNewVideo'),
    channel: channelName || t('myChannel'),
    views: '1.2M views',
    time: '2 hours ago',
    duration: '12:34',
    avatar: '⭐',
    color: 'from-blue-500 to-purple-600',
    isHighlighted: true
  };

  // Position user video based on selection
  const allVideos = [...fakeVideos];
  let insertIndex;
  if (position === 'top') {
    insertIndex = 0;
  } else if (position === 'middle') {
    insertIndex = Math.min(4, fakeVideos.length);
  } else {
    insertIndex = Math.min(8, fakeVideos.length);
  }
  allVideos.splice(insertIndex, 0, userVideo);

  // Mobile Video Card Component
  const MobileVideoCard = ({ video }) => (
    <div className={`flex gap-3 p-2 ${video.isHighlighted ? 'bg-red-500/10 border border-red-500/30 rounded-xl' : ''}`}>
      <div className="relative w-44 flex-shrink-0 rounded-lg overflow-hidden bg-black aspect-video">
        {video.thumbnail ? (
          <img src={video.thumbnail} alt={video.title} className="w-full h-full object-contain" />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${video.color} flex items-center justify-center`}>
            <Play className="w-8 h-8 text-white/80" />
          </div>
        )}
        <div className="absolute bottom-1 right-1 bg-black/90 text-white text-[10px] px-1 py-0.5 rounded">
          {video.duration}
        </div>
        {video.isHighlighted && (
          <div className="absolute top-1 left-1 bg-red-600 text-white text-[8px] px-1.5 py-0.5 rounded font-bold shadow-lg">
            {t('yourVideo')}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-white text-sm font-medium line-clamp-2 mb-1">{video.title}</h3>
        <p className="text-[#aaa] text-xs">{video.channel}</p>
        <p className="text-[#aaa] text-xs">{video.views} • {video.time}</p>
      </div>
    </div>
  );

  // Search Result Card Component
  const SearchResultCard = ({ video }) => (
    <div className={`flex gap-4 ${video.isHighlighted ? 'bg-red-500/10 border border-red-500/30 rounded-xl p-2' : 'p-2'}`}>
      <div className="relative w-80 flex-shrink-0 rounded-xl overflow-hidden bg-black aspect-video">
        {video.thumbnail ? (
          <img src={video.thumbnail} alt={video.title} className="w-full h-full object-contain" />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${video.color} flex items-center justify-center`}>
            <Play className="w-12 h-12 text-white/80" />
          </div>
        )}
        <div className="absolute bottom-2 right-2 bg-black/90 text-white text-xs px-1.5 py-0.5 rounded">
          {video.duration}
        </div>
        {video.isHighlighted && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] px-2 py-1 rounded font-bold animate-pulse shadow-lg">
            {t('yourVideo')}
          </div>
        )}
      </div>
      <div className="flex-1">
        <h3 className="text-white text-lg font-medium line-clamp-2 mb-2">{video.title}</h3>
        <p className="text-[#aaa] text-xs mb-2">{video.views} • {video.time}</p>
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${video.color} flex items-center justify-center text-xs`}>
            {video.avatar}
          </div>
          <p className="text-[#aaa] text-xs">{video.channel}</p>
        </div>
        <p className="text-[#aaa] text-xs line-clamp-2">
          Bu video {video.channel} tarafından yüklendi. İzlemek için tıklayın.
        </p>
      </div>
    </div>
  );

  const sidebarItems = [
    { icon: <Home className="w-5 h-5" />, label: t('home'), active: true },
    { icon: <Compass className="w-5 h-5" />, label: t('explore') },
    { icon: <PlaySquare className="w-5 h-5" />, label: t('shorts') },
    { icon: <Film className="w-5 h-5" />, label: t('subscriptions') },
    { divider: true },
    { icon: <Clock className="w-5 h-5" />, label: t('history') },
    { icon: <ThumbsUp className="w-5 h-5" />, label: t('liked') },
    { divider: true },
    { label: t('explore'), header: true },
    { icon: <Gamepad2 className="w-5 h-5" />, label: t('gaming') },
    { icon: <Music className="w-5 h-5" />, label: t('music') },
    { icon: <Trophy className="w-5 h-5" />, label: t('sports') },
  ];

  const categories = [t('all'), t('gaming'), t('live'), t('music'), t('strategyGames'), t('actionAdventure'), t('new'), t('recentUploads')];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Floating Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-[60] bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-3 rounded-full transition-all group"
      >
        <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
      </button>

      {/* View Mode Switcher */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-1 bg-white/10 backdrop-blur-md rounded-full p-1">
        <button
          onClick={(e) => { e.stopPropagation(); setViewMode('desktop'); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            viewMode === 'desktop' ? 'bg-white text-black' : 'text-white hover:bg-white/10'
          }`}
        >
          <Monitor className="w-4 h-4" />
          {t('desktop')}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setViewMode('mobile'); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            viewMode === 'mobile' ? 'bg-white text-black' : 'text-white hover:bg-white/10'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          {t('mobile')}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setViewMode('search'); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            viewMode === 'search' ? 'bg-white text-black' : 'text-white hover:bg-white/10'
          }`}
        >
          <Search className="w-4 h-4" />
          {t('search')}
        </button>
      </div>

      {/* Modal Content - Desktop View */}
      {viewMode === 'desktop' && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative z-50 w-full max-w-7xl h-[85vh] mt-12 bg-[#0f0f0f] rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* YouTube Header */}
          <header className="h-14 bg-[#0f0f0f] border-b border-white/10 flex items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-white/10 rounded-full">
                <Menu className="w-6 h-6 text-white" />
              </button>
              <div className="flex items-center gap-1">
                <div className="bg-red-600 rounded-lg p-1">
                  <Play className="w-5 h-5 text-white fill-white" />
                </div>
                <span className="text-white text-xl font-semibold tracking-tight">YouTube</span>
              </div>
            </div>
            <div className="flex-1 max-w-xl mx-4 hidden md:block">
              <div className="flex">
                <div className="flex-1 flex items-center bg-[#121212] border border-[#303030] rounded-l-full px-4 py-2">
                  <input type="text" placeholder={t('searchPlaceholder')} className="bg-transparent text-white w-full outline-none text-sm" />
                </div>
                <button className="bg-[#222] border border-l-0 border-[#303030] rounded-r-full px-5">
                  <Search className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Bell className="w-6 h-6 text-white" />
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
            </div>
          </header>

          <div className="flex h-[calc(85vh-56px)]">
            {/* Sidebar */}
            <aside className="w-56 bg-[#0f0f0f] overflow-y-auto flex-shrink-0 hidden lg:block border-r border-white/5">
              <nav className="py-3">
                {sidebarItems.map((item, index) => (
                  item.divider ? <hr key={index} className="my-3 border-white/10" /> :
                  item.header ? <p key={index} className="px-6 py-2 text-white/60 text-sm font-medium">{item.label}</p> :
                  <button key={index} className={`w-full flex items-center gap-6 px-6 py-2.5 hover:bg-white/10 ${item.active ? 'bg-white/10' : ''}`}>
                    <span className={item.active ? 'text-white' : 'text-white/80'}>{item.icon}</span>
                    <span className={`text-sm ${item.active ? 'text-white font-medium' : 'text-white/80'}`}>{item.label}</span>
                  </button>
                ))}
              </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-[#0f0f0f]">
              <div className="sticky top-0 bg-[#0f0f0f] z-10 px-4 py-3 flex gap-2 overflow-x-auto border-b border-white/5">
                {categories.map((cat, index) => (
                  <button key={cat} className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${index === 0 ? 'bg-white text-black' : 'bg-[#272727] text-white'}`}>
                    {cat}
                  </button>
                ))}
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-6">
                  {allVideos.map((video, index) => (
                    <YouTubeVideoCard key={index} {...video} />
                  ))}
                </div>
              </div>
            </main>
          </div>
        </motion.div>
      )}

      {/* Mobile View */}
      {viewMode === 'mobile' && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative z-50 w-[375px] h-[85vh] mt-12 bg-[#0f0f0f] rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-gray-800"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Phone notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-10" />

          {/* Mobile Header */}
          <header className="h-12 bg-[#0f0f0f] border-b border-white/10 flex items-center justify-between px-3 pt-2">
            <div className="flex items-center gap-1">
              <div className="bg-red-600 rounded p-0.5">
                <Play className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="text-white text-sm font-semibold">YouTube</span>
            </div>
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-white" />
              <Bell className="w-5 h-5 text-white" />
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
            </div>
          </header>

          {/* Mobile Content */}
          <div className="h-[calc(85vh-48px-60px)] overflow-y-auto">
            <div className="p-2 space-y-4">
              {allVideos.slice(0, 6).map((video, index) => (
                <MobileVideoCard key={index} video={video} />
              ))}
            </div>
          </div>

          {/* Mobile Bottom Nav */}
          <div className="absolute bottom-0 left-0 right-0 h-14 bg-[#0f0f0f] border-t border-white/10 flex items-center justify-around px-4">
            <button className="flex flex-col items-center text-white">
              <Home className="w-5 h-5" />
              <span className="text-[10px]">Ana Sayfa</span>
            </button>
            <button className="flex flex-col items-center text-white/50">
              <PlaySquare className="w-5 h-5" />
              <span className="text-[10px]">Shorts</span>
            </button>
            <button className="flex flex-col items-center text-white/50">
              <Film className="w-5 h-5" />
              <span className="text-[10px]">Abonelikler</span>
            </button>
            <button className="flex flex-col items-center text-white/50">
              <User className="w-5 h-5" />
              <span className="text-[10px]">{t('you')}</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Search Results View */}
      {viewMode === 'search' && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative z-50 w-full max-w-5xl h-[85vh] mt-12 bg-[#0f0f0f] rounded-2xl overflow-hidden shadow-2xl border border-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Header */}
          <header className="h-14 bg-[#0f0f0f] border-b border-white/10 flex items-center px-4 gap-4">
            <div className="flex items-center gap-1">
              <div className="bg-red-600 rounded-lg p-1">
                <Play className="w-5 h-5 text-white fill-white" />
              </div>
              <span className="text-white text-xl font-semibold">YouTube</span>
            </div>
            <div className="flex-1 max-w-2xl">
              <div className="flex items-center bg-[#121212] border border-[#303030] rounded-full px-4 py-2">
                <input type="text" defaultValue={title || 'Gaming'} className="bg-transparent text-white w-full outline-none text-sm" />
                <Search className="w-5 h-5 text-white" />
              </div>
            </div>
          </header>

          <div className="p-4 text-white/60 text-sm border-b border-white/5">
            ~{Math.floor(Math.random() * 900000 + 100000).toLocaleString()} {t('resultsFound')}
          </div>

          {/* Search Results */}
          <div className="h-[calc(85vh-100px)] overflow-y-auto p-4 space-y-4">
            {allVideos.slice(0, 5).map((video, index) => (
              <SearchResultCard key={index} video={video} />
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

// Collapsible Section Component
const CollapsibleSection = ({ title, icon, children, defaultOpen = false, badge = null }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border border-white/5 rounded-2xl overflow-hidden bg-black/20">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="text-blue-400">{icon}</div>
          <span className="text-sm font-bold text-white">{title}</span>
          {badge && (
            <span className="bg-blue-500/20 text-blue-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
              {badge}
            </span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 space-y-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const App = () => {
  const { t, lang, toggleLang } = useI18n();
  const [currentSection, setCurrentSection] = useState('landing');
  const [image, setImage] = useState(null);
  const [base64Image, setBase64Image] = useState(null);
  const [topic, setTopic] = useState('');
  const [topicDescription, setTopicDescription] = useState('');
  const [overlayText, setOverlayText] = useState('');
  const [extraRequest, setExtraRequest] = useState('');
  const [channelName, setChannelName] = useState('');
  const [typoStyle, setTypoStyle] = useState('auto_harmony');
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [showYouTubeMockup, setShowYouTubeMockup] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [thumbnailPosition, setThumbnailPosition] = useState('top');
  const [selectedArchetype, setSelectedArchetype] = useState('');
  const [archetypeTab, setArchetypeTab] = useState('all');
  const [ctrScore, setCtrScore] = useState(null);
  const [previousCtrScore, setPreviousCtrScore] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isOptimized, setIsOptimized] = useState(false);
  const [previousImage, setPreviousImage] = useState(null);

  // Polar.sh - Plan & License states
  const [currentPlan, setCurrentPlan] = useState(() => getCurrentPlan());
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const isPro = currentPlan.id === 'pro';

  // Uygulama açılışında lisans durumunu kontrol et
  useEffect(() => {
    const checkLicense = async () => {
      const key = getLicenseKey();
      if (key) {
        const result = await validateLicenseKey(key);
        if (result.valid) {
          setCurrentPlan(PLANS.pro);
        } else {
          setCurrentPlan(PLANS.free);
        }
      }
    };
    checkLicense();
  }, []);

  const handleLicenseActivated = (planId) => {
    setCurrentPlan(planId === 'pro' ? PLANS.pro : PLANS.free);
  };

  // Mobile UI states
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // AI Model selection - Gemini 3 is the latest (2026)
  const [selectedModel, setSelectedModel] = useState('gemini-3-pro-image-preview');
  const availableModels = [
    { id: 'gemini-3-pro-image-preview', name: t('modelGemini3Name'), desc: t('modelGemini3Desc'), badge: t('modelGemini3Badge') },
    { id: 'gemini-2.5-flash-image', name: 'Gemini 2.5 Flash Image', desc: 'Hızlı ve ekonomik görsel üretim' },
  ];

  // Concept/Reference image states
  const [conceptImage, setConceptImage] = useState(null);
  const [conceptBase64, setConceptBase64] = useState(null);
  const [conceptAnalysis, setConceptAnalysis] = useState(null);
  const [isAnalyzingConcept, setIsAnalyzingConcept] = useState(false);
  const conceptInputRef = useRef(null);

  // Photo analysis states
  const [photoAnalysis, setPhotoAnalysis] = useState(null);
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  // Topic/Concept research states
  const [topicResearch, setTopicResearch] = useState(null);
  const [isResearchingTopic, setIsResearchingTopic] = useState(false);
  const [researchImageBase64, setResearchImageBase64] = useState(null);
  const [researchImageUrl, setResearchImageUrl] = useState(null);

  // Smart Content Detection - otomatik kategori algılama
  const [detectedCategory, setDetectedCategory] = useState(null);

  // Revision
  const [revisionText, setRevisionText] = useState('');
  const [isRevising, setIsRevising] = useState(false);
  const [preRevisionImage, setPreRevisionImage] = useState(null);

  // Calculate CTR score whenever settings change
  useEffect(() => {
    const settings = {
      archetype: selectedArchetype,
      topicDescription,
      overlayText,
      typoStyle,
      hasPhoto: !!base64Image,
      isOptimized
    };
    const score = calculateCTRScore(settings, t);
    setCtrScore(score);
  }, [selectedArchetype, topicDescription, overlayText, typoStyle, base64Image, isOptimized]);

  // Auto-generate removed - kullanıcı "Oluştur" butonuna basarak tetikler

  const handleSaveApiKey = (value) => {
    setApiKey(value);
    if (value) {
      localStorage.setItem('gemini_api_key', value);
    } else {
      localStorage.removeItem('gemini_api_key');
    }
  };

  // 2026 Modern Typography Options - Based on latest YouTube trends
  // 2026 Typography with SCENE-AWARE COLOR HARMONY
  const typographyOptions = [
    {
      id: 'auto_harmony',
      name: t('typo_auto_harmony'),
      desc: t('typo_auto_harmony_desc'),
      prompt: `AUTOMATIC COLOR HARMONY TYPOGRAPHY (BEST FOR CTR):

⚠️ CRITICAL - ANALYZE THE SCENE FIRST:
Before choosing text color, analyze the background/scene dominant colors:
- If scene is DARK (black, dark blue, purple) → Use BRIGHT text (white, yellow, cyan)
- If scene is WARM (red, orange, fire) → Use COOL accent (white with cyan glow, or gold)
- If scene is COOL (blue, ice, water) → Use WARM accent (orange, gold, or white with warm glow)
- If scene is GREEN (nature, poison, matrix) → Use COMPLEMENTARY (magenta, pink, or white with green glow)
- If scene is PURPLE/MAGIC → Use GOLD or CYAN as accent

COLOR HARMONY RULES:
1. Text color must have 70%+ contrast ratio with background
2. Use COMPLEMENTARY colors (opposite on color wheel) for maximum pop
3. Add a GLOW that matches scene's secondary color
4. Stroke color should be darker version of scene's dominant color

FONT: Modern bold display font (Gotham Black, Gilroy ExtraBold, or Montserrat Black)
SIZE: LARGE - 15-20% of thumbnail width
STYLE: Clean, modern, slightly condensed
STROKE: 6-8px outline in scene's dark color
GLOW: Soft outer glow in scene's accent color
POSITION: Bottom area, never covering the face`
    },
    {
      id: 'cinematic_epic',
      name: t('typo_cinematic_epic'),
      desc: t('typo_cinematic_epic_desc'),
      prompt: `CINEMATIC EPIC TYPOGRAPHY (MOVIE POSTER QUALITY):

⚠️ COLOR MATCHING - CRITICAL:
- Analyze the scene's LIGHTING DIRECTION and COLOR TEMPERATURE
- Text should be lit from the SAME direction as the scene
- If scene has golden hour light → Gold/bronze metallic text
- If scene has cold/blue light → Silver/platinum metallic text
- If scene has fire/red light → Copper/rose gold metallic text
- If scene is dark/mysterious → Deep chrome with colored rim light

FONT: Cinematic display font (Trajan Pro, Cinzel, Times New Roman Bold, or Playfair Display Black)
3D EFFECT:
- Beveled edges catching scene's light color
- Deep extrusion shadow in scene's dark color
- Reflective highlights matching scene's brightest point
TEXTURE: Subtle metal or stone texture
STYLE: Uppercase, elegant, powerful
SHADOW: Dramatic shadow matching scene lighting angle`
    },
    {
      id: 'gaming_neon',
      name: t('typo_gaming_neon'),
      desc: t('typo_gaming_neon_desc'),
      prompt: `GAMING NEON TYPOGRAPHY (SCENE-MATCHED):

⚠️ NEON COLOR SELECTION:
- Pick neon color that COMPLEMENTS the scene:
  * Dark/purple scene → Cyan (#00FFFF) or Pink (#FF00FF) neon
  * Blue/ice scene → Orange (#FF6600) or Yellow (#FFFF00) neon
  * Green/matrix scene → Magenta (#FF00FF) or White neon
  * Red/fire scene → Electric Blue (#0066FF) or Cyan neon
  * Orange/sunset scene → Purple (#9900FF) or Cyan neon

FONT: Modern tech font (Orbitron, Rajdhani Bold, Exo 2 Black, or Industry Bold)
GLOW EFFECT:
- Inner glow: White/light version of neon color
- Outer glow: Saturated neon, 20-30px spread
- Ambient: Soft colored light on nearby surfaces
STROKE: Thin dark stroke (2-3px) for definition
STYLE: ALL CAPS, tight letter spacing, futuristic
VIBE: High-tech, energetic, electric`
    },
    {
      id: 'bold_impact',
      name: t('typo_maximum_impact'),
      desc: t('typo_maximum_impact_desc'),
      prompt: `MAXIMUM IMPACT TYPOGRAPHY (HIGHEST READABILITY):

⚠️ CONTRAST-FIRST COLOR SELECTION:
- ALWAYS choose the color with MAXIMUM contrast to background
- Dark background → Pure WHITE text with colored glow
- Light background → Pure BLACK text with white outline
- Colorful background → WHITE text + THICK black stroke + scene-color glow

FONT: Ultra bold sans-serif (Bebas Neue, Anton, Oswald Bold, or Impact)
SIZE: MASSIVE - largest possible while readable
STROKE: THICK 8-12px black or dark outline
SHADOW: Hard drop shadow (4-6px offset)
GLOW: Outer glow in scene's DOMINANT color (subtle, 10-15px)
STYLE: ALL CAPS, condensed, powerful
NUMBERS: If present, make 50% larger than text
POSITION: Bottom center, commanding presence`
    },
    {
      id: 'elegant_modern',
      name: t('typo_elegant_modern'),
      desc: t('typo_elegant_modern_desc'),
      prompt: `ELEGANT MODERN TYPOGRAPHY (PREMIUM LOOK):

⚠️ SOPHISTICATED COLOR PALETTE:
- Use MUTED, sophisticated versions of scene colors
- Dark scene → Off-white (#F5F5F5) or cream (#FFF8DC)
- Warm scene → Soft gold (#D4AF37) or champagne (#F7E7CE)
- Cool scene → Platinum (#E5E4E2) or ice blue (#D4F1F9)
- Add subtle gradient that flows WITH the scene's color direction

FONT: Premium sans-serif (Proxima Nova Bold, Avenir Black, or Gotham Bold)
STYLE: Clean, balanced, generous letter-spacing
STROKE: Subtle 3-4px outline in scene's darkest color
SHADOW: Soft, diffused shadow (no hard edges)
EFFECT: Professional, trustworthy, high-end
POSITION: Strategic placement with breathing room`
    },
    {
      id: 'comic_action',
      name: t('typo_comic_action'),
      desc: t('typo_comic_action_desc'),
      prompt: `COMIC ACTION TYPOGRAPHY (DYNAMIC & FUN):

⚠️ COLOR MATCHING FOR COMICS:
- Main text: YELLOW (#FFFF00) or WHITE (always readable)
- Stroke: THICK BLACK (12-16px) - essential for comic look
- Action lines/effects: Use scene's DOMINANT color
- Shadow: Use scene's SECONDARY color (complementary)

FONT: Comic display font (Bangers, Comic Neue Bold, or Luckiest Guy)
STYLE:
- Slightly tilted (5-10 degrees) for energy
- Warped/curved following action
- Action speed lines in scene's color
EFFECTS:
- Halftone dots in scene's colors (subtle)
- Burst/explosion shapes behind text in scene colors
- Dynamic, energetic positioning
VIBE: Fun, exciting, eye-catching`
    },
    {
      id: 'simple_brush',
      name: t('typo_simple_brush'),
      desc: t('typo_simple_brush_desc'),
      prompt: `SIMPLE BRUSH TYPOGRAPHY (CLEAN & NATURAL):

⚠️ THIS IS A SUBTLE, CLEAN STYLE - NOT FLASHY:
The text should look hand-written/brush style but READABLE and SIMPLE.

COLOR SELECTION (SCENE-MATCHED):
- Analyze the scene's DARK tones
- Use a DARK color that exists in the scene:
  * Dark scene with fire/orange → Dark navy blue (#1a365d) or dark teal
  * Dark scene with purple/magic → Dark indigo (#312e81) or dark purple
  * Dark scene with green → Dark forest green (#14532d)
  * Cold/ice scene → Dark slate blue (#334155)
- The text should BLEND with the scene, not stand out harshly
- Add a SUBTLE lighter stroke (2-3px) in a slightly lighter shade for readability

FONT: Brush/handwritten style font (Permanent Marker, Kalam, Patrick Hand, or Caveat Bold)
SIZE: Large but not overwhelming - readable at small sizes
STYLE:
- Casual, hand-drawn feel
- Slightly imperfect/organic edges
- Natural baseline (not perfectly straight)
- ALL CAPS or Title Case

STROKE: Subtle outline (2-3px) in a LIGHTER shade of the text color
- Example: Dark blue text (#1a365d) with medium blue stroke (#3b82f6)
- This creates depth without being flashy

NO EFFECTS:
- NO glow
- NO 3D extrusion
- NO gradients
- NO drop shadow (or very subtle only)
- Keep it CLEAN and SIMPLE

POSITION: Bottom-left corner, leaving space for game logos on right
VIBE: Professional, clean, gaming channel style`
    }
  ];

  const fetchWithRetry = async (url, options, retries = 5, backoff = 1000) => {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        if (response.status === 429 && retries > 0) throw new Error('Rate limit');
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody?.error?.message || `Error ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      if (retries > 0) {
        await new Promise(r => setTimeout(r, backoff));
        return fetchWithRetry(url, options, retries - 1, backoff * 2);
      }
      throw err;
    }
  };

  // Fetch an image URL and convert to base64, with CORS proxy fallback
  const fetchImageAsBase64 = async (url) => {
    const targets = [
      url,
      `https://corsproxy.io/?${encodeURIComponent(url)}`,
    ];
    for (const target of targets) {
      try {
        const res = await fetch(target, { signal: AbortSignal.timeout(12000) });
        if (!res.ok) continue;
        const blob = await res.blob();
        if (!blob.type.startsWith('image/')) continue;
        if (blob.size > 10 * 1024 * 1024) continue; // skip >10MB
        return await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result.split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch { continue; }
    }
    return null;
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(URL.createObjectURL(file));
        setBase64Image(reader.result.split(',')[1]);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle concept/reference image upload
  const handleConceptUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setConceptImage(URL.createObjectURL(file));
        setConceptBase64(reader.result.split(',')[1]);
        setConceptAnalysis(null); // Reset previous analysis
      };
      reader.readAsDataURL(file);
    }
  };

  // Analyze concept/reference image with AI
  const analyzeConceptImage = async () => {
    if (!conceptBase64 || !apiKey) return;

    setIsAnalyzingConcept(true);
    try {
      const payload = {
        contents: [{
          parts: [
            {
              text: `This is a YouTube thumbnail reference/concept image. The user wants their generated thumbnail to MATCH THIS STYLE. Analyze in detail (in English):

1. **Visual Style**: Art style (cinematic, cartoon, realistic, photographic, illustrated, etc.)
2. **Color Palette**: Dominant colors, color temperature, saturation level, specific hex-like descriptions
3. **Composition**: Layout of elements, where the subject is, how space is used
4. **Text Style**: If present - font style, effects (glow, shadow, 3D, stroke), placement, colors
5. **Lighting**: Light direction, quality, color of light, shadows
6. **Atmosphere & Mood**: Overall feeling, energy level, emotional tone
7. **Special Effects**: Any glow, particles, blur, vignette, gradients, overlays
8. **What Makes It Click-worthy**: CTR elements, visual hooks, attention grabbers

Be SPECIFIC and DETAILED. Describe colors precisely (e.g., "neon cyan #00FFFF glow" not just "blue").
The AI image generator will use your analysis to replicate this exact style.`
            },
            { inlineData: { mimeType: "image/png", data: conceptBase64 } }
          ]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1500
        }
      };

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      );

      const data = await response.json();
      const analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (analysisText) {
        setConceptAnalysis(analysisText);
      } else {
        setConceptAnalysis('Analiz yapılamadı.');
      }
    } catch (err) {
      setConceptAnalysis('Analiz hatası: ' + err.message);
    } finally {
      setIsAnalyzingConcept(false);
    }
  };

  // Analyze uploaded photo with AI
  const analyzePhoto = async () => {
    if (!base64Image || !apiKey) return;

    setIsAnalyzingPhoto(true);
    try {
      const payload = {
        contents: [{
          parts: [
            {
              text: `Analyze this image for YouTube thumbnail creation. Respond in English.

First determine: Does this image contain a PERSON/FACE or is it a non-person image (game screenshot, product, landscape, food, object, etc.)?

IF IT CONTAINS A PERSON:
1. **Subject**: Gender, approximate age, general appearance
2. **Expression**: Current emotion/expression
3. **Clothing**: Outfit type and colors
4. **Pose**: Stance and angle
5. **Lighting**: Light direction and quality
6. **Recommendation**: Which thumbnail style/archetype would work best

IF IT'S A NON-PERSON IMAGE:
1. **Content**: What is shown (game screenshot, product, food, landscape, etc.)
2. **Colors**: Dominant color palette
3. **Composition**: Key visual elements and their arrangement
4. **Mood**: Overall atmosphere (dark, bright, warm, cold, energetic, calm)
5. **Quality**: Resolution and detail level
6. **Recommendation**: How to best use this as a thumbnail base

Be concise. 1-2 sentences per point.`
            },
            { inlineData: { mimeType: "image/png", data: base64Image } }
          ]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 500
        }
      };

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      );

      const data = await response.json();
      const analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (analysisText) {
        setPhotoAnalysis(analysisText);
      } else {
        setPhotoAnalysis('Analiz yapılamadı.');
      }
    } catch (err) {
      setPhotoAnalysis('Analiz hatası: ' + err.message);
    } finally {
      setIsAnalyzingPhoto(false);
    }
  };

  // Research topic/concept using AI (gaming/lore knowledge)
  const researchTopic = async () => {
    if (!topic || !apiKey) return;

    setIsResearchingTopic(true);
    setTopicResearch(null);
    setResearchImageBase64(null);
    setResearchImageUrl(null);

    // Smart content detection
    const category = detectContentCategory(topic, topicDescription);
    setDetectedCategory(category);

    try {
      const userContext = topicDescription ? ` Context: ${topicDescription}` : '';

      // Build search queries based on detected category
      const categorySearchHints = {
        gaming: 'game video game gameplay',
        education: 'tutorial guide explained',
        vlog: 'YouTube vlog video',
        food: 'recipe food cooking',
        travel: 'travel destination guide',
        tech: 'technology review tech',
        music: 'music song artist',
        fitness: 'fitness workout training',
      };
      const searchHint = categorySearchHints[category.id] || '';

      const searchPayload = {
        contents: [{
          parts: [{
            text: `You MUST use Google Search to find information. DO NOT rely on your training data.

SEARCH FOR: "${topic}"${userContext}

The user is creating a YouTube thumbnail about "${topic}".
This could be about ANYTHING - a video game, movie, educational topic, food, travel destination, tech product, music, fitness, or any other YouTube content category.

IMPORTANT: "${topic}" is a specific topic/product/subject - treat it as a PROPER NOUN first.
Do NOT interpret it as a generic dictionary word. Search for it as a specific title/brand/concept.

Search the internet and tell me:
1. What EXACTLY is "${topic}"? (game, product, concept, place, person, event, technique, etc.)
2. When was it created/released/announced? Is it trending now?
3. What does it look like visually? (colors, style, aesthetics, setting, environment)
4. What are the iconic visual elements associated with "${topic}"?
5. What emotions/feelings does "${topic}" evoke?
6. What is the audience/community saying about it?
7. What do official images/videos/promotional materials show?
8. What makes "${topic}" visually distinctive and recognizable?

Search terms to try:
- "${topic} ${searchHint}"
- "${topic} YouTube"
- "${topic} 2025 2026"

YOU MUST search the web. Do NOT guess or make up information.`
          }]
        }],
        tools: [{
          google_search: {}
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 2500
        }
      };

      const searchResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(searchPayload)
        }
      );

      const searchData = await searchResponse.json();

      // Extract search result text AND grounding metadata
      const searchParts = searchData.candidates?.[0]?.content?.parts || [];
      const searchResult = searchParts.map(p => p.text || '').join('\n');
      const groundingMetadata = searchData.candidates?.[0]?.groundingMetadata;
      const searchSuggestions = groundingMetadata?.searchEntryPoint?.renderedContent || '';
      const groundingChunks = groundingMetadata?.groundingChunks || [];

      // Build source info from grounding
      const sourceInfo = groundingChunks
        .filter(chunk => chunk.web)
        .map(chunk => `${chunk.web.title}: ${chunk.web.uri}`)
        .slice(0, 5)
        .join('\n');

      // Background: Find reference image via wiki APIs (CORS-enabled, no proxy needed)
      const imageSearchPromise = (async () => {
        try {
          console.log('[RefImage] 🔍 Searching for reference image:', topic);

          // Strategy 1: Extract Fandom wiki pages from grounding metadata
          const fandomPages = groundingChunks
            .filter(c => c.web?.uri?.includes('fandom.com/wiki/'))
            .map(c => {
              const match = c.web.uri.match(/https?:\/\/([^.]+)\.fandom\.com\/wiki\/([^?#]+)/);
              return match ? { wiki: match[1], page: decodeURIComponent(match[2].replace(/_/g, ' ')) } : null;
            })
            .filter(Boolean);
          console.log('[RefImage] 📚 Fandom pages from grounding:', fandomPages);

          for (const { wiki, page } of fandomPages) {
            try {
              console.log(`[RefImage] 🔗 Trying Fandom API: ${wiki}.fandom.com → "${page}"`);
              const res = await fetch(
                `https://${wiki}.fandom.com/api.php?action=query&titles=${encodeURIComponent(page)}&prop=pageimages&format=json&pithumbsize=800&origin=*`,
                { signal: AbortSignal.timeout(8000) }
              );
              if (!res.ok) continue;
              const data = await res.json();
              const pageData = Object.values(data.query?.pages || {})[0];
              const imgUrl = pageData?.thumbnail?.source;
              if (imgUrl) {
                console.log('[RefImage] ⬇️ Fandom image URL:', imgUrl);
                const base64 = await fetchImageAsBase64(imgUrl);
                if (base64) {
                  console.log(`[RefImage] ✅ Fandom (${wiki}) image fetched! Size:`, Math.round(base64.length / 1024), 'KB');
                  setResearchImageBase64(base64);
                  setResearchImageUrl(imgUrl);
                  return;
                }
              } else {
                console.log(`[RefImage] ⚠️ Fandom (${wiki}) page exists but no image`);
              }
            } catch (e) { console.log(`[RefImage] ❌ Fandom (${wiki}) failed:`, e.message); }
          }

          // Strategy 2: Wikipedia REST API (fully CORS-enabled)
          try {
            const wikiTerm = topic.split(/\s+/).slice(0, 3).join('_');
            console.log('[RefImage] 🔗 Trying Wikipedia:', wikiTerm);
            const wikiRes = await fetch(
              `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiTerm)}`,
              { signal: AbortSignal.timeout(8000) }
            );
            if (wikiRes.ok) {
              const wikiData = await wikiRes.json();
              if (wikiData.thumbnail?.source) {
                const highRes = wikiData.thumbnail.source.replace(/\/\d+px-/, '/800px-');
                console.log('[RefImage] ⬇️ Wikipedia image URL:', highRes);
                const base64 = await fetchImageAsBase64(highRes);
                if (base64) {
                  console.log('[RefImage] ✅ Wikipedia image fetched! Size:', Math.round(base64.length / 1024), 'KB');
                  setResearchImageBase64(base64);
                  setResearchImageUrl(highRes);
                  return;
                }
              }
            }
          } catch (e) { console.log('[RefImage] ❌ Wikipedia failed:', e.message); }

          // Strategy 3: Fandom search API (if grounding had no fandom links)
          if (fandomPages.length === 0) {
            const categoryWikis = {
              gaming: ['totalwar', 'warhammer40k', 'warhammer', 'elderscrolls', 'leagueoflegends', 'darksouls', 'eldenring', 'witcher', 'callofduty', 'fortnite'],
              food: ['recipes'],
              tech: ['en.wikipedia.org'],
            };
            const wikis = categoryWikis[category?.id] || [];
            for (const wiki of wikis.slice(0, 3)) {
              try {
                console.log(`[RefImage] 🔍 Searching Fandom (${wiki}) for:`, topic);
                const res = await fetch(
                  `https://${wiki}.fandom.com/api.php?action=query&list=search&srsearch=${encodeURIComponent(topic)}&format=json&srlimit=1&origin=*`,
                  { signal: AbortSignal.timeout(8000) }
                );
                if (!res.ok) continue;
                const data = await res.json();
                const title = data.query?.search?.[0]?.title;
                if (!title) continue;
                console.log(`[RefImage] 📄 Found page: "${title}"`);
                const imgRes = await fetch(
                  `https://${wiki}.fandom.com/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=800&origin=*`,
                  { signal: AbortSignal.timeout(8000) }
                );
                if (!imgRes.ok) continue;
                const imgData = await imgRes.json();
                const imgPage = Object.values(imgData.query?.pages || {})[0];
                const imgUrl = imgPage?.thumbnail?.source;
                if (imgUrl) {
                  const base64 = await fetchImageAsBase64(imgUrl);
                  if (base64) {
                    console.log(`[RefImage] ✅ Fandom search (${wiki}) image fetched! Size:`, Math.round(base64.length / 1024), 'KB');
                    setResearchImageBase64(base64);
                    setResearchImageUrl(imgUrl);
                    return;
                  }
                }
              } catch (e) { continue; }
            }
          }

          console.log('[RefImage] ⚠️ All strategies failed - no reference image found');
        } catch (e) {
          console.log('[RefImage] ❌ Search failed:', e.message);
        }
      })();

      // Step 2: Deep visual analysis combining search results + AI creativity
      const analysisPayload = {
        contents: [{
          parts: [{
            text: `Sen bir GÖRSEL TASARIM, İÇERİK ve YOUTUBE uzmanısın.
"${topic}" hakkında YouTube thumbnail tasarımı için görsel analiz yapman gerekiyor.

${topicDescription ? `Kullanıcının ek açıklaması: ${topicDescription}` : ''}

📡 İNTERNETTEN BULUNAN GÜNCEL BİLGİLER (BU BİLGİLERİ KULLAN!):
${searchResult}

${sourceInfo ? `\n📎 Kaynaklar:\n${sourceInfo}\n` : ''}

⚠️ ÖNEMLİ: Yukarıdaki internet araştırması sonuçlarını TEMEL AL.
"${topic}" kelimesinin sözlük anlamını DEĞİL, yukarıda bulunan GERÇEK bilgileri kullan.

Lütfen Türkçe olarak çok detaylı yaz:

⚡ 0. **İÇERİK KATEGORİSİ** (İLK ÖNCE BUNU BELİRLE!):
İnternet araştırması sonuçlarına göre "${topic}" hangi kategoriye ait?
Cevabını MUTLAKA şu formatta yaz (ilk satır olmalı):
DETECTED_CATEGORY: [gaming/education/vlog/food/travel/tech/music/fitness/historical/general]

Karar verirken:
- gaming: Video oyunu, oyun karakteri, oyun franchise'ı, oyun modu, oyun içi içerik, esport
- education: Eğitim, bilim, tarih belgeseli, nasıl yapılır, ders, kişisel gelişim, din/maneviyat
- historical: Tarihsel dönem, imparatorluk, savaş, fetih, antik medeniyet (oyun DEĞİL, gerçek tarih)
- vlog: Günlük yaşam, reaction, challenge, podcast, sohbet
- food: Yemek, tarif, restoran, lezzet
- travel: Seyahat, gezi, ülke/şehir turu, doğa
- tech: Teknoloji, telefon, bilgisayar, yazılım, AI, ürün inceleme
- music: Müzik, şarkı, konser, enstrüman, dans
- fitness: Spor, egzersiz, diyet, vücut geliştirme
- general: Yukarıdakilerin hiçbirine uymuyorsa

⚠️ ÖNEMLİ: Sözlük anlamına BAKMA! İnternet sonuçlarına bak. Örneğin "Taurox" sözlükte boğa ama internette Warhammer oyun karakteri → gaming!

1. **KONU KİMLİĞİ**:
   - Bu ne? Tam tanımı (Oyun, ürün, kavram, mekan, kişi, olay, teknik, yemek, müzik vb.)
   - Hangi alana/sektöre ait? Popülerliği ne durumda?
   - Hedef kitle kimler? Fanlar/takipçiler için anlamı
   - Güncellik: Trend mi? Yeni mi çıktı? Tartışmalı mı?

2. **GÖRSEL KİMLİK** (ÇOK ÖNEMLİ - DETAYLI YAZILMALI):
   - Karakteristik renk paleti (HEX kodlarıyla - örn: #4a0080, #1a1a2e, #8b0000)
   - İkonik görsel elementler (logolar, semboller, ürünler, mekanlar, kıyafetler)
   - Ortam/atmosfer (karanlık, epik, sıcak, profesyonel, enerjik, huzurlu, neon vb.)
   - Tipik arka plan elementleri (stüdyo, doğa, şehir, mutfak, sahne, gym vb.)
   - Işık tipi ve yönü (doğal, stüdyo, neon, altın saat, dramatik, yumuşak vb.)
   - Parçacık/efekt önerileri (bokeh, lens flare, duman, konfeti, ışık sızması vb.)

2b. **OYUN/FRANCHİSE GÖRSEL KİMLİĞİ** (OYUN veya FRANCHİSE İÇERİĞİ İSE ÇOK DETAYLI DOLDUR, DEĞİLSE GEÇ):
   Bu konu bir VIDEO OYUNU, oyun franchise'ı, oyun karakteri veya oyun dünyasıyla ilgiliyse:

   - **OYUN ART STYLE**: Bu oyunun görsel stili nedir? (grimdark, cel-shaded, realistic, stylized, pixel art, anime vb.)
     Oyunun genel renk paleti ve atmosferi nedir? (karanlık ve kasvetli, renkli ve canlı, pastel vb.)

   - **KARAKTERLERİN GÖRSEL DETAYLARI** (ÇOK KRİTİK - EN ÇOK HATA YAPILAN KISIM):
     * Thumbnail'da görünmesi muhtemel ANA karakter(ler) kimler?

     * ⚠️⚠️⚠️ İLK ÖNCE BELİRLE - CHARACTER_TYPE: human / non-human / monster
       - Bu karakter İNSAN mı? (Geralt, Master Chief, Mario vb.)
       - Bu karakter İNSAN-DIŞI mı? (Minotaur, ejderha, uzaylı, robot, canavar, demon vb.)
       - Bu ÇOK KRİTİK çünkü AI görsel modeli "bull" deyince GERÇEK bir boğa çizer.
         Oysa Taurox bir Minotaur'dur = İNSAN VÜCUTLU + BOĞA BAŞLI DEV yaratık. Gerçek bir boğa DEĞİL!
       - HAYVAN İSMİ KULLANMA! Yaratığın tam anatomik tanımını yaz:
         YANLIŞ: "Taurox is a brass bull" (AI gerçek boğa çizer!)
         DOĞRU: "Taurox is a massive Minotaur - stands upright on two legs like a human, 3 meters tall, humanoid muscular body, bull-shaped head with huge curved horns, entire body covered in living brass metal plates"
         YANLIŞ: "Deathwing is a dragon" (AI generic ejderha çizer!)
         DOĞRU: "Deathwing is a colossal black dragon with molten lava glowing between cracked armor plates bolted onto his body, massive jaw with molten orange glow, torn wings with metal reinforcements"

     * Her karakter için ÇOK DETAYLI fiziksel tanım:
       - Tür: İnsan mı, humanoid mi, yaratık mı, robot mu? İki ayak üzerinde mi, dört ayak mı?
       - Boyut: Normal insan boyutu? Dev mi? Küçük mü? (metre cinsinden yaklaşık boy)
       - Baş/Yüz: İnsan yüzü mü? Hayvan başı mı? Miğfer mi? Maske mi? Detaylı tanımla
       - Vücut: İnsan anatomisi mi? Kas yapısı, özel uzuvlar (kanatlar, kuyruk, ekstra kollar?)
       - Deri/Kaplama: Normal deri? Pullu? Metal? Taş? Renk ve doku
       - Gözler: Renk, parlaklık, sayı, özel özellik (parlayan, ateşli, boş vb.)
     * Her karakter için KIYAFET/ZIRH detayları:
       - Zırh tipi ve rengi (power armor, plate armor, robe, casual vb.)
       - Zırh üzerindeki semboller, işaretler, renkler
       - Başlık/miğfer (varsa detaylı tanımla)
       - Silah(lar): Hangi silahı tutuyor? (kılıç tipi, tüfek modeli, büyü asası vb.) - SİLAHIN GÖRSEL DETAYI
     * ⚠️ ÖNEMLİ: Genel "bir savaşçı" veya "bir canavar" DEĞİL, O OYUNUN O KARAKTERİNE ÖZGÜ detayları yaz!
       Örn: "Geralt of Rivia" → "CHARACTER_TYPE: human. Beyaz uzun saç, sarı kedi gözleri, sol yanakta yara izi, siyah zırh üzerine gümüş kurt madalyonu"
       Örn: "Space Marine" → "CHARACTER_TYPE: human (in power armor). Mavi power armor, sol omuzda beyaz Omega sembolü, kırmızı göz lensleri, gold trim"
       Örn: "Taurox" → "CHARACTER_TYPE: non-human (Minotaur). Dev boyutlu (3m), iki ayak üzerinde dik duran humanoid vücut, boğa başı, devasa kıvrık boynuzlar, tüm vücut canlı pirinç/bronz metal plakalarla kaplı, kızıl parlayan gözler, Khorne runik sembolleri kazınmış"

   - **FACTION/GRUP DETAYLARI**:
     * Hangi faction/takım/grup? (Space Marines Ultramarines, Horde, Brotherhood of Steel vb.)
     * Faction renkleri: Ana renk + ikincil renk + aksanlar (HEX kodlarıyla)
     * Faction sembolü/logosu: Tam görsel tanım (şekil, renk, nereye yerleştirilir)
     * Faction'a özgü mimari/teknoloji/araçlar

   - **OYUN LOGOSU ve İKONİK ELEMENTLER**:
     * Oyunun logosunun görsel tanımı (font stili, renk, efektler)
     * Oyunun en ikonik görsel elementleri (Warhammer: Aquila kartalı, Elden Ring: Erdtree, Dark Souls: bonfire vb.)
     * Oyunun signature efektleri (Warhammer: warp energy, Elden Ring: golden glow, Cyberpunk: glitch efekti)

   - **SAHNE/ENVIRONMENT**:
     * Bu oyunun dünyasında tipik ortamlar nasıl görünür?
     * Mimari stil (gothic, futuristic, fantasy castle, wasteland vb.)
     * Gökyüzü/atmosfer (karanlık bulutlar, çift güneş, yeşil warp fırtınası, kırmızı gökyüzü vb.)
     * Zemin/arazi tipi

3. **TARİHSEL DOĞRULUK ANALİZİ** (BU BÖLÜM HER ZAMAN DOLDURULMALI):
   Bu konu tarihsel bir dönem, imparatorluk, medeniyet, savaş veya tarihsel bir oyunla (Age of Empires, Civilization, Total War, Crusader Kings, Europa Universalis, Mount & Blade, Kingdom Come, Assassin's Creed, Ghost of Tsushima, For Honor vb.) İLGİLİYSE aşağıdakileri DETAYLI doldur.
   Tarihsel içerik DEĞİLSE "Bu konu tarihsel değildir" yaz ve geç.

   - **TARİHSEL DÖNEM**: Tam tarih aralığı (yıllar). Örn: "Osmanlı klasik dönemi: 1453-1600"

   - **SAHNE MANTIĞI ve OLAY BAĞLAMI** (ÇOK KRİTİK!):
     Bu bölüm thumbnail'ın ANLAMLI ve MANTIKLI olması için en önemli bölümdür.
     * **Olay nedir?** Bu tarihsel an/savaş/fetih tam olarak neyi anlatıyor?
     * **Kimin bakış açısı?** Thumbnail kimin perspektifinden? (Saldıran mı, savunan mı, izleyen mi?)
     * **Sahne nerede geçiyor?** O an o mekan nasıl görünüyor?
       - ÖNEMLİ: Bir şehrin FETHİNDEN/KUŞATMASINDAN bahsediliyorsa, o şehir HENÜZ fethedilmemiş haliyle gösterilmeli!
       - Örnek: İstanbul'un Fethi 1453 → Şehirde Ayasofya bir BİZANS KİLİSESİ (kubbe + haç), CAMİ DEĞİL! Minareler YOK, hilal YOK. Çünkü henüz fethedilmedi.
       - Örnek: Roma'nın yıkılışı → Roma tapınakları ve pagan sembolleri, Katolik katedralleri değil
       - Örnek: Kudüs kuşatması (Haçlı Seferleri) → Kudüs o an kimin elinde? Ona göre semboller değişir
     * **İki taraf kimler?** Savaş/çatışma varsa her iki tarafın görsel kimliğini ayrı ayrı tanımla:
       - SALDIRAN taraf: bayrak, zırh, silah, renk paleti
       - SAVUNAN taraf: bayrak, zırh, silah, renk paleti, savunma yapıları (surlar, kuleler)
     * **Zamanlama detayı**: Olay öncesi mi, olay anı mı, sonrası mı?
       - ÖNCE: Şehir/yer henüz eski sahiplerinin kontrolünde
       - OLAY ANI: Kuşatma/savaş devam ediyor, her iki tarafın elementleri görünür
       - SONRA: Yeni sahiplerin kontrolü ele geçirmiş hali

   - **BAYRAKLAR ve SANCAKLAR** (ÇOK KRİTİK - EN SIK YAPILAN HATA!):
     * O dönemde kullanılan GERÇEK bayrak/sancak tasarımı nedir? (Renk, sembol, şekil, detay)
     * ⚠️⚠️⚠️ KESİNLİKLE modern ülke bayrağı kullanılMAMALI! Bu EN SIK YAPILAN HATADIR!
     * ⚠️ ÖZELLIKLE OSMANLI İÇİN: Osmanlı bayrağı/sancağı MODERN TÜRKİYE BAYRAĞI DEĞİLDİR!
       - YANLIŞ: 🇹🇷 Kırmızı zemin + beyaz hilal + beyaz 5 köşeli yıldız (Bu MODERN Türkiye bayrağıdır, 1844 sonrası!)
       - DOĞRU (Klasik Osmanlı): Kırmızı/bordo sancak üzerinde 3 hilal (üç hilalli sancak) VEYA altın/sarı hilal ve 8 köşeli yıldız
       - DOĞRU (Erken Osmanlı): Düz kırmızı/bordo sancak, bazen Zülfikar kılıcı motifi, bazen tuğra
       - DOĞRU (Fetih dönemi 1453): Kırmızı sancak, altın renkli hilal ve 8 köşeli yıldız (8-pointed, NOT 5-pointed!)
       - ÖNEMLİ: Hilal ve yıldız varsa, yıldız MUTLAKA 8 KÖŞELI olmalı (5 köşeli MODERN semboldür!)
       - Osmanlı sancağının rengi genelde KOYU KIRMIZI/BORDO, beyaz değil
     * DİĞER TARİHSEL BAYRAKLAR İÇİN DE: Her devletin kendi dönemi için doğru bayrağını araştır
     * O dönemin sancağını ÇOK detaylı tanımla: zemin rengi, sembol şekli, sembol rengi, yıldız köşe sayısı, ek detaylar
     * Eğer iki taraf varsa HER İKİ TARAFIN bayraklarını ayrı ayrı tanımla
     * ⚠️ BAYRAK/SANCAK AÇIKLAMASINDA "Turkish flag", "Turkey flag" KELİMELERİNİ KULLANMA - bunlar AI modelinin modern bayrak çizmesine sebep olur!

   - **ZIRHLAR ve KIYAFETLER**:
     * O dönemin askeri sınıfları kimlerdi ve ne giyerlerdi?
     * Zırh tipi, başlık/miğfer, pelerin/kaftan, ayakkabı detayları
     * Komutanlar vs sıradan askerler arasındaki kıyafet farkları
     * Eğer iki taraf varsa HER İKİ TARAFIN kıyafetlerini ayrı ayrı tanımla

   - **SİLAHLAR ve SAVAŞ TEKNOLOJİSİ**:
     * O dönemde kullanılan başlıca silahlar (yakın dövüş, uzak menzil, kuşatma)
     * Barut var mıydı? Topçuluk? Ok/yay mı arbalet mi tüfek mi?

   - **MİMARİ ve ÇEVRE**:
     * O dönemin ve medeniyetin mimari stili (kubbe, kemer, sütun, gotik, pagoda vb.)
     * ⚠️ ÖNEMLİ: Bir mekan FETHEDILMEDEN/EL DEĞIŞTIRMEDEN ÖNCEKİ haliyle gösterilmeli!
       - Fetih ÖNCESİ: Eski sahiplerin mimari stili, dini yapıları, sembolleri
       - Fetih SONRASI: Yeni sahiplerin ekledikleri (minare, çan kulesi vb.)
     * Coğrafi ortam (çöl, step, orman, dağ, kıyı, boğaz vb.)

   - **SEMBOLLER ve ARMALAR**:
     * İmparatorluk/krallık arması, mühür, tuğra veya amblem
     * Dini/kültürel semboller (varsa) - ama DÖNEME UYGUN olanlar

   - **KULLANILMAMASI GEREKENLER** (Anakronizm ve mantık hatası listesi):
     * Bu dönemde henüz var OLMAYAN şeylerin listesi
     * Bu medeniyetle KARIŞTIRILMAMASI gereken başka medeniyetlerin elementleri
     * OLAY MANTIĞINA AYKIRI şeyler:
       - Örn: "İstanbul fethi sahnesinde CAMİ gösterilmez çünkü henüz kilise"
       - Örn: "Romalılar Hristiyanlık öncesi dönemde haç taşımaz"
       - Örn: "Vikinglerin fethetmediği bir İngiliz şehrinde Viking sembolleri olmaz"

4. **DUYGUSAL TON ve ATMOSFER**:
   - Hangi duyguyu uyandırmalı? (Korku, heyecan, güç, gizem, merak, nostalji, güven, iştah, hayranlık, eğlence)
   - İzleyici bu thumbnail'ı görünce ne hissetmeli?
   - Renk psikolojisi önerileri (sıcak=güven/iştah, soğuk=profesyonellik, neon=enerji, vs.)

5. **THUMBNAIL ÖNERİLERİ**:
   - En iyi kompozisyon önerisi (kişi nerede durmalı, arka plan nasıl olmalı)
   - Kullanılması gereken efektler (ışık, parçacık, sis, lens flare, bokeh, duman vb.)
   - Kostüm/kıyafet önerisi (kişi ne giymeli - İÇERİĞE UYGUN olmalı!)
   - Kaçınılması gereken hatalar
   - Örnek yazı önerileri (2-3 kelime, Türkçe ve İngilizce seçenekler)

6. **REFERANS STİLİ**:
   - Bu konu için en uygun görsel stil (sinematik, profesyonel, enerjik, sıcak, minimalist, neon, dark fantasy vb.)
   - Benzer başarılı YouTube thumbnail'ların özellikleri
   - ÖNERİLEN ARCHETYPE: Bu konu için en uygun 2-3 archetype ID'si öner (reaction_face, expert_authority, food_desire, travel_wonder, transformation, breaking_news, music_energy, challenge_fun, mystery_reveal, shocked_threat, power_fantasy, scale_contrast, almost_fail, mystery_object, before_after)

Bir YouTube uzmanı ve thumbnail tasarımcısı gibi düşün. ÇOK DETAYLI ve TUTKULU yaz.
Bu bilgiler doğrudan AI görsel üretiminde kullanılacak, bu yüzden görsel detaylar KRİTİK önemde.
⚠️ TARİHSEL İÇERİKLERDE: Modern bayrak/sembol kullanmak, yanlış dönem kıyafeti giydirmek veya anakronistik teknoloji göstermek EN BÜYÜK HATADIR!
⚠️⚠️ BAYRAK ÖZELLİKLE KRİTİK: Osmanlı bayrağı/sancağı ≠ Modern Türkiye bayrağı! Osmanlı sancağı = koyu kırmızı/bordo + altın hilal + altın 8 köşeli yıldız. Modern Türkiye bayrağı (parlak kırmızı + beyaz hilal + beyaz 5 köşeli yıldız) 1844 SONRASI oluşmuştur!`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4000
        }
      };

      const analysisResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(analysisPayload)
        }
      );

      const analysisData = await analysisResponse.json();
      const researchText = analysisData.candidates?.[0]?.content?.parts?.[0]?.text;

      if (researchText) {
        // Parse AI-determined category from research response
        const categoryMatch = researchText.match(/DETECTED_CATEGORY:\s*(gaming|education|vlog|food|travel|tech|music|fitness|historical|general)/i);
        const aiDetectedCategoryId = categoryMatch ? categoryMatch[1].toLowerCase() : null;

        // AI category overrides keyword-based detection (AI has internet context!)
        if (aiDetectedCategoryId && aiDetectedCategoryId !== 'general') {
          const aiCategory = aiDetectedCategoryId === 'historical'
            ? { ...GENERAL_CATEGORY, id: 'historical', visualMood: 'Cinematic, epic, historically authentic, dramatic lighting' }
            : CONTENT_CATEGORIES[aiDetectedCategoryId];
          if (aiCategory) {
            setDetectedCategory(aiCategory);
          }
        }

        // Determine content type from AI classification (primary) or keyword fallback
        const effectiveCategoryId = aiDetectedCategoryId || category.id;
        const isHistorical = effectiveCategoryId === 'historical';
        const isGaming = effectiveCategoryId === 'gaming';

        const scenePromptBase = `You are a SCENE DIRECTOR. Read the research below and write a CONCRETE, DETAILED scene description for a YouTube thumbnail.

RESEARCH:
${researchText}

TOPIC: "${topic}"
${topicDescription ? `CONTEXT: ${topicDescription}` : ''}

Write in ENGLISH. Be SPECIFIC and VISUAL. Complete ALL sections fully - do NOT stop mid-sentence.`;

        const scenePromptGeneral = `${scenePromptBase}

FORMAT (write each section completely):

**SCENE_DESCRIPTION**: Describe the background environment in vivid detail. Include: setting, lighting, colors, atmosphere, key objects, mood. Be very specific - e.g. "A dark, rain-soaked cyberpunk alley with neon signs reflecting off wet pavement, holographic advertisements flickering overhead, steam rising from grates" NOT just "a city street".

**COLOR_PALETTE**: List 3-5 dominant colors for the scene (e.g., "deep crimson, electric blue, dark charcoal, golden amber")

**PERSON_COSTUME**: What should the person in the thumbnail wear? Match the theme. (e.g., "futuristic tactical suit with glowing blue accents" or "casual gaming hoodie with headphones around neck")

**CAMERA_ANGLE**: Camera position and framing (e.g., "Low angle looking up at subject, dramatic perspective, wide-angle lens feel")

**KEY_EFFECTS**: Special visual effects to add (e.g., "volumetric fog, sparks flying, lens flare from explosion behind subject, particle effects")

Keep each section 2-4 sentences. Be COMPLETE - finish every sentence.`;

        const scenePromptGaming = `${scenePromptBase}

IMPORTANT: This is a VIDEO GAME topic. The research above contains detailed character and faction information.
You MUST use that information to create an AUTHENTIC game-accurate scene. DO NOT invent generic fantasy/sci-fi visuals.

FORMAT (write each section completely):

**SCENE_DESCRIPTION**: Describe the game world environment in vivid detail. Use the ACTUAL game's environment style from the research.
Include: specific location from the game, lighting style matching the game's aesthetic, atmosphere, iconic game elements in the background.
e.g. for Warhammer 40K: "A ruined cathedral-fortress on a war-torn hive world, gothic architecture with massive stone pillars, skull motifs carved into every surface, the sky torn apart by warp storms glowing sickly purple-green, Imperial Aquila banners hanging torn from the walls, distant explosions lighting up the smog-filled horizon"
NOT just: "a dark sci-fi background"

**COLOR_PALETTE**: Use the EXACT colors from the game/faction. List 4-6 colors with purpose.
e.g. "Ultramarine blue (#0A2B6E) for armor, gold (#C5A028) for trim and aquila, dark red (#5C0A0A) for eye lenses and wax seals, black (#1A1A1A) for joints and undersuit, bone white (#E8DCC8) for skull decorations"

**CHARACTER_VISUAL**: EXTREMELY detailed description of the game character that will appear in the thumbnail.
This is the MOST IMPORTANT section.

FIRST, state: CHARACTER_TYPE: human / non-human / monster
This changes EVERYTHING about how the character is drawn!

For NON-HUMAN characters (monsters, creatures, demons, minotaurs, dragons, aliens, robots):
⚠️⚠️⚠️ DO NOT use simple animal names! AI image models will draw REAL animals!
WRONG: "Taurox is a brass bull" → AI draws a literal bull (4 legs, animal)
RIGHT: "Taurox is a massive bipedal Minotaur creature standing upright on two legs, 3 meters tall, humanoid muscular torso and arms, bull-shaped head with enormous curved horns, entire body surface covered in fused brass metal plates, glowing red eyes"

Describe the EXACT anatomy:
- How many legs? Stands upright like human or on all fours?
- Body shape: humanoid? beast? hybrid? Size compared to a human?
- Head: what shape? Horns? Tusks? Eyes (how many, color, glow)?
- Special features: wings, tail, extra arms, tentacles?
- Surface: skin, scales, metal, stone, fur? Color and texture?
- What makes it DIFFERENT from the real-world animal it resembles?

For HUMAN characters:
- Face: skin tone, eye color/glow, facial hair, scars, markings, expression
- Hair: color, length, style, special features
- Armor/Clothing: EXACT type, color, material, every distinctive marking/symbol
- Helmet (if any): on head or held? Exact design
- Weapon(s): EXACT weapon name and visual description, how they hold it
- Pose: what pose for the thumbnail?
⚠️ This must be the SPECIFIC game character, not a generic warrior/soldier!

**THUMBNAIL_COMPOSITION**: How should the thumbnail be composed?
If CHARACTER_TYPE is non-human:
- The GAME CHARACTER (creature/monster) should be the DOMINANT visual element (50-70% of frame)
- If a person (YouTuber) photo is uploaded, place the person SMALLER in the foreground corner (20-30% of frame), looking up at or reacting to the creature
- The creature should be BEHIND and ABOVE the person, towering over them
- Example: "Taurox the massive brass Minotaur fills the background, roaring with axes raised. The person is in the bottom-left corner, smaller, looking back in awe/fear"

If CHARACTER_TYPE is human:
- The person can BE dressed as the character (face stays same, body gets character's armor/outfit)
- OR the game character can appear alongside the person
- Person takes up 40-50% of frame as the main focal point

**FACTION_ELEMENTS**: Faction-specific visual details to include in the scene:
- Faction symbol/logo: exact shape, color, where it appears (on shoulder pad, banner, etc.)
- Faction-specific objects: banners, standards, vehicles, structures
- Faction art style: clean vs battle-damaged, ornate vs utilitarian

**GAME_IDENTITY**: Elements that make this INSTANTLY recognizable as THIS specific game:
- Game's signature visual motifs (skulls for 40K, runes for Elden Ring, etc.)
- Game's art style description (grimdark, high fantasy, cel-shaded, etc.)
- Iconic HUD/UI elements that could subtly appear (optional)
- Game logo style description (for text overlay inspiration)

**CAMERA_ANGLE**: Camera position and framing (e.g., "Low angle looking up at the character, dramatic perspective, the character fills 60% of the frame with the game world behind")

**KEY_EFFECTS**: Game-appropriate visual effects:
- Particle effects from the game (magic particles, sparks, embers, energy, warp lightning)
- Lighting effects (glowing weapons, eye glow, energy auras)
- Atmospheric effects (fog, smoke, dust, rain) matching the game world

Keep each section 3-5 sentences. Be SPECIFIC to THIS game. Be COMPLETE - finish every sentence.`;

        const scenePromptHistorical = `${scenePromptBase}

CRITICAL: AI image models draw MODERN versions of well-known cities when they hear city names.
e.g., "Istanbul" → draws modern minarets. "Rome" → draws modern Italy.
DO NOT use modern city/country names! Describe architecture and visuals directly instead.

FORMAT (write each section completely, in English):

**SCENE_DESCRIPTION**: Describe the scene using ONLY architectural and visual terms, NO modern city names.
WRONG: "Istanbul with Byzantine architecture" (model draws modern Istanbul!)
RIGHT: "Ancient walled city, massive domed basilica with Christian crosses, Theodosian double walls, Byzantine eagle banners"

**ATTACKER_DESCRIPTION**: (If attackers present) Describe banners, armor, weapons in detail.
⚠️ Ottoman banner = DARK CRIMSON/BURGUNDY + GOLDEN crescent + GOLDEN 8-POINTED star
NEVER use: "Turkish flag", "flag of Turkey", white crescent, 5-pointed star, bright red

**DEFENDER_DESCRIPTION**: (If defenders present) Describe their armor, shields, banners.

**CAMERA_POSITION**: Where is the camera? What angle?

**PERSON_COSTUME**: What should the thumbnail person wear? Match the era.

**ABSOLUTELY_NOT**: Things that MUST NOT appear. For Ottoman scenes ALWAYS include:
"NO modern Turkish flag (red+white crescent+5-pointed star), use historical Ottoman banner instead"

Keep each section 2-3 sentences. Be COMPLETE - finish every sentence.`;

        const scenePayload = {
          contents: [{
            parts: [{
              text: isHistorical ? scenePromptHistorical : isGaming ? scenePromptGaming : scenePromptGeneral
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 8192
          }
        };

        const sceneResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(scenePayload)
          }
        );

        const sceneData = await sceneResponse.json();
        let sceneDescription = sceneData.candidates?.[0]?.content?.parts?.[0]?.text;
        const finishReason = sceneData.candidates?.[0]?.finishReason;

        // If output was truncated (MAX_TOKENS), log warning but still use what we got
        if (finishReason === 'MAX_TOKENS' && sceneDescription) {
          console.warn('Scene direction was truncated. Using partial result.');
        }

        // Combine research + scene description
        const combinedResearch = sceneDescription
          ? `${researchText}\n\n🎬 READY-TO-USE SCENE DIRECTION:\n${sceneDescription}`
          : researchText;

        setTopicResearch(combinedResearch);
      } else {
        setTopicResearch('Araştırma yapılamadı.');
      }
    } catch (err) {
      setTopicResearch('Araştırma hatası: ' + err.message);
    } finally {
      setIsResearchingTopic(false);
    }
  };

  const generateThumbnail = async () => {
    if (!apiKey) {
      setError(t('enterApiKey'));
      return;
    }
    if (!topic) {
      setError(t('uploadPhotoAndTopic'));
      return;
    }

    // Günlük kullanım limiti kontrolü
    if (!canGenerate(currentPlan)) {
      const remaining = getRemainingGenerations(currentPlan);
      setError(t('dailyLimitReached'));
      return;
    }

    setLoading(true);
    setError(null);
    // Reset optimization state for fresh generation
    setIsOptimized(false);
    setPreviousImage(null);
    setPreviousCtrScore(null);

    const selectedTypo = typographyOptions.find(t => t.id === typoStyle);

    try {
      // Smart content detection for parameter tuning
      const contentCategory = detectedCategory || detectContentCategory(topic, topicDescription);

      const prompt = `Create a cinematic YouTube thumbnail for "${topic}".
${topicDescription ? `Context: ${topicDescription}` : ''}

${topicResearch ? `VISUAL RESEARCH (follow this closely):
${topicResearch}

Follow the SCENE DIRECTION sections above precisely:
- Use SCENE_DESCRIPTION for background, COLOR_PALETTE for colors, CHARACTER_VISUAL for character details.
- If CHARACTER_TYPE is "non-human": Draw the creature as the DOMINANT element (50-70% of frame) using its FULL anatomical description. Never simplify to animal names (e.g. "bipedal Minotaur with brass plates" not just "bull"). If a person photo is uploaded, place them smaller in a corner reacting to the creature.
- If CHARACTER_TYPE is "human": Dress the uploaded person in the character's exact armor/outfit.
- For historical content: Describe architecture directly, avoid modern city names. Use period-accurate banners and symbols.
` : ''}
${conceptAnalysis ? `REFERENCE STYLE (match this exactly):
${conceptAnalysis}
The attached reference image defines the target visual style. Replicate its color palette, lighting, composition, atmosphere, and effects.
` : ''}
${researchImageBase64 ? `TOPIC REFERENCE IMAGE: A reference image of "${topic}" is attached. Study this image carefully - it shows what the topic ACTUALLY looks like. Use this as your primary visual reference for accuracy (colors, shapes, style, distinctive features).
` : ''}
${photoAnalysis ? `UPLOADED IMAGE: ${photoAnalysis}
` : ''}
${selectedArchetype ? `COMPOSITION PATTERN: ${CTR_ARCHETYPES.find(a => a.id === selectedArchetype)?.prompt || ''}
` : ''}
${base64Image ? `PERSON PHOTO UPLOADED:
- Blend the person seamlessly into the scene with matching lighting and dramatic rim glow.
- Face must remain unchanged, fully visible, never cropped. Leave headroom above.
- For non-game content: Face should be large (40-50% of frame height), centered.
- For game content with non-human CHARACTER_TYPE: Person stays human, appears smaller in corner reacting to the game creature.
- For game content with human CHARACTER_TYPE: Transform clothing to match the character's exact armor/outfit from research.
` : `No person photo provided. Create a compelling scene from scratch based on the topic.
${topicResearch ? 'Follow CHARACTER_VISUAL and THUMBNAIL_COMPOSITION from research for character appearance and layout.' : ''}
`}
${overlayText ? `TEXT: "${overlayText}" - Place at bottom, very large and bold, thick black outline, glow effect in scene's dominant color. Never over the face. Avoid bottom-right corner.
` : `NO TEXT on this image. Zero letters, words, numbers, or symbols anywhere. The user will add text later.
`}
Style: ${selectedTypo.prompt}. Mood: ${contentCategory.visualMood}.
Cinematic quality: dramatic 3-point lighting, shallow depth of field, professional color grading, volumetric atmosphere, natural film texture. Must look like a professional YouTube thumbnail, not generic AI art.
${extraRequest ? `Additional: ${extraRequest}` : ''}`;

      // Build parts - image is optional
      const promptParts = [{ text: prompt }];
      if (base64Image) {
        promptParts.push({ inlineData: { mimeType: "image/png", data: base64Image } });
      }
      // Send concept/reference image to the model so it can SEE the reference style
      if (conceptBase64) {
        promptParts.push({ inlineData: { mimeType: "image/png", data: conceptBase64 } });
      }
      // Send research-found reference image so the model knows what the topic looks like
      if (researchImageBase64) {
        console.log('[Generate] 🖼️ Including research reference image in payload');
        promptParts.push({ inlineData: { mimeType: "image/png", data: researchImageBase64 } });
      } else {
        console.log('[Generate] ⚠️ No research reference image available');
      }

      const payload = {
        contents: [{
          parts: promptParts
        }],
        generationConfig: {
          responseModalities: ['TEXT', 'IMAGE'],
          temperature: 1.0,
          imageConfig: {
            aspectRatio: '16:9'
          }
        },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
        ]
      };

      const result = await fetchWithRetry(
        `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      );

      const generatedBase64 = result.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;

      if (generatedBase64) {
        setResultImage(`data:image/png;base64,${generatedBase64}`);
        incrementDailyUsage(); // Günlük kullanım sayacını artır
      } else {
        throw new Error('Görsel sentezleme başarısız. Lütfen tekrar deneyin.');
      }
    } catch (err) {
      setError(err.message || t('unknownError'));
    } finally {
      setLoading(false);
    }
  };

  // Make it more clickable - regenerate with optimized settings
  const makeMoreClickable = async () => {
    if (!resultImage) return;

    setIsOptimizing(true);
    setPreviousImage(resultImage);
    setPreviousCtrScore(ctrScore); // Save current score for comparison

    // Auto-select best archetype based on detected content category
    let optimizedArchetype = selectedArchetype;
    if (!optimizedArchetype) {
      const category = detectedCategory || detectContentCategory(topic, topicDescription);
      // Pick the first recommended archetype for this category
      optimizedArchetype = category.defaultArchetypes?.[0] || 'reaction_face';
      setSelectedArchetype(optimizedArchetype);
    }

    // Optimize overlay text if too long
    let optimizedText = overlayText;
    if (overlayText && overlayText.split(/\s+/).length > 4) {
      optimizedText = overlayText.split(/\s+/).slice(0, 3).join(' ') + '!';
      setOverlayText(optimizedText);
    }

    // Force best CTR style with color harmony
    if (typoStyle !== 'auto_harmony') {
      setTypoStyle('auto_harmony');
    }

    const archetype = CTR_ARCHETYPES.find(a => a.id === optimizedArchetype);
    const selectedTypo = typographyOptions.find(t => t.id === 'auto_harmony');

    try {
      const optimizeCategory = detectedCategory || detectContentCategory(topic, topicDescription);

      const optimizedPrompt = `You are a world-class YouTube thumbnail designer specializing in HIGH-CTR thumbnails. Create a HORIZONTAL LANDSCAPE thumbnail for "${topic}".

⚠️ ABSOLUTE REQUIREMENT - IMAGE ORIENTATION:
- THE IMAGE MUST BE HORIZONTAL/LANDSCAPE (width > height)
- DIMENSIONS: 1280 pixels WIDE x 720 pixels TALL (16:9 ratio)
- ❌ NEVER create vertical/portrait images
- ✅ ONLY create WIDE horizontal images

🎯 HIGH-CTR OPTIMIZATION MODE - APPLY ALL OF THESE:

${archetype ? `ARCHETYPE: ${archetype.name}
${archetype.prompt}` : ''}

⚠️ CRITICAL SIZE REQUIREMENTS (LIKE PROFESSIONAL YOUTUBE THUMBNAILS):
- Face must be HUGE - taking up 40-50% of the frame HEIGHT
- Person should be CENTERED or slightly below center
- The face is the MAIN FOCAL POINT of the entire thumbnail
- Show from chest-up or shoulders-up so face is LARGE
- Add dramatic colored rim lighting (green, red, blue, orange) on the person

MAXIMUM CLICK-THROUGH PRINCIPLES:
- HIGH CONTRAST - subject must POP from background
- Add GLOW and ENERGY effects around the subject
- Create CURIOSITY GAP - something unexpected or dramatic
- Colors must be VIBRANT and match a theme (green glow, red danger, blue ice, etc.)

${topicDescription ? `TOPIC CONTEXT: ${topicDescription}` : ''}

${topicResearch ? `
📋 EXPERT RESEARCH (CRITICAL - USE THIS FOR AUTHENTICITY):
${topicResearch}
Apply the visual identity, colors, and atmosphere described above!

🏛️ HISTORICAL SCENE (IF APPLICABLE):
If the research contains "READY-TO-USE SCENE DIRECTION", follow it EXACTLY:
- Use SCENE_DESCRIPTION for background (do NOT substitute modern city visuals!)
- Use PERSON_COSTUME for the person's outfit
- Follow ABSOLUTELY_NOT list strictly - zero tolerance for listed items
- Do NOT use modern city names internally - build scene from architectural descriptions only
` : ''}

${conceptAnalysis ? `
🎨 STYLE REFERENCE (CRITICAL - Match this style from user's reference image):
${conceptAnalysis}
You MUST apply this exact visual style, color palette, lighting, and atmosphere to the thumbnail.
The reference image is attached - LOOK AT IT and replicate its visual DNA.
` : ''}

${photoAnalysis ? `
👤 IMAGE ANALYSIS:
${photoAnalysis}
` : ''}

UPLOADED IMAGE INTEGRATION:
If the image contains a person:
- Face should take up 40-50% of the frame HEIGHT - make it BIG
- Transform clothing to match theme
- Add dramatic colored lighting matching the scene
- Keep face unchanged and recognizable
- NEVER crop the head - leave headroom above
If the image is not a person (screenshot, product, etc.):
- Use it as the primary visual element, enhanced with professional effects
- Integrate its colors, style, and elements into a compelling thumbnail

${optimizedText ? `
TEXT: "${optimizedText}"
- Place at the BOTTOM of the image (bottom 20-25%)
- MASSIVE bold font, 3D effect with strong shadow
- Thick black stroke (3-5px) for readability
- Glowing outline in the scene's dominant color
- Text should span most of the width
- NEVER cover the person's face with text

⚠️ CRITICAL - TEXT COLOR HARMONY:
1. Analyze scene colors → Choose COMPLEMENTARY text color
2. Dark scene → Bright text (white/yellow/gold)
3. Warm scene → Cool accent text (white + blue glow)
4. Text GLOW must use a color FROM the scene
5. Maximum contrast for 120px thumbnail readability
` : `
⚠️⚠️⚠️ ABSOLUTE ZERO TEXT RULE ⚠️⚠️⚠️
- There must be ABSOLUTELY NO TEXT, NO LETTERS, NO WORDS, NO NUMBERS anywhere on this image
- Do NOT add any title, watermark, logo text, game name, or ANY written content
- The image must be 100% visual only - person, scene, and effects
- If you add ANY text, the task has FAILED
`}

VISUAL STYLE: ${selectedTypo?.prompt || 'Ultra high contrast, vibrant colors, cinematic lighting'}

CINEMATIC QUALITY (NON-NEGOTIABLE):
- 3-point dramatic lighting with strong rim light separation
- Shallow depth of field, background bokeh, subject tack sharp
- Professional color grading - crushed blacks, controlled highlights
- Real skin texture with subsurface scattering, NO plastic/waxy AI look
- Volumetric atmosphere (god rays, particles, haze)
- Film grain aesthetic (ISO 400-800), subtle chromatic aberration on edges
- High dynamic range contrast that POPS at 120px thumbnail size

${extraRequest ? `ADDITIONAL: ${extraRequest}` : ''}

MAKE THIS THUMBNAIL IRRESISTIBLE TO CLICK!`;

      const optimizeParts = [
        { text: optimizedPrompt },
      ];
      if (base64Image) {
        optimizeParts.push({ inlineData: { mimeType: "image/png", data: base64Image } });
      }
      if (conceptBase64) {
        optimizeParts.push({ inlineData: { mimeType: "image/png", data: conceptBase64 } });
      }
      if (researchImageBase64) {
        optimizeParts.push({ inlineData: { mimeType: "image/png", data: researchImageBase64 } });
      }

      const payload = {
        contents: [{
          parts: optimizeParts
        }],
        generationConfig: {
          responseModalities: ['TEXT', 'IMAGE'],
          temperature: 1.0,
          imageConfig: {
            aspectRatio: '16:9'
          }
        },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
        ]
      };

      const result = await fetchWithRetry(
        `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      );

      const generatedBase64 = result.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;

      if (generatedBase64) {
        setResultImage(`data:image/png;base64,${generatedBase64}`);
        setIsOptimized(true); // Mark as optimized for score bonus
      } else {
        throw new Error('Optimizasyon başarısız.');
      }
    } catch (err) {
      setError(err.message || t('optimizationError'));
      setPreviousImage(null); // Reset on error
      setPreviousCtrScore(null);
    } finally {
      setIsOptimizing(false);
    }
  };

  // Yazısız yeniden oluştur - mevcut sahneyi koruyarak sadece yazıyı kaldır
  const regenerateWithoutText = async () => {
    if (!apiKey || !resultImage) return;

    const savedText = overlayText;
    setOverlayText('');

    setLoading(true);
    setError(null);

    try {
      // Mevcut result image'ı base64'e çevir (sahneyi korumak için)
      const currentImageBase64 = resultImage.replace(/^data:image\/\w+;base64,/, '');

      const prompt = `This is an existing YouTube thumbnail. Your task is to REMOVE ALL TEXT from this image while keeping EVERYTHING ELSE exactly the same.

⚠️ CRITICAL INSTRUCTIONS:
- REMOVE every piece of text, letters, words, numbers, and written content from this image
- KEEP the exact same scene, person, background, lighting, colors, effects, composition
- KEEP the exact same person position, facial expression, costume, and pose
- RECONSTRUCT the areas behind the text naturally - fill in with the surrounding background/scene
- The result should look like the text was never there
- Do NOT change the scene, do NOT change the person, do NOT change colors or lighting
- Do NOT add new text - the result must be 100% text-free
- MAINTAIN the same 1280x720 horizontal landscape orientation
- The only difference should be: text removed, background filled in naturally

Think of this as "inpainting" - remove text and fill with surrounding context.`;

      const payload = {
        contents: [{
          parts: [
            { text: prompt },
            { inlineData: { mimeType: "image/png", data: currentImageBase64 } }
          ]
        }],
        generationConfig: {
          responseModalities: ['TEXT', 'IMAGE'],
          temperature: 1.0,
          imageConfig: {
            aspectRatio: '16:9'
          }
        },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
        ]
      };

      const result = await fetchWithRetry(
        `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      );

      const generatedBase64 = result.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;

      if (generatedBase64) {
        setResultImage(`data:image/png;base64,${generatedBase64}`);
      } else {
        throw new Error('Yazı kaldırma başarısız oldu.');
      }
    } catch (err) {
      setError(err.message);
      setOverlayText(savedText);
    } finally {
      setLoading(false);
    }
  };

  // Revise image - kullanıcının talimatıyla mevcut görseli revize et
  const reviseImage = async () => {
    if (!apiKey || !resultImage || !revisionText.trim()) return;

    setIsRevising(true);
    setPreRevisionImage(resultImage);
    setError(null);

    try {
      const currentImageBase64 = resultImage.replace(/^data:image\/\w+;base64,/, '');

      const revisionPrompt = `You are a professional YouTube thumbnail designer. You have created the attached thumbnail and the user wants specific changes.

⚠️ ABSOLUTE REQUIREMENT - IMAGE ORIENTATION:
- THE IMAGE MUST BE HORIZONTAL/LANDSCAPE (width > height)
- DIMENSIONS: 1280 pixels WIDE x 720 pixels TALL (16:9 ratio)

🎯 USER'S REVISION REQUEST:
"${revisionText.trim()}"

📋 CRITICAL RULES:
- KEEP the same overall scene, composition, and subject
- ONLY modify what the user specifically asked for
- Maintain the same person (if present) with identical face, pose, and expression
- Keep the same general color scheme unless the user asks to change it
- Preserve all elements the user did NOT mention
- The result should feel like a refined version of the same thumbnail, NOT a completely new one
- Apply the requested changes naturally and professionally

Think of this as "editing" the existing thumbnail based on the user's feedback.`;

      const payload = {
        contents: [{
          parts: [
            { text: revisionPrompt },
            { inlineData: { mimeType: "image/png", data: currentImageBase64 } }
          ]
        }],
        generationConfig: {
          responseModalities: ['TEXT', 'IMAGE'],
          temperature: 1.0,
          imageConfig: {
            aspectRatio: '16:9'
          }
        },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
        ]
      };

      const result = await fetchWithRetry(
        `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      );

      const generatedBase64 = result.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;

      if (generatedBase64) {
        setResultImage(`data:image/png;base64,${generatedBase64}`);
        setRevisionText('');
      } else {
        throw new Error(t('revisionError'));
      }
    } catch (err) {
      setError(err.message || t('revisionError'));
      setPreRevisionImage(null);
    } finally {
      setIsRevising(false);
    }
  };

  const features = [
    {
      icon: <BrainCircuit className="w-6 h-6" />,
      title: t('aiPoweredDesign'),
      desc: t('aiPoweredDesignDesc')
    },
    {
      icon: <Layers className="w-6 h-6" />,
      title: t('smartPlacement'),
      desc: t('smartPlacementDesc')
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: t('ctrOptimization'),
      desc: t('ctrOptimizationDesc')
    },
    {
      icon: <Youtube className="w-6 h-6" />,
      title: t('youtubePreview'),
      desc: t('youtubePreviewDesc')
    }
  ];

  // Landing Page Section
  if (currentSection === 'landing') {
    return (
      <div className="relative min-h-screen bg-black overflow-hidden">
        {/* WebGL Shader Background */}
        <div className="fixed inset-0 z-0">
          <WebGLShader />
        </div>

        {/* Content Container */}
        <div className="relative z-10">
          {/* Navigation - Mobile Optimized */}
          <nav className="fixed top-0 left-0 right-0 z-50 p-3 sm:p-4">
            <div className="max-w-6xl mx-auto">
              <div className="bg-black/40 backdrop-blur-xl border border-[#27272a] rounded-xl sm:rounded-2xl px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between">
                <Logo size="sm" className="sm:hidden" />
                <Logo size="md" className="hidden sm:flex" />
                <div className="flex items-center gap-2">
                  {isPro ? (
                    <ProBadge size="md" />
                  ) : (
                    <button
                      onClick={() => setShowLicenseModal(true)}
                      className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 text-purple-400 text-xs font-bold px-3 py-1.5 rounded-lg transition-all border border-purple-500/20"
                    >
                      Pro
                    </button>
                  )}
                  <button
                    onClick={() => setCurrentSection('app')}
                    className="bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold px-3 sm:px-4 py-2 rounded-lg sm:rounded-full transition-all border border-white/10"
                  >
                    {t('tryFree')}
                  </button>
                </div>
              </div>
            </div>
          </nav>

          {/* Hero Section - Mobile Optimized */}
          <section className="min-h-screen flex items-center justify-center px-3 sm:px-4 pt-16 sm:pt-20">
            <div className="w-full max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="border border-[#27272a] p-1.5 sm:p-2 rounded-2xl sm:rounded-3xl bg-black/20 backdrop-blur-sm"
              >
                <div className="border border-[#27272a] rounded-xl sm:rounded-2xl py-8 sm:py-12 px-4 sm:px-6 md:px-12 overflow-hidden bg-black/40 backdrop-blur-xl">
                  {/* Status Badge */}
                  <div className="flex items-center justify-center gap-2 mb-6 sm:mb-8">
                    <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3 items-center justify-center">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"></span>
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                    </span>
                    <p className="text-[10px] sm:text-xs text-green-500">{t('workingWithGemini')}</p>
                  </div>

                  {/* Main Heading */}
                  <h1 className="text-white text-center text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter mb-2 sm:mb-4">
                    {t('createThumbnailHero')}
                  </h1>
                  <h2 className="text-white/80 text-center text-xl sm:text-2xl md:text-4xl lg:text-5xl font-extrabold tracking-tighter mb-4 sm:mb-6">
                    <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                      {t('inSeconds')}
                    </span>
                  </h2>

                  {/* Description */}
                  <p className="text-white/60 px-2 sm:px-4 text-center text-xs sm:text-sm md:text-base lg:text-lg max-w-2xl mx-auto mb-6 sm:mb-10">
                    {t('heroDesc')}
                  </p>

                  {/* CTA Button - Simplified for mobile */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                    <button
                      onClick={() => setCurrentSection('app')}
                      className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-black text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20"
                    >
                      {t('tryFree')}
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Scroll Indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="flex justify-center mt-6 sm:mt-8"
              >
                <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 text-white/30 animate-bounce" />
              </motion.div>
            </div>
          </section>

          {/* Features Section - Mobile Optimized */}
          <section className="py-12 sm:py-20 px-3 sm:px-4">
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="border border-[#27272a] p-1.5 sm:p-2 rounded-2xl sm:rounded-3xl bg-black/20 backdrop-blur-sm"
              >
                <div className="border border-[#27272a] rounded-xl sm:rounded-2xl py-8 sm:py-12 px-4 sm:px-6 bg-black/40 backdrop-blur-xl">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white text-center mb-2 sm:mb-4">
                    {t('whyThumbnailmax')}
                  </h2>
                  <p className="text-white/50 text-center text-xs sm:text-sm mb-8 sm:mb-12">
                    {t('whyDesc')}
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {features.map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="border border-[#27272a] rounded-lg sm:rounded-xl p-3 sm:p-5 hover:bg-white/5 transition-all group"
                      >
                        <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center text-blue-400 mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
                          {React.cloneElement(feature.icon, { className: 'w-4 h-4 sm:w-6 sm:h-6' })}
                        </div>
                        <h3 className="text-white font-bold text-xs sm:text-base mb-0.5 sm:mb-1">{feature.title}</h3>
                        <p className="text-white/50 text-[10px] sm:text-sm leading-tight">{feature.desc}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Pricing Section - Polar.sh */}
          <PricingSection onActivateLicense={() => setShowLicenseModal(true)} />

          {/* License Key Modal */}
          <LicenseKeyModal
            isOpen={showLicenseModal}
            onClose={() => setShowLicenseModal(false)}
            onActivated={handleLicenseActivated}
          />

          {/* CTA Section - Mobile Optimized */}
          <section className="py-12 sm:py-20 px-3 sm:px-4 pb-24 sm:pb-32">
            <div className="max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="border border-[#27272a] p-1.5 sm:p-2 rounded-2xl sm:rounded-3xl bg-black/20 backdrop-blur-sm"
              >
                <div className="border border-[#27272a] rounded-xl sm:rounded-2xl py-8 sm:py-12 px-4 sm:px-6 text-center bg-black/40 backdrop-blur-xl">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white mb-2 sm:mb-3">
                    {t('readyToStart')}
                  </h2>
                  <p className="text-white/60 mb-6 sm:mb-8 text-xs sm:text-sm md:text-base max-w-md mx-auto">
                    {t('readyDesc')}
                  </p>
                  <button
                    onClick={() => setCurrentSection('app')}
                    className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all flex items-center justify-center gap-2 mx-auto shadow-lg shadow-orange-500/20"
                  >
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                    {t('createThumbnail')}
                  </button>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Footer - Mobile Optimized */}
          <footer className="border-t border-[#27272a] py-4 sm:py-6 px-3 sm:px-4 bg-black/40 backdrop-blur-xl">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3">
              <div className="flex items-center gap-2 text-white/40 text-xs sm:text-sm">
                <LogoMinimal size={16} />
                <span>ThumbnailMAX — Gemini AI</span>
              </div>
              <p className="text-white/30 text-[10px] sm:text-xs text-center">
                {t('dataNotStored')}
              </p>
            </div>
          </footer>
        </div>
      </div>
    );
  }

  // Main App Section
  return (
    <>
      <AnimatePresence>
        {showYouTubeMockup && resultImage && (
          <YouTubeMockup
            thumbnail={resultImage}
            title={topic || overlayText}
            channelName={channelName}
            position={thumbnailPosition}
            onClose={() => setShowYouTubeMockup(false)}
          />
        )}
        {showEditor && resultImage && (
          <ThumbnailEditor
            thumbnail={resultImage}
            onClose={() => setShowEditor(false)}
            onSave={(editedImage) => {
              setResultImage(editedImage);
              setShowEditor(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* License Key Modal - App Section */}
      <LicenseKeyModal
        isOpen={showLicenseModal}
        onClose={() => setShowLicenseModal(false)}
        onActivated={handleLicenseActivated}
      />

      <div className="min-h-screen bg-[#08080a] text-slate-200 font-sans pb-24 lg:pb-6">
        {/* Header - Mobile Optimized */}
        <header className="sticky top-0 z-50 bg-[#08080a]/90 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => setCurrentSection('landing')}
              className="hover:opacity-80 transition-opacity"
            >
              <Logo size="sm" className="sm:hidden" />
              <Logo size="md" className="hidden sm:flex" />
            </button>

            <div className="flex items-center gap-2">
              {/* Plan Badge */}
              {isPro ? (
                <ProBadge size="sm" />
              ) : (
                <button
                  onClick={() => setShowLicenseModal(true)}
                  className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 px-2 sm:px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:border-purple-500/40 transition-colors"
                >
                  <span className="text-[10px] sm:text-xs font-bold text-purple-400">Pro</span>
                </button>
              )}

              {/* API Status - Compact on mobile */}
              {apiKey ? (
                <div className="bg-green-500/10 border border-green-500/20 px-2 sm:px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500" />
                  <span className="text-[10px] sm:text-xs font-bold text-green-400 hidden sm:inline">{t('connected')}</span>
                </div>
              ) : (
                <button
                  onClick={() => setShowMobileMenu(true)}
                  className="bg-amber-500/10 border border-amber-500/20 px-2 sm:px-3 py-1.5 rounded-full flex items-center gap-1.5"
                >
                  <Key className="w-3 h-3 text-amber-400" />
                  <span className="text-[10px] sm:text-xs font-bold text-amber-400">API Key</span>
                </button>
              )}

              {/* Settings Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              >
                <Menu className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Settings Drawer */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowMobileMenu(false)}
            >
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25 }}
                className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-[#101014] border-l border-white/10 overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-white">{t('settings')}</h2>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={toggleLang}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-1.5 text-xs font-bold text-slate-300"
                      >
                        {lang === 'tr' ? '🇬🇧 EN' : '🇹🇷 TR'}
                      </button>
                      <button onClick={() => setShowMobileMenu(false)} className="p-2 rounded-lg bg-white/5">
                        <X className="w-5 h-5 text-slate-400" />
                      </button>
                    </div>
                  </div>

                  {/* API Key */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 flex items-center gap-2">
                      <Key className="w-3 h-3" /> Gemini API Key
                    </label>
                    <div className="relative">
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        value={apiKey}
                        onChange={(e) => handleSaveApiKey(e.target.value)}
                        placeholder="AIzaSy..."
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 pr-10 text-sm font-mono"
                      />
                      <button
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {apiKey && <p className="text-xs text-green-500 flex items-center gap-1"><Check className="w-3 h-3" /> {t('saved')}</p>}
                  </div>

                  {/* Channel Name */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500">{t('channelName')}</label>
                    <input
                      type="text"
                      value={channelName}
                      onChange={(e) => setChannelName(e.target.value)}
                      placeholder={t('channelNamePlaceholder')}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm"
                    />
                  </div>

                  {/* Thumbnail Position */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500">{t('youtubePreviewPosition')}</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'top', label: t('posTop'), icon: '⬆️' },
                        { id: 'middle', label: t('posMid'), icon: '⏺️' },
                        { id: 'bottom', label: t('posBot'), icon: '⬇️' }
                      ].map((pos) => (
                        <button
                          key={pos.id}
                          onClick={() => setThumbnailPosition(pos.id)}
                          className={`p-2 rounded-lg border text-center transition-all text-xs ${
                            thumbnailPosition === pos.id
                              ? 'bg-blue-600 border-blue-500 text-white'
                              : 'bg-black/40 border-white/10 text-slate-400'
                          }`}
                        >
                          <span className="text-sm block">{pos.icon}</span>
                          <span className="font-bold">{pos.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* AI Model Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 flex items-center gap-2">
                      <BrainCircuit className="w-3 h-3" /> {t('aiModel')}
                    </label>
                    <div className="space-y-2">
                      {availableModels.map((model) => {
                        const isModelAllowed = TEST_MODE || currentPlan.limits.allowedModels.includes(model.id);
                        return (
                          <button
                            key={model.id}
                            onClick={() => isModelAllowed ? setSelectedModel(model.id) : setShowLicenseModal(true)}
                            className={`w-full p-3 rounded-lg border text-left transition-all relative ${
                              !isModelAllowed
                                ? 'bg-black/20 border-white/5 text-slate-600 opacity-60'
                                : selectedModel === model.id
                                ? 'bg-purple-600 border-purple-500 text-white'
                                : 'bg-black/40 border-white/10 text-slate-400 hover:border-white/20'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-bold">{model.name}</p>
                              {model.badge && (
                                <span className="text-[8px] bg-green-500 text-white px-1.5 py-0.5 rounded font-bold">
                                  {model.badge}
                                </span>
                              )}
                              {!isModelAllowed && <ProBadge size="xs" />}
                            </div>
                            <p className={`text-[10px] ${selectedModel === model.id ? 'text-purple-200' : 'text-slate-600'}`}>
                              {model.desc}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[10px] text-slate-600">
                      {t('experimentalModelNote')}
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
          {/* Result Section - Show at top when available */}
          {resultImage && !loading && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <div className="bg-[#101014] rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/5">
                {/* Before/After Comparison - Optimize */}
                {previousImage && !isOptimizing && !preRevisionImage && (
                  <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/10 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-blue-400" />
                        {t('beforeAfter')}
                      </span>
                      {previousCtrScore && ctrScore && (
                        <div className="flex items-center gap-1.5 bg-green-500/20 px-2 py-1 rounded-full">
                          <span className="text-slate-400 text-xs">{previousCtrScore.score}</span>
                          <ArrowRight className="w-3 h-3 text-green-400" />
                          <span className="text-green-400 font-bold text-sm">{ctrScore.score}</span>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <div>
                        <p className="text-[10px] text-slate-400 text-center mb-1">{t('previous')}</p>
                        <img src={previousImage} alt="Before" className="w-full rounded-lg opacity-70" />
                      </div>
                      <div>
                        <p className="text-[10px] text-green-400 text-center mb-1 font-bold">{t('optimized')}</p>
                        <img src={resultImage} alt="After" className="w-full rounded-lg border border-green-500/30" />
                      </div>
                    </div>
                    <button
                      onClick={() => { setPreviousImage(null); setPreviousCtrScore(null); }}
                      className="mt-2 text-xs text-slate-500 hover:text-white flex items-center gap-1 mx-auto"
                    >
                      <X className="w-3 h-3" /> {t('close')}
                    </button>
                  </div>
                )}

                {/* Before/After Comparison - Revision */}
                {preRevisionImage && !isRevising && (
                  <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0f3460] rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-cyan-500/20 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-cyan-400" />
                        {t('beforeAfter')}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <div>
                        <p className="text-[10px] text-slate-400 text-center mb-1">{t('revisionBeforeLabel')}</p>
                        <img src={preRevisionImage} alt="Before revision" className="w-full rounded-lg opacity-70" />
                      </div>
                      <div>
                        <p className="text-[10px] text-cyan-400 text-center mb-1 font-bold">{t('revisionAfterLabel')}</p>
                        <img src={resultImage} alt="After revision" className="w-full rounded-lg border border-cyan-500/30" />
                      </div>
                    </div>
                    <button
                      onClick={() => setPreRevisionImage(null)}
                      className="mt-2 text-xs text-slate-500 hover:text-white flex items-center gap-1 mx-auto"
                    >
                      <X className="w-3 h-3" /> {t('close')}
                    </button>
                  </div>
                )}

                {/* Main Result */}
                {(!previousImage || isOptimizing) && !preRevisionImage && (
                  <div className="relative rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 bg-black mb-4">
                    <img src={resultImage} alt="Result" className={`w-full h-auto ${isOptimizing || isRevising ? 'opacity-40' : ''}`} />
                    {(isOptimizing || isRevising) && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className={`w-10 h-10 border-3 ${isRevising ? 'border-cyan-500/30 border-t-cyan-500' : 'border-purple-500/30 border-t-purple-500'} rounded-full animate-spin mb-3`} />
                        <span className="text-white/80 text-sm font-medium">{isRevising ? t('revising') : t('optimizing')}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* CTR Score - Compact */}
                {ctrScore && (
                  <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-xl p-3 sm:p-4 border border-white/10 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-bold text-white">{t('ctrScore')}</span>
                      </div>
                      <span className={`text-2xl font-black ${ctrScore.likelihoodColor}`}>{ctrScore.score}</span>
                    </div>
                    <div className="h-2 bg-black/40 rounded-full overflow-hidden mb-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${ctrScore.score}%` }}
                        className={`h-full rounded-full ${
                          ctrScore.score >= 80 ? 'bg-green-500' : ctrScore.score >= 65 ? 'bg-emerald-500' : ctrScore.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                      />
                    </div>
                    <p className={`text-xs font-bold ${ctrScore.likelihoodColor}`}>{ctrScore.likelihood}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = resultImage;
                      link.download = `thumbnail-${Date.now()}.png`;
                      link.click();
                    }}
                    className="flex-1 sm:flex-none bg-white text-black px-4 sm:px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-100 transition-all text-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>{t('download')}</span>
                  </button>
                  <button
                    onClick={() => setShowYouTubeMockup(true)}
                    className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white px-4 sm:px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-sm"
                  >
                    <Youtube className="w-4 h-4" />
                    <span>{t('preview')}</span>
                  </button>
                  <button
                    onClick={() => setShowEditor(true)}
                    className="flex-1 sm:flex-none bg-purple-600 hover:bg-purple-700 text-white px-4 sm:px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-sm"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>{t('edit')}</span>
                  </button>
                  <button
                    onClick={makeMoreClickable}
                    disabled={isOptimizing}
                    className="flex-1 sm:flex-none bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 sm:px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-sm disabled:opacity-50"
                  >
                    {isOptimizing ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                    <span className="hidden sm:inline">{t('optimize')}</span>
                  </button>
                </div>

                {/* Revision Input */}
                <div className="mt-3 p-3 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-cyan-300">{t('reviseTitle')}</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={revisionText}
                      onChange={(e) => setRevisionText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && revisionText.trim()) reviseImage(); }}
                      placeholder={t('revisePlaceholder')}
                      disabled={isRevising}
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 disabled:opacity-50"
                    />
                    <button
                      onClick={reviseImage}
                      disabled={isRevising || !revisionText.trim()}
                      className="shrink-0 bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-500/30 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-all disabled:opacity-50"
                    >
                      {isRevising ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      <span className="hidden sm:inline">{t('reviseSend')}</span>
                    </button>
                  </div>
                </div>

                {/* Yazısız Yeniden Oluştur - İpucu */}
                <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-amber-300">
                      {t('aiAddedTextHint')}
                    </p>
                    <button
                      onClick={regenerateWithoutText}
                      disabled={loading}
                      className="shrink-0 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-50"
                    >
                      <RefreshCcw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                      {t('createWithoutText')}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="bg-[#101014] rounded-2xl p-8 border border-white/5 mb-6">
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  <div className="w-20 h-20 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin" />
                  <BrainCircuit className="w-8 h-8 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <p className="text-xl font-black text-white animate-pulse">{t('creating')}</p>
                <p className="text-sm text-blue-400 mt-1">{t('aiDesigningThumbnail')}</p>
              </div>
            </div>
          )}

          {/* Main Form - Collapsible Sections */}
          <div className="space-y-3 sm:space-y-4">

            {/* Essential: Photo + Topic */}
            <CollapsibleSection
              title={t('photoAndTopic')}
              icon={<Upload className="w-4 h-4" />}
              defaultOpen={true}
              badge={image && topic ? "✓" : null}
            >
              {/* Photo Upload */}
              <div
                onClick={() => fileInputRef.current.click()}
                className={`border-2 border-dashed rounded-xl p-4 cursor-pointer transition-all ${
                  image ? 'border-blue-500/40 bg-blue-500/5' : 'border-white/10 bg-black/40 hover:bg-white/5'
                }`}
              >
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                {image ? (
                  <div className="flex items-center gap-4">
                    <img src={image} className="w-16 h-16 rounded-lg object-cover" alt="Ref" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-blue-400">{t('photoUploaded')}</p>
                      <p className="text-xs text-slate-500">{t('tapToChange')}</p>
                    </div>
                    {!photoAnalysis && (
                      <button
                        onClick={(e) => { e.stopPropagation(); analyzePhoto(); }}
                        disabled={isAnalyzingPhoto || !apiKey}
                        className="bg-purple-500/20 border border-purple-500/30 text-purple-300 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1 disabled:opacity-50"
                      >
                        {isAnalyzingPhoto ? <RefreshCcw className="w-3 h-3 animate-spin" /> : <Eye className="w-3 h-3" />}
                        {t('analyze')}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Upload className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                    <p className="text-sm font-bold text-slate-400">{t('uploadPhoto')}</p>
                    <p className="text-xs text-slate-600 mt-1">{t('faceInThumbnail')}</p>
                  </div>
                )}
              </div>

              {/* Photo Analysis Result - sadece tamamlandı göstergesi */}
              {photoAnalysis && (
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl px-3 py-2 flex items-center gap-2">
                  <BrainCircuit className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-xs font-bold text-purple-400">{t('aiAnalysis')} ✓</span>
                </div>
              )}

              {/* Topic Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500">{t('videoTopic')} *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => { setTopic(e.target.value); setTopicResearch(null); setResearchImageBase64(null); setResearchImageUrl(null); }}
                    placeholder={t('topicPlaceholder')}
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/40"
                  />
                  <button
                    onClick={researchTopic}
                    disabled={!topic || !apiKey || isResearchingTopic}
                    className="bg-amber-500/20 border border-amber-500/30 text-amber-300 px-3 rounded-xl flex items-center gap-1 hover:bg-amber-500/30 transition-all disabled:opacity-30 text-xs font-bold"
                  >
                    {isResearchingTopic ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Topic Research Results */}
              {topicResearch && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-amber-400 flex items-center gap-1">
                      <Gamepad2 className="w-3 h-3" /> {t('aiResearch')}: {topic}
                    </p>
                    <button onClick={() => { setTopicResearch(null); setResearchImageBase64(null); setResearchImageUrl(null); }} className="text-slate-500 hover:text-white">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-[200px] overflow-y-auto">
                    {topicResearch}
                  </div>
                  {researchImageBase64 && (
                    <div className="flex items-center gap-2 pt-1 border-t border-amber-500/20">
                      <img
                        src={`data:image/png;base64,${researchImageBase64}`}
                        alt="Reference"
                        className="w-16 h-16 object-cover rounded-lg border border-amber-500/30"
                      />
                      <p className="text-[10px] text-cyan-400 flex-1">
                        Referans görsel bulundu — thumbnail üretiminde kullanılacak
                      </p>
                      <button onClick={() => { setResearchImageBase64(null); setResearchImageUrl(null); }} className="text-slate-500 hover:text-white">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <p className="text-[10px] text-green-400 flex items-center gap-1 pt-1 border-t border-amber-500/20">
                    <Check className="w-3 h-3" /> {t('researchWillBeUsed')}
                  </p>
                </div>
              )}

              {/* Overlay Text - Optional */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 flex items-center gap-2">
                  {t('thumbnailText')}
                  <span className="text-[10px] text-slate-600 font-normal">{t('optional')}</span>
                </label>
                <input
                  type="text"
                  value={overlayText}
                  onChange={(e) => setOverlayText(e.target.value)}
                  placeholder={t('textPlaceholder')}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-blue-500/40"
                />
                <p className="text-[10px] text-slate-600">
                  {overlayText ? t('lessThan3Words') : t('emptyMeansNoText')}
                </p>
              </div>
            </CollapsibleSection>

            {/* Style Selection */}
            <CollapsibleSection
              title={t('styleSelection')}
              icon={<Palette className="w-4 h-4" />}
              badge={selectedArchetype ? CTR_ARCHETYPES.find(a => a.id === selectedArchetype)?.icon : null}
            >
              {/* CTR Archetypes - Categorized Grid */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500">{t('ctrArchetype')}</label>
                {/* Category Tabs */}
                <div className="flex gap-1 bg-black/30 rounded-lg p-1">
                  {[
                    { id: 'all', label: t('all'), icon: '🎯' },
                    { id: 'universal', label: lang === 'tr' ? 'Genel' : 'General', icon: '🌐' },
                    { id: 'gaming', label: t('gaming'), icon: '🎮' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setArchetypeTab(tab.id)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-bold transition-all ${
                        archetypeTab === tab.id
                          ? 'bg-white/10 text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      <span>{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CTR_ARCHETYPES
                    .filter(arch => archetypeTab === 'all' || arch.category === archetypeTab)
                    .map((arch) => {
                    const isArchAllowed = TEST_MODE || currentPlan.limits.allowedArchetypes.includes(arch.id);
                    return (
                      <button
                        key={arch.id}
                        onClick={() => isArchAllowed ? setSelectedArchetype(arch.id) : setShowLicenseModal(true)}
                        className={`p-3 rounded-xl border transition-all text-left relative ${
                          !isArchAllowed
                            ? 'bg-black/20 border-white/5 text-slate-600 opacity-60'
                            : selectedArchetype === arch.id
                            ? 'bg-orange-600 border-orange-500 text-white'
                            : 'bg-black/40 border-white/10 text-slate-400 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{arch.icon}</span>
                          <span className="text-xs font-bold truncate">{t(arch.nameKey)}</span>
                          {!isArchAllowed && <ProBadge size="xs" />}
                        </div>
                        <span className={`text-[10px] font-bold ${selectedArchetype === arch.id ? 'text-green-300' : 'text-green-500/60'}`}>
                          +{arch.ctrBoost}% CTR
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Typography - Horizontal Scroll on Mobile */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500">{t('textStyle')}</label>
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 sm:overflow-visible">
                  {typographyOptions.map((opt) => {
                    const isTypoAllowed = TEST_MODE || currentPlan.limits.allowedTypoStyles.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        onClick={() => isTypoAllowed ? setTypoStyle(opt.id) : setShowLicenseModal(true)}
                        className={`flex-shrink-0 w-40 sm:w-auto p-3 rounded-xl border transition-all text-left ${
                          !isTypoAllowed
                            ? 'bg-black/20 border-white/5 text-slate-600 opacity-60'
                            : typoStyle === opt.id
                            ? 'bg-blue-600 border-blue-500 text-white'
                            : 'bg-black/40 border-white/10 text-slate-400 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold truncate">{opt.name}</p>
                          {!isTypoAllowed && <ProBadge size="xs" />}
                        </div>
                        <p className={`text-[10px] mt-0.5 line-clamp-1 ${typoStyle === opt.id ? 'text-blue-100' : 'text-slate-600'}`}>
                          {opt.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </CollapsibleSection>

            {/* Advanced Options */}
            <CollapsibleSection
              title={t('advancedOptions')}
              icon={<Sparkles className="w-4 h-4" />}
            >
              {/* Concept Description */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500">{t('conceptDescription')}</label>
                <textarea
                  value={topicDescription}
                  onChange={(e) => setTopicDescription(e.target.value)}
                  placeholder={topicResearch ? t('conceptPlaceholderWithResearch') : t('conceptPlaceholderNoResearch')}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/40 min-h-[60px]"
                />
              </div>

              {/* Concept/Reference Image */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500">{t('referenceImage')}</label>
                <div
                  onClick={() => conceptInputRef.current.click()}
                  className={`border-2 border-dashed rounded-xl p-3 cursor-pointer transition-all ${
                    conceptImage ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-white/10 bg-black/40'
                  }`}
                >
                  <input type="file" ref={conceptInputRef} onChange={handleConceptUpload} className="hidden" accept="image/*" />
                  {conceptImage ? (
                    <div className="flex items-center gap-3">
                      <img src={conceptImage} className="w-12 h-12 rounded-lg object-cover" alt="Concept" />
                      <div className="flex-1">
                        <p className="text-xs font-bold text-emerald-400">{t('uploaded')}</p>
                        <p className="text-[10px] text-slate-600">{t('tapToChange')}</p>
                      </div>
                      {!conceptAnalysis && (
                        <button
                          onClick={(e) => { e.stopPropagation(); analyzeConceptImage(); }}
                          disabled={isAnalyzingConcept || !apiKey}
                          className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 px-3 py-2 rounded-lg text-xs font-bold disabled:opacity-50"
                        >
                          {isAnalyzingConcept ? <RefreshCcw className="w-3 h-3 animate-spin" /> : t('analyze')}
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4 opacity-40">
                      <ImageIcon className="w-6 h-6 mx-auto mb-1" />
                      <p className="text-xs">{t('uploadExample')}</p>
                    </div>
                  )}
                </div>

                {conceptAnalysis && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2 flex items-center gap-2">
                    <BrainCircuit className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-400">{t('referenceImage')} {t('analyze')} ✓</span>
                  </div>
                )}
              </div>

              {/* Extra Request */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500">{t('extraRequest')}</label>
                <textarea
                  value={extraRequest}
                  onChange={(e) => setExtraRequest(e.target.value)}
                  placeholder={t('extraRequestPlaceholder')}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/40 min-h-[50px]"
                />
              </div>
            </CollapsibleSection>

            {/* Desktop Generate Button */}
            <div className="hidden lg:block">
              <button
                onClick={generateThumbnail}
                disabled={loading || !topic || !apiKey}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-black py-4 rounded-2xl transition-all disabled:opacity-30 flex items-center justify-center gap-3"
              >
                {loading ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                {loading ? t('creating') : t('createThumbnail')}
              </button>
              {!isPro && (
                <div className="flex items-center justify-between mt-2 px-1">
                  <UsageBadge remaining={getRemainingGenerations(currentPlan)} total={currentPlan.limits.dailyGenerations} />
                  <button
                    onClick={() => setShowLicenseModal(true)}
                    className="text-purple-400 hover:text-purple-300 text-[10px] font-medium transition-colors"
                  >
                    {t('unlimitedWithPro')}
                  </button>
                </div>
              )}
            </div>

            {error && <p className="text-sm text-red-500 font-bold text-center bg-red-500/10 border border-red-500/20 rounded-xl p-3">{error}</p>}

            {/* Empty State - Desktop Only */}
            {!resultImage && !loading && (
              <div className="hidden lg:block bg-[#101014] rounded-2xl p-8 border border-white/5">
                <div className="text-center opacity-30">
                  <Monitor className="w-16 h-16 mx-auto mb-3" />
                  <p className="text-lg font-bold">{t('studioReady')}</p>
                  <p className="text-sm text-slate-500">{t('fillFormAndCreate')}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Floating Action Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#08080a] via-[#08080a] to-transparent lg:hidden">
          {!isPro && (
            <div className="flex items-center justify-between mb-2 px-1">
              <UsageBadge remaining={getRemainingGenerations(currentPlan)} total={currentPlan.limits.dailyGenerations} />
              <button
                onClick={() => setShowLicenseModal(true)}
                className="text-purple-400 hover:text-purple-300 text-[10px] font-medium transition-colors"
              >
                {t('unlimitedWithPro')}
              </button>
            </div>
          )}
          <button
            onClick={generateThumbnail}
            disabled={loading || !topic || !apiKey}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-black py-4 rounded-2xl transition-all disabled:opacity-30 flex items-center justify-center gap-3 shadow-lg shadow-blue-500/20"
          >
            {loading ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
            {loading ? t('creating') : t('createThumbnail')}
          </button>
        </div>
      </div>
    </>
  );
};

export default App;
