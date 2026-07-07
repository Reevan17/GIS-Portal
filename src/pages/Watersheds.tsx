import React, { useState } from 'react';
import { MapProvider } from '../context/MapContext';
import MapViewer from '../components/map/MapViewer';
import LayerControl from '../components/map/LayerControl';
import GISToolbar from '../components/map/GISToolbar';
import GlassCard from '../components/common/GlassCard';
import { useGeoJSON } from '../hooks/useGeoJSON';
import { MapSkeleton } from '../components/common/LoadingSkeleton';
import { FiTrendingUp, FiCompass, FiInfo, FiLayers } from 'react-icons/fi';
import { GeoJSON } from 'react-leaflet';
import type { GeoJsonObject, Feature } from 'geojson';
import type { Layer, LeafletMouseEvent, LeafletEvent } from 'leaflet';
import { motion } from 'framer-motion';

// ─── Watersheds Component ───────────────────────────────────────────────────
export const Watersheds: React.FC = () => {
  const { data: watershedsData, isLoading, error } = useGeoJSON('watersheds.geojson');
  const { data: statesData } = useGeoJSON('india_states.geojson');
  const [selectedWatershed, setSelectedWatershed] = useState<Record<string, unknown> | null>(null);

  const layers = [
    { id: 'watersheds_layer', name: 'Watershed Boundaries', category: 'other' },
  ];

  const getStyle = (feature?: Feature) => {
    if (!feature) return {};
    const props = feature.properties;
    const area = (props?.area_sqkm as number) ?? 0;
    
    // Scale: Small (<100), Medium (100-500), Large (>500)
    let fill = '#00D4FF';
    if (area > 1000) fill = '#8B5CF6'; // Purple
    else if (area > 500) fill = '#3B82F6'; // Blue
    else if (area > 100) fill = '#06B6D4'; // Cyan
    else fill = '#10B981'; // Green

    return {
      fillColor: fill,
      weight: 1,
      opacity: 0.6,
      color: 'rgba(255,255,255,0.2)',
      fillOpacity: 0.3,
    };
  };

  const onEachFeature = (feature: Feature, layer: Layer) => {
    const props = feature.properties as Record<string, unknown>;
    
    // Bind tooltip
    const tooltipContent = `
      <div style="font-family: 'Inter', sans-serif; min-width: 140px;">
        <div style="font-size: 13px; font-weight: 700; color: #38BDF8; margin-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 4px;">
          Watershed ${props.wscode ?? 'N/A'}
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px;">
          <span style="color: rgba(255,255,255,0.6);">Basin Code</span>
          <span style="color: white; font-weight: 600;">${props.bacode ?? '—'}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 11px;">
          <span style="color: rgba(255,255,255,0.6);">Area</span>
          <span style="color: white; font-weight: 600;">${Number(props.area_sqkm ?? 0).toFixed(2)} km²</span>
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
        target.setStyle({ weight: 2, color: '#FFFFFF', fillOpacity: 0.6 });
        target.bringToFront();
      },
      mouseout: (e: LeafletEvent) => {
        const le = e as LeafletMouseEvent;
        const target = le.target as L.Path;
        // Reapply default style
        if ((target as any).feature) {
           target.setStyle(getStyle((target as any).feature as Feature));
        }
      },
      click: (e: LeafletEvent) => {
        const le = e as LeafletMouseEvent;
        if ('getBounds' in le.target) {
          const map = le.target._map;
          if (map) map.fitBounds((le.target as any).getBounds(), { padding: [40, 40] });
        }
        setSelectedWatershed(props);
      },
    });
  };

    const stateStyle = () => {
    return {
      color: '#ffffff',
      weight: 1,
      opacity: 0.2,
      fillOpacity: 0,
    };
  };

  return (
    <MapProvider>
      <div className="min-h-screen bg-background p-4 lg:p-8 flex flex-col gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FiCompass className="text-primary text-lg" />
            <h1 className="text-2xl font-bold tracking-tight">National Watershed GIS Modeler</h1>
          </div>
          <p className="text-xs text-white/50">
            Catchment subdivisions indicating localized drainage boundaries and soil conservation units
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Summary info */}
          <div className="lg:col-span-4 flex flex-col gap-6 order-2 lg:order-1">
            
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <GlassCard>
                <h2 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-white/10 pb-3 mb-4">
                  Watershed Subdivisions
                </h2>
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center bg-white/[0.02] p-3.5 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2">
                      <FiCompass className="text-primary text-base" />
                      <span className="text-xs font-semibold text-white/70">Sub-watersheds mapped</span>
                    </div>
                    <span className="text-xs font-bold font-mono text-white">
                      {watershedsData ? watershedsData.features.length.toLocaleString() : '—'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center bg-white/[0.02] p-3.5 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2">
                      <FiTrendingUp className="text-accent text-base" />
                      <span className="text-xs font-semibold text-white/70">Avg Subdivision Size</span>
                    </div>
                    <span className="text-xs font-bold font-mono text-white">
                      {watershedsData && watershedsData.features.length > 0 
                        ? (watershedsData.features.reduce((sum, f) => sum + ((f.properties?.area_sqkm as number) || 0), 0) / watershedsData.features.length).toFixed(0) + ' km²'
                        : '—'}
                    </span>
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            {/* Selected Watershed Details */}
            {selectedWatershed ? (
              <GlassCard>
                <div className="flex justify-between items-center mb-3 pb-3 border-b border-white/10">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-accent">Selected Unit</h2>
                  <button onClick={() => setSelectedWatershed(null)} className="text-white/30 hover:text-white/70 text-xs">× Clear</button>
                </div>
                <div className="flex flex-col gap-3">
                  <p className="text-base font-bold text-white">
                    Watershed {String(selectedWatershed.wscode ?? 'N/A')}
                  </p>
                  {[
                    { label: 'Sub-Basin Code', value: String(selectedWatershed.sbcode ?? '—') },
                    { label: 'Basin Code', value: String(selectedWatershed.bacode ?? '—') },
                    { label: 'Concatenate ID', value: String(selectedWatershed.wsconc ?? '—') },
                    { label: 'Area', value: `${Number(selectedWatershed.area_sqkm ?? 0).toFixed(2)} km²` },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-start gap-4 bg-white/[0.02] p-2.5 rounded-lg border border-white/5">
                      <span className="text-xs text-white/50 shrink-0">{label}</span>
                      <span className="text-xs font-bold text-white text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            ) : (
              <GlassCard hoverable={false}>
                <div className="flex items-start gap-3 text-white/40">
                  <FiInfo size={15} className="shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed">
                    Click any watershed polygon on the map to view detailed administrative codes and area calculations.
                  </p>
                </div>
              </GlassCard>
            )}
          </div>

          {/* Right Map workspace */}
          <div id="gis-watershed-container" className="lg:col-span-8 h-[650px] relative order-1 lg:order-2 bg-background rounded-2xl overflow-hidden border border-white/10">
            {isLoading && <MapSkeleton />}
            {error && (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-white/50">
                  <FiLayers size={32} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-medium">Map data unavailable</p>
                  <p className="text-xs mt-1">Failed to load watersheds GeoJSON.</p>
                </div>
              </div>
            )}
            {!isLoading && !error && (
              <MapViewer>
                {statesData && (
                  <GeoJSON
                    data={statesData as GeoJsonObject}
                    style={stateStyle}
                  />
                )}
                {watershedsData && (
                  <GeoJSON
                    data={watershedsData as GeoJsonObject}
                    style={getStyle}
                    onEachFeature={onEachFeature}
                  />
                )}
              </MapViewer>
            )}

            <div className="absolute top-4 left-4 z-[400]">
              <GISToolbar mapContainerId="gis-watershed-container" />
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

export default Watersheds;
