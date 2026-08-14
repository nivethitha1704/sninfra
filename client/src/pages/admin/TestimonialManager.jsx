import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import { useForm } from 'react-hook-form';
import { FaPlus, FaTrash, FaTimes, FaSave, FaSpinner, FaEye, FaEyeSlash, FaEdit } from 'react-icons/fa';

const TestimonialManager = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [syncing, setSyncing] = useState(false);

  const [imageFile, setImageFile] = useState(null);

  const { register, handleSubmit, reset } = useForm();

  const handleSyncReviews = async () => {
    setSyncing(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/testimonials/sync', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(res.data.message);
      fetchTestimonials();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to sync Google Reviews');
    } finally {
      setSyncing(false);
    }
  };

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/testimonials');
      setTestimonials(res.data);
    } catch (err) {
      console.error('Failed to load testimonials:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleOpenCreateForm = () => {
    setEditingTestimonial(null);
    setImageFile(null);
    reset({
      clientName: '',
      role: '',
      rating: '5',
      reviewText: '',
      status: 'Show'
    });
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (t) => {
    setEditingTestimonial(t);
    setImageFile(null);
    reset({
      clientName: t.clientName,
      role: t.role || '',
      rating: String(t.rating || 5),
      reviewText: t.reviewText,
      status: t.status
    });
    setIsFormOpen(true);
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Delete review permanently?')) return;
    try {
      await axios.delete(`/api/testimonials/${id}`);
      fetchTestimonials();
    } catch (err) {
      alert('Delete testimonial failed.');
    }
  };

  const handleToggleStatus = async (item) => {
    const nextStatus = item.status === 'Show' ? 'Hide' : 'Show';
    try {
      await axios.put(`/api/testimonials/${item._id}`, { status: nextStatus });
      fetchTestimonials();
    } catch (err) {
      alert('Failed to update status visibility.');
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('clientName', data.clientName);
      formData.append('role', data.role);
      formData.append('rating', data.rating);
      formData.append('reviewText', data.reviewText);
      formData.append('status', data.status);

      if (imageFile) {
        formData.append('clientImage', imageFile);
      }

      if (editingTestimonial) {
        await axios.put(`/api/testimonials/${editingTestimonial._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await axios.post('/api/testimonials', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setIsFormOpen(false);
      fetchTestimonials();
    } catch (err) {
      alert('Save testimonial failed: ' + (err.response?.data?.error || err.message));
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center text-left">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white leading-none mb-2">Testimonials CMS</h1>
          <p className="text-slate-400 text-xs">Verify review ratings and toggle visibility parameters on the landing page.</p>
        </div>
        {!isFormOpen && (
          <div className="flex gap-2">
            <button
              onClick={handleSyncReviews}
              disabled={syncing}
              className="bg-primary hover:bg-primary-light text-white font-bold text-xs px-5 py-3 rounded-xl shadow flex items-center gap-2 disabled:opacity-50"
            >
              {syncing ? <FaSpinner className="animate-spin" /> : null}
              {syncing ? 'Syncing...' : 'Sync Google Reviews'}
            </button>
            <button
              onClick={handleOpenCreateForm}
              className="bg-secondary hover:bg-secondary-light text-white font-bold text-xs px-5 py-3 rounded-xl shadow flex items-center gap-2"
            >
              <FaPlus /> Add Testimonial
            </button>
          </div>
        )}
      </div>

      {loading && !isFormOpen ? (
        <div className="text-center py-20">
          <FaSpinner className="animate-spin text-secondary mx-auto" size={32} />
          <p className="text-xs text-slate-400 mt-3">Fetching testimonials feed...</p>
        </div>
      ) : isFormOpen ? (
        
        // EDIT TESTIMONIAL FORM
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/35 p-8 rounded-3xl shadow-sm text-left flex flex-col gap-6">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-extrabold text-slate-800 dark:text-white">
              {editingTestimonial ? 'Edit Testimonial' : 'Create Testimonial'}
            </h2>
            <button 
              type="button" 
              onClick={() => setIsFormOpen(false)}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-400"
            >
              <FaTimes size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Client Name */}
            <div className="flex flex-col gap-1.5 col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Client Name *</label>
              <input 
                type="text" 
                placeholder="Ramesh Pillai"
                className="p-3 bg-slate-50 dark:bg-slate-950 text-xs rounded-xl border border-transparent dark:border-slate-800 outline-none focus:ring-1 focus:ring-secondary"
                {...register('clientName', { required: true })}
              />
            </div>
            {/* Rating */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Star Rating</label>
              <select
                className="p-3 bg-slate-50 dark:bg-slate-950 text-xs rounded-xl border border-transparent dark:border-slate-800 outline-none focus:ring-1 focus:ring-secondary"
                {...register('rating')}
              >
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Role */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Client Role / Profile</label>
              <input 
                type="text" 
                placeholder="Home Owner, Pollachi"
                className="p-3 bg-slate-50 dark:bg-slate-950 text-xs rounded-xl border border-transparent dark:border-slate-800 outline-none focus:ring-1 focus:ring-secondary"
                {...register('role')}
              />
            </div>
            {/* Status */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Visibility Status</label>
              <select
                className="p-3 bg-slate-50 dark:bg-slate-950 text-xs rounded-xl border border-transparent dark:border-slate-800 outline-none focus:ring-1 focus:ring-secondary"
                {...register('status')}
              >
                <option value="Show">Show publicly</option>
                <option value="Hide">Hide from web</option>
              </select>
            </div>
          </div>

          {/* Review text */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Review Content *</label>
            <textarea 
              rows={4}
              placeholder="Write the feedback review statements..."
              className="p-3.5 bg-slate-50 dark:bg-slate-950 text-xs rounded-xl border border-transparent dark:border-slate-800 outline-none focus:ring-1 focus:ring-secondary resize-none"
              {...register('reviewText', { required: true })}
            />
          </div>

          {/* Client image */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Client Image / Headshot</span>
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              className="text-xs" 
            />
            {editingTestimonial?.clientImage && (
              <img src={editingTestimonial.clientImage} alt="old avatar" className="w-12 h-12 rounded-full object-cover mt-2 border" />
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
              <FaSave /> Save Testimonial
            </button>
          </div>

        </form>

      ) : (

        // TESTIMONIAL DIRECTORY TABLE
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/35 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 text-slate-400 text-[10px] uppercase font-bold tracking-widest border-b border-slate-150/40 dark:border-slate-800/40">
                  <th className="p-5">Client</th>
                  <th className="p-5">Rating</th>
                  <th className="p-5">Review Snippet</th>
                  <th className="p-5">Visibility</th>
                  <th className="p-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {testimonials.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                    <td className="p-5 flex items-center gap-3">
                      {t.clientImage ? (
                        <img src={t.clientImage} alt="Avatar" className="w-8 h-8 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="w-8 h-8 bg-secondary/15 text-secondary font-bold rounded-full flex items-center justify-center shrink-0">
                          {t.clientName.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-white leading-none mb-1">{t.clientName}</h4>
                        <span className="text-[9px] text-slate-400">{t.role || 'Home Owner'}</span>
                      </div>
                    </td>
                    <td className="p-5">
                      <span className="text-amber-500 font-bold font-mono">{t.rating} / 5</span>
                    </td>
                    <td className="p-5 text-slate-500 max-w-xs truncate italic">
                      "{t.reviewText}"
                    </td>
                    <td className="p-5">
                      <button
                        onClick={() => handleToggleStatus(t)}
                        className={`px-3 py-1.5 rounded-lg text-[9px] uppercase tracking-wider font-extrabold flex items-center gap-1.5 border transition-all ${
                          t.status === 'Show' 
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                            : 'bg-red-500/10 text-red-500 border-red-500/20'
                        }`}
                      >
                        {t.status === 'Show' ? <FaEye /> : <FaEyeSlash />}
                        {t.status}
                      </button>
                    </td>
                    <td className="p-5 text-right flex justify-end gap-2 mt-1">
                      <button
                        onClick={() => handleOpenEditForm(t)}
                        className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350"
                      >
                        <FaEdit size={12} />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(t._id)}
                        className="p-2.5 rounded-lg bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 animate-fade-in"
                      >
                        <FaTrash size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
                {testimonials.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center p-10 text-slate-400 font-semibold">
                      No customer reviews cataloged yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      )}

    </AdminLayout>
  );
};

export default TestimonialManager;
