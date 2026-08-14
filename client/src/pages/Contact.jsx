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
    <div className="w-full bg-[#F8FAFC] dark:bg-[#0F172A] min-h-screen pb-20 pt-8">
      
      {/* HEADER SECTION */}
      <section className="bg-[#1C68F5] text-white py-20 px-6 text-center relative border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,193,0,0.1),transparent)] pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="w-12 h-1 bg-[#FFC100] mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-4">Contact SN Infra</h1>
          <p className="text-blue-100 text-xs md:text-sm max-w-xl mx-auto leading-relaxed">
            Have a project query, layout blueprint sanction requirement, or renovation proposal? Let's discuss today.
          </p>
        </div>
      </section>

      {/* CORE CONTACT LAYOUT GRID (Blue + White Split) */}
      <section className="max-w-7xl mx-auto px-6 pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch rounded-3xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800">
          
          {/* Left Side: Vivid Blue Column */}
          <div className="lg:col-span-5 bg-[#1C68F5] text-white p-8 sm:p-12 flex flex-col justify-between text-left">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight mb-4 text-white">
                Consultation Coordinates
              </h2>
              <p className="text-blue-200 text-xs leading-relaxed mb-8">
                We are accessible via multiple channels. Visit our main office or reach out using phone, email, or WhatsApp.
              </p>

              <div className="flex flex-col gap-6">
                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 text-[#FFC100] flex items-center justify-center shrink-0">
                    <FaPhoneAlt size={16} />
                  </div>
                  <div>
                    <h4 className="text-[9px] font-bold text-blue-200 uppercase tracking-widest leading-none mb-1.5">Phone Call</h4>
                    <a href={`tel:${phone}`} className="text-sm font-bold hover:text-[#FFC100] transition-colors">
                      {phone}
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 text-[#FFC100] flex items-center justify-center shrink-0">
                    <FaEnvelope size={16} />
                  </div>
                  <div>
                    <h4 className="text-[9px] font-bold text-blue-200 uppercase tracking-widest leading-none mb-1.5">Email Address</h4>
                    <a href={`mailto:${email}`} className="text-sm font-bold hover:text-[#FFC100] transition-colors break-all">
                      {email}
                    </a>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 text-[#FFC100] flex items-center justify-center shrink-0">
                    <FaMapMarkerAlt size={16} />
                  </div>
                  <div>
                    <h4 className="text-[9px] font-bold text-blue-200 uppercase tracking-widest leading-none mb-1.5">Main Office</h4>
                    <p className="text-xs leading-relaxed font-semibold">
                      {address}
                    </p>
                  </div>
                </div>

                {/* Office Hours */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 text-[#FFC100] flex items-center justify-center shrink-0">
                    <FaClock size={16} />
                  </div>
                  <div>
                    <h4 className="text-[9px] font-bold text-blue-200 uppercase tracking-widest leading-none mb-1.5">Hours of Operations</h4>
                    <p className="text-xs leading-relaxed font-semibold">
                      Mon – Sat: 9:00 AM – 7:00 PM <br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12">
              <a 
                href="https://maps.app.goo.gl/U7GHGkvcHRGscX7E7?g_st=aw"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FFC100] hover:text-[#ffca28] uppercase tracking-wider transition-colors"
              >
                Open in Google Maps ↗
              </a>
            </div>
          </div>

          {/* Right Side: White Form Column */}
          <div className="lg:col-span-7 bg-white dark:bg-[#0F172A] p-8 sm:p-12 flex flex-col gap-6 text-left">
            <h3 className="text-2xl font-black text-[#1C68F5] dark:text-white uppercase tracking-tight mb-2">
              Send Enquiry Proposal
            </h3>
            
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className={`p-3 bg-slate-50 dark:bg-slate-900 text-xs rounded outline-none focus:ring-1 focus:ring-[#1C68F5] border ${
                      errors.name ? 'border-red-500' : 'border-transparent dark:border-slate-800'
                    }`}
                    {...register('name', { required: 'Name is required' })}
                  />
                  {errors.name && <span className="text-[10px] text-red-500">{errors.name.message}</span>}
                </div>
                {/* Phone */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91 84385 68318"
                    className={`p-3 bg-slate-50 dark:bg-slate-900 text-xs rounded outline-none focus:ring-1 focus:ring-[#1C68F5] border ${
                      errors.phone ? 'border-red-500' : 'border-transparent dark:border-slate-800'
                    }`}
                    {...register('phone', { required: 'Phone number is required' })}
                  />
                  {errors.phone && <span className="text-[10px] text-red-500">{errors.phone.message}</span>}
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  className={`p-3 bg-slate-50 dark:bg-slate-900 text-xs rounded outline-none focus:ring-1 focus:ring-[#1C68F5] border ${
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
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Message Notes</label>
                <textarea
                  placeholder="Detail your project site specifications, vastu parameters, layouts approvals needs..."
                  rows={5}
                  className={`p-3 bg-slate-50 dark:bg-slate-900 text-xs rounded outline-none focus:ring-1 focus:ring-[#1C68F5] border resize-none ${
                    errors.message ? 'border-red-500' : 'border-transparent dark:border-slate-800'
                  }`}
                  {...register('message', { required: 'Message is required' })}
                />
                {errors.message && <span className="text-[10px] text-red-500">{errors.message.message}</span>}
              </div>

              {submitStatus && (
                <div className={`p-4 rounded text-xs font-semibold ${
                  submitStatus.success ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-500'
                }`}>
                  {submitStatus.success || submitStatus.error}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto bg-[#FFC100] hover:bg-[#ffca28] text-[#1C68F5] font-black uppercase tracking-wider text-xs px-8 py-4 rounded shadow transition-all flex items-center justify-center gap-2"
                >
                  <FaPaperPlane size={12} />
                  {isSubmitting ? 'Transmitting...' : 'Send Enquiry'}
                </button>
                
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-8 py-4 rounded flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <FaWhatsapp size={14} />
                  Chat on WhatsApp
                </a>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* MAP EMBED FRAME */}
      <section className="max-w-7xl mx-auto px-6 pt-16">
        <div className="w-full h-96 rounded-3xl overflow-hidden shadow-inner border border-slate-200 dark:border-slate-800">
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
