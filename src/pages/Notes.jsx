import React, { useEffect, useState } from 'react';
import api from '../lib/api.js';
import { FaStickyNote, FaEdit, FaTrash } from 'react-icons/fa';

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [input, setInput] = useState('');
  const [msg, setMsg] = useState('');

  // UPDATED: Using live Render URL
  const loadNotes = () => 
    api.get('https://void-server-6.onrender.com/api/notes')
      .then((r) => setNotes(r.data))
      .catch(() => setNotes([]));

  useEffect(() => { loadNotes(); }, []);

  const generateNote = async () => {
    const data = input.trim();
    if (!data) return setMsg('⚠️ Provide content to generate a note.');
    
    // Auto-generate a title from the first line
    const title = data.split('\n')[0].slice(0, 60) || 'Generated Note';
    
    try {
      // UPDATED: Full URL to ensure connection
      await api.post('https://void-server-6.onrender.com/api/notes', { title, content: data });
      setMsg('✅ Note generated successfully.');
      setInput('');
      loadNotes();
    } catch {
      setMsg('❌ Failed to generate note.');
    }
  };

  const deleteNote = async (id) => {
    // UPDATED: Full URL
    await api.delete(`https://void-server-6.onrender.com/api/notes/${id}`);
    loadNotes();
  };

  const editNote = async (n) => {
    const newTitle = prompt('Update title:', n.title);
    if (newTitle === null) return;
    const newContent = prompt('Update content:', n.content || '');
    if (newContent === null) return;
    
    // UPDATED: Full URL
    await api.put(`https://void-server-6.onrender.com/api/notes/${n._id}`, { title: newTitle, content: newContent });
    loadNotes();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black px-4 py-8">
      <div className="grid grid-cols-12 gap-6 max-w-6xl mx-auto">
        
        {/* Generate Notes Section */}
        <section className="card col-span-12 md:col-span-6">
          <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <FaStickyNote /> Generate Notes
          </h2>
          <p className="text-gray-300 mb-4">Paste content or an outline. Click generate to create a note.</p>
          <textarea
            rows={8}
            className="input"
            placeholder="Paste text or outline here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            className="btn btn-primary w-full mt-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl shadow-lg hover:scale-[1.02] transition-transform"
            onClick={generateNote}
          >
            Generate
          </button>
          {msg && <div className="mt-4 text-center text-sm text-gray-200 bg-black/40 px-4 py-2 rounded-lg animate-slideUp">{msg}</div>}
        </section>

        {/* Notes List Section */}
        <section className="card col-span-12 md:col-span-6">
          <h2 className="text-xl font-bold text-white mb-2">Your notes</h2>
          <div className="flex flex-col gap-3">
            {notes.map((n) => (
              <div key={n._id} className="item">
                <div className="flex-1">
                  <h4 className="font-semibold text-white">{n.title}</h4>
                  <p className="text-gray-300 mt-1">{(n.content || '').slice(0, 240)}</p>
                </div>
                <div className="flex gap-2">
                  <button className="btn text-indigo-300 hover:text-indigo-500" onClick={() => editNote(n)}>
                    <FaEdit /> Edit
                  </button>
                  <button className="btn text-red-300 hover:text-red-500" onClick={() => deleteNote(n._id)}>
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            ))}
            {notes.length === 0 && <div className="text-gray-400">No notes yet.</div>}
          </div>
        </section>
      </div>
    </div>
  );
}
