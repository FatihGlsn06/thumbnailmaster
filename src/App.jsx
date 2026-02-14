import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Image as ImageIcon, Sparkles, Download, RefreshCcw,
  Type, BrainCircuit, Check, Monitor, Wand2, AlertTriangle, Palette, Eye,
  Layers, Key, EyeOff, Zap, Play, Youtube, Edit3,
  ChevronDown, Star, ArrowRight, MoreVertical, Search, Bell, Mic,
  Menu, Home, Compass, PlaySquare, Clock, ThumbsUp, Film, Gamepad2,
  Music, Radio, Trophy, Lightbulb, Shirt, X, User, Smartphone, Grid3X3,
  TrendingUp, Target, MousePointer, BarChart3
} from 'lucide-react';
import { WebGLShader } from '@/components/ui/web-gl-shader';
import { LiquidButton, MetalButton } from '@/components/ui/liquid-glass-button';
import { Logo, LogoIcon, LogoMinimal } from '@/components/ui/logo';
import ThumbnailEditor from '@/components/ThumbnailEditor';

// HIGH-CTR THUMBNAIL ARCHETYPES
const CTR_ARCHETYPES = [
  {
    id: 'shocked_threat',
    name: 'Şok Yüz + Tehdit',
    desc: 'Büyük yüz ifadesi + arkada tehlike',
    icon: '😱',
    ctrBoost: 25,
    prompt: 'SHOCKED FACE + THREAT COMPOSITION: The person\'s face must be LARGE - taking up 40-50% of the frame height. Face should be centered or slightly below center. Shocked/scared expression with wide eyes and open mouth. Threatening creatures or elements surrounding the person from all sides. The threats should frame the face but not cover it. Dramatic colored lighting (green, red, blue glow) illuminating the face. Text overlay at the BOTTOM of the image, large and bold.',
    bestFor: ['Horror', 'FPS', 'Boss fights', 'Jump scares']
  },
  {
    id: 'power_fantasy',
    name: 'Güç Fantezisi',
    desc: 'Dominant poz, aura efekti',
    icon: '⚔️',
    ctrBoost: 22,
    prompt: 'POWER FANTASY COMPOSITION: The person should be prominent - taking up 40-50% of the frame. Centered or slightly off-center positioning. Confident, powerful expression. Glowing aura or energy effect around the subject. Epic background but blurred/subdued to make person pop. Heroic lighting with rim light. Text overlay at the BOTTOM, large and bold.',
    bestFor: ['RPG', 'ARPG', 'Progression', 'Build showcases']
  },
  {
    id: 'mystery_object',
    name: 'Gizemli Nesne',
    desc: 'Tek ilginç obje, merak uyandırıcı',
    icon: '❓',
    ctrBoost: 20,
    prompt: 'MYSTERY OBJECT COMPOSITION: Person\'s face large (35-45% of frame) showing curious/intrigued expression. A strange glowing object near them drawing attention. The person should be looking at or reacting to the mysterious object. Spotlight effect on the object. Text overlay at the BOTTOM, large and bold.',
    bestFor: ['Indie games', 'Mods', 'Weird mechanics', 'Easter eggs']
  },
  {
    id: 'almost_fail',
    name: 'Neredeyse Başarısız',
    desc: 'HP düşük, kritik an donmuş',
    icon: '💀',
    ctrBoost: 23,
    prompt: 'ALMOST-FAIL COMPOSITION: Person\'s face large (40-50% of frame) showing panic/stress expression. Critical moment frozen - danger approaching. Red warning tints or indicators visible. The person should look like they\'re about to lose. Tension should be palpable. Text overlay at the BOTTOM, large and bold.',
    bestFor: ['Clutch moments', 'Speedruns', 'Challenge runs', 'PvP']
  },
  {
    id: 'scale_contrast',
    name: 'Ölçek Kontrasti',
    desc: 'Küçük oyuncu vs DEV düşman',
    icon: '🐜',
    ctrBoost: 21,
    prompt: 'SCALE CONTRAST COMPOSITION: Show extreme size contrast. Either the person is small facing a MASSIVE threat that fills the background, OR the person\'s face is large (40-50%) with tiny enemies swarming around them. The scale difference must be immediately obvious and dramatic. Text overlay at the BOTTOM, large and bold.',
    bestFor: ['Boss fights', 'Mods', 'Glitches', 'Size comparison']
  },
  {
    id: 'before_after',
    name: 'Önce / Sonra',
    desc: 'İlerleme karşılaştırması',
    icon: '📊',
    ctrBoost: 18,
    prompt: 'BEFORE/AFTER COMPOSITION: Clear left/right split showing transformation. Person can appear on both sides or just one side (40-50% of frame). Left side should look weak/poor/struggling. Right side should look powerful/rich/successful. Clear visual arrow or divider between sides. Text overlay at the BOTTOM, large and bold.',
    bestFor: ['Builds', 'Economy', 'Strategy', 'Tutorials']
  }
];

// CTR Score Calculator
const calculateCTRScore = (settings) => {
  let score = 50; // Base score
  const issues = [];
  const boosts = [];

  // Archetype bonus
  if (settings.archetype) {
    const arch = CTR_ARCHETYPES.find(a => a.id === settings.archetype);
    if (arch) {
      score += arch.ctrBoost;
      boosts.push({ text: `${arch.name} arketipi`, value: `+${arch.ctrBoost}` });
    }
  }

  // Topic description bonus
  if (settings.topicDescription && settings.topicDescription.length > 50) {
    score += 10;
    boosts.push({ text: 'Detaylı konsept açıklaması', value: '+10' });
  } else if (!settings.topicDescription) {
    score -= 5;
    issues.push({ text: 'Konsept açıklaması eksik', fix: 'Konsept açıklaması ekleyin', impact: 5 });
  }

  // Overlay text check
  if (settings.overlayText) {
    const words = settings.overlayText.trim().split(/\s+/).length;
    if (words <= 3) {
      score += 8;
      boosts.push({ text: 'Kısa ve etkili yazı', value: '+8' });
    } else if (words > 5) {
      score -= 10;
      issues.push({ text: 'Yazı çok uzun', fix: 'Yazıyı 3 kelimeye indirin', impact: 10 });
    }
  } else {
    score -= 5;
    issues.push({ text: 'Thumbnail yazısı yok', fix: 'Dikkat çekici bir yazı ekleyin', impact: 5 });
  }

  // Typography style bonus (2026 - color harmony focused)
  const highCtrTypoStyles = ['auto_harmony', 'bold_impact', 'gaming_neon', 'simple_brush'];
  const goodTypoStyles = ['cinematic_epic', 'comic_action', 'elegant_modern'];

  if (highCtrTypoStyles.includes(settings.typoStyle)) {
    score += 10;
    boosts.push({ text: 'Renk uyumlu yüksek CTR stili', value: '+10' });
  } else if (goodTypoStyles.includes(settings.typoStyle)) {
    score += 6;
    boosts.push({ text: 'Kaliteli tipografi stili', value: '+6' });
  }

  // Face/photo bonus
  if (settings.hasPhoto) {
    score += 12;
    boosts.push({ text: 'İnsan yüzü içeriyor', value: '+12' });
  }

  // Optimization bonus - when "Make it more clickable" was used
  if (settings.isOptimized) {
    score += 15;
    boosts.push({ text: 'AI optimizasyonu uygulandı', value: '+15' });
  }

  // Clamp score
  score = Math.max(0, Math.min(100, score));

  // Determine CTR likelihood
  let likelihood = 'Düşük';
  let likelihoodColor = 'text-red-400';
  if (score >= 80) {
    likelihood = 'Çok Yüksek';
    likelihoodColor = 'text-green-400';
  } else if (score >= 65) {
    likelihood = 'Yüksek';
    likelihoodColor = 'text-emerald-400';
  } else if (score >= 50) {
    likelihood = 'Orta';
    likelihoodColor = 'text-yellow-400';
  }

  return { score, likelihood, likelihoodColor, issues, boosts };
};

// CTR Score Display Component
const CTRScoreCard = ({ score, likelihood, likelihoodColor, issues, boosts, onMakeClickable, isLoading }) => (
  <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-2xl p-4 border border-white/10">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Target className="w-5 h-5 text-blue-400" />
        <span className="text-sm font-bold text-white">CTR Tahmini</span>
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
      CTR Olasılığı: {likelihood}
    </p>

    {/* Boosts */}
    {boosts.length > 0 && (
      <div className="mb-3">
        <p className="text-[10px] text-slate-500 uppercase mb-1">Artılar</p>
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
        <p className="text-[10px] text-slate-500 uppercase mb-1">Düzeltilecekler</p>
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
      Daha Tıklanabilir Yap
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
const YouTubeVideoCard = ({ thumbnail, title, channel, views, time, duration, avatar, color, isHighlighted, thumbText, thumbBg }) => (
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
          SENİN VİDEON
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

// Full YouTube Mockup Modal with Multiple Views
const YouTubeMockup = ({ thumbnail, title, channelName, onClose, position = 'top' }) => {
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
    title: title || 'Yeni Videom - İZLEMELİSİNİZ!',
    channel: channelName || 'Benim Kanalım',
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
            SENİN VİDEON
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
            SENİN VİDEON
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
    { icon: <Home className="w-5 h-5" />, label: 'Ana Sayfa', active: true },
    { icon: <Compass className="w-5 h-5" />, label: 'Keşfet' },
    { icon: <PlaySquare className="w-5 h-5" />, label: 'Shorts' },
    { icon: <Film className="w-5 h-5" />, label: 'Abonelikler' },
    { divider: true },
    { icon: <Clock className="w-5 h-5" />, label: 'Geçmiş' },
    { icon: <ThumbsUp className="w-5 h-5" />, label: 'Beğenilenler' },
    { divider: true },
    { label: 'Keşfet', header: true },
    { icon: <Gamepad2 className="w-5 h-5" />, label: 'Oyun' },
    { icon: <Music className="w-5 h-5" />, label: 'Müzik' },
    { icon: <Trophy className="w-5 h-5" />, label: 'Spor' },
  ];

  const categories = ['Tümü', 'Oyun', 'Canlı', 'Müzik', 'Strateji oyunları', 'Aksiyon-macera', 'Yeni', 'Son yüklenenler'];

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
          Masaüstü
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setViewMode('mobile'); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            viewMode === 'mobile' ? 'bg-white text-black' : 'text-white hover:bg-white/10'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          Mobil
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setViewMode('search'); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            viewMode === 'search' ? 'bg-white text-black' : 'text-white hover:bg-white/10'
          }`}
        >
          <Search className="w-4 h-4" />
          Arama
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
                  <input type="text" placeholder="Ara" className="bg-transparent text-white w-full outline-none text-sm" />
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
              <span className="text-[10px]">Sen</span>
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
            Yaklaşık {Math.floor(Math.random() * 900000 + 100000).toLocaleString()} sonuç bulundu
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
  const [ctrScore, setCtrScore] = useState(null);
  const [previousCtrScore, setPreviousCtrScore] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isOptimized, setIsOptimized] = useState(false);
  const [previousImage, setPreviousImage] = useState(null);

  // Mobile UI states
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // AI Model selection - Gemini 3 is the latest (2026)
  const [selectedModel, setSelectedModel] = useState('gemini-3-pro-image-preview');
  const availableModels = [
    { id: 'gemini-3-pro-image-preview', name: 'Gemini 3 Pro Image', desc: 'En yeni! 4K görsel, gelişmiş metin, düşünme modu', badge: 'ÖNERİLEN' },
    { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash', desc: 'Hızlı, iyi görsel anlama' },
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash (Stable)', desc: 'Stabil ve dengeli' },
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
  const [autoGenerateAfterAnalysis, setAutoGenerateAfterAnalysis] = useState(false);

  // Topic/Concept research states
  const [topicResearch, setTopicResearch] = useState(null);
  const [isResearchingTopic, setIsResearchingTopic] = useState(false);

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
    const score = calculateCTRScore(settings);
    setCtrScore(score);
  }, [selectedArchetype, topicDescription, overlayText, typoStyle, base64Image, isOptimized]);

  // Auto-generate thumbnail after analysis completes
  useEffect(() => {
    if (autoGenerateAfterAnalysis && photoAnalysis && !isAnalyzingPhoto && !isAnalyzingConcept && !loading) {
      setAutoGenerateAfterAnalysis(false);
      // Small delay to ensure state is fully updated
      setTimeout(() => {
        if (base64Image && topic && apiKey) {
          generateThumbnail();
        }
      }, 100);
    }
  }, [autoGenerateAfterAnalysis, photoAnalysis, isAnalyzingPhoto, isAnalyzingConcept, loading]);

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
      name: 'Otomatik Renk Uyumu',
      desc: 'AI sahneyi analiz eder, en uyumlu rengi seçer',
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
      name: 'Sinematik Epik',
      desc: 'Film posteri kalitesi, metalik/taş doku, sahne ışığıyla uyumlu',
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
      name: 'Gaming Neon',
      desc: 'Oyun/teknoloji teması, parlak neon, sahne rengiyle uyumlu glow',
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
      name: 'Maksimum Etki',
      desc: 'En yüksek okunabilirlik, kontrast renk seçimi',
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
      name: 'Elegant Modern',
      desc: 'Premium görünüm, sofistike renk paleti',
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
      name: 'Comic Action',
      desc: 'Çizgi roman tarzı, dinamik, sahne rengiyle uyumlu aksiyon efekti',
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
      name: 'Sade Fırça',
      desc: 'El yazısı tarzı, sade, sahneyle uyumlu koyu renk',
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
              text: `Bu bir YouTube thumbnail referans/konsept görseli. Lütfen şunları analiz et ve Türkçe olarak özetle:

1. **Stil**: Görsel stili (sinematik, çizgi film, gerçekçi, vb.)
2. **Renk Paleti**: Baskın renkler ve ton
3. **Kompozisyon**: Öğelerin yerleşimi
4. **Metin Stili**: Varsa yazı tipi ve efektleri
5. **Atmosfer**: Genel hava ve duygu
6. **CTR Elementleri**: Dikkat çeken unsurlar

Kısa ve öz ol. Her madde 1-2 cümle olsun.`
            },
            { inlineData: { mimeType: "image/png", data: conceptBase64 } }
          ]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 500
        }
      };

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
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
        // Trigger auto-generate if photo and topic are set
        if (base64Image && topic) {
          setAutoGenerateAfterAnalysis(true);
        }
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
              text: `Bu fotoğrafı analiz et ve YouTube thumbnail için kullanılacak şekilde Türkçe özetle:

1. **Kişi**: Cinsiyet, tahmini yaş, genel görünüm
2. **Yüz İfadesi**: Mevcut duygu/ifade
3. **Giyim**: Kıyafet tipi ve renkleri
4. **Poz**: Duruş ve açı
5. **Aydınlatma**: Işık yönü ve kalitesi
6. **Öneri**: Hangi thumbnail stili/arketipi uygun olur

Kısa ve öz ol. Her madde 1-2 cümle olsun.`
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
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
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
        // Trigger auto-generate if topic is set
        if (topic) {
          setAutoGenerateAfterAnalysis(true);
        }
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

    try {
      // Step 1: Google Search grounded research for up-to-date info (new games, recent content)
      const searchPayload = {
        contents: [{
          parts: [{
            text: `"${topic}" hakkında detaylı bilgi ver. Bu bir oyun, film, anime, dizi veya internet kültürü konusu olabilir.

${topicDescription ? `Ek bağlam: ${topicDescription}` : ''}

Şunları öğrenmem lazım:
- Bu tam olarak nedir? (oyun, karakter, boss, silah, item, map, mod, DLC, event vb.)
- Hangi franchise/evrene ait?
- Ne zaman çıktı veya ne zaman popüler oldu?
- Görsel olarak nasıl görünür? (renkler, tasarım, atmosfer, ikonik elementler)
- Oyuncular/fanlar bu konuyu nasıl tanıyor?

İnternetten güncel bilgi araştırarak yanıtla. Özellikle yeni çıkan veya güncel içerikler hakkında doğru bilgi ver.`
          }]
        }],
        tools: [{
          googleSearch: {}
        }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 2000
        }
      };

      const searchResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(searchPayload)
        }
      );

      const searchData = await searchResponse.json();
      const searchResult = searchData.candidates?.[0]?.content?.parts?.[0]?.text || '';

      // Step 2: Deep visual analysis using search results + AI knowledge
      const analysisPayload = {
        contents: [{
          parts: [{
            text: `Sen bir GAMER, OYUN KÜLTÜRÜ ve GÖRSEL TASARIM uzmanısın. "${topic}" hakkında YouTube thumbnail tasarımı için görsel analiz yap.

${topicDescription ? `Kullanıcının ek açıklaması: ${topicDescription}` : ''}

${searchResult ? `
📡 GÜNCEL İNTERNET ARAŞTIRMASI SONUÇLARI:
${searchResult}

Yukarıdaki güncel bilgileri kullanarak aşağıdaki analizi yap:
` : ''}

Lütfen Türkçe olarak çok detaylı yaz:

1. **KARAKTER/KONU KİMLİĞİ**:
   - Bu kim/ne? Tam tanımı (Oyun, film, karakter, boss, item, event, DLC vb.)
   - Hangi evrene/franchise'a ait? Hangi yılda çıktı?
   - Lore'daki önemi, hikayesi ve fanlar için anlamı
   - Eğer yeni bir içerikse: ne zaman duyuruldu/çıktı, topluluğun tepkisi

2. **GÖRSEL KİMLİK** (ÇOK ÖNEMLİ - DETAYLI YAZILMALI):
   - Karakteristik renk paleti (HEX kodlarıyla - örn: Ba'lakor = koyu mor #4a0080, siyah #1a1a2e, demon kırmızısı #8b0000)
   - İkonik görsel elementler (kanatlar, silahlar, zırh, auralar, semboller, logolar)
   - Ortam/atmosfer (karanlık, epik, korkunç, parlak, neon, doğa vb.)
   - Tipik arka plan elementleri (kale, orman, uzay, şehir, arena vb.)
   - Işık tipi ve yönü (ateşli, soğuk, neon, gün batımı, ay ışığı vb.)
   - Parçacık/efekt önerileri (kıvılcım, sis, duman, yağmur, kar, enerji auraları)

3. **DUYGUSAL TON ve ATMOSFER**:
   - Hangi duyguyu uyandırmalı? (Korku, heyecan, güç, gizem, merak, nostalji)
   - Oyuncu/izleyici bu konuyu görünce ne hissetmeli?
   - Renk psikolojisi önerileri

4. **THUMBNAIL ÖNERİLERİ**:
   - En iyi kompozisyon önerisi (kişi nerede durmalı, arka plan nasıl olmalı)
   - Kullanılması gereken efektler (ışık, parçacık, sis, lens flare vb.)
   - Kostüm/kıyafet önerisi (kişi ne giymeli, zırh mı, pelerin mi vb.)
   - Kaçınılması gereken hatalar (yanlış renk, yanlış karakter, çelişkili elementler)
   - Örnek yazı önerileri (2-3 kelime, Türkçe ve İngilizce seçenekler)

5. **REFERANS STİLİ**:
   - Bu konu için en uygun görsel stil (sinematik, çizgi roman, gerçekçi, anime, dark fantasy vb.)
   - Benzer başarılı YouTube thumbnail'ların özellikleri
   - Popüler YouTube kanallarının bu konuyu nasıl işlediği

Bir gamer ve thumbnail tasarımcısı gibi düşün. ÇOK DETAYLI ve TUTKULU yaz.
Bu bilgiler doğrudan AI görsel üretiminde kullanılacak, bu yüzden görsel detaylar KRİTİK önemde.`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 3000
        }
      };

      const analysisResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(analysisPayload)
        }
      );

      const analysisData = await analysisResponse.json();
      const researchText = analysisData.candidates?.[0]?.content?.parts?.[0]?.text;

      if (researchText) {
        setTopicResearch(researchText);
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
      setError("Lütfen Gemini API Key'inizi girin.");
      return;
    }
    if (!base64Image || !topic) {
      setError("Lütfen bir fotoğraf yükleyin ve video konusunu belirtin.");
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
      const prompt = `You are an elite YouTube thumbnail designer. Create a HORIZONTAL LANDSCAPE thumbnail for "${topic}".

⚠️ ABSOLUTE REQUIREMENT - IMAGE ORIENTATION:
- THE IMAGE MUST BE HORIZONTAL/LANDSCAPE (width > height)
- DIMENSIONS: 1280 pixels WIDE x 720 pixels TALL (16:9 ratio)
- ❌ NEVER create vertical/portrait images
- ❌ NEVER create square images
- ✅ ONLY create WIDE horizontal images like a movie poster or YouTube thumbnail
- If you generate a portrait image, the task has FAILED

${topicDescription ? `
TOPIC/CONCEPT CONTEXT (IMPORTANT - USE THIS INFO):
The user has provided the following description about "${topic}":
${topicDescription}

Use this information to accurately represent the game/topic's visual style, atmosphere, characters, and world.
` : ''}

${topicResearch ? `
🎮 GAMER KNOWLEDGE - DETAILED RESEARCH (VERY IMPORTANT - FOLLOW THIS):
An expert gamer has researched "${topic}" and provided the following detailed information.
YOU MUST USE THIS INFORMATION to create an authentic, lore-accurate thumbnail:

${topicResearch}

⚠️ CRITICAL: Apply the visual identity, color palette, atmosphere, and style described above.
This is not generic - it's specific to "${topic}" and must look authentic to fans of this content.
` : ''}

${conceptAnalysis ? `
🎨 REFERENCE STYLE ANALYSIS (Apply this style to the thumbnail):
The user provided a reference/concept image. Here's the AI analysis of that reference:
${conceptAnalysis}

IMPORTANT: Use this style analysis to match the visual style, colors, composition, and atmosphere of the reference image.
But you MUST include the person from the provided photo - the reference is only for STYLE, not for replacing the person.
` : ''}

${photoAnalysis ? `
👤 PHOTO SUBJECT ANALYSIS:
Here's the AI analysis of the person's photo:
${photoAnalysis}

Use this information to better integrate the person into the scene and choose appropriate expressions/poses.
` : ''}

${selectedArchetype ? `
🎯 HIGH-CTR ARCHETYPE (IMPORTANT - USE THIS PATTERN):
${CTR_ARCHETYPES.find(a => a.id === selectedArchetype)?.prompt || ''}
This archetype is proven to increase click-through rates. Apply this pattern to the thumbnail composition.
` : ''}

⚠️ CRITICAL - PERSON SIZE AND POSITIONING (LIKE PROFESSIONAL YOUTUBE THUMBNAILS):
The provided photo shows the person who must appear LARGE in the thumbnail.
- THE FACE MUST BE BIG: The person's face should take up 40-50% of the frame HEIGHT
- Position the person CENTERED or slightly below center in the frame
- The face is the MAIN FOCAL POINT - everything else is secondary
- SEAMLESSLY BLEND the person into the scene with matching lighting and color grading
- Add dramatic colored rim lighting/glow on the person (green, red, blue, orange based on theme)
- The person should look like they BELONG in this world

IMPORTANT - COSTUME/CLOTHING TRANSFORMATION:
- TRANSFORM the person's clothing to match the scene's theme and universe
- Do NOT keep their original casual clothes (jeans, t-shirt, etc.) in fantasy/sci-fi scenes
- Examples of costume adaptation:
  * Fantasy theme → Medieval armor, robes, cloaks, warrior gear
  * Sci-fi/Space → Futuristic suit, space armor, tech gear
  * Horror → Torn/dirty clothes, blood stains, survival gear
  * Gaming → Character-appropriate outfit matching the game's aesthetic
- Face and facial features must remain unchanged, only transform the body/clothing

⚠️ CRITICAL - PERSON FRAMING:
- The person's ENTIRE HEAD and FACE must be FULLY VISIBLE - NEVER crop the top of the head
- Show from chest-up or shoulders-up so the face is LARGE
- Leave adequate space above the head (headroom)
- The face should fill a significant portion of the frame
- Do NOT make the person too small - they should DOMINATE the thumbnail

${overlayText ? `
TEXT OVERLAY: "${overlayText}"
- Place text at the BOTTOM of the image (bottom 20-25% of frame)
- Text must be VERY LARGE and BOLD - easily readable at small sizes
- Use thick black stroke/outline (3-5px) for readability
- Add strong glow effect in the scene's dominant color (green, red, blue, etc.)
- Text can span the full width of the image
- NEVER put text over the person's face
- Avoid bottom-right corner (YouTube timestamp area)

⚠️ CRITICAL - TEXT COLOR HARMONY:
The text color MUST harmonize with the scene. Follow these rules:
1. ANALYZE the scene's dominant colors FIRST
2. Choose text color that CONTRASTS but COMPLEMENTS the background
3. If scene is dark/cold → Use warm bright text (white, yellow, gold)
4. If scene is warm/red → Use cool accent (white with blue glow)
5. The text GLOW/OUTLINE should use a color FROM the scene
6. Never use a text color that blends into the background
7. Test: Would this text be readable at 120px thumbnail size?
` : `
⚠️⚠️⚠️ ABSOLUTE ZERO TEXT RULE ⚠️⚠️⚠️
- There must be ABSOLUTELY NO TEXT, NO LETTERS, NO WORDS, NO NUMBERS, NO SYMBOLS anywhere on this image
- Do NOT add any title, watermark, logo text, game name, channel name, or ANY written content
- Do NOT add text even if you think it would look good - the user explicitly wants NO TEXT
- The image must be 100% visual - only the person, scene, and effects
- If you add ANY text to this image, the task has FAILED
- This is a CLEAN thumbnail - the user will add their own text later in the editor
`}

VISUAL STYLE: ${selectedTypo.prompt}

SCENE COMPOSITION:
- Build an epic, atmospheric world for "${topic}"
- Use volumetric lighting, particles, fog/mist
- High contrast, vibrant colors that pop at small sizes
- Cinematic quality, NOT "AI plastic" look
- Shot on 35mm film aesthetic with slight grain

${extraRequest ? `ADDITIONAL REQUEST: ${extraRequest}` : ''}`;

      const payload = {
        contents: [{
          parts: [
            { text: prompt },
            { inlineData: { mimeType: "image/png", data: base64Image } }
          ]
        }],
        generationConfig: {
          responseModalities: ['TEXT', 'IMAGE'],
          temperature: 0.6,
          topP: 0.95
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
        throw new Error('Görsel sentezleme başarısız. Lütfen tekrar deneyin.');
      }
    } catch (err) {
      setError(err.message || "Bilinmeyen bir hata.");
    } finally {
      setLoading(false);
    }
  };

  // Make it more clickable - regenerate with optimized settings
  const makeMoreClickable = async () => {
    if (!resultImage || !base64Image) return;

    setIsOptimizing(true);
    setPreviousImage(resultImage);
    setPreviousCtrScore(ctrScore); // Save current score for comparison

    // Auto-select best archetype if none selected
    let optimizedArchetype = selectedArchetype;
    if (!optimizedArchetype) {
      // Pick based on topic keywords
      const topicLower = (topic + ' ' + topicDescription).toLowerCase();
      if (topicLower.includes('horror') || topicLower.includes('korku') || topicLower.includes('scary')) {
        optimizedArchetype = 'shocked_threat';
      } else if (topicLower.includes('rpg') || topicLower.includes('build') || topicLower.includes('güçlü')) {
        optimizedArchetype = 'power_fantasy';
      } else if (topicLower.includes('boss') || topicLower.includes('dev') || topicLower.includes('huge')) {
        optimizedArchetype = 'scale_contrast';
      } else {
        optimizedArchetype = 'power_fantasy'; // Default to power fantasy
      }
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
      const optimizedPrompt = `You are an elite YouTube thumbnail designer specializing in HIGH-CTR thumbnails. Create a HORIZONTAL LANDSCAPE thumbnail for "${topic}".

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
🎮 GAMER KNOWLEDGE (CRITICAL - USE THIS FOR AUTHENTICITY):
${topicResearch}
Apply the visual identity, colors, and atmosphere described above!
` : ''}

${conceptAnalysis ? `
🎨 STYLE REFERENCE (from user's concept image):
${conceptAnalysis}
Apply this style but ALWAYS include the person from the photo.
` : ''}

${photoAnalysis ? `
👤 PHOTO ANALYSIS:
${photoAnalysis}
` : ''}

REFERENCE PHOTO - The person in this photo must appear LARGE in the thumbnail:
- Face should take up 40-50% of the frame HEIGHT - make it BIG
- Transform clothing to match theme
- Add dramatic colored lighting matching the scene
- Keep face unchanged and recognizable
- NEVER crop the head - leave headroom above

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

${extraRequest ? `ADDITIONAL: ${extraRequest}` : ''}

MAKE THIS THUMBNAIL IRRESISTIBLE TO CLICK!`;

      const payload = {
        contents: [{
          parts: [
            { text: optimizedPrompt },
            { inlineData: { mimeType: "image/png", data: base64Image } }
          ]
        }],
        generationConfig: {
          responseModalities: ['TEXT', 'IMAGE'],
          temperature: 0.7,
          topP: 0.95
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
      setError(err.message || "Optimizasyon hatası.");
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
          temperature: 0.3
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

  const features = [
    {
      icon: <BrainCircuit className="w-6 h-6" />,
      title: 'AI Destekli Tasarım',
      desc: 'Gemini AI ile profesyonel thumbnail\'ler saniyeler içinde'
    },
    {
      icon: <Layers className="w-6 h-6" />,
      title: 'Akıllı Yerleştirme',
      desc: 'Kişiyi sahnenin içine organik şekilde entegre eder'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'CTR Optimizasyonu',
      desc: 'Tıklama oranını artıran tipografi ve renk uyumu'
    },
    {
      icon: <Youtube className="w-6 h-6" />,
      title: 'YouTube Önizleme',
      desc: 'Thumbnail\'in YouTube\'da nasıl görüneceğini anında gör'
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
                <button
                  onClick={() => setCurrentSection('app')}
                  className="bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold px-3 sm:px-4 py-2 rounded-lg sm:rounded-full transition-all border border-white/10"
                >
                  Başla
                </button>
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
                    <p className="text-[10px] sm:text-xs text-green-500">Gemini AI ile Çalışıyor</p>
                  </div>

                  {/* Main Heading */}
                  <h1 className="text-white text-center text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter mb-2 sm:mb-4">
                    Thumbnail Oluştur
                  </h1>
                  <h2 className="text-white/80 text-center text-xl sm:text-2xl md:text-4xl lg:text-5xl font-extrabold tracking-tighter mb-4 sm:mb-6">
                    <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                      Saniyeler İçinde
                    </span>
                  </h2>

                  {/* Description */}
                  <p className="text-white/60 px-2 sm:px-4 text-center text-xs sm:text-sm md:text-base lg:text-lg max-w-2xl mx-auto mb-6 sm:mb-10">
                    Fotoğrafınızı yükleyin, konunuzu yazın. AI sizin için viral YouTube thumbnail tasarlasın.
                  </p>

                  {/* CTA Button - Simplified for mobile */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                    <button
                      onClick={() => setCurrentSection('app')}
                      className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-black text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20"
                    >
                      Ücretsiz Dene
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
                    Neden ThumbnailMAX?
                  </h2>
                  <p className="text-white/50 text-center text-xs sm:text-sm mb-8 sm:mb-12">
                    Profesyonel YouTuber'ların tercih ettiği AI thumbnail aracı
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
                    Hemen Başlamaya Hazır mısın?
                  </h2>
                  <p className="text-white/60 mb-6 sm:mb-8 text-xs sm:text-sm md:text-base max-w-md mx-auto">
                    Kendi Gemini API Key'inle sınırsız thumbnail oluştur. Tamamen ücretsiz.
                  </p>
                  <button
                    onClick={() => setCurrentSection('app')}
                    className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all flex items-center justify-center gap-2 mx-auto shadow-lg shadow-orange-500/20"
                  >
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                    Thumbnail Oluştur
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
                Verileriniz bizde saklanmaz
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
              {/* API Status - Compact on mobile */}
              {apiKey ? (
                <div className="bg-green-500/10 border border-green-500/20 px-2 sm:px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500" />
                  <span className="text-[10px] sm:text-xs font-bold text-green-400 hidden sm:inline">Bağlı</span>
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
                    <h2 className="text-lg font-bold text-white">Ayarlar</h2>
                    <button onClick={() => setShowMobileMenu(false)} className="p-2 rounded-lg bg-white/5">
                      <X className="w-5 h-5 text-slate-400" />
                    </button>
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
                    {apiKey && <p className="text-xs text-green-500 flex items-center gap-1"><Check className="w-3 h-3" /> Kaydedildi</p>}
                  </div>

                  {/* Channel Name */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500">Kanal Adı</label>
                    <input
                      type="text"
                      value={channelName}
                      onChange={(e) => setChannelName(e.target.value)}
                      placeholder="Örn: Benim Kanalım"
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm"
                    />
                  </div>

                  {/* Thumbnail Position */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500">YouTube Önizleme Konumu</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'top', label: 'Üst', icon: '⬆️' },
                        { id: 'middle', label: 'Orta', icon: '⏺️' },
                        { id: 'bottom', label: 'Alt', icon: '⬇️' }
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
                      <BrainCircuit className="w-3 h-3" /> AI Modeli
                    </label>
                    <div className="space-y-2">
                      {availableModels.map((model) => (
                        <button
                          key={model.id}
                          onClick={() => setSelectedModel(model.id)}
                          className={`w-full p-3 rounded-lg border text-left transition-all ${
                            selectedModel === model.id
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
                          </div>
                          <p className={`text-[10px] ${selectedModel === model.id ? 'text-purple-200' : 'text-slate-600'}`}>
                            {model.desc}
                          </p>
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-600">
                      Deneysel model daha iyi sonuç verebilir ama yavaş olabilir
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
                {/* Before/After Comparison */}
                {previousImage && (
                  <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/10 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-blue-400" />
                        Önce / Sonra
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
                        <p className="text-[10px] text-slate-400 text-center mb-1">Önceki</p>
                        <img src={previousImage} alt="Before" className="w-full rounded-lg opacity-70" />
                      </div>
                      <div>
                        <p className="text-[10px] text-green-400 text-center mb-1 font-bold">Optimize ✓</p>
                        <img src={resultImage} alt="After" className="w-full rounded-lg border border-green-500/30" />
                      </div>
                    </div>
                    <button
                      onClick={() => { setPreviousImage(null); setPreviousCtrScore(null); }}
                      className="mt-2 text-xs text-slate-500 hover:text-white flex items-center gap-1 mx-auto"
                    >
                      <X className="w-3 h-3" /> Kapat
                    </button>
                  </div>
                )}

                {/* Main Result */}
                {!previousImage && (
                  <div className="rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 bg-black mb-4">
                    <img src={resultImage} alt="Result" className="w-full h-auto" />
                  </div>
                )}

                {/* CTR Score - Compact */}
                {ctrScore && (
                  <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-xl p-3 sm:p-4 border border-white/10 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-bold text-white">CTR Skoru</span>
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
                    <span>İndir</span>
                  </button>
                  <button
                    onClick={() => setShowYouTubeMockup(true)}
                    className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white px-4 sm:px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-sm"
                  >
                    <Youtube className="w-4 h-4" />
                    <span>Önizle</span>
                  </button>
                  <button
                    onClick={() => setShowEditor(true)}
                    className="flex-1 sm:flex-none bg-purple-600 hover:bg-purple-700 text-white px-4 sm:px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-sm"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Düzenle</span>
                  </button>
                  <button
                    onClick={makeMoreClickable}
                    disabled={isOptimizing}
                    className="flex-1 sm:flex-none bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 sm:px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-sm disabled:opacity-50"
                  >
                    {isOptimizing ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                    <span className="hidden sm:inline">Optimize Et</span>
                  </button>
                </div>

                {/* Yazısız Yeniden Oluştur - İpucu */}
                <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-amber-300">
                      💡 AI yazı eklemiş mi? Yazısız versiyon oluşturup editörde kendi yazınızı ekleyebilirsiniz.
                    </p>
                    <button
                      onClick={regenerateWithoutText}
                      disabled={loading}
                      className="shrink-0 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-50"
                    >
                      <RefreshCcw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                      Yazısız Oluştur
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
                <p className="text-xl font-black text-white animate-pulse">Oluşturuluyor...</p>
                <p className="text-sm text-blue-400 mt-1">AI thumbnail tasarlıyor</p>
              </div>
            </div>
          )}

          {/* Main Form - Collapsible Sections */}
          <div className="space-y-3 sm:space-y-4">

            {/* Essential: Photo + Topic */}
            <CollapsibleSection
              title="Fotoğraf ve Konu"
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
                      <p className="text-sm font-bold text-blue-400">Fotoğraf Yüklendi</p>
                      <p className="text-xs text-slate-500">Değiştirmek için dokun</p>
                    </div>
                    {!photoAnalysis && (
                      <button
                        onClick={(e) => { e.stopPropagation(); analyzePhoto(); }}
                        disabled={isAnalyzingPhoto || !apiKey}
                        className="bg-purple-500/20 border border-purple-500/30 text-purple-300 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1 disabled:opacity-50"
                      >
                        {isAnalyzingPhoto ? <RefreshCcw className="w-3 h-3 animate-spin" /> : <Eye className="w-3 h-3" />}
                        Analiz
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Upload className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                    <p className="text-sm font-bold text-slate-400">Fotoğrafınızı Yükleyin</p>
                    <p className="text-xs text-slate-600 mt-1">Thumbnail'da görünecek yüz</p>
                  </div>
                )}
              </div>

              {/* Photo Analysis Result */}
              {photoAnalysis && (
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3">
                  <p className="text-xs font-bold text-purple-400 mb-2 flex items-center gap-1">
                    <BrainCircuit className="w-3 h-3" /> AI Analizi
                  </p>
                  <p className="text-xs text-slate-300 line-clamp-3">{photoAnalysis}</p>
                </div>
              )}

              {/* Topic Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500">Video Konusu *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => { setTopic(e.target.value); setTopicResearch(null); }}
                    placeholder="Örn: Elden Ring, Minecraft Hardcore"
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
                      <Gamepad2 className="w-3 h-3" /> AI Araştırması: {topic}
                    </p>
                    <button onClick={() => setTopicResearch(null)} className="text-slate-500 hover:text-white">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-[200px] overflow-y-auto">
                    {topicResearch}
                  </div>
                  <p className="text-[10px] text-green-400 flex items-center gap-1 pt-1 border-t border-amber-500/20">
                    <Check className="w-3 h-3" /> Bu araştırma thumbnail oluştururken kullanılacak
                  </p>
                </div>
              )}

              {/* Overlay Text - Optional */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 flex items-center gap-2">
                  Thumbnail Yazısı
                  <span className="text-[10px] text-slate-600 font-normal">(opsiyonel)</span>
                </label>
                <input
                  type="text"
                  value={overlayText}
                  onChange={(e) => setOverlayText(e.target.value)}
                  placeholder="Boş bırakılabilir - yazısız thumbnail"
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-blue-500/40"
                />
                <p className="text-[10px] text-slate-600">
                  {overlayText ? '3 kelimeden az olması önerilir' : 'Boş bırakırsanız yazısız thumbnail oluşturulur'}
                </p>
              </div>
            </CollapsibleSection>

            {/* Style Selection */}
            <CollapsibleSection
              title="Stil Seçimi"
              icon={<Palette className="w-4 h-4" />}
              badge={selectedArchetype ? CTR_ARCHETYPES.find(a => a.id === selectedArchetype)?.icon : null}
            >
              {/* CTR Archetypes - Compact Grid */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500">CTR Arketipi</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CTR_ARCHETYPES.map((arch) => (
                    <button
                      key={arch.id}
                      onClick={() => setSelectedArchetype(arch.id)}
                      className={`p-3 rounded-xl border transition-all text-left ${
                        selectedArchetype === arch.id
                          ? 'bg-orange-600 border-orange-500 text-white'
                          : 'bg-black/40 border-white/10 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{arch.icon}</span>
                        <span className="text-xs font-bold truncate">{arch.name}</span>
                      </div>
                      <span className={`text-[10px] font-bold ${selectedArchetype === arch.id ? 'text-green-300' : 'text-green-500/60'}`}>
                        +{arch.ctrBoost}% CTR
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Typography - Horizontal Scroll on Mobile */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500">Yazı Stili</label>
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 sm:overflow-visible">
                  {typographyOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setTypoStyle(opt.id)}
                      className={`flex-shrink-0 w-40 sm:w-auto p-3 rounded-xl border transition-all text-left ${
                        typoStyle === opt.id
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'bg-black/40 border-white/10 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      <p className="text-xs font-bold truncate">{opt.name}</p>
                      <p className={`text-[10px] mt-0.5 line-clamp-1 ${typoStyle === opt.id ? 'text-blue-100' : 'text-slate-600'}`}>
                        {opt.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </CollapsibleSection>

            {/* Advanced Options */}
            <CollapsibleSection
              title="Gelişmiş Seçenekler"
              icon={<Sparkles className="w-4 h-4" />}
            >
              {/* Concept Description */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500">Konsept Açıklaması</label>
                <textarea
                  value={topicDescription}
                  onChange={(e) => setTopicDescription(e.target.value)}
                  placeholder={topicResearch ? "Araştırma tamamlandı! Ekstra detay eklemek isterseniz buraya yazın..." : "AI araştırması yapmadan önce konu hakkında bilgi verin..."}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/40 min-h-[60px]"
                />
              </div>

              {/* Concept/Reference Image */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500">Referans Görsel</label>
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
                        <p className="text-xs font-bold text-emerald-400">Yüklendi</p>
                        <p className="text-[10px] text-slate-600">Değiştirmek için dokun</p>
                      </div>
                      {!conceptAnalysis && (
                        <button
                          onClick={(e) => { e.stopPropagation(); analyzeConceptImage(); }}
                          disabled={isAnalyzingConcept || !apiKey}
                          className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 px-3 py-2 rounded-lg text-xs font-bold disabled:opacity-50"
                        >
                          {isAnalyzingConcept ? <RefreshCcw className="w-3 h-3 animate-spin" /> : 'Analiz'}
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4 opacity-40">
                      <ImageIcon className="w-6 h-6 mx-auto mb-1" />
                      <p className="text-xs">Örnek thumbnail yükle</p>
                    </div>
                  )}
                </div>

                {conceptAnalysis && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                    <p className="text-xs font-bold text-emerald-400 mb-1">AI Analizi</p>
                    <p className="text-xs text-slate-300 line-clamp-3">{conceptAnalysis}</p>
                  </div>
                )}
              </div>

              {/* Extra Request */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500">Ekstra İstek</label>
                <textarea
                  value={extraRequest}
                  onChange={(e) => setExtraRequest(e.target.value)}
                  placeholder="Örn: Arka planda yeşil sis olsun..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/40 min-h-[50px]"
                />
              </div>
            </CollapsibleSection>

            {/* Desktop Generate Button */}
            <div className="hidden lg:block">
              <button
                onClick={generateThumbnail}
                disabled={loading || !image || !topic || !apiKey}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-black py-4 rounded-2xl transition-all disabled:opacity-30 flex items-center justify-center gap-3"
              >
                {loading ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                {loading ? 'Oluşturuluyor...' : 'Thumbnail Oluştur'}
              </button>
            </div>

            {error && <p className="text-sm text-red-500 font-bold text-center bg-red-500/10 border border-red-500/20 rounded-xl p-3">{error}</p>}

            {/* Empty State - Desktop Only */}
            {!resultImage && !loading && (
              <div className="hidden lg:block bg-[#101014] rounded-2xl p-8 border border-white/5">
                <div className="text-center opacity-30">
                  <Monitor className="w-16 h-16 mx-auto mb-3" />
                  <p className="text-lg font-bold">Stüdyo Hazır</p>
                  <p className="text-sm text-slate-500">Formu doldurup oluştur'a tıklayın</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Floating Action Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#08080a] via-[#08080a] to-transparent lg:hidden">
          <button
            onClick={generateThumbnail}
            disabled={loading || !image || !topic || !apiKey}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-black py-4 rounded-2xl transition-all disabled:opacity-30 flex items-center justify-center gap-3 shadow-lg shadow-blue-500/20"
          >
            {loading ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
            {loading ? 'Oluşturuluyor...' : 'Thumbnail Oluştur'}
          </button>
        </div>
      </div>
    </>
  );
};

export default App;
