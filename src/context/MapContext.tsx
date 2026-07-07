import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import type L from 'leaflet';
import { useApp } from './AppContext';

interface MapContextType {
  mapRef: React.MutableRefObject<L.Map | null>;
  center: [number, number];
  zoom: number;
  setCenter: (center: [number, number]) => void;
  setZoom: (zoom: number) => void;
  flyTo: (lat: number, lng: number, zoom?: number) => void;
  resetView: () => void;
  activeBaseLayer: 'dark' | 'light' | 'satellite' | 'terrain';
  setActiveBaseLayer: (layer: 'dark' | 'light' | 'satellite' | 'terrain') => void;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

export const MapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme } = useApp();
  const mapRef = useRef<L.Map | null>(null);
  const [center, setCenter] = useState<[number, number]>([22.5, 82.5]);
  const [zoom, setZoom] = useState<number>(5);
  const [activeBaseLayer, setActiveBaseLayer] = useState<'dark' | 'light' | 'satellite' | 'terrain'>('dark');

  // Synchronize map base layer style with global app theme changes
  useEffect(() => {
    if (theme === 'dark' || theme === 'light') {
      setActiveBaseLayer(theme);
    }
  }, [theme]);

  const flyTo = (lat: number, lng: number, targetZoom?: number) => {
    if (mapRef.current) {
      mapRef.current.flyTo([lat, lng], targetZoom || mapRef.current.getZoom(), {
        duration: 1.5,
      });
    }
  };

  const resetView = () => {
    if (mapRef.current) {
      mapRef.current.setView([22.5, 82.5], 5, {
        animate: true,
        duration: 1.2,
      });
    }
  };

  return (
    <MapContext.Provider
      value={{
        mapRef,
        center,
        zoom,
        setCenter,
        setZoom,
        flyTo,
        resetView,
        activeBaseLayer,
        setActiveBaseLayer,
      }}
    >
      {children}
    </MapContext.Provider>
  );
};

export const useMapContext = () => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMapContext must be used within a MapProvider');
  }
  return context;
};
