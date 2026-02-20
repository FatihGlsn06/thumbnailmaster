import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, Check, AlertTriangle, Loader2, Crown, Shield } from 'lucide-react';
import {
  validateLicenseKey,
  activateLicenseKey,
  saveLicenseKey,
  removeLicenseKey,
  getLicenseKey,
  getCachedLicenseStatus,
} from '@/lib/polar';
import { useI18n } from '@/lib/i18n';

const LicenseKeyModal = ({ isOpen, onClose, onActivated }) => {
  const { t } = useI18n();
  const [licenseKey, setLicenseKey] = useState(getLicenseKey());
  const [status, setStatus] = useState('idle'); // idle | validating | success | error
  const [errorMessage, setErrorMessage] = useState('');
  const existingStatus = getCachedLicenseStatus();

  const handleValidate = async () => {
    if (!licenseKey.trim()) {
      setErrorMessage(t('enterLicenseKey'));
      setStatus('error');
      return;
    }

    setStatus('validating');
    setErrorMessage('');

    const validation = await validateLicenseKey(licenseKey);

    if (!validation.valid) {
      setErrorMessage(validation.error || t('invalidLicenseKey'));
      setStatus('error');
      return;
    }

    const activation = await activateLicenseKey(licenseKey);

    if (!activation.success) {
      saveLicenseKey(licenseKey.trim());
    }

    setStatus('success');

    setTimeout(() => {
      onActivated?.('pro');
      onClose();
    }, 1500);
  };

  const handleDeactivate = () => {
    removeLicenseKey();
    setLicenseKey('');
    setStatus('idle');
    onActivated?.('free');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-md border border-[#27272a] rounded-2xl bg-black/90 backdrop-blur-xl p-6 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                <Key className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-white font-bold text-base">{t('licenseKey')}</h3>
                <p className="text-white/40 text-xs">{t('activateProPlan')}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/40 hover:text-white/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Existing active license */}
          {existingStatus?.valid && status === 'idle' && (
            <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
              <div className="flex items-center gap-2 mb-1">
                <Crown className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm font-medium">{t('proPlanActive')}</span>
              </div>
              <p className="text-green-400/60 text-xs">
                {t('licenseVerified')}
              </p>
              <button
                onClick={handleDeactivate}
                className="mt-2 text-red-400/60 hover:text-red-400 text-xs underline transition-colors"
              >
                {t('disableLicense')}
              </button>
            </div>
          )}

          {/* License Key Input */}
          <div className="mb-4">
            <label className="block text-white/60 text-xs font-medium mb-2">
              {t('licenseKey')}
            </label>
            <input
              type="text"
              value={licenseKey}
              onChange={(e) => {
                setLicenseKey(e.target.value);
                if (status === 'error') setStatus('idle');
              }}
              placeholder="XXXX-XXXX-XXXX-XXXX"
              className="w-full bg-white/5 border border-[#27272a] rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all font-mono tracking-wider"
              disabled={status === 'validating' || status === 'success'}
            />
          </div>

          {/* Error Message */}
          {status === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2"
            >
              <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-red-400 text-xs">{errorMessage}</p>
            </motion.div>
          )}

          {/* Success Message */}
          {status === 'success' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 flex items-start gap-2"
            >
              <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-green-400 text-sm font-medium">{t('proPlanActivated')}</p>
                <p className="text-green-400/60 text-xs mt-0.5">{t('allProFeaturesUnlocked')}</p>
              </div>
            </motion.div>
          )}

          {/* Activate Button */}
          <button
            onClick={handleValidate}
            disabled={status === 'validating' || status === 'success' || !licenseKey.trim()}
            className={`w-full font-bold text-sm py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
              status === 'success'
                ? 'bg-green-500/20 text-green-400 border border-green-500/20'
                : status === 'validating'
                ? 'bg-white/5 text-white/40 border border-white/5 cursor-wait'
                : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg shadow-purple-500/20'
            }`}
          >
            {status === 'validating' && (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('validating')}
              </>
            )}
            {status === 'success' && (
              <>
                <Check className="w-4 h-4" />
                {t('activated')}
              </>
            )}
            {(status === 'idle' || status === 'error') && (
              <>
                <Key className="w-4 h-4" />
                {t('activateLicense')}
              </>
            )}
          </button>

          {/* Help Text */}
          <div className="mt-4 flex items-center justify-center gap-1.5">
            <Shield className="w-3 h-3 text-white/20" />
            <p className="text-white/20 text-[10px]">
              {t('licenseEmailNote')}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LicenseKeyModal;
