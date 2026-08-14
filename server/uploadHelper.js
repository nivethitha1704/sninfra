import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure local upload directories exist
const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage config (stores files locally first)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File validation filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif', 
    'video/mp4', 'video/webm', 'video/ogg',
    'application/pdf'
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, WEBP, GIF, MP4, WEBM, OGG and PDF are allowed.'), false);
  }
};

// Multer instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max file size (useful for videos/brochures)
  }
});

// Configure Cloudinary if credentials are present
const isCloudinaryConfigured = () => {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

/**
 * Uploads a file (either locally saved by Multer or direct stream) to Cloudinary or returns local path
 * @param {Object} file - The file object from req.file or req.files
 * @param {string} folder - The folder name on Cloudinary
 * @returns {Promise<string>} The file URL (Cloudinary or relative local URL)
 */
export const uploadToStorage = async (file, folder = 'sninfra') => {
  if (!file) return null;

  if (isCloudinaryConfigured()) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: folder,
        resource_type: file.mimetype.startsWith('video/') ? 'video' : file.mimetype === 'application/pdf' ? 'raw' : 'image'
      });
      // Delete local temporary file
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      return result.secure_url;
    } catch (error) {
      console.error('Cloudinary Upload Failed, using local fallback:', error);
      // Fallback to serving the local file that was saved by multer
      return `/uploads/${path.basename(file.path)}`;
    }
  } else {
    // Return relative URL for locally stored file
    return `/uploads/${path.basename(file.path)}`;
  }
};

/**
 * Deletes a file from Cloudinary (using public_id) or local path
 * @param {string} fileUrl - The full image URL
 * @returns {Promise<boolean>}
 */
export const deleteFromStorage = async (fileUrl) => {
  if (!fileUrl) return false;

  if (fileUrl.startsWith('/uploads/')) {
    const localPath = path.join(uploadDir, path.basename(fileUrl));
    if (fs.existsSync(localPath)) {
      try {
        fs.unlinkSync(localPath);
        return true;
      } catch (err) {
        console.error('Failed to delete local file:', err);
        return false;
      }
    }
  } else if (fileUrl.includes('cloudinary.com')) {
    try {
      // Parse public_id from Cloudinary URL
      // e.g. https://res.cloudinary.com/cloudname/image/upload/v12345/folder/filename.jpg
      const urlParts = fileUrl.split('/');
      const uploadIndex = urlParts.indexOf('upload');
      if (uploadIndex !== -1 && uploadIndex + 2 < urlParts.length) {
        // join remaining path parts after version number
        const pathParts = urlParts.slice(uploadIndex + 2);
        const fileName = pathParts.join('/');
        const publicId = fileName.substring(0, fileName.lastIndexOf('.'));
        
        let resourceType = 'image';
        if (fileUrl.includes('/video/')) resourceType = 'video';
        if (fileUrl.includes('/raw/')) resourceType = 'raw';

        await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
        return true;
      }
    } catch (error) {
      console.error('Cloudinary Delete Failed:', error);
      return false;
    }
  }
  return false;
};
