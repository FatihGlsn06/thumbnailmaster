import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Check, Star, Zap, Crown, Sparkles, ArrowRight,
  Shield, Infinity as InfinityIcon, X
} from 'lucide-react';
import {
  PLANS,
  TEST_MODE,
  getProMonthlyCheckoutUrl,
  getProYearlyCheckoutUrl,
} from '@/lib/polar';

const PricingSection = ({ onActivateLicense }) => {
  // Test modunda pricing section gizle
  if (TEST_MODE) return null;
  const [billingPeriod, setBillingPeriod] = useState('yearly'); // 'monthly' | 'yearly'

  const yearlyDiscount = Math.round(
    (1 - PLANS.pro.yearlyPrice / (PLANS.pro.monthlyPrice * 12)) * 100
  );

  return (
    <section className="py-12 sm:py-20 px-3 sm:px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="border border-[#27272a] p-1.5 sm:p-2 rounded-2xl sm:rounded-3xl bg-black/20 backdrop-blur-sm"
        >
          <div className="border border-[#27272a] rounded-xl sm:rounded-2xl py-8 sm:py-12 px-4 sm:px-6 bg-black/40 backdrop-blur-xl">
            {/* Header */}
            <div className="text-center mb-8 sm:mb-12">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 mb-4">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs text-amber-400 font-medium">Polar.sh ile Güvenli Ödeme</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-2 sm:mb-3">
                Planını Seç
              </h2>
              <p className="text-white/50 text-xs sm:text-sm max-w-md mx-auto">
                Ücretsiz başla, Pro ile sınırları kaldır
              </p>

              {/* Billing Toggle */}
              <div className="flex items-center justify-center gap-3 mt-6">
                <span className={`text-sm font-medium transition-colors ${billingPeriod === 'monthly' ? 'text-white' : 'text-white/40'}`}>
                  Aylık
                </span>
                <button
                  onClick={() => setBillingPeriod(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
                  className="relative w-14 h-7 bg-white/10 rounded-full border border-white/10 transition-colors"
                >
                  <motion.div
                    className="absolute top-0.5 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                    animate={{ left: billingPeriod === 'yearly' ? '30px' : '2px' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
                <span className={`text-sm font-medium transition-colors ${billingPeriod === 'yearly' ? 'text-white' : 'text-white/40'}`}>
                  Yıllık
                </span>
                {billingPeriod === 'yearly' && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-green-500/20 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-500/30"
                  >
                    %{yearlyDiscount} Tasarruf
                  </motion.span>
                )}
              </div>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto">
              {/* Free Plan */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="border border-[#27272a] rounded-xl sm:rounded-2xl p-5 sm:p-6 hover:border-white/10 transition-all"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white/60" />
                  </div>
                  <h3 className="text-white font-bold text-lg">Ücretsiz</h3>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black text-white">$0</span>
                    <span className="text-white/40 text-sm">/sonsuza dek</span>
                  </div>
                  <p className="text-white/40 text-xs mt-1">Kredi kartı gerektirmez</p>
                </div>

                <ul className="space-y-2.5 mb-6">
                  {PLANS.free.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-white/30 mt-0.5 flex-shrink-0" />
                      <span className="text-white/60 text-xs sm:text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  disabled
                  className="w-full bg-white/5 text-white/40 font-medium text-sm py-3 rounded-xl border border-white/5 cursor-default"
                >
                  Mevcut Plan
                </button>
              </motion.div>

              {/* Pro Plan */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative border-2 border-purple-500/30 rounded-xl sm:rounded-2xl p-5 sm:p-6 bg-gradient-to-b from-purple-500/5 to-transparent hover:border-purple-500/50 transition-all"
              >
                {/* Popular Badge */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    EN POPÜLER
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                    <Crown className="w-4 h-4 text-purple-400" />
                  </div>
                  <h3 className="text-white font-bold text-lg">Pro</h3>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black text-white">
                      ${billingPeriod === 'monthly' ? PLANS.pro.monthlyPrice : (PLANS.pro.yearlyPrice / 12).toFixed(2)}
                    </span>
                    <span className="text-white/40 text-sm">/ay</span>
                  </div>
                  {billingPeriod === 'yearly' && (
                    <p className="text-purple-400 text-xs mt-1">
                      Yılda ${PLANS.pro.yearlyPrice} faturalanır
                    </p>
                  )}
                  {billingPeriod === 'monthly' && (
                    <p className="text-white/40 text-xs mt-1">
                      Aylık faturalanır
                    </p>
                  )}
                </div>

                <ul className="space-y-2.5 mb-6">
                  {PLANS.pro.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                      <span className="text-white/80 text-xs sm:text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={billingPeriod === 'monthly' ? getProMonthlyCheckoutUrl() : getProYearlyCheckoutUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold text-sm py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20"
                >
                  Pro'ya Yükselt
                  <ArrowRight className="w-4 h-4" />
                </a>

                {/* Security Note */}
                <div className="flex items-center justify-center gap-1.5 mt-3">
                  <Shield className="w-3 h-3 text-white/30" />
                  <span className="text-white/30 text-[10px]">256-bit SSL ile güvenli ödeme</span>
                </div>
              </motion.div>
            </div>

            {/* License Key Activation */}
            <div className="mt-8 text-center">
              <p className="text-white/30 text-xs mb-2">Zaten bir lisans anahtarınız var mı?</p>
              <button
                onClick={onActivateLicense}
                className="text-purple-400 hover:text-purple-300 text-xs font-medium underline underline-offset-2 transition-colors"
              >
                Lisans Anahtarını Etkinleştir
              </button>
            </div>

            {/* Trust Badges */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              <div className="flex items-center gap-1.5 text-white/20">
                <Shield className="w-3.5 h-3.5" />
                <span className="text-[10px] sm:text-xs">Güvenli Ödeme</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/20">
                <X className="w-3.5 h-3.5" />
                <span className="text-[10px] sm:text-xs">İstediğin Zaman İptal</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/20">
                <Star className="w-3.5 h-3.5" />
                <span className="text-[10px] sm:text-xs">7 Gün Para İade</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
