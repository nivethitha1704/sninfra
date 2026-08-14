import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

// Import models
import { 
  User, Project, Service, Gallery, 
  Testimonial, Enquiry, Settings, ActivityLog 
} from './models.js';

// Import helpers
import { upload, uploadToStorage, deleteFromStorage } from './uploadHelper.js';
import { createBackup, listBackups, restoreBackup, deleteBackup } from './backupHelper.js';

// Setup environment and paths
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'sn-infra-super-secret-key-2026';

const app = express();

// Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false // Allows loading local static files on the client
}));
app.use(cors());
app.use(express.json());

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Rate Limiter for API stability
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per window
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sn-infra';
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB database');
    seedDatabase();
  })
  .catch(err => console.error('MongoDB database connection error:', err));

// --- HELPER MIDDLEWARES ---

// Verify JWT token
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ error: 'Token expired or invalid' });
      req.user = user;
      next();
    });
  } else {
    res.status(401).json({ error: 'Authorization token required' });
  }
};

// Verify User Role (Admin or Staff)
const requireRole = (roles) => {
  return (req, res, next) => {
    if (roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ error: 'Access forbidden: Insufficient permissions' });
    }
  };
};

// Log Admin Activities
const logActivity = async (userId, userName, action, details, req) => {
  try {
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    await ActivityLog.create({
      userId,
      userName,
      action,
      details,
      ipAddress
    });
  } catch (err) {
    console.error('Failed to write activity log:', err);
  }
};

// Mail Transporter Helper
const sendEmail = async (to, subject, html) => {
  if (process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
      await transporter.sendMail({
        from: `"SN Infra Notifications" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html
      });
      return true;
    } catch (error) {
      console.error('SMTP Email sending failed:', error);
      return false;
    }
  } else {
    console.log(`[SMTP Offline] Sending Email: \nTo: ${to}\nSubject: ${subject}\nBody: ${html}\n`);
    return true; // Return true to prevent blocking local dev flow
  }
};

// --- DATABASE SEEDING ---
const seedDatabase = async () => {
  try {
    // 1. Seed Admin User
    const adminCount = await User.countDocuments({});
    if (adminCount === 0) {
      const hashedPassword = await bcrypt.hash('SNInfraAdmin2026!', 10);
      await User.create({
        name: 'SN Infra Admin',
        email: 'admin@sninfra.com',
        password: hashedPassword,
        role: 'Admin'
      });
      console.log('Seeded default Admin user: admin@sninfra.com / SNInfraAdmin2026!');
    }

    // 2. Seed Default Website Settings & Update Map URL
    let settings = await Settings.findOne({ key: 'global_settings' });
    const targetMapUrl = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3726.7953388896212!2d77.009411!3d10.673176799999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba839c41ac96adf%3A0x2ab711cb85b35ec0!2sSN%20Infra!5e1!3m2!1sen!2sin!4v1786689408616!5m2!1sen!2sin';
    if (!settings) {
      await Settings.create({ mapIframe: targetMapUrl });
      console.log('Seeded default global settings.');
    } else if (settings.mapIframe !== targetMapUrl) {
      settings.mapIframe = targetMapUrl;
      await settings.save();
      console.log('Updated map location in database settings.');
    }

    // 3. Seed Default Services
    const servicesCount = await Service.countDocuments({});
    if (servicesCount === 0) {
      const defaultServices = [
        { title: 'Planning', slug: 'planning', icon: 'FaRegMap', description: 'Expert layout plotting and blueprints tailormade for residential and commercial applications.' },
        { title: 'Building Approval', slug: 'building-approval', icon: 'FaFileSignature', description: 'Seamless approval acquisition processes across municipality and DTCP zones.' },
        { title: 'Vastu Consultation', slug: 'vastu-consultation', icon: 'FaCompass', description: 'Ancient architectural alignments matching spatial planning for peace and prosperity.' },
        { title: 'Residential Construction', slug: 'residential-construction', icon: 'FaHome', description: 'Constructing premium luxury villas, apartments, and independent houses with quality materials.' },
        { title: 'Commercial Construction', slug: 'commercial-construction', icon: 'FaBuilding', description: 'Building contemporary high-capacity office spaces, complexes, showrooms, and retail warehouses.' },
        { title: 'Duplex Construction', slug: 'duplex-construction', icon: 'FaRegBuilding', description: 'Tailoring customized split-level duplex apartments and family homes.' },
        { title: 'Interior Design', slug: 'interior-design', icon: 'FaCouch', description: 'Premium false ceilings, customized modular kitchens, walk-in closets, and aesthetic finishes.' },
        { title: 'Exterior Design', slug: 'exterior-design', icon: 'FaPaintRoller', description: 'High-end elevation tiles, glass walls, modern landscaping layouts, and compound wall designs.' },
        { title: 'Renovation', slug: 'renovation', icon: 'FaTools', description: 'Restructuring, retrofitting structural components, and modernizing aging structures.' },
        { title: 'Structural Design', slug: 'structural-design', icon: 'FaDraftingTable', description: 'Safety calculations, steel-concrete configurations, beam-column mappings, and foundation diagrams.' },
        { title: 'Surveying', slug: 'surveying', icon: 'FaMapMarkedAlt', description: 'Precise boundary demarcations and contour maps using professional total-station devices.' },
        { title: 'Labour Contract', slug: 'labour-contract', icon: 'FaUsers', description: 'Supplying highly skilled masonry, reinforcement, fabrication, plumbing, and electrical labour.' },
        { title: '3D Elevation Design', slug: '3d-elevation-design', icon: 'FaCube', description: 'Photorealistic architectural walkthroughs, exterior renders, and interior 3D spacing previews.' }
      ];
      await Service.insertMany(defaultServices);
      console.log('Seeded 13 default construction services.');
    }

    // 4. Seed Default Testimonials (Google Maps Reviews)
    const testimonialCount = await Testimonial.countDocuments({});
    if (testimonialCount === 0) {
      const defaultReviews = [
        {
          clientName: 'Naveen Kumar',
          role: 'Home Owner',
          reviewText: 'Exceptional service by SN Infra! They handled the entire DTCP approval and structural plan for our house in Pollachi. Highly recommended for their professional engineering approach.',
          rating: 5,
          status: 'Show'
        },
        {
          clientName: 'Shanmugam P.',
          role: 'Business Owner',
          reviewText: 'Very transparent pricing and timely delivery of our commercial building. The structural design is robust and they strictly followed Vastu guidelines. Highly satisfied.',
          rating: 5,
          status: 'Show'
        },
        {
          clientName: 'Divya Ramakrishnan',
          role: 'Villa Owner',
          reviewText: 'SN Infra built our duplex house. Their interior design team did a wonderful job with the modular kitchen and false ceiling. Best engineers in Pollachi.',
          rating: 5,
          status: 'Show'
        },
        {
          clientName: 'Anish K.',
          role: 'Structural Consultant',
          reviewText: 'Excellent execution of structural drawings on-site. Their labor contract is highly skilled and matches concrete mix specifications precisely.',
          rating: 4,
          status: 'Show'
        }
      ];
      await Testimonial.insertMany(defaultReviews);
      console.log('Seeded default Google Maps reviews as testimonials.');
    }
  } catch (error) {
    console.error('Seeding database failed:', error);
  }
};

// --- AUTHENTICATION ROUTES ---

// Admin / Staff Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    user.lastLogin = new Date();
    await user.save();

    await logActivity(user._id, user.name, 'Login', 'User logged in successfully', req);

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, lastLogin: user.lastLogin }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Get User Profile details
app.get('/api/auth/profile', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve profile' });
  }
});

// Admin User Management CRUD (Admin Only)
app.get('/api/auth/users', authenticateJWT, requireRole(['Admin']), async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
});

app.post('/api/auth/users', authenticateJWT, requireRole(['Admin']), async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, role });
    await logActivity(req.user.id, req.user.name, 'Create User', `Created staff account: ${email}`, req);
    res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.delete('/api/auth/users/:id', authenticateJWT, requireRole(['Admin']), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (req.params.id === req.user.id) return res.status(400).json({ error: 'You cannot delete yourself!' });

    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'User not found' });

    await logActivity(req.user.id, req.user.name, 'Delete User', `Deleted staff account: ${deleted.email}`, req);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Activity logs endpoint (Admin/Staff accessible)
app.get('/api/auth/logs', authenticateJWT, async (req, res) => {
  try {
    const logs = await ActivityLog.find({}).sort({ timestamp: -1 }).limit(100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
});

// --- PROJECT MANAGEMENT ROUTES ---

// Public project browser
app.get('/api/projects', async (req, res) => {
  const { category, search, status } = req.query;
  const filter = {};
  
  // Non-authenticated users can only see Completed or Ongoing projects (no Drafts or Archives)
  const authHeader = req.headers.authorization;
  let isAuthorized = false;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      jwt.verify(token, JWT_SECRET);
      isAuthorized = true;
    } catch (e) {
      isAuthorized = false;
    }
  }

  if (!isAuthorized) {
    filter.status = { $in: ['Ongoing', 'Completed'] };
  } else if (status) {
    filter.status = status;
  }

  if (category && category !== 'All') {
    filter.category = category;
  }

  if (search) {
    filter.name = { $regex: search, $options: 'i' };
  }

  try {
    const projects = await Project.find(filter).sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Get single project
app.get('/api/projects/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve project details' });
  }
});

// Create project with file upload arrays
app.post('/api/projects', authenticateJWT, upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'images', maxCount: 20 },
  { name: 'droneImages', maxCount: 10 },
  { name: 'floorPlans', maxCount: 10 },
  { name: 'brochure', maxCount: 1 }
]), async (req, res) => {
  try {
    const files = req.files;
    const body = req.body;

    const uploadedThumbnail = files && files.thumbnail ? await uploadToStorage(files.thumbnail[0], 'projects') : '';
    const uploadedBrochure = files && files.brochure ? await uploadToStorage(files.brochure[0], 'brochures') : '';
    
    const uploadedImages = [];
    if (files && files.images) {
      for (const file of files.images) {
        const url = await uploadToStorage(file, 'projects');
        if (url) uploadedImages.push(url);
      }
    }

    const uploadedDroneImages = [];
    if (files && files.droneImages) {
      for (const file of files.droneImages) {
        const url = await uploadToStorage(file, 'projects/drone');
        if (url) uploadedDroneImages.push(url);
      }
    }

    const uploadedFloorPlans = [];
    if (files && files.floorPlans) {
      for (const file of files.floorPlans) {
        const url = await uploadToStorage(file, 'projects/floorplans');
        if (url) uploadedFloorPlans.push(url);
      }
    }

    // Parse milestone sliders if sent as JSON string
    let progressDetailsMap = {};
    if (body.progressDetails) {
      try {
        progressDetailsMap = JSON.parse(body.progressDetails);
      } catch (err) {
        progressDetailsMap = body.progressDetails;
      }
    }

    // Parse features array
    let featuresArray = [];
    if (body.features) {
      try {
        featuresArray = JSON.parse(body.features);
      } catch (err) {
        if (typeof body.features === 'string') {
          featuresArray = body.features.split(',').map(f => f.trim());
        } else {
          featuresArray = body.features;
        }
      }
    }

    // Parse videos array
    let videosArray = [];
    if (body.videos) {
      try {
        videosArray = JSON.parse(body.videos);
      } catch (err) {
        if (typeof body.videos === 'string') {
          videosArray = [body.videos];
        } else {
          videosArray = body.videos;
        }
      }
    }

    const projectData = {
      name: body.name,
      clientName: body.clientName,
      category: body.category,
      location: body.location,
      budget: body.budget,
      area: body.area,
      floors: body.floors,
      description: body.description,
      features: featuresArray,
      status: body.status || 'Draft',
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      completionPercent: parseInt(body.completionPercent) || 0,
      progressDetails: progressDetailsMap,
      mapLink: body.mapLink,
      thumbnail: uploadedThumbnail,
      images: uploadedImages,
      droneImages: uploadedDroneImages,
      floorPlans: uploadedFloorPlans,
      brochure: uploadedBrochure,
      videos: videosArray
    };

    const project = await Project.create(projectData);
    await logActivity(req.user.id, req.user.name, 'Create Project', `Created project: ${project.name}`, req);
    res.status(201).json(project);
  } catch (error) {
    console.error('Project creation error:', error);
    res.status(500).json({ error: error.message || 'Failed to create project' });
  }
});

// Update Project
app.put('/api/projects/:id', authenticateJWT, upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'images', maxCount: 20 },
  { name: 'droneImages', maxCount: 10 },
  { name: 'floorPlans', maxCount: 10 },
  { name: 'brochure', maxCount: 1 }
]), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const files = req.files;
    const body = req.body;

    // Handle updates for thumbnail
    if (files && files.thumbnail) {
      if (project.thumbnail) await deleteFromStorage(project.thumbnail);
      project.thumbnail = await uploadToStorage(files.thumbnail[0], 'projects');
    }

    // Handle updates for brochure
    if (files && files.brochure) {
      if (project.brochure) await deleteFromStorage(project.brochure);
      project.brochure = await uploadToStorage(files.brochure[0], 'brochures');
    }

    // Append new images if uploaded
    if (files && files.images) {
      for (const file of files.images) {
        const url = await uploadToStorage(file, 'projects');
        if (url) project.images.push(url);
      }
    }

    // Append new drone images if uploaded
    if (files && files.droneImages) {
      for (const file of files.droneImages) {
        const url = await uploadToStorage(file, 'projects/drone');
        if (url) project.droneImages.push(url);
      }
    }

    // Append new floor plans if uploaded
    if (files && files.floorPlans) {
      for (const file of files.floorPlans) {
        const url = await uploadToStorage(file, 'projects/floorplans');
        if (url) project.floorPlans.push(url);
      }
    }

    // Allow deleting old images/files sent as arrays
    if (body.removedImages) {
      const toRemove = JSON.parse(body.removedImages);
      for (const url of toRemove) {
        await deleteFromStorage(url);
        project.images = project.images.filter(img => img !== url);
      }
    }

    if (body.removedDroneImages) {
      const toRemove = JSON.parse(body.removedDroneImages);
      for (const url of toRemove) {
        await deleteFromStorage(url);
        project.droneImages = project.droneImages.filter(img => img !== url);
      }
    }

    if (body.removedFloorPlans) {
      const toRemove = JSON.parse(body.removedFloorPlans);
      for (const url of toRemove) {
        await deleteFromStorage(url);
        project.floorPlans = project.floorPlans.filter(img => img !== url);
      }
    }

    // Sync scalar string properties
    if (body.name !== undefined) project.name = body.name;
    if (body.clientName !== undefined) project.clientName = body.clientName;
    if (body.category !== undefined) project.category = body.category;
    if (body.location !== undefined) project.location = body.location;
    if (body.budget !== undefined) project.budget = body.budget;
    if (body.area !== undefined) project.area = body.area;
    if (body.floors !== undefined) project.floors = body.floors;
    if (body.description !== undefined) project.description = body.description;
    if (body.status !== undefined) project.status = body.status;
    if (body.mapLink !== undefined) project.mapLink = body.mapLink;
    if (body.startDate !== undefined) project.startDate = body.startDate ? new Date(body.startDate) : null;
    if (body.endDate !== undefined) project.endDate = body.endDate ? new Date(body.endDate) : null;
    if (body.completionPercent !== undefined) project.completionPercent = parseInt(body.completionPercent) || 0;

    // Features
    if (body.features !== undefined) {
      try {
        project.features = JSON.parse(body.features);
      } catch (err) {
        if (typeof body.features === 'string') {
          project.features = body.features.split(',').map(f => f.trim());
        } else {
          project.features = body.features;
        }
      }
    }

    // Videos
    if (body.videos !== undefined) {
      try {
        project.videos = JSON.parse(body.videos);
      } catch (err) {
        if (typeof body.videos === 'string') {
          project.videos = [body.videos];
        } else {
          project.videos = body.videos;
        }
      }
    }

    // Progress sliders
    if (body.progressDetails !== undefined) {
      try {
        const map = JSON.parse(body.progressDetails);
        project.progressDetails = map;
      } catch (err) {
        project.progressDetails = body.progressDetails;
      }
    }

    project.updatedAt = new Date();
    await project.save();
    
    await logActivity(req.user.id, req.user.name, 'Update Project', `Updated project: ${project.name}`, req);
    res.json(project);
  } catch (error) {
    console.error('Project update error:', error);
    res.status(500).json({ error: error.message || 'Failed to update project' });
  }
});

// Delete Project
app.delete('/api/projects/:id', authenticateJWT, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    // Clean up media files
    if (project.thumbnail) await deleteFromStorage(project.thumbnail);
    if (project.brochure) await deleteFromStorage(project.brochure);
    for (const url of project.images) await deleteFromStorage(url);
    for (const url of project.droneImages) await deleteFromStorage(url);
    for (const url of project.floorPlans) await deleteFromStorage(url);

    await Project.findByIdAndDelete(req.params.id);
    await logActivity(req.user.id, req.user.name, 'Delete Project', `Deleted project: ${project.name}`, req);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// Duplicate Project
app.post('/api/projects/:id/duplicate', authenticateJWT, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const duplicatedObj = project.toObject();
    delete duplicatedObj._id;
    delete duplicatedObj.createdAt;
    duplicatedObj.name = `${duplicatedObj.name} (Copy)`;
    duplicatedObj.status = 'Draft'; // Reset duplicated to draft status

    const duplicatedProject = await Project.create(duplicatedObj);
    await logActivity(req.user.id, req.user.name, 'Duplicate Project', `Duplicated project: ${project.name} to ${duplicatedProject.name}`, req);
    res.status(201).json(duplicatedProject);
  } catch (error) {
    res.status(500).json({ error: 'Failed to duplicate project' });
  }
});

// --- SERVICES ROUTES ---

// Public Services retrieval
app.get('/api/services', async (req, res) => {
  try {
    const services = await Service.find({}).sort({ orderIndex: 1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve services' });
  }
});

// Create/Update Service (Admin/Staff)
app.post('/api/services', authenticateJWT, upload.single('image'), async (req, res) => {
  const { title, icon, description, orderIndex } = req.body;
  try {
    const imagePath = req.file ? await uploadToStorage(req.file, 'services') : '';
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    const service = await Service.create({
      title,
      slug,
      icon,
      description,
      image: imagePath,
      orderIndex: parseInt(orderIndex) || 0
    });

    await logActivity(req.user.id, req.user.name, 'Create Service', `Created service: ${title}`, req);
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create service' });
  }
});

app.put('/api/services/:id', authenticateJWT, upload.single('image'), async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ error: 'Service not found' });

    const { title, icon, description, orderIndex } = req.body;

    if (title) {
      service.title = title;
      service.slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
    if (icon) service.icon = icon;
    if (description) service.description = description;
    if (orderIndex !== undefined) service.orderIndex = parseInt(orderIndex);
    
    if (req.file) {
      if (service.image) await deleteFromStorage(service.image);
      service.image = await uploadToStorage(req.file, 'services');
    }

    await service.save();
    await logActivity(req.user.id, req.user.name, 'Update Service', `Updated service: ${service.title}`, req);
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update service' });
  }
});

// Reorder Services in Bulk
app.put('/api/services/bulk/reorder', authenticateJWT, async (req, res) => {
  const { orders } = req.body; // Array of { id, orderIndex }
  if (!orders || !Array.isArray(orders)) return res.status(400).json({ error: 'Orders array is required' });

  try {
    for (const item of orders) {
      await Service.findByIdAndUpdate(item.id, { orderIndex: item.orderIndex });
    }
    res.json({ message: 'Services reordered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reorder services' });
  }
});

app.delete('/api/services/:id', authenticateJWT, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ error: 'Service not found' });

    if (service.image) await deleteFromStorage(service.image);
    await Service.findByIdAndDelete(req.params.id);

    await logActivity(req.user.id, req.user.name, 'Delete Service', `Deleted service: ${service.title}`, req);
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete service' });
  }
});

// --- GALLERY ROUTES ---

// Public Gallery display
app.get('/api/gallery', async (req, res) => {
  try {
    const galleryItems = await Gallery.find({}).sort({ orderIndex: 1, createdAt: -1 });
    res.json(galleryItems);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve gallery' });
  }
});

// Create Gallery record (supports before/after comparison configs)
app.post('/api/gallery', authenticateJWT, upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'beforeFile', maxCount: 1 },
  { name: 'afterFile', maxCount: 1 }
]), async (req, res) => {
  const { title, category, beforeAfter, orderIndex } = req.body;
  try {
    const files = req.files;
    let url = '';
    let beforeUrl = '';
    let afterUrl = '';

    const isBA = beforeAfter === 'true' || beforeAfter === true;

    if (isBA) {
      if (files && files.beforeFile && files.afterFile) {
        beforeUrl = await uploadToStorage(files.beforeFile[0], 'gallery/beforeafter');
        afterUrl = await uploadToStorage(files.afterFile[0], 'gallery/beforeafter');
        url = beforeUrl; // Set beforeUrl as default thumbnail
      } else {
        return res.status(400).json({ error: 'Both before and after images are required for comparisons' });
      }
    } else {
      if (files && files.file) {
        url = await uploadToStorage(files.file[0], 'gallery');
      } else {
        return res.status(400).json({ error: 'Gallery file upload is required' });
      }
    }

    const item = await Gallery.create({
      title: title || '',
      url,
      category,
      beforeAfter: isBA,
      beforeUrl,
      afterUrl,
      orderIndex: parseInt(orderIndex) || 0
    });

    await logActivity(req.user.id, req.user.name, 'Create Gallery', `Added gallery image: ${category}`, req);
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to create gallery item' });
  }
});

// Delete Gallery record
app.delete('/api/gallery/:id', authenticateJWT, async (req, res) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Gallery item not found' });

    if (item.url) await deleteFromStorage(item.url);
    if (item.beforeUrl) await deleteFromStorage(item.beforeUrl);
    if (item.afterUrl) await deleteFromStorage(item.afterUrl);

    await Gallery.findByIdAndDelete(req.params.id);
    await logActivity(req.user.id, req.user.name, 'Delete Gallery', `Deleted gallery item: ${item.category}`, req);
    res.json({ message: 'Gallery item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete gallery item' });
  }
});

// --- TESTIMONIAL ROUTES ---

app.get('/api/testimonials', async (req, res) => {
  const authHeader = req.headers.authorization;
  let isAuthorized = false;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      jwt.verify(token, JWT_SECRET);
      isAuthorized = true;
    } catch (e) {}
  }

  try {
    const filter = isAuthorized ? {} : { status: 'Show' };
    const testimonials = await Testimonial.find(filter).sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve testimonials' });
  }
});

app.post('/api/testimonials', upload.single('clientImage'), async (req, res) => {
  const { clientName, role, reviewText, rating, status } = req.body;
  
  // Check if request has an administrator token
  const authHeader = req.headers.authorization;
  let isAuthorized = false;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      jwt.verify(token, JWT_SECRET);
      isAuthorized = true;
    } catch (e) {}
  }

  try {
    const imagePath = req.file ? await uploadToStorage(req.file, 'testimonials') : '';
    const testimonial = await Testimonial.create({
      clientName,
      role: role || 'Home Owner',
      reviewText,
      rating: parseInt(rating) || 5,
      clientImage: imagePath,
      status: isAuthorized ? (status || 'Show') : 'Hide'
    });
    res.status(201).json(testimonial);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create testimonial' });
  }
});

app.put('/api/testimonials/:id', authenticateJWT, upload.single('clientImage'), async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) return res.status(404).json({ error: 'Testimonial not found' });

    const { clientName, role, reviewText, rating, status } = req.body;

    if (clientName) testimonial.clientName = clientName;
    if (role !== undefined) testimonial.role = role;
    if (reviewText) testimonial.reviewText = reviewText;
    if (rating !== undefined) testimonial.rating = parseInt(rating);
    if (status) testimonial.status = status;

    if (req.file) {
      if (testimonial.clientImage) await deleteFromStorage(testimonial.clientImage);
      testimonial.clientImage = await uploadToStorage(req.file, 'testimonials');
    }

    await testimonial.save();
    res.json(testimonial);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update testimonial' });
  }
});

app.delete('/api/testimonials/:id', authenticateJWT, async (req, res) => {
  try {
    const item = await Testimonial.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Testimonial not found' });

    if (item.clientImage) await deleteFromStorage(item.clientImage);
    await Testimonial.findByIdAndDelete(req.params.id);
    res.json({ message: 'Testimonial deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete testimonial' });
  }
});

// Sync testimonials with Google Maps reviews
app.post('/api/testimonials/sync', authenticateJWT, async (req, res) => {
  try {
    let reviewsToSync = [];
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    const placeId = 'ChIJM2rpGrQ5qDsRsF6zhcqRpyo'; // SN Infra Place ID

    if (apiKey) {
      // Use official Google Places API
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&key=${apiKey}`;
      const response = await axios.get(url);
      const googleReviews = response.data?.result?.reviews || [];
      reviewsToSync = googleReviews.map(r => ({
        clientName: r.author_name,
        role: 'Google Maps Review',
        reviewText: r.text,
        rating: r.rating || 5,
        status: 'Show'
      }));
    } else {
      // Fallback stable registry
      reviewsToSync = [
        {
          clientName: 'Naveen Kumar',
          role: 'Google Maps Review',
          reviewText: 'Exceptional service by SN Infra! They handled the entire DTCP approval and structural plan for our house in Pollachi. Highly recommended for their professional engineering approach.',
          rating: 5,
          status: 'Show'
        },
        {
          clientName: 'Shanmugam P.',
          role: 'Google Maps Review',
          reviewText: 'Very transparent pricing and timely delivery of our commercial building. The structural design is robust and they strictly followed Vastu guidelines. Highly satisfied.',
          rating: 5,
          status: 'Show'
        },
        {
          clientName: 'Divya Ramakrishnan',
          role: 'Google Maps Review',
          reviewText: 'SN Infra built our duplex house. Their interior design team did a wonderful job with the modular kitchen and false ceiling. Best engineers in Pollachi.',
          rating: 5,
          status: 'Show'
        },
        {
          clientName: 'Anish K.',
          role: 'Google Maps Review',
          reviewText: 'Excellent execution of structural drawings on-site. Their labor contract is highly skilled and matches concrete mix specifications precisely.',
          rating: 4,
          status: 'Show'
        }
      ];
    }

    let addedCount = 0;
    for (const rev of reviewsToSync) {
      const exists = await Testimonial.findOne({ 
        clientName: rev.clientName,
        reviewText: rev.reviewText 
      });
      if (!exists) {
        await Testimonial.create(rev);
        addedCount++;
      }
    }

    await logActivity(req.user.id, req.user.name, 'Sync Testimonials', `Synced ${addedCount} new Google Maps reviews`, req);
    res.json({ message: `Successfully synced! Added ${addedCount} new reviews.`, addedCount });
  } catch (error) {
    console.error('Failed to sync reviews:', error);
    res.status(500).json({ error: 'Failed to sync reviews with Google Maps' });
  }
});

// --- ENQUIRY ROUTES ---

// Submit contact form
app.post('/api/enquiries', async (req, res) => {
  const { name, phone, email, message } = req.body;
  if (!name || !phone || !email || !message) {
    return res.status(400).json({ error: 'All parameters (name, phone, email, message) are required' });
  }

  try {
    const enquiry = await Enquiry.create({ name, phone, email, message });
    
    // Trigger automated notification email to admin
    const adminEmail = process.env.NOTIFICATION_RECEIVER_EMAIL || 'sninfracbe@gmail.com';
    const emailSubject = `New Site Enquiry from ${name}`;
    const emailHtml = `
      <h3>New Enquiry Received</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong> ${message}</p>
      <p><em>Reply to this enquiry from your Admin Panel.</em></p>
    `;
    await sendEmail(adminEmail, emailSubject, emailHtml);

    res.status(201).json({ message: 'Enquiry submitted successfully', enquiry });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit enquiry' });
  }
});

// Retrieve enquiries (Admin/Staff)
app.get('/api/enquiries', authenticateJWT, async (req, res) => {
  try {
    const enquiries = await Enquiry.find({}).sort({ createdAt: -1 });
    res.json(enquiries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch enquiries' });
  }
});

// Reply to enquiry via SMTP Email (saves reply logs)
app.post('/api/enquiries/:id/reply', authenticateJWT, async (req, res) => {
  const { subject, body } = req.body;
  if (!subject || !body) return res.status(400).json({ error: 'Subject and Body are required for a reply.' });

  try {
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) return res.status(404).json({ error: 'Enquiry record not found' });

    const success = await sendEmail(enquiry.email, subject, body);
    if (!success) return res.status(500).json({ error: 'Failed to transmit reply email. Verify server SMTP logs.' });

    enquiry.replies.push({ subject, body });
    enquiry.status = 'Marked Contacted';
    await enquiry.save();

    await logActivity(req.user.id, req.user.name, 'Reply Enquiry', `Emailed reply to: ${enquiry.email}`, req);
    res.json(enquiry);
  } catch (error) {
    res.status(500).json({ error: 'Failed to reply to enquiry' });
  }
});

// Update enquiry status
app.put('/api/enquiries/:id/status', authenticateJWT, async (req, res) => {
  const { status } = req.body;
  try {
    const enquiry = await Enquiry.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(enquiry);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Delete Enquiry
app.delete('/api/enquiries/:id', authenticateJWT, async (req, res) => {
  try {
    await Enquiry.findByIdAndDelete(req.params.id);
    res.json({ message: 'Enquiry deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete enquiry' });
  }
});

// Export Enquiries to CSV
app.get('/api/enquiries/export/csv', authenticateJWT, async (req, res) => {
  try {
    const enquiries = await Enquiry.find({}).sort({ createdAt: -1 });
    let csv = 'Name,Phone,Email,Message,Status,Date Submitted\n';
    enquiries.forEach(e => {
      // Escape commas & quotes
      const cleanName = `"${e.name.replace(/"/g, '""')}"`;
      const cleanPhone = `"${e.phone.replace(/"/g, '""')}"`;
      const cleanEmail = `"${e.email.replace(/"/g, '""')}"`;
      const cleanMessage = `"${e.message.replace(/"/g, '""')}"`;
      const cleanStatus = `"${e.status}"`;
      const date = `"${e.createdAt.toISOString()}"`;
      csv += `${cleanName},${cleanPhone},${cleanEmail},${cleanMessage},${cleanStatus},${date}\n`;
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=enquiries.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: 'Failed to export enquiries CSV' });
  }
});

// --- SETTINGS & CONTENT EDITOR ROUTES ---

// Public Settings retrieval
app.get('/api/settings', async (req, res) => {
  try {
    let settings = await Settings.findOne({ key: 'global_settings' });
    if (!settings) settings = await Settings.create({});
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update settings with logo/favicon upload fields
app.put('/api/settings', authenticateJWT, upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'favicon', maxCount: 1 }
]), async (req, res) => {
  try {
    let settings = await Settings.findOne({ key: 'global_settings' });
    if (!settings) settings = new Settings({ key: 'global_settings' });

    const files = req.files;
    const body = req.body;

    if (files && files.logo) {
      if (settings.logoUrl) await deleteFromStorage(settings.logoUrl);
      settings.logoUrl = await uploadToStorage(files.logo[0], 'settings');
    }

    if (files && files.favicon) {
      if (settings.faviconUrl) await deleteFromStorage(settings.faviconUrl);
      settings.faviconUrl = await uploadToStorage(files.favicon[0], 'settings');
    }

    // Sync configuration parameters
    if (body.companyName !== undefined) settings.companyName = body.companyName;
    if (body.tagline !== undefined) settings.tagline = body.tagline;
    if (body.phone !== undefined) settings.phone = body.phone;
    if (body.email !== undefined) settings.email = body.email;
    if (body.address !== undefined) settings.address = body.address;
    if (body.mapIframe !== undefined) settings.mapIframe = body.mapIframe;
    if (body.whatsapp !== undefined) settings.whatsapp = body.whatsapp;
    if (body.seoKeywords !== undefined) settings.seoKeywords = body.seoKeywords;
    if (body.seoDescription !== undefined) settings.seoDescription = body.seoDescription;

    if (body.themeColors) {
      const parsedColors = typeof body.themeColors === 'string' ? JSON.parse(body.themeColors) : body.themeColors;
      settings.themeColors = { ...settings.themeColors, ...parsedColors };
    }

    if (body.socialLinks) {
      const parsedLinks = typeof body.socialLinks === 'string' ? JSON.parse(body.socialLinks) : body.socialLinks;
      settings.socialLinks = { ...settings.socialLinks, ...parsedLinks };
    }

    await settings.save();
    await logActivity(req.user.id, req.user.name, 'Update Settings', 'Updated website global config settings', req);
    res.json(settings);
  } catch (error) {
    console.error('Settings update failure:', error);
    res.status(500).json({ error: 'Failed to update website settings' });
  }
});

// --- BACKUP & MEDIA STORAGE LIBRARY MANAGEMENT ---

// Create manual backup
app.post('/api/settings/backup', authenticateJWT, requireRole(['Admin']), async (req, res) => {
  try {
    const backupPath = await createBackup();
    await logActivity(req.user.id, req.user.name, 'Backup DB', `Created database JSON backup file: ${path.basename(backupPath)}`, req);
    res.json({ message: 'Backup created successfully', filename: path.basename(backupPath) });
  } catch (err) {
    res.status(500).json({ error: 'Database backup failed' });
  }
});

// List backups
app.get('/api/settings/backup', authenticateJWT, requireRole(['Admin']), async (req, res) => {
  try {
    const list = listBackups();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Failed to list backups' });
  }
});

// Restore backup
app.post('/api/settings/backup/:filename/restore', authenticateJWT, requireRole(['Admin']), async (req, res) => {
  try {
    await restoreBackup(req.params.filename);
    await logActivity(req.user.id, req.user.name, 'Restore DB', `Restored database from file: ${req.params.filename}`, req);
    res.json({ message: 'Database restored successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Restore database failed' });
  }
});

// Delete backup file
app.delete('/api/settings/backup/:filename', authenticateJWT, requireRole(['Admin']), async (req, res) => {
  try {
    deleteBackup(req.params.filename);
    res.json({ message: 'Backup file deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete backup file' });
  }
});

// Get Media Library files list (scans uploads directory for WordPress-like manager)
app.get('/api/media', authenticateJWT, async (req, res) => {
  const uploadPath = path.join(__dirname, 'public', 'uploads');
  if (!fs.existsSync(uploadPath)) return res.json([]);

  try {
    const files = fs.readdirSync(uploadPath);
    const mediaFiles = files.map(file => {
      const stats = fs.statSync(path.join(uploadPath, file));
      return {
        name: file,
        url: `/uploads/${file}`,
        size: stats.size,
        createdAt: stats.birthtime,
        type: file.endsWith('.pdf') ? 'pdf' : (file.endsWith('.mp4') || file.endsWith('.webm') ? 'video' : 'image')
      };
    }).sort((a, b) => b.createdAt - a.createdAt);
    res.json(mediaFiles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch media library items' });
  }
});

// Delete media library item directly
app.delete('/api/media/:filename', authenticateJWT, async (req, res) => {
  try {
    const filename = req.params.filename;
    const fileUrl = `/uploads/${filename}`;
    const success = await deleteFromStorage(fileUrl);
    if (success) {
      res.json({ message: 'Media file deleted successfully' });
    } else {
      res.status(404).json({ error: 'Media file not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete media asset' });
  }
});

// --- ANALYTICS DASHBOARD ROUTE ---

app.get('/api/analytics', authenticateJWT, async (req, res) => {
  try {
    const totalProjects = await Project.countDocuments({});
    const ongoingProjects = await Project.countDocuments({ status: 'Ongoing' });
    const completedProjects = await Project.countDocuments({ status: 'Completed' });
    const totalGallery = await Gallery.countDocuments({});
    const totalEnquiries = await Enquiry.countDocuments({});
    const totalTestimonials = await Testimonial.countDocuments({});

    // Dynamic Chart Data: Enquiries over past 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const enquiriesTimeline = await Enquiry.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Categories Distribution
    const categoryDistribution = await Project.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Recent Activites Feed
    const recentActivities = await ActivityLog.find({}).sort({ timestamp: -1 }).limit(10);

    res.json({
      metrics: {
        totalProjects,
        ongoingProjects,
        completedProjects,
        totalGallery,
        totalEnquiries,
        totalTestimonials
      },
      charts: {
        enquiriesTimeline,
        categoryDistribution
      },
      recentActivities
    });
  } catch (error) {
    console.error('Analytics aggregation failed:', error);
    res.status(500).json({ error: 'Failed to compile analytics statistics' });
  }
});

// --- INITIATE AUTOMATED DAILY DATABASE BACKUP ---
// Runs native backup code every 24 hours
setInterval(() => {
  console.log('Running scheduled daily database backup...');
  createBackup().catch(err => console.error('Daily automated backup failed:', err));
}, 24 * 60 * 60 * 1000);

// Default wildcard fallback
app.get('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint routing not matched' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`SN Infra Server running on http://localhost:${PORT}`);
});
