import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import { useForm } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import { 
  FaPlus, FaEdit, FaTrash, FaCopy, 
  FaSave, FaTimes, FaGlobe, FaSpinner,
  FaFilePdf, FaImage, FaCheck, FaFolderMinus 
} from 'react-icons/fa';

const ProjectManager = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  // File Upload states
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [brochureFile, setBrochureFile] = useState(null);
  const [imagesFiles, setImagesFiles] = useState([]);
  const [droneFiles, setDroneFiles] = useState([]);
  const [floorPlansFiles, setFloorPlansFiles] = useState([]);

  // Removed old files lists (tracked during editing)
  const [removedImages, setRemovedImages] = useState([]);
  const [removedDroneImages, setRemovedDroneImages] = useState([]);
  const [removedFloorPlans, setRemovedFloorPlans] = useState([]);

  // Milestone sliders state
  const defaultMilestones = {
    'Foundation': 0,
    'Columns & Beams': 0,
    'Brick Work': 0,
    'Plastering': 0,
    'Plumbing & Electrical': 0,
    'Flooring': 0,
    'Interior Fitouts': 0,
    'Painting': 0,
    'Finishing & Handover': 0
  };
  const [milestones, setMilestones] = useState(defaultMilestones);

  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const watchCategory = watch('category', 'Residential');
  const watchStatus = watch('status', 'Draft');

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/projects');
      setProjects(res.data);
    } catch (err) {
      console.error('Failed to load project database list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleOpenCreateForm = () => {
    setEditingProject(null);
    setMilestones(defaultMilestones);
    setThumbnailFile(null);
    setBrochureFile(null);
    setImagesFiles([]);
    setDroneFiles([]);
    setFloorPlansFiles([]);
    setRemovedImages([]);
    setRemovedDroneImages([]);
    setRemovedFloorPlans([]);
    reset({
      name: '',
      clientName: '',
      category: 'Residential',
      location: '',
      budget: '',
      area: '',
      floors: '',
      description: '',
      features: '',
      status: 'Draft',
      startDate: '',
      endDate: '',
      mapLink: '',
      videos: ''
    });
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (proj) => {
    setEditingProject(proj);
    setMilestones({ ...defaultMilestones, ...proj.progressDetails });
    setThumbnailFile(null);
    setBrochureFile(null);
    setImagesFiles([]);
    setDroneFiles([]);
    setFloorPlansFiles([]);
    setRemovedImages([]);
    setRemovedDroneImages([]);
    setRemovedFloorPlans([]);
    
    // Format dates for input tags
    const fmtDate = (d) => d ? new Date(d).toISOString().split('T')[0] : '';

    reset({
      name: proj.name,
      clientName: proj.clientName || '',
      category: proj.category,
      location: proj.location,
      budget: proj.budget || '',
      area: proj.area || '',
      floors: proj.floors || '',
      description: proj.description,
      features: proj.features ? proj.features.join(', ') : '',
      status: proj.status,
      startDate: fmtDate(proj.startDate),
      endDate: fmtDate(proj.endDate),
      mapLink: proj.mapLink || '',
      videos: proj.videos ? proj.videos.join(', ') : ''
    });
    setIsFormOpen(true);
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this project and all its media files?')) return;
    try {
      await axios.delete(`/api/projects/${id}`);
      fetchProjects();
    } catch (err) {
      alert('Delete project failed.');
    }
  };

  const handleDuplicateProject = async (id) => {
    try {
      await axios.post(`/api/projects/${id}/duplicate`);
      fetchProjects();
    } catch (err) {
      alert('Duplicate project failed.');
    }
  };

  // Helper to handle sliders changes
  const handleMilestoneSliderChange = (milestone, val) => {
    setMilestones(prev => {
      const next = { ...prev, [milestone]: parseInt(val) };
      // Auto-calculate overall average completion percentage
      const total = Object.values(next).reduce((sum, current) => sum + current, 0);
      const average = Math.round(total / Object.keys(next).length);
      setValue('completionPercent', average);
      return next;
    });
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      
      // Append core string fields
      formData.append('name', data.name);
      formData.append('clientName', data.clientName);
      formData.append('category', data.category);
      formData.append('location', data.location);
      formData.append('budget', data.budget);
      formData.append('area', data.area);
      formData.append('floors', data.floors);
      formData.append('description', data.description);
      formData.append('status', data.status);
      formData.append('mapLink', data.mapLink);
      if (data.startDate) formData.append('startDate', data.startDate);
      if (data.endDate) formData.append('endDate', data.endDate);

      // Features list formatting
      const featuresArr = data.features ? data.features.split(',').map(f => f.trim()) : [];
      formData.append('features', JSON.stringify(featuresArr));

      // Videos list formatting
      const videosArr = data.videos ? data.videos.split(',').map(v => v.trim()) : [];
      formData.append('videos', JSON.stringify(videosArr));

      // Sliders completion details
      const overallCompletion = Object.values(milestones).reduce((sum, curr) => sum + curr, 0);
      const averageCompletion = Math.round(overallCompletion / Object.keys(milestones).length);
      formData.append('completionPercent', averageCompletion);
      formData.append('progressDetails', JSON.stringify(milestones));

      // File Appends
      if (thumbnailFile) formData.append('thumbnail', thumbnailFile);
      if (brochureFile) formData.append('brochure', brochureFile);
      imagesFiles.forEach(f => formData.append('images', f));
      droneFiles.forEach(f => formData.append('droneImages', f));
      floorPlansFiles.forEach(f => formData.append('floorPlans', f));

      // Removed image paths (during updates)
      if (editingProject) {
        formData.append('removedImages', JSON.stringify(removedImages));
        formData.append('removedDroneImages', JSON.stringify(removedDroneImages));
        formData.append('removedFloorPlans', JSON.stringify(removedFloorPlans));

        await axios.put(`/api/projects/${editingProject._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await axios.post('/api/projects', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setIsFormOpen(false);
      fetchProjects();
    } catch (err) {
      alert('Failed to save project: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Dropzone binders
  const onDropImages = (accepted) => setImagesFiles(prev => [...prev, ...accepted]);
  const onDropDrone = (accepted) => setDroneFiles(prev => [...prev, ...accepted]);
  const onDropPlans = (accepted) => setFloorPlansFiles(prev => [...prev, ...accepted]);

  const { getRootProps: getImagesProps, getInputProps: getImagesInput } = useDropzone({ onDrop: onDropImages, accept: { 'image/*': [] } });
  const { getRootProps: getDroneProps, getInputProps: getDroneInput } = useDropzone({ onDrop: onDropDrone, accept: { 'image/*': [] } });
  const { getRootProps: getPlansProps, getInputProps: getPlansInput } = useDropzone({ onDrop: onDropPlans, accept: { 'image/*': [] } });

  return (
    <AdminLayout>
      
      {/* HEADER ROW */}
      <div className="flex justify-between items-center text-left">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white leading-none mb-2">Projects CMS</h1>
          <p className="text-slate-400 text-xs">Configure ongoing/completed site metrics, slide milestone statuses, and upload plans.</p>
        </div>
        {!isFormOpen && (
          <button
            onClick={handleOpenCreateForm}
            className="bg-secondary hover:bg-secondary-light text-white font-bold text-xs px-5 py-3 rounded-xl shadow-md flex items-center gap-2"
          >
            <FaPlus /> Add New Project
          </button>
        )}
      </div>

      {loading && !isFormOpen ? (
        <div className="text-center py-20">
          <FaSpinner className="animate-spin text-secondary mx-auto" size={32} />
          <p className="text-xs text-slate-400 mt-3">Fetching project files...</p>
        </div>
      ) : isFormOpen ? (
        
        // PROJECT EDITOR FORM PANEL
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/35 p-8 rounded-3xl shadow-sm text-left flex flex-col gap-6">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-extrabold text-slate-800 dark:text-white">
              {editingProject ? `Edit Project: ${editingProject.name}` : 'New Construction Project'}
            </h2>
            <button 
              type="button" 
              onClick={() => setIsFormOpen(false)}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-400"
            >
              <FaTimes size={16} />
            </button>
          </div>

          {/* GRID: Core Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Project Name *</label>
              <input 
                type="text" 
                placeholder="SN Prestige Villa"
                className="p-3 bg-slate-50 dark:bg-slate-950 text-xs rounded-xl border border-transparent dark:border-slate-800 outline-none focus:ring-1 focus:ring-secondary"
                {...register('name', { required: true })}
              />
            </div>

            {/* Client Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Client Name</label>
              <input 
                type="text" 
                placeholder="Ramesh Kumar"
                className="p-3 bg-slate-50 dark:bg-slate-950 text-xs rounded-xl border border-transparent dark:border-slate-800 outline-none focus:ring-1 focus:ring-secondary"
                {...register('clientName')}
              />
            </div>

            {/* Category */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</label>
              <select
                className="p-3 bg-slate-50 dark:bg-slate-950 text-xs rounded-xl border border-transparent dark:border-slate-800 outline-none focus:ring-1 focus:ring-secondary"
                {...register('category')}
              >
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Interior">Interior</option>
                <option value="Renovation">Renovation</option>
              </select>
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Location */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Location *</label>
              <input 
                type="text" 
                placeholder="Mahalingapuram, Pollachi"
                className="p-3 bg-slate-50 dark:bg-slate-950 text-xs rounded-xl border border-transparent dark:border-slate-800 outline-none focus:ring-1 focus:ring-secondary"
                {...register('location', { required: true })}
              />
            </div>
            {/* Area */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Square Feet Area</label>
              <input 
                type="text" 
                placeholder="2400 sq.ft"
                className="p-3 bg-slate-50 dark:bg-slate-950 text-xs rounded-xl border border-transparent dark:border-slate-800 outline-none focus:ring-1 focus:ring-secondary"
                {...register('area')}
              />
            </div>
            {/* Budget */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Budget Estimate</label>
              <input 
                type="text" 
                placeholder="₹45 Lakhs"
                className="p-3 bg-slate-50 dark:bg-slate-950 text-xs rounded-xl border border-transparent dark:border-slate-800 outline-none focus:ring-1 focus:ring-secondary"
                {...register('budget')}
              />
            </div>
            {/* Floors */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Floors Structure</label>
              <input 
                type="text" 
                placeholder="G + 2 Floors"
                className="p-3 bg-slate-50 dark:bg-slate-950 text-xs rounded-xl border border-transparent dark:border-slate-800 outline-none focus:ring-1 focus:ring-secondary"
                {...register('floors')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Start date */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Start Date</label>
              <input 
                type="date"
                className="p-3 bg-slate-50 dark:bg-slate-950 text-xs rounded-xl border border-transparent dark:border-slate-800 outline-none focus:ring-1 focus:ring-secondary"
                {...register('startDate')}
              />
            </div>
            {/* End date */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">End Date</label>
              <input 
                type="date"
                className="p-3 bg-slate-50 dark:bg-slate-950 text-xs rounded-xl border border-transparent dark:border-slate-800 outline-none focus:ring-1 focus:ring-secondary"
                {...register('endDate')}
              />
            </div>
            {/* Status */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Publish Status</label>
              <select
                className="p-3 bg-slate-50 dark:bg-slate-950 text-xs rounded-xl border border-transparent dark:border-slate-800 outline-none focus:ring-1 focus:ring-secondary"
                {...register('status')}
              >
                <option value="Draft">Draft</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
                <option value="Archive">Archive</option>
              </select>
            </div>
            {/* Maps link */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Google Maps Embed Link</label>
              <input 
                type="text" 
                placeholder="https://google.com/maps/..."
                className="p-3 bg-slate-50 dark:bg-slate-950 text-xs rounded-xl border border-transparent dark:border-slate-800 outline-none focus:ring-1 focus:ring-secondary"
                {...register('mapLink')}
              />
            </div>
          </div>

          {/* Textarea Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Project Description *</label>
            <textarea 
              rows={4}
              placeholder="Provide a detailed roadmap, parameters details, concrete ratios..."
              className="p-3.5 bg-slate-50 dark:bg-slate-950 text-xs rounded-xl border border-transparent dark:border-slate-800 outline-none focus:ring-1 focus:ring-secondary resize-none"
              {...register('description', { required: true })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Features list */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Specifications List (Comma Separated)</label>
              <input 
                type="text"
                placeholder="M20 Concrete Grade, Fe550 Steel, Anchor Wires"
                className="p-3 bg-slate-50 dark:bg-slate-950 text-xs rounded-xl border border-transparent dark:border-slate-800 outline-none focus:ring-1 focus:ring-secondary"
                {...register('features')}
              />
            </div>
            {/* Videos */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Video Embed URLs (Comma Separated)</label>
              <input 
                type="text"
                placeholder="https://youtube.com/watch?v=..."
                className="p-3 bg-slate-50 dark:bg-slate-950 text-xs rounded-xl border border-transparent dark:border-slate-800 outline-none focus:ring-1 focus:ring-secondary"
                {...register('videos')}
              />
            </div>
          </div>

          {/* FILE UPLOAD GRID */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-6">Media Library Assets Upload</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Thumbnail (Single) */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Thumbnail (Cover Image)</span>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setThumbnailFile(e.target.files[0])}
                  className="text-xs" 
                />
                {editingProject?.thumbnail && (
                  <img src={editingProject.thumbnail} alt="Old thumbnail" className="w-20 h-16 object-cover rounded mt-2 border" />
                )}
              </div>

              {/* Brochure PDF (Single) */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Brochure PDF Layout</span>
                <input 
                  type="file" 
                  accept="application/pdf"
                  onChange={(e) => setBrochureFile(e.target.files[0])}
                  className="text-xs" 
                />
                {editingProject?.brochure && (
                  <span className="text-[10px] text-primary dark:text-secondary flex items-center gap-1 mt-2">
                    <FaFilePdf /> Brochure Uploaded
                  </span>
                )}
              </div>

            </div>

            {/* Drag & Drop Multi Uploads */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              
              {/* Site Photos */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gallery Site Images</span>
                <div {...getImagesProps()} className="border-2 border-dashed border-slate-200 dark:border-slate-800 p-6 rounded-2xl text-center text-xs text-slate-400 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-950">
                  <input {...getImagesInput()} />
                  <FaImage className="mx-auto text-slate-400 mb-2" size={16} />
                  <span>Drop Photos or click</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Pending files: {imagesFiles.length}</div>
                {/* Editing existing files list with remove capability */}
                {editingProject?.images && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {editingProject.images.map((url, i) => (
                      <div key={i} className="relative w-10 h-10 border rounded overflow-hidden">
                        <img src={url} alt="Site preview" className="w-full h-full object-cover" />
                        <button 
                          type="button" 
                          onClick={() => {
                            setRemovedImages(prev => [...prev, url]);
                          }}
                          className={`absolute inset-0 bg-red-600/70 text-white flex items-center justify-center ${removedImages.includes(url) ? 'opacity-100' : 'opacity-0 hover:opacity-100'} transition-opacity`}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Drone Shots */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Drone images</span>
                <div {...getDroneProps()} className="border-2 border-dashed border-slate-200 dark:border-slate-800 p-6 rounded-2xl text-center text-xs text-slate-400 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-950">
                  <input {...getDroneInput()} />
                  <FaImage className="mx-auto text-slate-400 mb-2" size={16} />
                  <span>Drop Drone shots</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Pending files: {droneFiles.length}</div>
                {editingProject?.droneImages && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {editingProject.droneImages.map((url, i) => (
                      <div key={i} className="relative w-10 h-10 border rounded overflow-hidden">
                        <img src={url} alt="Drone preview" className="w-full h-full object-cover" />
                        <button 
                          type="button" 
                          onClick={() => setRemovedDroneImages(prev => [...prev, url])}
                          className={`absolute inset-0 bg-red-600/70 text-white flex items-center justify-center ${removedDroneImages.includes(url) ? 'opacity-100' : 'opacity-0 hover:opacity-100'} transition-opacity`}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Floor Plans */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Floor Plan Diagrams</span>
                <div {...getPlansProps()} className="border-2 border-dashed border-slate-200 dark:border-slate-800 p-6 rounded-2xl text-center text-xs text-slate-400 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-950">
                  <input {...getPlansInput()} />
                  <FaImage className="mx-auto text-slate-400 mb-2" size={16} />
                  <span>Drop blueprints</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Pending files: {floorPlansFiles.length}</div>
                {editingProject?.floorPlans && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {editingProject.floorPlans.map((url, i) => (
                      <div key={i} className="relative w-10 h-10 border rounded overflow-hidden">
                        <img src={url} alt="Floorplan preview" className="w-full h-full object-cover" />
                        <button 
                          type="button" 
                          onClick={() => setRemovedFloorPlans(prev => [...prev, url])}
                          className={`absolute inset-0 bg-red-600/70 text-white flex items-center justify-center ${removedFloorPlans.includes(url) ? 'opacity-100' : 'opacity-0 hover:opacity-100'} transition-opacity`}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* INTERACTIVE MILESTONES SLIDERS */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-6">Milestone Progress Sliders</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(milestones).map(([milestone, progress]) => (
                <div key={milestone} className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-850 flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-200">
                    <span>{milestone}</span>
                    <span className="text-secondary">{progress}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={(e) => handleMilestoneSliderChange(milestone, e.target.value)}
                    className="w-full accent-secondary cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
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
              <FaSave /> Save Project
            </button>
          </div>

        </form>

      ) : (

        // PROJECT DATABASE LISTING TABLE
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/35 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 text-slate-400 text-[10px] uppercase font-bold tracking-widest border-b border-slate-150/40 dark:border-slate-800/40">
                  <th className="p-5">Cover</th>
                  <th className="p-5">Project Details</th>
                  <th className="p-5">Location / Scope</th>
                  <th className="p-5">Progress</th>
                  <th className="p-5">Status</th>
                  <th className="p-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {projects.map((proj) => (
                  <tr key={proj._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                    <td className="p-5">
                      <img 
                        src={proj.thumbnail || 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=150'} 
                        alt={proj.name}
                        className="w-12 h-10 object-cover rounded-lg border border-slate-200" 
                      />
                    </td>
                    <td className="p-5">
                      <h4 className="font-bold text-slate-800 dark:text-white mb-1 leading-none">{proj.name}</h4>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">{proj.category}</span>
                    </td>
                    <td className="p-5">
                      <p className="font-semibold text-slate-700 dark:text-slate-300">{proj.location}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{proj.budget || 'No Budget estimate'}</p>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shrink-0">
                          <div className="h-full bg-secondary" style={{ width: `${proj.completionPercent}%` }} />
                        </div>
                        <span className="font-bold text-slate-600 dark:text-slate-300">{proj.completionPercent}%</span>
                      </div>
                    </td>
                    <td className="p-5">
                      <span className={`px-2.5 py-1 rounded-md text-[9px] uppercase tracking-widest font-extrabold ${
                        proj.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500' :
                        proj.status === 'Ongoing' ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-500/10 text-slate-400'
                      }`}>
                        {proj.status}
                      </span>
                    </td>
                    <td className="p-5 text-right flex justify-end gap-2 mt-1">
                      <button
                        onClick={() => handleOpenEditForm(proj)}
                        className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                        title="Edit Project"
                      >
                        <FaEdit size={12} />
                      </button>
                      <button
                        onClick={() => handleDuplicateProject(proj._id)}
                        className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                        title="Duplicate (Copy)"
                      >
                        <FaCopy size={12} />
                      </button>
                      <button
                        onClick={() => handleDeleteProject(proj._id)}
                        className="p-2.5 rounded-lg bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500"
                        title="Delete Project"
                      >
                        <FaTrash size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
                {projects.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center p-10 text-slate-400 font-semibold">
                      No projects currently registered. Create one to begin.
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

export default ProjectManager;
