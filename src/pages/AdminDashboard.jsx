import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, Users, Bell, Trash2, 
  LogOut, X, Upload, CheckCircle, 
  AlertCircle, Loader2, Image as ImageIcon 
} from 'lucide-react';

// --- CONFIGURATION ---
// 🔴 CHANGED: Connected to Live Render Server
const API_URL = 'https://void-server-6.onrender.com/api'; 

function AdminDashboard() {
  // --- STATE: Dashboard Data ---
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- STATE: Notification Form ---
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState(''); 
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' });

  // --- AUTH HELPER ---
  const getAuthHeaders = (isMultipart = false) => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    if (isMultipart) {
      headers['Content-Type'] = 'multipart/form-data';
    }
    return { headers };
  };

  // --- INITIALIZATION ---
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const usersRes = await axios.get(`${API_URL}/admin/users`, getAuthHeaders());
      setUsers(usersRes.data);

      const notifRes = await axios.get(`${API_URL}/notifications`, getAuthHeaders());
      setNotifications(notifRes.data);
    } catch (err) {
      console.error("Fetch Error:", err);
      // Only redirect if explicitly denied, otherwise might just be server waking up
      if (err.response && (err.response.status === 403 || err.response.status === 401)) {
        alert("⛔ Session Expired.");
        window.location.href = '/login';
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- HANDLER: File Selection ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setImage(null);
    setPreview(null);
  };

  // --- HANDLER: Create Notification (With Image) ---
  const handleCreateNotification = async (e) => {
    e.preventDefault();
    setStatus({ type: '', msg: '' });
    setIsUploading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('message', message);
    if (image) {
      formData.append('image', image);
    }

    try {
      const res = await axios.post(
        `${API_URL}/notifications`, 
        formData, 
        getAuthHeaders(true) // true = multipart
      );
      
      setNotifications([res.data, ...notifications]);
      setStatus({ type: 'success', msg: 'Broadcast sent successfully!' });
      
      // Reset Form
      setMessage('');
      setTitle('');
      clearImage();
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', msg: 'Upload Failed: ' + (err.response?.data?.message || "Server might be waking up...") });
    } finally {
      setIsUploading(false);
    }
  };

  // --- HANDLER: Delete Actions ---
  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Permanently delete this user?")) return;
    try {
      await axios.delete(`${API_URL}/admin/users/${userId}`, getAuthHeaders());
      setUsers(users.filter(u => u._id !== userId));
    } catch (err) { alert("Failed to delete user."); }
  };

  const handleDeleteNotification = async (id) => {
    if (!window.confirm("Remove this alert?")) return;
    try {
      await axios.delete(`${API_URL}/notifications/${id}`, getAuthHeaders());
      setNotifications(notifications.filter(n => n._id !== id));
    } catch (err) { alert("Failed to delete notification."); }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-6 md:p-12 font-sans relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.1),transparent_50%)]" />

      {/* Header */}
      <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end mb-12 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-red-400 font-mono text-xs tracking-widest uppercase mb-2">
            <ShieldAlert size={14} />
            <span>Admin Control Center</span>
          </div>
          <h1 className="text-4xl font-bold text-white">System <span className="text-indigo-500">Dashboard</span></h1>
        </div>
        <button 
          onClick={() => { localStorage.removeItem('token'); window.location.href='/login'; }}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
        >
          <LogOut size={16} /> <span>Logout</span>
        </button>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: User Management */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="text-indigo-500" /> User Database
                <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded-full">{users.length} Active</span>
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs font-mono text-slate-500 border-b border-white/10">
                    <th className="p-3">ID / EMAIL</th>
                    <th className="p-3">ROLE</th>
                    <th className="p-3 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {users.map(user => (
                    <tr key={user._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-3">
                        <div className="text-white">{user.email}</div>
                        <div className="text-[10px] font-mono text-slate-600">{user._id}</div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide ${user.role === 'admin' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button 
                          onClick={() => handleDeleteUser(user._id)}
                          className="p-2 hover:bg-red-500/20 text-slate-500 hover:text-red-400 rounded transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && !isLoading && <div className="text-center py-10 text-slate-500">No users found.</div>}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Notifications (With Image Upload) */}
        <div className="space-y-8">
          
          {/* Create Notification Form */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 shadow-xl">
             <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
                <Bell className="text-yellow-500" /> Broadcast
             </h2>
             
             <form onSubmit={handleCreateNotification} className="space-y-4">
                {/* Title Input */}
                <input 
                  type="text" 
                  placeholder="Subject / Title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 outline-none transition-colors"
                  required
                />
                
                {/* Message Input */}
                <textarea 
                  placeholder="Message content..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 outline-none transition-colors h-24 resize-none"
                  required
                />

                {/* Image Upload Area */}
                <div className="space-y-2">
                  {!preview ? (
                    <label className="flex flex-col items-center justify-center w-full h-24 border border-dashed border-white/10 rounded-xl cursor-pointer hover:border-indigo-500/30 hover:bg-white/5 transition-all group">
                      <div className="flex flex-col items-center justify-center pt-2 pb-3">
                        <Upload className="w-6 h-6 mb-1 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">Attach Image</p>
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </label>
                  ) : (
                    <div className="relative w-full h-32 bg-black rounded-xl overflow-hidden group border border-white/10">
                      <img src={preview} alt="Preview" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                      <button 
                        type="button"
                        onClick={clearImage}
                        className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-red-500/80 text-white rounded-full backdrop-blur-sm transition-all"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Status Messages */}
                {status.msg && (
                   <motion.div 
                     initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                     className={`p-3 rounded-lg flex items-center gap-2 text-xs ${
                       status.type === 'error' ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'
                     }`}
                   >
                     {status.type === 'error' ? <AlertCircle size={14} /> : <CheckCircle size={14} />}
                     <span>{status.msg}</span>
                   </motion.div>
                )}

                {/* Submit Button */}
                <button 
                  type="submit" 
                  disabled={isUploading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg transition-all flex justify-center items-center gap-2 disabled:opacity-50"
                >
                  {isUploading ? <Loader2 className="animate-spin" size={18} /> : "SEND BROADCAST"}
                </button>
             </form>
          </div>

          {/* Active Notifications List */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 shadow-xl">
             <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Active Alerts</h3>
             <div className="space-y-3">
                {notifications.map(note => (
                  <div key={note._id} className="group relative bg-white/5 border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors">
                     <button 
                        onClick={() => handleDeleteNotification(note._id)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 text-red-400 rounded transition-all"
                     >
                        <X size={14} />
                     </button>
                     
                     {/* Show Image Thumbnail if exists */}
                     {note.image && (
                        <div className="mb-3 rounded-lg overflow-hidden h-32 border border-white/5">
                            <img src={note.image} alt="Attachment" className="w-full h-full object-cover" />
                        </div>
                     )}

                     <h4 className="font-bold text-white text-sm mb-1">{note.title}</h4>
                     <p className="text-xs text-slate-400 leading-relaxed">{note.message}</p>
                  </div>
                ))}
                {notifications.length === 0 && <p className="text-xs text-slate-600 italic">No active system alerts.</p>}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
