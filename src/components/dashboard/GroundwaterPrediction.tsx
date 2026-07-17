import React, { useState, useEffect, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend as ChartLegend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import GlassCard from '../common/GlassCard';
import { motion } from 'framer-motion';
import {
  FiCpu,
  FiTrendingUp,
  FiTrendingDown,
  FiMinus,
  FiAlertTriangle,
  FiCheckCircle,
  FiTarget,
  FiDatabase,
  FiPercent,
} from 'react-icons/fi';
import { AVAILABLE_YEARS } from '../../types';
import type { AvailableYear } from '../../types';
import { dataLoader } from '../../services/dataLoader';
import { fitPolynomialRegression as linearRegression, predict } from '../../utils/linearRegression';
import type { DataPoint, RegressionModel } from '../../utils/linearRegression';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  ChartLegend,
  Filler,
);

const PREDICTION_YEAR = 2026;

// ── Per-state groundwater prediction result ───────────────────────────────────
interface GWStatePrediction {
  state: string;
  predictedStage: number;
  historicalData: DataPoint[];
  model: RegressionModel;
  trend: 'increasing' | 'decreasing' | 'stable';
  latestStage: number;
  predictedCategory: string;
  categoryColor: string;
}

function getGWCategory(stage: number): { label: string; color: string } {
  if (stage > 100) return { label: 'Over-Exploited', color: '#EF4444' };
  if (stage > 90) return { label: 'Critical', color: '#F97316' };
  if (stage > 70) return { label: 'Semi-Critical', color: '#F59E0B' };
  return { label: 'Safe', color: '#10B981' };
}

// ── Build per-state predictions from multi-year groundwater data ──────────────
function buildGWPredictions(
  allData: Record<number, any>
): GWStatePrediction[] {
  const stateMap = new Map<string, DataPoint[]>();

  for (const yearKey of Object.keys(allData)) {
    const year = Number(yearKey);
    const fc = allData[year as AvailableYear];
    if (!fc?.features) continue;

    for (const feature of fc.features) {
      const state: string | undefined = feature.properties?.State;
      const stage: number | undefined = feature.properties?.Stage_of_G;
      if (!state || stage === undefined || isNaN(stage)) continue;

      if (!stateMap.has(state)) stateMap.set(state, []);
      stateMap.get(state)!.push({ x: year, y: stage });
    }
  }

  const predictions: GWStatePrediction[] = [];

  for (const [state, points] of stateMap.entries()) {
    points.sort((a, b) => a.x - b.x);

    const model = linearRegression(points);
    if (!model) continue;

    const predicted = Math.max(0, predict(model, PREDICTION_YEAR));
    const latest = points[points.length - 1].y;
    const { label, color } = getGWCategory(predicted);

    let trend: GWStatePrediction['trend'] = 'stable';
    if (model.slope > 0.5) trend = 'increasing';
    else if (model.slope < -0.5) trend = 'decreasing';

    predictions.push({
      state,
      predictedStage: predicted,
      historicalData: points,
      model,
      trend,
      latestStage: latest,
      predictedCategory: label,
      categoryColor: color,
    });
  }

  // Sort by predicted extraction stage descending (most exploited first)
  predictions.sort((a, b) => b.predictedStage - a.predictedStage);
  return predictions;
}

// ── Component ─────────────────────────────────────────────────────────────────
const GroundwaterPrediction: React.FC = () => {
  const [predictions, setPredictions] = useState<GWStatePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedState, setSelectedState] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Load all years of groundwater state data
  useEffect(() => {
    setIsLoading(true);
    setError(null);

    dataLoader
      .getAllGroundwaterStateData([...AVAILABLE_YEARS])
      .then((allData) => {
        const preds = buildGWPredictions(allData);
        setPredictions(preds);
        if (preds.length > 0) setSelectedState(preds[0].state);
      })
      .catch((err) => {
        console.error('Failed to load groundwater data for prediction:', err);
        setError('Could not load historical groundwater data.');
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Derived stats
  const summaryStats = useMemo(() => {
    if (predictions.length === 0) return null;

    const avgStage =
      predictions.reduce((s, p) => s + p.predictedStage, 0) / predictions.length;

    const overExploited = predictions.filter((p) => p.predictedStage > 100).length;
    const critical = predictions.filter(
      (p) => p.predictedStage > 90 && p.predictedStage <= 100
    ).length;
    const safe = predictions.filter((p) => p.predictedStage <= 70).length;

    const avgR2 =
      predictions.reduce((s, p) => s + p.model.rSquared, 0) / predictions.length;

    const mostStressed = predictions[0];

    return { avgStage, overExploited, critical, safe, avgR2, mostStressed };
  }, [predictions]);

  const activePrediction = useMemo(
    () => predictions.find((p) => p.state === selectedState) ?? null,
    [predictions, selectedState]
  );

  // ── Chart data for the selected state ────────────────────────────────────
  const chartData = useMemo(() => {
    if (!activePrediction) return null;

    const { historicalData, predictedStage } = activePrediction;
    const historicalLabels = historicalData.map((d) => String(d.x));
    const historicalValues = historicalData.map((d) => d.y);

    const allLabels = [...historicalLabels, String(PREDICTION_YEAR)];
    const historicalLine = [...historicalValues, null];

    const model = activePrediction.model;
    const trendLine = allLabels.map((label) => predict(model, Number(label)));

    // Danger threshold line at 100%
    const thresholdLine = allLabels.map(() => 100);

    return {
      labels: allLabels,
      datasets: [
        {
          label: 'Extraction Stage (%)',
          data: historicalLine,
          borderColor: '#38BDF8',
          backgroundColor: 'rgba(56, 189, 248, 0.08)',
          pointBackgroundColor: '#38BDF8',
          pointBorderColor: '#38BDF8',
          pointRadius: 5,
          pointHoverRadius: 7,
          fill: true,
          tension: 0.3,
          borderWidth: 2.5,
          spanGaps: false,
        },
        {
          label: 'Regression Trend',
          data: trendLine,
          borderColor: '#F59E0B',
          borderDash: [8, 4],
          pointRadius: 0,
          pointHoverRadius: 0,
          fill: false,
          tension: 0,
          borderWidth: 2,
        },
        {
          label: `Predicted ${PREDICTION_YEAR}`,
          data: [...Array(historicalValues.length).fill(null), predictedStage],
          borderColor: activePrediction.categoryColor,
          backgroundColor: activePrediction.categoryColor,
          pointBackgroundColor: activePrediction.categoryColor,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 8,
          pointHoverRadius: 10,
          pointStyle: 'star' as const,
          fill: false,
          showLine: false,
        },
        {
          label: 'Over-Exploitation Threshold',
          data: thresholdLine,
          borderColor: 'rgba(239, 68, 68, 0.3)',
          borderDash: [4, 4],
          pointRadius: 0,
          pointHoverRadius: 0,
          fill: false,
          tension: 0,
          borderWidth: 1.5,
        },
      ],
    };
  }, [activePrediction]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: 'rgba(255,255,255,0.7)',
          font: { family: 'Inter', size: 11, weight: 'bold' as const },
          usePointStyle: true,
          pointStyleWidth: 12,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(13, 27, 42, 0.95)',
        titleColor: '#38BDF8',
        bodyColor: '#ffffff',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 10,
        callbacks: {
          label: (ctx: any) => {
            const val = ctx.parsed?.y;
            if (val == null) return '';
            return ` ${ctx.dataset.label}: ${val.toFixed(1)}%`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.03)' },
        ticks: {
          color: 'rgba(255,255,255,0.5)',
          font: { family: 'Inter', weight: 'bold' as const },
        },
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.03)' },
        ticks: {
          color: 'rgba(255,255,255,0.5)',
          font: { family: 'Inter' },
          callback: (val: any) => `${val}%`,
        },
        suggestedMin: 0,
      },
    },
  };

  // ── Trend icon helper ────────────────────────────────────────────────────
  const TrendIcon: React.FC<{ trend: GWStatePrediction['trend'] }> = ({ trend }) => {
    if (trend === 'increasing')
      return <FiTrendingUp className="text-red-400" size={14} title="Increasing extraction" />;
    if (trend === 'decreasing')
      return <FiTrendingDown className="text-green-400" size={14} title="Decreasing extraction" />;
    return <FiMinus className="text-yellow-400" size={14} title="Stable" />;
  };

  // ── Loading state ────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-white/5">
        <GlassCard hoverable={false}>
          <div className="flex items-center justify-center gap-3 py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
            >
              <FiCpu className="text-primary text-2xl" />
            </motion.div>
            <span className="text-sm text-white/60 font-medium">
              Running polynomial regression on historical groundwater data…
            </span>
          </div>
        </GlassCard>
      </div>
    );
  }

  if (error || predictions.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-white/5">
        <GlassCard hoverable={false}>
          <div className="text-center py-12 text-white/50">
            <FiDatabase size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm font-medium">
              {error ?? 'No groundwater data available for prediction.'}
            </p>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-white/5">
      {/* Section Header */}
      <div className="text-center mb-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400 font-bold tracking-wider uppercase mb-4">
            <FiCpu size={12} />
            AI / ML Prediction Engine
          </div>
          <h2 className="text-2xl font-bold tracking-wide text-white">
            Groundwater Extraction Forecast — {PREDICTION_YEAR}
          </h2>
          <p className="text-sm text-white/50 mt-2 max-w-2xl mx-auto">
            Polynomial regression model trained on {AVAILABLE_YEARS.length} years of state-level CGWB
            groundwater extraction data to predict next-year aquifer stress levels
          </p>
        </motion.div>
      </div>

      {/* KPI Cards */}
      {summaryStats && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {[
            {
              label: 'Predicted Avg Extraction',
              value: `${summaryStats.avgStage.toFixed(1)}%`,
              icon: FiPercent,
              color: '#38BDF8',
            },
            {
              label: 'Over-Exploited Zones',
              value: String(summaryStats.overExploited),
              sub: `+ ${summaryStats.critical} critical`,
              icon: FiAlertTriangle,
              color: '#EF4444',
            },
            {
              label: 'Safe Zones',
              value: String(summaryStats.safe),
              sub: `of ${predictions.length} states`,
              icon: FiCheckCircle,
              color: '#10B981',
            },
            {
              label: 'Avg Model R² Score',
              value: summaryStats.avgR2.toFixed(3),
              sub: summaryStats.avgR2 > 0.5 ? 'Good fit' : 'Moderate fit',
              icon: FiCpu,
              color: '#F59E0B',
            },
          ].map(({ label, value, sub, icon: Icon, color }) => (
            <GlassCard key={label} padding="p-4" hoverable={false}>
              <div className="flex items-center gap-3">
                <div
                  className="p-2.5 rounded-xl shrink-0"
                  style={{ backgroundColor: `${color}18`, color }}
                >
                  <Icon size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-white/40 uppercase tracking-wider font-bold">
                    {label}
                  </p>
                  <p className="text-base font-bold font-mono text-white mt-0.5 truncate">
                    {value}
                  </p>
                  {sub && (
                    <p className="text-[10px] text-white/30 font-medium truncate">{sub}</p>
                  )}
                </div>
              </div>
            </GlassCard>
          ))}
        </motion.div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart — 8 cols */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="lg:col-span-8"
        >
          <GlassCard className="h-full">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <FiDatabase className="text-blue-400 text-lg" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white/80">
                  Extraction Stage Trend & Prediction
                </h3>
              </div>

              {/* State Selector */}
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="bg-white/[0.06] border border-white/10 text-white text-xs font-medium rounded-lg px-3 py-2 focus:outline-none focus:border-primary/50 transition cursor-pointer"
                style={{ colorScheme: 'dark' }}
              >
                {predictions.map((p) => (
                  <option key={p.state} value={p.state}>
                    {p.state}
                  </option>
                ))}
              </select>
            </div>

            {/* Chart */}
            <div className="h-80 relative">
              {chartData && <Line data={chartData} options={chartOptions} />}
            </div>

            {/* Selected state details */}
            {activePrediction && (
              <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  {
                    label: 'Slope',
                    value: `${activePrediction.model.slope > 0 ? '+' : ''}${activePrediction.model.slope.toFixed(3)} %/yr`,
                  },
                  {
                    label: 'R² Score',
                    value: activePrediction.model.rSquared.toFixed(4),
                  },
                  {
                    label: `Predicted ${PREDICTION_YEAR}`,
                    value: `${activePrediction.predictedStage.toFixed(1)}%`,
                  },
                  {
                    label: 'Predicted Category',
                    value: activePrediction.predictedCategory,
                  },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="bg-white/[0.03] border border-white/5 rounded-lg p-2.5 text-center"
                  >
                    <p className="text-[10px] text-white/40 uppercase tracking-wider font-bold mb-0.5">
                      {label}
                    </p>
                    <p className="text-xs font-bold font-mono text-white">{value}</p>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </motion.div>

        {/* Prediction Table — 4 cols */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="lg:col-span-4"
        >
          <GlassCard className="h-full">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 border-b border-white/10 pb-3 mb-4">
              {PREDICTION_YEAR} Stress Rankings
            </h3>

            <div className="flex flex-col gap-1.5 max-h-[440px] overflow-y-auto custom-scrollbar pr-1">
              {predictions.map((p, idx) => (
                <button
                  key={p.state}
                  onClick={() => setSelectedState(p.state)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                    selectedState === p.state
                      ? 'bg-blue-500/10 border border-blue-500/30'
                      : 'bg-white/[0.02] border border-transparent hover:border-white/10 hover:bg-white/[0.04]'
                  }`}
                >
                  {/* Rank */}
                  <span
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      idx < 3
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-white/5 text-white/40'
                    }`}
                  >
                    {idx + 1}
                  </span>

                  {/* State Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{p.state}</p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-white/40">
                        {p.predictedStage.toFixed(1)}%
                      </span>
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor: `${p.categoryColor}20`,
                          color: p.categoryColor,
                        }}
                      >
                        {p.predictedCategory}
                      </span>
                    </div>
                  </div>

                  {/* Trend & R² */}
                  <div className="flex flex-col items-end gap-0.5 shrink-0">
                    <TrendIcon trend={p.trend} />
                    <span className="text-[9px] text-white/30 font-mono">
                      R²={p.model.rSquared.toFixed(2)}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Model info footer */}
            <div className="mt-4 pt-3 border-t border-white/5">
              <p className="text-[10px] text-white/30 leading-relaxed">
                <strong className="text-white/50">Model:</strong> Polynomial regression (Degree 2) on Stage
                of GW Extraction (%).{' '}
                <span className="font-mono text-blue-400/70">ŷ = ax² + bx + c</span> where x = year.
                Red dashed line at 100% marks over-exploitation threshold.
              </p>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};

export default GroundwaterPrediction;
