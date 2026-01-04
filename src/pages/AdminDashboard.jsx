import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Send, Image as ImageIcon, MessageSquare, Loader2, CheckCircle } from 'lucide-react';

function AdminDashboard() {
  const [message, setMessage] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Handle Image Selection & Preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // Remove Image
  const removeImage = () => {
    setImage(null);
    setPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message || !image) {
      alert("Please provide both a message and an image.");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('message', message);
    formData.append('image', image);

    const token = localStorage.getItem('token');
    
    try {
      // Ensure port matches your backend
      await axios.post('http://localhost:10000/api/notifications', formData, {
        headers: { 
          'Authorization': token,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Success Animation Trigger
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setMessage('');
        removeImage();
      }, 3000);

    } catch (err) {
      console.error(err);
      alert('Upload failed. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-900 text-white p-6 md:p-12">
      
      {/* Dashboard Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto mb-10"
      >
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Dashboard</span>
        </h1>
        <p className="text-slate-400 mt-2">Manage global announcements and push notifications.</p>
      </motion.div>

      {/* Main Form Card */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Col: The Form */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-2"
        >
          <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            
            {/* Success Overlay */}
            <AnimatePresence>
              {success && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-slate-800/95 z-20 flex flex-col items-center justify-center text-center"
                >
                  <motion.div 
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1.2 }} 
                    className="text-green-400 mb-4"
                  >
                    <CheckCircle size={64} />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-white">Published!</h3>
                  <p className="text-slate-400">Your notification is now live.</p>
                </motion.div>
              )}
            </AnimatePresence>

            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <span className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400"><Send size={20}/></span>
              Create New Notification
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Message Input */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Announcement Text</label>
                <div className="relative">
                  <MessageSquare className="absolute top-3 left-3 text-slate-500" size={18} />
                  <textarea 
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="What's new today?" 
                    rows="3"
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-slate-200 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all outline-none resize-none"
                  />
                </div>
              </div>

              {/* Image Upload Area */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Featured Image</label>
                
                {!preview ? (
                  /* Upload Placeholder */
                  <div className="relative border-2 border-dashed border-slate-700 bg-slate-900/30 hover:bg-slate-900/50 rounded-xl p-8 transition-colors group text-center cursor-pointer">
                    <input 
                      type="file" 
                      onChange={handleImageChange} 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex flex-col items-center justify-center text-slate-500 group-hover:text-cyan-400 transition-colors">
                      <div className="p-3 bg-slate-800 rounded-full mb-3 group-hover:scale-110 transition-transform">
                        <Upload size={24} />
                      </div>
                      <p className="font-medium">Click to upload or drag and drop</p>
                      <p className="text-xs text-slate-600 mt-1">SVG, PNG, JPG (Max 800x400px)</p>
                    </div>
                  </div>
                ) : (
                  /* Image Preview */
                  <div className="relative rounded-xl overflow-hidden border border-slate-700 group">
                    <img src={preview} alt="Preview" className="w-full h-64 object-cover" />
                    <button 
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-red-500 text-white rounded-full backdrop-blur-sm transition-colors"
                    >
                      <X size={16} />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      <p className="text-xs text-white font-mono truncate">{image.name}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-end gap-4">
                <button 
                  type="button"
                  onClick={() => { setMessage(''); removeImage(); }}
                  className="px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
                >
                  Clear
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-lg hover:shadow-cyan-500/25 text-white px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                  {isLoading ? 'Publishing...' : 'Publish Now'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>

        {/* Right Col: Mini Preview / Stats (Optional UI Filler) */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Quick Info Card */}
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
            <h3 className="text-slate-300 font-semibold mb-4 flex items-center gap-2">
              <ImageIcon size={18} /> Live Preview
            </h3>
            <div className="text-sm text-slate-500">
              <p className="mb-4">This is how your post will look on the user home feed.</p>
              
              {/* Mini Skeleton of a Card */}
              <div className="bg-slate-900/80 rounded-lg p-3 border border-slate-700/50 opacity-80 pointer-events-none">
                <div className="h-24 bg-slate-800 rounded-md mb-3 overflow-hidden">
                  {preview && <img src={preview} className="w-full h-full object-cover" alt="" />}
                </div>
                <div className="h-2 w-3/4 bg-slate-700 rounded mb-2"></div>
                <div className="h-2 w-1/2 bg-slate-700 rounded"></div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <h4 className="text-blue-400 text-sm font-bold mb-1">Pro Tip</h4>
            <p className="text-blue-300/70 text-xs">
              High-quality images (16:9 ratio) get 40% more engagement from users.
            </p>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

export default AdminDashboard;