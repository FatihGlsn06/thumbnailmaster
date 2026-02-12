import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Type, Image as ImageIcon, Download, X, Plus, Trash2,
  Upload, Palette, Bold, Italic, Layers, Eye, EyeOff, Copy,
  Search, Sparkles, Move, RotateCcw, ZoomIn, ZoomOut
} from 'lucide-react';

// Kategorize edilmiş fontlar
const FONT_CATEGORIES = [
  {
    id: 'gaming',
    name: 'Gaming & Esports',
    icon: '🎮',
    fonts: [
      { name: 'Orbitron', url: 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap', style: 'Fütüristik / Sci-Fi' },
      { name: 'Press Start 2P', url: 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap', style: 'Retro Pixel' },
      { name: 'Bungee', url: 'https://fonts.googleapis.com/css2?family=Bungee&display=swap', style: 'Kalın Blok' },
      { name: 'Black Ops One', url: 'https://fonts.googleapis.com/css2?family=Black+Ops+One&display=swap', style: 'Askeri / FPS' },
      { name: 'Russo One', url: 'https://fonts.googleapis.com/css2?family=Russo+One&display=swap', style: 'Mekanik / Robot' },
      { name: 'Audiowide', url: 'https://fonts.googleapis.com/css2?family=Audiowide&display=swap', style: 'Neon / Cyber' },
    ],
  },
  {
    id: 'youtube',
    name: 'YouTube & Sosyal Medya',
    icon: '📺',
    fonts: [
      { name: 'Bangers', url: 'https://fonts.googleapis.com/css2?family=Bangers&display=swap', style: 'Çizgi Roman / Eğlenceli' },
      { name: 'Luckiest Guy', url: 'https://fonts.googleapis.com/css2?family=Luckiest+Guy&display=swap', style: 'Karikatür / Enerjik' },
      { name: 'Lilita One', url: 'https://fonts.googleapis.com/css2?family=Lilita+One&display=swap', style: 'Kalın / Dikkat Çekici' },
      { name: 'Righteous', url: 'https://fonts.googleapis.com/css2?family=Righteous&display=swap', style: 'Retro / Groovy' },
      { name: 'Fredoka One', url: 'https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap', style: 'Yumuşak / Samimi' },
      { name: 'Passion One', url: 'https://fonts.googleapis.com/css2?family=Passion+One:wght@400;700;900&display=swap', style: 'Spor / Dinamik' },
    ],
  },
  {
    id: 'cinematic',
    name: 'Sinematik & Profesyonel',
    icon: '🎬',
    fonts: [
      { name: 'Oswald', url: 'https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&display=swap', style: 'Dar / Şık' },
      { name: 'Bebas Neue', url: 'https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap', style: 'Film Afişi' },
      { name: 'Anton', url: 'https://fonts.googleapis.com/css2?family=Anton&display=swap', style: 'Güçlü Başlık' },
      { name: 'Teko', url: 'https://fonts.googleapis.com/css2?family=Teko:wght@400;600;700&display=swap', style: 'Teknik / Modern' },
      { name: 'Staatliches', url: 'https://fonts.googleapis.com/css2?family=Staatliches&display=swap', style: 'Gazete Manşeti' },
      { name: 'Big Shoulders Display', url: 'https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@400;700;900&display=swap', style: 'Endüstriyel' },
    ],
  },
  {
    id: 'decorative',
    name: 'El Yazısı & Dekoratif',
    icon: '✍️',
    fonts: [
      { name: 'Permanent Marker', url: 'https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap', style: 'Kalem / Marker' },
      { name: 'Creepster', url: 'https://fonts.googleapis.com/css2?family=Creepster&display=swap', style: 'Korku / Halloween' },
      { name: 'Special Elite', url: 'https://fonts.googleapis.com/css2?family=Special+Elite&display=swap', style: 'Daktilo' },
      { name: 'Bungee Shade', url: 'https://fonts.googleapis.com/css2?family=Bungee+Shade&display=swap', style: '3D Gölgeli' },
      { name: 'Fascinate Inline', url: 'https://fonts.googleapis.com/css2?family=Fascinate+Inline&display=swap', style: 'Art Deco' },
      { name: 'Metal Mania', url: 'https://fonts.googleapis.com/css2?family=Metal+Mania&display=swap', style: 'Metal / Rock' },
    ],
  },
];

// Hızlı stil presetleri
const STYLE_PRESETS = [
  { id: 'fire', label: '🔥 Ateşli', textColor: '#FF4500', strokeColor: '#FFD700', strokeWidth: 4 },
  { id: 'ice', label: '❄️ Buzul', textColor: '#00FFFF', strokeColor: '#0044AA', strokeWidth: 3 },
  { id: 'neon', label: '💜 Neon Mor', textColor: '#E040FB', strokeColor: '#4A148C', strokeWidth: 4 },
  { id: 'matrix', label: '💚 Matrix', textColor: '#00FF41', strokeColor: '#003300', strokeWidth: 3 },
  { id: 'electric', label: '⚡ Elektrik', textColor: '#FFEB3B', strokeColor: '#FF6D00', strokeWidth: 4 },
  { id: 'clean', label: '🖤 Temiz', textColor: '#FFFFFF', strokeColor: '#000000', strokeWidth: 3 },
  { id: 'blood', label: '🩸 Kanlı', textColor: '#8B0000', strokeColor: '#000000', strokeWidth: 3 },
  { id: 'gold', label: '👑 Altın', textColor: '#FFD700', strokeColor: '#8B4513', strokeWidth: 4 },
];

const ThumbnailEditor = ({ thumbnail, onClose, onSave }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const fontInputRef = useRef(null);
  const logoInputRef = useRef(null);

  // Layers state
  const [layers, setLayers] = useState([]);
  const [selectedLayerId, setSelectedLayerId] = useState(null);
  const [customFonts, setCustomFonts] = useState([]);
  const [loadedFonts, setLoadedFonts] = useState(new Set());

  // UI state
  const [activeTab, setActiveTab] = useState('text');
  const [activeCategory, setActiveCategory] = useState('gaming');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [fontDragOver, setFontDragOver] = useState(false);
  const [logoDragOver, setLogoDragOver] = useState(false);

  // Canvas
  const [scale, setScale] = useState(1);
  const [baseImage, setBaseImage] = useState(null);

  // Load font helper
  const loadFont = useCallback((fontName, url) => {
    if (loadedFonts.has(fontName)) return;
    const link = document.createElement('link');
    link.href = url;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    setLoadedFonts(prev => new Set([...prev, fontName]));
  }, [loadedFonts]);

  // Load all preset fonts
  useEffect(() => {
    FONT_CATEGORIES.forEach(cat => {
      cat.fonts.forEach(f => loadFont(f.name, f.url));
    });
  }, []);

  // Load base image
  useEffect(() => {
    if (thumbnail) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => setBaseImage(img);
      img.src = thumbnail;
    }
  }, [thumbnail]);

  // Calculate scale
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth - 48;
        const newScale = Math.min(1, containerWidth / 1280);
        setScale(newScale);
      }
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  // Draw canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !baseImage) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 1280, 720);
    ctx.drawImage(baseImage, 0, 0, 1280, 720);

    // Draw layers
    layers.filter(l => l.visible).forEach(layer => {
      ctx.save();
      ctx.translate(layer.x + layer.width / 2, layer.y + layer.height / 2);
      ctx.rotate((layer.rotation || 0) * Math.PI / 180);
      ctx.translate(-layer.width / 2, -layer.height / 2);

      if (layer.type === 'text') {
        const fontSize = layer.fontSize || 72;
        ctx.font = `${layer.italic ? 'italic' : ''} ${layer.bold ? 'bold' : ''} ${fontSize}px "${layer.fontFamily}"`.trim();
        ctx.textBaseline = 'top';
        ctx.textAlign = layer.align || 'left';

        const x = layer.align === 'center' ? layer.width / 2 : layer.align === 'right' ? layer.width : 0;

        if (layer.strokeWidth > 0) {
          ctx.strokeStyle = layer.strokeColor || '#000000';
          ctx.lineWidth = layer.strokeWidth * 2;
          ctx.lineJoin = 'round';
          ctx.strokeText(layer.text, x, 0);
        }

        ctx.fillStyle = layer.color || '#ffffff';
        ctx.fillText(layer.text, x, 0);
      } else if (layer.type === 'image' && layer.imageElement) {
        ctx.drawImage(layer.imageElement, 0, 0, layer.width, layer.height);
      }

      ctx.restore();
    });
  }, [baseImage, layers]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Add text layer
  const addTextLayer = (preset = null) => {
    const newLayer = {
      id: Date.now(),
      type: 'text',
      text: 'YAZI EKLE',
      x: 100,
      y: 500,
      width: 500,
      height: 120,
      fontSize: 72,
      fontFamily: 'Bangers',
      color: preset?.textColor || '#ffffff',
      strokeColor: preset?.strokeColor || '#000000',
      strokeWidth: preset?.strokeWidth || 4,
      rotation: 0,
      bold: false,
      italic: false,
      align: 'left',
      visible: true
    };
    setLayers(prevLayers => [...prevLayers, newLayer]);
    setSelectedLayerId(newLayer.id);
  };

  // Handle logo upload
  const handleLogoUpload = (file) => {
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        const height = 150;
        const width = height * aspectRatio;

        const newLayer = {
          id: Date.now(),
          type: 'image',
          name: file.name,
          imageData: e.target.result,
          imageElement: img,
          x: 1280 - width - 50,
          y: 720 - height - 50,
          width,
          height,
          rotation: 0,
          visible: true
        };
        setLayers(prevLayers => [...prevLayers, newLayer]);
        setSelectedLayerId(newLayer.id);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Handle custom font upload
  const handleFontUpload = async (files) => {
    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop().toLowerCase();
      if (!['ttf', 'otf', 'woff', 'woff2'].includes(ext)) continue;

      const reader = new FileReader();
      reader.onload = async (e) => {
        const fontName = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9]/g, '_');
        try {
          const fontFace = new FontFace(fontName, `url(${e.target.result})`);
          const loaded = await fontFace.load();
          document.fonts.add(loaded);
          setCustomFonts(prev => [...prev, {
            name: fontName,
            displayName: file.name.replace(/\.[^.]+$/, ''),
            fileName: file.name,
            isCustom: true
          }]);
          setLoadedFonts(prev => new Set([...prev, fontName]));
        } catch (err) {
          console.error('Font yüklenemedi:', err);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Update layer - using functional update to avoid stale closure
  const updateLayer = (id, updates) => {
    setLayers(prevLayers => prevLayers.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  // Delete layer
  const deleteLayer = (id) => {
    setLayers(prevLayers => prevLayers.filter(l => l.id !== id));
    if (selectedLayerId === id) setSelectedLayerId(null);
  };

  // Duplicate layer
  const duplicateLayer = (id) => {
    setLayers(prevLayers => {
      const layer = prevLayers.find(l => l.id === id);
      if (layer) {
        const newLayer = { ...layer, id: Date.now(), x: layer.x + 20, y: layer.y + 20 };
        setSelectedLayerId(newLayer.id);
        return [...prevLayers, newLayer];
      }
      return prevLayers;
    });
  };

  // Apply style preset
  const applyStylePreset = (preset) => {
    if (selectedLayerId) {
      const layer = layers.find(l => l.id === selectedLayerId);
      if (layer?.type === 'text') {
        updateLayer(selectedLayerId, {
          color: preset.textColor,
          strokeColor: preset.strokeColor,
          strokeWidth: preset.strokeWidth
        });
      }
    }
  };

  // Mouse handlers for dragging
  const handleMouseDown = (e, layerId) => {
    const layer = layers.find(l => l.id === layerId);
    if (!layer) return;

    setSelectedLayerId(layerId);
    setIsDragging(true);

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    setDragOffset({ x: x - layer.x, y: y - layer.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !selectedLayerId) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    updateLayer(selectedLayerId, {
      x: Math.max(0, Math.min(1230, x - dragOffset.x)),
      y: Math.max(0, Math.min(670, y - dragOffset.y))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Export
  const exportImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `thumbnail-edited-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Save and close
  const handleSave = () => {
    const canvas = canvasRef.current;
    if (canvas && onSave) {
      onSave(canvas.toDataURL('image/png'));
    }
  };

  const selectedLayer = layers.find(l => l.id === selectedLayerId);

  // Filter fonts by search
  const getFilteredFonts = () => {
    if (searchQuery) {
      return FONT_CATEGORIES.flatMap(cat =>
        cat.fonts.filter(f =>
          f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.style.toLowerCase().includes(searchQuery.toLowerCase())
        ).map(f => ({ ...f, category: cat.name }))
      );
    }
    return FONT_CATEGORIES.find(c => c.id === activeCategory)?.fonts || [];
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-[#08080f] flex flex-col"
    >
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-gradient-to-r from-[#0d0d1a] via-[#1a0a2e] to-[#0a1628]">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
            <Type className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-white font-bold">Thumbnail Editör</h2>
            <p className="text-xs text-white/40">Yazı, logo ve stil ekleyin</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Clear All Button - only show if there are layers */}
          {layers.length > 0 && (
            <button
              onClick={() => {
                if (confirm(`${layers.length} katmanı silmek istediğinize emin misiniz?`)) {
                  setLayers([]);
                  setSelectedLayerId(null);
                }
              }}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors border border-red-500/20"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Tümünü Sil ({layers.length})</span>
            </button>
          )}
          <button
            onClick={handleSave}
            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            Kaydet
          </button>
          <button
            onClick={exportImage}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Download className="w-4 h-4" />
            İndir
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Canvas Area */}
        <div
          ref={containerRef}
          className="flex-1 p-6 overflow-auto flex items-center justify-center bg-[#0a0a12]"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div className="relative" style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}>
            <canvas
              ref={canvasRef}
              width={1280}
              height={720}
              className="border border-white/20 rounded-xl shadow-2xl"
            />

            {/* Layer handles */}
            {layers.map(layer => (
              <div
                key={layer.id}
                className={`absolute cursor-move border-2 rounded transition-colors ${
                  selectedLayerId === layer.id
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-transparent hover:border-white/30'
                } ${!layer.visible ? 'opacity-30' : ''}`}
                style={{
                  left: layer.x,
                  top: layer.y,
                  width: layer.width,
                  height: layer.height,
                  transform: `rotate(${layer.rotation || 0}deg)`
                }}
                onMouseDown={(e) => handleMouseDown(e, layer.id)}
              >
                {selectedLayerId === layer.id && (
                  <div className="absolute -top-6 left-0 flex items-center gap-1 bg-purple-600 rounded px-2 py-0.5">
                    <Move className="w-3 h-3 text-white" />
                    <span className="text-[10px] text-white font-medium">Sürükle</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-96 bg-[#101014] border-l border-white/10 flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-white/10 bg-white/[0.02]">
            {[
              { id: 'text', icon: Type, label: 'Yazı' },
              { id: 'styles', icon: Sparkles, label: 'Stiller' },
              { id: 'logo', icon: ImageIcon, label: 'Logo' },
              { id: 'layers', icon: Layers, label: 'Katmanlar' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 flex flex-col items-center gap-1 text-xs font-medium transition-all ${
                  activeTab === tab.id
                    ? 'text-white bg-gradient-to-b from-purple-500/20 to-transparent border-b-2 border-purple-500'
                    : 'text-slate-500 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* TEXT TAB */}
            {activeTab === 'text' && (
              <>
                {/* Add Text Button */}
                <button
                  onClick={() => addTextLayer()}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Yazı Ekle
                </button>

                {/* Font Upload */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setFontDragOver(true); }}
                  onDragLeave={() => setFontDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setFontDragOver(false); handleFontUpload(e.dataTransfer.files); }}
                  onClick={() => fontInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                    fontDragOver ? 'border-purple-500 bg-purple-500/10' : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <input ref={fontInputRef} type="file" accept=".ttf,.otf,.woff,.woff2" multiple hidden
                    onChange={(e) => handleFontUpload(e.target.files)} />
                  <Upload className="w-5 h-5 mx-auto mb-2 text-purple-400" />
                  <p className="text-xs text-purple-300 font-medium">Özel Font Yükle</p>
                  <p className="text-[10px] text-slate-500 mt-1">.ttf, .otf, .woff</p>
                </div>

                {/* Custom Fonts */}
                {customFonts.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-purple-400 font-bold uppercase tracking-wider">📁 Yüklenen Fontlar</p>
                    {customFonts.map((font, i) => (
                      <button
                        key={i}
                        onClick={() => selectedLayer?.type === 'text' && updateLayer(selectedLayerId, { fontFamily: font.name })}
                        className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                          selectedLayer?.fontFamily === font.name
                            ? 'bg-purple-500/20 border border-purple-500/40'
                            : 'bg-white/5 border border-transparent hover:bg-white/10'
                        }`}
                      >
                        <span style={{ fontFamily: font.name }} className="text-white">{font.displayName}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); setCustomFonts(prev => prev.filter((_, idx) => idx !== i)); }}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </button>
                    ))}
                  </div>
                )}

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Font ara..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                {/* Categories */}
                {!searchQuery && (
                  <div className="flex flex-wrap gap-2">
                    {FONT_CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          activeCategory === cat.id
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : 'bg-white/5 text-slate-400 border border-transparent hover:bg-white/10'
                        }`}
                      >
                        {cat.icon} {cat.name.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                )}

                {/* Font List */}
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {getFilteredFonts().map((font, i) => (
                    <button
                      key={i}
                      onClick={() => selectedLayer?.type === 'text' && updateLayer(selectedLayerId, { fontFamily: font.name })}
                      className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-all ${
                        selectedLayer?.fontFamily === font.name
                          ? 'bg-purple-500/20 border border-purple-500/40'
                          : 'bg-white/[0.03] border border-transparent hover:bg-white/[0.06]'
                      }`}
                    >
                      <div>
                        <span style={{ fontFamily: font.name }} className="text-white text-lg block">{font.name}</span>
                        <span className="text-[10px] text-slate-500">{font.style}</span>
                      </div>
                      <span style={{ fontFamily: font.name }} className="text-slate-600 text-sm">Abc</span>
                    </button>
                  ))}
                </div>

                {/* Text Properties */}
                {selectedLayer?.type === 'text' && (
                  <div className="space-y-3 p-3 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-xs text-slate-400 font-medium">Yazı Ayarları</p>

                    <input
                      type="text"
                      value={selectedLayer.text}
                      onChange={(e) => updateLayer(selectedLayerId, { text: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-purple-500/50"
                      placeholder="Yazı..."
                    />

                    {/* Size */}
                    <div>
                      <label className="text-[10px] text-slate-500 mb-1 block">Boyut: {selectedLayer.fontSize}px</label>
                      <input
                        type="range" min="20" max="200" value={selectedLayer.fontSize}
                        onChange={(e) => updateLayer(selectedLayerId, { fontSize: parseInt(e.target.value) })}
                        className="w-full accent-purple-500"
                      />
                    </div>

                    {/* Colors */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-500 mb-1 block">Renk</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color" value={selectedLayer.color}
                            onChange={(e) => updateLayer(selectedLayerId, { color: e.target.value })}
                            className="w-8 h-8 rounded cursor-pointer border-0"
                          />
                          <span className="text-xs text-slate-500">{selectedLayer.color}</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 mb-1 block">Kenar</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color" value={selectedLayer.strokeColor}
                            onChange={(e) => updateLayer(selectedLayerId, { strokeColor: e.target.value })}
                            className="w-8 h-8 rounded cursor-pointer border-0"
                          />
                          <span className="text-xs text-slate-500">{selectedLayer.strokeColor}</span>
                        </div>
                      </div>
                    </div>

                    {/* Stroke Width */}
                    <div>
                      <label className="text-[10px] text-slate-500 mb-1 block">Kenar: {selectedLayer.strokeWidth}px</label>
                      <input
                        type="range" min="0" max="20" value={selectedLayer.strokeWidth}
                        onChange={(e) => updateLayer(selectedLayerId, { strokeWidth: parseInt(e.target.value) })}
                        className="w-full accent-purple-500"
                      />
                    </div>

                    {/* Rotation */}
                    <div>
                      <label className="text-[10px] text-slate-500 mb-1 block">Döndürme: {selectedLayer.rotation}°</label>
                      <input
                        type="range" min="-45" max="45" value={selectedLayer.rotation}
                        onChange={(e) => updateLayer(selectedLayerId, { rotation: parseInt(e.target.value) })}
                        className="w-full accent-purple-500"
                      />
                    </div>

                    {/* Style buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateLayer(selectedLayerId, { bold: !selectedLayer.bold })}
                        className={`flex-1 p-2 rounded-lg border transition-colors ${
                          selectedLayer.bold ? 'bg-purple-600 border-purple-500' : 'bg-black/40 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <Bold className="w-4 h-4 mx-auto text-white" />
                      </button>
                      <button
                        onClick={() => updateLayer(selectedLayerId, { italic: !selectedLayer.italic })}
                        className={`flex-1 p-2 rounded-lg border transition-colors ${
                          selectedLayer.italic ? 'bg-purple-600 border-purple-500' : 'bg-black/40 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <Italic className="w-4 h-4 mx-auto text-white" />
                      </button>
                      <button
                        onClick={() => updateLayer(selectedLayerId, { rotation: 0 })}
                        className="flex-1 p-2 rounded-lg border bg-black/40 border-white/10 hover:bg-white/10 transition-colors"
                      >
                        <RotateCcw className="w-4 h-4 mx-auto text-white" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* STYLES TAB */}
            {activeTab === 'styles' && (
              <>
                {/* Warning if no text layer selected */}
                {selectedLayer?.type !== 'text' && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-3">
                    <p className="text-xs text-amber-300">
                      {layers.filter(l => l.type === 'text').length === 0
                        ? '⚠️ Önce "Yazı" sekmesinden bir yazı ekleyin'
                        : '💡 Stil uygulamak için bir yazı katmanı seçin'}
                    </p>
                  </div>
                )}

                <p className="text-xs text-slate-400 mb-2">Hızlı stil uygula:</p>

                <div className="grid grid-cols-2 gap-2">
                  {STYLE_PRESETS.map(preset => (
                    <button
                      key={preset.id}
                      onClick={() => applyStylePreset(preset)}
                      disabled={selectedLayer?.type !== 'text'}
                      className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <div
                        className="text-lg font-bold mb-1"
                        style={{
                          color: preset.textColor,
                          WebkitTextStroke: `${preset.strokeWidth / 2}px ${preset.strokeColor}`,
                          paintOrder: 'stroke fill'
                        }}
                      >
                        ABC
                      </div>
                      <span className="text-xs text-slate-400">{preset.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* LOGO TAB */}
            {activeTab === 'logo' && (
              <>
                <div
                  onDragOver={(e) => { e.preventDefault(); setLogoDragOver(true); }}
                  onDragLeave={() => setLogoDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setLogoDragOver(false); if (e.dataTransfer.files[0]) handleLogoUpload(e.dataTransfer.files[0]); }}
                  onClick={() => logoInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                    logoDragOver ? 'border-cyan-500 bg-cyan-500/10' : 'border-white/10 hover:border-cyan-500/50'
                  }`}
                >
                  <input ref={logoInputRef} type="file" accept="image/*" hidden
                    onChange={(e) => { if (e.target.files[0]) handleLogoUpload(e.target.files[0]); }} />
                  <ImageIcon className="w-10 h-10 mx-auto mb-3 text-cyan-400" />
                  <p className="text-cyan-300 font-medium">Logo veya İkon Yükle</p>
                  <p className="text-xs text-slate-500 mt-2">PNG, SVG, JPG</p>
                  <p className="text-[10px] text-slate-600 mt-1">Şeffaf arka plan önerilir</p>
                </div>

                {/* Image layers list */}
                {layers.filter(l => l.type === 'image').length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-cyan-400 font-bold uppercase tracking-wider">Yüklenen Görseller</p>
                    {layers.filter(l => l.type === 'image').map(layer => (
                      <div
                        key={layer.id}
                        onClick={() => setSelectedLayerId(layer.id)}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                          selectedLayerId === layer.id ? 'bg-cyan-500/20 border border-cyan-500/40' : 'bg-white/5 border border-transparent hover:bg-white/10'
                        }`}
                      >
                        <img src={layer.imageData} alt="" className="w-10 h-10 object-contain rounded bg-black/20" />
                        <span className="flex-1 text-sm text-white truncate">{layer.name}</span>
                        <button onClick={(e) => { e.stopPropagation(); deleteLayer(layer.id); }} className="text-red-400 hover:text-red-300 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Image properties */}
                {selectedLayer?.type === 'image' && (
                  <div className="space-y-3 p-3 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-xs text-slate-400 font-medium">Görsel Ayarları</p>

                    <div>
                      <label className="text-[10px] text-slate-500 mb-1 block">Boyut: {Math.round(selectedLayer.width)}px</label>
                      <input
                        type="range" min="30" max="500" value={selectedLayer.width}
                        onChange={(e) => {
                          const newWidth = parseInt(e.target.value);
                          const ratio = selectedLayer.height / selectedLayer.width;
                          updateLayer(selectedLayerId, { width: newWidth, height: newWidth * ratio });
                        }}
                        className="w-full accent-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-500 mb-1 block">Döndürme: {selectedLayer.rotation}°</label>
                      <input
                        type="range" min="-180" max="180" value={selectedLayer.rotation}
                        onChange={(e) => updateLayer(selectedLayerId, { rotation: parseInt(e.target.value) })}
                        className="w-full accent-cyan-500"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {/* LAYERS TAB */}
            {activeTab === 'layers' && (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-400 font-medium">Tüm Katmanlar ({layers.length})</p>
                  {layers.length > 0 && (
                    <button
                      onClick={() => setLayers([])}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Tümünü Sil
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {layers.length === 0 ? (
                    <div className="text-center py-8 text-slate-600">
                      <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Henüz katman yok</p>
                      <p className="text-xs mt-1">Yazı veya logo ekleyin</p>
                    </div>
                  ) : (
                    layers.map((layer, index) => (
                      <div
                        key={layer.id}
                        onClick={() => setSelectedLayerId(layer.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                          selectedLayerId === layer.id
                            ? 'bg-purple-500/20 border border-purple-500/40'
                            : 'bg-white/5 border border-transparent hover:bg-white/10'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          layer.type === 'text' ? 'bg-purple-500/20' : 'bg-cyan-500/20'
                        }`}>
                          {layer.type === 'text'
                            ? <Type className="w-4 h-4 text-purple-400" />
                            : <ImageIcon className="w-4 h-4 text-cyan-400" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">
                            {layer.type === 'text' ? layer.text : layer.name}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {layer.type === 'text' ? layer.fontFamily : `${Math.round(layer.width)}x${Math.round(layer.height)}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); updateLayer(layer.id, { visible: !layer.visible }); }}
                            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                          >
                            {layer.visible ? <Eye className="w-4 h-4 text-white" /> : <EyeOff className="w-4 h-4 text-slate-500" />}
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); duplicateLayer(layer.id); }}
                            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                          >
                            <Copy className="w-4 h-4 text-white" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteLayer(layer.id); }}
                            className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ThumbnailEditor;
