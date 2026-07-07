import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiDroplet } from 'react-icons/fi';

const LoadingScreen: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 4;
      });
    }, 45);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center max-w-md px-6 text-center"
      >
        {/* Animated Droplet Logo */}
        <div className="relative mb-6">
          <motion.div
            animate={{
              y: [0, -12, 0],
              scaleY: [1, 0.9, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="text-primary text-6xl drop-shadow-[0_0_15px_rgba(0,212,255,0.5)]"
          >
            <FiDroplet />
          </motion.div>
          {/* Ripples around droplet */}
          <div className="absolute -inset-4 border border-primary/20 rounded-full animate-ping opacity-30" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold tracking-wider mb-2">
          <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            India Water Resources
          </span>
        </h1>
        <p className="text-sm font-semibold tracking-widest text-primary/70 uppercase mb-8">
          Geospatial Intelligence Platform
        </p>

        {/* Progress Bar Container */}
        <div className="w-64 h-1.5 bg-white/10 rounded-full overflow-hidden mb-3 border border-white/5 shadow-inner">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-secondary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: 'easeOut' }}
          />
        </div>

        {/* Status texts */}
        <div className="flex items-center gap-1.5 text-xs text-white/50 tracking-wider">
          <span>Loading spatial datasets</span>
          <span className="flex gap-0.5">
            <span className="inline-block w-1 h-1 bg-white/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <span className="inline-block w-1 h-1 bg-white/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <span className="inline-block w-1 h-1 bg-white/50 rounded-full animate-bounce" />
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;
