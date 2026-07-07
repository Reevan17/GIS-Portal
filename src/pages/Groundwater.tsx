import React, { useState } from 'react';
import { MapProvider } from '../context/MapContext';
import { useApp } from '../context/AppContext';
import MapViewer from '../components/map/MapViewer';
import LayerControl from '../components/map/LayerControl';
import GISToolbar from '../components/map/GISToolbar';
import Legend from '../components/map/Legend';
import YearSelector from '../components/common/YearSelector';
import GlassCard from '../components/common/GlassCard';
import ChoroplethLayer from '../components/map/ChoroplethLayer';
import { GROUNDWATER_LEGEND } from '../utils/colorScales';
import { useGeoJSON } from '../hooks/useGeoJSON';
import { MapSkeleton } from '../components/common/LoadingSkeleton';
import type { GroundwaterStateCollection } from '../types';
import type { GeoJsonObject } from 'geojson';
import { motion } from 'framer-motion';
import { FiAlertTriangle, FiCheckCircle, FiPercent, FiInfo, FiDatabase, FiLayers } from 'react-icons/fi';

// ─── Data helpers ──────────────────────────────────────────────────────────────

const DISTRICT_STATES_LIST = ['Karnataka', 'Kerala', 'Tamil Nadu'] as const;
type DistrictState = typeof DISTRICT_STATES_LIST[number];
const STATE_FILE_PREFIX: Record<DistrictState, string> = {
  Karnataka: 'karnataka',
  Kerala: 'kerala',
  'Tamil Nadu': 'tamilnadu',
};

function computeGWStats(data: GroundwaterStateCollection | null) {
  if (!data?.features?.length) return null;
  const stages = data.features
    .map(f => f.properties?.Stage_of_G)
    .filter((v): v is number => typeof v === 'number' && !isNaN(v));
  if (!stages.length) return null;

  const avg = stages.reduce((a, b) => a + b, 0) / stages.length;
  const catCounts = { Safe: 0, 'Semi-Critical': 0, Critical: 0, 'Over-Exploited': 0 };
  stages.forEach(s => {
    if (s > 100) catCounts['Over-Exploited']++;
    else if (s > 90) catCounts['Critical']++;
    else if (s > 70) catCounts['Semi-Critical']++;
    else catCounts['Safe']++;
  });

  const totalDraft = data.features.reduce((sum, f) => sum + (f.properties?.Total_Curr ?? 0), 0);
  const totalReplenish = data.features.reduce((sum, f) => sum + (f.properties?.Annual_Rep ?? 0), 0);

  return { avg, catCounts, totalDraft, totalReplenish, total: stages.length };
}

// ─── Component ────────────────────────────────────────────────────────────────

export const Groundwater: React.FC = () => {
  const { selectedYear, setSelectedYear } = useApp();
  const [activeTab, setActiveTab] = useState<'state' | 'district'>('state');
  const [focusState, setFocusState] = useState<DistrictState>('Karnataka');
  const [selectedFeature, setSelectedFeature] = useState<Record<string, unknown> | null>(null);

  // State-level GW data
  const { data: gwStateData, isLoading: stateLoading, error: stateError } =
    useGeoJSON(activeTab === 'state' ? `groundwater_states_${selectedYear}.geojson` : null);

  // District-level GW data
  const districtFilePrefix = STATE_FILE_PREFIX[focusState];
  const { data: gwDistrictData, isLoading: districtLoading, error: districtError } =
    useGeoJSON(activeTab === 'district' ? `${districtFilePrefix}_groundwater_${selectedYear}.geojson` : null);

  const isLoading = stateLoading || districtLoading;
  const error = stateError || districtError;
  const activeData = activeTab === 'state'
    ? gwStateData
    : gwDistrictData
      ? {
          ...gwDistrictData,
          features: gwDistrictData.features.filter((f: any) => {
            const stateProp = (f.properties?.STATE_UT || f.properties?.STATE || '').toLowerCase().replace(/\s+/g, '');
            const targetState = focusState.toLowerCase().replace(/\s+/g, '');
            return stateProp === targetState;
          })
        }
      : null;
  const stats = computeGWStats(gwStateData as GroundwaterStateCollection | null);

  const layers = [
    { id: 'gw_layer', name: activeTab === 'state' ? `GW States (${selectedYear})` : `${focusState} Districts (${selectedYear})`, category: 'groundwater_state' },
  ];

  const GW_CAT_CONFIG = [
    { label: 'Safe', range: '< 70%', color: '#10B981', key: 'Safe' },
    { label: 'Semi-Critical', range: '70–90%', color: '#F59E0B', key: 'Semi-Critical' },
    { label: 'Critical', range: '90–100%', color: '#F97316', key: 'Critical' },
    { label: 'Over-Exploited', range: '> 100%', color: '#EF4444', key: 'Over-Exploited' },
  ] as const;

  return (
    <MapProvider>
      <div className="min-h-screen bg-background p-4 lg:p-8 flex flex-col gap-6">

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FiDatabase className="text-primary text-lg" />
              <h1 className="text-2xl font-bold tracking-tight">National Groundwater Aquifer Assessment</h1>
            </div>
            <p className="text-xs text-white/50">
              Model replenishable groundwater draft, extraction stages, and aquifer health metrics ({selectedYear})
            </p>
          </div>
          <div className="w-full md:w-auto shrink-0">
            <YearSelector selectedYear={selectedYear} onYearChange={setSelectedYear} showPlayback />
          </div>
        </div>

        {/* ── KPI Bar ── */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          >
            {[
              { label: 'Avg Extraction Stage', value: `${stats.avg.toFixed(1)}%`, icon: FiPercent, color: '#00D4FF' },
              { label: 'Over-Exploited Zones', value: String(stats.catCounts['Over-Exploited']), icon: FiAlertTriangle, color: '#EF4444' },
              { label: 'Total Annual Draft', value: `${stats.totalDraft.toFixed(0)} BCM`, icon: FiDatabase, color: '#F59E0B' },
              { label: 'Total Replenishment', value: `${stats.totalReplenish.toFixed(0)} BCM`, icon: FiCheckCircle, color: '#10B981' },
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

        {/* ── Tab Switcher ── */}
        <div className="flex items-center gap-2 pb-1.5 border-b border-white/5">
          <button
            onClick={() => setActiveTab('state')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition ${
              activeTab === 'state'
                ? 'bg-primary text-[#08111F] shadow-[0_0_12px_rgba(0,212,255,0.25)]'
                : 'text-white/60 hover:bg-white/5 hover:text-white'
            }`}
          >
            National State View
          </button>
          <button
            onClick={() => setActiveTab('district')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition ${
              activeTab === 'district'
                ? 'bg-primary text-[#08111F] shadow-[0_0_12px_rgba(0,212,255,0.25)]'
                : 'text-white/60 hover:bg-white/5 hover:text-white'
            }`}
          >
            District Deep-Dive {activeTab === 'district' ? `(${focusState})` : ''}
          </button>
        </div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Left Panel */}
          <div className="lg:col-span-4 flex flex-col gap-4 order-2 lg:order-1">

            {/* District State selector */}
            {activeTab === 'district' && (
              <GlassCard>
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 block mb-3">Focus Territory</span>
                <div className="flex flex-col gap-2">
                  {DISTRICT_STATES_LIST.map((state) => (
                    <button
                      key={state}
                      onClick={() => setFocusState(state)}
                      className={`w-full px-4 py-3 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition ${
                        focusState === state
                          ? 'bg-primary/10 border-primary/40 text-white'
                          : 'bg-white/[0.02] border-white/5 text-white/70 hover:border-white/10'
                      }`}
                    >
                      <span>{state} Districts</span>
                      <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded">GW Active</span>
                    </button>
                  ))}
                </div>
              </GlassCard>
            )}

            {/* Category Distribution */}
            {stats && activeTab === 'state' && (
              <GlassCard>
                <h2 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-white/10 pb-3 mb-4">
                  Aquifer Health Distribution
                </h2>
                <div className="flex flex-col gap-2.5">
                  {GW_CAT_CONFIG.map(({ label, range, color, key }) => {
                    const count = stats.catCounts[key] ?? 0;
                    const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
                    return (
                      <div key={label}>
                        <div className="flex justify-between items-center text-xs mb-1">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                            <span className="text-white/70 font-medium">{label}</span>
                            <span className="text-white/30 text-[10px]">{range}</span>
                          </div>
                          <span className="text-white/80 font-mono font-bold">{count}</span>
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

            {/* Selected Feature info */}
            {selectedFeature ? (
              <GlassCard>
                <div className="flex justify-between items-center mb-3 pb-3 border-b border-white/10">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-accent">Selected Region</h2>
                  <button onClick={() => setSelectedFeature(null)} className="text-white/30 hover:text-white/70 text-xs">× Clear</button>
                </div>
                <div className="flex flex-col gap-3">
                  <p className="text-base font-bold text-white">
                    {String(selectedFeature.State ?? selectedFeature.District ?? '—')}
                  </p>
                  {[
                    { label: 'Annual Replenishment', value: `${Number(selectedFeature.Annual_Rep ?? 0).toFixed(2)} BCM` },
                    { label: 'Net GW Availability', value: `${Number(selectedFeature.Net_GW ?? 0).toFixed(2)} BCM` },
                    { label: 'Total Draft', value: `${Number(selectedFeature.Total_Curr ?? 0).toFixed(2)} BCM` },
                    { label: 'GW Available Future', value: `${Number(selectedFeature.GW_Availab ?? 0).toFixed(2)} BCM` },
                    { label: 'Extraction Stage', value: `${Number(selectedFeature.Stage_of_G ?? 0).toFixed(1)}%` },
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
                    Click any region on the map to view detailed groundwater aquifer metrics.
                  </p>
                </div>
              </GlassCard>
            )}

            {/* Legend info */}
            <GlassCard hoverable={false}>
              <h2 className="text-xs font-bold uppercase tracking-wider text-white/40 border-b border-white/10 pb-3 mb-3">
                <FiLayers className="inline mr-1" />
                Classification Method
              </h2>
              <p className="text-xs text-white/40 leading-relaxed">
                Classification based on CGWB's Stage of Groundwater Extraction: ratio of total annual groundwater draft to net annual groundwater availability × 100%.
              </p>
            </GlassCard>
          </div>

          {/* Right Panel — Map */}
          <div id="gis-gw-container" className="lg:col-span-8 h-[620px] relative order-1 lg:order-2">
            {isLoading && <MapSkeleton />}
            {error && (
              <div className="w-full h-full flex items-center justify-center bg-white/[0.03] border border-white/10 rounded-2xl">
                <div className="text-center text-white/50">
                  <FiDatabase size={32} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-medium">Data not yet available</p>
                  <p className="text-xs mt-1 max-w-[240px]">Run the preprocessing script to generate GeoJSON data files.</p>
                </div>
              </div>
            )}
            {!isLoading && !error && (
              <MapViewer>
                {activeData && (
                  <ChoroplethLayer
                    data={activeData as GeoJsonObject}
                    mode={activeTab === 'state' ? 'groundwater_state' : 'groundwater_district'}
                    onFeatureClick={setSelectedFeature}
                    opacity={0.75}
                  />
                )}
              </MapViewer>
            )}

            <div className="absolute top-4 left-4 z-[400]">
              <GISToolbar mapContainerId="gis-gw-container" />
            </div>
            <div className="absolute top-4 right-4 z-[400] hidden sm:block">
              <LayerControl layers={layers} />
            </div>
            <div className="absolute bottom-6 right-6 z-[400]">
              <Legend title="GW Extraction Stage" items={GROUNDWATER_LEGEND} />
            </div>
          </div>
        </div>
      </div>
    </MapProvider>
  );
};

export default Groundwater;
