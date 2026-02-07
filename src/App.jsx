import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Image as ImageIcon, Sparkles, Download, RefreshCcw,
  Type, BrainCircuit, Check, Monitor, Wand2, AlertTriangle, Palette, Eye,
  Layers, Flame, Key, EyeOff, Zap, Play, Youtube,
  ChevronDown, Star, ArrowRight, MoreVertical, Search, Bell, Mic,
  Menu, Home, Compass, PlaySquare, Clock, ThumbsUp, Film, Gamepad2,
  Music, Radio, Trophy, Lightbulb, Shirt, X, User, Smartphone, Grid3X3,
  TrendingUp, Target, MousePointer, BarChart3
} from 'lucide-react';

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

  // Typography style bonus
  if (settings.typoStyle === 'ctr_beast') {
    score += 5;
    boosts.push({ text: 'CTR odaklı tipografi', value: '+5' });
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
    <div className="relative aspect-video rounded-xl overflow-hidden mb-3">
      {thumbnail ? (
        <img src={thumbnail} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
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
        <div className="absolute bottom-8 left-2 bg-red-600 text-white text-[10px] px-2 py-1 rounded font-bold animate-pulse shadow-lg">
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
      <div className="relative w-40 h-24 flex-shrink-0 rounded-lg overflow-hidden">
        {video.thumbnail ? (
          <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${video.color} flex items-center justify-center`}>
            <Play className="w-8 h-8 text-white/80" />
          </div>
        )}
        <div className="absolute bottom-1 right-1 bg-black/90 text-white text-[10px] px-1 py-0.5 rounded">
          {video.duration}
        </div>
        {video.isHighlighted && (
          <div className="absolute bottom-6 left-1 bg-red-600 text-white text-[8px] px-1.5 py-0.5 rounded font-bold shadow-lg">
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
      <div className="relative w-80 h-44 flex-shrink-0 rounded-xl overflow-hidden">
        {video.thumbnail ? (
          <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${video.color} flex items-center justify-center`}>
            <Play className="w-12 h-12 text-white/80" />
          </div>
        )}
        <div className="absolute bottom-2 right-2 bg-black/90 text-white text-xs px-1.5 py-0.5 rounded">
          {video.duration}
        </div>
        {video.isHighlighted && (
          <div className="absolute bottom-8 left-2 bg-red-600 text-white text-[10px] px-2 py-1 rounded font-bold animate-pulse shadow-lg">
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

const App = () => {
  const [currentSection, setCurrentSection] = useState('landing');
  const [image, setImage] = useState(null);
  const [base64Image, setBase64Image] = useState(null);
  const [topic, setTopic] = useState('');
  const [topicDescription, setTopicDescription] = useState('');
  const [overlayText, setOverlayText] = useState('');
  const [extraRequest, setExtraRequest] = useState('');
  const [channelName, setChannelName] = useState('');
  const [typoStyle, setTypoStyle] = useState('hyper_integrated');
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [showYouTubeMockup, setShowYouTubeMockup] = useState(false);
  const [thumbnailPosition, setThumbnailPosition] = useState('top'); // 'top', 'middle', 'bottom'
  const [selectedArchetype, setSelectedArchetype] = useState('');
  const [ctrScore, setCtrScore] = useState(null);
  const [previousCtrScore, setPreviousCtrScore] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isOptimized, setIsOptimized] = useState(false);
  const [previousImage, setPreviousImage] = useState(null);

  // Concept/Reference image states
  const [conceptImage, setConceptImage] = useState(null);
  const [conceptBase64, setConceptBase64] = useState(null);
  const [conceptAnalysis, setConceptAnalysis] = useState(null);
  const [isAnalyzingConcept, setIsAnalyzingConcept] = useState(false);
  const conceptInputRef = useRef(null);

  // Photo analysis states
  const [photoAnalysis, setPhotoAnalysis] = useState(null);
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);

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

  const handleSaveApiKey = (value) => {
    setApiKey(value);
    if (value) {
      localStorage.setItem('gemini_api_key', value);
    } else {
      localStorage.removeItem('gemini_api_key');
    }
  };

  const typographyOptions = [
    {
      id: 'hyper_integrated',
      name: 'Konsept Entegrasyonu',
      desc: 'Kişiyi sahnenin içine (platform, köprü vb.) tam yerleştirir.',
      prompt: 'HYPER-INTEGRATION: Place the subject organically on a platform or within the world geometry. Text should have a heavy glow matching the theme energy (e.g., Warpstone Green or Chaos Red).'
    },
    {
      id: 'ctr_beast',
      name: 'CTR Canavarı (Vurucu)',
      desc: 'Devasa font, yüksek kontrast ve parlayan neon hatlar.',
      prompt: 'ULTRA CTR: Massive bold typography with thick black strokes. Use vibrant yellow/white text with intense background-matching outer glow.'
    },
    {
      id: 'cinematic_epic',
      name: 'Sinematik / Epik',
      desc: 'Warhammer/Film posteri stili, dramatik gölgeler.',
      prompt: 'EPIC CINEMATIC: Use weathered metallic text textures. Dramatic rim lighting on the subject that matches the atmosphere. Deep volumetric fog.'
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
      } else {
        setPhotoAnalysis('Analiz yapılamadı.');
      }
    } catch (err) {
      setPhotoAnalysis('Analiz hatası: ' + err.message);
    } finally {
      setIsAnalyzingPhoto(false);
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

TEXT OVERLAY: "${overlayText || topic}"
- Place text at the BOTTOM of the image (bottom 20-25% of frame)
- Text must be VERY LARGE and BOLD - easily readable at small sizes
- Use thick black stroke/outline (3-5px) for readability
- Add strong glow effect in the scene's dominant color (green, red, blue, etc.)
- Text can span the full width of the image
- NEVER put text over the person's face
- Avoid bottom-right corner (YouTube timestamp area)

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
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`,
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

    // Force CTR beast style
    if (typoStyle !== 'ctr_beast') {
      setTypoStyle('ctr_beast');
    }

    const archetype = CTR_ARCHETYPES.find(a => a.id === optimizedArchetype);
    const selectedTypo = typographyOptions.find(t => t.id === 'ctr_beast');

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

TEXT: "${optimizedText || topic}"
- Place at the BOTTOM of the image (bottom 20-25%)
- MASSIVE bold font, 3D effect with strong shadow
- Thick black stroke (3-5px) for readability
- Glowing outline in the scene's dominant color
- Text should span most of the width
- NEVER cover the person's face with text

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
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`,
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
      <AuroraBackground>
        <style>{`
          @keyframes aurora {
            0% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(-5%, 5%) scale(1.1); }
            100% { transform: translate(5%, -5%) scale(1); }
          }
        `}</style>

        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-xl">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">THUMBNAIL<span className="text-blue-400">MAX</span></span>
            </div>
            <button
              onClick={() => setCurrentSection('app')}
              className="bg-white text-black px-6 py-2.5 rounded-full font-bold text-sm hover:bg-blue-100 transition-all"
            >
              Hemen Başla
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="min-h-screen flex flex-col items-center justify-center px-6 pt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl"
          >
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-8">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm text-white/80">Gemini AI Destekli</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
              YouTube Thumbnail'lerinizi{' '}
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Saniyeler İçinde
              </span>{' '}
              Oluşturun
            </h1>

            <p className="text-lg md:text-xl text-white/60 mb-10 max-w-2xl mx-auto">
              Fotoğrafınızı yükleyin, konunuzu yazın. AI sizin için viral thumbnail tasarlasın.
              CTR'nizi katlamaya hazır mısınız?
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentSection('app')}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 shadow-xl shadow-blue-500/25"
              >
                Ücretsiz Dene
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/5 border border-white/10 text-white px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
              >
                <Play className="w-5 h-5" />
                Nasıl Çalışır?
              </motion.button>
            </div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="absolute bottom-10"
          >
            <ChevronDown className="w-8 h-8 text-white/30 animate-bounce" />
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="py-32 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                Neden ThumbnailMAX?
              </h2>
              <p className="text-white/50 text-lg">
                Profesyonel YouTuber'ların tercih ettiği AI thumbnail aracı
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-all group"
                >
                  <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 w-12 h-12 rounded-2xl flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-white/50 text-sm">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 rounded-[3rem] p-12 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Hemen Başlamaya Hazır mısın?
            </h2>
            <p className="text-white/60 mb-8 max-w-lg mx-auto">
              Kendi Gemini API Key'inle sınırsız thumbnail oluştur.
              Tamamen ücretsiz, kayıt gerektirmez.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentSection('app')}
              className="bg-white text-black px-10 py-4 rounded-full font-black text-lg shadow-2xl"
            >
              Thumbnail Oluşturmaya Başla
            </motion.button>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5 py-8 px-6">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-white/40 text-sm">
              <Flame className="w-4 h-4" />
              <span>ThumbnailMAX — Powered by Gemini AI</span>
            </div>
            <p className="text-white/30 text-sm">
              Kendi API key'inizi kullanın. Verileriniz bizde saklanmaz.
            </p>
          </div>
        </footer>
      </AuroraBackground>
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
      </AnimatePresence>

      <div className="min-h-screen bg-[#08080a] text-slate-200 font-sans">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-[#08080a]/80 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => setCurrentSection('landing')}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-xl">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-black text-white tracking-tight">THUMBNAIL<span className="text-blue-400">MAX</span></span>
            </button>

            <div className="flex items-center gap-3">
              <div className="bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-full flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-xs font-bold text-blue-400">Gemini AI Active</span>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-[1600px] mx-auto p-6">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

            {/* Left: Input Panel */}
            <div className="xl:col-span-4 space-y-6">
              <div className="bg-[#101014] rounded-3xl p-6 border border-white/5 space-y-6">

                {/* API Key */}
                <section className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <Key className="w-3 h-3" /> Gemini API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={apiKey}
                      onChange={(e) => handleSaveApiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="w-full bg-black/40 border border-white/5 rounded-xl p-4 pr-12 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/40 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300"
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {apiKey ? (
                    <p className="text-[9px] text-green-500/70 font-bold uppercase flex items-center gap-1">
                      <Check className="w-3 h-3" /> Kaydedildi
                    </p>
                  ) : (
                    <p className="text-[9px] text-amber-500/70 font-bold uppercase flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> API Key gerekli
                    </p>
                  )}
                </section>

                {/* Channel Name */}
                <section className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <User className="w-3 h-3" /> Kanal Adı (YouTube Önizleme için)
                  </label>
                  <input
                    type="text"
                    value={channelName}
                    onChange={(e) => setChannelName(e.target.value)}
                    placeholder="Örn: Benim Kanalım"
                    className="w-full bg-black/40 border border-white/5 rounded-xl p-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/40"
                  />
                </section>

                {/* Thumbnail Position Selector */}
                <section className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <Layers className="w-3 h-3" /> Thumbnail Konumu (YouTube Önizleme)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'top', label: 'Üst', icon: '⬆️' },
                      { id: 'middle', label: 'Orta', icon: '⏺️' },
                      { id: 'bottom', label: 'Alt', icon: '⬇️' }
                    ].map((pos) => (
                      <button
                        key={pos.id}
                        type="button"
                        onClick={() => setThumbnailPosition(pos.id)}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          thumbnailPosition === pos.id
                            ? 'bg-blue-600 border-blue-500 text-white'
                            : 'bg-black/40 border-white/5 text-slate-400 hover:border-white/10'
                        }`}
                      >
                        <span className="text-lg block mb-1">{pos.icon}</span>
                        <span className="text-xs font-bold">{pos.label}</span>
                      </button>
                    ))}
                  </div>
                </section>

                {/* Video Topic */}
                <section className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <Layers className="w-3 h-3" /> Video Konusu
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Örn: Menace RPG, Warhammer 3"
                    className="w-full bg-black/40 border border-white/5 rounded-xl p-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/40"
                  />
                </section>

                {/* Konsept Açıklaması */}
                <section className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <BrainCircuit className="w-3 h-3" /> Konsept Açıklaması
                  </label>
                  <textarea
                    value={topicDescription}
                    onChange={(e) => setTopicDescription(e.target.value)}
                    placeholder="AI'ın bilmesi gerekenler: Oyunun/konunun ne hakkında olduğu, görsel stili, atmosferi, karakterler, renkler...

Örn: Menace, karanlık fantezi dünyasında geçen taktiksel RPG. Gotik mimari, canavarlar, şövalyeler. Renkler: koyu mor, kırmızı, ateş efektleri."
                    className="w-full bg-black/40 border border-white/5 rounded-xl p-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/40 min-h-[100px]"
                  />
                  <p className="text-[9px] text-amber-500/70 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Yeni/niş konular için mutlaka doldurun - AI bilemeyeceği şeyleri hayal edemez!
                  </p>
                </section>

                {/* Overlay Text */}
                <section className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <Type className="w-3 h-3" /> Thumbnail Yazısı
                  </label>
                  <input
                    type="text"
                    value={overlayText}
                    onChange={(e) => setOverlayText(e.target.value)}
                    placeholder="Örn: FARE İSTİLASI"
                    className="w-full bg-black/40 border border-white/5 rounded-xl p-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/40 font-bold"
                  />
                </section>

                {/* CTR Archetype Selector */}
                <section className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <Target className="w-3 h-3" /> CTR Arketipi (Yüksek Tıklama Kalıbı)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {CTR_ARCHETYPES.map((arch) => (
                      <button
                        key={arch.id}
                        onClick={() => setSelectedArchetype(arch.id)}
                        className={`text-left p-3 rounded-xl border transition-all ${
                          selectedArchetype === arch.id
                            ? 'bg-orange-600 border-orange-500 text-white'
                            : 'bg-black/40 border-white/5 text-slate-400 hover:border-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{arch.icon}</span>
                          <p className="text-xs font-bold">{arch.name}</p>
                        </div>
                        <p className={`text-[9px] ${selectedArchetype === arch.id ? 'text-orange-100' : 'text-slate-600'}`}>{arch.desc}</p>
                        <div className={`text-[9px] mt-1 font-bold ${selectedArchetype === arch.id ? 'text-green-300' : 'text-green-500/60'}`}>
                          +{arch.ctrBoost}% CTR
                        </div>
                      </button>
                    ))}
                  </div>
                </section>

                {/* Style Selector */}
                <section className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <Palette className="w-3 h-3" /> Stil
                  </label>
                  <div className="space-y-2">
                    {typographyOptions.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setTypoStyle(opt.id)}
                        className={`w-full text-left p-3 rounded-xl border transition-all ${
                          typoStyle === opt.id
                            ? 'bg-blue-600 border-blue-500 text-white'
                            : 'bg-black/40 border-white/5 text-slate-400 hover:border-white/10'
                        }`}
                      >
                        <p className="text-xs font-bold">{opt.name}</p>
                        <p className={`text-[10px] mt-0.5 ${typoStyle === opt.id ? 'text-blue-100' : 'text-slate-600'}`}>{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </section>

                {/* Image Upload */}
                <section className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <User className="w-3 h-3" /> Kendi Fotoğrafınız
                  </label>
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
                        <div className="flex-1">
                          <p className="text-xs font-bold text-blue-400">Yüklendi</p>
                          <p className="text-[10px] text-slate-600">Değiştirmek için tıkla</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4 opacity-40">
                        <Upload className="w-6 h-6 mx-auto mb-2" />
                        <p className="text-xs font-bold">Fotoğraf Yükle</p>
                        <p className="text-[10px] text-slate-500 mt-1">Thumbnail'da görünecek yüzünüz</p>
                      </div>
                    )}
                  </div>
                  {/* Photo Analysis Button & Result */}
                  {image && (
                    <div className="space-y-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); analyzePhoto(); }}
                        disabled={isAnalyzingPhoto || !apiKey}
                        className="w-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-2 hover:from-purple-500/30 hover:to-blue-500/30 transition-all disabled:opacity-50"
                      >
                        {isAnalyzingPhoto ? (
                          <><RefreshCcw className="w-3 h-3 animate-spin" /> Analiz Ediliyor...</>
                        ) : (
                          <><Eye className="w-3 h-3" /> AI ile Analiz Et</>
                        )}
                      </button>
                      {photoAnalysis && (
                        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3">
                          <p className="text-[10px] font-bold text-purple-400 mb-2 flex items-center gap-1">
                            <BrainCircuit className="w-3 h-3" /> AI Fotoğraf Analizi
                          </p>
                          <div className="text-[10px] text-slate-300 whitespace-pre-wrap leading-relaxed">
                            {photoAnalysis}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </section>

                {/* Concept/Reference Image Upload */}
                <section className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <ImageIcon className="w-3 h-3" /> Konsept / Referans Görsel (Opsiyonel)
                  </label>
                  <div
                    onClick={() => conceptInputRef.current.click()}
                    className={`border-2 border-dashed rounded-xl p-4 cursor-pointer transition-all ${
                      conceptImage ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-white/10 bg-black/40 hover:bg-white/5'
                    }`}
                  >
                    <input type="file" ref={conceptInputRef} onChange={handleConceptUpload} className="hidden" accept="image/*" />
                    {conceptImage ? (
                      <div className="flex items-center gap-4">
                        <img src={conceptImage} className="w-16 h-16 rounded-lg object-cover" alt="Concept" />
                        <div className="flex-1">
                          <p className="text-xs font-bold text-emerald-400">Konsept Yüklendi</p>
                          <p className="text-[10px] text-slate-600">Değiştirmek için tıkla</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4 opacity-40">
                        <Palette className="w-6 h-6 mx-auto mb-2" />
                        <p className="text-xs font-bold">Referans Görsel Yükle</p>
                        <p className="text-[10px] text-slate-500 mt-1">Örnek thumbnail veya stil referansı</p>
                      </div>
                    )}
                  </div>
                  {/* Concept Analysis Button & Result */}
                  {conceptImage && (
                    <div className="space-y-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); analyzeConceptImage(); }}
                        disabled={isAnalyzingConcept || !apiKey}
                        className="w-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-2 hover:from-emerald-500/30 hover:to-teal-500/30 transition-all disabled:opacity-50"
                      >
                        {isAnalyzingConcept ? (
                          <><RefreshCcw className="w-3 h-3 animate-spin" /> Analiz Ediliyor...</>
                        ) : (
                          <><Eye className="w-3 h-3" /> AI ile Analiz Et</>
                        )}
                      </button>
                      {conceptAnalysis && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                          <p className="text-[10px] font-bold text-emerald-400 mb-2 flex items-center gap-1">
                            <BrainCircuit className="w-3 h-3" /> AI Konsept Analizi
                          </p>
                          <div className="text-[10px] text-slate-300 whitespace-pre-wrap leading-relaxed">
                            {conceptAnalysis}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </section>

                {/* Extra Request */}
                <section className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <Sparkles className="w-3 h-3" /> Ekstra İstek (Opsiyonel)
                  </label>
                  <textarea
                    value={extraRequest}
                    onChange={(e) => setExtraRequest(e.target.value)}
                    placeholder="Örn: Arka planda yeşil sis olsun..."
                    className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/40 min-h-[60px]"
                  />
                </section>

                <button
                  onClick={generateThumbnail}
                  disabled={loading || !image || !topic || !apiKey}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-black py-4 rounded-xl transition-all disabled:opacity-30 flex items-center justify-center gap-3 text-sm"
                >
                  {loading ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                  {loading ? 'Oluşturuluyor...' : 'Thumbnail Oluştur'}
                </button>

                {error && <p className="text-xs text-red-500 font-bold text-center">{error}</p>}
              </div>
            </div>

            {/* Right: Result & Preview */}
            <div className="xl:col-span-8 space-y-6">

              {/* Result Image */}
              <div className="bg-[#101014] rounded-3xl p-6 border border-white/5 min-h-[400px] flex flex-col items-center justify-center">
                {!resultImage && !loading && (
                  <div className="text-center opacity-20">
                    <Monitor className="w-24 h-24 mx-auto mb-4" />
                    <p className="text-lg font-bold">Stüdyo Hazır</p>
                    <p className="text-sm text-slate-500">Thumbnail oluşturmak için formu doldurun</p>
                  </div>
                )}

                {loading && (
                  <div className="text-center">
                    <div className="relative inline-block mb-6">
                      <div className="w-32 h-32 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin" />
                      <BrainCircuit className="w-12 h-12 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                    </div>
                    <p className="text-2xl font-black text-white animate-pulse">İşleniyor...</p>
                    <p className="text-sm text-blue-400 mt-2">AI thumbnail oluşturuyor</p>
                  </div>
                )}

                {resultImage && !loading && (
                  <div className="w-full space-y-6">
                    {/* Before/After Comparison */}
                    {previousImage && (
                      <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-2xl p-4 border border-white/10">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-blue-400" />
                            <span className="text-sm font-bold text-white">Önce / Sonra Karşılaştırması</span>
                          </div>
                          {/* Score Comparison */}
                          {previousCtrScore && ctrScore && (
                            <div className="flex items-center gap-2 bg-green-500/20 px-3 py-1 rounded-full">
                              <span className="text-slate-400 text-xs">{previousCtrScore.score}</span>
                              <ArrowRight className="w-3 h-3 text-green-400" />
                              <span className="text-green-400 font-bold text-sm">{ctrScore.score}</span>
                              <span className="text-green-400 text-xs font-bold">
                                (+{ctrScore.score - previousCtrScore.score})
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="relative">
                            <div className="flex items-center justify-center gap-2 mb-1">
                              <p className="text-[10px] text-slate-400 uppercase text-center">Önceki</p>
                              {previousCtrScore && (
                                <span className="text-xs text-slate-500 font-bold">{previousCtrScore.score} puan</span>
                              )}
                            </div>
                            <div className="rounded-xl overflow-hidden border border-white/10">
                              <img src={previousImage} alt="Before" className="w-full h-auto opacity-70" />
                            </div>
                          </div>
                          <div className="relative">
                            <div className="flex items-center justify-center gap-2 mb-1">
                              <p className="text-[10px] text-green-400 uppercase font-bold">Optimize Edildi ✓</p>
                              {ctrScore && (
                                <span className="text-xs text-green-400 font-bold">{ctrScore.score} puan</span>
                              )}
                            </div>
                            <div className="rounded-xl overflow-hidden border border-green-500/30 ring-2 ring-green-500/20">
                              <img src={resultImage} alt="After" className="w-full h-auto" />
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setPreviousImage(null);
                            setPreviousCtrScore(null);
                          }}
                          className="mt-3 text-xs text-slate-400 hover:text-white flex items-center gap-1 mx-auto"
                        >
                          <X className="w-3 h-3" /> Karşılaştırmayı kapat
                        </button>
                      </div>
                    )}

                    {/* Result Image (only show if not comparing) */}
                    {!previousImage && (
                      <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                        <img src={resultImage} alt="Result" className="w-full h-auto" />
                      </div>
                    )}

                    {/* CTR Score Card */}
                    {ctrScore && (
                      <CTRScoreCard
                        score={ctrScore.score}
                        likelihood={ctrScore.likelihood}
                        likelihoodColor={ctrScore.likelihoodColor}
                        issues={ctrScore.issues}
                        boosts={ctrScore.boosts}
                        onMakeClickable={makeMoreClickable}
                        isLoading={isOptimizing}
                      />
                    )}

                    <div className="flex flex-wrap gap-3 justify-center">
                      <button
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = resultImage;
                          link.download = `thumbnail-${Date.now()}.png`;
                          link.click();
                        }}
                        className="bg-white text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-100 transition-all"
                      >
                        <Download className="w-4 h-4" />
                        İndir
                      </button>
                      <button
                        onClick={() => setShowYouTubeMockup(true)}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all"
                      >
                        <Youtube className="w-4 h-4" />
                        YouTube'da Gör
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default App;
