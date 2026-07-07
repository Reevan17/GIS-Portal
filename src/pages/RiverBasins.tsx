import React, { useState, useEffect } from 'react';
import { MapProvider } from '../context/MapContext';
import MapViewer from '../components/map/MapViewer';
import LayerControl from '../components/map/LayerControl';
import GISToolbar from '../components/map/GISToolbar';
import GlassCard from '../components/common/GlassCard';
import { useGeoJSON } from '../hooks/useGeoJSON';
import { MapSkeleton } from '../components/common/LoadingSkeleton';
import { FiActivity, FiMap, FiInfo, FiLayers } from 'react-icons/fi';
import { GeoJSON } from 'react-leaflet';
import type { GeoJsonObject, Feature } from 'geojson';
import type { Layer, LeafletMouseEvent, LeafletEvent } from 'leaflet';
import { motion } from 'framer-motion';
import * as turf from '@turf/turf';
import { useApp } from '../context/AppContext';

// ─── River Basin Component ──────────────────────────────────────────────────
export const RiverBasins: React.FC = () => {
  const { theme } = useApp();
  const { data: riverBasinsData, isLoading, error } = useGeoJSON('river_basins.geojson');
  const { data: statesData } = useGeoJSON('india_states.geojson');
  const { data: indiaBorderData } = useGeoJSON('india_boundary.geojson');
  
  const [selectedBasin, setSelectedBasin] = useState<Feature | null>(null);
  const [intersectingStates, setIntersectingStates] = useState<string[]>([]);
  const selectedLayerRef = React.useRef<L.Path | null>(null);

  const clearSelection = () => {
    if (selectedLayerRef.current) {
      selectedLayerRef.current.setStyle({
        color: '#3B82F6',
        weight: 1.5,
        opacity: 0.6
      });
      selectedLayerRef.current = null;
    }
    setSelectedBasin(null);
  };

  useEffect(() => {
    if (selectedBasin && statesData?.features) {
      try {
        const states = statesData.features
          .filter(state => turf.booleanIntersects(selectedBasin, state))
          .map(state => state.properties?.State || state.properties?.STATE || 'Unknown');
        setIntersectingStates([...new Set(states)]);
      } catch (e) {
        console.error("Intersection check failed", e);
        setIntersectingStates([]);
      }
    } else {
      setIntersectingStates([]);
    }
  }, [selectedBasin, statesData]);

  const layers = [
    { id: 'state_borders', name: 'State Boundaries', category: 'administrative' as const },
    { id: 'river_basins_layer', name: 'Major River Networks', category: 'other' as const },
  ];

  const onEachFeature = (feature: Feature, layer: Layer) => {
    const props = feature.properties as Record<string, unknown>;
    
    // Bind tooltip
    const tooltipContent = `
      <div style="font-family: 'Inter', sans-serif; min-width: 150px;">
        <div style="font-size: 13px; font-weight: 700; color: #00D4FF; margin-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 4px;">
          ${props.rivname ?? 'Unknown River'}
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px;">
          <span style="color: rgba(255,255,255,0.6);">Basin</span>
          <span style="color: white; font-weight: 600;">${props.ba_name ?? '—'}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 11px;">
          <span style="color: rgba(255,255,255,0.6);">Length</span>
          <span style="color: white; font-weight: 600;">${((props.shape_Leng as number) / 1000).toFixed(1)} km</span>
        </div>
      </div>
    `;
    
    layer.bindTooltip(tooltipContent, {
      sticky: true,
      className: 'leaflet-tooltip-dark',
      opacity: 1,
    });

    layer.on({
      mouseover: (e: LeafletEvent) => {
        const le = e as LeafletMouseEvent;
        const target = le.target as L.Path;
        const pathElement = (target as any)._path;
        if (pathElement) {
          pathElement.style.cursor = 'pointer';
        }
        if (selectedLayerRef.current !== target) {
          target.setStyle({ weight: 3, color: '#00D4FF', opacity: 1 });
          target.bringToFront();
        }
      },
      mouseout: (e: LeafletEvent) => {
        const le = e as LeafletMouseEvent;
        const target = le.target as L.Path;
        if (selectedLayerRef.current !== target) {
          target.setStyle({ weight: 1.5, color: '#3B82F6', opacity: 0.6 });
        }
      },
      click: (e: LeafletEvent) => {
        const le = e as LeafletMouseEvent;
        const target = le.target as L.Path;

        if (selectedLayerRef.current && selectedLayerRef.current !== target) {
          selectedLayerRef.current.setStyle({
            color: '#3B82F6',
            weight: 1.5,
            opacity: 0.6
          });
        }

        selectedLayerRef.current = target;
        target.setStyle({
          color: '#00FFC4',
          weight: 4,
          opacity: 1
        });
        target.bringToFront();

        if ('getBounds' in le.target) {
          const map = le.target._map;
          if (map) map.fitBounds((le.target as any).getBounds(), { padding: [40, 40] });
        }
        setSelectedBasin(feature);
      },
    });
  };

  const styleFeature = () => {
    return {
      color: '#3B82F6',
      weight: 1.5,
      opacity: 0.6,
      fillColor: 'transparent',
    };
  };

  const isDark = theme === 'dark';

  const stateStyle = () => {
    return {
      color: isDark ? '#ffffff' : '#0f172a',
      weight: isDark ? 1 : 1.5,
      opacity: isDark ? 0.2 : 0.45,
      fillOpacity: 0,
    };
  };

  const props = selectedBasin?.properties as Record<string, unknown> | undefined;

  return (
    <MapProvider>
      <div className="min-h-screen bg-background p-4 lg:p-8 flex flex-col gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FiActivity className="text-primary text-lg" />
            <h1 className="text-2xl font-bold tracking-tight">National River Basin GIS Modeler</h1>
          </div>
          <p className="text-xs text-white/50">
            Hydrological classification mapping major river networks, basin catchments, and flow lengths
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Summary info */}
          <div className="lg:col-span-4 flex flex-col gap-6 order-2 lg:order-1">
            
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <GlassCard>
                <h2 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-white/10 pb-3 mb-4">
                  Hydrological Statistics
                </h2>
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center bg-white/[0.02] p-3.5 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2">
                      <FiMap className="text-primary text-base" />
                      <span className="text-xs font-semibold text-white/70">River Segments Mapped</span>
                    </div>
                    <span className="text-xs font-bold font-mono text-white">
                      {riverBasinsData ? riverBasinsData.features.length : '—'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center bg-white/[0.02] p-3.5 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2">
                      <FiActivity className="text-accent text-base" />
                      <span className="text-xs font-semibold text-white/70">Primary Basin Groups</span>
                    </div>
                    <span className="text-xs font-bold font-mono text-primary">25+</span>
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            {/* Selected Basin Details */}
            {selectedBasin && props ? (
              <GlassCard>
                <div className="flex justify-between items-center mb-3 pb-3 border-b border-white/10">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-accent">Selected River</h2>
                  <button onClick={clearSelection} className="text-white/30 hover:text-white/70 text-xs">× Clear</button>
                </div>
                <div className="flex flex-col gap-3">
                  <p className="text-base font-bold text-white">
                    {String(props.rivname ?? 'Unknown')}
                  </p>
                  {[
                    { label: 'Basin Name', value: String(props.ba_name ?? '—') },
                    { label: 'Sub Basin', value: String(props.sub_basin ?? '—') },
                    { label: 'Length', value: `${((props.shape_Leng as number) / 1000).toFixed(2)} km` },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-start gap-4 bg-white/[0.02] p-2.5 rounded-lg border border-white/5">
                      <span className="text-xs text-white/50 shrink-0">{label}</span>
                      <span className="text-xs font-bold text-white text-right">{value}</span>
                    </div>
                  ))}
                  
                  <div className="flex justify-between items-start gap-4 bg-white/[0.02] p-2.5 rounded-lg border border-white/5">
                    <span className="text-xs text-white/50 shrink-0">Crosses States</span>
                    <span className="text-xs font-bold text-accent text-right">
                      {intersectingStates.length > 0 ? intersectingStates.join(', ') : 'Calculating...'}
                    </span>
                  </div>
                </div>
              </GlassCard>
            ) : (
              <GlassCard hoverable={false}>
                <div className="flex items-start gap-3 text-white/40">
                  <FiInfo size={15} className="shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed">
                    Click any river segment on the map to view detailed basin classification, length metrics, and states it crosses.
                  </p>
                </div>
              </GlassCard>
            )}

            <GlassCard>
              <h2 className="text-xs font-bold uppercase tracking-wider text-accent border-b border-white/10 pb-3 mb-3">
                Methodology Notes
              </h2>
              <p className="text-xs text-white/50 leading-relaxed">
                River networks are extracted from GIS line geometries. The dataset categorizes major and minor river systems, attributing them to primary basins (e.g. Ganga, Godavari, Krishna) to support hydrological flow analysis.
              </p>
            </GlassCard>
          </div>

          {/* Right Map workspace */}
          <div id="gis-basins-container" className="lg:col-span-8 h-[650px] relative order-1 lg:order-2 bg-background rounded-2xl overflow-hidden border border-white/10">
            {isLoading && <MapSkeleton />}
            {error && (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-white/50">
                  <FiLayers size={32} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-medium">Map data unavailable</p>
                  <p className="text-xs mt-1">Failed to load river basins GeoJSON.</p>
                </div>
              </div>
            )}
            {!isLoading && !error && (
              <MapViewer>
                {/* India national boundary underneath */}
                {indiaBorderData && (
                  <GeoJSON
                    key={`india-border-${theme}`}
                    data={indiaBorderData as GeoJsonObject}
                    style={stateStyle}
                  />
                )}
                {riverBasinsData && (
                  <GeoJSON
                    data={riverBasinsData as GeoJsonObject}
                    style={styleFeature}
                    onEachFeature={onEachFeature}
                  />
                )}
              </MapViewer>
            )}

            <div className="absolute top-4 left-4 z-[400]">
              <GISToolbar mapContainerId="gis-basins-container" />
            </div>

            <div className="absolute top-4 right-4 z-[400] hidden sm:block">
              <LayerControl layers={layers} />
            </div>
          </div>
        </div>
      </div>
    </MapProvider>
  );
};

export default RiverBasins;
