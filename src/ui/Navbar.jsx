import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../state/AuthContext.jsx";
import { FaBars, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [hoveredPath, setHoveredPath] = useState(null);

  // --- Animation Variants ---
  const mobileMenuVariants = {
    closed: {
      opacity: 0,
      height: 0,
      transition: { duration: 0.3, ease: "easeInOut" }
    },
    open: {
      opacity: 1,
      height: "auto",
      transition: { duration: 0.3, ease: "easeInOut", staggerChildren: 0.1 }
    }
  };

  const mobileItemVariants = {
    closed: { x: -20, opacity: 0 },
    open: { x: 0, opacity: 1 }
  };

  // --- Helper Components ---
  
  // Desktop Nav Item with "Magnetic" Background
  const NavItem = ({ to, children, onClick, isButton = false }) => {
    const isActive = location.pathname === to;

    if (isButton) {
      return (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClick}
          className="relative px-5 py-2 rounded-full font-medium text-sm transition-all duration-300 bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)] hover:shadow-[0_0_25px_rgba(99,102,241,0.6)] border border-white/10"
        >
          {children}
        </motion.button>
      );
    }

    return (
      <Link
        to={to}
        onMouseEnter={() => setHoveredPath(to)}
        onMouseLeave={() => setHoveredPath(null)}
        className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300 ${
          isActive ? "text-white" : "text-slate-300 hover:text-white"
        }`}
      >
        {/* The Floating Background Element */}
        {hoveredPath === to && (
          <motion.div
            layoutId="navbar-hover"
            className="absolute inset-0 bg-white/10 rounded-lg -z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
        {children}
      </Link>
    );
  };

  // Mobile Nav Item
  const MobileNavItem = ({ to, onClick, children, isButton = false }) => {
    return (
      <motion.div variants={mobileItemVariants}>
        {isButton ? (
          <button
            onClick={onClick}
            className="w-full text-left block px-4 py-3 text-base font-semibold text-white bg-gradient-to-r from-indigo-600/80 to-purple-600/80 rounded-xl mt-2 border border-white/10"
          >
            {children}
          </button>
        ) : (
          <Link
            to={to}
            onClick={onClick}
            className="block px-4 py-3 text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
          >
            {children}
          </Link>
        )}
      </motion.div>
    );
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/70 backdrop-blur-xl supports-[backdrop-filter]:bg-slate-950/60">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          
          {/* --- Brand Logo --- */}
          <Link to="/" className="group flex items-center gap-3">
            <motion.div 
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5, ease: "backOut" }}
              className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-indigo-500/20"
            >
              {/* Inner White Box for simple geometry logo feel */}
              <div className="w-4 h-4 bg-white rounded-sm opacity-90" />
            </motion.div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400 tracking-tight group-hover:to-white transition-all duration-300">
              MAANG Notes
            </span>
          </Link>

          {/* --- Desktop Menu --- */}
          <div className="hidden md:flex items-center gap-1">
            {!user ? (
              <>
                <NavItem to="/login">Login</NavItem>
                <div className="w-px h-5 bg-white/10 mx-2" />
                <Link to="/signup">
                    <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative px-5 py-2 rounded-lg font-semibold text-sm bg-white text-black hover:bg-slate-200 transition-colors"
                    >
                    Get Started
                    </motion.button>
                </Link>
              </>
            ) : (
              <>
                <NavItem to="/notes">My Notes</NavItem>
                {user.role === "admin" && (
                  <NavItem to="/admin">Admin Panel</NavItem>
                )}
                <div className="ml-4">
                  <NavItem 
                    to="#" 
                    isButton 
                    onClick={() => {
                        logout();
                        nav("/login");
                    }}
                  >
                    Logout
                  </NavItem>
                </div>
              </>
            )}
          </div>

          {/* --- Mobile Toggle --- */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="md:hidden p-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            onClick={() => setOpen(!open)}
          >
            {open ? <FaTimes size={24} /> : <FaBars size={24} />}
          </motion.button>
        </div>
      </div>

      {/* --- Mobile Menu (AnimatePresence) --- */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={mobileMenuVariants}
            className="md:hidden overflow-hidden border-t border-white/10 bg-black/90 backdrop-blur-xl"
          >
            <div className="px-6 py-6 flex flex-col gap-2">
              {!user ? (
                <>
                  <MobileNavItem to="/login" onClick={() => setOpen(false)}>
                    Login
                  </MobileNavItem>
                  <MobileNavItem to="/signup" onClick={() => setOpen(false)} isButton>
                    Sign Up Free
                  </MobileNavItem>
                </>
              ) : (
                <>
                  <MobileNavItem to="/notes" onClick={() => setOpen(false)}>
                    My Notes
                  </MobileNavItem>
                  {user.role === "admin" && (
                    <MobileNavItem to="/admin" onClick={() => setOpen(false)}>
                      Admin Dashboard
                    </MobileNavItem>
                  )}
                  <div className="h-px bg-white/10 my-2" />
                  <MobileNavItem
                    to="#"
                    isButton
                    onClick={() => {
                      logout();
                      nav("/login");
                      setOpen(false);
                    }}
                  >
                    Sign Out
                  </MobileNavItem>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}