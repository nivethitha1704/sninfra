import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaArrowRight, FaClock, FaCheckCircle, FaAward, 
  FaPhoneAlt, FaEnvelope, FaChevronRight, FaChevronDown,
  FaShieldAlt, FaHandshake, FaToolbox, FaThumbsUp, FaEye
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
    <span ref={elementRef} className="counter-text text-4xl md:text-5xl font-black text-[#1C68F5] dark:text-white">
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
  const [gallery, setGallery] = useState([]);
  const [faqOpen, setFaqOpen] = useState({});

  const [activeFilter, setActiveFilter] = useState('All');
  const [activeProcessStep, setActiveProcessStep] = useState(0);

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactStatus, setContactStatus] = useState(null);
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactName || !contactPhone || !contactMessage) {
      setContactStatus({ error: 'Please fill in Name, Phone, and Message.' });
      return;
    }
    setIsSubmittingContact(true);
    setContactStatus(null);
    try {
      await axios.post('/api/enquiries', {
        name: contactName,
        phone: contactPhone,
        email: contactEmail,
        message: contactMessage
      });
      setContactStatus({ success: 'Thank you! Your enquiry has been received.' });
      setContactName('');
      setContactPhone('');
      setContactEmail('');
      setContactMessage('');
    } catch (err) {
      setContactStatus({ error: 'Failed to submit enquiry. Please try again.' });
    } finally {
      setIsSubmittingContact(false);
    }
  };

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
        const [servicesRes, projectsRes, testimonialsRes, galleryRes] = await Promise.all([
          axios.get('/api/services'),
          axios.get('/api/projects'),
          axios.get('/api/testimonials'),
          axios.get('/api/gallery')
        ]);
        setServices(servicesRes.data.slice(0, 6)); // Display first 6 services on home
        setProjects(projectsRes.data.slice(0, 3)); // Display recent 3 projects
        setTestimonials(testimonialsRes.data);
        setGallery(galleryRes.data.slice(0, 6)); // Display 6 gallery items on home
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
    { num: '01', title: 'Consultation', desc: 'Detailed site inspection and requirements gathering for planning layouts.' },
    { num: '02', title: 'Planning', desc: 'Custom architectural sketches matching structural calculations and Vastu settings.' },
    { num: '03', title: 'Approval', desc: 'Filing blueprints to local DTCP or corporation boards for official sanctions.' },
    { num: '04', title: 'Construction', desc: 'Actual construction on-site using premium aggregates under engineer review.' },
    { num: '05', title: 'Interior', desc: 'Custom electrical mappings, modular cabinetry installation, flooring, and paint jobs.' },
    { num: '06', title: 'Handover', desc: 'Detailed utility checks and final inspection preceding official property handover.' }
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
    <div className="w-full bg-white dark:bg-[#0F172A] text-[#1E293B] dark:text-slate-100 antialiased">

      {/* --- HERO SECTION --- */}
      <section className="relative min-h-[85vh] flex items-center justify-start px-6 sm:px-16 py-24 bg-slate-950 overflow-hidden">
        {/* Subtle Background Image and Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=1600&auto=format&fit=crop" 
            alt="Construction background" 
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1C68F5]/80 via-[#1C68F5]/50 to-transparent" />
        </div>

        {/* Blueprint Crane SVG Animation */}
        <div className="absolute right-0 bottom-0 top-0 w-full lg:w-1/2 pointer-events-none z-0">
          <svg className="w-full h-full text-[#FFC100] opacity-25" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="100" y1="550" x2="700" y2="550" stroke="currentColor" strokeWidth="2" strokeDasharray="5 5" />
            <path d="M 450 550 L 480 200 L 500 200 L 530 550 Z" stroke="currentColor" strokeWidth="2" />
            <line x1="450" y1="550" x2="530" y2="550" stroke="currentColor" strokeWidth="3" />
            <line x1="480" y1="200" x2="500" y2="200" stroke="currentColor" strokeWidth="3" />
            <line x1="490" y1="200" x2="150" y2="200" stroke="currentColor" strokeWidth="3" />
            <line x1="490" y1="200" x2="600" y2="200" stroke="currentColor" strokeWidth="3" />
            <rect x="250" y="200" width="12" height="6" stroke="currentColor" strokeWidth="2" />
            <line x1="256" y1="206" x2="256" y2="350" stroke="currentColor" strokeWidth="1" />
            <path d="M 251 350 Q 256 355 261 350" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
        </div>

        {/* HERO CONTENT */}
        <div className="max-w-4xl w-full relative z-10 text-left">
          <span className="text-xs uppercase tracking-widest font-black text-[#FFC100] mb-4 block">
            Premium Construction & Engineering
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white uppercase tracking-tight leading-none mb-6">
            Build The <span className="text-[#FFC100]">Future.</span><br/>
            Modern Construction<br/>
            <span className="text-[#FFC100]">Solutions.</span>
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-slate-200 leading-relaxed max-w-2xl mb-8">
            Transforming customized concepts into certified architectural landmarks. We handle DTCP Approvals, Vastu-compliant sketching, structural design, and turnkey construction.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link 
              to="/contact" 
              className="bg-[#FFC100] hover:bg-[#e0a800] text-[#1C68F5] font-black uppercase tracking-wider text-xs px-8 py-4 rounded shadow-lg transition-all"
            >
              Get A Quote
            </Link>
            <Link 
              to="/projects" 
              className="border-2 border-white hover:bg-white hover:text-[#1C68F5] text-white font-bold uppercase tracking-wider text-xs px-8 py-4 rounded transition-all"
            >
              View Projects
            </Link>
          </div>
        </div>
      </section>

      {/* --- ABOUT SECTION (White background) --- */}
      <section className="py-24 px-6 bg-white text-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center text-left">
          {/* Left Side: Image */}
          <div className="relative group">
            <div className="absolute inset-0 bg-[#FFC100]/10 rounded-2xl blur-xl transition-transform" />
            <img 
              src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=800&auto=format&fit=crop" 
              alt="Engineering" 
              className="rounded-2xl shadow-lg border border-slate-200 object-cover w-full h-[350px] sm:h-[450px] relative z-10 transition-transform duration-500 hover:scale-[1.01]" 
            />
          </div>
          
          {/* Right Side: Content */}
          <div className="flex flex-col items-start">
            <div className="w-12 h-1 bg-[#FFC100] mb-4" /> {/* Yellow line above header */}
            <span className="text-xs uppercase tracking-widest font-black text-[#1C68F5] mb-2 block">About SN Infra</span>
            <h2 className="text-3xl md:text-4xl font-black text-[#1C68F5] uppercase tracking-tight mb-6">
              Constructing Spaces of Safety & Splendor
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              At SN Infra, we bridge standard engineering principles with personalized aesthetics. Whether you require building plans, government approvals, structural drawings, vastu layouts, or complete lock-and-key residential and commercial construction, our team of qualified engineers delivers precision-focused outcomes.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 w-full">
              <div className="flex items-center gap-3">
                <FaCheckCircle className="text-[#FFC100] shrink-0" />
                <span className="text-xs font-semibold text-slate-700">ISO Standard Quality</span>
              </div>
              <div className="flex items-center gap-3">
                <FaCheckCircle className="text-[#FFC100] shrink-0" />
                <span className="text-xs font-semibold text-slate-700">Certified Engineers Only</span>
              </div>
              <div className="flex items-center gap-3">
                <FaCheckCircle className="text-[#FFC100] shrink-0" />
                <span className="text-xs font-semibold text-slate-700">Transparent Material Bills</span>
              </div>
              <div className="flex items-center gap-3">
                <FaCheckCircle className="text-[#FFC100] shrink-0" />
                <span className="text-xs font-semibold text-slate-700">24/7 Digital Updates</span>
              </div>
            </div>
            <Link 
              to="/about" 
              className="bg-[#1C68F5] hover:bg-[#091aa1] text-white font-bold uppercase tracking-wider text-xs px-6 py-4 rounded transition-all shadow-md flex items-center gap-2 group"
            >
              Learn More About Us
              <FaArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* --- SERVICES SECTION (Light Gray background) --- */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/60 px-6 border-y border-slate-200/50 dark:border-slate-800/40">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <div className="w-12 h-1 bg-[#FFC100] mx-auto mb-4" />
          <span className="text-xs uppercase tracking-widest font-black text-[#1C68F5] mb-2 block">Our Solutions</span>
          <h2 className="text-3xl md:text-4xl font-black text-[#1C68F5] dark:text-white uppercase tracking-tight">
            Expertise & Core Services
          </h2>
          <p className="text-sm text-slate-500 max-w-xl mx-auto mt-4">
            From preliminary blueprints to lock-and-key properties, we provide comprehensive workflows under one roof.
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((svc) => {
            const IconComponent = Icons[svc.icon] || FaToolbox;
            return (
              <div 
                key={svc._id} 
                className="bg-white dark:bg-[#0F172A] rounded-2xl p-8 hover:-translate-y-2 transition-all duration-300 flex flex-col items-start text-left border border-slate-200/50 dark:border-slate-800/30 shadow-sm relative group overflow-hidden hover:border-[#FFC100]"
              >
                <div className="w-14 h-14 bg-blue-50 text-[#1C68F5] rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#1C68F5] group-hover:text-white transition-all duration-300">
                  <IconComponent size={24} />
                </div>
                <h3 className="text-lg font-bold text-[#1C68F5] dark:text-white uppercase tracking-tight mb-3">
                  {svc.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-6 flex-grow">
                  {svc.description}
                </p>
                <Link 
                  to="/services" 
                  className="text-xs font-bold uppercase tracking-wider text-[#1C68F5] dark:text-[#FFC100] hover:text-[#091aa1] flex items-center gap-1.5 group/link"
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
            className="inline-flex items-center gap-2 border-2 border-[#1C68F5] dark:border-white text-[#1C68F5] dark:text-white hover:bg-[#1C68F5] hover:text-white dark:hover:bg-white dark:hover:text-[#1C68F5] font-bold uppercase tracking-wider text-xs px-6 py-3 rounded transition-all"
          >
            Explore All 13 Services
          </Link>
        </div>
      </section>

      {/* --- PROJECTS / FEATURED PROJECTS SECTION (Vivid Blue background) --- */}
      <section className="py-24 bg-[#1C68F5] text-white px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-end justify-between mb-16 gap-4">
          <div className="text-left">
            <div className="w-12 h-1 bg-[#FFC100] mb-4" />
            <span className="text-xs uppercase tracking-widest font-black text-[#FFC100] mb-2 block">Premium Portfolio</span>
            <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight mb-2">
              Featured Projects
            </h2>
            <p className="text-sm text-blue-100 max-w-lg leading-relaxed">
              Explore our landmark projects across Tamil Nadu. Review budgets, scopes, and progress tracker ratings.
            </p>
          </div>
          {/* Quick Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {['All', 'Residential', 'Commercial', 'Interior'].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-4 py-2.5 rounded text-xs font-bold uppercase tracking-wider transition-all ${
                  activeFilter === cat 
                    ? 'bg-[#FFC100] text-[#1C68F5] shadow-md'
                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects
            .filter(p => activeFilter === 'All' || p.category === activeFilter)
            .map((proj) => (
              <div 
                key={proj._id} 
                className="bg-white text-slate-800 rounded-lg overflow-hidden shadow-lg border border-white/10 flex flex-col group text-left"
              >
                <div className="relative overflow-hidden h-60">
                  <img 
                    src={proj.thumbnail || 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=800'} 
                    alt={proj.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute top-4 left-4 bg-slate-900/90 text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 rounded">
                    {proj.status}
                  </div>
                  {proj.budget && (
                    <div className="absolute bottom-4 right-4 bg-[#FFC100] text-[#1C68F5] text-xs font-black px-3 py-1.5 rounded shadow-md">
                      {proj.budget}
                    </div>
                  )}
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-lg font-bold text-[#1C68F5] uppercase tracking-tight mb-2">
                    {proj.name}
                  </h3>
                  <p className="text-[10px] text-slate-400 mb-4 font-bold uppercase tracking-wider">
                    {proj.location} • {proj.category}
                  </p>
                  
                  {/* Completion percentage progress view */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-600 mb-2">
                      <span>Progress Tracker</span>
                      <span className="text-[#1C68F5] font-black">{proj.completionPercent}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#1C68F5] rounded-full"
                        style={{ width: `${proj.completionPercent}%` }}
                      />
                    </div>
                  </div>

                  <Link 
                    to={`/projects/${proj._id}`}
                    className="w-full text-center bg-[#1C68F5] hover:bg-[#091aa1] text-white text-xs font-bold uppercase tracking-wider py-3.5 rounded transition-all block mt-auto"
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
            className="bg-[#FFC100] hover:bg-[#ffca28] text-[#1C68F5] font-black uppercase tracking-wider text-xs px-8 py-4 rounded shadow-md transition-all inline-block"
          >
            Explore Projects Index
          </Link>
        </div>
      </section>

      {/* --- STATISTICS SECTION (White/light background) --- */}
      <section className="py-16 bg-white text-[#1C68F5] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="flex flex-col items-center">
            <AnimatedCounter value={500} suffix="+" />
            <div className="w-8 h-0.5 bg-[#FFC100] my-2" />
            <span className="text-[10px] uppercase tracking-widest font-black text-slate-500">Projects Completed</span>
          </div>
          <div className="flex flex-col items-center">
            <AnimatedCounter value={10} suffix="+" />
            <div className="w-8 h-0.5 bg-[#FFC100] my-2" />
            <span className="text-[10px] uppercase tracking-widest font-black text-slate-500">Years Experience</span>
          </div>
          <div className="flex flex-col items-center">
            <AnimatedCounter value={100} suffix="%" />
            <div className="w-8 h-0.5 bg-[#FFC100] my-2" />
            <span className="text-[10px] uppercase tracking-widest font-black text-slate-500">Client Satisfaction</span>
          </div>
          <div className="flex flex-col items-center">
            <AnimatedCounter value={50} suffix="+" />
            <div className="w-8 h-0.5 bg-[#FFC100] my-2" />
            <span className="text-[10px] uppercase tracking-widest font-black text-slate-500">Team Members</span>
          </div>
        </div>
      </section>

      {/* --- PROCESS TIMELINE SECTION (Light background) --- */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/40 px-6">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <div className="w-12 h-1 bg-[#FFC100] mx-auto mb-4" />
          <span className="text-xs uppercase tracking-widest font-black text-[#1C68F5] mb-2 block">Our Timeline</span>
          <h2 className="text-3xl md:text-4xl font-black text-[#1C68F5] dark:text-white uppercase tracking-tight">
            Our Roadmap to Handover
          </h2>
          <p className="text-sm text-slate-500 max-w-xl mx-auto mt-4">
            Following clean, sequential checkpoints ensuring legal compliance, vastu checks, and flawless finishing.
          </p>
        </div>

        {/* TIMELINE TIMELINE LAYOUT */}
        <div className="max-w-5xl mx-auto relative pl-8 sm:pl-0 sm:grid sm:grid-cols-2 gap-8 items-start">
          {/* Vertical Center Line */}
          <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-1 bg-[#1C68F5] -translate-x-1/2 z-0" />

          {processSteps.map((step, idx) => {
            const isLeft = idx % 2 === 0;
            return (
              <div 
                key={idx} 
                className={`relative mb-12 sm:mb-6 flex flex-col ${
                  isLeft ? 'sm:col-start-1 sm:items-end sm:text-right' : 'sm:col-start-2 sm:items-start sm:text-left'
                }`}
              >
                {/* Timeline Number Circle */}
                <div className="absolute -left-8 sm:left-1/2 top-0 -translate-x-1/2 w-8 h-8 rounded-full bg-[#FFC100] text-[#1C68F5] font-black flex items-center justify-center shadow z-10 text-xs">
                  {step.num}
                </div>

                {/* Timeline Card */}
                <div className={`bg-white dark:bg-[#0F172A] p-6 rounded-lg shadow border border-slate-200/50 dark:border-slate-800/40 w-full sm:w-[90%] z-10 text-left`}>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-[#1C68F5] dark:text-white mb-2">
                    {step.title}
                  </h4>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* --- TESTIMONIALS SECTION (White background) --- */}
      <section id="testimonials" className="py-24 bg-white text-slate-800 px-6 border-t border-slate-200">
        <div className="max-w-7xl mx-auto text-center mb-16 flex flex-col items-center gap-4">
          <div className="w-12 h-1 bg-[#FFC100] mb-4" />
          <span className="text-xs uppercase tracking-widest font-black text-[#1C68F5] mb-2 block">Testimonials</span>
          <h2 className="text-3xl md:text-4xl font-black text-[#1C68F5] uppercase tracking-tight">
            Feedback From Our Clients
          </h2>
          <p className="text-sm text-slate-500 max-w-xl">
            Verified references from homeowners, structural engineers, and contractors.
          </p>
          <button
            onClick={() => setIsReviewModalOpen(true)}
            className="mt-2 bg-[#FFC100] hover:bg-[#ffca28] text-[#1C68F5] font-black uppercase tracking-wider text-xs px-6 py-3 rounded shadow transition-all"
          >
            Write a Customer Review
          </button>
        </div>

        {testimonials.length > 0 ? (
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.slice(0, 3).map((t, idx) => (
              <div 
                key={t._id || idx} 
                className="bg-white p-8 rounded-lg border-t-4 border-[#FFC100] border-x border-b border-slate-200 flex flex-col justify-between text-left relative shadow-sm hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex gap-1 text-amber-500 mb-6">
                    {Array.from({ length: t.rating || 5 }).map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed italic mb-8">
                    "{t.reviewText}"
                  </p>
                </div>
                <div className="flex items-center gap-4 border-t border-slate-100 pt-4">
                  {t.clientImage ? (
                    <img src={t.clientImage} alt={t.clientName} className="w-10 h-10 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#FFC100]/10 text-[#1C68F5] flex items-center justify-center font-bold text-sm shrink-0">
                      {t.clientName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="text-xs font-bold text-[#1C68F5] uppercase tracking-wider leading-none mb-1">
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

      {/* --- GALLERY PREVIEW SECTION (White background) --- */}
      <section className="py-24 bg-white px-6 border-t border-slate-200">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <div className="w-12 h-1 bg-[#FFC100] mx-auto mb-4" />
          <span className="text-xs uppercase tracking-widest font-black text-[#1C68F5] mb-2 block">Media Showcase</span>
          <h2 className="text-3xl md:text-4xl font-black text-[#1C68F5] uppercase tracking-tight">
            Photo Gallery
          </h2>
          <p className="text-sm text-slate-500 max-w-xl mx-auto mt-4">
            A quick glimpse of our active constructions, elevations, and finished interior spaces.
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {gallery.map((item) => (
            <div 
              key={item._id}
              className="group relative h-64 rounded-lg overflow-hidden shadow-md border border-slate-200 cursor-pointer"
            >
              <img 
                src={item.url} 
                alt={item.title || 'Gallery showcase'} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-[#1C68F5]/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="text-center text-white p-4">
                  <FaEye className="mx-auto text-[#FFC100] mb-2" size={24} />
                  <span className="text-xs uppercase tracking-wider font-bold block">{item.title || 'View Project'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link 
            to="/gallery" 
            className="bg-[#1C68F5] hover:bg-[#091aa1] text-white font-bold uppercase tracking-wider text-xs px-8 py-4 rounded shadow transition-all"
          >
            Explore Full Gallery
          </Link>
        </div>
      </section>

      {/* --- CONTACT SECTION (Blue & White split) --- */}
      <section className="w-full flex flex-col lg:flex-row border-t border-slate-200">
        
        {/* Left Side: Blue column */}
        <div className="w-full lg:w-1/2 bg-[#1C68F5] text-white p-8 sm:p-16 flex flex-col justify-between text-left">
          <div>
            <div className="w-12 h-1 bg-[#FFC100] mb-6" />
            <span className="text-xs uppercase tracking-widest font-black text-[#FFC100] mb-2 block">Quick Connect</span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight mb-8">Consultation Coordinates</h2>
            <ul className="flex flex-col gap-8">
              <li className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-[#FFC100]">
                  <FaPhoneAlt size={16} />
                </div>
                <div>
                  <span className="text-[9px] text-blue-200 block uppercase font-bold tracking-widest">Phone</span>
                  <a href={`tel:${settings?.phone || '+918438568318'}`} className="text-base font-bold hover:text-[#FFC100] transition-colors">
                    {settings?.phone || '+91 84385 68318'}
                  </a>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-[#FFC100]">
                  <FaEnvelope size={16} />
                </div>
                <div>
                  <span className="text-[9px] text-blue-200 block uppercase font-bold tracking-widest">Email</span>
                  <a href={`mailto:${settings?.email || 'sninfracbe@gmail.com'}`} className="text-base font-bold hover:text-[#FFC100] transition-colors break-all">
                    {settings?.email || 'sninfracbe@gmail.com'}
                  </a>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-[#FFC100]">
                  <Icons.FaMapMarkerAlt size={16} />
                </div>
                <div>
                  <span className="text-[9px] text-blue-200 block uppercase font-bold tracking-widest">Main Office</span>
                  <span className="text-sm font-semibold leading-relaxed">
                    {settings?.address || '1, Kamaraj Road, Near Roundana, Mahalingapuram, Tamil Nadu – 642002'}
                  </span>
                </div>
              </li>
            </ul>
          </div>

          <div className="mt-12 w-full h-64 rounded-xl overflow-hidden shadow-md">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3726.7953388896212!2d77.009411!3d10.673176799999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba839c41ac96adf%3A0x2ab711cb85b35ec0!2sSN%20Infra!5e1!3m2!1sen!2sin!4v1786689408616!5m2!1sen!2sin"
              className="w-full h-full border-none"
              allowFullScreen="" 
              loading="lazy" 
            />
          </div>
        </div>

        {/* Right Side: White form */}
        <div className="w-full lg:w-1/2 bg-white text-slate-800 p-8 sm:p-16 text-left flex flex-col justify-center">
          <span className="text-xs uppercase tracking-widest font-black text-[#1C68F5] mb-2 block font-bold">Inquiry Form</span>
          <h2 className="text-3xl font-black text-[#1C68F5] uppercase tracking-tight mb-8">Send Enquiry Proposal</h2>
          
          <form onSubmit={handleContactSubmit} className="flex flex-col gap-6 w-full">
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Full Name *</label>
              <input
                type="text"
                placeholder="Ramesh Pillai"
                className="p-3 bg-slate-50 text-xs rounded border border-transparent focus:ring-1 focus:ring-[#1C68F5] outline-none"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Phone Number *</label>
                <input
                  type="tel"
                  placeholder="+91 84385 68318"
                  className="p-3 bg-slate-50 text-xs rounded border border-transparent focus:ring-1 focus:ring-[#1C68F5] outline-none"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                <input
                  type="email"
                  placeholder="ramesh@example.com"
                  className="p-3 bg-slate-50 text-xs rounded border border-transparent focus:ring-1 focus:ring-[#1C68F5] outline-none"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Message Notes *</label>
              <textarea
                placeholder="Detail your layout approvals requirements, Vastu criteria, or materials targets..."
                rows={4}
                className="p-3 bg-slate-50 text-xs rounded border border-transparent focus:ring-1 focus:ring-[#1C68F5] outline-none resize-none"
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                required
              />
            </div>

            {contactStatus && (
              <div className={`p-4 rounded text-xs font-semibold ${
                contactStatus.success ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-500'
              }`}>
                {contactStatus.success || contactStatus.error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmittingContact}
              className="bg-[#FFC100] hover:bg-[#ffca28] text-[#1C68F5] font-black uppercase tracking-wider text-xs px-8 py-4 rounded shadow transition-all text-center self-start"
            >
              {isSubmittingContact ? 'Submitting...' : 'Send Enquiry'}
            </button>
          </form>
        </div>
      </section>

      {/* --- CUSTOMER WRITE REVIEW MODAL --- */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm text-left">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg border border-slate-200 flex flex-col text-left">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-lg">
              <h3 className="text-xs font-bold text-[#1C68F5] uppercase tracking-wider">
                Submit Customer Review
              </h3>
              <button
                onClick={() => {
                  setIsReviewModalOpen(false);
                  setReviewSubmitStatus(null);
                }}
                className="p-2 rounded text-slate-400 hover:text-slate-600 bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleReviewSubmit} className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Your Name *</label>
                  <input
                    type="text"
                    placeholder="Ramesh Pillai"
                    className="p-3 bg-slate-50 text-xs rounded outline-none border border-transparent focus:ring-1 focus:ring-[#1C68F5]"
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Profile Title (e.g. Home Owner)</label>
                  <input
                    type="text"
                    placeholder="e.g. Villa Owner"
                    className="p-3 bg-slate-50 text-xs rounded outline-none border border-transparent focus:ring-1 focus:ring-[#1C68F5]"
                    value={reviewRole}
                    onChange={(e) => setReviewRole(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Star Rating</label>
                  <select
                    className="p-3 bg-slate-50 text-xs rounded outline-none border border-transparent focus:ring-1 focus:ring-[#1C68F5]"
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
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Your Picture (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setReviewImage(e.target.files[0])}
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Review Feedback *</label>
                <textarea
                  placeholder="Tell us about the engineering parameters, timelines, and material quality details..."
                  rows={4}
                  className="p-3 bg-slate-50 text-xs rounded outline-none border border-transparent focus:ring-1 focus:ring-[#1C68F5] resize-none"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  required
                />
              </div>

              {reviewSubmitStatus && (
                <div className={`p-4 rounded text-xs font-semibold ${
                  reviewSubmitStatus.success ? 'bg-emerald-500/10 text-emerald-555' : 'bg-red-500/10 text-red-500'
                }`}>
                  {reviewSubmitStatus.success || reviewSubmitStatus.error}
                </div>
              )}

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsReviewModalOpen(false);
                    setReviewSubmitStatus(null);
                  }}
                  className="px-5 py-3 bg-slate-100 text-slate-700 font-bold text-xs rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-5 py-3 bg-[#FFC100] hover:bg-[#ffca28] text-[#1C68F5] font-bold uppercase tracking-wider text-xs rounded shadow transition-all"
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
