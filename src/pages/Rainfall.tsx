import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MapProvider } from '../context/MapContext';
import MapViewer from '../components/map/MapViewer';
import LayerControl from '../components/map/LayerControl';
import GISToolbar from '../components/map/GISToolbar';
import Legend from '../components/map/Legend';
import YearSelector from '../components/common/YearSelector';
import GlassCard from '../components/common/GlassCard';
import ChoroplethLayer from '../components/map/ChoroplethLayer';
import { RAINFALL_LEGEND } from '../utils/colorScales';
import { useGeoJSON } from '../hooks/useGeoJSON';
import { MapSkeleton } from '../components/common/LoadingSkeleton';
import { FiTrendingUp, FiClock, FiLayers, FiInfo, FiCloud, FiDroplet } from 'react-icons/fi';
import { motion } from 'framer-motion';
import type { RainfallCollection } from '../types';
import type { GeoJsonObject } from 'geojson';

// ── Rainfall category ranking metadata ────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  'Very Low': '#EF4444',
  'Low': '#F97316',
  'Moderate': '#EAB308',
  'High': '#22C55E',
  'Very High': '#3B82F6',
};

const CATEGORY_THRESHOLDS = [
  { label: 'Very Low', range: '< 400 mm', color: '#EF4444' },
  { label: 'Low', range: '400 – 800 mm', color: '#F97316' },
  { label: 'Moderate', range: '800 – 1200 mm', color: '#EAB308' },
  { label: 'High', range: '1200 – 2000 mm', color: '#22C55E' },
  { label: 'Very High', range: '> 2000 mm', color: '#3B82F6' },
];

// ── Helper to compute summary stats from GeoJSON ──────────────────────────────
function computeRainfallStats(data: RainfallCollection | null) {
  if (!data?.features?.length) return null;

  const values = data.features
    .map(f => f.properties?.rainfall)
    .filter((v): v is number => typeof v === 'number' && !isNaN(v));

  if (!values.length) return null;

  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const max = Math.max(...values);
  const min = Math.min(...values);

  // Category counts
  const catCounts: Record<string, number> = {};
  data.features.forEach(f => {
    const cat = f.properties?.rain_categ ?? 'Unknown';
    catCounts[cat] = (catCounts[cat] ?? 0) + 1;
  });

  const topState = data.features.reduce((top, f) =>
    (f.properties?.rainfall ?? 0) > (top.properties?.rainfall ?? 0) ? f : top,
    data.features[0]
  );
  const bottomState = data.features.reduce((bot, f) =>
    (f.properties?.rainfall ?? Infinity) < (bot.properties?.rainfall ?? Infinity) ? f : bot,
    data.features[0]
  );

  return { avg, max, min, catCounts, topState, bottomState, total: values.length };
}

// ── Component ─────────────────────────────────────────────────────────────────
export const Rainfall: React.FC = () => {
  const { selectedYear, setSelectedYear } = useApp();
  const [selectedFeature, setSelectedFeature] = useState<Record<string, unknown> | null>(null);

  const { data: rainfallData, isLoading, error } = useGeoJSON(`rainfall_${selectedYear}.geojson`);
  const stats = computeRainfallStats(rainfallData as RainfallCollection | null);

  const layers = [
    { id: 'rainfall_layer', name: `Precipitation (${selectedYear})`, category: 'rainfall' },
  ];

  return (
    <MapProvider>
      <div className="min-h-screen bg-background p-4 lg:p-8 flex flex-col gap-6">

        {/* ── Page Header ── */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FiCloud className="text-primary text-lg" />
              <h1 className="text-2xl font-bold tracking-tight">National Precipitation GIS Viewer</h1>
            </div>
            <p className="text-xs text-white/50">
              Explore state-wise rainfall levels and meteorological categorization across India ({selectedYear})
            </p>
          </div>
          <div className="w-full md:w-auto shrink-0">
            <YearSelector selectedYear={selectedYear} onYearChange={setSelectedYear} showPlayback />
          </div>
        </div>

        {/* ── Summary KPI bar ── */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          >
            {[
              { label: 'Avg Rainfall', value: `${Math.round(stats.avg).toLocaleString('en-IN')} mm`, icon: FiDroplet, color: '#00D4FF' },
              { label: 'Highest', value: `${Math.round(stats.max).toLocaleString('en-IN')} mm`, icon: FiTrendingUp, color: '#22C55E' },
              { label: 'Lowest', value: `${Math.round(stats.min).toLocaleString('en-IN')} mm`, icon: FiTrendingUp, color: '#EF4444' },
              { label: 'States Mapped', value: `${stats.total}`, icon: FiLayers, color: '#38BDF8' },
            ].map(({ label, value, icon: Icon, color }) => (
              <GlassCard key={label} padding="p-4" hoverable={false}>
                <div className="flex items-center gap-3">
                  <div
                    className="p-2.5 rounded-xl"
                    style={{ backgroundColor: `${color}18`, color }}
                  >
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

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Left Panel */}
          <div className="lg:col-span-4 flex flex-col gap-4 order-2 lg:order-1">

            {/* Category Distribution */}
            {stats?.catCounts && (
              <GlassCard>
                <h2 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-white/10 pb-3 mb-4">
                  Category Distribution
                </h2>
                <div className="flex flex-col gap-2.5">
                  {CATEGORY_THRESHOLDS.map(({ label, range, color }) => {
                    const count = stats.catCounts[label] ?? 0;
                    const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
                    return (
                      <div key={label}>
                        <div className="flex justify-between items-center text-xs mb-1">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                            <span className="text-white/70 font-medium">{label}</span>
                            <span className="text-white/30 text-[10px]">{range}</span>
                          </div>
                          <span className="text-white/80 font-mono font-bold">{count} states</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>
            )}

            {/* Selected Feature Info */}
            {selectedFeature ? (
              <GlassCard>
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/10">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-accent">
                    Selected Region
                  </h2>
                  <button
                    onClick={() => setSelectedFeature(null)}
                    className="text-white/30 hover:text-white/70 text-xs transition"
                  >
                    × Clear
                  </button>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: CATEGORY_COLORS[selectedFeature.rain_categ as string] ?? '#94A3B8' }}
                    />
                    <span className="text-base font-bold text-white">{String(selectedFeature.State ?? '—')}</span>
                  </div>
                  {[
                    { label: 'Rainfall', value: `${Number(selectedFeature.rainfall ?? 0).toLocaleString('en-IN')} mm` },
                    { label: 'Category', value: String(selectedFeature.rain_categ ?? '—') },
                    { label: 'National Rank', value: `#${selectedFeature.rank ?? '—'}` },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center bg-white/[0.02] p-2.5 rounded-lg border border-white/5">
                      <span className="text-xs text-white/50">{label}</span>
                      <span className="text-xs font-bold text-white">{value}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            ) : (
              <GlassCard hoverable={false}>
                <div className="flex items-center gap-3 text-white/40">
                  <FiInfo size={16} />
                  <p className="text-xs leading-relaxed">
                    Click any state on the map to view detailed precipitation data for <strong className="text-primary">{selectedYear}</strong>.
                  </p>
                </div>
              </GlassCard>
            )}

            {/* Extremes */}
            {stats && (
              <GlassCard>
                <h2 className="text-xs font-bold uppercase tracking-wider text-accent border-b border-white/10 pb-3 mb-4">
                  Rainfall Extremes
                </h2>
                <div className="flex flex-col gap-3">
                  <div>
                    <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider block mb-1">Highest</span>
                    <div className="flex justify-between items-center bg-green-500/5 border border-green-500/20 rounded-lg p-2.5">
                      <span className="text-xs font-semibold text-white">
                        {String(stats.topState?.properties?.State ?? '—')}
                      </span>
                      <span className="text-xs font-bold font-mono text-green-400">
                        {Number(stats.topState?.properties?.rainfall ?? 0).toLocaleString('en-IN')} mm
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider block mb-1">Lowest</span>
                    <div className="flex justify-between items-center bg-red-500/5 border border-red-500/20 rounded-lg p-2.5">
                      <span className="text-xs font-semibold text-white">
                        {String(stats.bottomState?.properties?.State ?? '—')}
                      </span>
                      <span className="text-xs font-bold font-mono text-red-400">
                        {Number(stats.bottomState?.properties?.rainfall ?? 0).toLocaleString('en-IN')} mm
                      </span>
                    </div>
                  </div>
                </div>
              </GlassCard>
            )}

            {/* Year timeline */}
            <GlassCard>
              <h2 className="text-xs font-bold uppercase tracking-wider text-white/40 border-b border-white/10 pb-3 mb-4">
                Observation Period
              </h2>
              <div className="flex items-center gap-2">
                <FiClock className="text-primary" />
                <span className="text-sm font-mono font-bold text-white">
                  {selectedYear} IMD Data
                </span>
              </div>
              <p className="text-xs text-white/40 mt-2 leading-relaxed">
                Source: India Meteorological Department (IMD). Annual rainfall is computed as cumulative precipitation across all seasons.
              </p>
            </GlassCard>
          </div>

          {/* Right Panel — Map */}
          <div id="gis-rainfall-container" className="lg:col-span-8 h-[620px] relative order-1 lg:order-2">
            {isLoading && <MapSkeleton />}
            {error && (
              <div className="w-full h-full flex items-center justify-center bg-white/[0.03] border border-white/10 rounded-2xl">
                <div className="text-center text-white/50">
                  <FiCloud size={32} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-medium">Data not yet processed</p>
                  <p className="text-xs mt-1 max-w-[240px]">Run the preprocessing script to generate GeoJSON data files.</p>
                </div>
              </div>
            )}
            {!isLoading && !error && (
              <MapViewer>
                {rainfallData && (
                  <ChoroplethLayer
                    data={rainfallData as GeoJsonObject}
                    mode="rainfall"
                    onFeatureClick={setSelectedFeature}
                    opacity={0.75}
                  />
                )}
              </MapViewer>
            )}

            {/* Floating controls */}
            <div className="absolute top-4 left-4 z-[400]">
              <GISToolbar mapContainerId="gis-rainfall-container" />
            </div>
            <div className="absolute top-4 right-4 z-[400] hidden sm:block">
              <LayerControl layers={layers} />
            </div>
            <div className="absolute bottom-6 right-6 z-[400]">
              <Legend title="Rainfall Legend" items={RAINFALL_LEGEND} />
            </div>
          </div>
        </div>
      </div>
    </MapProvider>
  );
};

export default Rainfall;
