import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import { 
  FaMailBulk, FaTrash, FaCheck, FaTimes, 
  FaPaperPlane, FaDownload, FaSpinner, FaHistory 
} from 'react-icons/fa';

const EnquiryManager = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  
  // Email Reply dialog
  const [replySubject, setReplySubject] = useState('');
  const [replyBody, setReplyBody] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null);

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/enquiries');
      setEnquiries(res.data);
    } catch (err) {
      console.error('Failed to load enquiries inbox:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const handleToggleContacted = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'Marked Contacted' ? 'New' : 'Marked Contacted';
    try {
      await axios.put(`/api/enquiries/${id}/status`, { status: nextStatus });
      fetchEnquiries();
    } catch (err) {
      alert('Failed to update contacted status.');
    }
  };

  const handleDeleteEnquiry = async (id) => {
    if (!window.confirm('Delete this contact message permanently?')) return;
    try {
      await axios.delete(`/api/enquiries/${id}`);
      fetchEnquiries();
    } catch (err) {
      alert('Delete enquiry failed.');
    }
  };

  const handleOpenReplyForm = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setReplySubject(`Re: SN Infra Inquiry Response`);
    setReplyBody(`Hi ${enquiry.name},\n\nThank you for reaching out to SN Infra regarding your project. We reviewed your notes:\n"${enquiry.message}"\n\n[Write your response details here]\n\nBest Regards,\nSN Infra Team\n+91 84385 68318\nsninfracbe@gmail.com`);
    setEmailStatus(null);
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    setSendingEmail(true);
    setEmailStatus(null);

    try {
      await axios.post(`/api/enquiries/${selectedEnquiry._id}/reply`, {
        subject: replySubject,
        body: replyBody
      });
      setEmailStatus({ success: 'Email response transmitted successfully!' });
      setTimeout(() => {
        setSelectedEnquiry(null);
        fetchEnquiries();
      }, 1500);
    } catch (err) {
      setEmailStatus({ error: 'Failed to send email. Check server SMTP configurations.' });
    } finally {
      setSendingEmail(false);
    }
  };

  const handleExportCSV = () => {
    // Triggers direct browser attachment download from backend route
    window.open('/api/enquiries/export/csv', '_blank');
  };

  return (
    <AdminLayout>
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center text-left">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white leading-none mb-2">Enquiries Inbox</h1>
          <p className="text-slate-400 text-xs">Review site proposals, log emailed responses, and download spreadsheets.</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="bg-accent hover:bg-accent-light text-white font-bold text-xs px-5 py-3 rounded-xl shadow flex items-center gap-2"
        >
          <FaDownload /> Export to Excel (CSV)
        </button>
      </div>

      {loading && !selectedEnquiry ? (
        <div className="text-center py-20">
          <FaSpinner className="animate-spin text-secondary mx-auto" size={32} />
          <p className="text-xs text-slate-400 mt-3">Fetching enquiries logs...</p>
        </div>
      ) : (
        
        // INBOX LISTING
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/35 rounded-3xl overflow-hidden shadow-sm text-left">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 text-slate-400 text-[10px] uppercase font-bold tracking-widest border-b border-slate-150/40 dark:border-slate-800/40">
                  <th className="p-5">Submitter Details</th>
                  <th className="p-5">Message Notes</th>
                  <th className="p-5">Status</th>
                  <th className="p-5">Reply Log</th>
                  <th className="p-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {enquiries.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20">
                    <td className="p-5">
                      <h4 className="font-bold text-slate-800 dark:text-white leading-none mb-1.5">{item.name}</h4>
                      <p className="text-[10px] text-slate-400 font-mono mb-1">{item.phone}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{item.email}</p>
                    </td>
                    <td className="p-5 text-slate-500 max-w-xs truncate italic">
                      "{item.message}"
                    </td>
                    <td className="p-5">
                      <span className={`px-2.5 py-1 rounded-md text-[9px] uppercase tracking-widest font-extrabold ${
                        item.status === 'Marked Contacted' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500 animate-pulse'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-5">
                      {item.replies && item.replies.length > 0 ? (
                        <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                          <FaHistory /> {item.replies.length} email(s) sent
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">No replies yet</span>
                      )}
                    </td>
                    <td className="p-5 text-right flex justify-end gap-2 mt-1">
                      <button
                        onClick={() => handleToggleContacted(item._id, item.status)}
                        className={`p-2.5 rounded-lg border transition-colors ${
                          item.status === 'Marked Contacted'
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/25'
                            : 'bg-slate-50 hover:bg-slate-200 dark:bg-slate-950 text-slate-400 border-transparent'
                        }`}
                        title="Mark Contacted / Unread"
                      >
                        <FaCheck size={12} />
                      </button>
                      <button
                        onClick={() => handleOpenReplyForm(item)}
                        className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350"
                        title="Reply via Email"
                      >
                        <FaMailBulk size={12} />
                      </button>
                      <button
                        onClick={() => handleDeleteEnquiry(item._id)}
                        className="p-2.5 rounded-lg bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500"
                        title="Delete Enquiry"
                      >
                        <FaTrash size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
                {enquiries.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center p-10 text-slate-400 font-semibold">
                      Inbox is empty. No enquiries submitted.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      )}

      {/* EMAIL REPLY POPUP FORM MODAL */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl w-full max-w-2xl border border-slate-200/50 dark:border-slate-800/30 flex flex-col text-left">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800/50 flex justify-between items-center bg-slate-50 dark:bg-slate-900/40 rounded-t-3xl">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <FaMailBulk /> Reply to {selectedEnquiry.name}
              </h3>
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white bg-slate-100 dark:bg-slate-900"
              >
                <FaTimes size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSendReply} className="p-6 flex flex-col gap-5">
              
              {/* Recipient Details */}
              <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border text-xs text-slate-500 dark:text-slate-400 leading-relaxed flex flex-col gap-1">
                <p><strong>To:</strong> {selectedEnquiry.name} &lt;{selectedEnquiry.email}&gt;</p>
                <p><strong>User Notes:</strong> "{selectedEnquiry.message}"</p>
              </div>

              {/* Subject */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Subject</label>
                <input
                  type="text"
                  value={replySubject}
                  onChange={(e) => setReplySubject(e.target.value)}
                  className="p-3 bg-slate-50 dark:bg-slate-950 text-xs rounded-xl outline-none border border-transparent dark:border-slate-800"
                  required
                />
              </div>

              {/* Body */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Response Body</label>
                <textarea
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  rows={8}
                  className="p-3.5 bg-slate-50 dark:bg-slate-950 text-xs rounded-xl outline-none border border-transparent dark:border-slate-800 resize-none font-mono"
                  required
                />
              </div>

              {emailStatus && (
                <div className={`p-4 rounded-xl text-xs font-semibold ${
                  emailStatus.success ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                }`}>
                  {emailStatus.success || emailStatus.error}
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setSelectedEnquiry(null)}
                  className="px-5 py-3 bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-350 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingEmail}
                  className="px-5 py-3 bg-secondary hover:bg-secondary-light text-white font-bold text-xs rounded-xl shadow flex items-center gap-2"
                >
                  <FaPaperPlane size={11} />
                  {sendingEmail ? 'Transmitting email...' : 'Send Response'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </AdminLayout>
  );
};

export default EnquiryManager;
