import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, MicOff, Terminal, Save, Cpu, 
  Activity, Trash2, Copy, Zap, Command 
} from 'lucide-react';

// --- Configuration ---
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// --- Animation Variants (Tech Style) ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const cardVariants = {
  hidden: { scale: 0.9, opacity: 0, filter: "blur(10px)" },
  visible: { 
    scale: 1, opacity: 1, filter: "blur(0px)",
    transition: { type: "spring", stiffness: 150, damping: 15 } 
  }
};

function UserNotes() {
  const [notes, setNotes] = useState([]);
  const [content, setContent] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const recognitionRef = useRef(null);

  // --- Logic ---
  useEffect(() => {
    fetchNotes();
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.onresult = (e) => {
        const transcript = Array.from(e.results).map(r => r[0].transcript).join('');
        setContent(transcript);
      };
    }
  }, []);

  const fetchNotes = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await axios.get('http://localhost:10000/api/notes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes(res.data);
    } catch (err) { console.error(err); }
  };

  const handleSave = async () => {
    if (!content.trim()) return;
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post('http://localhost:10000/api/notes', 
        { content }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotes([res.data, ...notes]);
      setContent('');
    } catch (err) { alert("Error saving data stream."); }
  };

  const toggleVoice = () => {
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setContent('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const triggerAI = async () => {
    if (!content) return;
    setIsProcessing(true);
    try {
      const res = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: "gpt-3.5-turbo",
        messages: [{ role: "system", content: "Format as a technical log." }, { role: "user", content }],
        max_tokens: 100
      }, {
        headers: { Authorization: `Bearer ${OPENAI_API_KEY}` }
      });
      handleSave(res.data.choices[0].message.content); // Save directly
    } catch (e) { alert("AI Module Offline"); }
    finally { setIsProcessing(false); }
  };

  // --- Render ---
  return (
    <div className="min-h-screen w-full bg-[#030712] text-cyan-50 font-sans relative overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-100">
      
      {/* 1. Tech Background Grid */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#1f2937 1px, transparent 1px), linear-gradient(to right, #1f2937 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
      />
      <div className="fixed inset-0 z-0 bg-[radial-gradient(circle_800px_at_50%_200px,#1e293b,transparent)] opacity-40 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto p-6 md:p-12">
        
        {/* 2. HUD Header */}
        <header className="flex items-end justify-between border-b border-cyan-900/50 pb-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-cyan-500 font-mono text-xs tracking-[0.2em] mb-2">
              <Activity size={14} className="animate-pulse" />
              <span>SYSTEM_READY</span>
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-white uppercase glitch-text">
              Nexus<span className="text-cyan-500">_Notes</span>
            </h1>
          </div>
          <div className="hidden md:flex gap-4 font-mono text-xs text-slate-500">
            <div>CPU: <span className="text-cyan-400">NORMAL</span></div>
            <div>MEM: <span className="text-cyan-400">OPTIMAL</span></div>
          </div>
        </header>

        {/* 3. Terminal Input Deck */}
        <div className="relative mb-16">
          {/* Tech Borders */}
          <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-cyan-500" />
          <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-cyan-500" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-cyan-500" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-cyan-500" />
          
          <div className="bg-[#0b1121]/90 backdrop-blur-md border border-cyan-900/30 p-1">
            <div className="bg-black/50 p-2 flex items-center justify-between border-b border-white/5">
               <div className="flex gap-1.5">
                 <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                 <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                 <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
               </div>
               <span className="font-mono text-[10px] text-slate-500">INPUT_STREAM.log</span>
            </div>
            
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="> Initialize data entry..."
              className="w-full h-32 bg-transparent text-cyan-100 p-4 font-mono text-sm outline-none resize-none placeholder:text-slate-600"
            />
            
            <div className="flex items-center justify-between p-2 bg-cyan-950/10">
               <div className="flex gap-2">
                  <button onClick={toggleVoice} className={`p-2 hover:bg-cyan-500/20 rounded transition-colors ${isListening ? 'text-red-400 animate-pulse' : 'text-cyan-600'}`}>
                    <Mic size={18} />
                  </button>
                  <button onClick={triggerAI} disabled={isProcessing} className="p-2 text-cyan-600 hover:bg-cyan-500/20 rounded transition-colors">
                    {isProcessing ? <Cpu size={18} className="animate-spin" /> : <Zap size={18} />}
                  </button>
               </div>
               <button 
                 onClick={handleSave}
                 className="flex items-center gap-2 px-6 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-black font-bold text-xs uppercase tracking-wider transition-all hover:shadow-[0_0_15px_rgba(6,182,212,0.5)]"
               >
                 Execute <Save size={14} />
               </button>
            </div>
          </div>
        </div>

        {/* 4. Data Nodes Grid */}
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
                className="group relative bg-[#0f172a] border border-slate-800 p-6 hover:border-cyan-500/50 transition-colors duration-300"
              >
                {/* Tech Corners Effect */}
                <div className="absolute top-0 left-0 w-2 h-2 bg-slate-700 group-hover:bg-cyan-500 transition-colors" />
                <div className="absolute top-0 right-0 w-2 h-2 bg-slate-700 group-hover:bg-cyan-500 transition-colors" />
                <div className="absolute bottom-0 left-0 w-2 h-2 bg-slate-700 group-hover:bg-cyan-500 transition-colors" />
                <div className="absolute bottom-0 right-0 w-2 h-2 bg-slate-700 group-hover:bg-cyan-500 transition-colors" />

                <div className="flex justify-between items-start mb-4 border-b border-slate-800 pb-2">
                   <div className="flex items-center gap-2 text-cyan-700">
                      <Terminal size={14} />
                      <span className="font-mono text-[10px] uppercase">Node_{note._id.slice(-4)}</span>
                   </div>
                   <span className="font-mono text-[10px] text-slate-600">
                     {new Date(note.createdAt || Date.now()).toLocaleTimeString()}
                   </span>
                </div>

                <p className="text-sm text-slate-400 font-mono leading-relaxed mb-6 group-hover:text-cyan-50 transition-colors">
                  {note.content}
                </p>

                <div className="flex justify-end gap-3 opacity-20 group-hover:opacity-100 transition-opacity">
                   <button className="text-slate-400 hover:text-cyan-400 transition-colors">
                     <Copy size={14} />
                   </button>
                   <button className="text-slate-400 hover:text-red-400 transition-colors">
                     <Trash2 size={14} />
                   </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

      </div>
    </div>
  );
}

export default UserNotes;