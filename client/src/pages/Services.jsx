import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as Icons from 'react-icons/fa';
import { FaToolbox, FaCheckCircle, FaTimes, FaFileSignature } from 'react-icons/fa';
import { useSettings } from '../context/SettingsContext';

const Services = () => {
  const { settings } = useSettings();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  
  // Modal enquiry form state
  const [enquiryName, setEnquiryName] = useState('');
  const [enquiryPhone, setEnquiryPhone] = useState('');
  const [enquiryEmail, setEnquiryEmail] = useState('');
  const [enquiryMessage, setEnquiryMessage] = useState('');
  const [submitStatus, setSubmitStatus] = useState(null);

  const fetchServices = async () => {
    try {
      const res = await axios.get('/api/services');
      setServices(res.data);
    } catch (err) {
      console.error('Failed to load services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    if (!enquiryName || !enquiryPhone || !enquiryEmail) {
      setSubmitStatus({ error: 'Please fill in Name, Phone, and Email.' });
      return;
    }

    try {
      const structuredMessage = `Service Interest: ${selectedService.title}\n\n${enquiryMessage || 'Interested in consultation.'}`;
      await axios.post('/api/enquiries', {
        name: enquiryName,
        phone: enquiryPhone,
        email: enquiryEmail,
        message: structuredMessage
      });
      setSubmitStatus({ success: 'Thank you! Your interest has been submitted successfully.' });
      // Reset form
      setEnquiryName('');
      setEnquiryPhone('');
      setEnquiryEmail('');
      setEnquiryMessage('');
      setTimeout(() => {
        setSelectedService(null);
        setSubmitStatus(null);
      }, 2000);
    } catch (error) {
      setSubmitStatus({ error: 'Failed to submit enquiry. Please check your network connection.' });
    }
  };

  return (
    <div className="w-full bg-white dark:bg-[#0F172A] min-h-screen pb-20 pt-8">
      
      {/* HEADER SECTION */}
      <section className="bg-[#1C68F5] text-white py-20 px-6 text-center relative border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,193,0,0.1),transparent)] pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="w-12 h-1 bg-[#FFC100] mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-4">Our Construction Services</h1>
          <p className="text-blue-100 text-xs md:text-sm max-w-xl mx-auto leading-relaxed">
            Professional planning, certified approvals, load bearing structural configuration, and premium lock-and-key developments.
          </p>
        </div>
      </section>

      {/* SERVICES GRID */}
      <section className="max-w-7xl mx-auto px-6 pt-20">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-800 rounded-3xl p-8 h-64 animate-pulse flex flex-col gap-4 border border-slate-200 dark:border-slate-800">
                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                <div className="w-2/3 h-6 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="w-full h-16 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((svc) => {
              const IconComponent = Icons[svc.icon] || FaToolbox;
              return (
                <div
                  key={svc._id}
                  onClick={() => setSelectedService(svc)}
                  className="bg-white dark:bg-slate-800/80 rounded-3xl p-8 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between border border-slate-200/50 dark:border-slate-800/35 relative group cursor-pointer glow-accent overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
                  
                  <div>
                    <div className="w-14 h-14 bg-accent/15 text-accent rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <IconComponent size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3">
                      {svc.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                      {svc.description}
                    </p>
                  </div>

                  <span className="text-xs font-semibold text-accent flex items-center gap-1.5 mt-auto">
                    Inquire details &rarr;
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SERVICE DETAILS & ENQUIRY MODAL */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200/50 dark:border-slate-800/30 flex flex-col text-left">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800/50 flex justify-between items-center bg-slate-50 dark:bg-slate-900/40 rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/10 text-accent rounded-xl flex items-center justify-center">
                  {React.createElement(Icons[selectedService.icon] || FaToolbox, { size: 18 })}
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                  {selectedService.title} Details
                </h3>
              </div>
              <button
                onClick={() => {
                  setSelectedService(null);
                  setSubmitStatus(null);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white bg-slate-100 dark:bg-slate-900"
              >
                <FaTimes size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 flex flex-col gap-6">
              
              {selectedService.image && (
                <div className="w-full h-48 rounded-2xl overflow-hidden mb-2">
                  <img src={selectedService.image} alt={selectedService.title} className="w-full h-full object-cover" />
                </div>
              )}

              <div>
                <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-2">About the Service</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {selectedService.description}
                </p>
              </div>

              {/* Service Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200/20 dark:border-slate-800/30">
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <FaCheckCircle className="text-accent shrink-0" />
                  <span>Compliant Plan Drafting</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <FaCheckCircle className="text-accent shrink-0" />
                  <span>Engineer Reviewed Computations</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <FaCheckCircle className="text-accent shrink-0" />
                  <span>Transparent Cost Calculations</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <FaCheckCircle className="text-accent shrink-0" />
                  <span>End-to-End Field Execution</span>
                </div>
              </div>

              {/* Direct Enquiry Box */}
              <div className="border-t border-slate-100 dark:border-slate-800/40 pt-6">
                <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-4">
                  Request Details / Free Quote on {selectedService.title}
                </h4>
                
                <form onSubmit={handleEnquirySubmit} className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Name</label>
                      <input
                        type="text"
                        value={enquiryName}
                        onChange={(e) => setEnquiryName(e.target.value)}
                        placeholder="John Doe"
                        className="p-3 bg-slate-50 dark:bg-slate-900 text-xs rounded-xl outline-none focus:ring-1 focus:ring-accent border border-transparent dark:border-slate-800"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone</label>
                      <input
                        type="tel"
                        value={enquiryPhone}
                        onChange={(e) => setEnquiryPhone(e.target.value)}
                        placeholder="+91 99999 99999"
                        className="p-3 bg-slate-50 dark:bg-slate-900 text-xs rounded-xl outline-none focus:ring-1 focus:ring-accent border border-transparent dark:border-slate-800"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                    <input
                      type="email"
                      value={enquiryEmail}
                      onChange={(e) => setEnquiryEmail(e.target.value)}
                      placeholder="john@example.com"
                      className="p-3 bg-slate-50 dark:bg-slate-900 text-xs rounded-xl outline-none focus:ring-1 focus:ring-accent border border-transparent dark:border-slate-800"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Notes / Message (Optional)</label>
                    <textarea
                      value={enquiryMessage}
                      onChange={(e) => setEnquiryMessage(e.target.value)}
                      placeholder={`Provide details regarding your area scope, location details, etc...`}
                      rows={3}
                      className="p-3 bg-slate-50 dark:bg-slate-900 text-xs rounded-xl outline-none focus:ring-1 focus:ring-accent border border-transparent dark:border-slate-800 resize-none"
                    />
                  </div>

                  {submitStatus && (
                    <div className={`p-4 rounded-xl text-xs font-semibold ${
                      submitStatus.success ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {submitStatus.success || submitStatus.error}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-secondary hover:bg-secondary-light text-white font-bold text-xs py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <FaFileSignature size={12} />
                    Submit Request Interest
                  </button>
                </form>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Services;
