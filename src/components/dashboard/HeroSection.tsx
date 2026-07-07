import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiLayers, FiCompass } from 'react-icons/fi';
import GlassCard from '../common/GlassCard';
import AnimatedCounter from '../common/AnimatedCounter';
import { STAT_CARDS } from '../../utils/constants';

export const HeroSection: React.FC = () => {
  return (
    <div className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-background">
      
      {/* ─── Animated Background Effects ─── */}
      
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      
      {/* Ambient water circular rings / ripples */}
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] animate-pulse" />
      <div className="absolute bottom-10 right-1/4 w-[600px] h-[600px] rounded-full bg-secondary/5 blur-[150px] animate-pulse [animation-delay:2s]" />

      {/* Floating GIS particles/nodes connected by thin SVG lines */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <svg className="w-full h-full">
          <motion.circle cx="10%" cy="20%" r="3" fill="#00D4FF" animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }} />
          <motion.circle cx="85%" cy="30%" r="4" fill="#38BDF8" animate={{ y: [0, 20, 0] }} transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }} />
          <motion.circle cx="75%" cy="75%" r="3" fill="#2563EB" animate={{ y: [0, -18, 0] }} transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }} />
          <motion.circle cx="20%" cy="80%" r="5" fill="#00D4FF" animate={{ y: [0, 15, 0] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }} />

          <path d="M 10% 20% L 20% 80% M 85% 30% L 75% 75%" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="5,5" />
        </svg>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center gap-6"
        >
          {/* Badge */}
          <span className="px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary font-bold tracking-wider uppercase animate-bounce">
            National GIS Dashboard v1.2
          </span>

          {/* Title */}
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-tight">
            India Water Resources <br />
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(0,212,255,0.25)]">
              GIS Intelligence Platform
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-white/70 max-w-3xl leading-relaxed">
            Interactive visualization of rainfall trends, groundwater levels, river basin capacities, watershed models, and state-wide water safety stations using GIS maps and geospatial analytics.
          </p>

          {/* Buttons CTA */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 w-full justify-center">
            <Link to="/rainfall" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-primary hover:bg-[#00b4dd] text-[#08111F] font-bold shadow-[0_0_20px_rgba(0,212,255,0.4)] transition duration-300">
                <span>Explore Precipitation</span>
                <FiArrowRight />
              </button>
            </Link>
            
            <Link to="/groundwater" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold transition duration-300">
                <FiLayers />
                <span>View GIS Layers</span>
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export const StatCards: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-white/5">
      <div className="text-center mb-12">
        <h2 className="text-2xl font-bold tracking-wide">Key Platform Metrics</h2>
        <p className="text-sm text-white/50 mt-1">Geospatial variables captured across the national GIS grid</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {STAT_CARDS.map((stat: any, idx: number) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.05 }}
          >
            <GlassCard className="flex items-center gap-5">
              <div
                className="p-3.5 rounded-xl text-2xl shrink-0"
                style={{
                  backgroundColor: `${stat.color}15`,
                  color: stat.color,
                  border: `1px solid ${stat.color}30`
                }}
              >
                <FiCompass />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white/40 uppercase tracking-wider">
                  {stat.title}
                </span>
                <span className="text-2xl font-bold font-mono text-white mt-1">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </span>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
