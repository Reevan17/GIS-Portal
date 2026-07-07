import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import GlassCard from '../components/common/GlassCard';
import { useGeoJSON } from '../hooks/useGeoJSON';
import { MapSkeleton } from '../components/common/LoadingSkeleton';
import { FiGitBranch, FiActivity, FiLayers } from 'react-icons/fi';
import { motion } from 'framer-motion';

import { useApp } from '../context/AppContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const STATES = [
  'Andhra Pradesh', 'Karnataka', 'Kerala', 'Tamil Nadu', 
  'Maharashtra', 'Gujarat', 'Rajasthan', 'Punjab', 'Haryana'
];

export const Comparison: React.FC = () => {
  const { theme } = useApp();
  const [year1, setYear1] = useState('2020');
  const [year2, setYear2] = useState('2024');
  const [selectedState, setSelectedState] = useState('Karnataka');

  const { data: data1, isLoading: loading1 } = useGeoJSON(`groundwater_states_${year1}.geojson`);
  const { data: data2, isLoading: loading2 } = useGeoJSON(`groundwater_states_${year2}.geojson`);

  const isLoading = loading1 || loading2;

  // Extract data for the selected state from both datasets
  const getStateData = (data: any, stateName: string) => {
    if (!data?.features) return null;
    return data.features.find((f: any) => 
      f.properties?.State?.toLowerCase() === stateName.toLowerCase()
    )?.properties;
  };

  const stateData1 = getStateData(data1, selectedState);
  const stateData2 = getStateData(data2, selectedState);

  const getMetric = (data: any, key: string) => {
    return data && typeof data[key] === 'number' ? data[key] : 0;
  };

  const chartData = {
    labels: ['Annual Replenishment', 'Net GW Availability', 'Total Draft'],
    datasets: [
      {
        label: `${year1} (${selectedState})`,
        data: [
          getMetric(stateData1, 'Annual_Rep'),
          getMetric(stateData1, 'Net_GW'),
          getMetric(stateData1, 'Total_Curr')
        ],
        backgroundColor: 'rgba(0, 212, 255, 0.6)',
        borderColor: '#00D4FF',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: `${year2} (${selectedState})`,
        data: [
          getMetric(stateData2, 'Annual_Rep'),
          getMetric(stateData2, 'Net_GW'),
          getMetric(stateData2, 'Total_Curr')
        ],
        backgroundColor: 'rgba(37, 99, 235, 0.6)',
        borderColor: '#2563EB',
        borderWidth: 1,
        borderRadius: 4,
      }
    ],
  };

  const isDark = theme === 'dark';

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(15,23,42,0.7)',
          font: { family: 'Inter', size: 12, weight: 'bold' as const }
        }
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(13, 27, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: '#00D4FF',
        bodyColor: isDark ? '#ffffff' : '#0f172a',
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
      }
    },
    scales: {
      x: {
        grid: { color: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(15,23,42,0.05)' },
        ticks: { color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(15,23,42,0.6)', font: { family: 'Inter', weight: 'bold' as const } }
      },
      y: {
        grid: { color: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(15,23,42,0.05)' },
        ticks: { color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(15,23,42,0.6)', font: { family: 'Inter' } },
        title: {
          display: true,
          text: 'Billion Cubic Meters (BCM)',
          color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(15,23,42,0.5)',
          font: { family: 'Inter', size: 10 }
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 lg:p-8 flex flex-col gap-6">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <FiGitBranch className="text-primary text-lg" />
          <h1 className="text-2xl font-bold tracking-tight">Temporal Comparison Engine</h1>
        </div>
        <p className="text-xs text-white/50">
          Compare geospatial groundwater metrics across different chronological profiles.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Controls Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <GlassCard>
              <h2 className="text-sm font-bold uppercase tracking-wider text-primary border-b border-white/10 pb-3 mb-4">
                Comparison Parameters
              </h2>
              
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1.5 block">
                    Target State
                  </label>
                  <select 
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-semibold outline-none focus:border-primary transition appearance-none"
                  >
                    {STATES.map(s => <option key={s} value={s} className="bg-background">{s}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1.5 block flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-primary" /> Baseline
                    </label>
                    <select 
                      value={year1}
                      onChange={(e) => setYear1(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-white outline-none focus:border-primary transition appearance-none"
                    >
                      {['2013', '2017', '2020', '2022'].map(y => <option key={y} value={y} className="bg-background">{y}</option>)}
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1.5 block flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-secondary" /> Target
                    </label>
                    <select 
                      value={year2}
                      onChange={(e) => setYear2(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-white outline-none focus:border-secondary transition appearance-none"
                    >
                      {['2022', '2023', '2024', '2025'].map(y => <option key={y} value={y} className="bg-background">{y}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <GlassCard>
              <h2 className="text-xs font-bold uppercase tracking-wider text-accent border-b border-white/10 pb-3 mb-4">
                Extraction Delta (Stage of GW %)
              </h2>
              {isLoading ? (
                <div className="animate-pulse h-16 bg-white/5 rounded-xl" />
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center bg-white/[0.02] p-3 rounded-lg border border-white/5">
                    <span className="text-xs font-bold text-primary font-mono">{year1}</span>
                    <span className="text-sm font-bold text-white">{getMetric(stateData1, 'Stage_of_G').toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/[0.02] p-3 rounded-lg border border-white/5">
                    <span className="text-xs font-bold text-secondary font-mono">{year2}</span>
                    <span className="text-sm font-bold text-white">{getMetric(stateData2, 'Stage_of_G').toFixed(1)}%</span>
                  </div>
                  
                  {(() => {
                    const diff = getMetric(stateData2, 'Stage_of_G') - getMetric(stateData1, 'Stage_of_G');
                    const isIncrease = diff > 0;
                    return (
                      <div className={`p-3 rounded-lg border ${isIncrease ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-green-500/10 border-green-500/20 text-green-400'} flex justify-between items-center`}>
                        <span className="text-xs font-bold uppercase">Net Change</span>
                        <span className="text-sm font-bold font-mono">
                          {isIncrease ? '+' : ''}{diff.toFixed(1)}%
                        </span>
                      </div>
                    );
                  })()}
                </div>
              )}
            </GlassCard>
          </motion.div>
        </div>

        {/* Main Chart Area */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="h-full">
            <GlassCard className="h-full min-h-[500px] flex flex-col">
              <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-6">
                <FiActivity className="text-primary text-lg" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-white/80">
                  Volumetric Assessment Comparison
                </h2>
              </div>
              
              <div className="flex-1 w-full relative">
                {isLoading ? (
                  <MapSkeleton />
                ) : !stateData1 || !stateData2 ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white/40">
                    <FiLayers size={32} className="mb-3 opacity-50" />
                    <p className="text-sm">Data unavailable for the selected parameters.</p>
                  </div>
                ) : (
                  <Bar data={chartData} options={chartOptions} />
                )}
              </div>
            </GlassCard>
          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default Comparison;
