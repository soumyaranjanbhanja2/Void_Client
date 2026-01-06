import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../state/AuthContext.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { FaBars, FaTimes, FaRocket, FaUserCircle, FaShieldAlt } from "react-icons/fa";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredPath, setHoveredPath] = useState(location.pathname);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // --- Animation Configurations ---
  const navContainerVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } 
    }
  };

  const mobileMenuVariants = {
    closed: { 
      opacity: 0, 
      height: 0, 
      transition: { duration: 0.3, ease: "easeInOut" } 
    },
    open: { 
      opacity: 1, 
      height: "auto", 
      transition: { duration: 0.4, ease: "circOut" } 
    }
  };

  const listContainerVariants = {
    closed: { opacity: 0 },
    open: { 
      opacity: 1, 
      transition: { staggerChildren: 0.1, delayChildren: 0.1 } 
    }
  };

  const itemVariants = {
    closed: { x: -20, opacity: 0 },
    open: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  // --- Helper Components ---

  // Desktop Link with "Sliding Pill" Background
  const NavLink = ({ to, label }) => {
    const isActive = hoveredPath === to;
    
    return (
      <Link
        to={to}
        onMouseEnter={() => setHoveredPath(to)}
        onMouseLeave={() => setHoveredPath(location.pathname)}
        className="relative px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 z-10"
      >
        {isActive && (
          <motion.div
            layoutId="nav-pill"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            className="absolute inset-0 bg-white/10 rounded-full -z-10"
          />
        )}
        <span className={isActive ? "text-white" : "text-slate-400"}>
          {label}
        </span>
      </Link>
    );
  };

  return (
    <motion.nav 
      initial="hidden"
      animate="visible"
      variants={navContainerVariants}
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#030712]/80 backdrop-blur-xl supports-[backdrop-filter]:bg-[#030712]/60"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          
          {/* --- BRAND --- */}
          <Link to="/" className="group flex items-center gap-3 z-20" onMouseEnter={() => setHoveredPath(null)}>
            <div className="relative w-10 h-10 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl blur-[10px] opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative w-full h-full bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center border border-white/10 shadow-xl overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                <FaRocket className="text-white text-lg transform group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
              MAANG Notes
            </span>
          </Link>

          {/* --- DESKTOP NAVIGATION --- */}
          <div className="hidden md:flex items-center gap-1 bg-white/5 p-1.5 rounded-full border border-white/5 backdrop-blur-3xl shadow-2xl">
            {!user ? (
              <>
                <NavLink to="/login" label="Login" />
                <NavLink to="/features" label="Features" />
                <NavLink to="/pricing" label="Pricing" />
              </>
            ) : (
              <>
                <NavLink to="/notes" label="My Notes" />
                {user.role === 'admin' && <NavLink to="/admin" label="Admin" />}
              </>
            )}
          </div>

          {/* --- DESKTOP CTA ACTIONS --- */}
          <div className="hidden md:flex items-center gap-4">
            {!user ? (
              <Link to="/signup">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative group px-6 py-2.5 rounded-full font-semibold text-sm text-white overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-300 group-hover:opacity-90" />
                  <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
                  <span className="relative flex items-center gap-2">
                    Get Started <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </span>
                </motion.button>
              </Link>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { logout(); navigate('/login'); }}
                className="px-5 py-2.5 rounded-full font-medium text-sm text-slate-300 hover:text-white border border-white/10 hover:bg-white/5 transition-all flex items-center gap-2"
              >
                Logout
              </motion.button>
            )}
          </div>

          {/* --- MOBILE TOGGLE --- */}
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-colors z-20"
          >
            {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </motion.button>

        </div>
      </div>

      {/* --- MOBILE MENU --- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={mobileMenuVariants}
            className="md:hidden overflow-hidden bg-black/95 backdrop-blur-2xl border-b border-white/10"
          >
            <motion.div 
              variants={listContainerVariants}
              className="p-6 flex flex-col gap-2"
            >
              {!user ? (
                <>
                  <MobileLink to="/login" icon={<FaUserCircle />} label="Log In" />
                  <div className="h-px bg-white/10 my-2" />
                  <MobileLink to="/signup" label="Create Account" isPrimary />
                </>
              ) : (
                <>
                  <MobileLink to="/notes" icon={<FaRocket />} label="My Notes" />
                  {user.role === 'admin' && (
                    <MobileLink to="/admin" icon={<FaShieldAlt />} label="Admin Dashboard" />
                  )}
                  <div className="h-px bg-white/10 my-2" />
                  <motion.button
                    variants={itemVariants}
                    onClick={() => { logout(); navigate('/login'); }}
                    className="w-full text-left px-4 py-4 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors font-medium flex items-center gap-3"
                  >
                    Log Out
                  </motion.button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

// --- Mobile Link Component ---
const MobileLink = ({ to, label, icon, isPrimary = false }) => {
  const itemVariants = {
    closed: { x: -20, opacity: 0 },
    open: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div variants={itemVariants}>
      <Link 
        to={to} 
        className={`group flex items-center gap-3 px-4 py-4 rounded-xl transition-all duration-300 ${
          isPrimary 
            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20" 
            : "text-slate-400 hover:text-white hover:bg-white/5"
        }`}
      >
        {icon && <span className={`${isPrimary ? "text-white" : "text-indigo-400 group-hover:text-white"} transition-colors`}>{icon}</span>}
        <span className="font-medium text-lg">{label}</span>
      </Link>
    </motion.div>
  );
};
