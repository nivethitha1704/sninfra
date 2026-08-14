import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  User, Project, Service, Gallery, 
  Testimonial, Enquiry, Settings, ActivityLog 
} from './models.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backupDir = path.join(__dirname, 'backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

/**
 * Creates a complete database backup by exporting all collections to a single JSON file.
 * @returns {Promise<string>} The path to the created backup file
 */
export const createBackup = async () => {
  try {
    const backupData = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      collections: {
        users: await User.find({}),
        projects: await Project.find({}),
        services: await Service.find({}),
        gallery: await Gallery.find({}),
        testimonials: await Testimonial.find({}),
        enquiries: await Enquiry.find({}),
        settings: await Settings.find({}),
        activityLogs: await ActivityLog.find({})
      }
    };

    const dateString = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${dateString}.json`;
    const filepath = path.join(backupDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2), 'utf-8');
    console.log(`Database backup created successfully: ${filepath}`);
    return filepath;
  } catch (error) {
    console.error('Backup creation failed:', error);
    throw error;
  }
};

/**
 * Lists all available backup files.
 * @returns {Array<Object>} List of backups with metadata
 */
export const listBackups = () => {
  if (!fs.existsSync(backupDir)) return [];

  const files = fs.readdirSync(backupDir);
  return files
    .filter(file => file.startsWith('backup-') && file.endsWith('.json'))
    .map(file => {
      const filepath = path.join(backupDir, file);
      const stats = fs.statSync(filepath);
      return {
        filename: file,
        path: filepath,
        size: stats.size,
        createdAt: stats.birthtime
      };
    })
    .sort((a, b) => b.createdAt - a.createdAt);
};

/**
 * Restores the database from a backup file.
 * @param {string} filename - The name of the backup file to restore from
 * @returns {Promise<boolean>}
 */
export const restoreBackup = async (filename) => {
  const filepath = path.join(backupDir, filename);
  if (!fs.existsSync(filepath)) {
    throw new Error(`Backup file ${filename} not found.`);
  }

  try {
    const rawData = fs.readFileSync(filepath, 'utf-8');
    const backupData = JSON.parse(rawData);

    const { collections } = backupData;
    if (!collections) {
      throw new Error('Invalid backup file structure.');
    }

    // Restore users
    if (collections.users) {
      await User.deleteMany({});
      await User.insertMany(collections.users);
    }

    // Restore projects
    if (collections.projects) {
      await Project.deleteMany({});
      await Project.insertMany(collections.projects);
    }

    // Restore services
    if (collections.services) {
      await Service.deleteMany({});
      await Service.insertMany(collections.services);
    }

    // Restore gallery
    if (collections.gallery) {
      await Gallery.deleteMany({});
      await Gallery.insertMany(collections.gallery);
    }

    // Restore testimonials
    if (collections.testimonials) {
      await Testimonial.deleteMany({});
      await Testimonial.insertMany(collections.testimonials);
    }

    // Restore enquiries
    if (collections.enquiries) {
      await Enquiry.deleteMany({});
      await Enquiry.insertMany(collections.enquiries);
    }

    // Restore settings
    if (collections.settings) {
      await Settings.deleteMany({});
      await Settings.insertMany(collections.settings);
    }

    // Restore activityLogs
    if (collections.activityLogs) {
      await ActivityLog.deleteMany({});
      await ActivityLog.insertMany(collections.activityLogs);
    }

    console.log(`Database successfully restored from: ${filepath}`);
    return true;
  } catch (error) {
    console.error('Backup restoration failed:', error);
    throw error;
  }
};

/**
 * Deletes a backup file.
 * @param {string} filename 
 * @returns {boolean}
 */
export const deleteBackup = (filename) => {
  const filepath = path.join(backupDir, filename);
  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);
    return true;
  }
  return false;
};
