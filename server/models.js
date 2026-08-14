import mongoose from 'mongoose';

// --- USER SCHEMA ---
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Staff'], default: 'Staff' },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

// --- PROJECT SCHEMA ---
const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  clientName: { type: String },
  category: { type: String, required: true, index: true }, // e.g., 'Residential', 'Commercial', 'Interior', 'Renovation'
  location: { type: String, required: true },
  budget: { type: String }, // e.g., '₹45 Lakhs' or numeric string
  area: { type: String }, // e.g., '2400 sq.ft'
  floors: { type: String }, // e.g., 'G + 2'
  description: { type: String, required: true },
  features: [{ type: String }],
  status: { type: String, enum: ['Ongoing', 'Completed', 'Draft', 'Archive'], default: 'Draft', index: true },
  startDate: { type: Date },
  endDate: { type: Date },
  completionPercent: { type: Number, default: 0, min: 0, max: 100 },
  // Map of project milestones with status / percentage for progress tracking
  progressDetails: {
    type: Map,
    of: Number, // Stores milestone completion % (0 to 100)
    default: {
      'Foundation': 0,
      'Columns & Beams': 0,
      'Brick Work': 0,
      'Plastering': 0,
      'Plumbing & Electrical': 0,
      'Flooring': 0,
      'Interior Fitouts': 0,
      'Painting': 0,
      'Finishing & Handover': 0
    }
  },
  mapLink: { type: String }, // Embedded Google Maps link or coordinates
  thumbnail: { type: String }, // Main image URL
  images: [{ type: String }], // Array of interior/construction details
  droneImages: [{ type: String }], // Drone shots
  videos: [{ type: String }], // Embedded video URLs (YouTube, Drive, or raw MP4)
  floorPlans: [{ type: String }], // Layout floor plans
  brochure: { type: String }, // PDF path
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// --- SERVICE SCHEMA ---
const serviceSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  icon: { type: String }, // Icon class/name (e.g. FaBuilding, FaVastu) or raw SVG/img path
  image: { type: String }, // Service preview image
  description: { type: String, required: true },
  orderIndex: { type: Number, default: 0 }
});

// --- GALLERY SCHEMA ---
const gallerySchema = new mongoose.Schema({
  title: { type: String },
  url: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Construction', 'Interior', 'Exterior', 'Drone', 'Completed', 'Site Progress'], 
    required: true,
    index: true 
  },
  beforeAfter: { type: Boolean, default: false },
  beforeUrl: { type: String },
  afterUrl: { type: String },
  orderIndex: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// --- TESTIMONIAL SCHEMA ---
const testimonialSchema = new mongoose.Schema({
  clientName: { type: String, required: true },
  role: { type: String }, // e.g., 'Home Owner', 'MD, Alpha Corp'
  reviewText: { type: String, required: true },
  rating: { type: Number, default: 5, min: 1, max: 5 },
  clientImage: { type: String },
  status: { type: String, enum: ['Show', 'Hide'], default: 'Show', index: true },
  createdAt: { type: Date, default: Date.now }
});

// --- ENQUIRY SCHEMA ---
const enquirySchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['New', 'Marked Contacted', 'Archived'], default: 'New', index: true },
  replies: [{
    subject: String,
    body: String,
    sentAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

// --- SETTINGS SCHEMA ---
const settingsSchema = new mongoose.Schema({
  key: { type: String, default: 'global_settings', unique: true },
  companyName: { type: String, default: 'SN Infra' },
  tagline: { type: String, default: 'Planning • Approval • Vastu • Construction • Interior & Exterior • Renovation • Surveying • Labour Contract • Structural Design' },
  phone: { type: String, default: '+91 84385 68318' },
  email: { type: String, default: 'sninfracbe@gmail.com' },
  address: { type: String, default: '1, Kamaraj Road, Near Roundana, Mahalingapuram, Tamil Nadu – 642002' },
  mapIframe: { type: String, default: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3726.7953388896212!2d77.009411!3d10.673176799999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba839c41ac96adf%3A0x2ab711cb85b35ec0!2sSN%20Infra!5e1!3m2!1sen!2sin!4v1786689408616!5m2!1sen!2sin' },
  whatsapp: { type: String, default: '+918438568318' },
  themeColors: {
    primary: { type: String, default: '#ffc100' }, // Orange
    secondary: { type: String, default: '#1C68F5' }, // Dark Navy
    accent: { type: String, default: '#ffc100' } // Orange
  },
  socialLinks: {
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    youtube: { type: String, default: '' },
    linkedin: { type: String, default: '' }
  },
  seoKeywords: { type: String, default: 'SN Infra, Construction, Planning, Approval, Vastu, Coimbatore, Pollachi' },
  seoDescription: { type: String, default: 'SN Infra is a premium construction company offering planning, approval, vastu, building construction, structural design, surveying, and interior design.' },
  logoUrl: { type: String, default: '' },
  faviconUrl: { type: String, default: '' }
});

// --- ACTIVITY LOG SCHEMA ---
const activityLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String },
  action: { type: String, required: true }, // e.g. 'Created Project', 'Updated Settings'
  details: { type: String },
  ipAddress: { type: String },
  timestamp: { type: Date, default: Date.now }
});

// Export all models
export const User = mongoose.model('User', userSchema);
export const Project = mongoose.model('Project', projectSchema);
export const Service = mongoose.model('Service', serviceSchema);
export const Gallery = mongoose.model('Gallery', gallerySchema);
export const Testimonial = mongoose.model('Testimonial', testimonialSchema);
export const Enquiry = mongoose.model('Enquiry', enquirySchema);
export const Settings = mongoose.model('Settings', settingsSchema);
export const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
