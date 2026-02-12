import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Type, Image as ImageIcon, Download, X, Plus, Trash2, Move,
  RotateCcw, Upload, ChevronDown, Check, Palette, Bold, Italic,
  AlignLeft, AlignCenter, AlignRight, Layers, Eye, EyeOff, Copy
} from 'lucide-react';

// Preset gaming fonts (Google Fonts)
const PRESET_FONTS = [
  { id: 'bangers', name: 'Bangers', family: 'Bangers', url: 'https://fonts.googleapis.com/css2?family=Bangers&display=swap', style: 'Comic/Gaming' },
  { id: 'bebas', name: 'Bebas Neue', family: 'Bebas Neue', url: 'https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap', style: 'Bold Impact' },
  { id: 'oswald', name: 'Oswald', family: 'Oswald', url: 'https://fonts.googleapis.com/css2?family=Oswald:wght@700&display=swap', style: 'Clean Bold' },
  { id: 'anton', name: 'Anton', family: 'Anton', url: 'https://fonts.googleapis.com/css2?family=Anton&display=swap', style: 'Condensed' },
  { id: 'permanent', name: 'Permanent Marker', family: 'Permanent Marker', url: 'https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap', style: 'Handwritten' },
  { id: 'rubik', name: 'Rubik Mono One', family: 'Rubik Mono One', url: 'https://fonts.googleapis.com/css2?family=Rubik+Mono+One&display=swap', style: 'Chunky' },
  { id: 'black_ops', name: 'Black Ops One', family: 'Black Ops One', url: 'https://fonts.googleapis.com/css2?family=Black+Ops+One&display=swap', style: 'Military' },
  { id: 'russo', name: 'Russo One', family: 'Russo One', url: 'https://fonts.googleapis.com/css2?family=Russo+One&display=swap', style: 'Tech/Gaming' },
  { id: 'orbitron', name: 'Orbitron', family: 'Orbitron', url: 'https://fonts.googleapis.com/css2?family=Orbitron:wght@700&display=swap', style: 'Sci-Fi' },
  { id: 'press_start', name: 'Press Start 2P', family: 'Press Start 2P', url: 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap', style: 'Retro Pixel' },
];

const ThumbnailEditor = ({ thumbnail, onClose, onSave }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);
  const fontInputRef = useRef(null);
  const logoInputRef = useRef(null);

  // Layers state
  const [layers, setLayers] = useState([]);
  const [selectedLayerId, setSelectedLayerId] = useState(null);
  const [loadedFonts, setLoadedFonts] = useState([]);
  const [customFonts, setCustomFonts] = useState([]);

  // UI state
  const [activeTab, setActiveTab] = useState('text'); // 'text', 'image', 'fonts'
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Canvas dimensions
  const [canvasSize, setCanvasSize] = useState({ width: 1280, height: 720 });
  const [scale, setScale] = useState(1);

  // Load preset fonts
  useEffect(() => {
    PRESET_FONTS.forEach(font => {
      if (!document.querySelector(`link[href="${font.url}"]`)) {
        const link = document.createElement('link');
        link.href = font.url;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }
    });
    setLoadedFonts(PRESET_FONTS.map(f => f.id));
  }, []);

  // Calculate scale for display
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
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw base thumbnail
    if (thumbnail) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        drawLayers(ctx);
      };
      img.src = thumbnail;
    }
  }, [thumbnail, layers]);

  const drawLayers = (ctx) => {
    layers.filter(l => l.visible).forEach(layer => {
      ctx.save();

      // Apply transforms
      ctx.translate(layer.x + layer.width / 2, layer.y + layer.height / 2);
      ctx.rotate((layer.rotation || 0) * Math.PI / 180);
      ctx.translate(-layer.width / 2, -layer.height / 2);

      if (layer.type === 'text') {
        drawTextLayer(ctx, layer);
      } else if (layer.type === 'image') {
        drawImageLayer(ctx, layer);
      }

      ctx.restore();
    });
  };

  const drawTextLayer = (ctx, layer) => {
    const fontSize = layer.fontSize || 72;
    const fontFamily = layer.fontFamily || 'Bangers';
    const fontWeight = layer.bold ? 'bold' : 'normal';
    const fontStyle = layer.italic ? 'italic' : 'normal';

    ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px "${fontFamily}"`;
    ctx.textBaseline = 'top';
    ctx.textAlign = layer.align || 'left';

    const x = layer.align === 'center' ? layer.width / 2 : layer.align === 'right' ? layer.width : 0;

    // Draw stroke
    if (layer.strokeWidth > 0) {
      ctx.strokeStyle = layer.strokeColor || '#000000';
      ctx.lineWidth = layer.strokeWidth || 4;
      ctx.lineJoin = 'round';
      ctx.strokeText(layer.text, x, 0);
    }

    // Draw fill
    ctx.fillStyle = layer.color || '#ffffff';
    ctx.fillText(layer.text, x, 0);
  };

  const drawImageLayer = (ctx, layer) => {
    if (layer.imageData) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, layer.width, layer.height);
      };
      img.src = layer.imageData;
    }
  };

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas, layers]);

  // Add text layer
  const addTextLayer = () => {
    const newLayer = {
      id: Date.now(),
      type: 'text',
      text: 'YAZI EKLE',
      x: 100,
      y: canvasSize.height - 150,
      width: 400,
      height: 100,
      fontSize: 72,
      fontFamily: 'Bangers',
      color: '#ffffff',
      strokeColor: '#000000',
      strokeWidth: 4,
      rotation: 0,
      bold: false,
      italic: false,
      align: 'left',
      visible: true
    };
    setLayers([...layers, newLayer]);
    setSelectedLayerId(newLayer.id);
  };

  // Add image layer
  const addImageLayer = (imageData, name = 'Logo') => {
    const img = new Image();
    img.onload = () => {
      const aspectRatio = img.width / img.height;
      const height = 150;
      const width = height * aspectRatio;

      const newLayer = {
        id: Date.now(),
        type: 'image',
        name,
        imageData,
        x: canvasSize.width - width - 50,
        y: canvasSize.height - height - 50,
        width,
        height,
        rotation: 0,
        visible: true
      };
      setLayers([...layers, newLayer]);
      setSelectedLayerId(newLayer.id);
    };
    img.src = imageData;
  };

  // Handle logo upload
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        addImageLayer(event.target.result, file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle custom font upload
  const handleFontUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const fontName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '_');
      const reader = new FileReader();
      reader.onload = async (event) => {
        const fontData = event.target.result;
        const font = new FontFace(fontName, `url(${fontData})`);
        try {
          await font.load();
          document.fonts.add(font);
          setCustomFonts([...customFonts, { id: fontName, name: file.name, family: fontName }]);
        } catch (err) {
          console.error('Font yüklenemedi:', err);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Update layer
  const updateLayer = (id, updates) => {
    setLayers(layers.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  // Delete layer
  const deleteLayer = (id) => {
    setLayers(layers.filter(l => l.id !== id));
    if (selectedLayerId === id) setSelectedLayerId(null);
  };

  // Duplicate layer
  const duplicateLayer = (id) => {
    const layer = layers.find(l => l.id === id);
    if (layer) {
      const newLayer = { ...layer, id: Date.now(), x: layer.x + 20, y: layer.y + 20 };
      setLayers([...layers, newLayer]);
      setSelectedLayerId(newLayer.id);
    }
  };

  // Handle mouse events for dragging
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
      x: Math.max(0, Math.min(canvasSize.width - 50, x - dragOffset.x)),
      y: Math.max(0, Math.min(canvasSize.height - 50, y - dragOffset.y))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Export final image
  const exportImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Draw final image
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 1280;
    exportCanvas.height = 720;
    const ctx = exportCanvas.getContext('2d');

    // Draw base
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.drawImage(img, 0, 0, 1280, 720);

      // Draw layers
      layers.filter(l => l.visible).forEach(layer => {
        ctx.save();
        ctx.translate(layer.x + layer.width / 2, layer.y + layer.height / 2);
        ctx.rotate((layer.rotation || 0) * Math.PI / 180);
        ctx.translate(-layer.width / 2, -layer.height / 2);

        if (layer.type === 'text') {
          const fontSize = layer.fontSize || 72;
          ctx.font = `${layer.italic ? 'italic' : ''} ${layer.bold ? 'bold' : ''} ${fontSize}px "${layer.fontFamily}"`;
          ctx.textBaseline = 'top';
          ctx.textAlign = layer.align || 'left';
          const x = layer.align === 'center' ? layer.width / 2 : layer.align === 'right' ? layer.width : 0;

          if (layer.strokeWidth > 0) {
            ctx.strokeStyle = layer.strokeColor;
            ctx.lineWidth = layer.strokeWidth;
            ctx.lineJoin = 'round';
            ctx.strokeText(layer.text, x, 0);
          }
          ctx.fillStyle = layer.color;
          ctx.fillText(layer.text, x, 0);
        } else if (layer.type === 'image' && layer.imageData) {
          const layerImg = new Image();
          layerImg.src = layer.imageData;
          ctx.drawImage(layerImg, 0, 0, layer.width, layer.height);
        }
        ctx.restore();
      });

      // Download
      const link = document.createElement('a');
      link.download = `thumbnail-edited-${Date.now()}.png`;
      link.href = exportCanvas.toDataURL('image/png');
      link.click();
    };
    img.src = thumbnail;
  };

  const selectedLayer = layers.find(l => l.id === selectedLayerId);
  const allFonts = [...PRESET_FONTS, ...customFonts.map(f => ({ ...f, style: 'Özel Font' }))];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/95 flex flex-col"
    >
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0a0a0f]">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 rounded-lg bg-white/5 hover:bg-white/10">
            <X className="w-5 h-5 text-white" />
          </button>
          <h2 className="text-white font-bold">Thumbnail Editör</h2>
        </div>
        <button
          onClick={exportImage}
          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:opacity-90"
        >
          <Download className="w-4 h-4" />
          Kaydet & İndir
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Canvas Area */}
        <div
          ref={containerRef}
          className="flex-1 p-6 overflow-auto flex items-center justify-center bg-[#0a0a0f]"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div className="relative" style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}>
            <canvas
              ref={canvasRef}
              width={1280}
              height={720}
              className="border border-white/20 rounded-lg shadow-2xl"
            />

            {/* Layer handles */}
            {layers.map(layer => (
              <div
                key={layer.id}
                className={`absolute cursor-move border-2 ${
                  selectedLayerId === layer.id ? 'border-blue-500' : 'border-transparent hover:border-white/30'
                } ${!layer.visible ? 'opacity-30' : ''}`}
                style={{
                  left: layer.x,
                  top: layer.y,
                  width: layer.width,
                  height: layer.height,
                  transform: `rotate(${layer.rotation || 0}deg)`
                }}
                onMouseDown={(e) => handleMouseDown(e, layer.id)}
              />
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-80 bg-[#101014] border-l border-white/10 flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-white/10">
            {[
              { id: 'text', icon: Type, label: 'Yazı' },
              { id: 'image', icon: ImageIcon, label: 'Logo' },
              { id: 'fonts', icon: Palette, label: 'Fontlar' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-bold transition-colors ${
                  activeTab === tab.id ? 'text-white bg-white/5' : 'text-slate-500 hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Text Tab */}
            {activeTab === 'text' && (
              <>
                <button
                  onClick={addTextLayer}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Yazı Ekle
                </button>

                {selectedLayer?.type === 'text' && (
                  <div className="space-y-3 bg-white/5 rounded-lg p-3">
                    <input
                      type="text"
                      value={selectedLayer.text}
                      onChange={(e) => updateLayer(selectedLayerId, { text: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white text-sm"
                      placeholder="Yazı..."
                    />

                    {/* Font selector */}
                    <div className="space-y-1">
                      <label className="text-xs text-slate-500">Font</label>
                      <select
                        value={selectedLayer.fontFamily}
                        onChange={(e) => updateLayer(selectedLayerId, { fontFamily: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white text-sm"
                        style={{ fontFamily: selectedLayer.fontFamily }}
                      >
                        {allFonts.map(font => (
                          <option key={font.id} value={font.family} style={{ fontFamily: font.family }}>
                            {font.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Size */}
                    <div className="space-y-1">
                      <label className="text-xs text-slate-500">Boyut: {selectedLayer.fontSize}px</label>
                      <input
                        type="range"
                        min="20"
                        max="200"
                        value={selectedLayer.fontSize}
                        onChange={(e) => updateLayer(selectedLayerId, { fontSize: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    </div>

                    {/* Colors */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-xs text-slate-500">Renk</label>
                        <input
                          type="color"
                          value={selectedLayer.color}
                          onChange={(e) => updateLayer(selectedLayerId, { color: e.target.value })}
                          className="w-full h-8 rounded cursor-pointer"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-slate-500">Kenar</label>
                        <input
                          type="color"
                          value={selectedLayer.strokeColor}
                          onChange={(e) => updateLayer(selectedLayerId, { strokeColor: e.target.value })}
                          className="w-full h-8 rounded cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Stroke width */}
                    <div className="space-y-1">
                      <label className="text-xs text-slate-500">Kenar Kalınlığı: {selectedLayer.strokeWidth}px</label>
                      <input
                        type="range"
                        min="0"
                        max="20"
                        value={selectedLayer.strokeWidth}
                        onChange={(e) => updateLayer(selectedLayerId, { strokeWidth: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    </div>

                    {/* Rotation */}
                    <div className="space-y-1">
                      <label className="text-xs text-slate-500">Döndürme: {selectedLayer.rotation}°</label>
                      <input
                        type="range"
                        min="-45"
                        max="45"
                        value={selectedLayer.rotation}
                        onChange={(e) => updateLayer(selectedLayerId, { rotation: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    </div>

                    {/* Style buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateLayer(selectedLayerId, { bold: !selectedLayer.bold })}
                        className={`flex-1 p-2 rounded border ${selectedLayer.bold ? 'bg-blue-600 border-blue-500' : 'bg-black/40 border-white/10'}`}
                      >
                        <Bold className="w-4 h-4 mx-auto text-white" />
                      </button>
                      <button
                        onClick={() => updateLayer(selectedLayerId, { italic: !selectedLayer.italic })}
                        className={`flex-1 p-2 rounded border ${selectedLayer.italic ? 'bg-blue-600 border-blue-500' : 'bg-black/40 border-white/10'}`}
                      >
                        <Italic className="w-4 h-4 mx-auto text-white" />
                      </button>
                      <button
                        onClick={() => updateLayer(selectedLayerId, { align: 'left' })}
                        className={`flex-1 p-2 rounded border ${selectedLayer.align === 'left' ? 'bg-blue-600 border-blue-500' : 'bg-black/40 border-white/10'}`}
                      >
                        <AlignLeft className="w-4 h-4 mx-auto text-white" />
                      </button>
                      <button
                        onClick={() => updateLayer(selectedLayerId, { align: 'center' })}
                        className={`flex-1 p-2 rounded border ${selectedLayer.align === 'center' ? 'bg-blue-600 border-blue-500' : 'bg-black/40 border-white/10'}`}
                      >
                        <AlignCenter className="w-4 h-4 mx-auto text-white" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Image/Logo Tab */}
            {activeTab === 'image' && (
              <>
                <button
                  onClick={() => logoInputRef.current?.click()}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Logo/Görsel Yükle
                </button>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />

                {selectedLayer?.type === 'image' && (
                  <div className="space-y-3 bg-white/5 rounded-lg p-3">
                    <p className="text-sm text-white font-bold">{selectedLayer.name}</p>

                    {/* Size */}
                    <div className="space-y-1">
                      <label className="text-xs text-slate-500">Boyut: {Math.round(selectedLayer.width)}px</label>
                      <input
                        type="range"
                        min="50"
                        max="500"
                        value={selectedLayer.width}
                        onChange={(e) => {
                          const newWidth = parseInt(e.target.value);
                          const ratio = selectedLayer.height / selectedLayer.width;
                          updateLayer(selectedLayerId, { width: newWidth, height: newWidth * ratio });
                        }}
                        className="w-full"
                      />
                    </div>

                    {/* Rotation */}
                    <div className="space-y-1">
                      <label className="text-xs text-slate-500">Döndürme: {selectedLayer.rotation}°</label>
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        value={selectedLayer.rotation}
                        onChange={(e) => updateLayer(selectedLayerId, { rotation: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Fonts Tab */}
            {activeTab === 'fonts' && (
              <>
                <button
                  onClick={() => fontInputRef.current?.click()}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Özel Font Yükle (.ttf, .otf, .woff)
                </button>
                <input
                  ref={fontInputRef}
                  type="file"
                  accept=".ttf,.otf,.woff,.woff2"
                  onChange={handleFontUpload}
                  className="hidden"
                />

                {customFonts.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-slate-500 font-bold">Yüklenen Fontlar</p>
                    {customFonts.map(font => (
                      <div key={font.id} className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-2">
                        <p className="text-sm text-white" style={{ fontFamily: font.family }}>{font.name}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-xs text-slate-500 font-bold">Hazır Fontlar</p>
                  <div className="space-y-1 max-h-[300px] overflow-y-auto">
                    {PRESET_FONTS.map(font => (
                      <div
                        key={font.id}
                        className="bg-white/5 hover:bg-white/10 rounded-lg p-2 cursor-pointer transition-colors"
                        onClick={() => {
                          if (selectedLayer?.type === 'text') {
                            updateLayer(selectedLayerId, { fontFamily: font.family });
                          }
                        }}
                      >
                        <p className="text-base text-white" style={{ fontFamily: font.family }}>{font.name}</p>
                        <p className="text-[10px] text-slate-500">{font.style}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Layers List */}
            <div className="border-t border-white/10 pt-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-slate-500 font-bold flex items-center gap-1">
                  <Layers className="w-3 h-3" /> Katmanlar
                </p>
              </div>
              <div className="space-y-1">
                {layers.map(layer => (
                  <div
                    key={layer.id}
                    onClick={() => setSelectedLayerId(layer.id)}
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer ${
                      selectedLayerId === layer.id ? 'bg-blue-600' : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    {layer.type === 'text' ? <Type className="w-4 h-4 text-white" /> : <ImageIcon className="w-4 h-4 text-white" />}
                    <span className="flex-1 text-sm text-white truncate">
                      {layer.type === 'text' ? layer.text : layer.name}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); updateLayer(layer.id, { visible: !layer.visible }); }}
                      className="p-1 hover:bg-white/10 rounded"
                    >
                      {layer.visible ? <Eye className="w-3 h-3 text-white" /> : <EyeOff className="w-3 h-3 text-slate-500" />}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); duplicateLayer(layer.id); }}
                      className="p-1 hover:bg-white/10 rounded"
                    >
                      <Copy className="w-3 h-3 text-white" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteLayer(layer.id); }}
                      className="p-1 hover:bg-red-500/20 rounded"
                    >
                      <Trash2 className="w-3 h-3 text-red-400" />
                    </button>
                  </div>
                ))}
                {layers.length === 0 && (
                  <p className="text-xs text-slate-600 text-center py-4">Henüz katman eklenmedi</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ThumbnailEditor;
