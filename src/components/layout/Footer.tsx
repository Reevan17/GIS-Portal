import React from 'react';
import { Link } from 'react-router-dom';
import { FiDroplet, FiServer, FiDatabase, FiLayers } from 'react-icons/fi';

export const Footer: React.FC = () => {
  return (
    <footer className="relative bg-background border-t border-white/10 overflow-hidden">
      {/* Accent glowing gradient bar */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-primary via-secondary to-accent opacity-75 shadow-[0_0_15px_rgba(0,212,255,0.7)]" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Col 1: Brand details */}
          <div className="flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2 group w-max">
              <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
                <FiDroplet className="text-primary text-lg" />
              </div>
              <span className="font-sans font-bold text-sm tracking-wider text-white">
                INDIA WATER RESOURCES GIS
              </span>
            </Link>
            <p className="text-xs text-white/50 leading-relaxed max-w-sm">
              The India Water Resources GIS Intelligence Platform provides real-time & historical modeling of surface precipitation, ground aquifers, watersheds, and water safety standards. Designed for engineering research & decision support.
            </p>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-white/40">
              Navigation Hub
            </span>
            <div className="grid grid-cols-1 gap-2 text-xs">
              <ul className="flex flex-col gap-2">
              <li><Link to="/rainfall" className="text-sm text-white/50 hover:text-primary transition">Rainfall Analysis</Link></li>
              <li><Link to="/groundwater" className="text-sm text-white/50 hover:text-primary transition">Groundwater Aquifers</Link></li>
              <li><Link to="/river-basins" className="text-sm text-white/50 hover:text-primary transition">River Basins</Link></li>
              <li><Link to="/watersheds" className="text-sm text-white/50 hover:text-primary transition">Watershed Modeler</Link></li>
              <li><Link to="/water-quality" className="text-sm text-white/50 hover:text-primary transition">Groundwater Stations</Link></li>
              <li><Link to="/analytics" className="text-sm text-white/50 hover:text-primary transition">Analytics Dashboard</Link></li>
              <li><Link to="/comparison" className="text-sm text-white/50 hover:text-primary transition">Temporal Comparison</Link></li>
            </ul>
              <Link to="/about" className="text-white/60 hover:text-primary transition">Technical details</Link>
            </div>
          </div>

          {/* Col 3: Data Sources */}
          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-white/40">
              Linked Data Nodes
            </span>
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2.5 text-xs text-white/60">
                <FiDatabase className="text-primary text-sm shrink-0" />
                <span>Central Ground Water Board (CGWB)</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-white/60">
                <FiServer className="text-accent text-sm shrink-0" />
                <span>India Meteorological Department (IMD)</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-white/60">
                <FiLayers className="text-secondary text-sm shrink-0" />
                <span>ISRO Bhuvan Geo-Portal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright block */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] uppercase font-bold tracking-widest text-white/40">
          <span>&copy; 2026 India Water Resources GIS Intelligence Platform</span>
          <span>Designed & Built for Geospatial Intelligence Systems</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
