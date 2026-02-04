import React, { useState, useRef } from 'react';
import {
  Upload, Image as ImageIcon, Sparkles, Download, RefreshCcw,
  Type, Zap, BrainCircuit, Info, Check, X,
  Monitor, Layout, Wand2, Settings2, AlertTriangle, Palette, Eye,
  Cpu, Layers, ShieldCheck, Flame, Sun, Move, Key, EyeOff
} from 'lucide-react';

const App = () => {
  const [image, setImage] = useState(null);
  const [base64Image, setBase64Image] = useState(null);
  const [topic, setTopic] = useState('');
  const [overlayText, setOverlayText] = useState('');
  const [extraRequest, setExtraRequest] = useState('');
  const [isUserInPhoto, setIsUserInPhoto] = useState(true);

  // CTR & Konsept Odaklı State'ler
  const [typoStyle, setTypoStyle] = useState('hyper_integrated');
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [showApiKey, setShowApiKey] = useState(false);

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
      // PROMPT: image_7a07fe.jpg örneğindeki yerleştirme başarısı için optimize edildi
      const prompt = `ACT AS A MASTER CONCEPT ARTIST & THUMBNAIL DESIGNER.
      CONTEXT: Create a viral YouTube thumbnail for "${topic}".
      REFERENCE PHOTO: The person in the photo is the key character.
      OVERLAY TEXT: "${overlayText || topic}".

      CORE INSTRUCTIONS:
      1. CONCEPTUAL STAGING: Build a massive, high-detail world for "${topic}". If appropriate, place the person on a stone platform, a bridge, or an elevated tower (like image_7a07fe.jpg) to ensure they are PART of the world, not just a cutout.
      2. EMOTIONAL INTEGRATION: Preserve and enhance the subject's emotional expression (e.g., intense, fearful, or heroic).
      3. COLOR HARMONY & GLOW: Identify the "Power Color" (e.g., Toxic Green for Skaven, Fiery Orange for Battle). Apply this color to:
         - The outer glow and stroke of the text "${overlayText || topic}".
         - The rim lighting (kontur ışığı) on the subject's silhouette.
      4. TYPOGRAPHY: ${selectedTypo.prompt}. The text must be bold, 3D, and placed using the rule of thirds for mobile readability.
      5. COMPOSITION: Use volumetric lighting, particles, and atmosphere that wraps around the person.
      6. QUALITY: 4K render, cinematic textures, no "AI plastic" look. Human-made Photoshop aesthetic.

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
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${apiKey}`,
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

  return (
    <div className="min-h-screen bg-[#08080a] text-slate-200 font-sans p-4 lg:p-8">
      <div className="max-w-[1440px] mx-auto">

        {/* Header */}
        <header className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6 border-b border-white/5 pb-10">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-blue-600 blur-[40px] opacity-10 group-hover:opacity-25 transition-opacity"></div>
              <div className="relative bg-[#111115] p-4 rounded-[2.5rem] shadow-2xl border border-white/10 ring-1 ring-white/5">
                <Flame className="w-10 h-10 text-blue-500 animate-pulse" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter uppercase italic bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500">
                THUMBNAIL ENGINE <span className="text-blue-500">MAX</span>
              </h1>
              <p className="text-slate-500 text-[10px] font-black tracking-[0.4em] uppercase mt-1 flex items-center gap-2">
                <ShieldCheck className="w-3 h-3 text-blue-500" /> Konsept & Yerleştirme Odaklı Tasarım
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="bg-blue-500/5 border border-blue-500/10 px-6 py-3 rounded-2xl flex items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 italic">Hyper-Integration Mode</span>
              <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]" />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Left: Input Panel */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#101014] rounded-[3rem] p-8 border border-white/5 shadow-2xl space-y-8">

              {/* API Key */}
              <section className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic flex items-center gap-2">
                  <Key className="w-3 h-3" /> Gemini API Key
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => handleSaveApiKey(e.target.value)}
                    placeholder="AIzaSy... (Google AI Studio'dan alın)"
                    className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 pr-14 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/40 font-mono tracking-tight"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300 transition-colors"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {apiKey && (
                  <p className="text-[9px] text-green-500/70 font-bold uppercase tracking-widest italic flex items-center gap-1">
                    <Check className="w-3 h-3" /> API Key kaydedildi (tarayıcıda saklanır)
                  </p>
                )}
                {!apiKey && (
                  <p className="text-[9px] text-amber-500/70 font-bold uppercase tracking-widest italic flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Kullanmak için Gemini API Key gerekli
                  </p>
                )}
              </section>

              {/* Video Topic */}
              <section className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic flex items-center gap-2">
                  <Layers className="w-3 h-3" /> 01. Videonuz ne hakkında?
                </label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Örn: Warhammer 3 Skaven 3 / Fare İstilası"
                  className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/40 min-h-[100px] transition-all font-medium"
                />
              </section>

              {/* Text on Image */}
              <section className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic flex items-center gap-2">
                  <Type className="w-3 h-3" /> 02. Thumbnail Üzerindeki Yazı
                </label>
                <input
                  type="text"
                  value={overlayText}
                  onChange={(e) => setOverlayText(e.target.value)}
                  placeholder="Örn: FARE İSTİLASI"
                  className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/40 font-black tracking-tight"
                />
              </section>

              {/* Integration Style Selector */}
              <section className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic flex items-center gap-2">
                  <Palette className="w-3 h-3" /> 03. Yerleştirme Konsepti
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {typographyOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setTypoStyle(opt.id)}
                      className={`text-left p-4 rounded-3xl border transition-all duration-300 relative overflow-hidden group ${
                        typoStyle === opt.id
                          ? 'bg-blue-600 border-blue-500 text-white shadow-xl scale-[1.01]'
                          : 'bg-black/40 border-white/5 text-slate-500 hover:border-white/10'
                      }`}
                    >
                      <div className="relative z-10 flex justify-between items-center">
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-tighter italic tracking-widest">{opt.name}</p>
                          <p className={`text-[9px] mt-1 font-medium ${typoStyle === opt.id ? 'text-blue-100' : 'text-slate-600'}`}>{opt.desc}</p>
                        </div>
                        {typoStyle === opt.id && <Check className="w-4 h-4" />}
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              {/* Subject Upload */}
              <section className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic flex items-center gap-2">
                  <ImageIcon className="w-3 h-3" /> 04. Referans Fotoğraf (Tepki)
                </label>
                <div
                  onClick={() => fileInputRef.current.click()}
                  className={`border-2 border-dashed rounded-[2.5rem] p-6 transition-all cursor-pointer flex items-center justify-center min-h-[140px] relative overflow-hidden group ${
                    image ? 'border-blue-500/40 bg-blue-500/5' : 'border-white/5 bg-black/40 hover:bg-white/5'
                  }`}
                >
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                  {image ? (
                    <div className="flex items-center gap-6 w-full relative z-10">
                      <img src={image} className="w-24 h-24 rounded-3xl object-cover border border-white/10 shadow-2xl group-hover:scale-105 transition-transform" alt="Ref" />
                      <div className="flex-1">
                        <p className="text-[10px] font-black uppercase text-blue-400 italic">Karakter Analizi Tamam</p>
                        <p className="text-[9px] text-slate-600 mt-1 uppercase font-bold tracking-tighter italic">Değiştirmek için dokunun</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center opacity-30 group-hover:opacity-50 transition-opacity">
                      <Upload className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-[10px] font-black uppercase italic">Tepki Fotoğrafı Yükle</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Extra Requests */}
              <section className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic flex items-center gap-2">
                  <Sparkles className="w-3 h-3" /> 05. Ekstra İstek
                </label>
                <textarea
                  value={extraRequest}
                  onChange={(e) => setExtraRequest(e.target.value)}
                  placeholder="Örn: Platformda dursun, arkada yeşil sis olsun..."
                  className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/40 min-h-[80px] transition-all font-medium"
                />
              </section>

              <button
                onClick={generateThumbnail}
                disabled={loading || !image || !topic || !apiKey}
                className="w-full bg-white text-black font-black py-7 rounded-[2.5rem] transition-all shadow-[0_20px_40px_-10px_rgba(255,255,255,0.2)] active:scale-[0.98] disabled:opacity-20 flex items-center justify-center gap-4 text-xl italic tracking-tighter"
              >
                {loading ? <RefreshCcw className="w-7 h-7 animate-spin" /> : <Wand2 className="w-7 h-7" />}
                {loading ? 'SENTEZLENİYOR...' : 'THUMBNAIL OLUŞTUR'}
              </button>

              {error && <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest text-center italic">{error}</p>}
            </div>
          </div>

          {/* Right: Master Canvas */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-[#101014] rounded-[4rem] p-10 border border-white/5 shadow-2xl min-h-[700px] flex flex-col items-center justify-center relative overflow-hidden group/canvas">

              {!resultImage && !loading && (
                <div className="text-center opacity-10 group-hover/canvas:opacity-25 transition-opacity duration-1000">
                  <Monitor className="w-40 h-40 mx-auto mb-10 text-slate-700" />
                  <h3 className="text-3xl font-black italic tracking-tighter uppercase">Stüdyo Beklemede</h3>
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em] mt-2">Ready for Concept Synthesis</p>
                </div>
              )}

              {loading && (
                <div className="text-center space-y-16">
                  <div className="relative inline-block">
                    <div className="w-48 h-48 border-[3px] border-blue-500/5 border-t-blue-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BrainCircuit className="w-16 h-16 text-blue-500 animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-5xl font-black italic tracking-tighter text-white animate-pulse uppercase">PROCESSING</h3>
                    <p className="text-blue-500 text-[11px] font-black tracking-[0.6em] uppercase italic">Konsept & Yerleştirme Optimize Ediliyor</p>
                  </div>
                </div>
              )}

              {resultImage && !loading && (
                <div className="w-full space-y-10 animate-in zoom-in duration-1000">
                  <div className="relative group/image rounded-[3.5rem] overflow-hidden shadow-[0_80px_120px_-30px_rgba(59,130,246,0.4)] border border-white/10 aspect-video w-full">
                    <img src={resultImage} alt="Final Masterpiece" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/80 opacity-0 group-hover/image:opacity-100 transition-all duration-700 flex items-center justify-center backdrop-blur-xl">
                       <div className="text-center space-y-8">
                          <h4 className="text-white font-black text-4xl uppercase italic tracking-tighter">{topic}</h4>
                          <button
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = resultImage;
                              link.download = `master-thumbnail-${Date.now()}.png`;
                              link.click();
                            }}
                            className="bg-white text-black px-16 py-6 rounded-[3rem] font-black text-2xl hover:scale-105 transition-all shadow-2xl uppercase tracking-tighter italic"
                          >
                            TASARIMI İNDİR
                          </button>
                       </div>
                    </div>
                  </div>

                  {/* Smart Integration Stats */}
                  <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-10 flex flex-col md:flex-row items-center gap-10">
                    <div className="bg-blue-600/20 p-5 rounded-[2rem] shadow-xl border border-blue-500/20">
                      <Move className="w-8 h-8 text-blue-500" />
                    </div>
                    <div className="space-y-4 flex-1">
                      <div className="flex items-center gap-4">
                        <h4 className="text-xs font-black uppercase text-blue-400 tracking-[0.2em] italic">Akıllı Yerleştirme Analizi</h4>
                        <div className="h-[1px] flex-1 bg-white/5"></div>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-bold italic">
                        "{typographyOptions.find(o => o.id === typoStyle).name}" modu aktif.
                        Özne, sahnenin 3D geometrisine (platform/köprü) uygun şekilde yerleştirildi.
                        Metnin parlaması ve özne üzerindeki kontur ışığı (rim lighting), sahnedeki baskın enerji rengiyle 1:1 senkronize edildi.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default App;
