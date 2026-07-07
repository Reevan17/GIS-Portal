import React, { useState } from 'react';
import { MapProvider } from '../context/MapContext';
import MapViewer from '../components/map/MapViewer';
import GISToolbar from '../components/map/GISToolbar';
import GlassCard from '../components/common/GlassCard';
import StationMarkers from '../components/map/StationMarkers';
import { useGeoJSON } from '../hooks/useGeoJSON';
import { MapSkeleton } from '../components/common/LoadingSkeleton';
import type { StationCollection } from '../types';
import { FiDroplet, FiMapPin, FiAlertTriangle, FiCheckCircle, FiSearch, FiInfo } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { GeoJSON } from 'react-leaflet';

// ─── Station marker legend ─────────────────────────────────────────────────────
const STATION_LEGEND = [
  { color: '#00D4FF', label: 'Shallow / Recharge Zone (< 2m)' },
  { color: '#22C55E', label: 'Normal Water Level (2–5m)' },
  { color: '#F59E0B', label: 'Deep Level (5–10m)' },
  { color: '#EF4444', label: 'Critical — Very Deep (> 10m)' },
  { color: '#94A3B8', label: 'No Data Available' },
];

// ─── Compute summary stats from station data ───────────────────────────────────
function computeStationStats(data: StationCollection | null) {
  if (!data?.features?.length) return null;
  const total = data.features.length;

  const preLevels = data.features
    .map(f => f.properties?.WLS_Pre)
    .filter((v): v is number => typeof v === 'number' && !isNaN(v));

  const avgPre = preLevels.length
    ? preLevels.reduce((a, b) => a + b, 0) / preLevels.length
    : null;

  const critical = preLevels.filter(v => v > 10).length;
  const states = new Set(data.features.map(f => f.properties?.STATE).filter(Boolean));

  return { total, avgPre, critical, stateCount: states.size };
}

// ─── Component ────────────────────────────────────────────────────────────────
export const WaterQuality: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStation, setSelectedStation] = useState<Record<string, unknown> | null>(null);

  const { data: stationData, isLoading, error } = useGeoJSON('groundwater_quality_stations.geojson');
  const { data: statesData } = useGeoJSON('india_states.geojson');
  const stats = computeStationStats(stationData as StationCollection | null);

  // Filter stations for sidebar list
  const filteredStations = stationData?.features
    ?.filter(f => {
      if (!searchTerm) return true;
      const q = searchTerm.toLowerCase();
      return (
        String(f.properties?.STATION_NA ?? '').toLowerCase().includes(q) ||
        String(f.properties?.STATE ?? '').toLowerCase().includes(q) ||
        String(f.properties?.DISTRICT ?? '').toLowerCase().includes(q)
      );
    })
    .slice(0, 30) ?? [];

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

        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FiDroplet className="text-primary text-lg" />
              <h1 className="text-2xl font-bold tracking-tight">Groundwater Quality Station Network</h1>
            </div>
            <p className="text-xs text-white/50">
              Explore monitoring stations with pre/post-monsoon water level data and long-term trends
            </p>
          </div>
        </div>

        {/* KPI Bar */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          >
            {[
              { label: 'Total Stations', value: stats.total.toLocaleString('en-IN'), icon: FiMapPin, color: '#00D4FF' },
              { label: 'States Covered', value: String(stats.stateCount), icon: FiDroplet, color: '#38BDF8' },
              { label: 'Critical Stations', value: String(stats.critical), icon: FiAlertTriangle, color: '#EF4444' },
              { label: 'Avg Pre-Monsoon WL', value: stats.avgPre != null ? `${stats.avgPre.toFixed(2)} m` : 'N/A', icon: FiCheckCircle, color: '#10B981' },
            ].map(({ label, value, icon: Icon, color }) => (
              <GlassCard key={label} padding="p-4" hoverable={false}>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${color}18`, color }}>
                    <Icon size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] text-white/40 uppercase tracking-wider font-bold">{label}</p>
                    <p className="text-base font-bold font-mono text-white mt-0.5">{value}</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </motion.div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Left Panel */}
          <div className="lg:col-span-4 flex flex-col gap-4 order-2 lg:order-1">

            {/* Station search */}
            <GlassCard>
              <div className="flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5">
                <FiSearch className="text-white/30" size={14} />
                <input
                  type="text"
                  placeholder="Search stations by name, state, district..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="flex-1 bg-transparent text-xs text-white placeholder-white/30 outline-none"
                />
              </div>
              <p className="text-[10px] text-white/30 mt-2">
                Showing {filteredStations.length} of {stationData?.features?.length ?? 0} stations
              </p>
            </GlassCard>

            {/* Station list */}
            <GlassCard padding="p-0">
              <div className="max-h-[300px] overflow-y-auto divide-y divide-white/5">
                {filteredStations.length === 0 ? (
                  <div className="p-6 text-center text-xs text-white/30">
                    {isLoading ? 'Loading stations...' : 'No stations found'}
                  </div>
                ) : (
                  filteredStations.map((f, i) => {
                    const props = f.properties;
                    const wl = props?.WLS_Pre;
                    const hasData = wl != null;
                    const dotColor = !hasData ? '#94A3B8' : wl > 10 ? '#EF4444' : wl > 5 ? '#F59E0B' : wl > 2 ? '#22C55E' : '#00D4FF';

                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedStation(props as Record<string, unknown>)}
                        className={`w-full px-4 py-3 flex items-start gap-3 text-left hover:bg-white/[0.03] transition ${
                          selectedStation === props ? 'bg-primary/5 border-l-2 border-primary' : ''
                        }`}
                      >
                        <div className="w-2.5 h-2.5 rounded-full mt-0.5 shrink-0" style={{ backgroundColor: dotColor }} />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white truncate">
                            {String(props?.STATION_NA ?? 'Unknown')}
                          </p>
                          <p className="text-[10px] text-white/40 truncate mt-0.5">
                            {String(props?.DISTRICT ?? '—')}, {String(props?.STATE ?? '—')}
                          </p>
                          {hasData && (
                            <p className="text-[10px] font-mono text-white/60 mt-0.5">
                              Pre: {Number(wl).toFixed(2)}m
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </GlassCard>

            {/* Selected station details */}
            {selectedStation ? (
              <GlassCard>
                <div className="flex justify-between items-center mb-3 pb-3 border-b border-white/10">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-accent">Station Details</h2>
                  <button onClick={() => setSelectedStation(null)} className="text-white/30 hover:text-white/70 text-xs">× Clear</button>
                </div>
                <p className="text-sm font-bold text-white mb-3">{String(selectedStation.STATION_NA ?? '—')}</p>
                {[
                  { label: 'State', value: String(selectedStation.STATE ?? '—') },
                  { label: 'District', value: String(selectedStation.DISTRICT ?? '—') },
                  { label: 'Site Type', value: String(selectedStation.SITE_TYPE ?? '—') },
                  { label: 'Pre-Monsoon WL', value: selectedStation.WLS_Pre != null ? `${Number(selectedStation.WLS_Pre).toFixed(2)} m` : 'N/A' },
                  { label: 'Post-Monsoon WL', value: selectedStation.WLS_Post != null ? `${Number(selectedStation.WLS_Post).toFixed(2)} m` : 'N/A' },
                  { label: 'Long-Term Trend', value: String(selectedStation.WLS_Long_T ?? 'N/A') },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center py-1.5 border-b border-white/5 last:border-0">
                    <span className="text-xs text-white/40">{label}</span>
                    <span className="text-xs font-semibold text-white">{value}</span>
                  </div>
                ))}
              </GlassCard>
            ) : (
              <GlassCard hoverable={false}>
                <div className="flex items-start gap-3 text-white/40">
                  <FiInfo size={15} className="shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed">
                    Click a station in the list or on the map to view detailed water level readings.
                  </p>
                </div>
              </GlassCard>
            )}

            {/* Legend */}
            <GlassCard hoverable={false}>
              <h2 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-3">Water Level Legend</h2>
              <div className="flex flex-col gap-2">
                {STATION_LEGEND.map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
                    <span className="text-xs text-white/60">{label}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Right Panel — Map */}
          <div id="gis-wq-container" className="lg:col-span-8 h-[700px] relative order-1 lg:order-2 bg-background rounded-2xl overflow-hidden border border-white/10">
            {isLoading && <MapSkeleton />}
            {error && (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-white/50">
                  <FiDroplet size={32} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-medium">Station data not available</p>
                  <p className="text-xs mt-1 max-w-[240px]">Run the preprocessing script to generate station data.</p>
                </div>
              </div>
            )}
            {!isLoading && !error && (
              <MapViewer>
                {/* State borders underneath */}
                {statesData && (
                  <GeoJSON
                    key="wq-state-borders"
                    data={statesData as any}
                    style={stateStyle}
                  />
                )}
                {stationData && (
                  <StationMarkers data={stationData as StationCollection} showLabels />
                )}
              </MapViewer>
            )}

            <div className="absolute top-4 left-4 z-[400]">
              <GISToolbar mapContainerId="gis-wq-container" />
            </div>
          </div>
        </div>
      </div>
    </MapProvider>
  );
};

export default WaterQuality;
