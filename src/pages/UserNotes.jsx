import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, MicOff, Sparkles, Send, Copy, 
  Loader2, FileText, Bot 
} from 'lucide-react';

// --- Configuration ---
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

function UserNotes() {
  const [notes, setNotes] = useState([]);
  const [content, setContent] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const recognitionRef = useRef(null);

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
        setContent(prev => prev + ' ' + transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
    }
  }, []);

  // --- API Interactions ---

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return; // Stop if no token found
      }

      const res = await axios.get('http://localhost:10000/api/notes', {
        // FIX 1: Added 'Bearer ' prefix to fix 403 Forbidden
        headers: { Authorization: `Bearer ${token}` } 
      });
      setNotes(res.data);
    } catch (err) {
      console.error("Failed to fetch notes", err);
      if (err.response && err.response.status === 403) {
        alert("Session expired or invalid token. Please log in again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNote = async (noteContent) => {
    if (!noteContent.trim()) return;
    
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post('http://localhost:10000/api/notes', 
        { content: noteContent }, 
        {
          // FIX 2: Added 'Bearer ' prefix here as well
          headers: { Authorization: `Bearer ${token}` } 
        }
      );
      setNotes([res.data, ...notes]); 
      setContent('');
    } catch (err) {
      console.error("Save Error:", err);
      alert("Failed to save note. Check console.");
    }
  };

  // --- Voice Logic ---
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

  // --- AI Summarization Logic ---
  const generateSummary = async () => {
    if (!content) return alert("Please type or speak something first!");
    
    // Check for missing key
    if (!OPENAI_API_KEY) {
      return alert("Missing OpenAI API Key in .env file");
    }

    setIsGenerating(true);
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: "gpt-3.5-turbo",
          messages: [{
            role: "system",
            content: "You are a helpful assistant. Summarize the user's input into concise, professional bullet points."
          }, {
            role: "user",
            content: content
          }],
          max_tokens: 150
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const summary = response.data.choices[0].message.content;
      handleSaveNote(summary); 

    } catch (error) {
      console.error("AI Error:", error);
      
      // FIX 3: Specific handling for 429 (Quota/Rate Limit)
      if (error.response && error.response.status === 429) {
        alert("⚠️ OpenAI Quota Exceeded.\n\nYou have run out of free credits or hit the rate limit. Please check your OpenAI billing settings.");
      } else {
        alert("AI Generation failed. Check console for details.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // --- Render ---
  return (
    <div className="min-h-screen w-full bg-slate-900 text-white p-4 md:p-8">
      
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-6xl mx-auto mb-10 flex justify-between items-end"
      >
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            Smart <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Notes</span>
          </h1>
          <p className="text-slate-400 mt-2 text-sm md:text-base">
            Capture thoughts instantly with Voice & AI Summarization.
          </p>
        </div>
        <div className="hidden md:block">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
            <Bot size={14} /> <span>AI Powered</span>
          </div>
        </div>
      </motion.div>

      {/* Input Section */}
      <div className="max-w-3xl mx-auto mb-16 relative z-10">
        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden transition-all focus-within:ring-2 focus-within:ring-cyan-500/50">
          
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type a note or click the microphone to speak..."
            className="w-full bg-transparent text-slate-200 p-6 min-h-[120px] outline-none resize-none placeholder:text-slate-600 text-lg leading-relaxed"
          />

          {/* Toolbar */}
          <div className="bg-slate-900/50 p-4 flex items-center justify-between border-t border-slate-700/50">
            
            <div className="flex items-center gap-3">
              <button 
                onClick={toggleListening}
                className={`p-3 rounded-full transition-all duration-300 flex items-center justify-center ${
                  isListening 
                    ? 'bg-red-500/20 text-red-400 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
                    : 'bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
                title="Toggle Voice Input"
              >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>

              <button 
                onClick={generateSummary}
                disabled={isGenerating || !content}
                className="group flex items-center gap-2 px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-lg transition-all border border-purple-500/20 hover:border-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                <span className="text-sm font-medium">Summarize with AI</span>
              </button>
            </div>

            <button 
              onClick={() => handleSaveNote(content)}
              disabled={!content}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-lg hover:shadow-cyan-500/25 text-white rounded-lg font-medium transition-all transform active:scale-95 disabled:opacity-50 disabled:grayscale"
            >
              <span>Save</span>
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Notes Grid */}
      <div className="max-w-6xl mx-auto">
        {isLoading ? (
          <div className="text-center text-slate-500 py-20 flex flex-col items-center">
            <Loader2 className="animate-spin mb-4" size={32} />
            <p>Loading your brain...</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl opacity-50">
            <FileText size={48} className="mx-auto mb-4 text-slate-600" />
            <p className="text-slate-500 text-xl">No notes yet. Start speaking!</p>
          </div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {notes.map((note) => (
                <motion.div
                  key={note._id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  whileHover={{ y: -5 }}
                  className="group relative bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:shadow-xl hover:shadow-cyan-900/10 hover:border-cyan-500/30 transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center text-cyan-400">
                      <FileText size={14} />
                    </div>
                    <span className="text-xs text-slate-500 font-mono">
                      {note.createdAt ? new Date(note.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                    {note.content}
                  </div>

                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button className="p-1.5 hover:bg-slate-700 rounded-md text-slate-400 hover:text-white transition-colors">
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