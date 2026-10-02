import React, { useState } from 'react';
import { FaCheckCircle, FaUserCheck, FaBullseye, FaBinoculars, FaHandsHelping } from 'react-icons/fa';
import { useSettings } from '../context/SettingsContext';
import SEO from '../components/SEO';


const About = () => {
  const { settings } = useSettings();
  const [activeTab, setActiveTab] = useState('mission');

  const companyName = settings?.companyName || 'SN Infra';
  const tagline = settings?.tagline || 'Planning • Approval • Vastu • Construction • Interior & Exterior • Renovation • Surveying • Labour Contract • Structural Design';

  const tabContents = {
    mission: {
      icon: <FaBullseye size={24} className="text-secondary" />,
      title: 'Our Dedicated Mission',
      desc: 'To deliver safe, reliable, and premium construction results that comply with local approval regulations, safety computations, and Vastu configurations. We prioritize transparent pricing metrics and high-grade aggregates to build properties that endure for generations.',
      bullets: [
        'Enforce strict code regulations for safety checks',
        'Procure certified steel and structural aggregates',
        'Transparent bill statements with zero hidden expenses',
        'Consistent client updates on project trackers'
      ]
    },
    vision: {
      icon: <FaBinoculars size={24} className="text-secondary" />,
      title: 'Our Structural Vision',
      desc: 'To establish SN Infra as the most trustworthy, tech-integrated construction partner in Tamil Nadu. We strive to pioneer automated project monitoring, allowing homeowners and engineers to review architectural milestones live from any location.',
      bullets: [
        'Pioneer digital progress updates in regional construction',
        'Develop carbon-neutral luxury duplex builds',
        'Standardize 3D photorealistic architectural pre-visualizations',
        'Form sustainable partnerships with premium material brands'
      ]
    },
    values: {
      icon: <FaHandsHelping size={24} className="text-secondary" />,
      title: 'Core Architectural Values',
      desc: 'Our workflow stands on integrity, certified workmanship, and traditional alignments. We respect standard engineering benchmarks while adapting spatial structures to client preferences.',
      bullets: [
        'Unmatched integrity: Honesty in quotes and materials',
        'Expert engineers: Certified qualifications for structural work',
        'Safety compliance: Complete seismic load balancing',
        'Vastu perfection: Harmonizing elements to ensure prosperity'
      ]
    }
  };

  return (
    <div className="w-full bg-white dark:bg-[#0F172A] min-h-screen pb-20 pt-0">
      <SEO 
        title="About Us | Coimbatore & Pollachi Construction Specialists" 
        description="Learn about SN Infra, our dedicated mission, structural vision, and core values. We are leading builders in Coimbatore and Pollachi specializing in safety and Vastu compliance."
        keywords="SN Infra, about SN Infra, construction Coimbatore, builders Pollachi, planning, engineering construction"
        path="/about"
      />
      
      {/* HEADER SECTION */}
      <section className="bg-[#1C68F5] text-white py-20 px-6 text-center relative border-b border-white/10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,193,0,0.1),transparent)] pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10" data-aos="fade-down">
          <div className="w-12 h-1 bg-[#FFC100] mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-4">About SN Infra</h1>
          <p className="text-blue-100 text-xs md:text-sm max-w-xl mx-auto leading-relaxed">
            Coimbatore and Pollachi's premier construction partner. We bridge traditional architectural structures with modern styling safety computations.
          </p>
        </div>
      </section>

      {/* CORE DETAILS */}
      <section className="max-w-7xl mx-auto px-6 pt-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center overflow-hidden">
        <div className="relative group" data-aos="fade-right">
          <div className="absolute inset-0 bg-primary/10 rounded-3xl blur-2xl group-hover:scale-105 transition-transform" />
          <img 
            src="/photos/masonry-work.png" 
            onError={(e) => { e.currentTarget.src = '/photos/villa-elevation.png'; }}
            alt="SN Infra Team" 
            className="rounded-3xl shadow-xl w-full h-[400px] object-cover relative z-10 border border-slate-200 dark:border-slate-800"
          />
        </div>
        <div className="text-left" data-aos="fade-left">
          <span className="text-xs uppercase tracking-widest text-secondary font-bold mb-3 block">Est. Over 15 Years Ago</span>
          <h2 className="text-3xl font-extrabold text-primary dark:text-white mb-6 leading-tight">
            Engineering Safe, Luxurious & Vastu-Compliant Landmarks
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">
            SN Infra has established a solid track record of completing residential, duplex, commercial, and interior renovation tasks across Tamil Nadu. We believe that a construction project is a lifelong investment for our clients. Consequently, we never compromise on structural metrics, steel gauges, or concrete mix grades.
          </p>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">
            Under the supervision of our experienced structural architects and field engineering staff, we coordinate planning drawing sketches, corporation approvals, and structural validation layout maps.
          </p>

          <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <FaUserCheck className="text-accent" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Certified Site Engineers</span>
            </div>
            <div className="flex items-center gap-2">
              <FaCheckCircle className="text-accent" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">ISO Materials Guidelines</span>
            </div>
          </div>
        </div>
      </section>

      {/* DYNAMIC TABS FOR MISSION / VISION / VALUES */}
      <section className="max-w-7xl mx-auto px-6 pt-20" data-aos="fade-up">
        <div className="bg-white dark:bg-slate-800/80 rounded-3xl p-8 sm:p-12 border border-slate-200/50 dark:border-slate-800/35 glass shadow-sm text-left">
          
          {/* TAB BUTTONS */}
          <div className="flex flex-wrap gap-3 mb-10 border-b border-slate-100 dark:border-slate-800/50 pb-6">
            {Object.keys(tabContents).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab
                    ? 'bg-[#FFC100] text-[#1C68F5] shadow-md shadow-[#FFC100]/20'
                    : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* TAB BODY */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8">
              <div className="flex items-center gap-4 mb-4">
                {tabContents[activeTab].icon}
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                  {tabContents[activeTab].title}
                </h3>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">
                {tabContents[activeTab].desc}
              </p>
            </div>

            <div className="lg:col-span-4 bg-slate-50 dark:bg-slate-900/60 p-6 rounded-2xl border border-slate-200/40 dark:border-slate-800/40">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-4">
                Core Focus Points
              </h4>
              <ul className="flex flex-col gap-3">
                {tabContents[activeTab].bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-slate-500 dark:text-slate-400">
                    <FaCheckCircle className="text-accent shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </section>

      {/* METRIC BADGES CARD */}
      <section className="max-w-7xl mx-auto px-6 pt-20 grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div className="glass p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800/35 text-center shadow-sm" data-aos="zoom-in" data-aos-delay="0">
          <h3 className="text-4xl font-extrabold text-secondary mb-2">15+</h3>
          <h4 className="text-xs uppercase tracking-widest font-bold text-slate-700 dark:text-slate-200 mb-2">Years on Field</h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">Providing blueprints and construction services across Coimbatore, Pollachi, and beyond.</p>
        </div>
        <div className="glass p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800/35 text-center shadow-sm" data-aos="zoom-in" data-aos-delay="100">
          <h3 className="text-4xl font-extrabold text-secondary mb-2">100%</h3>
          <h4 className="text-xs uppercase tracking-widest font-bold text-slate-700 dark:text-slate-200 mb-2">Structural Safety</h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">Safety metrics evaluated against local regulations and load bearing standards.</p>
        </div>
        <div className="glass p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800/35 text-center shadow-sm" data-aos="zoom-in" data-aos-delay="200">
          <h3 className="text-4xl font-extrabold text-secondary mb-2">13</h3>
          <h4 className="text-xs uppercase tracking-widest font-bold text-slate-700 dark:text-slate-200 mb-2">Expert Services</h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">Complete integration of design drafts, permits, mason contract staffing, and walkthroughs.</p>
        </div>
      </section>

    </div>
  );
};

export default About;
