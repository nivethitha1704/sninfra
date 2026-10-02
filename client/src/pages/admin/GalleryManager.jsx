import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import { useForm } from 'react-hook-form';
import { 
  FaPlus, FaTrash, FaTimes, FaSave, FaSpinner, 
  FaExchangeAlt, FaImage, FaFolderOpen, FaEdit, 
  FaCheck, FaLayerGroup, FaArrowRight 
} from 'react-icons/fa';

const GalleryManager = () => {
  const [gallery, setGallery] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  // Modals & Panels
  const [isMediaFormOpen, setIsMediaFormOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // For editing photo metadata

  // Category editing & deletion state
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);
  const [categorySuccessMsg, setCategorySuccessMsg] = useState('');
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catOrder, setCatOrder] = useState('0');
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [categoryError, setCategoryError] = useState('');

  // Media files state
  const [singleFile, setSingleFile] = useState(null);
  const [beforeFile, setBeforeFile] = useState(null);
  const [afterFile, setAfterFile] = useState(null);
  const [isSubmittingMedia, setIsSubmittingMedia] = useState(false);

  const { register, handleSubmit, reset, watch, setValue } = useForm();
  const watchBeforeAfter = watch('beforeAfter', false);

  // Fetch all gallery photos and dynamic categories
  const fetchData = async () => {
    setLoading(true);
    try {
      const [galleryRes, categoriesRes] = await Promise.all([
        axios.get('/api/gallery'),
        axios.get('/api/gallery/categories')
      ]);
      setGallery(galleryRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (err) {
      console.error('Failed to load gallery manager data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- CATEGORY ACTIONS ---

  const handleOpenCategoryModal = () => {
    setEditingCategory(null);
    setCatName('');
    setCatDesc('');
    setCatOrder(String(categories.length + 1));
    setCategoryError('');
    setIsCategoryModalOpen(true);
  };

  const handleEditCategoryClick = (cat) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatDesc(cat.description || '');
    setCatOrder(String(cat.orderIndex || 0));
    setCategoryError('');
  };

  const handleCancelCategoryEdit = () => {
    setEditingCategory(null);
    setCatName('');
    setCatDesc('');
    setCatOrder(String(categories.length + 1));
    setCategoryError('');
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!catName || !catName.trim()) {
      setCategoryError('Category name is required');
      return;
    }

    setIsSavingCategory(true);
    setCategoryError('');
    try {
      if (editingCategory) {
        // Update existing category
        await axios.put(`/api/gallery/categories/${editingCategory._id}`, {
          name: catName.trim(),
          description: catDesc.trim(),
          orderIndex: parseInt(catOrder) || 0
        });
      } else {
        // Create new category
        await axios.post('/api/gallery/categories', {
          name: catName.trim(),
          description: catDesc.trim(),
          orderIndex: parseInt(catOrder) || 0
        });
      }

      handleCancelCategoryEdit();
      // Refresh categories and gallery (in case names cascaded)
      const [galleryRes, categoriesRes] = await Promise.all([
        axios.get('/api/gallery'),
        axios.get('/api/gallery/categories')
      ]);
      setGallery(galleryRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (err) {
      setCategoryError(err.response?.data?.error || 'Failed to save category');
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleTriggerDeleteCategory = (cat) => {
    setCategoryToDelete(cat);
    setCategoryError('');
  };

  const handleConfirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    setIsDeletingCategory(true);
    setCategoryError('');
    try {
      await axios.delete(`/api/gallery/categories/${categoryToDelete._id}`);
      if (activeCategoryFilter.toLowerCase() === categoryToDelete.name.toLowerCase()) {
        setActiveCategoryFilter('All');
      }
      setCategorySuccessMsg(`Category "${categoryToDelete.name}" deleted successfully.`);
      setTimeout(() => setCategorySuccessMsg(''), 4000);
      setCategoryToDelete(null);
      await fetchData();
    } catch (err) {
      setCategoryError(err.response?.data?.error || 'Failed to delete category');
    } finally {
      setIsDeletingCategory(false);
    }
  };

  // --- MEDIA ACTIONS ---

  const handleOpenCreateMediaForm = () => {
    setEditingItem(null);
    setSingleFile(null);
    setBeforeFile(null);
    setAfterFile(null);
    const defaultCat = categories.length > 0 ? categories[0].name : 'Building';
    reset({
      title: '',
      category: defaultCat,
      beforeAfter: false,
      orderIndex: '0'
    });
    setIsMediaFormOpen(true);
  };

  const handleOpenEditMediaModal = (item) => {
    setEditingItem(item);
    setValue('title', item.title || '');
    setValue('category', item.category || (categories[0]?.name || 'Building'));
    setValue('orderIndex', String(item.orderIndex || 0));
  };

  const handleSaveItemEdit = async (data) => {
    if (!editingItem) return;
    try {
      await axios.put(`/api/gallery/${editingItem._id}`, {
        title: data.title,
        category: data.category,
        orderIndex: data.orderIndex
      });
      setEditingItem(null);
      fetchData();
    } catch (err) {
      alert('Failed to update photo: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Delete this gallery photo permanently?')) return;
    try {
      await axios.delete(`/api/gallery/${id}`);
      fetchData();
    } catch (err) {
      alert('Failed to delete gallery item.');
    }
  };

  const onSubmitMedia = async (data) => {
    setIsSubmittingMedia(true);
    try {
      const formData = new FormData();
      formData.append('title', data.title || '');
      formData.append('category', data.category);
      formData.append('beforeAfter', data.beforeAfter);
      formData.append('orderIndex', data.orderIndex || '0');

      if (data.beforeAfter) {
        if (!beforeFile || !afterFile) {
          alert('Both before and after images must be selected.');
          setIsSubmittingMedia(false);
          return;
        }
        formData.append('beforeFile', beforeFile);
        formData.append('afterFile', afterFile);
      } else {
        if (!singleFile) {
          alert('An image file must be selected.');
          setIsSubmittingMedia(false);
          return;
        }
        formData.append('file', singleFile);
      }

      await axios.post('/api/gallery', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setIsMediaFormOpen(false);
      fetchData();
    } catch (err) {
      alert('Save gallery item failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsSubmittingMedia(false);
    }
  };

  // Filter gallery items for active filter tab
  const filteredGallery = gallery.filter((item) => {
    if (activeCategoryFilter === 'All') return true;
    return item.category?.toLowerCase() === activeCategoryFilter.toLowerCase();
  });

  const getCategoryCount = (name) => {
    return gallery.filter((item) => item.category?.toLowerCase() === name.toLowerCase()).length;
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-8 text-left pb-12">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/50 dark:border-slate-800/35 pb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-white leading-none mb-2">
              Gallery & Categories Manager
            </h1>
            <p className="text-slate-400 text-xs">
              Organize construction photos by custom categories like Building, Interiors, and Elevation.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Manage Categories Button */}
            <button
              onClick={handleOpenCategoryModal}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 border border-slate-300/40 dark:border-slate-700/60 shadow-sm"
            >
              <FaFolderOpen className="text-amber-500" />
              <span>Manage Categories ({categories.length})</span>
            </button>

            {/* Upload Media Button */}
            <button
              onClick={handleOpenCreateMediaForm}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-[#1C68F5] hover:bg-[#091aa1] text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2"
            >
              <FaPlus />
              <span>Upload Photo</span>
            </button>
          </div>
        </div>

        {/* Category Alert / Success Banner */}
        {categorySuccessMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2">
              <FaCheck size={14} />
              <span>{categorySuccessMsg}</span>
            </div>
            <button 
              onClick={() => setCategorySuccessMsg('')} 
              className="text-xs hover:opacity-75"
            >
              <FaTimes size={12} />
            </button>
          </div>
        )}

        {/* CATEGORY FILTER PILLS & ACTIONS */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setActiveCategoryFilter('All')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
                activeCategoryFilter === 'All'
                  ? 'bg-[#1C68F5] text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>All Categories</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                activeCategoryFilter === 'All' ? 'bg-[#FFC100] text-[#1C68F5]' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
              }`}>
                {gallery.length}
              </span>
            </button>

            {categories.map((cat) => {
              const count = getCategoryCount(cat.name);
              const isActive = activeCategoryFilter.toLowerCase() === cat.name.toLowerCase();

              return (
                <div key={cat._id || cat.name} className="flex items-center shrink-0">
                  <button
                    onClick={() => setActiveCategoryFilter(cat.name)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
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
                </div>
              );
            })}
          </div>

          {/* Quick Category Action for Active Filter */}
          {activeCategoryFilter !== 'All' && (() => {
            const activeCatObj = categories.find(c => c.name.toLowerCase() === activeCategoryFilter.toLowerCase());
            if (!activeCatObj) return null;
            return (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleEditCategoryClick(activeCatObj);
                    setIsCategoryModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700"
                  title="Rename Category"
                >
                  <FaEdit size={11} />
                  <span>Rename</span>
                </button>
                <button
                  onClick={() => handleTriggerDeleteCategory(activeCatObj)}
                  className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-600 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors border border-red-500/20"
                  title={`Delete ${activeCatObj.name} Category`}
                >
                  <FaTrash size={11} />
                  <span>Delete Category</span>
                </button>
              </div>
            );
          })()}
        </div>

        {/* UPLOAD NEW MEDIA DRAWER / MODAL */}
        {isMediaFormOpen && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl animate-fade-in">
            <div className="flex justify-between items-center pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-black text-slate-800 dark:text-white">
                  Upload Gallery Photo
                </h2>
                <p className="text-xs text-slate-400">
                  Add photos and assign them to your custom categories.
                </p>
              </div>
              <button 
                onClick={() => setIsMediaFormOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition-colors"
              >
                <FaTimes size={14} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmitMedia)} className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Photo Title */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Photo Title / Caption
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. Living Room Modular Fitouts"
                    className="p-3 bg-slate-50 dark:bg-slate-950 text-xs rounded-xl border border-transparent dark:border-slate-800 outline-none focus:ring-1 focus:ring-secondary"
                    {...register('title')}
                  />
                </div>

                {/* Category Dropdown */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Category *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        handleOpenCategoryModal();
                      }}
                      className="text-[10px] font-bold text-[#1C68F5] dark:text-[#FFC100] hover:underline flex items-center gap-1"
                    >
                      <FaPlus size={8} /> Add Category
                    </button>
                  </div>
                  <select
                    className="p-3 bg-slate-50 dark:bg-slate-950 text-xs rounded-xl border border-transparent dark:border-slate-800 outline-none focus:ring-1 focus:ring-secondary font-medium"
                    {...register('category', { required: true })}
                  >
                    {categories.map((c) => (
                      <option key={c._id || c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                    {categories.length === 0 && (
                      <>
                        <option value="Building">Building</option>
                        <option value="Interiors">Interiors</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* Before/After Toggle */}
                <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <input
                    type="checkbox"
                    id="beforeAfterToggle"
                    className="w-4 h-4 accent-[#1C68F5] cursor-pointer"
                    {...register('beforeAfter')}
                  />
                  <label htmlFor="beforeAfterToggle" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer flex items-center gap-2">
                    <FaExchangeAlt className="text-amber-500" />
                    <span>Before / After Interactive Comparison</span>
                  </label>
                </div>

                {/* Order Index */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Sorting Order Index
                  </label>
                  <input 
                    type="number"
                    placeholder="0"
                    className="p-3 bg-slate-50 dark:bg-slate-950 text-xs rounded-xl border border-transparent dark:border-slate-800 outline-none focus:ring-1 focus:ring-secondary"
                    {...register('orderIndex')}
                  />
                </div>
              </div>

              {/* File Inputs */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
                {watchBeforeAfter ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Before Image *</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setBeforeFile(e.target.files[0])}
                        className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#1C68F5]/10 file:text-[#1C68F5] hover:file:bg-[#1C68F5]/20"
                      />
                    </div>
                    <div className="flex flex-col gap-2 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">After Image *</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setAfterFile(e.target.files[0])}
                        className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-500/10 file:text-emerald-600 hover:file:bg-emerald-500/20"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Photo File *</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSingleFile(e.target.files[0])}
                      className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#1C68F5]/10 file:text-[#1C68F5] hover:file:bg-[#1C68F5]/20"
                    />
                  </div>
                )}
              </div>

              {/* Form Buttons */}
              <div className="flex gap-3 justify-end border-t border-slate-100 dark:border-slate-800 pt-6">
                <button
                  type="button"
                  onClick={() => setIsMediaFormOpen(false)}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingMedia}
                  className="px-6 py-3 bg-[#1C68F5] hover:bg-[#091aa1] text-white font-bold text-xs rounded-xl shadow flex items-center gap-2"
                >
                  {isSubmittingMedia ? <FaSpinner className="animate-spin" /> : <FaSave />}
                  <span>{isSubmittingMedia ? 'Uploading...' : 'Save & Publish Photo'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* EDIT PHOTO METADATA MODAL */}
        {editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black text-slate-800 dark:text-white">
                  Edit Photo Details
                </h3>
                <button 
                  onClick={() => setEditingItem(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="flex items-center gap-4 mb-6 p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                <img 
                  src={editingItem.beforeAfter ? editingItem.beforeUrl : editingItem.url} 
                  alt="Thumb" 
                  className="w-16 h-16 rounded-xl object-cover" 
                />
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Current Category</span>
                  <p className="text-xs font-bold text-[#1C68F5]">{editingItem.category}</p>
                </div>
              </div>

              <form onSubmit={handleSubmit(handleSaveItemEdit)} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Title</label>
                  <input 
                    type="text" 
                    className="p-3 bg-slate-50 dark:bg-slate-950 text-xs rounded-xl border border-transparent dark:border-slate-800 outline-none focus:ring-1 focus:ring-secondary"
                    {...register('title')}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reassign Category</label>
                  <select
                    className="p-3 bg-slate-50 dark:bg-slate-950 text-xs rounded-xl border border-transparent dark:border-slate-800 outline-none focus:ring-1 focus:ring-secondary"
                    {...register('category')}
                  >
                    {categories.map((c) => (
                      <option key={c._id || c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sort Index</label>
                  <input 
                    type="number" 
                    className="p-3 bg-slate-50 dark:bg-slate-950 text-xs rounded-xl border border-transparent dark:border-slate-800 outline-none focus:ring-1 focus:ring-secondary"
                    {...register('orderIndex')}
                  />
                </div>

                <div className="flex gap-2 justify-end mt-4">
                  <button 
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2 bg-[#1C68F5] text-white text-xs font-bold rounded-xl shadow"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* CATEGORY MANAGER MODAL */}
        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 animate-fade-in">
            <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col">
              
              {/* Modal Header */}
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800 mb-6 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <FaFolderOpen size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-800 dark:text-white leading-none">
                      Manage Gallery Categories
                    </h2>
                    <p className="text-slate-400 text-xs mt-1">
                      Add, rename, or reorder categories (Building, Interiors, Elevation, etc.)
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center"
                >
                  <FaTimes size={14} />
                </button>
              </div>

              {/* Category Edit/Create Form */}
              <form onSubmit={handleSaveCategory} className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 mb-6 shrink-0">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#1C68F5] dark:text-[#FFC100] block mb-3">
                  {editingCategory ? `Edit Category: "${editingCategory.name}"` : 'Add New Category'}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                  <div className="sm:col-span-2 flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Category Name *</label>
                    <input 
                      type="text"
                      placeholder="e.g. Building, Interiors, Villa Design"
                      value={catName}
                      onChange={(e) => setCatName(e.target.value)}
                      className="p-2.5 bg-white dark:bg-slate-900 text-xs rounded-xl border border-slate-200 dark:border-slate-800 outline-none focus:ring-1 focus:ring-secondary font-medium"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Sort Order</label>
                    <input 
                      type="number"
                      placeholder="1"
                      value={catOrder}
                      onChange={(e) => setCatOrder(e.target.value)}
                      className="p-2.5 bg-white dark:bg-slate-900 text-xs rounded-xl border border-slate-200 dark:border-slate-800 outline-none focus:ring-1 focus:ring-secondary font-medium"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1 mb-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Description (optional subtitle)</label>
                  <input 
                    type="text"
                    placeholder="e.g. Civil construction, residential & commercial structures"
                    value={catDesc}
                    onChange={(e) => setCatDesc(e.target.value)}
                    className="p-2.5 bg-white dark:bg-slate-900 text-xs rounded-xl border border-slate-200 dark:border-slate-800 outline-none focus:ring-1 focus:ring-secondary"
                  />
                </div>

                {categoryError && (
                  <p className="text-xs text-red-500 font-semibold mb-2">{categoryError}</p>
                )}

                <div className="flex justify-end gap-2">
                  {editingCategory && (
                    <button
                      type="button"
                      onClick={handleCancelCategoryEdit}
                      className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl"
                    >
                      Cancel Edit
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isSavingCategory}
                    className="px-5 py-2 bg-[#1C68F5] hover:bg-[#091aa1] text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5"
                  >
                    {isSavingCategory ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                    <span>{editingCategory ? 'Update Category' : 'Save Category'}</span>
                  </button>
                </div>
              </form>

              {/* Categories Table/List */}
              <div className="flex-1 overflow-y-auto pr-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">
                  Existing Categories ({categories.length})
                </span>

                <div className="flex flex-col gap-2">
                  {categories.map((cat) => {
                    const count = getCategoryCount(cat.name);
                    return (
                      <div 
                        key={cat._id || cat.name}
                        className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-lg bg-[#1C68F5]/10 text-[#1C68F5] text-[10px] font-black flex items-center justify-center shrink-0">
                            {cat.orderIndex || 0}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-slate-800 dark:text-white">
                                {cat.name}
                              </h4>
                              <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                                {count} {count === 1 ? 'photo' : 'photos'}
                              </span>
                            </div>
                            {cat.description && (
                              <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                                {cat.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditCategoryClick(cat)}
                            title="Edit Category"
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#1C68F5] dark:bg-slate-800 dark:hover:bg-[#1C68F5] text-slate-700 hover:text-white dark:text-slate-300 dark:hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                          >
                            <FaEdit size={11} />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleTriggerDeleteCategory(cat)}
                            title={`Delete ${cat.name}`}
                            className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-600 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                          >
                            <FaTrash size={11} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Close Button */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-4 flex justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
                >
                  Done Managing Categories
                </button>
              </div>

            </div>
          </div>
        )}

        {/* DELETE CATEGORY CONFIRMATION MODAL */}
        {categoryToDelete && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-red-500/30 text-left">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mb-4">
                <FaTrash size={20} />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">
                Delete Category "{categoryToDelete.name}"?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                Are you sure you want to permanently delete this category? Any existing photos in this category will remain safe and will be moved to the default category.
              </p>
              {categoryError && (
                <p className="text-xs text-red-500 font-bold mb-4">{categoryError}</p>
              )}
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setCategoryToDelete(null); setCategoryError(''); }}
                  disabled={isDeletingCategory}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteCategory}
                  disabled={isDeletingCategory}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-lg shadow-red-600/20 flex items-center gap-2 transition-all"
                >
                  {isDeletingCategory ? <FaSpinner className="animate-spin" /> : <FaTrash />}
                  <span>{isDeletingCategory ? 'Deleting Category...' : 'Yes, Delete Category'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* GALLERY PHOTOS GRID */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="bg-slate-100 dark:bg-slate-800 rounded-2xl h-48 animate-pulse" />
            ))}
          </div>
        ) : filteredGallery.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <FaImage className="text-slate-400 mx-auto mb-3" size={32} />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
              No photos found in category "{activeCategoryFilter}"
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Upload photos to this category using the button above.
            </p>
            <button
              onClick={handleOpenCreateMediaForm}
              className="px-5 py-2 bg-[#1C68F5] text-white text-xs font-bold rounded-xl shadow"
            >
              Upload Photo Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 text-left">
            {filteredGallery.map((item) => (
              <div 
                key={item._id}
                className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/40 p-3 rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative group"
              >
                {/* Thumbnail Preview */}
                <div className="relative h-36 rounded-xl overflow-hidden mb-3 bg-slate-100 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                  <img 
                    src={item.beforeAfter ? item.beforeUrl : item.url} 
                    onError={(e) => { e.currentTarget.src = '/photos/villa-elevation.png'; }}
                    alt="Gallery item" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  />

                  {/* Category Badge */}
                  <span className="absolute top-2 left-2 bg-slate-950/85 backdrop-blur-sm text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow">
                    {item.category}
                  </span>

                  {/* Before/After Tag */}
                  {item.beforeAfter && (
                    <span className="absolute top-2 right-2 bg-amber-500 text-slate-950 text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded shadow">
                      B/A
                    </span>
                  )}
                </div>

                {/* Info & Action Buttons */}
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white line-clamp-1 mb-2">
                    {item.title || 'Untitled Photo'}
                  </h4>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60">
                    <span className="text-[10px] text-slate-400 font-mono">
                      #{item.orderIndex || 0}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditMediaModal(item)}
                        title="Edit photo info or reassign category"
                        className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-[#1C68F5] hover:text-white text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors"
                      >
                        <FaEdit size={11} />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item._id)}
                        title="Delete photo permanently"
                        className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-red-500 hover:text-white text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors"
                      >
                        <FaTrash size={11} />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </AdminLayout>
  );
};

export default GalleryManager;
