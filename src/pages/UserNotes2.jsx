import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, MicOff, Sparkles, Send, Copy, 
  Loader2, Zap, Radio, Cpu, Command, Hash
} from 'lucide-react';

// --- Configuration ---
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// --- Background Floating Particles ---
const Particle = ({ delay }) => (
  <motion.div
    initial={{ y: "100vh", opacity: 0 }}
    animate={{ y: "-10vh", opacity: [0, 1, 0] }}
    transition={{ duration: Math.random() * 5 + 5, repeat: Infinity, delay: delay, ease: "linear" }}
    className="absolute w-1 h-1 bg-pink-400 rounded-full blur-[2px] pointer-events-none"
    style={{ left: `${Math.random() * 100}vw` }}
  />
);

// --- Animations ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const cardVariants = {
  hidden: { y: 50, opacity: 0, scale: 0.9, rotateX: -15 },
  visible: { 
    y: 0, opacity: 1, scale: 1, rotateX: 0,
    transition: { type: "spring", bounce: 0.4 }
  }
};

function UserNotes() {
  const [notes, setNotes] = useState([]);
  const [content, setContent] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const recognitionRef = useRef(null);

  // --- Logic (Same as before) ---
  useEffect(() => {
    fetchNotes();
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.onresult = (e) => setContent(Array.from(e.results).map(r => r[0].transcript).join(''));
      recognitionRef.current.onerror = () => setIsListening(false);
    }
  }, []);

  const fetchNotes = async () => {
    const token = localStorage.getItem('token');
    if (!token) { setIsLoading(false); return; }
    try {
      const res = await axios.get('http://localhost:10000/api/notes', { headers: { Authorization: `Bearer ${token}` } });
      setNotes(res.data);
    } catch (err) { console.error(err); } finally { setIsLoading(false); }
  };

  const handleSave = async (txt) => {
    const textToSave = typeof txt === 'string' ? txt : content;
    if (!textToSave.trim()) return;
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post('http://localhost:10000/api/notes', { content: textToSave }, { headers: { Authorization: `Bearer ${token}` } });
      setNotes([res.data, ...notes]); setContent('');
    } catch (err) { alert("Sync Failed"); }
  };

  const toggleVoice = () => {
    if (isListening) { recognitionRef.current.stop(); setIsListening(false); }
    else { setContent(''); recognitionRef.current.start(); setIsListening(true); }
  };

  const triggerAI = async () => {
    if (!content) return; setIsGenerating(true);
    try {
      // Simulate AI for demo (replace with actual call if key is ready)
      setTimeout(() => { handleSave("✨ SYSTEM GENERATED SUMMARY:\n> Pattern analysis complete.\n> User intent clarified.\n> Data compressed successfully."); setIsGenerating(false); }, 1500);
    } catch (e) { alert("AI Module Error"); setIsGenerating(false); }
  };

  // --- Render ---
  return (
    // Main Container with deep violet/magenta theme
    <div className="min-h-screen w-full bg-[#0c021c] text-pink-50 relative overflow-hidden font-sans selection:bg-pink-500/50 selection:text-white">
      
      {/* 1. Anime Background Elements */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjEiIGZmlsbD0iI2ZmMDBmZiIgZmlsbC1vcGFjaXR5PSIwLjEiLz48L2c+PC9zdmc+')] opacity-50 pointer-events-none z-0" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,#4c00ff33,transparent_70%)] z-0 pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_80%_80%,#ff00cc33,transparent_50%)] z-0 pointer-events-none" />
      {/* Floating Particles */}
      {[...Array(15)].map((_, i) => <Particle key={i} delay={i * 0.5} />)}


      <div className="relative z-10 max-w-6xl mx-auto p-6 md:p-10">
        
        {/* 2. HUD Header */}
        <header className="mb-16 relative text-center md:text-left">
          {/* Glitchy Decorative Underline */}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent opacity-50 blur-sm" />
          <div className="flex flex-col md:flex-row items-center justify-between pb-4">
            <div>
              <div className="flex items-center gap-2 text-pink-400 font-mono text-xs tracking-[0.3em] uppercase mb-1 animate-pulse">
                <Cpu size={14} />
                <span>Neural_Link // Online</span>
              </div>
              {/* Anime Title Typography */}
              <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-pink-200 to-purple-300 drop-shadow-[0_0_10px_rgba(255,100,255,0.5)] italic transform -skew-x-6">
                AETHER<span className="text-pink-500">.NOTE</span>
              </h1>
            </div>
            
            {/* Status Indicator */}
            <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-pink-900/20 border border-pink-500/30 rounded-full backdrop-blur-md mt-4 md:mt-0">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
              </div>
              <span className="font-mono text-xs text-pink-300 tracking-widest">SYSTEM.SYNC // READY</span>
            </div>
          </div>
        </header>

        {/* 3. The "Arcane Terminal" Input */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, type: "spring" }}
          className="relative mb-20 group"
        >
          {/* Glowing "Magical" Border Layers */}
          <div className="absolute -inset-[2px] bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-[20px] opacity-70 blur-md group-focus-within:opacity-100 group-focus-within:blur-xl transition-all duration-500 animate-pulse-slow" />
          
          <div className="relative bg-[#120a24] rounded-[18px] overflow-hidden border-2 border-pink-500/20 group-focus-within:border-pink-500/50 shadow-[inset_0_0_30px_rgba(255,0,255,0.1)] transition-all">
            
            {/* Terminal Bar */}
            <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-pink-900/20 to-purple-900/20 border-b border-pink-500/10">
               <div className="flex items-center gap-2 text-xs font-mono text-pink-300/70">
                  <Command size={12} />
                  <span>INPUT_STREAM :: <span className="text-pink-500 animate-pulse">ACTIVE</span></span>
               </div>
               {isListening && (
                 <div className="flex items-center gap-2 text-red-400 text-xs font-bold font-mono animate-pulse">
                    <Radio size={12} /> LIVE FEED
                 </div>
               )}
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter data sequence or initialize vocal protocol..."
              className="w-full bg-transparent text-xl text-pink-100 p-6 min-h-[150px] outline-none resize-none placeholder:text-pink-700/50 font-medium leading-relaxed tracking-wide z-10 relative"
            />
            
            {/* HUD Grid Overlay on Textarea */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,0,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

            {/* Action Deck */}
            <div className="px-6 py-4 bg-[#0c021c]/80 backdrop-blur-md border-t border-pink-500/10 flex items-center justify-between relative z-20">
              
              <div className="flex gap-3">
                {/* Voice Button */}
                <button 
                  onClick={toggleVoice}
                  className={`relative group/btn p-3 rounded-xl overflow-hidden transition-all ${
                    isListening ? 'bg-red-500/20 text-red-300 border-red-500/50' : 'bg-pink-500/10 text-pink-400 hover:bg-pink-500/20 border-pink-500/20'
                  } border`}
                >
                    {isListening && <div className="absolute inset-0 bg-red-500/20 animate-ping" />}
                    {isListening ? <MicOff size={20} className="relative z-10" /> : <Mic size={20} className="relative z-10" />}
                </button>

                {/* AI Button */}
                <button 
                  onClick={triggerAI}
                  disabled={isGenerating || !content}
                  className="relative p-3 rounded-xl bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 border border-purple-500/30 transition-all disabled:opacity-30 group/ai overflow-hidden"
                >
                  <div className="absolute inset-0 bg-purple-500/30 blur-lg opacity-0 group-hover/ai:opacity-100 transition-opacity" />
                  {isGenerating ? <Loader2 size={20} className="animate-spin relative z-10" /> : <Sparkles size={20} className="relative z-10" />}
                </button>
              </div>

              {/* Save Button (Magical Button) */}
              <button 
                onClick={() => handleSave(content)}
                disabled={!content}
                className="relative group/save px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl font-bold text-sm uppercase tracking-wider overflow-hidden disabled:opacity-50 transition-transform active:scale-95"
              >
                <div className="absolute inset-0 bg-white/30 skew-x-[20deg] -translate-x-[150%] group-hover/save:translate-x-[150%] transition-transform duration-700" />
                <div className="flex items-center gap-2 relative z-10 text-cyan-50 shadow-sm">
                   <span>Compile Data</span> <Send size={16} />
                </div>
              </button>

            </div>
          </div>
        </motion.div>

        {/* 4. Data Shards Grid */}
        {isLoading ? (
             <div className="flex justify-center py-20">
                <div className="relative">
                    <div className="absolute inset-0 bg-pink-500 blur-xl animate-pulse opacity-50"></div>
                    <Loader2 className="animate-spin text-pink-300 relative z-10" size={40} />
                </div>
             </div>
        ) : notes.length === 0 ? (
             <div className="text-center py-32 border-2 border-dashed border-pink-500/20 rounded-3xl bg-pink-500/5 backdrop-blur-sm">
                <Zap size={48} className="mx-auto mb-4 text-pink-500/40" />
                <p className="font-mono text-pink-300/50 tracking-widest">ARCHIVE EMPTY</p>
             </div>
        ) : (
          <motion.div 
            variants={containerVariants} initial="hidden" animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {notes.map((note, i) => (
                <motion.div
                  key={note._id} variants={cardVariants} layout
                  // The "Data Shard" Card Style
                  className="group relative bg-[#160d2e] border-2 border-transparent rounded-2xl p-6 overflow-hidden hover:-translate-y-2 transition-all duration-300"
                  style={{ clipPath: "polygon(0 0, 100% 0, 100% 90%, 90% 100%, 0 100%)" }} // Tech Corner Cut
                >
                    {/* Animated Gradient Border on Hover */}
                    <div className="absolute inset-0 border-2 border-pink-500/0 group-hover:border-pink-500/50 rounded-2xl transition-all" 
                         style={{ clipPath: "polygon(0 0, 100% 0, 100% 90%, 90% 100%, 0 100%)" }} />
                    
                    {/* Hover Background Glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Header */}
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="p-1.5 bg-pink-500/10 border border-pink-500/30 rounded text-pink-300">
                            <Hash size={14} />
                        </div>
                        <span className="font-mono text-[10px] text-pink-400/60 tracking-wider">
                          INDEX_{i.toString().padStart(3, '0')}
                        </span>
                    </div>

                    {/* Content */}
                    <div className="mb-6 relative z-10">
                        <p className="text-sm text-pink-100/90 leading-relaxed whitespace-pre-wrap font-medium">
                            {note.content}
                        </p>
                    </div>

                    {/* Footer Actions (Appears on hover) */}
                    <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 z-10">
                       <button 
                         onClick={() => navigator.clipboard.writeText(note.content)}
                         className="p-2 bg-[#0c021c] border border-pink-500/30 hover:border-pink-500 rounded text-pink-300 hover:text-pink-100 transition-all shadow-[0_0_10px_rgba(255,0,255,0.2)]"
                       >
                         <Copy size={14} />
                       </button>
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