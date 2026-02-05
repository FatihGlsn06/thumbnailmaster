import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Image as ImageIcon, Sparkles, Download, RefreshCcw,
  Type, BrainCircuit, Check, Monitor, Wand2, AlertTriangle, Palette, Eye,
  Layers, Flame, Key, EyeOff, Zap, Play, Youtube,
  ChevronDown, Star, ArrowRight, MoreVertical, Search, Bell, Mic,
  Menu, Home, Compass, PlaySquare, Clock, ThumbsUp, Film, Gamepad2,
  Music, Radio, Trophy, Lightbulb, Shirt, X, User
} from 'lucide-react';

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

// Fake popular YouTube videos data
const fakeVideos = [
  { channel: 'MrBeast', avatar: '🟣', title: '$1 vs $1,000,000 Hotel Room!', views: '156M views', time: '2 months ago', duration: '18:24', color: 'from-purple-500 to-blue-500' },
  { channel: 'PewDiePie', avatar: '🔴', title: 'I Played the Worlds Hardest Game', views: '8.2M views', time: '3 days ago', duration: '22:15', color: 'from-red-500 to-red-700' },
  { channel: 'Markiplier', avatar: '🩷', title: 'This Game Broke My Brain...', views: '4.1M views', time: '1 week ago', duration: '31:42', color: 'from-pink-500 to-red-500' },
  { channel: 'Dream', avatar: '🟢', title: 'Minecraft Manhunt GRAND FINALE', views: '45M views', time: '8 months ago', duration: '45:18', color: 'from-green-500 to-emerald-600' },
  { channel: 'Ninja', avatar: '🔵', title: 'I Returned to Fortnite...', views: '2.8M views', time: '5 days ago', duration: '16:33', color: 'from-blue-500 to-cyan-500' },
  { channel: 'xQc', avatar: '⚪', title: 'REACTING TO THE CRAZIEST CLIPS', views: '1.2M views', time: '12 hours ago', duration: '2:34:11', color: 'from-slate-400 to-slate-600' },
  { channel: 'Jacksepticeye', avatar: '💚', title: 'The BEST Horror Game of 2024', views: '3.5M views', time: '2 weeks ago', duration: '28:45', color: 'from-green-400 to-green-600' },
  { channel: 'Ludwig', avatar: '🟠', title: 'I Hosted a $100,000 Tournament', views: '5.6M views', time: '1 month ago', duration: '52:18', color: 'from-orange-500 to-amber-500' },
  { channel: 'Shroud', avatar: '🔘', title: 'My Aim is STILL Unmatched', views: '980K views', time: '4 days ago', duration: '19:22', color: 'from-gray-500 to-gray-700' },
  { channel: 'Valkyrae', avatar: '💛', title: 'Playing with 100 Fans!', views: '1.8M views', time: '6 days ago', duration: '1:12:45', color: 'from-yellow-400 to-orange-400' },
];

// YouTube Video Card Component
const YouTubeVideoCard = ({ thumbnail, title, channel, views, time, duration, avatar, color, isHighlighted }) => (
  <div className={`group cursor-pointer ${isHighlighted ? 'ring-2 ring-red-500 ring-offset-2 ring-offset-[#0f0f0f] rounded-xl' : ''}`}>
    {/* Thumbnail */}
    <div className="relative aspect-video rounded-xl overflow-hidden mb-3">
      {thumbnail ? (
        <img src={thumbnail} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
      ) : (
        <div className={`w-full h-full bg-gradient-to-br ${color} flex items-center justify-center`}>
          <Play className="w-12 h-12 text-white/80" />
        </div>
      )}
      <div className="absolute bottom-1 right-1 bg-black/90 text-white text-[10px] px-1 py-0.5 rounded font-medium">
        {duration}
      </div>
      {isHighlighted && (
        <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] px-2 py-1 rounded font-bold animate-pulse">
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

// Full YouTube Mockup Page
const YouTubeMockup = ({ thumbnail, title, channelName, onClose }) => {
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

  // Mix user video randomly into fake videos
  const allVideos = [...fakeVideos];
  const insertIndex = Math.floor(Math.random() * 3) + 1; // Insert between position 1-3
  allVideos.splice(insertIndex, 0, userVideo);

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
      className="fixed inset-0 z-50 bg-[#0f0f0f] overflow-hidden"
    >
      {/* YouTube Header */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-[#0f0f0f] border-b border-white/10 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-white/10 rounded-full">
            <Menu className="w-6 h-6 text-white" />
          </button>
          <div className="flex items-center gap-1">
            <div className="bg-red-600 rounded-lg p-1">
              <Play className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="text-white text-xl font-semibold tracking-tight">YouTube</span>
            <span className="text-[#aaa] text-[10px] align-super">TR</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl mx-8">
          <div className="flex">
            <div className="flex-1 flex items-center bg-[#121212] border border-[#303030] rounded-l-full px-4 py-2">
              <input
                type="text"
                placeholder="Ara"
                className="bg-transparent text-white w-full outline-none text-sm"
              />
            </div>
            <button className="bg-[#222] border border-l-0 border-[#303030] rounded-r-full px-5 hover:bg-[#333] transition-colors">
              <Search className="w-5 h-5 text-white" />
            </button>
            <button className="ml-3 p-2.5 bg-[#222] rounded-full hover:bg-[#333] transition-colors">
              <Mic className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-white/10 rounded-full">
            <Bell className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={onClose}
            className="ml-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <X className="w-4 h-4" />
            Önizlemeyi Kapat
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 ml-2" />
        </div>
      </header>

      <div className="flex pt-14 h-screen">
        {/* Sidebar */}
        <aside className="w-60 bg-[#0f0f0f] overflow-y-auto flex-shrink-0 hidden lg:block">
          <nav className="py-3">
            {sidebarItems.map((item, index) => (
              item.divider ? (
                <hr key={index} className="my-3 border-white/10" />
              ) : item.header ? (
                <p key={index} className="px-6 py-2 text-white/60 text-sm font-medium">{item.label}</p>
              ) : (
                <button
                  key={index}
                  className={`w-full flex items-center gap-6 px-6 py-2.5 hover:bg-white/10 transition-colors ${
                    item.active ? 'bg-white/10' : ''
                  }`}
                >
                  <span className={item.active ? 'text-white' : 'text-white/80'}>{item.icon}</span>
                  <span className={`text-sm ${item.active ? 'text-white font-medium' : 'text-white/80'}`}>{item.label}</span>
                </button>
              )
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-[#0f0f0f]">
          {/* Category Pills */}
          <div className="sticky top-0 bg-[#0f0f0f] z-10 px-6 py-3 flex gap-3 overflow-x-auto no-scrollbar border-b border-white/5">
            {categories.map((cat, index) => (
              <button
                key={cat}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  index === 0
                    ? 'bg-white text-black'
                    : 'bg-[#272727] text-white hover:bg-[#3f3f3f]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Video Grid */}
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
              {allVideos.map((video, index) => (
                <YouTubeVideoCard
                  key={index}
                  thumbnail={video.thumbnail}
                  title={video.title}
                  channel={video.channel}
                  views={video.views}
                  time={video.time}
                  duration={video.duration}
                  avatar={video.avatar}
                  color={video.color}
                  isHighlighted={video.isHighlighted}
                />
              ))}
            </div>
          </div>
        </main>
      </div>
    </motion.div>
  );
};

const App = () => {
  const [currentSection, setCurrentSection] = useState('landing');
  const [image, setImage] = useState(null);
  const [base64Image, setBase64Image] = useState(null);
  const [topic, setTopic] = useState('');
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

    const selectedTypo = typographyOptions.find(t => t.id === typoStyle);

    try {
      const prompt = `You are an elite YouTube thumbnail designer. Create a HORIZONTAL 16:9 aspect ratio thumbnail (1280x720 pixels) for "${topic}".

CRITICAL FORMAT REQUIREMENT:
- Output MUST be LANDSCAPE orientation (wider than tall)
- Aspect ratio MUST be exactly 16:9
- DO NOT create portrait/vertical images

REFERENCE PHOTO INTEGRATION:
The provided photo shows the person who must appear in the thumbnail.
- SEAMLESSLY BLEND the person into the scene - NOT a simple cutout or paste
- Match the lighting direction on the person's face to the scene lighting
- Add subtle rim lighting/glow on the person that matches the scene's color palette
- The person should look like they BELONG in this world
- Keep the person's face UNCHANGED and recognizable
- Position the person on the LEFT or RIGHT third of the frame (rule of thirds)

TEXT OVERLAY: "${overlayText || topic}"
- Place bold, 3D text with strong contrast
- Text should have thick black stroke/outline for readability
- Add glow effect matching the scene's "power color"
- Position text on the opposite side from the person
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

                {/* Video Topic */}
                <section className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <Layers className="w-3 h-3" /> Video Konusu
                  </label>
                  <textarea
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Örn: Warhammer 3 Skaven"
                    className="w-full bg-black/40 border border-white/5 rounded-xl p-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/40 min-h-[80px]"
                  />
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
                    <ImageIcon className="w-3 h-3" /> Referans Fotoğraf
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
                        <div>
                          <p className="text-xs font-bold text-blue-400">Yüklendi</p>
                          <p className="text-[10px] text-slate-600">Değiştirmek için tıkla</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4 opacity-40">
                        <Upload className="w-6 h-6 mx-auto mb-2" />
                        <p className="text-xs font-bold">Fotoğraf Yükle</p>
                      </div>
                    )}
                  </div>
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
                    <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                      <img src={resultImage} alt="Result" className="w-full h-auto" />
                    </div>

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
