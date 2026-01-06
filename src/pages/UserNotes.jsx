import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Mic, MicOff, Sparkles, Send, Copy, 
  Loader2, FileText, Bot, Command, 
  Cpu, Hash, Trash2, Edit, LogOut, AlertTriangle
} from 'lucide-react';

// --- CONFIGURATION ---
// Default to localhost to fix your errors. 
// Change to 'https://void-server-6.onrender.com/api' ONLY when you update the live server code.
const API_URL = 'http://localhost:10000/api'; 

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
  const [isListening, setIsListening] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const recognitionRef = useRef(null);
  const navigate = useNavigate();

  // --- AUTH HELPER ---
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  // --- ERROR HANDLER (Fixes 403 Crashes) ---
  const handleApiError = (error) => {
    console.error("API Action Failed:", error);
    if (error.response && (error.response.status === 403 || error.response.status === 401)) {
      alert("⚠️ Session expired. Redirecting to login...");
      localStorage.removeItem('token');
      navigate('/login');
    } else {
      alert(`❌ Error: ${error.response?.data?.error || "Server connection failed"}`);
    }
  };

  // --- INITIALIZATION ---
  useEffect(() => {
    fetchNotes();
    
    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        setContent(transcript); 
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech error', event.error);
        setIsListening(false);
      };
    }
  }, []);

  // --- CORE FUNCTIONS ---

  // 1. Fetch Notes
  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return setIsLoading(false); // Stop loading if no token (user sees empty state)

      const res = await axios.get(`${API_URL}/notes`, getAuthHeaders());
      setNotes(res.data);
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Create Note
  const handleSaveNote = async (noteContent) => {
    if (!noteContent.trim()) return;
    
    try {
      const res = await axios.post(`${API_URL}/notes`, { content: noteContent }, getAuthHeaders());
      setNotes([res.data, ...notes]); 
      setContent('');
    } catch (err) {
      handleApiError(err);
    }
  };

  // 3. Delete Note
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this log permanently?")) return;
    try {
      await axios.delete(`${API_URL}/notes/${id}`, getAuthHeaders());
      setNotes(notes.filter(n => n._id !== id));
    } catch (err) {
      handleApiError(err);
    }
  };

  // 4. Edit Note
  const handleEdit = async (note) => {
    const newContent = prompt("Update Log Entry:", note.content);
    if (newContent === null || newContent === note.content) return;

    try {
      const res = await axios.put(`${API_URL}/notes/${note._id}`, { content: newContent }, getAuthHeaders());
      setNotes(notes.map(n => (n._id === note._id ? res.data : n)));
    } catch (err) {
      handleApiError(err);
    }
  };

  // 5. AI Summarize
  const generateSummary = async () => {
    if (!content) return alert("System requires input data for analysis.");
    setIsGenerating(true);

    try {
      const res = await axios.post(`${API_URL}/ai/summarize`, { text: content }, getAuthHeaders());
      handleSaveNote(res.data.content); 
    } catch (err) {
       handleApiError(err);
    } finally {
      setIsGenerating(false);
    }
  };

  // --- UI HELPERS ---
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setContent('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('en-US', { 
        month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'
    }).format(new Date(dateString));
  };

  // --- RENDER ---
  return (
    <div className="min-h-screen w-full bg-[#020617] text-slate-200 relative overflow-hidden selection:bg-indigo-500/30">
      
      {/* 1. Background Effects */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.15),transparent_50%)] z-0" />
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      <div className="relative z-10 max-w-6xl mx-auto p-6 md:p-12">
        
        {/* 2. Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4"
        >
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs tracking-widest uppercase mb-2">
              <Cpu size={14} />
              <span>System v-2.0 // Connected: Localhost</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
              Notes <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400"> Generation</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
                <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                <span className="text-xs font-mono text-slate-400">
                STATUS: {isListening ? 'RECORDING' : 'ONLINE'}
                </span>
            </div>
            <button 
                onClick={() => { localStorage.removeItem('token'); navigate('/login'); }} 
                className="p-2 bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-full transition-colors border border-white/5"
                title="Disconnect"
            >
                <LogOut size={18} />
            </button>
          </div>
        </motion.div>

        {/* 3. Command Deck (Input) */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative max-w-4xl mx-auto mb-20 group"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-2xl opacity-20 group-focus-within:opacity-50 blur transition duration-500" />
          
          <div className="relative bg-[#0A0A0A] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/5">
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                </div>
                <div className="text-xs font-mono text-slate-500 flex items-center gap-1">
                    <Command size={10} /> COMMAND DECK
                </div>
            </div>

            {/* Input */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Input raw data or initialize voice protocol..."
              className="w-full bg-transparent text-lg text-slate-200 p-6 min-h-[160px] outline-none resize-none placeholder:text-slate-600 font-sans leading-relaxed"
            />

            {/* Actions */}
            <div className="px-4 py-4 bg-black/20 backdrop-blur-sm border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button 
                  onClick={toggleListening}
                  className={`relative p-3 rounded-xl transition-all duration-300 flex items-center gap-2 overflow-hidden ${
                    isListening 
                      ? 'bg-red-500/10 text-red-400 border border-red-500/30' 
                      : 'hover:bg-white/5 text-slate-400 hover:text-white border border-transparent'
                  }`}
                >
                    {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>

                <button 
                  onClick={generateSummary}
                  disabled={isGenerating || !content}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-indigo-400 hover:bg-indigo-500/10 transition-all border border-transparent hover:border-indigo-500/20 disabled:opacity-50"
                >
                  {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                  <span className="text-xs font-bold">AI ENHANCE</span>
                </button>
              </div>

              <button 
                onClick={() => handleSaveNote(content)}
                disabled={!content}
                className="flex items-center gap-2 px-6 py-2.5 bg-white text-black rounded-xl font-bold text-sm hover:bg-indigo-50 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95 disabled:opacity-50"
              >
                <span>SAVE LOG</span>
                <Send size={14} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* 4. Data Grid (Notes) */}
        {isLoading ? (
             <div className="flex flex-col items-center justify-center py-20 text-indigo-500/50">
                <Loader2 size={40} className="animate-spin mb-4" />
                <span className="font-mono text-xs tracking-widest animate-pulse">SYNCING DATABASE...</span>
             </div>
        ) : notes.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-32 border border-dashed border-white/10 rounded-3xl bg-white/5 opacity-50">
                <Bot size={48} className="mb-4 text-slate-500" />
                <p className="font-mono text-slate-500">NO LOGS FOUND</p>
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
                    {/* Card Glow */}
                    <div className="absolute -inset-[1px] bg-gradient-to-b from-indigo-500/50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition duration-500 blur-sm" />
                    
                    <div className="relative h-full bg-[#0C0C0C] border border-white/10 rounded-2xl p-6 hover:-translate-y-1 transition-transform duration-300 shadow-2xl flex flex-col">
                        
                        {/* Card Header */}
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-indigo-400">
                                <FileText size={16} />
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                                <Hash size={10} />
                                <span>{formatDate(note.createdAt || Date.now())}</span>
                            </div>
                        </div>

                        {/* Card Content */}
                        <div className="mb-6 flex-grow">
                            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line font-light">
                                {note.content}
                            </p>
                        </div>

                        {/* Card Actions (Hidden until hover) */}
                        <div className="pt-4 border-t border-white/5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <span className="text-[10px] font-mono text-slate-600 uppercase">ID: {note._id.substring(0,6)}...</span>
                            <div className="flex gap-2">
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
