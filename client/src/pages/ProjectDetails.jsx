import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  FaMapMarkerAlt, FaRulerCombined, FaCoins, FaTasks, 
  FaCalendarAlt, FaDownload, FaShareAlt, FaCheckCircle, 
  FaChevronLeft, FaTimes, FaGlobe, FaChevronRight 
} from 'react-icons/fa';

const ProjectDetails = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Lightbox and tabs
  const [activeMediaTab, setActiveMediaTab] = useState('images'); // 'images', 'drone', 'floorplans', 'videos'
  const [lightboxImage, setLightboxImage] = useState(null);
  const [shareStatus, setShareStatus] = useState(false);

  const fetchProjectDetails = async () => {
    try {
      const res = await axios.get(`/api/projects/${id}`);
      setProject(res.data);
    } catch (err) {
      console.error('Failed to load project details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const handleShareClick = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareStatus(true);
    setTimeout(() => setShareStatus(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center flex-col gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-secondary rounded-full animate-spin" />
        <p className="text-sm text-slate-500">Loading project layout specifications...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center gap-6 text-center">
        <h2 className="text-xl font-bold text-slate-700 dark:text-white">Project not found</h2>
        <Link to="/projects" className="bg-primary text-white px-6 py-3 rounded-xl text-xs font-bold">
          Back to Projects List
        </Link>
      </div>
    );
  }

  const milestonesList = project.progressDetails 
    ? Object.entries(project.progressDetails) 
    : [];

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-900 min-h-screen pb-20">
      
      {/* HEADER SECTION */}
      <section className="bg-gradient-to-br from-primary to-slate-950 text-white py-16 px-6 relative border-b border-primary-dark">
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-start text-left">
          <Link to="/projects" className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 mb-6">
            <FaChevronLeft size={10} /> Back to Projects Index
          </Link>
          <span className="bg-secondary text-white text-[9px] uppercase tracking-widest font-extrabold px-3 py-1 rounded-md mb-4 shadow">
            {project.category}
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3">
            {project.name}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm flex items-center gap-1.5">
            <FaMapMarkerAlt size={12} className="text-secondary shrink-0" />
            {project.location}
          </p>
        </div>
      </section>

      {/* CORE SPECIFICATIONS GRID */}
      <section className="max-w-7xl mx-auto px-6 pt-12 grid grid-cols-1 lg:grid-cols-12 gap-12 text-left">
        
        {/* Main Content (Specs, Description, Milestones) */}
        <div className="lg:col-span-8 flex flex-col gap-10">
          
          {/* Main Hero Slider */}
          <div className="w-full h-80 sm:h-[450px] rounded-3xl overflow-hidden shadow-md relative border border-slate-200/50 dark:border-slate-800/30">
            <img 
              src={project.thumbnail || 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=800'} 
              alt={project.name}
              className="w-full h-full object-cover" 
            />
            <div className="absolute bottom-6 left-6 bg-slate-950/80 backdrop-blur-md text-white text-xs px-4 py-2 rounded-xl font-bold border border-white/10">
              Status: {project.status} ({project.completionPercent}% Milestone Complete)
            </div>
          </div>

          {/* Project Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 shadow-sm flex flex-col gap-1">
              <FaRulerCombined className="text-secondary mb-2" size={16} />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Area</span>
              <span className="text-sm font-bold text-slate-800 dark:text-white">{project.area || 'N/A'}</span>
            </div>
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 shadow-sm flex flex-col gap-1">
              <FaCoins className="text-secondary mb-2" size={16} />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Budget</span>
              <span className="text-sm font-bold text-slate-800 dark:text-white">{project.budget || 'N/A'}</span>
            </div>
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 shadow-sm flex flex-col gap-1">
              <FaTasks className="text-secondary mb-2" size={16} />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Floors</span>
              <span className="text-sm font-bold text-slate-800 dark:text-white">{project.floors || 'N/A'}</span>
            </div>
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 shadow-sm flex flex-col gap-1">
              <FaCalendarAlt className="text-secondary mb-2" size={16} />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Start Date</span>
              <span className="text-sm font-bold text-slate-800 dark:text-white">
                {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Project Overview</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {project.description}
            </p>
          </div>

          {/* Features */}
          {project.features && project.features.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Key Specifications & Features</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {project.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-3 bg-white dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/20 dark:border-slate-800/30">
                    <FaCheckCircle className="text-accent shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Milestone sliders */}
          {milestonesList.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Construction Progress Milestones</h3>
              <div className="flex flex-col gap-5">
                {milestonesList.map(([milestone, progress]) => (
                  <div key={milestone} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 shadow-sm">
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      <span>{milestone}</span>
                      <span className="text-secondary">{progress}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Sidebar panels (Media library, downloads, sharing, map) */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          
          {/* Action widgets */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/35 shadow-sm flex flex-col gap-4">
            
            {project.brochure && (
              <a 
                href={project.brochure}
                download
                target="_blank"
                rel="noreferrer"
                className="w-full bg-secondary hover:bg-secondary-light text-white font-bold text-xs py-3.5 rounded-xl transition-all shadow flex items-center justify-center gap-2"
              >
                <FaDownload size={12} />
                Download Brochure PDF
              </a>
            )}

            <button 
              onClick={handleShareClick}
              className="w-full bg-slate-100 hover:bg-slate-250 dark:bg-slate-900 text-slate-800 dark:text-white font-bold text-xs py-3.5 rounded-xl transition-all border border-slate-200/50 dark:border-slate-800 flex items-center justify-center gap-2"
            >
              <FaShareAlt size={12} />
              {shareStatus ? 'Link Copied!' : 'Share Project'}
            </button>

          </div>

          {/* Media tab lists */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/35 shadow-sm">
            <h4 className="text-xs uppercase font-bold tracking-widest text-slate-400 mb-4">Project Gallery Media</h4>
            
            {/* Tab navigation */}
            <div className="flex gap-2 mb-6 border-b border-slate-100 dark:border-slate-950 pb-4">
              <button 
                onClick={() => setActiveMediaTab('images')}
                className={`pb-1 text-xs font-bold ${activeMediaTab === 'images' ? 'text-secondary border-b-2 border-secondary' : 'text-slate-400'}`}
              >
                Images ({project.images?.length || 0})
              </button>
              <button 
                onClick={() => setActiveMediaTab('drone')}
                className={`pb-1 text-xs font-bold ${activeMediaTab === 'drone' ? 'text-secondary border-b-2 border-secondary' : 'text-slate-400'}`}
              >
                Drone ({project.droneImages?.length || 0})
              </button>
              <button 
                onClick={() => setActiveMediaTab('floorplans')}
                className={`pb-1 text-xs font-bold ${activeMediaTab === 'floorplans' ? 'text-secondary border-b-2 border-secondary' : 'text-slate-400'}`}
              >
                Plans ({project.floorPlans?.length || 0})
              </button>
            </div>

            {/* Tab contents */}
            <div>
              {activeMediaTab === 'images' && (
                <div className="grid grid-cols-2 gap-3">
                  {project.images?.map((url, i) => (
                    <img 
                      key={i} 
                      src={url} 
                      onClick={() => setLightboxImage(url)}
                      alt="Project site details" 
                      className="w-full h-24 object-cover rounded-xl cursor-pointer hover:opacity-85 transition-opacity" 
                    />
                  ))}
                  {(!project.images || project.images.length === 0) && (
                    <p className="col-span-2 text-[10px] text-slate-400 text-center py-6">No standard site images uploaded.</p>
                  )}
                </div>
              )}

              {activeMediaTab === 'drone' && (
                <div className="grid grid-cols-2 gap-3">
                  {project.droneImages?.map((url, i) => (
                    <img 
                      key={i} 
                      src={url} 
                      onClick={() => setLightboxImage(url)}
                      alt="Drone site survey" 
                      className="w-full h-24 object-cover rounded-xl cursor-pointer hover:opacity-85 transition-opacity" 
                    />
                  ))}
                  {(!project.droneImages || project.droneImages.length === 0) && (
                    <p className="col-span-2 text-[10px] text-slate-400 text-center py-6">No drone shots uploaded.</p>
                  )}
                </div>
              )}

              {activeMediaTab === 'floorplans' && (
                <div className="grid grid-cols-2 gap-3">
                  {project.floorPlans?.map((url, i) => (
                    <img 
                      key={i} 
                      src={url} 
                      onClick={() => setLightboxImage(url)}
                      alt="Floor plan sketch layout" 
                      className="w-full h-24 object-cover rounded-xl cursor-pointer hover:opacity-85 transition-opacity" 
                    />
                  ))}
                  {(!project.floorPlans || project.floorPlans.length === 0) && (
                    <p className="col-span-2 text-[10px] text-slate-400 text-center py-6">No floor plans uploaded.</p>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* Google Maps link frame */}
          {project.mapLink && (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/35 shadow-sm text-left">
              <h4 className="text-xs uppercase font-bold tracking-widest text-slate-400 mb-4 flex items-center gap-1.5">
                <FaGlobe /> Site Coordinates Location
              </h4>
              
              <div className="w-full h-48 rounded-xl overflow-hidden shadow-inner border border-slate-200 dark:border-slate-900 mb-4">
                {project.mapLink.includes('<iframe') ? (
                  <div dangerouslySetInnerHTML={{ __html: project.mapLink }} className="w-full h-full border-none [&_iframe]:w-full [&_iframe]:h-full" />
                ) : (
                  <iframe 
                    src={project.mapLink}
                    className="w-full h-full border-none"
                    allowFullScreen="" 
                    loading="lazy" 
                  />
                )}
              </div>
              <a 
                href={project.mapLink.includes('src="') ? project.mapLink.match(/src="([^"]+)"/)?.[1] || '#' : project.mapLink}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] font-bold text-secondary hover:underline inline-block"
              >
                Open directly in Google Maps &rarr;
              </a>
            </div>
          )}

        </div>

      </section>

      {/* LIGHTBOX MODAL */}
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
            alt="Preview expanded lightbox" 
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" 
          />
        </div>
      )}

    </div>
  );
};

export default ProjectDetails;
