import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaArrowRight, FaClock, FaCheckCircle, FaAward, 
  FaPhoneAlt, FaEnvelope, FaChevronRight, FaChevronDown,
  FaShieldAlt, FaHandshake, FaToolbox, FaThumbsUp
} from 'react-icons/fa';
import * as Icons from 'react-icons/fa';
import axios from 'axios';
import { useSettings } from '../context/SettingsContext';

// --- ANIMATED COUNTER COMPONENT ---
const AnimatedCounter = ({ value, suffix = '', duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const elementRef = useRef(null);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) observer.observe(elementRef.current);
    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;
    
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * value));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [hasStarted, value, duration]);

  return (
    <span ref={elementRef} className="counter-text text-3xl md:text-5xl font-extrabold text-secondary">
      {count}{suffix}
    </span>
  );
};

// --- HOME PAGE COMPONENT ---
const Home = () => {
  const { settings } = useSettings();
  const [services, setServices] = useState([]);
  const [projects, setProjects] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [faqOpen, setFaqOpen] = useState({});

  const [activeFilter, setActiveFilter] = useState('All');
  const [activeProcessStep, setActiveProcessStep] = useState(0);

  // Write Review Modal states
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewRole, setReviewRole] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewImage, setReviewImage] = useState(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSubmitStatus, setReviewSubmitStatus] = useState(null);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewName || !reviewText) {
      setReviewSubmitStatus({ error: 'Name and review text are required.' });
      return;
    }
    setIsSubmittingReview(true);
    setReviewSubmitStatus(null);
    try {
      const formData = new FormData();
      formData.append('clientName', reviewName);
      formData.append('role', reviewRole || 'Home Owner');
      formData.append('rating', reviewRating);
      formData.append('reviewText', reviewText);
      if (reviewImage) {
        formData.append('clientImage', reviewImage);
      }

      await axios.post('/api/testimonials', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setReviewSubmitStatus({ success: 'Thank you! Your review has been submitted for moderation and will appear on the homepage once approved.' });
      setReviewName('');
      setReviewRole('');
      setReviewRating(5);
      setReviewText('');
      setReviewImage(null);
      setTimeout(() => {
        setIsReviewModalOpen(false);
        setReviewSubmitStatus(null);
      }, 3000);
    } catch (err) {
      setReviewSubmitStatus({ error: 'Failed to submit review. Please try again.' });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Fetch collections
  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [servicesRes, projectsRes, testimonialsRes] = await Promise.all([
          axios.get('/api/services'),
          axios.get('/api/projects'),
          axios.get('/api/testimonials')
        ]);
        setServices(servicesRes.data.slice(0, 6)); // Display first 6 services on home
        setProjects(projectsRes.data.slice(0, 4)); // Display recent 4 projects
        setTestimonials(testimonialsRes.data);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      }
    };
    loadHomeData();
  }, []);

  const toggleFaq = (idx) => {
    setFaqOpen(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const processSteps = [
    { title: '1. Consultation', desc: 'Detailed site inspection and requirements gathering for planning layouts.' },
    { title: '2. Planning & Vastu', desc: 'Custom architectural sketches matching structural calculations and Vastu settings.' },
    { title: '3. Approval', desc: 'Filing blueprints to local DTCP or corporation boards for official sanctions.' },
    { title: '4. Construction', desc: 'Actual construction on-site using premium aggregates under engineer review.' },
    { title: '5. Interior Fitout', desc: 'Custom electrical mappings, modular cabinetry installation, flooring, and paint jobs.' },
    { title: '6. Quality Check & Handover', desc: 'Detailed utility checks and final inspection preceding official property handover.' }
  ];

  const whyChooseUs = [
    { icon: <FaShieldAlt size={22} />, title: 'Quality Materials', desc: 'Procuring certified structural cement, premium steel alloys, and grade aggregates.' },
    { icon: <FaHandshake size={22} />, title: 'Transparent Pricing', desc: 'Itemized material estimates. No hidden charges or unexpected budgetary additions.' },
    { icon: <FaClock size={22} />, title: 'Timely Delivery', desc: 'Committed schedule tracking through milestones to prevent delayed handovers.' },
    { icon: <FaThumbsUp size={22} />, title: 'Vastu & Safety Compliance', desc: 'Integrating traditional guidelines with engineered structural strength calculations.' }
  ];

  const faqs = [
    { q: 'Do you help in getting DTCP/Corporation Building Approvals?', a: 'Yes, we take care of the entire blueprint approval process. From local site measurements to submitting blueprints to the corporation/panchayat board, our team coordinates the approvals directly.' },
    { q: 'Can I customize the architectural plan based on Vastu Shastra?', a: 'Absolutely. All our architectural layouts are tailormade to fit the customer\'s functional desires while maintaining complete alignment with traditional Vastu Shastra principles.' },
    { q: 'How do you monitor construction progress?', a: 'We compile detailed milestone lists for every project. Through our online dashboard, we update stages like columns, plastering, and flooring, which you can preview live.' },
    { q: 'What is the billing timeline for labor contracts?', a: 'We bill according to progressive milestones (e.g., initial advance, foundation completion, column setup, roof casting, finishing). This ensures transparency at every step.' }
  ];

  return (
    <div className="w-full">

      {/* --- HERO SECTION --- */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden blueprint-grid blueprint-grid-fine px-6 py-20 bg-slate-50 dark:bg-slate-900 border-b border-slate-200/50 dark:border-slate-800/40">
        
        {/* Animated Background Shapes */}
        <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-primary/10 dark:bg-primary/5 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-secondary/10 dark:bg-secondary/5 rounded-full blur-3xl animate-pulse-slow pointer-events-none" style={{ animationDelay: '1.5s' }} />

        {/* Blueprint Crane SVG Animation */}
        <div className="absolute right-0 bottom-0 top-0 w-full lg:w-1/2 pointer-events-none z-0">
          <svg className="w-full h-full text-primary dark:text-secondary opacity-35 dark:opacity-80" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Ground Line */}
            <line x1="100" y1="550" x2="700" y2="550" stroke="currentColor" strokeWidth="2" strokeDasharray="5 5" />
            {/* Crane Base Tower */}
            <path d="M 450 550 L 480 200 L 500 200 L 530 550 Z" stroke="currentColor" strokeWidth="2" />
            <line x1="450" y1="550" x2="530" y2="550" stroke="currentColor" strokeWidth="3" />
            <line x1="480" y1="200" x2="500" y2="200" stroke="currentColor" strokeWidth="3" />
            {/* Inner Truss X Patterns */}
            <line x1="465" y1="375" x2="515" y2="375" stroke="currentColor" strokeWidth="1" />
            <line x1="472" y1="280" x2="508" y2="280" stroke="currentColor" strokeWidth="1" />
            <line x1="458" y1="460" x2="522" y2="460" stroke="currentColor" strokeWidth="1" />
            
            <line x1="450" y1="550" x2="490" y2="460" stroke="currentColor" strokeWidth="1" />
            <line x1="530" y1="550" x2="490" y2="460" stroke="currentColor" strokeWidth="1" />
            <line x1="458" y1="460" x2="490" y2="375" stroke="currentColor" strokeWidth="1" />
            <line x1="522" y1="460" x2="490" y2="375" stroke="currentColor" strokeWidth="1" />
            <line x1="465" y1="375" x2="490" y2="280" stroke="currentColor" strokeWidth="1" />
            <line x1="515" y1="375" x2="490" y2="280" stroke="currentColor" strokeWidth="1" />
            <line x1="472" y1="280" x2="490" y2="200" stroke="currentColor" strokeWidth="1" />
            <line x1="508" y1="280" x2="490" y2="200" stroke="currentColor" strokeWidth="1" />

            {/* Crane Rotating Cab & Counter Weight */}
            <g transform="rotate(-5 490 200)">
              <rect x="475" y="170" width="30" height="30" stroke="currentColor" strokeWidth="2" fill="none" />
              <line x1="490" y1="200" x2="150" y2="200" stroke="currentColor" strokeWidth="3" /> {/* Jib (Arm) */}
              <line x1="490" y1="200" x2="600" y2="200" stroke="currentColor" strokeWidth="3" /> {/* Counter Jib */}
              
              {/* Jib Support cables */}
              <line x1="490" y1="130" x2="150" y2="200" stroke="currentColor" strokeWidth="1" />
              <line x1="490" y1="130" x2="600" y2="200" stroke="currentColor" strokeWidth="1" />
              <line x1="490" y1="130" x2="490" y2="170" stroke="currentColor" strokeWidth="2" /> {/* Apex */}
              
              {/* Counter Weight block */}
              <rect x="560" y="200" width="30" height="20" stroke="currentColor" strokeWidth="2" fill="none" />
              
              {/* Trolley & Hook */}
              <rect x="250" y="200" width="12" height="6" stroke="currentColor" strokeWidth="2" />
              <line x1="256" y1="206" x2="256" y2="350" stroke="currentColor" strokeWidth="1" />
              <path d="M 251 350 Q 256 355 261 350" stroke="currentColor" strokeWidth="2" fill="none" />
            </g>
          </svg>
        </div>

        {/* HERO CONTENT */}
        <div className="max-w-7xl mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border-slate-300/40 dark:border-slate-800/40 mb-6"
            >
              <span className="w-2.5 h-2.5 bg-secondary rounded-full animate-ping" />
              <span className="text-[10px] uppercase tracking-widest font-bold text-slate-600 dark:text-slate-200">
                Premium Construction & Design
              </span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-primary dark:text-white mb-6 leading-[1.1]"
            >
              Build Your Dream <br className="hidden sm:inline" />
              With <span className="text-secondary">SN Infra</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl mb-8"
            >
              Planning, Approval, Vastu, Construction, Interior, Renovation & Structural Excellence. Transforming custom concepts into modern, certified architectural landmarks.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 45 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.45 }}
              className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
            >
              <Link 
                to="/contact" 
                className="w-full sm:w-auto text-center bg-secondary hover:bg-secondary-light text-white font-semibold text-sm px-8 py-4 rounded-2xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/35 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group"
              >
                Free Consultation
                <FaArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/projects" 
                className="w-full sm:w-auto text-center glass hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-white font-semibold text-sm px-8 py-4 rounded-2xl transition-all"
              >
                View Projects
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- STATS COUNTERS --- */}
      <section className="py-12 bg-primary text-white border-y border-primary-dark">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="flex flex-col items-center">
            <AnimatedCounter value={100} suffix="+" />
            <span className="text-xs uppercase tracking-widest font-medium text-slate-300 mt-2">Projects Completed</span>
          </div>
          <div className="flex flex-col items-center">
            <AnimatedCounter value={50} suffix="+" />
            <span className="text-xs uppercase tracking-widest font-medium text-slate-300 mt-2">Happy Clients</span>
          </div>
          <div className="flex flex-col items-center">
            <AnimatedCounter value={15} suffix="+" />
            <span className="text-xs uppercase tracking-widest font-medium text-slate-300 mt-2">Years Experience</span>
          </div>
          <div className="flex flex-col items-center">
            <AnimatedCounter value={100} suffix="%" />
            <span className="text-xs uppercase tracking-widest font-medium text-slate-300 mt-2">Client Satisfaction</span>
          </div>
        </div>
      </section>

      {/* --- ABOUT STORY SHORTCUT --- */}
      <section className="py-20 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="relative group">
          <div className="absolute inset-0 bg-secondary/10 rounded-3xl blur-2xl group-hover:scale-105 transition-transform duration-500" />
          <img 
            src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=800&auto=format&fit=crop" 
            alt="Construction Engineering" 
            className="rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 object-cover w-full h-[350px] sm:h-[450px] relative z-10 transition-transform duration-500 hover:scale-[1.01]" 
          />
        </div>
        <div className="flex flex-col items-start text-left">
          <h2 className="text-3xl md:text-4xl font-extrabold text-primary dark:text-white mb-6 leading-tight">
            Constructing Spaces of Safety & Splendor
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">
            At SN Infra, we bridge standard engineering principles with personalized aesthetics. Whether you require building plans, government approvals, structural drawings, vastu layouts, or complete lock-and-key residential and commercial construction, our team of qualified engineers delivers precision-focused outcomes.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="flex items-center gap-3">
              <FaCheckCircle className="text-accent shrink-0" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">ISO Standard Quality</span>
            </div>
            <div className="flex items-center gap-3">
              <FaCheckCircle className="text-accent shrink-0" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Certified Engineers Only</span>
            </div>
            <div className="flex items-center gap-3">
              <FaCheckCircle className="text-accent shrink-0" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Transparent Material Bills</span>
            </div>
            <div className="flex items-center gap-3">
              <FaCheckCircle className="text-accent shrink-0" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">24/7 Digital Progression updates</span>
            </div>
          </div>
          <Link 
            to="/about" 
            className="bg-primary hover:bg-primary-light text-white font-semibold text-xs px-6 py-3.5 rounded-xl transition-all shadow-md flex items-center gap-2 group"
          >
            Learn More About Us
            <FaArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* --- CORE SERVICES CAROUSEL SECTION --- */}
      <section className="py-20 bg-slate-100 dark:bg-slate-900/60 border-y border-slate-200/40 dark:border-slate-800/40 px-6">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-primary dark:text-white mb-4">
            Our Architectural & Construction Expertise
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            From preliminary blueprints to lock-and-key properties, we provide comprehensive workflows under one roof.
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((svc) => {
            const IconComponent = Icons[svc.icon] || FaToolbox;
            return (
              <div 
                key={svc._id} 
                className="glass rounded-3xl p-8 hover:-translate-y-2 transition-all duration-300 flex flex-col items-start text-left border border-slate-200/50 dark:border-slate-800/40 relative group overflow-hidden glow-secondary"
              >
                <div className="w-14 h-14 bg-secondary/15 text-secondary dark:bg-secondary/10 dark:text-secondary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <IconComponent size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3">
                  {svc.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6 flex-grow">
                  {svc.description}
                </p>
                <Link 
                  to="/services" 
                  className="text-xs font-semibold text-secondary hover:text-secondary-dark flex items-center gap-1.5 group/link"
                >
                  Learn More
                  <FaChevronRight size={10} className="group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Link 
            to="/services" 
            className="inline-flex items-center gap-2 border border-primary text-primary dark:border-white dark:text-white hover:bg-primary hover:text-white dark:hover:bg-white dark:hover:text-slate-900 font-semibold text-xs px-6 py-3 rounded-xl transition-all"
          >
            Explore All 13 Services
          </Link>
        </div>
      </section>

      {/* --- WHY CHOOSE US CARDS --- */}
      <section className="py-20 px-6 max-w-7xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-primary dark:text-white mb-12">
          Why Engineers & Homeowners Trust SN Infra
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {whyChooseUs.map((w, idx) => (
            <div 
              key={idx} 
              className="glass p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800/30 text-center flex flex-col items-center hover:scale-[1.03] transition-all glow-accent"
            >
              <div className="w-12 h-12 bg-accent/15 text-accent rounded-2xl flex items-center justify-center mb-6">
                {w.icon}
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white mb-3">{w.title}</h3>
              <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- PROJECTS GALLERY PREVIEW --- */}
      <section className="py-20 bg-slate-100 dark:bg-slate-900/50 px-6 border-t border-slate-200/50 dark:border-slate-800/40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-end justify-between mb-16 gap-4">
          <div className="text-left">
            <h2 className="text-3xl md:text-4xl font-extrabold text-primary dark:text-white mb-4">
              Featured Construction Ventures
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg">
              Explore our landmark projects across Tamil Nadu. Review budgets, scopes, and progress tracker ratings.
            </p>
          </div>
          {/* Quick Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {['All', 'Residential', 'Commercial', 'Interior'].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeFilter === cat 
                    ? 'bg-secondary text-white shadow-md shadow-orange-500/25'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects
            .filter(p => activeFilter === 'All' || p.category === activeFilter)
            .map((proj) => (
              <div 
                key={proj._id} 
                className="bg-white dark:bg-slate-800/80 rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-slate-200/50 dark:border-slate-800/30 flex flex-col group"
              >
                <div className="relative overflow-hidden h-60">
                  <img 
                    src={proj.thumbnail || 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=800'} 
                    alt={proj.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 rounded-lg">
                    {proj.status}
                  </div>
                  {proj.budget && (
                    <div className="absolute bottom-4 right-4 bg-secondary text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md">
                      {proj.budget}
                    </div>
                  )}
                </div>

                <div className="p-6 flex flex-col flex-grow text-left">
                  <h3 className="text-lg font-extrabold text-slate-800 dark:text-white mb-2">
                    {proj.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 mb-4 font-medium uppercase tracking-wider">
                    {proj.location} • {proj.category}
                  </p>
                  
                  {/* Completion percentage slider/progress view */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                      <span>Milestone Completion</span>
                      <span className="text-secondary">{proj.completionPercent}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                        style={{ width: `${proj.completionPercent}%` }}
                      />
                    </div>
                  </div>

                  <Link 
                    to={`/projects/${proj._id}`}
                    className="w-full text-center bg-slate-50 hover:bg-primary hover:text-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs font-bold py-3.5 rounded-xl transition-all border border-slate-100 dark:border-slate-800 block mt-auto"
                  >
                    View Project Details
                  </Link>
                </div>
              </div>
            ))}
        </div>

        <div className="text-center mt-12">
          <Link 
            to="/projects" 
            className="bg-primary hover:bg-primary-light text-white font-semibold text-xs px-6 py-4 rounded-xl shadow-md transition-all inline-block"
          >
            Explore Projects Index
          </Link>
        </div>
      </section>

      {/* --- CONSTRUCTION PROCESS TIMELINE --- */}
      <section className="py-20 px-6 max-w-7xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-primary dark:text-white mb-4">
          Our Roadmap to Handover
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto mb-16">
          Following clean, sequential checkpoints ensuring legal compliance, vastu checks, and flawless finishing.
        </p>

        {/* Dynamic Timeline Selector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-4 flex flex-col gap-3">
            {processSteps.map((step, idx) => (
              <button
                key={idx}
                onClick={() => setActiveProcessStep(idx)}
                className={`p-5 rounded-2xl text-left border transition-all flex items-center justify-between ${
                  activeProcessStep === idx 
                    ? 'bg-white dark:bg-slate-800 border-secondary shadow-lg shadow-orange-500/5' 
                    : 'bg-transparent border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <span className={`text-sm font-bold ${activeProcessStep === idx ? 'text-secondary' : 'text-slate-700 dark:text-slate-300'}`}>
                  {step.title}
                </span>
                <FaChevronRight size={12} className={`transition-transform ${activeProcessStep === idx ? 'rotate-90 text-secondary' : ''}`} />
              </button>
            ))}
          </div>

          <div className="lg:col-span-8 bg-white dark:bg-slate-800/80 p-8 sm:p-12 rounded-3xl border border-slate-200/50 dark:border-slate-800/35 flex flex-col justify-center text-left relative overflow-hidden glass shadow-sm">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full blur-2xl pointer-events-none" />
            <span className="text-[75px] font-black text-secondary/15 absolute top-4 right-8 leading-none select-none">
              0{activeProcessStep + 1}
            </span>
            <h3 className="text-2xl font-extrabold text-primary dark:text-white mb-4">
              {processSteps[activeProcessStep].title.split('. ')[1]}
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed max-w-lg">
              {processSteps[activeProcessStep].desc}
            </p>
          </div>
        </div>
      </section>

      {/* --- TESTIMONIALS SLIDER --- */}
      <section id="testimonials" className="py-20 bg-slate-100 dark:bg-slate-900/50 border-y border-slate-200/50 dark:border-slate-800/40 px-6">
        <div className="max-w-7xl mx-auto text-center mb-16 flex flex-col items-center gap-4">
          <h2 className="text-3xl md:text-4xl font-extrabold text-primary dark:text-white">
            Feedback From Our Clients
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Verified references from homeowners, structural engineers, and contractors.
          </p>
          <button
            onClick={() => setIsReviewModalOpen(true)}
            className="mt-2 bg-secondary hover:bg-secondary-light text-white font-bold text-xs px-5 py-3 rounded-xl shadow-md transition-all"
          >
            Write a Customer Review
          </button>
        </div>

        {testimonials.length > 0 ? (
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.slice(0, 3).map((t, idx) => (
              <div 
                key={t._id || idx} 
                className="glass p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800/35 flex flex-col justify-between text-left relative shadow-sm"
              >
                <div>
                  <div className="flex gap-1 text-amber-500 mb-6">
                    {Array.from({ length: t.rating || 5 }).map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic mb-8">
                    "{t.reviewText}"
                  </p>
                </div>
                <div className="flex items-center gap-4 border-t border-slate-200/50 dark:border-slate-800/50 pt-4">
                  {t.clientImage ? (
                    <img src={t.clientImage} alt={t.clientName} className="w-10 h-10 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-secondary/15 text-secondary flex items-center justify-center font-bold text-sm shrink-0">
                      {t.clientName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white leading-none mb-1">
                      {t.clientName}
                    </h4>
                    <span className="text-[10px] text-slate-400">{t.role || 'Home Owner'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-xs text-slate-400 italic">No reviews published yet. Be the first to share your experience!</p>
          </div>
        )}
      </section>

      {/* --- FAQ SECTION --- */}
      <section className="py-20 px-6 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-primary dark:text-white mb-12">
          Frequently Answered Queries
        </h2>
        <div className="flex flex-col gap-4 text-left">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/50 dark:border-slate-800/35 overflow-hidden shadow-sm transition-all"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full p-6 flex justify-between items-center text-sm font-bold text-slate-800 dark:text-white hover:text-secondary"
              >
                <span>{faq.q}</span>
                <FaChevronDown 
                  size={12} 
                  className={`transition-transform duration-300 ${faqOpen[idx] ? 'rotate-180 text-secondary' : 'text-slate-400'}`} 
                />
              </button>
              <AnimatePresence>
                {faqOpen[idx] && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-6 text-xs text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/40 pt-4">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* --- FINAL CALL TO ACTION --- */}
      <section className="py-20 bg-gradient-to-br from-primary via-primary-dark to-slate-950 text-white text-center px-6 relative overflow-hidden border-t border-primary-dark">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,140,0,0.1),transparent)] pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight">
            Ready to Begin Planning Your Project?
          </h2>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-xl mx-auto mb-10">
            Schedule a free consultations audit. Get estimates on layouts, municipal permit costs, materials checklist parameters, and progress timelines.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              to="/contact" 
              className="bg-secondary hover:bg-secondary-light text-white font-semibold text-sm px-8 py-4 rounded-2xl shadow-lg transition-all"
            >
              Get Free Consultation
            </Link>
            <a 
              href={`tel:${settings?.phone || '+91 84385 68318'}`}
              className="glass border-white/20 text-white hover:bg-white/10 font-semibold text-sm px-8 py-4 rounded-2xl transition-all flex items-center gap-2"
            >
              <FaPhoneAlt size={12} />
              Call +91 84385 68318
            </a>
          </div>
        </div>
      </section>

      {/* --- CUSTOMER WRITE REVIEW MODAL --- */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm text-left">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl w-full max-w-lg border border-slate-200/50 dark:border-slate-800/30 flex flex-col text-left">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800/50 flex justify-between items-center bg-slate-50 dark:bg-slate-900/40 rounded-t-3xl">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                Submit Customer Review
              </h3>
              <button
                onClick={() => {
                  setIsReviewModalOpen(false);
                  setReviewSubmitStatus(null);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-650 dark:hover:text-white bg-slate-100 dark:bg-slate-900"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleReviewSubmit} className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Your Name *</label>
                  <input
                    type="text"
                    placeholder="Ramesh Pillai"
                    className="p-3 bg-slate-50 dark:bg-slate-950 text-xs rounded-xl outline-none border border-transparent dark:border-slate-800 focus:ring-1 focus:ring-secondary"
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Profile Title (e.g. Home Owner)</label>
                  <input
                    type="text"
                    placeholder="e.g. Villa Owner"
                    className="p-3 bg-slate-50 dark:bg-slate-950 text-xs rounded-xl outline-none border border-transparent dark:border-slate-800 focus:ring-1 focus:ring-secondary"
                    value={reviewRole}
                    onChange={(e) => setReviewRole(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Star Rating</label>
                  <select
                    className="p-3 bg-slate-50 dark:bg-slate-950 text-xs rounded-xl outline-none border border-transparent dark:border-slate-800 focus:ring-1 focus:ring-secondary"
                    value={reviewRating}
                    onChange={(e) => setReviewRating(parseInt(e.target.value))}
                  >
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Your Picture (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setReviewImage(e.target.files[0])}
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Review Feedback *</label>
                <textarea
                  placeholder="Tell us about the engineering parameters, timelines, and material quality details..."
                  rows={4}
                  className="p-3 bg-slate-50 dark:bg-slate-950 text-xs rounded-xl outline-none border border-transparent dark:border-slate-800 focus:ring-1 focus:ring-secondary resize-none"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  required
                />
              </div>

              {reviewSubmitStatus && (
                <div className={`p-4 rounded-xl text-xs font-semibold ${
                  reviewSubmitStatus.success ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                }`}>
                  {reviewSubmitStatus.success || reviewSubmitStatus.error}
                </div>
              )}

              <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsReviewModalOpen(false);
                    setReviewSubmitStatus(null);
                  }}
                  className="px-5 py-3 bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-350 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-5 py-3 bg-secondary hover:bg-secondary-light text-white font-bold text-xs rounded-xl shadow transition-all"
                >
                  {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Home;
