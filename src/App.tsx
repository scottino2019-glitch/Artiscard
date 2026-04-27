import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Type, 
  Image as ImageIcon, 
  Sticker, 
  Layers, 
  Download, 
  Plus, 
  Trash2, 
  Sparkles,
  Palette,
  Maximize,
  Baseline,
  ChevronRight
} from 'lucide-react';
import PostcardCanvas, { PostcardCanvasHandle } from './components/PostcardCanvas';
import { FONT_FAMILIES, STICKER_PACKS, POSTCARD_SIZES, FILTERS } from './constants';
import confetti from 'canvas-confetti';

export default function App() {
  const [activeTab, setActiveTab] = useState<'text' | 'image' | 'stickers' | 'design'>('design');
  const [size, setSize] = useState(POSTCARD_SIZES.standard);
  const [selectedColor, setSelectedColor] = useState('#FFFFFF');
  const [curviness, setCurviness] = useState(0);
  const [zoom, setZoom] = useState(0.8);
  const canvasRef = useRef<PostcardCanvasHandle>(null);

  const handleAddText = () => {
    canvasRef.current?.addText('YOUR MESSAGE', { 
      fill: selectedColor,
      fontWeight: '900',
      fontStyle: 'italic',
      fontFamily: 'Inter'
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          canvasRef.current?.addImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExport = (format: 'png' | 'jpeg') => {
    const dataUrl = canvasRef.current?.exportImage(format);
    if (dataUrl) {
      const link = document.createElement('a');
      link.download = `artiscad-postcard.${format}`;
      link.href = dataUrl;
      link.click();
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FACC15', '#FFFFFF', '#000000']
      });
    }
  };

  const COLORS = [
    '#FFFFFF', '#FACC15', '#FF3B30', '#FF9500', '#FFCC00', 
    '#4CD964', '#5AC8FA', '#007AFF', '#5856D6', '#FF2D55', '#000000'
  ];

  return (
    <div className="flex flex-col h-screen bg-studio-bg text-white overflow-hidden font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-6 h-16 border-b border-white/10 bg-studio-panel shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-tr from-pink-500 to-yellow-400 rounded-lg flex items-center justify-center font-black text-black text-xl">A</div>
          <div className="flex flex-col">
            <h1 className="text-xl font-black tracking-tighter uppercase italic leading-none">ArtisCard</h1>
            <span className="text-[10px] font-bold tracking-widest text-white/30 uppercase mt-1">Studio Pro v2.0</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-white/5 p-1 rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-white/50">
            Unsaved Project
          </div>
          <div className="h-8 w-px bg-white/10 mx-2"></div>
          <button 
            onClick={() => handleExport('png')}
            className="px-6 py-2 bg-studio-accent text-black font-black text-xs uppercase tracking-widest hover:bg-white transition-colors"
          >
            Export PNG
          </button>
          <button 
            onClick={() => handleExport('jpeg')}
            className="px-6 py-2 border border-white/20 font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-colors"
          >
            Export JPG
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Toolbox */}
        <nav className="w-24 border-r border-white/10 bg-studio-panel flex flex-col items-center py-8 gap-10 shrink-0">
          <SidebarTab 
            active={activeTab === 'design'} 
            onClick={() => setActiveTab('design')} 
            icon={<Palette className="w-6 h-6" />} 
            label="Design"
          />
          <SidebarTab 
            active={activeTab === 'text'} 
            onClick={() => setActiveTab('text')} 
            icon={<Baseline className="w-6 h-6" />} 
            label="Testo"
          />
          <SidebarTab 
            active={activeTab === 'image'} 
            onClick={() => setActiveTab('image')} 
            icon={<ImageIcon className="w-6 h-6" />} 
            label="Foto"
          />
          <SidebarTab 
            active={activeTab === 'stickers'} 
            onClick={() => setActiveTab('stickers')} 
            icon={<Sticker className="w-6 h-6" />} 
            label="Art"
          />

          <div className="mt-auto pb-4">
            <button 
              onClick={() => canvasRef.current?.deleteSelected()}
              className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
              title="Delete selection"
            >
              <Trash2 className="w-6 h-6" />
            </button>
          </div>
        </nav>

        {/* Main Workspace */}
        <main className="flex-1 bg-black relative flex items-center justify-center p-12 overflow-auto scrollbar-hide">
          <div 
            className="relative transition-transform duration-300 ease-out flex items-center justify-center"
            style={{ transform: `scale(${zoom})` }}
          >
            <PostcardCanvas 
              ref={canvasRef}
              width={size.width}
              height={size.height}
            />
            {/* Zoom Indicator */}
            <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-studio-panel px-6 py-3 border border-white/10 rounded-full shadow-2xl z-50">
              <button 
                onClick={() => setZoom(Math.max(0.2, zoom - 0.1))}
                className="text-white/40 hover:text-studio-accent font-black text-xl w-8 h-8 flex items-center justify-center transition-colors"
                title="Zoom Out"
              >
                -
              </button>
              <span className="text-[10px] font-black uppercase tracking-widest min-w-[60px] text-center text-white/60">
                {(zoom * 100).toFixed(0)}%
              </span>
              <button 
                onClick={() => setZoom(Math.min(2, zoom + 0.1))}
                className="text-white/40 hover:text-studio-accent font-black text-xl w-8 h-8 flex items-center justify-center transition-colors"
                title="Zoom In"
              >
                +
              </button>
              <div className="h-4 w-px bg-white/10 mx-2" />
              <button 
                onClick={() => setZoom(0.8)}
                className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-studio-accent transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </main>

        {/* Right Project Inspector */}
        <aside className="w-80 bg-studio-panel border-l border-white/10 p-6 flex flex-col gap-8 overflow-y-auto shrink-0">
          <AnimatePresence mode="wait">
            {activeTab === 'design' && (
              <Panel key="design" title="Proprietà Layout">
                <Section label="Dimensioni">
                  <div className="space-y-2">
                    {Object.entries(POSTCARD_SIZES).map(([key, val]) => (
                      <button
                        key={key}
                        onClick={() => setSize(val)}
                        className={`w-full flex items-center justify-between p-4 rounded bg-black/40 border text-xs font-bold transition-all uppercase tracking-widest ${
                          size.label === val.label ? 'border-studio-accent text-studio-accent' : 'border-white/10 text-white/50 hover:border-white/20'
                        }`}
                      >
                        <span>{val.label}</span>
                        <Maximize className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                </Section>
                <Section label="Sfondo Canvas">
                  <div className="grid grid-cols-5 gap-2">
                    {COLORS.map(c => (
                      <button
                        key={c}
                        onClick={() => canvasRef.current?.setBackground(c)}
                        className="aspect-square rounded border border-white/10"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </Section>
                <Section label="Cornici Artistiche">
                  <div className="grid grid-cols-1 gap-2">
                    <button onClick={() => canvasRef.current?.addFrame('thin')} className="py-2 border border-white/10 rounded text-[10px] font-black uppercase tracking-widest hover:border-studio-accent transition-all">Fine Modern</button>
                    <button onClick={() => canvasRef.current?.addFrame('bold')} className="py-2 border border-white/10 rounded text-[10px] font-black uppercase tracking-widest hover:border-studio-accent transition-all">Bold Double</button>
                    <button onClick={() => canvasRef.current?.addFrame('vintage')} className="py-2 border border-white/10 rounded text-[10px] font-black uppercase tracking-widest hover:border-studio-accent transition-all">Vintage Classic</button>
                  </div>
                </Section>
              </Panel>
            )}

            {activeTab === 'text' && (
              <Panel key="text" title="Testo & Curve">
                <button 
                  onClick={handleAddText}
                  className="w-full bg-studio-card text-black py-4 rounded font-black text-xs uppercase tracking-[0.2em] mb-6 hover:bg-studio-accent transition-all"
                >
                  Nuovo Livello
                </button>

                <Section label="Famiglia Font">
                  <div className="grid grid-cols-1 gap-1">
                    {FONT_FAMILIES.map(f => (
                      <button
                        key={f.value}
                        onClick={() => canvasRef.current?.updateSelectedText({ fontFamily: f.value })}
                        className="p-3 bg-black/20 border border-white/5 rounded text-left hover:bg-black/40 hover:border-white/20 transition-all text-xs font-bold uppercase tracking-wide"
                        style={{ fontFamily: f.value }}
                      >
                        {f.name}
                      </button>
                    ))}
                  </div>
                </Section>

                <Section label="Testo in Curva">
                   <div className="flex justify-between items-center mb-1">
                     <span className="text-[10px] font-bold text-white/40 uppercase">Arc Intensity</span>
                     <span className="text-[10px] font-black text-studio-accent">{(curviness * 100).toFixed(0)}%</span>
                   </div>
                   <input 
                      type="range" min="-1" max="1" step="0.1" value={curviness}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setCurviness(val);
                        canvasRef.current?.updateSelectedText({ curviness: val });
                      }}
                      className="w-full accent-studio-accent"
                   />
                </Section>

                <Section label="Colore Font">
                  <div className="grid grid-cols-5 gap-2">
                    {COLORS.map(c => (
                      <button
                        key={c}
                        onClick={() => {
                          setSelectedColor(c);
                          canvasRef.current?.updateSelectedText({ fill: c });
                        }}
                        className={`aspect-square rounded border-2 ${selectedColor === c ? 'border-studio-accent' : 'border-white/10'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </Section>
              </Panel>
            )}

            {activeTab === 'image' && (
              <Panel key="image" title="Imaging Pro">
                <label className="w-full cursor-pointer bg-white/5 border border-white/10 text-white/50 py-4 rounded flex items-center justify-center gap-2 mb-6 hover:text-white hover:border-white/30 transition-all font-black text-xs uppercase tracking-widest">
                  <Plus className="w-4 h-4" /> Carica Immagine
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>

                <Section label="Filtri Ottici">
                   <div className="grid grid-cols-2 gap-3">
                      {FILTERS.map(f => (
                        <button
                          key={f.id}
                          onClick={() => canvasRef.current?.applyFilter(f.id)}
                          className="aspect-square bg-black/40 border border-white/10 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-studio-accent transition-all group"
                        >
                          <div className={`w-8 h-8 rounded-full border border-white/20 ${f.id === 'grayscale' ? 'grayscale' : f.id === 'sepia' ? 'sepia' : ''} bg-white/10`} />
                          <span className="text-[9px] font-black uppercase tracking-widest text-white/40 group-hover:text-studio-accent">{f.name}</span>
                        </button>
                      ))}
                   </div>
                </Section>
              </Panel>
            )}

            {activeTab === 'stickers' && (
              <Panel key="stickers" title="Grafiche & Art">
                {STICKER_PACKS.map(pack => (
                  <Section key={pack.id} label={pack.name}>
                    <div className="grid grid-cols-4 gap-2">
                      {pack.items.map(item => (
                        <button
                          key={item}
                          onClick={() => {
                            if (pack.id === 'shapes') {
                              canvasRef.current?.addShape(item);
                            } else {
                              canvasRef.current?.addSticker(item);
                            }
                          }}
                          className="aspect-square bg-black/40 border border-white/5 rounded hover:border-white/20 transition-all flex items-center justify-center text-xl group"
                        >
                          {pack.id === 'shapes' ? (
                            <div className="flex items-center justify-center">
                              {item === 'circle' && <div className="w-5 h-5 rounded-full border-2 border-white/40 group-hover:border-studio-accent" />}
                              {item === 'rect' && <div className="w-5 h-5 border-2 border-white/40 group-hover:border-studio-accent" />}
                              {item === 'triangle' && (
                                <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[18px] border-b-white/40 group-hover:border-b-studio-accent" />
                              )}
                              {item === 'star' && <span className="text-white/40 group-hover:text-studio-accent text-2xl">★</span>}
                            </div>
                          ) : (
                            <span className="group-hover:scale-125 transition-transform">{item}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </Section>
                ))}
              </Panel>
            )}
          </AnimatePresence>
        </aside>
      </div>

      {/* Footer Status Bar */}
      <footer className="h-8 bg-black border-t border-white/10 shrink-0 flex items-center px-4 justify-between text-[10px] font-black text-white/20 uppercase tracking-widest">
        <div className="flex gap-6">
          <span className="flex items-center gap-2">Layers: <span className="text-white/40">Canvas Sync</span></span>
          <span className="flex items-center gap-2">Resolution: <span className="text-white/40">{size.width} x {size.height} px</span></span>
        </div>
        <div className="flex gap-6 italic">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Studio Connected
          </span>
          <span>© AIS Build ArtisCard</span>
        </div>
      </footer>
    </div>
  );
}

function SidebarTab({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-2 transition-all group cursor-pointer ${
        active ? 'text-studio-accent' : 'text-white/60 hover:text-white'
      }`}
    >
      <div className={`w-12 h-12 flex items-center justify-center rounded-xl border-2 transition-all ${
        active ? 'border-studio-accent bg-studio-accent/10' : 'border-white/5 group-hover:border-white/20'
      }`}>
        {icon}
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );
}

function Panel({ children, title }: { children: React.ReactNode, title: string, key?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.15 }}
      className="flex flex-col gap-8"
    >
      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-studio-accent">{title}</h3>
      <div className="flex flex-col gap-6">
        {children}
      </div>
    </motion.div>
  );
}

function Section({ children, label }: { children: React.ReactNode, label: string, key?: string }) {
  return (
    <div className="flex flex-col gap-3">
      <label className="text-[10px] uppercase font-black text-white/40 tracking-widest block">
        {label}
      </label>
      {children}
    </div>
  );
}
