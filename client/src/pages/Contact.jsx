import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { 
  FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, 
  FaWhatsapp, FaPaperPlane, FaClock 
} from 'react-icons/fa';
import { useSettings } from '../context/SettingsContext';

const Contact = () => {
  const { settings } = useSettings();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  
  const [submitStatus, setSubmitStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const phone = settings?.phone || '+91 84385 68318';
  const email = settings?.email || 'sninfracbe@gmail.com';
  const address = settings?.address || '1, Kamaraj Road, Near Roundana, Mahalingapuram, Tamil Nadu – 642002';
  const mapIframe = settings?.mapIframe || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3726.7953388896212!2d77.009411!3d10.673176799999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba839c41ac96adf%3A0x2ab711cb85b35ec0!2sSN%20Infra!5e1!3m2!1sen!2sin!4v1786689408616!5m2!1sen!2sin';

  const rawPhone = phone.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${rawPhone || '918438568318'}`;

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitStatus(null);
    try {
      await axios.post('/api/enquiries', data);
      setSubmitStatus({ success: 'Your enquiry has been successfully transmitted. Our team will contact you shortly.' });
      reset();
    } catch (err) {
      setSubmitStatus({ error: err.response?.data?.error || 'Enquiry submission failed. Please verify your connection.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-900 min-h-screen pb-20">
      
      {/* HEADER SECTION */}
      <section className="bg-gradient-to-br from-primary to-slate-950 text-white py-20 px-6 text-center relative border-b border-primary-dark">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,140,0,0.1),transparent)] pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10">
          <h1 className="text-4xl md:text-5xl font-black mb-4">Contact SN Infra</h1>
          <p className="text-slate-300 text-xs md:text-sm max-w-xl mx-auto leading-relaxed">
            Have a project query, layout blueprint sanction requirement, or renovation proposal? Let\'s discuss today.
          </p>
        </div>
      </section>

      {/* CORE CONTACT LAYOUT GRID */}
      <section className="max-w-7xl mx-auto px-6 pt-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start text-left">
        
        {/* Contact info panel */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <h2 className="text-2xl font-extrabold text-primary dark:text-white mb-2 leading-tight">
            Consultation Coordinates
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed mb-6">
            We are accessible via multiple channels. Visit our main office or reach out using phone, email, or WhatsApp.
          </p>

          <div className="flex flex-col gap-4">
            {/* Phone */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                <FaPhoneAlt size={16} />
              </div>
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">Phone Call</h4>
                <a href={`tel:${phone}`} className="text-sm font-bold text-slate-800 dark:text-white hover:text-secondary transition-colors">
                  {phone}
                </a>
              </div>
            </div>

            {/* Email */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                <FaEnvelope size={16} />
              </div>
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">Email Address</h4>
                <a href={`mailto:${email}`} className="text-sm font-bold text-slate-800 dark:text-white hover:text-secondary transition-colors">
                  {email}
                </a>
              </div>
            </div>

            {/* Address */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                <FaMapMarkerAlt size={16} />
              </div>
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">Main Office</h4>
                <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 font-semibold mb-2">
                  {address}
                </p>
                <a 
                  href="https://maps.app.goo.gl/U7GHGkvcHRGscX7E7?g_st=aw"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-[10px] font-bold text-secondary hover:text-secondary-light uppercase tracking-wider transition-colors"
                >
                  Open in Google Maps ↗
                </a>
              </div>
            </div>

            {/* Office Hours */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                <FaClock size={16} />
              </div>
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">Hours of Operations</h4>
                <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 font-semibold">
                  Mon – Sat: 9:00 AM – 7:00 PM <br />
                  Sunday: Closed
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Form panel */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-800/80 p-8 sm:p-10 rounded-3xl border border-slate-200/50 dark:border-slate-800/35 glass shadow-sm flex flex-col gap-6">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">
            Send Enquiry Proposal
          </h3>
          
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className={`p-3.5 bg-slate-50 dark:bg-slate-900 text-xs rounded-xl outline-none focus:ring-1 focus:ring-secondary border ${
                    errors.name ? 'border-red-500' : 'border-transparent dark:border-slate-800'
                  }`}
                  {...register('name', { required: 'Name is required' })}
                />
                {errors.name && <span className="text-[10px] text-red-500">{errors.name.message}</span>}
              </div>
              {/* Phone */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 84385 68318"
                  className={`p-3.5 bg-slate-50 dark:bg-slate-900 text-xs rounded-xl outline-none focus:ring-1 focus:ring-secondary border ${
                    errors.phone ? 'border-red-500' : 'border-transparent dark:border-slate-800'
                  }`}
                  {...register('phone', { required: 'Phone number is required' })}
                />
                {errors.phone && <span className="text-[10px] text-red-500">{errors.phone.message}</span>}
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
              <input
                type="email"
                placeholder="john@example.com"
                className={`p-3.5 bg-slate-50 dark:bg-slate-900 text-xs rounded-xl outline-none focus:ring-1 focus:ring-secondary border ${
                  errors.email ? 'border-red-500' : 'border-transparent dark:border-slate-800'
                }`}
                {...register('email', { 
                  required: 'Email address is required',
                  pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                })}
              />
              {errors.email && <span className="text-[10px] text-red-500">{errors.email.message}</span>}
            </div>

            {/* Message */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Message Notes</label>
              <textarea
                placeholder="Detail your project site specifications, total square foot targets, layouts approvals needs, vastu parameters..."
                rows={5}
                className={`p-3.5 bg-slate-50 dark:bg-slate-900 text-xs rounded-xl outline-none focus:ring-1 focus:ring-secondary border resize-none ${
                  errors.message ? 'border-red-500' : 'border-transparent dark:border-slate-800'
                }`}
                {...register('message', { required: 'Message is required' })}
              />
              {errors.message && <span className="text-[10px] text-red-500">{errors.message.message}</span>}
            </div>

            {submitStatus && (
              <div className={`p-4 rounded-xl text-xs font-semibold ${
                submitStatus.success ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
              }`}>
                {submitStatus.success || submitStatus.error}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto bg-secondary hover:bg-secondary-light text-white font-bold text-xs px-8 py-4 rounded-xl shadow-md shadow-orange-500/15 hover:shadow-orange-500/25 transition-all flex items-center justify-center gap-2"
              >
                <FaPaperPlane size={12} />
                {isSubmitting ? 'Transmitting...' : 'Send Enquiry'}
              </button>
              
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-8 py-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <FaWhatsapp size={14} />
                Chat on WhatsApp
              </a>
            </div>
          </form>

        </div>

      </section>

      {/* MAP EMBED FRAME */}
      <section className="max-w-7xl mx-auto px-6 pt-20">
        <div className="w-full h-96 rounded-3xl overflow-hidden shadow-inner border border-slate-200/50 dark:border-slate-800">
          <iframe 
            src={mapIframe.includes('src="') ? mapIframe.match(/src="([^"]+)"/)?.[1] || mapIframe : mapIframe}
            className="w-full h-full border-none"
            allowFullScreen="" 
            loading="lazy" 
          />
        </div>
      </section>

    </div>
  );
};

export default Contact;
