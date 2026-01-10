import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const navLinks = [
    { path: "/", label: "Home" },
    !token && { path: "/login", label: "Login" },
    !token && { path: "/signup", label: "Signup" },
    token && role === "user" && { path: "/notes", label: "My Notes" },
    token && role === "admin" && { path: "/admin", label: "Dashboard" },
  ].filter(Boolean);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 
                 shadow-lg px-6 py-4 flex items-center justify-between"
    >
      {/* Logo */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        className="text-white font-bold text-xl cursor-pointer animate-pulse"
        onClick={() => navigate("/")}
      >
      Void Notes Generator
      </motion.div>

      {/* Links */}
      <div className="flex gap-6 items-center">
        {navLinks.map((link) => (
          <motion.div
            key={link.path}
            whileHover={{ scale: 1.1 }}
            className={`text-white font-medium relative ${
              location.pathname === link.path ? "underline" : ""
            }`}
          >
            <Link to={link.path}>{link.label}</Link>
          </motion.div>
        ))}

        {token && (
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: "#ef4444" }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-md 
                       transition duration-300 ease-in-out"
          >
            Logout
          </motion.button>
        )}
      </div>
    </motion.nav>
  );
}

export default Navbar;
