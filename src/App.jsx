import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Upload, Image as ImageIcon, Sparkles, Download, RefreshCcw,
  Type, BrainCircuit, Check, Monitor, Wand2, AlertTriangle, Palette, Eye,
  Layers, ShieldCheck, Flame, Move, Key, EyeOff, Zap, Play, Youtube,
  ChevronDown, Star, ArrowRight, Clock, ThumbsUp, MoreVertical
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

// YouTube Preview Mockup Component
const YouTubePreview = ({ thumbnail, title }) => (
  <div className="bg-[#0f0f0f] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
    {/* Video Thumbnail */}
    <div className="relative aspect-video group cursor-pointer">
      <img src={thumbnail} alt="Thumbnail" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all shadow-2xl">
          <Play className="w-7 h-7 text-white fill-white ml-1" />
        </div>
      </div>
      {/* Duration */}
      <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-medium">
        12:34
      </div>
    </div>

    {/* Video Info */}
    <div className="p-3 flex gap-3">
      {/* Channel Avatar */}
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0" />

      <div className="flex-1 min-w-0">
        {/* Title */}
        <h3 className="text-white text-sm font-medium line-clamp-2 leading-tight mb-1">
          {title || 'Video Başlığınız Burada Görünecek'}
        </h3>
        {/* Channel Name */}
        <p className="text-[#aaa] text-xs">Kanal Adınız</p>
        {/* Views & Time */}
        <p className="text-[#aaa] text-xs flex items-center gap-1">
          <span>1.2M views</span>
          <span>•</span>
          <span>2 hours ago</span>
        </p>
      </div>

      <button className="text-white/60 hover:text-white self-start">
        <MoreVertical className="w-5 h-5" />
      </button>
    </div>
  </div>
);

// YouTube Search Result Preview
const YouTubeSearchPreview = ({ thumbnail, title }) => (
  <div className="bg-[#0f0f0f] rounded-xl overflow-hidden border border-white/10">
    <div className="flex gap-4 p-2">
      {/* Thumbnail */}
      <div className="relative w-[360px] aspect-video rounded-lg overflow-hidden flex-shrink-0 group cursor-pointer">
        <img src={thumbnail} alt="Thumbnail" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
          <div className="w-12 h-12 bg-red-600/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
          </div>
        </div>
        <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1 py-0.5 rounded">
          12:34
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 py-1">
        <h3 className="text-white text-lg font-medium line-clamp-2 leading-snug mb-2">
          {title || 'Video Başlığınız Burada Görünecek'}
        </h3>
        <p className="text-[#aaa] text-xs mb-2 flex items-center gap-2">
          <span>1.2M views</span>
          <span>•</span>
          <span>2 hours ago</span>
        </p>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600" />
          <span className="text-[#aaa] text-xs">Kanal Adınız</span>
        </div>
        <p className="text-[#aaa] text-xs line-clamp-1">
          Bu video hakkında kısa açıklama buraya gelecek...
        </p>
      </div>
    </div>
  </div>
);

const App = () => {
  const [currentSection, setCurrentSection] = useState('landing');
  const [image, setImage] = useState(null);
  const [base64Image, setBase64Image] = useState(null);
  const [topic, setTopic] = useState('');
  const [overlayText, setOverlayText] = useState('');
  const [extraRequest, setExtraRequest] = useState('');
  const [typoStyle, setTypoStyle] = useState('hyper_integrated');
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [showYouTubePreview, setShowYouTubePreview] = useState(false);

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
      const prompt = `ACT AS A MASTER CONCEPT ARTIST & THUMBNAIL DESIGNER.
      CONTEXT: Create a viral YouTube thumbnail for "${topic}".
      REFERENCE PHOTO: The person in the photo is the key character.
      OVERLAY TEXT: "${overlayText || topic}".

      CORE INSTRUCTIONS:
      1. CONCEPTUAL STAGING: Build a massive, high-detail world for "${topic}". If appropriate, place the person on a stone platform, a bridge, or an elevated tower to ensure they are PART of the world, not just a cutout.
      2. EMOTIONAL INTEGRATION: Preserve and enhance the subject's emotional expression.
      3. COLOR HARMONY & GLOW: Identify the "Power Color". Apply this color to the outer glow and stroke of the text and rim lighting on the subject's silhouette.
      4. TYPOGRAPHY: ${selectedTypo.prompt}. The text must be bold, 3D, and placed using the rule of thirds for mobile readability.
      5. COMPOSITION: Use volumetric lighting, particles, and atmosphere that wraps around the person.
      6. QUALITY: 4K render, cinematic textures, no "AI plastic" look.

      ${extraRequest ? `EXTRA DETAIL: ${extraRequest}` : ''}`;

      const payload = {
        contents: [{
          parts: [
            { text: prompt },
            { inlineData: { mimeType: "image/png", data: base64Image } }
          ]
        }],
        generationConfig: {
          responseModalities: ['TEXT', 'IMAGE'],
          temperature: 0.5,
          topP: 0.95
        }
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
                      onClick={() => setShowYouTubePreview(!showYouTubePreview)}
                      className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
                        showYouTubePreview
                          ? 'bg-red-600 text-white'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      <Youtube className="w-4 h-4" />
                      YouTube Önizleme
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* YouTube Preview Section */}
            {resultImage && showYouTubePreview && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-2 text-white/60">
                  <Youtube className="w-5 h-5 text-red-500" />
                  <span className="text-sm font-bold">YouTube'da Nasıl Görünecek?</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Card Preview */}
                  <div className="space-y-3">
                    <p className="text-xs text-white/40 font-bold uppercase">Ana Sayfa / Önerilen</p>
                    <YouTubePreview thumbnail={resultImage} title={topic || overlayText} />
                  </div>

                  {/* Search Result Preview */}
                  <div className="space-y-3">
                    <p className="text-xs text-white/40 font-bold uppercase">Arama Sonuçları</p>
                    <YouTubeSearchPreview thumbnail={resultImage} title={topic || overlayText} />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
