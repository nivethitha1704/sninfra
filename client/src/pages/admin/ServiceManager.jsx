import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import { useForm } from 'react-hook-form';
import { FaSave, FaTimes, FaSpinner, FaEdit, FaChevronUp, FaChevronDown, FaToolbox, FaTrash, FaPlus } from 'react-icons/fa';
import * as Icons from 'react-icons/fa';

const ServiceManager = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingService, setEditingService] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  
  const [imageFile, setImageFile] = useState(null);
  
  const { register, handleSubmit, reset } = useForm();

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/services');
      setServices(res.data);
    } catch (err) {
      console.error('Failed to retrieve services database:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleOpenCreateForm = () => {
    setEditingService(null);
    setIsCreating(true);
    setImageFile(null);
    reset({
      title: '',
      icon: 'FaToolbox',
      description: ''
    });
  };

  const handleOpenEditForm = (svc) => {
    setEditingService(svc);
    setIsCreating(false);
    setImageFile(null);
    reset({
      title: svc.title,
      icon: svc.icon || 'FaToolbox',
      description: svc.description
    });
  };

  const handleDeleteService = async (id, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"?`)) return;
    setLoading(true);
    try {
      await axios.delete(`/api/services/${id}`);
      if (editingService && editingService._id === id) {
        setEditingService(null);
      }
      fetchServices();
    } catch (err) {
      alert('Failed to delete service: ' + (err.response?.data?.error || err.message));
      setLoading(false);
    }
  };

  const handleMoveService = async (index, direction) => {
    const nextServices = [...services];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= nextServices.length) return;

    // Swap indexes
    const temp = nextServices[index];
    nextServices[index] = nextServices[targetIndex];
    nextServices[targetIndex] = temp;

    // Reassign orderIndex values
    const orders = nextServices.map((svc, i) => ({
      id: svc._id,
      orderIndex: i
    }));

    setServices(nextServices); // Optimistic UI update

    try {
      await axios.put('/api/services/bulk/reorder', { orders });
      fetchServices();
    } catch (err) {
      alert('Failed to reorder services.');
      fetchServices();
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('icon', data.icon || 'FaToolbox');
      formData.append('description', data.description);

      if (imageFile) {
        formData.append('image', imageFile);
      }

      if (isCreating) {
        formData.append('orderIndex', services.length);
        await axios.post('/api/services', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setIsCreating(false);
      } else {
        await axios.put(`/api/services/${editingService._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setEditingService(null);
      }

      fetchServices();
    } catch (err) {
      alert(`Failed to ${isCreating ? 'create' : 'update'} service: ` + (err.response?.data?.error || err.message));
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center text-left">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white leading-none mb-2">Services CMS</h1>
          <p className="text-slate-400 text-xs">Manage catalog, add new services, edit details, drag reorder, or delete services.</p>
        </div>
        <button
          onClick={handleOpenCreateForm}
          className="px-4 py-2.5 bg-primary hover:bg-primary-light text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-2 transition-all cursor-pointer"
        >
          <FaPlus size={12} /> Add New Service
        </button>
      </div>

      {loading && !editingService && !isCreating ? (
        <div className="text-center py-20">
          <FaSpinner className="animate-spin text-secondary mx-auto" size={32} />
          <p className="text-xs text-slate-400 mt-3">Fetching services catalog list...</p>
        </div>
      ) : editingService || isCreating ? (
        
        // CREATE / EDIT SERVICE FORM
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/35 p-8 rounded-3xl shadow-sm text-left flex flex-col gap-6">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-extrabold text-slate-800 dark:text-white">
              {isCreating ? 'Add New Service' : `Edit Service: ${editingService.title}`}
            </h2>
            <button 
              type="button" 
              onClick={() => {
                setEditingService(null);
                setIsCreating(false);
              }}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
            >
              <FaTimes size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Service Title *</label>
              <input 
                type="text" 
                placeholder="e.g. Waterproofing & Roofing"
                className="p-3 bg-slate-50 dark:bg-slate-950 text-xs rounded-xl border border-transparent dark:border-slate-800 outline-none focus:ring-1 focus:ring-secondary disabled:opacity-60"
                {...register('title', { required: true })}
                disabled={!isCreating}
              />
              {!isCreating && (
                <span className="text-[10px] text-slate-400 italic">Title is locked to maintain slug URLs.</span>
              )}
            </div>
            {/* Icon */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">React FontAwesome Icon Class Name</label>
              <input 
                type="text" 
                placeholder="FaBuilding"
                className="p-3 bg-slate-50 dark:bg-slate-950 text-xs rounded-xl border border-transparent dark:border-slate-800 outline-none focus:ring-1 focus:ring-secondary"
                {...register('icon')}
              />
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Service Description *</label>
            <textarea 
              rows={4}
              placeholder="Assign details describing scope, engineering standards, deliverables..."
              className="p-3.5 bg-slate-50 dark:bg-slate-950 text-xs rounded-xl border border-transparent dark:border-slate-800 outline-none focus:ring-1 focus:ring-secondary resize-none"
              {...register('description', { required: true })}
            />
          </div>

          {/* Image */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Showcase Cover Image</span>
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              className="text-xs" 
            />
            {editingService?.image && (
              <img src={editingService.image} alt="old showcase" className="w-24 h-16 object-cover rounded mt-2 border" />
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-6 mt-4">
            {editingService ? (
              <button
                type="button"
                onClick={() => handleDeleteService(editingService._id, editingService.title)}
                className="px-4 py-3 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 font-bold text-xs rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
              >
                <FaTrash size={12} /> Delete Service
              </button>
            ) : <div />}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setEditingService(null);
                  setIsCreating(false);
                }}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-primary hover:bg-primary-light text-white font-bold text-xs rounded-xl shadow flex items-center gap-2 cursor-pointer"
              >
                <FaSave /> {isCreating ? 'Create Service' : 'Save Service'}
              </button>
            </div>
          </div>

        </form>

      ) : (

        // SERVICES DIRECTORY TABLE
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/35 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 text-slate-400 text-[10px] uppercase font-bold tracking-widest border-b border-slate-150/40 dark:border-slate-800/40">
                  <th className="p-5">Icon</th>
                  <th className="p-5">Service details</th>
                  <th className="p-5">Description</th>
                  <th className="p-5">Sort Order</th>
                  <th className="p-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {services.map((svc, index) => {
                  const Icon = Icons[svc.icon] || FaToolbox;
                  return (
                    <tr key={svc._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                      <td className="p-5">
                        <div className="w-9 h-9 bg-accent/10 text-accent rounded-lg flex items-center justify-center">
                          <Icon size={16} />
                        </div>
                      </td>
                      <td className="p-5 font-bold text-slate-800 dark:text-white">
                        {svc.title}
                      </td>
                      <td className="p-5 text-slate-500 max-w-xs truncate">
                        {svc.description}
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleMoveService(index, 'up')}
                            disabled={index === 0}
                            className="p-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 text-slate-500 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                            title="Move Up"
                          >
                            <FaChevronUp size={9} />
                          </button>
                          <button
                            onClick={() => handleMoveService(index, 'down')}
                            disabled={index === services.length - 1}
                            className="p-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 text-slate-500 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                            title="Move Down"
                          >
                            <FaChevronDown size={9} />
                          </button>
                          <span className="font-mono text-[10px] text-slate-400 pl-1">{svc.orderIndex}</span>
                        </div>
                      </td>
                      <td className="p-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditForm(svc)}
                            className="p-2 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350 cursor-pointer"
                            title="Edit Service"
                          >
                            <FaEdit size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteService(svc._id, svc.title)}
                            className="p-2 rounded bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 transition-colors cursor-pointer"
                            title="Delete Service"
                          >
                            <FaTrash size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      )}

    </AdminLayout>
  );
};

export default ServiceManager;
