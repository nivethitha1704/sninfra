import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEye, FaTimes } from 'react-icons/fa';

// --- BEFORE AFTER COMPONENT ---
const BeforeAfterSlider = ({ before, after }) => {
  const [sliderPos, setSliderPos] = useState(50); // 0 to 100

  const handleSliderChange = (e) => {
    setSliderPos(e.target.value);
  };

  return (
    <div className="relative w-full h-80 rounded-2xl overflow-hidden select-none border border-slate-200 dark:border-slate-800 shadow-sm">
      {/* Before Image (Background) */}
      <img 
        src={before} 
        alt="Before renovation" 
        className="absolute inset-0 w-full h-full object-cover" 
      />
      <div className="absolute top-3 left-3 bg-red-600/80 backdrop-blur-sm text-white text-[9px] uppercase tracking-widest font-extrabold px-2.5 py-1 rounded">
        Before
      </div>

      {/* After Image (Overlay clipped by slider position) */}
      <div 
        className="absolute inset-0 w-full h-full overflow-hidden"
        style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
      >
        <img 
          src={after} 
          alt="After renovation" 
          className="absolute inset-0 w-full h-full object-cover" 
        />
        <div className="absolute top-3 right-3 bg-emerald-600/80 backdrop-blur-sm text-white text-[9px] uppercase tracking-widest font-extrabold px-2.5 py-1 rounded z-20">
          After
        </div>
      </div>

      {/* Vertical Slider Handle Line */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-20 pointer-events-none"
        style={{ left: `${sliderPos}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white text-slate-800 rounded-full shadow-lg border border-slate-200 flex items-center justify-center font-bold text-xs select-none">
          ↔
        </div>
      </div>

      {/* Transparent Input range for dragging */}
      <input 
        type="range" 
        min="0" 
        max="100" 
        value={sliderPos} 
        onChange={handleSliderChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30" 
      />
    </div>
  );
};

// --- GALLERY PAGE ---
const Gallery = () => {
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [lightboxImage, setLightboxImage] = useState(null);

  const fetchGallery = async () => {
    try {
      const res = await axios.get('/api/gallery');
      setGallery(res.data);
    } catch (err) {
      console.error('Failed to retrieve gallery images:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const categories = ['All', 'Construction', 'Interior', 'Exterior', 'Drone', 'Completed', 'Site Progress'];

  const filteredGallery = gallery.filter(item => {
    return activeCategory === 'All' || item.category === activeCategory;
  });

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-900 min-h-screen pb-20">
      
      {/* HEADER SECTION */}
      <section className="bg-gradient-to-br from-primary to-slate-950 text-white py-20 px-6 text-center relative border-b border-primary-dark">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,140,0,0.1),transparent)] pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10">
          <h1 className="text-4xl md:text-5xl font-black mb-4">Media Gallery</h1>
          <p className="text-slate-300 text-xs md:text-sm max-w-xl mx-auto leading-relaxed">
            Review site progress pictures, interior layouts, structural elevations, and drone surveillance snaps.
          </p>
        </div>
      </section>

      {/* CATEGORIES BUTTONS */}
      <section className="max-w-7xl mx-auto px-6 pt-12 flex justify-center flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeCategory === cat
                ? 'bg-secondary text-white shadow-md shadow-orange-500/25'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 border border-slate-200/40 dark:border-slate-800/40'
            }`}
          >
            {cat}
          </button>
        ))}
      </section>

      {/* GALLERY LIST */}
      <section className="max-w-7xl mx-auto px-6 pt-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-800 rounded-3xl h-64 animate-pulse border border-slate-200 dark:border-slate-800" />
            ))}
          </div>
        ) : filteredGallery.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-800/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <p className="text-sm font-semibold text-slate-400">No media assets in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {filteredGallery.map((item) => (
              <div 
                key={item._id}
                className="bg-white dark:bg-slate-800/80 rounded-2xl overflow-hidden p-3 border border-slate-200/40 dark:border-slate-800/40 shadow-sm flex flex-col group relative"
              >
                {item.beforeAfter ? (
                  // Before After slider
                  <BeforeAfterSlider before={item.beforeUrl} after={item.afterUrl} />
                ) : (
                  // Standard image with zoom / popup hover
                  <div className="relative h-64 rounded-xl overflow-hidden shadow-inner bg-slate-100 dark:bg-slate-900 group">
                    <img 
                      src={item.url} 
                      alt={item.title || 'Site photo'} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                      <button 
                        onClick={() => setLightboxImage(item.url)}
                        className="w-12 h-12 rounded-xl bg-white/20 hover:bg-white/45 backdrop-blur-md text-white flex items-center justify-center transition-colors"
                      >
                        <FaEye size={18} />
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Image metadata */}
                {item.title && (
                  <div className="p-3 text-left">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white leading-snug line-clamp-1">{item.title}</h4>
                    <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-400">{item.category}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* LIGHTBOX POPUP MODAL */}
      {lightboxImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4">
          <button 
            onClick={() => setLightboxImage(null)}
            className="absolute top-6 right-6 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-lg"
          >
            <FaTimes />
          </button>
          <img 
            src={lightboxImage} 
            alt="Preview expanded gallery lightbox" 
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" 
          />
        </div>
      )}

    </div>
  );
};

export default Gallery;
