import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Dashboard from './pages/Dashboard';
import Rainfall from './pages/Rainfall';
import Groundwater from './pages/Groundwater';
import RiverBasins from './pages/RiverBasins';
import Watersheds from './pages/Watersheds';
import WaterQuality from './pages/WaterQuality';
import Analytics from './pages/Analytics';
import Comparison from './pages/Comparison';
import About from './pages/About';
import LoadingScreen from './components/common/LoadingScreen';
import SearchModal from './components/common/SearchModal';
import type { SearchResult } from './types';

const MainAppContent: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen } = useApp();
  const [appInitLoading, setAppInitLoading] = useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setAppInitLoading(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  const handleSearchResultSelect = (result: SearchResult) => {
    console.log('Selected Search Destination:', result);
    // In future iterations, we can attach this to flyTo event triggers
  };

  if (appInitLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-white font-sans selection:bg-primary selection:text-background transition-colors duration-300">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/rainfall" element={<Rainfall />} />
          <Route path="/groundwater" element={<Groundwater />} />
          <Route path="/river-basins" element={<RiverBasins />} />
          <Route path="/watersheds" element={<Watersheds />} />
          <Route path="/water-quality" element={<WaterQuality />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/comparison" element={<Comparison />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
      <Footer />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onResultSelect={handleSearchResultSelect}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <MainAppContent />
      </Router>
    </AppProvider>
  );
};

export default App;
