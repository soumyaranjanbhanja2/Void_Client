import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, MicOff, Sparkles, Send, Copy, 
  Loader2, FileText, Bot, Command, 
  Cpu, Hash, Trash2 
} from 'lucide-react';

// --- Animations ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
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

  // --- Initialization ---
  useEffect(() => {
    fetchNotes();
    
    // Setup Speech Recognition
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
        
        // Update content with real-time transcript
        setContent(prev => transcript); 
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
          // Optional: Auto-restart logic can go here
      };
    }
  }, []);

  // --- API Functions ---
  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) { setIsLoading(false); return; }

      // Use your Render Backend URL
      const res = await axios.get('https://void-server-6.onrender.com/api/notes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes(res.data);
    } catch (err) {
      console.error("Failed to fetch notes", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNote = async (noteContent) => {
    if (!noteContent.trim()) return;
    
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post('https://void-server-6.onrender.com/api/notes', 
        { content: noteContent }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotes([res.data, ...notes]); 
      setContent('');
    } catch (err) {
      alert("Failed to save note. Check console.");
    }
  };

  // --- UPDATED AI FUNCTION (Fixes the Error) ---
  const generateSummary = async () => {
    if (!content) return alert("Please input text to summarize.");
    
    setIsGenerating(true);
    const token = localStorage.getItem('token');

    try {
      // ✅ Correct: Call YOUR backend, not OpenAI directly
      const response = await axios.post(
        'https://void-server-6.onrender.com/api/ai/summarize',
        { text: content },
        { 
          headers: { 
            'Authorization': `Bearer ${token}`, // Pass token for security
            'Content-Type': 'application/json' 
          } 
        }
      );

      // The backend returns { content: "summary text..." }
      const summary = response.data.content;
      handleSaveNote(summary); 

    } catch (error) {
       console.error("AI Generation Error:", error);
       alert("AI Error: Check backend logs or credits.");
    } finally {
      setIsGenerating(false);
    }
  };

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

  // --- Helper: Format Date ---
  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('en-US', { 
        month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'
    }).format(new Date(dateString));
  };

  // --- RENDER ---
  return (
    <div className="min-h-screen w-full bg-[#020617] text-slate-200 relative overflow-hidden selection:bg-indigo-500/30">
      
      {/* 1. Deep Atmosphere Background */}
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
              <span>Notes Generator v-2.0</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
              Notes <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400"> Generation</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
            <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
            <span className="text-xs font-mono text-slate-400">
              SYSTEM {isListening ? 'RECORDING' : 'ONLINE'}
            </span>
          </div>
        </motion.div>

        {/* 3. The "Command Deck" (Input Area) */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative max-w-4xl mx-auto mb-20 group"
        >
          {/* Glowing Border Gradient */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-2xl opacity-20 group-focus-within:opacity-50 blur transition duration-500" />
          
          <div className="relative bg-[#0A0A0A] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            
            {/* Toolbar Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/5">
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                </div>
                <div className="text-xs font-mono text-slate-500 flex items-center gap-1">
                    <Command size={10} /> COMMAND MODE
                </div>
            </div>

            {/* Text Area */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Input raw data or initialize voice protocol..."
              className="w-full bg-transparent text-lg text-slate-200 p-6 min-h-[160px] outline-none resize-none placeholder:text-slate-600 font-sans leading-relaxed"
            />

            {/* Action Bar */}
            <div className="px-4 py-4 bg-black/20 backdrop-blur-sm border-t border-white/5 flex items-center justify-between">
              
              <div className="flex items-center gap-2">
                {/* Voice Button */}
                <button 
                  onClick={toggleListening}
                  className={`relative p-3 rounded-xl transition-all duration-300 flex items-center gap-2 overflow-hidden ${
                    isListening 
                      ? 'bg-red-500/10 text-red-400 border border-red-500/30' 
                      : 'hover:bg-white/5 text-slate-400 hover:text-white border border-transparent'
                  }`}
                >
                    {isListening && (
                          <div className="absolute inset-0 bg-red-500/10 animate-pulse" />
                    )}
                    {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                    {isListening && <span className="text-xs font-bold animate-pulse">REC</span>}
                </button>

                {/* AI Button */}
                <button 
                  onClick={generateSummary}
                  disabled={isGenerating || !content}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-indigo-400 hover:bg-indigo-500/10 transition-all border border-transparent hover:border-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                  <span className="text-xs font-bold">AI ENHANCE</span>
                </button>
              </div>

              {/* Save Button */}
              <button 
                onClick={() => handleSaveNote(content)}
                disabled={!content}
                className="flex items-center gap-2 px-6 py-2.5 bg-white text-black rounded-xl font-bold text-sm hover:bg-indigo-50 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95 disabled:opacity-50 disabled:bg-slate-700 disabled:text-slate-400"
              >
                <span>SAVE DATA</span>
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
                    {/* Hover Glow Effect */}
                    <div className="absolute -inset-[1px] bg-gradient-to-b from-indigo-500/50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition duration-500 blur-sm" />
                    
                    <div className="relative h-full bg-[#0C0C0C] border border-white/10 rounded-2xl p-6 hover:-translate-y-1 transition-transform duration-300 shadow-2xl flex flex-col">
                        
                        {/* Header */}
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-indigo-400">
                                <FileText size={16} />
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                                <Hash size={10} />
                                <span>{formatDate(note.createdAt || Date.now())}</span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="mb-6 flex-grow">
                            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line font-light">
                                {note.content}
                            </p>
                        </div>

                        {/* Footer / Actions */}
                        <div className="pt-4 border-t border-white/5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <span className="text-[10px] font-mono text-slate-600 uppercase">ID: {note._id.substring(0,6)}...</span>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => navigator.clipboard.writeText(note.content)}
                                    className="p-1.5 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-colors"
                                    title="Copy to Clipboard"
                                >
                                    <Copy size={14} />
                                </button>
                                <button className="p-1.5 hover:bg-red-500/10 rounded-md text-slate-400 hover:text-red-400 transition-colors">
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
