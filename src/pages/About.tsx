import React from 'react';
import GlassCard from '../components/common/GlassCard';
import { FiBookOpen, FiDatabase, FiCpu, FiInfo, FiLayers, FiMap } from 'react-icons/fi';
import { motion } from 'framer-motion';

export const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-background p-4 lg:p-8 flex flex-col gap-8 max-w-6xl mx-auto">
      <div className="text-center py-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <span className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary font-bold tracking-widest uppercase mb-4 inline-block">
            Project Documentation
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2">
            About India Water Resources GIS
          </h1>
          <p className="text-sm text-white/50 max-w-2xl mx-auto leading-relaxed">
            A comprehensive overview of the dataset structures, scientific methodologies, and the modern technology stack powering this geospatial intelligence platform.
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core methodology card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2">
          <GlassCard className="h-full flex flex-col gap-4">
            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
              <FiBookOpen className="text-primary text-xl" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">Project Methodology</h2>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">
              This application acts as a digital twin for multi-layered water reports. Geometries (states, districts, watersheds, river basins) are compiled, dissolved, and stylized inside QGIS and then converted into compressed GeoJSON vectors for high-performance browser rendering.
            </p>
            <p className="text-sm text-white/70 leading-relaxed mt-2">
              Large spatial datasets were preprocessed using <code>mapshaper</code> to simplify polygon topologies by 2-5% without losing structural integrity, allowing hundreds of megabytes of raw QGIS exports to run smoothly within a React-Leaflet environment.
            </p>
          </GlassCard>
        </motion.div>

        {/* Data Sources */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <GlassCard className="h-full flex flex-col gap-4">
            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
              <FiDatabase className="text-secondary text-xl" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">Hydrological Data</h2>
            </div>
            <div className="flex flex-col gap-3 mt-2">
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                <p className="text-xs text-white/70"><strong>Central Ground Water Board (CGWB)</strong>: Source for aquifer health, draft levels, and station monitoring.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                <p className="text-xs text-white/70"><strong>India Meteorological Dept (IMD)</strong>: Source for annual precipitation grids.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 shrink-0" />
                <p className="text-xs text-white/70"><strong>ISRO Bhuvan & WRIS</strong>: Basin boundaries and watershed models.</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Technical stack matrix */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-3">
          <GlassCard className="flex flex-col gap-4">
            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
              <FiCpu className="text-accent text-xl" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">Tech Stack Configuration</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-2">
              {[
                { icon: FiCpu, title: 'Framework', desc: 'React 19 + Vite (TS)' },
                { icon: FiMap, title: 'Mapping engine', desc: 'React Leaflet v4' },
                { icon: FiLayers, title: 'Styling', desc: 'Tailwind CSS v4' },
                { icon: FiInfo, title: 'Data Viz', desc: 'Chart.js & Framer Motion' },
              ].map((item, idx) => (
                <div key={idx} className="bg-white/[0.02] border border-white/5 p-4 rounded-xl flex flex-col gap-2">
                  <item.icon className="text-primary text-xl mb-1" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">{item.title}</span>
                  <span className="text-xs text-white/60">{item.desc}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Development attribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-3">
          <GlassCard className="flex flex-col sm:flex-row items-center gap-4 bg-primary/5 border border-primary/20">
            <div className="p-3 bg-primary/10 rounded-full shrink-0">
              <FiInfo className="text-primary text-2xl" />
            </div>
            <p className="text-sm text-white/80 leading-relaxed">
              Designed and optimized as a production-grade open-source engineering dashboard. Data values represented in this dashboard correspond to official public dataset releases. Designed for high performance, responsive visualization, and professional GIS portfolio presentation.
            </p>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
