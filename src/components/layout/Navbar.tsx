import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiDroplet, FiSearch, FiSun, FiMoon, FiMenu, FiX } from 'react-icons/fi';
import { useApp } from '../../context/AppContext';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme, setIsSearchOpen } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Handle scrolled states
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on page navigate
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'Rainfall', path: '/rainfall' },
    { label: 'Groundwater', path: '/groundwater' },
    { label: 'River Basins', path: '/river-basins' },
    { label: 'Watersheds', path: '/watersheds' },
    { label: 'Groundwater Stations', path: '/water-quality' },
    { label: 'Analytics', path: '/analytics' },
    { label: 'About', path: '/about' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[999] transition-all duration-300 ${
          scrolled
            ? 'bg-background/90 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.4)] py-3'
            : 'bg-background/50 backdrop-blur-md border-b border-white/5 py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/20 group-hover:border-primary/40 transition">
              <FiDroplet className="text-primary text-xl drop-shadow-[0_0_10px_rgba(0,212,255,0.4)] animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="font-sans font-bold text-sm sm:text-base tracking-wide bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                India Water Resources
              </span>
              <span className="text-[10px] tracking-widest text-white/40 uppercase font-semibold">
                GIS Intelligence Portal
              </span>
            </div>
          </Link>

          {/* Desktop links */}
          <nav className="hidden lg:flex items-center gap-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                    isActive
                      ? 'text-primary bg-primary/10 border border-primary/20 shadow-[0_0_10px_rgba(0,212,255,0.1)]'
                      : 'text-white/70 hover:text-white hover:bg-white/5 border border-transparent'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5">
            {/* Search toggler */}
            <button
              onClick={() => setIsSearchOpen(true)}
              title="Search GIS Platform"
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 transition-all"
            >
              <FiSearch size={15} />
            </button>

            {/* Dark/Light mode switcher */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 transition-all"
            >
              {theme === 'dark' ? <FiSun size={15} /> : <FiMoon size={15} />}
            </button>

            {/* Mobile Hamburger menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 transition-all"
            >
              {mobileMenuOpen ? <FiX size={15} /> : <FiMenu size={15} />}
            </button>
          </div>
        </div>

        {/* Mobile slide menu panel */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="lg:hidden border-t border-white/10 bg-background/95 backdrop-blur-2xl overflow-hidden"
            >
              <div className="px-4 pt-3 pb-6 flex flex-col gap-1.5">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                        isActive
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'text-white/70 hover:bg-white/5'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      {/* Spacer offset so content doesn't get clipped by fixed header */}
      <div className="h-[68px] sm:h-[76px]" />
    </>
  );
};

export default Navbar;
