import React, { useEffect, useState } from 'react';
import axios from 'axios'; // Use standard axios
import { FaStickyNote, FaEdit, FaTrash, FaMagic } from 'react-icons/fa';

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [input, setInput] = useState('');
  const [msg, setMsg] = useState('');

  // Helper to get headers with Token
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const loadNotes = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const r = await axios.get(
        'https://void-server-6.onrender.com/api/notes', 
        getAuthHeaders()
      );
      setNotes(r.data);
    } catch (error) {
      console.error("Load Error:", error);
      setNotes([]);
    }
  };

  useEffect(() => { loadNotes(); }, []);

  const generateNote = async () => {
    const data = input.trim();
    if (!data) return setMsg('⚠️ Provide content to generate a note.');
    
    // Auto-generate a title from the first line
    const title = data.split('\n')[0].slice(0, 40) || 'Generated Note';
    
    try {
      await axios.post(
        'https://void-server-6.onrender.com/api/notes', 
        { title, content: data },
        getAuthHeaders()
      );
      setMsg('✅ Note generated successfully.');
      setInput('');
      loadNotes();
    } catch (error) {
      console.error("Create Error:", error);
      setMsg('❌ Failed to generate note.');
    }
  };

  const deleteNote = async (id) => {
    if (!window.confirm("Are you sure you want to delete this?")) return;

    try {
      await axios.delete(
        `https://void-server-6.onrender.com/api/notes/${id}`, 
        getAuthHeaders()
      );
      loadNotes();
    } catch (error) {
      alert("Failed to delete");
    }
  };

  const editNote = async (n) => {
    const newTitle = prompt('Update title:', n.title || 'Untitled');
    if (newTitle === null) return;
    
    const newContent = prompt('Update content:', n.content || '');
    if (newContent === null) return;
    
    try {
      await axios.put(
        `https://void-server-6.onrender.com/api/notes/${n._id}`, 
        { title: newTitle, content: newContent },
        getAuthHeaders()
      );
      loadNotes();
    } catch (error) {
      alert("Failed to update");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
        
        {/* Generate Notes Section */}
        <section className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-xl h-fit">
          <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <FaStickyNote /> Generate Notes
          </h2>
          <p className="text-gray-300 mb-4 text-sm">Paste content or an outline. Click generate to create a note.</p>
          <textarea
            rows={8}
            className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-400 transition-colors"
            placeholder="Paste text or outline here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            className="w-full mt-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
            onClick={generateNote}
          >
            <FaMagic /> Generate Note
          </button>
          {msg && (
            <div className="mt-4 text-center text-sm text-white bg-black/40 px-4 py-2 rounded-lg border border-white/5">
                {msg}
            </div>
          )}
        </section>

        {/* Notes List Section */}
        <section className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-4">Your Library</h2>
          <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {notes.map((n) => (
              <div key={n._id} className="bg-black/40 p-4 rounded-xl border border-white/5 hover:border-indigo-500/30 transition-all group">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-indigo-300 text-lg">{n.title || "Untitled Note"}</h4>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors" onClick={() => editNote(n)}>
                      <FaEdit />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" onClick={() => deleteNote(n._id)}>
                      <FaTrash />
                    </button>
                  </div>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">
                    {(n.content || '').length > 200 ? (n.content || '').slice(0, 200) + '...' : (n.content || '')}
                </p>
                <div className="mt-3 pt-3 border-t border-white/5 text-xs text-slate-600 font-mono">
                    ID: {n._id.slice(-6)}
                </div>
              </div>
            ))}
            {notes.length === 0 && (
                <div className="text-center py-20 text-gray-500 border-2 border-dashed border-white/10 rounded-xl">
                    No notes found. Create one!
                </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
