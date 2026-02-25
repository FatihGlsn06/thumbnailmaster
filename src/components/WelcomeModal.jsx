import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Mail, Key, Sparkles, CheckCircle, ArrowRight, X } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

const WelcomeModal = ({ isOpen, onClose, onActivateLicense }) => {
  const { t } = useI18n();

  const steps = [
    {
      icon: Mail,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
      title: t('welcomeCheckEmail'),
      desc: t('welcomeCheckEmailDesc'),
    },
    {
      icon: Key,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20',
      title: t('welcomeActivateKey'),
      desc: t('welcomeActivateKeyDesc'),
    },
    {
      icon: Sparkles,
      color: 'text-green-400',
      bg: 'bg-green-500/10 border-green-500/20',
      title: t('welcomeStartUsing'),
      desc: t('welcomeStartUsingDesc'),
    },
  ];

  const features = [
    t('welcomeFeat1'),
    t('welcomeFeat2'),
    t('welcomeFeat3'),
    t('welcomeFeat4'),
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-[#0a0a0b] border border-[#27272a] rounded-2xl overflow-hidden"
          >
            {/* Gradient top bar */}
            <div className="h-1 w-full bg-gradient-to-r from-purple-500 via-blue-500 to-green-500" />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/30 hover:text-white/70 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 sm:p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring', damping: 15 }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 mb-4"
                >
                  <Crown className="w-8 h-8 text-purple-400" />
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-2xl sm:text-3xl font-black text-white mb-2"
                >
                  {t('welcomeTitle')}
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-white/50 text-sm leading-relaxed"
                >
                  {t('welcomeSubtitle')}
                </motion.p>
              </div>

              {/* Steps */}
              <div className="space-y-3 mb-6">
                {steps.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + i * 0.08 }}
                    className={`flex items-start gap-3 p-3 rounded-xl border ${step.bg}`}
                  >
                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${step.bg}`}>
                      <step.icon className={`w-4 h-4 ${step.color}`} />
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">{step.title}</p>
                      <p className="text-white/40 text-xs mt-0.5">{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pro features list */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-br from-purple-500/5 to-blue-500/5 border border-purple-500/10 rounded-xl p-4 mb-6"
              >
                <p className="text-white/60 text-xs font-medium mb-2">{t('welcomeProFeatures')}</p>
                <div className="grid grid-cols-1 gap-1.5">
                  {features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                      <span className="text-white/70 text-xs">{feat}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Action buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <button
                  onClick={() => {
                    onClose();
                    onActivateLicense();
                  }}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold text-sm py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20"
                >
                  <Key className="w-4 h-4" />
                  {t('welcomeActivateNow')}
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={onClose}
                  className="flex-1 sm:flex-none sm:px-5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white font-medium text-sm py-3 rounded-xl border border-white/5 hover:border-white/10 transition-all"
                >
                  {t('welcomeGoToApp')}
                </button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeModal;
