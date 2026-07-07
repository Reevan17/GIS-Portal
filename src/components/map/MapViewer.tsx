import React from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useMapContext } from '../../context/MapContext';
import { TILE_LAYERS, MAP_CONFIG } from '../../utils/constants';

interface MapViewerProps {
  children?: React.ReactNode;
}

// Subcomponent to synchronize react state center/zoom with leaflet map directly
const MapEventHandler: React.FC = () => {
  const map = useMap();
  const { mapRef, setCenter, setZoom } = useMapContext();

  React.useEffect(() => {
    mapRef.current = map;
    
    const handleMove = () => {
      const c = map.getCenter();
      setCenter([c.lat, c.lng]);
    };

    const handleZoom = () => {
      setZoom(map.getZoom());
    };

    map.on('moveend', handleMove);
    map.on('zoomend', handleZoom);

    return () => {
      map.off('moveend', handleMove);
      map.off('zoomend', handleZoom);
    };
  }, [map, mapRef, setCenter, setZoom]);

  return null;
};

export const MapViewer: React.FC<MapViewerProps> = ({ children }) => {
  const { activeBaseLayer } = useMapContext();
  const tileConfig = TILE_LAYERS[activeBaseLayer];

  return (
    <div id="gis-map-viewport" className="w-full h-full relative border border-white/10 rounded-2xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
      <MapContainer
        center={MAP_CONFIG.center}
        zoom={MAP_CONFIG.zoom}
        minZoom={MAP_CONFIG.minZoom}
        maxZoom={MAP_CONFIG.maxZoom}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false} // Custom zoom buttons in toolbar
      >
        <TileLayer
          key={activeBaseLayer}
          url={tileConfig.url}
          attribution={tileConfig.attribution}
        />
        <MapEventHandler />
        {children}
      </MapContainer>
    </div>
  );
};

export default MapViewer;
