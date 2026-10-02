import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import { 
  FaImages, FaFolderOpen, FaWrench, 
  FaInbox, FaSpinner, FaClipboardList, FaUserShield 
} from 'react-icons/fa';
import { Line, Doughnut } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  ArcElement, 
  Title, 
  Tooltip, 
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  ArcElement, 
  Title, 
  Tooltip, 
  Legend,
  Filler
);

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get('/api/analytics');
      setData(res.data);
    } catch (err) {
      console.error('Failed to retrieve dashboard analytics:', err);
      // Fallback local mocks
      setData({
        metrics: {
          totalGallery: 12,
          totalCategories: 4,
          totalServices: 13,
          totalEnquiries: 45
        },
        recentActivities: [
          { userName: 'SN Infra Admin', action: 'System Seeding', details: 'Initialized 13 default services', timestamp: new Date().toISOString() },
          { userName: 'SN Infra Admin', action: 'Setup Settings', details: 'Configured global theme guidelines', timestamp: new Date().toISOString() }
        ],
        charts: {
          enquiriesTimeline: [
            { _id: { year: 2026, month: 2 }, count: 5 },
            { _id: { year: 2026, month: 3 }, count: 12 },
            { _id: { year: 2026, month: 4 }, count: 18 },
            { _id: { year: 2026, month: 5 }, count: 24 },
            { _id: { year: 2026, month: 6 }, count: 19 },
            { _id: { year: 2026, month: 7 }, count: 32 }
          ],
          categoryDistribution: [
            { _id: 'Building', count: 6 },
            { _id: 'Interiors', count: 4 },
            { _id: 'Elevation', count: 3 },
            { _id: 'Ongoing Sites', count: 2 }
          ]
        }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center flex-col gap-4">
        <FaSpinner size={32} className="animate-spin text-secondary" />
        <p className="text-sm text-slate-500">Compiling Analytics charts...</p>
      </div>
    );
  }

  // --- CHART CONFIGURATIONS ---

  // 1. Enquiries Timeline (Line Chart)
  const timelineLabels = data?.charts?.enquiriesTimeline?.map(item => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[item._id.month - 1]} ${item._id.year}`;
  }) || [];
  
  const timelineCounts = data?.charts?.enquiriesTimeline?.map(item => item.count) || [];

  const lineChartData = {
    labels: timelineLabels.length > 0 ? timelineLabels : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        fill: true,
        label: 'Contact Enquiries Received',
        data: timelineCounts.length > 0 ? timelineCounts : [5, 10, 15, 22, 18, 30],
        borderColor: '#1C68F5',
        backgroundColor: 'rgba(28, 104, 245, 0.08)',
        tension: 0.4,
      }
    ]
  };

  // 2. Gallery Categories Distribution (Doughnut Chart)
  const categoryLabels = data?.charts?.categoryDistribution?.map(item => item._id) || [];
  const categoryCounts = data?.charts?.categoryDistribution?.map(item => item.count) || [];

  const doughnutChartData = {
    labels: categoryLabels.length > 0 ? categoryLabels : ['Building', 'Interiors', 'Elevation', 'Ongoing Sites'],
    datasets: [
      {
        label: 'Photos',
        data: categoryCounts.length > 0 ? categoryCounts : [6, 4, 3, 2],
        backgroundColor: [
          '#1C68F5', // Royal Blue
          '#FFC100', // Gold/Amber
          '#00C897', // Emerald
          '#8B5CF6', // Purple
          '#EC4899', // Pink
          '#64748B'  // Slate grey
        ],
        borderWidth: 1,
      }
    ]
  };

  const currentMetrics = data?.metrics || { totalGallery: 0, totalCategories: 0, totalServices: 0, totalEnquiries: 0 };

  return (
    <AdminLayout>
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white leading-none mb-2">
            Analytics Overview
          </h1>
          <p className="text-slate-400 text-xs">
            Monitor media gallery assets, contact requests, and company operations in real time.
          </p>
        </div>
      </div>

      {/* METRIC ROW WIDGETS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Gallery Photos */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/35 p-6 rounded-3xl flex items-center justify-between shadow-sm text-left">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-2 block">Gallery Photos</span>
            <span className="text-2xl font-black text-slate-800 dark:text-white leading-none">{currentMetrics.totalGallery}</span>
          </div>
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shrink-0">
            <FaImages size={18} />
          </div>
        </div>

        {/* Gallery Categories */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/35 p-6 rounded-3xl flex items-center justify-between shadow-sm text-left">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-2 block">Categories</span>
            <span className="text-2xl font-black text-slate-800 dark:text-white leading-none">{currentMetrics.totalCategories}</span>
          </div>
          <div className="w-12 h-12 bg-amber-500/10 text-[#FFC100] rounded-2xl flex items-center justify-center shrink-0">
            <FaFolderOpen size={18} />
          </div>
        </div>

        {/* Core Services */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/35 p-6 rounded-3xl flex items-center justify-between shadow-sm text-left">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-2 block">Core Services</span>
            <span className="text-2xl font-black text-slate-800 dark:text-white leading-none">{currentMetrics.totalServices}</span>
          </div>
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center shrink-0">
            <FaWrench size={18} />
          </div>
        </div>

        {/* Enquiries */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/35 p-6 rounded-3xl flex items-center justify-between shadow-sm text-left">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-2 block">Enquiries</span>
            <span className="text-2xl font-black text-slate-800 dark:text-white leading-none">{currentMetrics.totalEnquiries}</span>
          </div>
          <div className="w-12 h-12 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center shrink-0">
            <FaInbox size={18} />
          </div>
        </div>
      </div>

      {/* CHART ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Enquiry Timeline */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/35 p-6 rounded-3xl shadow-sm text-left flex flex-col justify-between">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-6">Monthly Enquiries Trend</h3>
          <div className="w-full h-64">
            <Line data={lineChartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>

        {/* Gallery Categories */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/35 p-6 rounded-3xl shadow-sm text-left flex flex-col justify-between">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-6">Gallery by Category</h3>
          <div className="w-full h-56 flex items-center justify-center">
            <Doughnut data={doughnutChartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITIES & ACTIONS LOG */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/35 p-6 rounded-3xl shadow-sm text-left">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
          <FaClipboardList /> Recent Activity Feed Logs
        </h3>
        
        <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto">
          {data?.recentActivities?.map((log, idx) => (
            <div key={idx} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-250/20 dark:border-slate-800/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary/15 text-secondary flex items-center justify-center shrink-0">
                  <FaUserShield size={14} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white leading-tight">
                    {log.userName} • <span className="text-secondary">{log.action}</span>
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-1">{log.details}</p>
                </div>
              </div>
              <span className="text-[9px] text-slate-400 shrink-0 font-medium font-mono">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
          {(!data?.recentActivities || data.recentActivities.length === 0) && (
            <p className="text-xs text-slate-400 text-center py-6">No recent logs recorded.</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
