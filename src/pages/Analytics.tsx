import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  DoughnutController,
  ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import GlassCard from '../components/common/GlassCard';
import { FiPieChart, FiBarChart2, FiTrendingUp, FiActivity } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  DoughnutController,
  ArcElement
);

export const Analytics: React.FC = () => {
  const { theme } = useApp();
  // Static dataset representing multi-year reports
  const years = ['2013', '2017', '2020', '2022', '2023', '2024', '2025'];
  
  const lineChartData = {
    labels: years,
    datasets: [
      {
        label: 'Average Rainfall (mm)',
        data: [1050, 1120, 1190, 1140, 1210, 1180, 1250],
        borderColor: '#00D4FF',
        backgroundColor: 'rgba(0, 212, 255, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Groundwater Draft (BCM)',
        data: [380, 395, 410, 420, 425, 437, 442],
        borderColor: '#2563EB',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        fill: true,
        tension: 0.4,
      }
    ],
  };

  const barChartData = {
    labels: ['Karnataka', 'Kerala', 'Tamil Nadu', 'Maharashtra', 'Gujarat', 'Andhra Pradesh'],
    datasets: [
      {
        label: 'Extraction (%)',
        data: [68.2, 51.4, 76.8, 54.1, 62.5, 59.8],
        backgroundColor: 'rgba(56, 189, 248, 0.65)',
        borderColor: '#38BDF8',
        borderWidth: 1,
        borderRadius: 4,
      }
    ],
  };

  const doughnutData = {
    labels: ['Safe (<70%)', 'Semi-Critical (70-90%)', 'Critical (90-100%)', 'Over-Exploited (>100%)'],
    datasets: [
      {
        data: [65, 15, 12, 8],
        backgroundColor: [
          '#10B981', // Green
          '#F59E0B', // Amber
          '#F97316', // Orange
          '#EF4444', // Red
        ],
        borderWidth: 0,
        hoverOffset: 4
      }
    ]
  };

  const isDark = theme === 'dark';

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(15,23,42,0.7)',
          font: { family: 'Inter', size: 11, weight: 'bold' as const }
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
  };

  const axesOptions = {
    ...commonOptions,
    scales: {
      x: {
        grid: { color: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(15,23,42,0.05)' },
        ticks: { color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(15,23,42,0.6)', font: { family: 'Inter' } }
      },
      y: {
        grid: { color: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(15,23,42,0.05)' },
        ticks: { color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(15,23,42,0.6)', font: { family: 'Inter' } }
      }
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 lg:p-8 flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <FiActivity className="text-primary text-lg" />
          <h1 className="text-2xl font-bold tracking-tight">Geospatial Analytics Dashboard</h1>
        </div>
        <p className="text-xs text-white/50">
          Statistical assessments of groundwater drafts and annual precipitation trends
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2">
          <GlassCard className="h-full">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-4">
              <FiTrendingUp className="text-primary text-lg" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-white/80">
                Multi-Year Hydrological Trends
              </h2>
            </div>
            <div className="h-80 relative">
              <Line data={lineChartData} options={axesOptions} />
            </div>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <GlassCard className="h-full">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-4">
              <FiPieChart className="text-accent text-lg" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-white/80">
                National Aquifer Health
              </h2>
            </div>
            <div className="h-64 relative flex items-center justify-center">
              <Doughnut 
                data={doughnutData} 
                options={{
                  ...commonOptions,
                  cutout: '70%',
                  plugins: {
                    ...commonOptions.plugins,
                    legend: { position: 'bottom', labels: { color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(15,23,42,0.7)', font: { size: 10 } } }
                  }
                }} 
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-[-20px]">
                <span className="text-2xl font-bold text-white">65%</span>
                <span className="text-[10px] text-white/50 uppercase tracking-widest">Safe Zones</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-3">
          <GlassCard>
            <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-4">
              <FiBarChart2 className="text-secondary text-lg" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-white/80">
                Groundwater Extraction by State (Stage %)
              </h2>
            </div>
            <div className="h-72 relative">
              <Bar data={barChartData} options={axesOptions} />
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;
