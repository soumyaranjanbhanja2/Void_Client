import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Copy, Loader2, FileText, 
  Trash2, Edit, LogOut, Hash 
} from 'lucide-react';

// --- CONFIGURATION ---
// 🔄 REVERTED: Pointing back to local server
const API_URL = 'https://void-server-6.onrender.com'; 

// --- ANIMATIONS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const cardVariants = {
  hidden: { y: 20, opacity: 0, scale: 0.95 },
  visible: { y: 0, opacity: 1, scale: 1 }
};

function UserNotes() {
  const [notes, setNotes] = useState([]);
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // --- AUTH HELPER ---
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  // --- ERROR HANDLER ---
  const handleApiError = (error) => {
    console.error("API Action Failed:", error);
    if (error.response && (error.response.status === 403 || error.response.status === 401)) {
      if(window.confirm("Session expired. Log out?")) {
          localStorage.removeItem('token');
          window.location.href = '/login';
      }
    } else {
      alert("Server Error. Ensure your localhost backend is running.");
    }
  };

  // --- INITIALIZATION ---
  useEffect(() => {
    fetchNotes();
  }, []);

  // --- CORE FUNCTIONS ---

  // 1. Fetch Notes
  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return; 
      }
      const res = await axios.get(`${API_URL}/notes`, getAuthHeaders());
      setNotes(res.data);
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Create Note
  const handleSaveNote = async () => {
    if (!content.trim()) return;
    
    try {
      const res = await axios.post(`${API_URL}/notes`, { content }, getAuthHeaders());
      setNotes([res.data, ...notes]); 
      setContent('');
    } catch (err) {
      handleApiError(err);
    }
  };

  // 3. Delete Note
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this note?")) return;
    try {
      await axios.delete(`${API_URL}/notes/${id}`, getAuthHeaders());
      setNotes(notes.filter(n => n._id !== id));
    } catch (err) {
      handleApiError(err);
    }
  };

  // 4. Edit Note
  const handleEdit = async (note) => {
    const newContent = prompt("Edit Note:", note.content);
    if (newContent === null || newContent === note.content) return;

    try {
      const res = await axios.put(`${API_URL}/notes/${note._id}`, { content: newContent }, getAuthHeaders());
      setNotes(notes.map(n => (n._id === note._id ? res.data : n)));
    } catch (err) {
      handleApiError(err);
    }
  };

  // --- UI ACTIONS ---
  const handleLogout = () => {
      localStorage.removeItem('token');
      window.location.href = '/login';
  };

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('en-US', { 
        month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'
    }).format(new Date(dateString));
  };

  // --- RENDER ---
  return (
    <div className="min-h-screen w-full bg-[#020617] text-slate-200 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.15),transparent_50%)] z-0" />
      
      <div className="relative z-10 max-w-6xl mx-auto p-6 md:p-12">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4"
        >
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs tracking-widest uppercase mb-2">
              <span>Local Development Mode</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
              My <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Notes</span>
            </h1>
          </div>
          
          <button 
              onClick={handleLogout} 
              className="p-2 bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-full transition-colors border border-white/5"
              title="Logout"
          >
              <LogOut size={18} />
          </button>
        </motion.div>

        {/* Simple Input Area (No Voice/AI) */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative max-w-4xl mx-auto mb-20 group"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl opacity-20 blur" />
          
          <div className="relative bg-[#0A0A0A] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write a new note here..."
              className="w-full bg-transparent text-lg text-slate-200 p-6 min-h-[120px] outline-none resize-none placeholder:text-slate-600 font-sans leading-relaxed"
            />

            <div className="px-4 py-4 bg-black/20 backdrop-blur-sm border-t border-white/5 flex items-center justify-end">
              <button 
                onClick={handleSaveNote}
                disabled={!content}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-500 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>SAVE NOTE</span>
                <Send size={14} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Data Grid */}
        {isLoading ? (
             <div className="flex flex-col items-center justify-center py-20 text-indigo-500/50">
                <Loader2 size={40} className="animate-spin mb-4" />
                <span className="font-mono text-xs tracking-widest animate-pulse">LOADING NOTES...</span>
             </div>
        ) : notes.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-32 border border-dashed border-white/10 rounded-3xl bg-white/5 opacity-50">
                <FileText size={48} className="mb-4 text-slate-500" />
                <p className="font-mono text-slate-500">NO NOTES FOUND</p>
             </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {notes.map((note) => (
                <motion.div
                  key={note._id}
                  variants={cardVariants}
                  layout
                  className="group relative h-full"
                >
                  <div className="relative h-full bg-[#0C0C0C] border border-white/10 rounded-2xl p-6 hover:-translate-y-1 transition-transform duration-300 shadow-xl flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-indigo-400">
                            <FileText size={16} />
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                            <Hash size={10} />
                            <span>{formatDate(note.createdAt || Date.now())}</span>
                        </div>
                    </div>

                    <div className="mb-6 flex-grow">
                        <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line font-light">
                            {note.content}
                        </p>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button 
                            onClick={() => navigator.clipboard.writeText(note.content)}
                            className="p-1.5 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-colors"
                            title="Copy"
                        >
                            <Copy size={14} />
                        </button>
                        <button 
                            onClick={() => handleEdit(note)}
                            className="p-1.5 hover:bg-blue-500/10 rounded-md text-slate-400 hover:text-blue-400 transition-colors"
                            title="Edit"
                        >
                            <Edit size={14} />
                        </button>
                        <button 
                            onClick={() => handleDelete(note._id)}
                            className="p-1.5 hover:bg-red-500/10 rounded-md text-slate-400 hover:text-red-400 transition-colors"
                            title="Delete"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default UserNotes;
