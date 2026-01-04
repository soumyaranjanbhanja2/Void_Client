// src/ui/NotificationModal.jsx
import React from 'react';
import { motion } from 'framer-motion';
import NotificationAccent from './NotificationAccent.jsx';
import NotificationParticles from './NotificationParticles.jsx';
import useSoundEffect from '../hooks/useSoundEffect.jsx';

export default function NotificationModal({ item, onClose }) {
  if (!item) return null;

  // Play sound when modal opens
  useSoundEffect(item.priority);

  return (
    <motion.div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8 max-w-lg w-full relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 120 }}
      >
        <button
          className="absolute top-3 right-3 text-gray-300 hover:text-white"
          onClick={onClose}
        >
          ✖
        </button>
        <h2 className="text-2xl font-bold text-white mb-2">{item.title}</h2>
        <p className="text-gray-300 mb-4">{item.message}</p>
        <p className="text-sm text-gray-400 mb-4">
          Priority: {item.priority} | {new Date(item.createdAt).toLocaleString()}
        </p>

        {/* 3D Orb Accent */}
        <NotificationAccent priority={item.priority} />

        {/* Particle Effects */}
        <NotificationParticles priority={item.priority} />
      </motion.div>
    </motion.div>
  );
}