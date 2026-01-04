import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100 }
  }
};

function Home() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 👇 THIS WAS THE FIX: Added '/api' to the URL
    axios.get('http://localhost:10000/api/notifications') 
      .then(res => setNotifications(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // --- Loading Skeleton (Full Width) ---
  if (loading) {
    return (
      <div className="w-full px-6 py-12 bg-slate-900 min-h-screen">
        <div className="h-12 w-64 bg-slate-800 rounded-lg animate-pulse mb-4"></div>
        <div className="h-6 w-96 bg-slate-800/60 rounded-lg animate-pulse mb-12"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-80 bg-slate-800/40 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-900 text-white selection:bg-cyan-500 selection:text-white">
      <div className="w-full px-4 md:px-10 lg:px-16 py-16">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
            Latest <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Announcements</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-3xl leading-relaxed">
            Stay in the loop with the newest updates, feature releases, and community news.
          </p>
        </motion.div>

        {/* Content Grid */}
        {notifications.length === 0 ? (
          <div className="w-full text-center py-32 bg-slate-800/20 rounded-3xl border border-slate-700/30 dashed-border">
            <p className="text-slate-500 text-2xl font-light">No announcements available right now.</p>
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {notifications.map((notif) => (
              <motion.div
                key={notif._id}
                variants={cardVariants}
                whileHover={{ y: -8 }}
                className="group relative bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-cyan-500/10 hover:border-cyan-500/30 transition-all duration-300 flex flex-col"
              >
                {/* Image Container */}
                <div className="relative aspect-video w-full overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80 z-10" />
                  <img 
                    src={notif.imageUrl} 
                    alt="announcement" 
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col relative z-20">
                  <div className="-mt-10 mb-2">
                     <span className="inline-block px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider rounded-full backdrop-blur-sm border border-cyan-500/20">
                        Update
                     </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-slate-100 mb-2 leading-snug">
                     {notif.message.substring(0, 50)}{notif.message.length > 50 ? "..." : ""}
                  </h3>
                  
                  <p className="text-slate-400 text-sm leading-relaxed mb-4 flex-grow">
                    {notif.message}
                  </p>
                  
                  <div className="pt-4 mt-auto border-t border-slate-700/50 flex justify-between items-center text-xs text-slate-500">
                    <span>{new Date(notif.createdAt || Date.now()).toLocaleDateString()}</span>
                    <span className="group-hover:text-cyan-400 transition-colors">Read more &rarr;</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default Home;