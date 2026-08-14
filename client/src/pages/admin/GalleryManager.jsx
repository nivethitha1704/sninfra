import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import { useForm } from 'react-hook-form';
import { FaPlus, FaTrash, FaTimes, FaSave, FaSpinner, FaExchangeAlt, FaImage } from 'react-icons/fa';

const GalleryManager = () => {
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // File variables
  const [singleFile, setSingleFile] = useState(null);
  const [beforeFile, setBeforeFile] = useState(null);
  const [afterFile, setAfterFile] = useState(null);

  const { register, handleSubmit, reset, watch } = useForm();
  const watchBeforeAfter = watch('beforeAfter', false);

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/gallery');
      setGallery(res.data);
    } catch (err) {
      console.error('Failed to load gallery portfolio index:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleOpenCreateForm = () => {
    setSingleFile(null);
    setBeforeFile(null);
    setAfterFile(null);
    reset({
      title: '',
      category: 'Construction',
      beforeAfter: false,
      orderIndex: '0'
    });
    setIsFormOpen(true);
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Delete this gallery asset permanently?')) return;
    try {
      await axios.delete(`/api/gallery/${id}`);
      fetchGallery();
    } catch (err) {
      alert('Failed to delete gallery item.');
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('category', data.category);
      formData.append('beforeAfter', data.beforeAfter);
      formData.append('orderIndex', data.orderIndex);

      if (data.beforeAfter) {
        if (!beforeFile || !afterFile) {
          alert('Both before and after images must be selected.');
          setLoading(false);
          return;
        }
        formData.append('beforeFile', beforeFile);
        formData.append('afterFile', afterFile);
      } else {
        if (!singleFile) {
          alert('A file must be selected.');
          setLoading(false);
          return;
        }
        formData.append('file', singleFile);
      }

      await axios.post('/api/gallery', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setIsFormOpen(false);
      fetchGallery();
    } catch (err) {
      alert('Save gallery item failed: ' + (err.response?.data?.error || err.message));
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center text-left">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white leading-none mb-2">Gallery CMS</h1>
          <p className="text-slate-400 text-xs">Manage masonry assets, categories, and drag comparison parameters.</p>
        </div>
        {!isFormOpen && (
          <button
            onClick={handleOpenCreateForm}
            className="bg-secondary hover:bg-secondary-light text-white font-bold text-xs px-5 py-3 rounded-xl shadow flex items-center gap-2"
          >
            <FaPlus /> Upload Media
          </button>
        )}
      </div>

      {loading && !isFormOpen ? (
        <div className="text-center py-20">
          <FaSpinner className="animate-spin text-secondary mx-auto" size={32} />
          <p className="text-xs text-slate-400 mt-3">Fetching gallery portfolio index...</p>
        </div>
      ) : isFormOpen ? (
        
        // CREATE GALLERY FORM
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/35 p-8 rounded-3xl shadow-sm text-left flex flex-col gap-6">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-extrabold text-slate-800 dark:text-white">Upload New Asset</h2>
            <button 
              type="button" 
              onClick={() => setIsFormOpen(false)}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-400"
            >
              <FaTimes size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Title */}
            <div className="flex flex-col gap-1.5 col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Asset Title / Description</label>
              <input 
                type="text" 
                placeholder="Front Elevation view"
                className="p-3 bg-slate-50 dark:bg-slate-950 text-xs rounded-xl border border-transparent dark:border-slate-800 outline-none focus:ring-1 focus:ring-secondary"
                {...register('title')}
              />
            </div>
            {/* Category */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</label>
              <select
                className="p-3 bg-slate-50 dark:bg-slate-950 text-xs rounded-xl border border-transparent dark:border-slate-800 outline-none focus:ring-1 focus:ring-secondary"
                {...register('category')}
              >
                <option value="Construction">Construction</option>
                <option value="Interior">Interior</option>
                <option value="Exterior">Exterior</option>
                <option value="Drone">Drone</option>
                <option value="Completed">Completed</option>
                <option value="Site Progress">Site Progress</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Before After toggle */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="beforeAfter"
                className="w-4 h-4 accent-secondary cursor-pointer"
                {...register('beforeAfter')}
              />
              <label htmlFor="beforeAfter" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer flex items-center gap-1.5">
                <FaExchangeAlt /> Mark as Before/After Comparison Image
              </label>
            </div>
            {/* Order index */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sorting Order Index</label>
              <input 
                type="number"
                placeholder="0"
                className="p-3 bg-slate-50 dark:bg-slate-950 text-xs rounded-xl border border-transparent dark:border-slate-800 outline-none focus:ring-1 focus:ring-secondary"
                {...register('orderIndex')}
              />
            </div>
          </div>

          {/* FILE CONFIGURATIONS */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
            {watchBeforeAfter ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Before Image */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Before Image File *</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setBeforeFile(e.target.files[0])}
                    className="text-xs"
                  />
                </div>
                {/* After Image */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">After Image File *</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAfterFile(e.target.files[0])}
                    className="text-xs"
                  />
                </div>
              </div>
            ) : (
              // Single file uploader
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Image File *</span>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => setSingleFile(e.target.files[0])}
                  className="text-xs"
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end border-t border-slate-100 dark:border-slate-800 pt-6 mt-4">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-primary hover:bg-primary-light text-white font-bold text-xs rounded-xl shadow flex items-center gap-2"
            >
              <FaSave /> Save Media
            </button>
          </div>

        </form>

      ) : (

        // GALLERY LISTING GRID
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
          {gallery.map((item) => (
            <div 
              key={item._id}
              className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/35 p-3 rounded-2xl flex flex-col justify-between shadow-sm relative group"
            >
              {/* Image thumbnail preview */}
              <div className="relative h-32 rounded-xl overflow-hidden mb-3 border bg-slate-50 dark:bg-slate-950">
                <img 
                  src={item.beforeAfter ? item.beforeUrl : item.url} 
                  alt="Gallery thumb" 
                  className="w-full h-full object-cover" 
                />
                
                <span className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-sm text-white text-[8px] uppercase tracking-widest font-extrabold px-2 py-1 rounded">
                  {item.category}
                </span>

                {item.beforeAfter && (
                  <span className="absolute top-2 right-2 bg-orange-500 text-white text-[8px] uppercase tracking-widest font-extrabold px-2 py-1 rounded flex items-center gap-1">
                    Split View
                  </span>
                )}
              </div>

              {/* Text detail */}
              <div>
                <h4 className="text-[11px] font-bold text-slate-800 dark:text-white leading-tight mb-2 truncate">
                  {item.title || 'Untitled Image'}
                </h4>
                <div className="flex justify-between items-center mt-auto">
                  <span className="text-[9px] text-slate-400 font-mono">Order: {item.orderIndex}</span>
                  <button
                    onClick={() => handleDeleteItem(item._id)}
                    className="text-red-500 hover:text-red-600 p-1.5 rounded-md hover:bg-red-500/10 transition-colors"
                    title="Delete Media"
                  >
                    <FaTrash size={10} />
                  </button>
                </div>
              </div>

            </div>
          ))}
          {gallery.length === 0 && (
            <div className="col-span-4 text-center py-20 text-slate-400 font-semibold bg-white dark:bg-slate-900 border border-dashed rounded-3xl">
              No gallery items cataloged. Upload files to begin.
            </div>
          )}
        </div>

      )}

    </AdminLayout>
  );
};

export default GalleryManager;
