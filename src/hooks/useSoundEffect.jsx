// src/hooks/useSoundEffect.js
import { useEffect } from 'react';

export default function useSoundEffect(priority) {
  useEffect(() => {
    if (!priority) return;

    let file;
    switch (priority) {
      case 'high':
        file = '/audio-1.mp3';
        break;
      case 'low':
        file = '/audio-2.mp3';
        break;
      default:
        file = '/audio-3.mp3';
    }

    const audio = new Audio(file);
    audio.volume = 0.4; // subtle volume
    audio.play().catch(() => {});
  }, [priority]);
}