import React from 'react';
import { Crown, Lock } from 'lucide-react';

/**
 * Pro badge - özelliğin Pro gerektirdiğini gösterir
 */
export const ProBadge = ({ size = 'sm', className = '' }) => {
  const sizes = {
    xs: 'text-[8px] px-1 py-0.5 gap-0.5',
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2 py-1 gap-1',
  };

  return (
    <span className={`inline-flex items-center bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-400 font-bold rounded-full border border-purple-500/30 ${sizes[size]} ${className}`}>
      <Crown className={size === 'xs' ? 'w-2 h-2' : size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
      PRO
    </span>
  );
};

/**
 * Pro lock overlay - kilitli özellikler üzerine
 */
export const ProLockOverlay = ({ onClick, message = 'Pro özelliği' }) => (
  <div
    onClick={onClick}
    className="absolute inset-0 bg-black/60 backdrop-blur-[2px] rounded-lg sm:rounded-xl flex flex-col items-center justify-center cursor-pointer z-10 group hover:bg-black/70 transition-all"
  >
    <Lock className="w-4 h-4 text-purple-400 mb-1 group-hover:scale-110 transition-transform" />
    <span className="text-purple-400 text-[10px] font-medium">{message}</span>
    <ProBadge size="xs" className="mt-1" />
  </div>
);

/**
 * Günlük kullanım limiti göstergesi
 */
export const UsageBadge = ({ remaining, total }) => {
  if (remaining === Infinity) {
    return (
      <span className="inline-flex items-center text-[10px] text-green-400/60 gap-1">
        <Crown className="w-2.5 h-2.5" />
        Sınırsız
      </span>
    );
  }

  const percentage = (remaining / total) * 100;
  const colorClass = percentage > 50 ? 'text-green-400' : percentage > 20 ? 'text-amber-400' : 'text-red-400';

  return (
    <span className={`inline-flex items-center text-[10px] ${colorClass} gap-1`}>
      {remaining}/{total} kalan
    </span>
  );
};

export default ProBadge;
