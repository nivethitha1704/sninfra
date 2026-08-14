import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import { useForm } from 'react-hook-form';
import { useSettings } from '../../context/SettingsContext';
import logoImg from '../../logo.png';
import { 
  FaSave, FaDatabase, FaFolderMinus, FaUserPlus, 
  FaTrash, FaFileInvoice, FaSpinner, FaHistory, FaCheckCircle 
} from 'react-icons/fa';

const SettingsManager = () => {
  const { fetchSettings } = useSettings();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'theme', 'backups', 'staff'
  const [settings, setSettings] = useState(null);
  
  // File uploads
  const [logoFile, setLogoFile] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);

  // Backup files list
  const [backupsList, setBackupsList] = useState([]);
  const [backingUp, setBackingUp] = useState(false);
  const [restoringFilename, setRestoringFilename] = useState(null);

  // Staff users list
  const [staffUsers, setStaffUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Forms
  const { register: regSettings, handleSubmit: handleSettingsSubmit, reset: resetSettingsForm } = useForm();
  const { register: regStaff, handleSubmit: handleStaffSubmit, reset: resetStaffForm } = useForm();

  const loadData = async () => {
    setLoading(true);
    try {
      const [settingsRes, backupsRes, usersRes] = await Promise.all([
        axios.get('/api/settings'),
        axios.get('/api/settings/backup'),
        axios.get('/api/auth/users')
      ]);

      setSettings(settingsRes.data);
      setBackupsList(backupsRes.data);
      setStaffUsers(usersRes.data);

      // Prefill fields
      resetSettingsForm({
        companyName: settingsRes.data.companyName,
        tagline: settingsRes.data.tagline,
        phone: settingsRes.data.phone,
        email: settingsRes.data.email,
        address: settingsRes.data.address,
        mapIframe: settingsRes.data.mapIframe,
        whatsapp: settingsRes.data.whatsapp,
        seoKeywords: settingsRes.data.seoKeywords,
        seoDescription: settingsRes.data.seoDescription,
        primaryColor: settingsRes.data.themeColors?.primary || '#0F4C81',
        secondaryColor: settingsRes.data.themeColors?.secondary || '#FF8C00',
        accentColor: settingsRes.data.themeColors?.accent || '#00C897',
        facebook: settingsRes.data.socialLinks?.facebook || '',
        instagram: settingsRes.data.socialLinks?.instagram || '',
        youtube: settingsRes.data.socialLinks?.youtube || '',
        linkedin: settingsRes.data.socialLinks?.linkedin || ''
      });

    } catch (err) {
      console.error('Failed to retrieve settings data configurations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Save Settings Submit
  const onSettingsSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('companyName', data.companyName);
      formData.append('tagline', data.tagline);
      formData.append('phone', data.phone);
      formData.append('email', data.email);
      formData.append('address', data.address);
      formData.append('mapIframe', data.mapIframe);
      formData.append('whatsapp', data.whatsapp);
      formData.append('seoKeywords', data.seoKeywords);
      formData.append('seoDescription', data.seoDescription);

      // Colors object
      const colors = {
        primary: data.primaryColor,
        secondary: data.secondaryColor,
        accent: data.accentColor
      };
      formData.append('themeColors', JSON.stringify(colors));

      // Social links object
      const socials = {
        facebook: data.facebook,
        instagram: data.instagram,
        youtube: data.youtube,
        linkedin: data.linkedin
      };
      formData.append('socialLinks', JSON.stringify(socials));

      if (logoFile) formData.append('logo', logoFile);
      if (faviconFile) formData.append('favicon', faviconFile);

      await axios.put('/api/settings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('Global configuration changes successfully applied!');
      fetchSettings(); // Sync client style layers immediately
      loadData();
    } catch (err) {
      alert('Failed to save settings details.');
    } finally {
      setLoading(false);
    }
  };

  // Create Staff account
  const onStaffSubmit = async (data) => {
    try {
      await axios.post('/api/auth/users', data);
      alert('Staff user registered successfully.');
      resetStaffForm();
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Staff user registration failed.');
    }
  };

  const handleDeleteStaff = async (id) => {
    if (!window.confirm('Delete this account permanently?')) return;
    try {
      await axios.delete(`/api/auth/users/${id}`);
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Deletion failed.');
    }
  };

  // Backups tasks
  const handleTriggerBackup = async () => {
    setBackingUp(true);
    try {
      await axios.post('/api/settings/backup');
      alert('Manual backup successfully compiled!');
      loadData();
    } catch (err) {
      alert('Database backup failed.');
    } finally {
      setBackingUp(false);
    }
  };

  const handleRestoreBackup = async (filename) => {
    if (!window.confirm(`Warning: Restoring from ${filename} will overwrite ALL current database rows. Proceed?`)) return;
    setRestoringFilename(filename);
    try {
      await axios.post(`/api/settings/backup/${filename}/restore`);
      alert('Database restore successfully completed! Refreshing page...');
      window.location.reload();
    } catch (err) {
      alert('Database restore failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setRestoringFilename(null);
    }
  };

  const handleDeleteBackup = async (filename) => {
    if (!window.confirm(`Delete backup file ${filename} permanently?`)) return;
    try {
      await axios.delete(`/api/settings/backup/${filename}`);
      loadData();
    } catch (err) {
      alert('Delete backup failed.');
    }
  };

  return (
    <AdminLayout>
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center text-left">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white leading-none mb-2">Global Settings</h1>
          <p className="text-slate-400 text-xs">Configure company profiles, theme color pickers, and database backups.</p>
        </div>
      </div>

      {loading && backupsList.length === 0 ? (
        <div className="text-center py-20">
          <FaSpinner className="animate-spin text-secondary mx-auto" size={32} />
          <p className="text-xs text-slate-400 mt-3">Compiling global settings profile...</p>
        </div>
      ) : (

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
          
          {/* Settings Tabs menu (left grid) */}
          <div className="lg:col-span-3 flex flex-row lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0">
            <button
              onClick={() => setActiveTab('profile')}
              className={`p-4 rounded-2xl text-xs font-bold text-left shrink-0 transition-all ${
                activeTab === 'profile' 
                  ? 'bg-slate-900 text-white shadow-md' 
                  : 'bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-200/50'
              }`}
            >
              Company Profile & Brand
            </button>
            <button
              onClick={() => setActiveTab('theme')}
              className={`p-4 rounded-2xl text-xs font-bold text-left shrink-0 transition-all ${
                activeTab === 'theme' 
                  ? 'bg-slate-900 text-white shadow-md' 
                  : 'bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-200/50'
              }`}
            >
              Styling & Brand Identity
            </button>
            <button
              onClick={() => setActiveTab('backups')}
              className={`p-4 rounded-2xl text-xs font-bold text-left shrink-0 transition-all ${
                activeTab === 'backups' 
                  ? 'bg-slate-900 text-white shadow-md' 
                  : 'bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-200/50'
              }`}
            >
              System Database Backups
            </button>
            <button
              onClick={() => setActiveTab('staff')}
              className={`p-4 rounded-2xl text-xs font-bold text-left shrink-0 transition-all ${
                activeTab === 'staff' 
                  ? 'bg-slate-900 text-white shadow-md' 
                  : 'bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-200/50'
              }`}
            >
              CMS Staff Management
            </button>
          </div>

          {/* Settings Tab Workspaces (right grid) */}
          <div className="lg:col-span-9 w-full">
            
            {/* 1. PROFILE DETAILS FORM */}
            {activeTab === 'profile' && (
              <form onSubmit={handleSettingsSubmit(onSettingsSubmit)} className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/35 p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col gap-6">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white pb-3 border-b">Company profile</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Company Name</label>
                    <input type="text" className="p-3 bg-slate-50 dark:bg-slate-950 text-xs rounded-xl outline-none" {...regSettings('companyName')} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">WhatsApp Number</label>
                    <input type="text" className="p-3 bg-slate-50 dark:bg-slate-950 text-xs rounded-xl outline-none" {...regSettings('whatsapp')} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone Direct Dial</label>
                    <input type="text" className="p-3 bg-slate-50 dark:bg-slate-950 text-xs rounded-xl outline-none" {...regSettings('phone')} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                    <input type="email" className="p-3 bg-slate-50 dark:bg-slate-950 text-xs rounded-xl outline-none" {...regSettings('email')} />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tagline</label>
                  <input type="text" className="p-3 bg-slate-50 dark:bg-slate-950 text-xs rounded-xl outline-none" {...regSettings('tagline')} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Postal Address</label>
                  <input type="text" className="p-3 bg-slate-50 dark:bg-slate-950 text-xs rounded-xl outline-none" {...regSettings('address')} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Google Maps Iframe source link</label>
                  <input type="text" className="p-3 bg-slate-50 dark:bg-slate-950 text-xs rounded-xl outline-none" {...regSettings('mapIframe')} />
                </div>

                {/* Media assets logo / favicon */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-100 pt-6">
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Company Logo Image</span>
                    <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files[0])} className="text-xs" />
                    {settings?.logoUrl ? (
                      <img src={settings.logoUrl} alt="Logo preview" className="h-10 w-auto object-contain mt-2 self-start" />
                    ) : (
                      <div className="flex flex-col gap-1 mt-2">
                        <img src={logoImg} alt="Default logo" className="h-10 w-auto object-contain self-start opacity-70" />
                        <span className="text-[9px] text-slate-400 italic">Default logo (src/logo.png)</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Favicon File (SVG/ICO)</span>
                    <input type="file" accept="image/*" onChange={(e) => setFaviconFile(e.target.files[0])} className="text-xs" />
                  </div>
                </div>

                <div className="flex justify-end border-t pt-6">
                  <button type="submit" className="bg-primary hover:bg-primary-light text-white text-xs font-bold px-6 py-3.5 rounded-xl shadow flex items-center gap-2">
                    <FaSave /> Save Profile Settings
                  </button>
                </div>
              </form>
            )}

            {/* 2. BRAND STYLE COLOR THEMES & SEO CONFIG */}
            {activeTab === 'theme' && (
              <form onSubmit={handleSettingsSubmit(onSettingsSubmit)} className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/35 p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col gap-6">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white pb-3 border-b">Brand Styling & Color Palette</h3>
                
                {/* Brand Colors Pickers */}
                <div className="grid grid-cols-3 gap-6">
                  <div className="flex flex-col items-center gap-2 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Primary Color</span>
                    <input type="color" className="w-12 h-10 cursor-pointer border-none rounded bg-transparent" {...regSettings('primaryColor')} />
                  </div>
                  <div className="flex flex-col items-center gap-2 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Secondary (Orange)</span>
                    <input type="color" className="w-12 h-10 cursor-pointer border-none rounded bg-transparent" {...regSettings('secondaryColor')} />
                  </div>
                  <div className="flex flex-col items-center gap-2 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Accent (Emerald)</span>
                    <input type="color" className="w-12 h-10 cursor-pointer border-none rounded bg-transparent" {...regSettings('accentColor')} />
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-800 dark:text-white pb-3 border-b mt-6">Social Links Metadata</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Facebook URL</label>
                    <input type="text" className="p-3 bg-slate-50 dark:bg-slate-950 text-xs rounded-xl outline-none" {...regSettings('facebook')} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Instagram URL</label>
                    <input type="text" className="p-3 bg-slate-50 dark:bg-slate-950 text-xs rounded-xl outline-none" {...regSettings('instagram')} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">YouTube Channel URL</label>
                    <input type="text" className="p-3 bg-slate-50 dark:bg-slate-950 text-xs rounded-xl outline-none" {...regSettings('youtube')} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">LinkedIn URL</label>
                    <input type="text" className="p-3 bg-slate-50 dark:bg-slate-950 text-xs rounded-xl outline-none" {...regSettings('linkedin')} />
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-800 dark:text-white pb-3 border-b mt-6">SEO Engine Optimizations</h3>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Search Keywords (Comma Separated)</label>
                  <input type="text" className="p-3 bg-slate-50 dark:bg-slate-950 text-xs rounded-xl outline-none" {...regSettings('seoKeywords')} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SEO Meta Description</label>
                  <textarea rows={3} className="p-3 bg-slate-50 dark:bg-slate-950 text-xs rounded-xl outline-none resize-none" {...regSettings('seoDescription')} />
                </div>

                <div className="flex justify-end border-t pt-6">
                  <button type="submit" className="bg-primary hover:bg-primary-light text-white text-xs font-bold px-6 py-3.5 rounded-xl shadow flex items-center gap-2">
                    <FaSave /> Save Theme & SEO Guidelines
                  </button>
                </div>
              </form>
            )}

            {/* 3. SYSTEM DATABASE BACKUP RESTORE */}
            {activeTab === 'backups' && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/35 p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col gap-6">
                <div className="flex justify-between items-center pb-3 border-b">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">Database Backup & Recovery</h3>
                  <button
                    onClick={handleTriggerBackup}
                    disabled={backingUp}
                    className="bg-secondary hover:bg-secondary-light text-white text-[10px] font-bold py-2.5 px-4 rounded-xl shadow flex items-center gap-2"
                  >
                    <FaDatabase />
                    {backingUp ? 'Compiling JSON...' : 'Create Manual Backup'}
                  </button>
                </div>

                <div className="bg-blue-500/5 rounded-2xl border border-blue-500/10 p-4 text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed flex gap-2">
                  <span>ℹ</span>
                  <span>
                    The server automatically compiles and saves full database backups to the <strong>server/backups/</strong> folder every 24 hours. You can also trigger manual exports or revert the system to a previous state below.
                  </span>
                </div>

                {/* Backups Files List */}
                <div className="flex flex-col gap-3">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <FaHistory /> Saved Backups List
                  </h4>

                  <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
                    {backupsList.map((file) => (
                      <div key={file.filename} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border text-xs">
                        <div className="text-left">
                          <h5 className="font-bold text-slate-800 dark:text-white mb-1 leading-none">{file.filename}</h5>
                          <span className="text-[9px] text-slate-400">Size: {(file.size / 1024).toFixed(1)} KB • Saved: {new Date(file.createdAt).toLocaleString()}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRestoreBackup(file.filename)}
                            disabled={restoringFilename !== null}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white text-[9px] font-bold py-1.5 px-3 rounded-lg"
                          >
                            {restoringFilename === file.filename ? 'Reverting...' : 'Restore'}
                          </button>
                          <button
                            onClick={() => handleDeleteBackup(file.filename)}
                            className="bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 p-2 rounded-lg"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                    {backupsList.length === 0 && (
                      <p className="text-xs text-slate-400 text-center py-6">No saved backups found on server.</p>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* 4. CMS STAFF USER CRUD */}
            {activeTab === 'staff' && (
              <div className="flex flex-col gap-6">
                {/* Staff list */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/35 p-6 rounded-3xl shadow-sm text-left">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white pb-3 border-b mb-6">CMS Staff Directory</h3>
                  
                  <div className="flex flex-col gap-3">
                    {staffUsers.map((user) => (
                      <div key={user._id} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border text-xs">
                        <div className="text-left">
                          <h4 className="font-bold text-slate-800 dark:text-white leading-none mb-1.5">{user.name}</h4>
                          <p className="text-[10px] text-slate-400 font-mono mb-1">{user.email}</p>
                          <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[9px] uppercase tracking-wider font-extrabold">{user.role}</span>
                        </div>
                        
                        <button
                          onClick={() => handleDeleteStaff(user._id)}
                          className="bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 p-2.5 rounded-xl border border-red-500/20"
                          title="Delete Account"
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add new staff form */}
                <form onSubmit={handleStaffSubmit(onStaffSubmit)} className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/35 p-6 sm:p-8 rounded-3xl shadow-sm text-left flex flex-col gap-5">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white pb-3 border-b">Register Staff Account</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Name</label>
                      <input type="text" placeholder="John staff" className="p-3 bg-slate-50 dark:bg-slate-950 text-xs rounded-xl outline-none" {...regStaff('name', { required: true })} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                      <input type="email" placeholder="staff@sninfra.com" className="p-3 bg-slate-50 dark:bg-slate-950 text-xs rounded-xl outline-none" {...regStaff('email', { required: true })} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Access Role</label>
                      <select className="p-3 bg-slate-50 dark:bg-slate-950 text-xs rounded-xl outline-none" {...regStaff('role', { required: true })}>
                        <option value="Staff">Staff (Cannot modify global settings/backups)</option>
                        <option value="Admin">Admin (Full Control)</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Password</label>
                      <input type="password" placeholder="••••••••••••" className="p-3 bg-slate-50 dark:bg-slate-950 text-xs rounded-xl outline-none" {...regStaff('password', { required: true })} />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button type="submit" className="bg-primary hover:bg-primary-light text-white text-xs font-bold px-6 py-3.5 rounded-xl shadow flex items-center gap-2">
                      <FaUserPlus /> Register User Account
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>

        </div>
      )}

    </AdminLayout>
  );
};

export default SettingsManager;
