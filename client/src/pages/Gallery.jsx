import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEye, FaTimes, FaLayerGroup, FaImage } from 'react-icons/fa';
import SEO from '../components/SEO';

// --- BEFORE AFTER COMPONENT ---
const BeforeAfterSlider = ({ before, after }) => {
  const [sliderPos, setSliderPos] = useState(50); // 0 to 100

  const handleSliderChange = (e) => {
    setSliderPos(e.target.value);
  };

  return (
    <div className="relative w-full h-80 rounded-xl overflow-hidden select-none border border-slate-200 dark:border-slate-800 shadow-sm">
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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white text-[#1C68F5] rounded-full shadow-lg border border-slate-200 flex items-center justify-center font-bold text-xs select-none">
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
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [lightboxImage, setLightboxImage] = useState(null);

  const fetchGalleryData = async () => {
    try {
      const [galleryRes, categoriesRes] = await Promise.all([
        axios.get('/api/gallery'),
        axios.get('/api/gallery/categories')
      ]);
      setGallery(galleryRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (err) {
      console.error('Failed to retrieve gallery images or categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleryData();
  }, []);

  // Filter gallery items based on active category
  const filteredGallery = gallery.filter((item) => {
    if (activeCategory === 'All') return true;
    return item.category?.toLowerCase() === activeCategory.toLowerCase();
  });

  // Calculate count for each category
  const getCategoryCount = (catName) => {
    if (catName === 'All') return gallery.length;
    return gallery.filter((item) => item.category?.toLowerCase() === catName.toLowerCase()).length;
  };

  const activeCategoryObj = categories.find(
    (c) => c.name.toLowerCase() === activeCategory.toLowerCase()
  );

  return (
    <div className="w-full bg-white dark:bg-[#0F172A] min-h-screen pb-24 pt-0">
      <SEO 
        title="Building & Interiors Gallery | SN Infra Coimbatore & Pollachi" 
        description="Explore our high-resolution construction gallery categorized by Building, Interiors, Elevation, and Ongoing Sites. Professional engineering execution in Tamil Nadu."
        keywords="SN Infra gallery, building photos, interior designs Coimbatore, elevation works, construction pictures Pollachi"
        path="/gallery"
      />
      
      {/* HEADER HERO SECTION */}
      <section className="bg-[#1C68F5] text-white py-20 px-6 text-center relative border-b border-white/10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,193,0,0.1),transparent)] pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10" data-aos="fade-down">
          <div className="w-12 h-1 bg-[#FFC100] mx-auto mb-4" />
          <span className="text-xs uppercase tracking-widest font-black text-[#FFC100] mb-2 block">
            Craftsmanship Portfolio
          </span>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-4">
            Building & Interiors Gallery
          </h1>
          <p className="text-blue-100 text-xs md:text-sm max-w-xl mx-auto leading-relaxed">
            Browse through our portfolio organized by building architecture, luxury interior styling, modern facades, and on-site construction updates.
          </p>
        </div>
      </section>

      {/* CATEGORY FILTER TABS BAR */}
      <section className="sticky top-20 z-30 bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 py-4 px-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-start md:justify-center gap-2 overflow-x-auto no-scrollbar py-1">
          {/* 'All' Category Tab */}
          <button
            onClick={() => setActiveCategory('All')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all shrink-0 flex items-center gap-2 ${
              activeCategory === 'All'
                ? 'bg-[#1C68F5] text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <span>All Works</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
              activeCategory === 'All' ? 'bg-[#FFC100] text-[#1C68F5]' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
            }`}>
              {gallery.length}
            </span>
          </button>

          {/* Dynamic Admin-Managed Categories */}
          {categories.map((cat) => {
            const count = getCategoryCount(cat.name);
            const isActive = activeCategory.toLowerCase() === cat.name.toLowerCase();

            return (
              <button
                key={cat._id || cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all shrink-0 flex items-center gap-2 ${
                  isActive
                    ? 'bg-[#1C68F5] text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{cat.name}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                  isActive ? 'bg-[#FFC100] text-[#1C68F5]' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ACTIVE CATEGORY SHOWCASE BANNER */}
      {activeCategory !== 'All' && activeCategoryObj && (
        <section className="max-w-7xl mx-auto px-6 pt-8 text-left">
          <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-amber-50/50 dark:from-slate-900 dark:to-slate-800 border border-blue-100 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1C68F5]" />
                <span className="text-xs uppercase font-extrabold tracking-widest text-[#1C68F5] dark:text-[#FFC100]">
                  Category Spotlight
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                {activeCategoryObj.name}
              </h2>
              {activeCategoryObj.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                  {activeCategoryObj.description}
                </p>
              )}
            </div>
            <div className="bg-white dark:bg-slate-950 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">
              Showing {filteredGallery.length} {filteredGallery.length === 1 ? 'Asset' : 'Assets'}
            </div>
          </div>
        </section>
      )}

      {/* GALLERY GRID */}
      <section className="max-w-7xl mx-auto px-6 pt-10">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div 
                key={idx} 
                className="bg-slate-100 dark:bg-slate-800 rounded-2xl h-72 animate-pulse border border-slate-200 dark:border-slate-800" 
              />
            ))}
          </div>
        ) : filteredGallery.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <div className="w-16 h-16 bg-blue-100 dark:bg-slate-800 text-[#1C68F5] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FaImage size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-1">
              No photos currently in "{activeCategory}"
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
              New project execution photos are being uploaded by our site engineering team.
            </p>
            <button
              onClick={() => setActiveCategory('All')}
              className="px-6 py-2.5 bg-[#1C68F5] hover:bg-[#091aa1] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md"
            >
              View All Photos ({gallery.length})
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
            {filteredGallery.map((item, idx) => (
              <div 
                key={item._id}
                data-aos="fade-up"
                data-aos-delay={(idx % 3) * 100}
                className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden p-3 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group relative"
              >
                {item.beforeAfter ? (
                  // Before-After Slider
                  <div className="flex flex-col">
                    <BeforeAfterSlider before={item.beforeUrl} after={item.afterUrl} />
                    <div className="flex justify-between items-center px-1 pt-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#FFC100] bg-[#1C68F5] px-2.5 py-1 rounded">
                        {item.category}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        Interactive Comparison
                      </span>
                    </div>
                  </div>
                ) : (
                  // Standard Media Card with Lightbox Hover Trigger
                  <div className="relative h-64 rounded-xl overflow-hidden shadow-inner bg-slate-100 dark:bg-slate-950 group">
                    <img 
                      src={item.url} 
                      onError={(e) => { e.currentTarget.src = '/photos/villa-elevation.png'; }}
                      alt={item.title || `${item.category} photo`} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    
                    {/* Category Badge */}
                    <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md text-white text-[9px] uppercase tracking-widest font-extrabold px-2.5 py-1 rounded shadow z-10">
                      {item.category}
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-[#1C68F5]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                      <button 
                        onClick={() => setLightboxImage(item.url)}
                        aria-label="View photo fullscreen"
                        className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md text-[#FFC100] flex items-center justify-center transition-colors shadow-lg"
                      >
                        <FaEye size={18} />
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Image metadata */}
                {item.title && (
                  <div className="p-3 text-left">
                    <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-tight leading-snug line-clamp-1">
                      {item.title}
                    </h3>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* FULLSCREEN LIGHTBOX MODAL */}
      {lightboxImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 p-4 animate-fade-in">
          <button 
            onClick={() => setLightboxImage(null)}
            aria-label="Close Preview"
            className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white text-lg transition-colors"
          >
            <FaTimes />
          </button>
          <img 
            src={lightboxImage} 
            alt="Expanded view" 
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl" 
          />
        </div>
      )}

    </div>
  );
};

export default Gallery;
