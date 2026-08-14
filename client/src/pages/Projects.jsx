import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaSearch, FaMapMarkerAlt, FaRulerCombined, FaCoins, FaTasks } from 'react-icons/fa';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  const fetchProjects = async () => {
    try {
      const res = await axios.get('/api/projects');
      setProjects(res.data);
    } catch (err) {
      console.error('Failed to retrieve projects list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Filter and search logic
  const filteredProjects = projects.filter(p => {
    // Text search query matching name or location
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Tab filters
    let matchesTab = true;
    if (activeTab === 'Ongoing') {
      matchesTab = p.status === 'Ongoing';
    } else if (activeTab === 'Completed') {
      matchesTab = p.status === 'Completed';
    } else if (activeTab !== 'All') {
      matchesTab = p.category === activeTab;
    }

    return matchesSearch && matchesTab;
  });

  const categories = ['All', 'Residential', 'Commercial', 'Interior', 'Renovation', 'Ongoing', 'Completed'];

  return (
    <div className="w-full bg-[#F8FAFC] dark:bg-[#0F172A] min-h-screen pb-20 pt-8">
      
      {/* HEADER SECTION */}
      <section className="bg-[#1C68F5] text-white py-20 px-6 text-center relative border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,193,0,0.1),transparent)] pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="w-12 h-1 bg-[#FFC100] mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-4">Our Construction Portfolio</h1>
          <p className="text-blue-100 text-xs md:text-sm max-w-xl mx-auto leading-relaxed">
            Browse through our residential villas, commercial structures, false ceiling designs, and before-after renovations.
          </p>
        </div>
      </section>

      {/* FILTER & SEARCH PANEL */}
      <section className="max-w-7xl mx-auto px-6 pt-12 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Search bar */}
        <div className="w-full md:max-w-md relative">
          <input
            type="text"
            placeholder="Search by project name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-4 pl-12 bg-white dark:bg-slate-800 text-xs rounded-2xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-1 focus:ring-secondary focus:border-secondary shadow-sm"
          />
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
        </div>

        {/* Categories list */}
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === cat
                  ? 'bg-[#FFC100] text-[#1C68F5] shadow-md shadow-[#FFC100]/20'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 border border-slate-200/40 dark:border-slate-800/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </section>

      {/* PROJECTS GRID */}
      <section className="max-w-7xl mx-auto px-6 pt-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-800 rounded-3xl h-96 animate-pulse border border-slate-200 dark:border-slate-800" />
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-800/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <p className="text-sm font-semibold text-slate-400">No projects found matching the criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((proj) => (
              <div 
                key={proj._id}
                className="bg-white dark:bg-slate-800/80 rounded-3xl overflow-hidden shadow-md border border-slate-200/50 dark:border-slate-800/35 flex flex-col hover:shadow-xl transition-all group relative"
              >
                {/* Image block */}
                <div className="relative overflow-hidden h-56">
                  <img
                    src={proj.thumbnail || 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=800'}
                    alt={proj.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-sm text-white text-[9px] uppercase tracking-widest font-extrabold px-3 py-1.5 rounded-lg border border-white/10">
                    {proj.status}
                  </div>
                  {proj.category && (
                    <div className="absolute top-4 right-4 bg-primary text-white text-[9px] uppercase tracking-widest font-extrabold px-3 py-1.5 rounded-lg">
                      {proj.category}
                    </div>
                  )}
                </div>

                {/* Specs Box */}
                <div className="p-6 flex flex-col flex-grow text-left">
                  <h3 className="text-base font-extrabold text-slate-800 dark:text-white mb-2 line-clamp-1">
                    {proj.name}
                  </h3>
                  
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-4 font-medium">
                    <FaMapMarkerAlt size={10} className="text-slate-400 shrink-0" />
                    <span className="line-clamp-1">{proj.location}</span>
                  </div>

                  {/* Specs Quick Metrics row */}
                  <div className="grid grid-cols-3 gap-2 border-y border-slate-100 dark:border-slate-800/60 py-3 mb-4 text-[10px] text-slate-500 dark:text-slate-400">
                    <div className="flex flex-col gap-1 items-center justify-center">
                      <FaRulerCombined size={11} className="text-slate-400" />
                      <span>{proj.area || 'N/A'}</span>
                    </div>
                    <div className="flex flex-col gap-1 items-center justify-center border-x border-slate-100 dark:border-slate-800/60">
                      <FaCoins size={11} className="text-slate-400" />
                      <span>{proj.budget || 'N/A'}</span>
                    </div>
                    <div className="flex flex-col gap-1 items-center justify-center">
                      <FaTasks size={11} className="text-slate-400" />
                      <span>{proj.floors || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Completion bar */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                      <span>Milestone Progress</span>
                      <span className="text-secondary">{proj.completionPercent}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-secondary"
                        style={{ width: `${proj.completionPercent}%` }}
                      />
                    </div>
                  </div>

                  <Link
                    to={`/projects/${proj._id}`}
                    className="w-full text-center bg-slate-50 hover:bg-primary hover:text-white dark:bg-slate-900 dark:hover:bg-primary text-slate-800 dark:text-white text-xs font-bold py-3.5 rounded-xl transition-all border border-slate-150 dark:border-slate-800 block mt-auto"
                  >
                    View Project Layout & Specs
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
};

export default Projects;
