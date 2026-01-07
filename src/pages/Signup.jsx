import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Shield, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

function Signup() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'user' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null); // New state to handle errors
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null); // Clear previous errors
    
    try {
      // UPDATED: Using your live Render backend URL
      const response = await axios.post('https://void-server-6.onrender.com/api/signup', formData);
      console.log('Signup success:', response.data);
      navigate('/login'); 
    } catch (err) {
      console.error("Signup Error Details:", err);
      
      // LOGIC: Extract the exact message sent by the backend
      if (err.response && err.response.data) {
        // Backend usually sends { message: "..." } or { error: "..." }
        const serverMsg = err.response.data.message || err.response.data.error || "Signup failed. Please try again.";
        setError(serverMsg);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-900 flex items-center justify-center p-4 overflow-hidden relative">
      
      {/* Background Ambience / Glow Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-3xl opacity-30 animate-pulse delay-1000"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden">
          
          {/* Header */}
          <div className="p-8 pb-0 text-center">
            <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Create Account</h2>
            <p className="text-slate-400 text-sm">Join our community today</p>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* ERROR MESSAGE DISPLAY */}
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 flex items-center gap-3 text-red-200 text-sm"
                  >
                    <AlertCircle size={18} className="text-red-400 shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Username Input */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300 uppercase tracking-wide ml-1">Username</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                    <User size={18} />
                  </div>
                  <input 
                    type="text" 
                    required
                    className="w-full bg-slate-900/50 border border-slate-700 text-slate-100 text-sm rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 block pl-10 p-3 transition-all placeholder:text-slate-600 outline-none" 
                    placeholder="Enter Your Username" 
                    value={formData.username}
                    onChange={e => setFormData({...formData, username: e.target.value})} 
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300 uppercase tracking-wide ml-1">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                    <Mail size={18} />
                  </div>
                  <input 
                    type="email" 
                    required
                    className="w-full bg-slate-900/50 border border-slate-700 text-slate-100 text-sm rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 block pl-10 p-3 transition-all placeholder:text-slate-600 outline-none" 
                    placeholder="Enter Email:" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300 uppercase tracking-wide ml-1">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input 
                    type="password" 
                    required
                    className="w-full bg-slate-900/50 border border-slate-700 text-slate-100 text-sm rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 block pl-10 p-3 transition-all placeholder:text-slate-600 outline-none" 
                    placeholder="******" 
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})} 
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300 uppercase tracking-wide ml-1">Account Role</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                    <Shield size={18} />
                  </div>
                  <select 
                    className="w-full bg-slate-900/50 border border-slate-700 text-slate-100 text-sm rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 block pl-10 p-3 transition-all outline-none appearance-none cursor-pointer hover:bg-slate-900/70"
                    value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="user">User Account</option>
                    <option value="admin">Administrator</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                disabled={isLoading}
                className="w-full mt-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold py-3 px-4 rounded-lg shadow-lg hover:shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Sign Up</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </motion.button>
            </form>

            {/* Footer Links */}
            <div className="mt-8 pt-6 border-t border-slate-700/50 text-center">
              <p className="text-slate-400 text-sm">
                Already have an account?{' '}
                <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors hover:underline">
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Signup;
