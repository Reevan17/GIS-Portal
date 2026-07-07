import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiX, FiMapPin, FiActivity } from 'react-icons/fi';
import type { SearchResult } from '../../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResultSelect: (result: SearchResult) => void;
}

// Predefined search database mapping to real features in GeoJSON for auto fly-to
const SEARCH_DATABASE: SearchResult[] = [
  // States
  { type: 'state', name: 'Andhra Pradesh', coordinates: [15.9129, 79.74] },
  { type: 'state', name: 'Arunachal Pradesh', coordinates: [28.218, 94.7278] },
  { type: 'state', name: 'Assam', coordinates: [26.2006, 92.9376] },
  { type: 'state', name: 'Bihar', coordinates: [25.0961, 85.3131] },
  { type: 'state', name: 'Chhattisgarh', coordinates: [21.2787, 81.8661] },
  { type: 'state', name: 'Goa', coordinates: [15.2993, 74.124] },
  { type: 'state', name: 'Gujarat', coordinates: [22.2587, 71.1924] },
  { type: 'state', name: 'Haryana', coordinates: [29.0588, 76.0856] },
  { type: 'state', name: 'Himachal Pradesh', coordinates: [31.1048, 77.1734] },
  { type: 'state', name: 'Jharkhand', coordinates: [23.6102, 85.2799] },
  { type: 'state', name: 'Karnataka', coordinates: [15.3173, 75.7139] },
  { type: 'state', name: 'Kerala', coordinates: [10.8505, 76.2711] },
  { type: 'state', name: 'Madhya Pradesh', coordinates: [22.9734, 78.6569] },
  { type: 'state', name: 'Maharashtra', coordinates: [19.7515, 75.7139] },
  { type: 'state', name: 'Manipur', coordinates: [24.6637, 93.9063] },
  { type: 'state', name: 'Meghalaya', coordinates: [25.467, 91.3662] },
  { type: 'state', name: 'Mizoram', coordinates: [23.1645, 92.9376] },
  { type: 'state', name: 'Nagaland', coordinates: [26.1584, 94.5624] },
  { type: 'state', name: 'Odisha', coordinates: [20.9517, 85.0985] },
  { type: 'state', name: 'Punjab', coordinates: [31.1471, 75.3412] },
  { type: 'state', name: 'Rajasthan', coordinates: [27.0238, 74.2179] },
  { type: 'state', name: 'Sikkim', coordinates: [27.533, 88.5122] },
  { type: 'state', name: 'Tamil Nadu', coordinates: [11.1271, 78.6569] },
  { type: 'state', name: 'Telangana', coordinates: [18.1124, 79.0193] },
  { type: 'state', name: 'Tripura', coordinates: [23.9408, 91.9882] },
  { type: 'state', name: 'Uttar Pradesh', coordinates: [26.8467, 80.9462] },
  { type: 'state', name: 'Uttarakhand', coordinates: [30.0668, 79.0193] },
  { type: 'state', name: 'West Bengal', coordinates: [22.9868, 87.855] },
  
  // Key Districts
  { type: 'district', name: 'Bangalore Rural', coordinates: [13.25, 77.58], details: { State: 'Karnataka' } },
  { type: 'district', name: 'Bangalore Urban', coordinates: [12.97, 77.59], details: { State: 'Karnataka' } },
  { type: 'district', name: 'Thiruvananthapuram', coordinates: [8.5241, 76.9366], details: { State: 'Kerala' } },
  { type: 'district', name: 'Chennai', coordinates: [13.0827, 80.2707], details: { State: 'Tamil Nadu' } },
  { type: 'district', name: 'Coimbatore', coordinates: [11.0168, 76.9558], details: { State: 'Tamil Nadu' } },
  { type: 'district', name: 'Ernakulam', coordinates: [9.9816, 76.2999], details: { State: 'Kerala' } },
  { type: 'district', name: 'Mysuru', coordinates: [12.2958, 76.6394], details: { State: 'Karnataka' } },

  // River Basins
  { type: 'river_basin', name: 'Ganga Basin', coordinates: [25.0, 83.0], details: { Area: '861,452 sq km' } },
  { type: 'river_basin', name: 'Indus Basin', coordinates: [32.0, 76.0], details: { Area: '321,289 sq km' } },
  { type: 'river_basin', name: 'Godavari Basin', coordinates: [19.0, 79.0], details: { Area: '312,812 sq km' } },
  { type: 'river_basin', name: 'Krishna Basin', coordinates: [16.5, 77.5], details: { Area: '258,948 sq km' } },
  { type: 'river_basin', name: 'Cauvery Basin', coordinates: [11.5, 77.5], details: { Area: '81,155 sq km' } },
  { type: 'river_basin', name: 'Mahanadi Basin', coordinates: [21.0, 83.5], details: { Area: '141,589 sq km' } },
  { type: 'river_basin', name: 'Narmada Basin', coordinates: [22.3, 77.0], details: { Area: '98,796 sq km' } },

  // Key Watersheds
  { type: 'watershed', name: 'Upper Cauvery (5A2A1)', coordinates: [12.4, 76.2], details: { Basin: 'Cauvery' } },
  { type: 'watershed', name: 'Shimsha Sub-basin (5A2A4)', coordinates: [12.8, 77.0], details: { Basin: 'Cauvery' } },
  { type: 'watershed', name: 'Kabini Watershed (5A2A2)', coordinates: [11.9, 76.4], details: { Basin: 'Cauvery' } },
  
  // Stations
  { type: 'station', name: 'Gurgunta Station', coordinates: [16.208, 76.283], details: { District: 'Raichur', State: 'Karnataka' } },
  { type: 'station', name: 'Alathur Station', coordinates: [10.643, 76.542], details: { District: 'Palakkad', State: 'Kerala' } },
  { type: 'station', name: 'Hosur Ground Monitoring', coordinates: [12.74, 77.82], details: { District: 'Krishnagiri', State: 'Tamil Nadu' } }
];

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onResultSelect }) => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'state' | 'district' | 'river_basin' | 'watershed' | 'station'>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle ESC close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const filteredResults = SEARCH_DATABASE.filter((item) => {
    const matchesQuery = item.name.toLowerCase().includes(query.toLowerCase());
    const matchesTab = activeTab === 'all' || item.type === activeTab;
    return matchesQuery && matchesTab;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'state': return <FiMapPin className="text-cyan-400" />;
      case 'district': return <FiMapPin className="text-blue-400" />;
      case 'river_basin': return <FiActivity className="text-indigo-400" />;
      case 'watershed': return <FiActivity className="text-emerald-400" />;
      case 'station': return <FiActivity className="text-pink-400" />;
      default: return <FiMapPin />;
    }
  };

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'state': return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20';
      case 'district': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'river_basin': return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
      case 'watershed': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'station': return 'bg-pink-500/10 text-pink-400 border border-pink-500/20';
      default: return 'bg-white/10 text-white/70';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-start justify-center pt-24 px-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Box */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-2xl bg-background-light/95 border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            {/* Input Header */}
            <div className="flex items-center gap-3 p-4 border-b border-white/10 bg-white/[0.02]">
              <FiSearch className="text-white/40 text-xl" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search State, District, River Basin, Watershed, WQ Station..."
                className="flex-1 bg-transparent text-white placeholder-white/40 text-sm focus:outline-none"
              />
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-white/50 hover:bg-white/5 hover:text-white transition"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-3 overflow-x-auto border-b border-white/5 bg-white/[0.01]">
              {(['all', 'state', 'district', 'river_basin', 'watershed', 'station'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold capitalize whitespace-nowrap transition ${
                    activeTab === tab
                      ? 'bg-primary text-[#08111F]'
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {tab.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Results body */}
            <div className="max-h-[350px] overflow-y-auto p-2 flex flex-col gap-1">
              {filteredResults.length > 0 ? (
                filteredResults.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onResultSelect(item);
                      onClose();
                    }}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 text-left transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white/5 text-white/70 group-hover:bg-white/10 transition">
                        {getIcon(item.type)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white/95">{item.name}</div>
                        {item.details && (
                          <div className="text-xs text-white/40 flex gap-2 mt-0.5">
                            {Object.entries(item.details).map(([k, v]) => (
                              <span key={k}>
                                {k}: {v}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${getBadgeStyle(item.type)}`}>
                      {item.type.replace('_', ' ')}
                    </span>
                  </button>
                ))
              ) : (
                <div className="py-12 text-center text-white/40 flex flex-col items-center gap-2">
                  <FiSearch size={24} className="opacity-30" />
                  <span className="text-sm">No results match your search criteria.</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SearchModal;
