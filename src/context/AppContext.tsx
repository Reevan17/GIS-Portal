import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AvailableYear, AppState } from '../types';

interface AppContextType extends AppState {
  setSelectedYear: (year: AvailableYear) => void;
  setActiveLayerIds: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedState: (state: string | null) => void;
  setSelectedDistrict: (district: string | null) => void;
  setSearchQuery: (query: string) => void;
  setIsSearchOpen: (isOpen: boolean) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setIsLoading: (isLoading: boolean) => void;
  setSidebarOpen: (isOpen: boolean) => void;
  toggleLayer: (layerId: string) => void;
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedYear, setSelectedYearState] = useState<AvailableYear>(2024);
  const [activeLayerIds, setActiveLayerIds] = useState<string[]>(['india_states']);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  // Apply theme to document html element
  useEffect(() => {
    const root = window.document.documentElement;
    root.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const setSelectedYear = (year: AvailableYear) => {
    setSelectedYearState(year);
  };

  const toggleLayer = (layerId: string) => {
    setActiveLayerIds((prev) =>
      prev.includes(layerId) ? prev.filter((id) => id !== layerId) : [...prev, layerId]
    );
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <AppContext.Provider
      value={{
        selectedYear,
        activeLayerIds,
        selectedState,
        selectedDistrict,
        searchQuery,
        isSearchOpen,
        theme,
        isLoading,
        sidebarOpen,
        setSelectedYear,
        setActiveLayerIds,
        setSelectedState,
        setSelectedDistrict,
        setSearchQuery,
        setIsSearchOpen,
        setTheme,
        setIsLoading,
        setSidebarOpen,
        toggleLayer,
        toggleTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
