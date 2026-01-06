import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Upload, X, Shield, CheckCircle, AlertCircle, Loader2, Image as ImageIcon } from 'lucide-react';

const AdminDashboard = () => {
  const [message, setMessage] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [isUploading, setIsUploading] = useState(false);

  // Handle File Selection & Preview
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // Remove Selected Image
  const clearImage = () => {
    setImage(null);
    setPreview(null);
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', msg: '' });
    setIsUploading(true);

    const token = localStorage.getItem('token');
    
    if (!token) {
      setStatus({ type: 'error', msg: 'You are not logged in.' });
      setIsUploading(false);
      return;
    }

    // Prepare FormData for Image Upload
    const formData = new FormData();
    formData.append('message', message);
    if (image) {
      formData.append('image', image);
    }

    try {
      // ✅ FIX: Send Token in Headers
      await axios.post(
        'https://void-server-6.onrender.com/api/notifications', 
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`, 
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setStatus({ type: 'success', msg: 'Notification posted successfully!' });
      setMessage('');
      clearImage();
      
    } catch (error) {
      console.error("Upload Error:", error);
      
      if (error.response && error.response.status === 403) {
        setStatus({ type: 'error', msg: '⛔ Permission Denied: You are not an Admin.' });
      } else {
        setStatus({ type: 'error', msg: 'Upload Failed. Server might be sleeping.' });
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-6 flex items-center justify-center relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08),transparent_70%)]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative z-10"
      >
        {/* Header */}
        <div className="bg-white/5 p-6 border-b border-white/10 flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
            <Shield size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Admin Console</h2>
            <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">System Notification Uplink</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Message Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Announcement Message</label>
            <textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              placeholder="Type your system announcement..."
              className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-4 text-sm focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all resize-none placeholder:text-slate-700"
            />
          </div>

          {/* Image Upload Area */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Attachment (Image)</label>
            
            {!preview ? (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-indigo-500/30 hover:bg-white/5 transition-all group">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                  <p className="text-xs text-slate-500">Click to upload image</p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
            ) : (
              <div className="relative w-full h-48 bg-black rounded-xl overflow-hidden group border border-white/10">
                <img src={preview} alt="Preview" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                <button 
                  type="button"
                  onClick={clearImage}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-500/80 text-white rounded-full backdrop-blur-sm transition-all"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Status Messages */}
          {status.msg && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl flex items-center gap-3 text-sm ${
                status.type === 'error' 
                  ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                  : 'bg-green-500/10 text-green-400 border border-green-500/20'
              }`}
            >
              {status.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
              <span>{status.msg}</span>
            </motion.div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isUploading}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>UPLOADING...</span>
              </>
            ) : (
              <>
                <span>BROADCAST MESSAGE</span>
                <Upload size={18} />
              </>
            )}
          </button>

        </form>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
