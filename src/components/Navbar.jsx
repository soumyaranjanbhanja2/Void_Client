import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogOut, User, LayoutDashboard, Notebook, Rocket } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Mock Auth (Replace with your Context)
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Handle Scroll Effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => setIsOpen(false), [location.pathname]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const navLinks = [
    { path: "/", label: "Home", icon: null }, // Simple link
    !token && { path: "/login", label: "Login", icon: User },
    !token && { path: "/signup", label: "Signup", icon: Rocket, primary: true },
    token && role === "user" && { path: "/notes", label: "My Notes", icon: Notebook },
    token && role === "admin" && { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
  ].filter(Boolean);

  return (
    <>
      {/* --- Main Navbar Container --- */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-300 ease-in-out
          ${scrolled 
            ? "bg-black/60 backdrop-blur-lg border-b border-white/10 shadow-2xl" 
            : "bg-transparent"
          }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* 1. Logo Section */}
          <Link to="/" className="flex items-center gap-2 group">
            {/* <motion.div 
              whileHover={{ rotate: 360 }} 
              transition={{ duration: 0.6 }}
              className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white"
            >
              <Rocket size={18} fill="currentColor" />
            </motion.div> */}
            <span className="text-3xl ml-[-58px] font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Void Notes Generator
            </span>
          </Link>

          {/* 2. Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <DesktopLink key={link.path} link={link} isActive={location.pathname === link.path} />
            ))}
            
            {token && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="ml-4 flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors border border-red-500/20"
              >
                <LogOut size={16} />
                <span className="text-sm font-medium">Logout</span>
              </motion.button>
            )}
          </div>

          {/* 3. Mobile Toggle */}
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="md:hidden text-white/80 hover:text-white transition-colors"
          >
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </motion.nav>

      {/* --- Mobile Menu Overlay --- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "100vh" }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed inset-0 z-40 bg-black/95 backdrop-blur-xl md:hidden pt-24 px-6"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link, idx) => (
                <motion.div
                  key={link.path}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 * idx }}
                >
                  <Link
                    to={link.path}
                    className={`text-2xl font-semibold flex items-center gap-4 py-3 border-b border-white/10
                      ${location.pathname === link.path ? "text-indigo-400" : "text-white/70"}`}
                  >
                    {link.icon && <link.icon size={24} />}
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              {token && (
                 <button onClick={handleLogout} className="mt-4 text-red-400 text-xl font-semibold flex items-center gap-3">
                    <LogOut size={24} /> Logout
                 </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Sub-Component for Desktop Links with "Magic Layout" Hover
const DesktopLink = ({ link, isActive }) => {
  if (link.primary) {
    return (
      <Link to={link.path}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="ml-2 px-5 py-2 bg-white text-black rounded-full font-semibold text-sm shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-shadow"
        >
          {link.label}
        </motion.button>
      </Link>
    );
  }

  return (
    <Link to={link.path} className="relative px-4 py-2 group">
      {isActive && (
        <motion.div
          layoutId="activeNav"
          className="absolute inset-0 bg-white/10 rounded-full"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
      <span className={`relative z-10 text-sm font-medium transition-colors ${isActive ? "text-white" : "text-white/60 group-hover:text-white"}`}>
        {link.label}
      </span>
    </Link>
  );
};

export default Navbar;
