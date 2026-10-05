import React, { useState, useEffect, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
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
  FiDatabase,
  FiPercent,
  FiCloudRain,
  FiActivity,
  FiSliders,
} from 'react-icons/fi';
import { AVAILABLE_YEARS } from '../../types';
import type { AvailableYear } from '../../types';
import { dataLoader } from '../../services/dataLoader';
import {
  fitMultivariateGroundwaterModel,
  type HydrogeologicalPoint,
  type MultivariateGWModel,
} from '../../utils/multivariateRegression';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  ChartLegend,
  Filler,
);

const PREDICTION_YEAR = 2026;

// ── Rainfall Scenario Types ───────────────────────────────────────────────────
export type RainfallScenario = 'normal' | 'deficit' | 'surplus';

interface GWStatePrediction {
  state: string;
  history: HydrogeologicalPoint[];
  model: MultivariateGWModel;
  latestStage: number;
  latestRainfall: number;
  avgRainfall: number;
  predictedStage: number;
  scenarioRainfall: number;
  predictedCategory: string;
  categoryColor: string;
  trend: 'increasing' | 'decreasing' | 'stable';
}

function getGWCategory(stage: number): { label: string; color: string } {
  if (stage > 100) return { label: 'Over-Exploited', color: '#EF4444' };
  if (stage > 90) return { label: 'Critical', color: '#F97316' };
  if (stage > 70) return { label: 'Semi-Critical', color: '#F59E0B' };
  return { label: 'Safe', color: '#10B981' };
}

function cleanStateKey(s: string): string {
  return s.toUpperCase().replace(/&/g, 'AND').replace(/[^A-Z]/g, '');
}

// ── Build Coupled Groundwater + Rainfall Model ────────────────────────────────
function buildHydrogeologicalPredictions(
  gwData: Record<number, any>,
  rainData: Record<number, any>,
  scenario: RainfallScenario,
  scenarioMultiplier: number
): GWStatePrediction[] {
  // Collect state -> year -> { stage, rain }
  const stateYearMap = new Map<string, { year: number; stage?: number; rain?: number }[]>();
  const canonicalNames = new Map<string, string>();

  // 1. Process Groundwater Data
  for (const yearKey of Object.keys(gwData)) {
    const year = Number(yearKey);
    const fc = gwData[year as AvailableYear];
    if (!fc?.features) continue;

    for (const feature of fc.features) {
      const stateName: string | undefined = feature.properties?.State || feature.properties?.STATE;
      const stage: number | undefined = feature.properties?.Stage_of_G;
      if (!stateName || stage === undefined || isNaN(stage)) continue;

      const key = cleanStateKey(stateName);
      if (!canonicalNames.has(key)) canonicalNames.set(key, stateName);

      if (!stateYearMap.has(key)) stateYearMap.set(key, []);
      const existing = stateYearMap.get(key)!.find((p) => p.year === year);
      if (existing) {
        existing.stage = stage;
      } else {
        stateYearMap.get(key)!.push({ year, stage });
      }
    }
  }

  // 2. Process Corresponding Rainfall Data
  for (const yearKey of Object.keys(rainData)) {
    const year = Number(yearKey);
    const fc = rainData[year as AvailableYear];
    if (!fc?.features) continue;

    for (const feature of fc.features) {
      const stateName: string | undefined = feature.properties?.State || feature.properties?.STATE;
      const rainfall: number | undefined = feature.properties?.rainfall;
      if (!stateName || rainfall === undefined || isNaN(rainfall)) continue;

      const key = cleanStateKey(stateName);
      if (!stateYearMap.has(key)) continue;

      const existing = stateYearMap.get(key)!.find((p) => p.year === year);
      if (existing) {
        existing.rain = rainfall;
      } else {
        stateYearMap.get(key)!.push({ year, rain: rainfall });
      }
    }
  }

  const results: GWStatePrediction[] = [];

  for (const [key, rawPoints] of stateYearMap.entries()) {
    const stateName = canonicalNames.get(key) || key;

    // Filter points having both valid stage and rainfall
    const validPoints: HydrogeologicalPoint[] = rawPoints
      .filter((p): p is { year: number; stage: number; rain: number } => 
        p.stage !== undefined && !isNaN(p.stage) && p.rain !== undefined && !isNaN(p.rain)
      )
      .map((p) => ({
        year: p.year,
        groundwaterStage: p.stage,
        rainfall: p.rain,
      }))
      .sort((a, b) => a.year - b.year);

    if (validPoints.length < 4) continue;

    const model = fitMultivariateGroundwaterModel(validPoints);
    if (!model) continue;

    const latest = validPoints[validPoints.length - 1];
    const prevStage = latest.groundwaterStage;

    // Determine 2026 scenario rainfall
    let scenarioRain = model.avgRainfall;
    if (scenario === 'deficit') {
      scenarioRain = model.avgRainfall * (1 - scenarioMultiplier);
    } else if (scenario === 'surplus') {
      scenarioRain = model.avgRainfall * (1 + scenarioMultiplier);
    }

    const predicted = Math.max(0, model.predict(prevStage, scenarioRain, PREDICTION_YEAR));
    const { label, color } = getGWCategory(predicted);

    let trend: GWStatePrediction['trend'] = 'stable';
    const delta = predicted - prevStage;
    if (delta > 1.0) trend = 'increasing';
    else if (delta < -1.0) trend = 'decreasing';

    results.push({
      state: stateName,
      history: validPoints,
      model,
      latestStage: prevStage,
      latestRainfall: latest.rainfall,
      avgRainfall: model.avgRainfall,
      predictedStage: predicted,
      scenarioRainfall: scenarioRain,
      predictedCategory: label,
      categoryColor: color,
      trend,
    });
  }

  // Sort by predicted stage descending (most stressed first)
  results.sort((a, b) => b.predictedStage - a.predictedStage);
  return results;
}

// ── Component ─────────────────────────────────────────────────────────────────
const GroundwaterPrediction: React.FC = () => {
  const [predictions, setPredictions] = useState<GWStatePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedState, setSelectedState] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Scenario Simulator: 'normal' | 'deficit' | 'surplus'
  const [scenario, setScenario] = useState<RainfallScenario>('normal');
  const [scenarioDelta] = useState<number>(0.20); // 20% deficit/surplus

  // Raw fetched data caches
  const [rawGwData, setRawGwData] = useState<Record<number, any> | null>(null);
  const [rawRainData, setRawRainData] = useState<Record<number, any> | null>(null);

  // Load both Groundwater and Rainfall datasets
  useEffect(() => {
    setIsLoading(true);
    setError(null);

    Promise.all([
      dataLoader.getAllGroundwaterStateData([...AVAILABLE_YEARS]),
      dataLoader.getAllRainfallData([...AVAILABLE_YEARS]),
    ])
      .then(([gwData, rainData]) => {
        setRawGwData(gwData);
        setRawRainData(rainData);
        const preds = buildHydrogeologicalPredictions(gwData, rainData, 'normal', 0.20);
        setPredictions(preds);
        if (preds.length > 0) setSelectedState(preds[0].state);
      })
      .catch((err) => {
        console.error('Failed to load groundwater/rainfall data for prediction:', err);
        setError('Could not load historical groundwater and rainfall datasets.');
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Re-run scenario calculations when scenario changes
  useEffect(() => {
    if (!rawGwData || !rawRainData) return;
    const preds = buildHydrogeologicalPredictions(rawGwData, rawRainData, scenario, scenarioDelta);
    setPredictions(preds);
  }, [scenario, scenarioDelta, rawGwData, rawRainData]);

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

  // ── Dual-Metric Chart (Groundwater Stage % + Rainfall mm) ───────────────────
  const chartData = useMemo(() => {
    if (!activePrediction) return null;

    const { history, predictedStage, scenarioRainfall } = activePrediction;
    const labels = [...history.map((d) => String(d.year)), String(PREDICTION_YEAR)];

    // Historical Stage line (null for 2026)
    const stageHistory = [...history.map((d) => d.groundwaterStage), null];

    // Predicted point (null for past years)
    const predictedPoint = [...Array(history.length).fill(null), predictedStage];

    // Over-Exploited 100% reference line
    const thresholdLine = labels.map(() => 100);

    // Corresponding rainfall bars (mm)
    const rainfallData = [...history.map((d) => d.rainfall), scenarioRainfall];

    return {
      labels,
      datasets: [
        {
          type: 'line' as const,
          label: 'Groundwater Stage (%)',
          data: stageHistory,
          borderColor: '#38BDF8',
          backgroundColor: 'rgba(56, 189, 248, 0.08)',
          pointBackgroundColor: '#38BDF8',
          pointBorderColor: '#ffffff',
          pointRadius: 5,
          pointHoverRadius: 7,
          fill: true,
          tension: 0.25,
          borderWidth: 2.5,
          yAxisID: 'yStage',
        },
        {
          type: 'line' as const,
          label: `Predicted ${PREDICTION_YEAR} (${scenario.toUpperCase()})`,
          data: predictedPoint,
          borderColor: activePrediction.categoryColor,
          backgroundColor: activePrediction.categoryColor,
          pointBackgroundColor: activePrediction.categoryColor,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 9,
          pointHoverRadius: 11,
          pointStyle: 'star' as const,
          showLine: false,
          yAxisID: 'yStage',
        },
        {
          type: 'line' as const,
          label: 'Over-Exploitation (100%)',
          data: thresholdLine,
          borderColor: 'rgba(239, 68, 68, 0.4)',
          borderDash: [5, 5],
          pointRadius: 0,
          borderWidth: 1.5,
          fill: false,
          yAxisID: 'yStage',
        },
        {
          type: 'bar' as const,
          label: 'Annual Rainfall (mm)',
          data: rainfallData,
          backgroundColor: 'rgba(99, 102, 241, 0.15)',
          borderColor: 'rgba(99, 102, 241, 0.4)',
          borderWidth: 1,
          borderRadius: 6,
          yAxisID: 'yRain',
        },
      ],
    };
  }, [activePrediction, scenario]);

  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
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
            if (ctx.dataset.yAxisID === 'yRain') {
              return ` ${ctx.dataset.label}: ${val.toFixed(0)} mm`;
            }
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
      yStage: {
        type: 'linear' as const,
        position: 'left' as const,
        title: {
          display: true,
          text: 'GW Extraction Stage (%)',
          color: 'rgba(56, 189, 248, 0.8)',
          font: { family: 'Inter', size: 11, weight: 'bold' as const },
        },
        grid: { color: 'rgba(255,255,255,0.03)' },
        ticks: {
          color: 'rgba(255,255,255,0.5)',
          font: { family: 'Inter' },
          callback: (val: any) => `${val}%`,
        },
        suggestedMin: 0,
      },
      yRain: {
        type: 'linear' as const,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Rainfall (mm)',
          color: 'rgba(99, 102, 241, 0.8)',
          font: { family: 'Inter', size: 11, weight: 'bold' as const },
        },
        grid: { drawOnChartArea: false },
        ticks: {
          color: 'rgba(99, 102, 241, 0.6)',
          font: { family: 'Inter' },
          callback: (val: any) => `${val} mm`,
        },
        suggestedMin: 0,
      },
    },
  };

  // ── Trend icon helper ────────────────────────────────────────────────────
  const TrendIcon: React.FC<{ trend: GWStatePrediction['trend'] }> = ({ trend }) => {
    if (trend === 'increasing')
      return <FiTrendingUp className="text-red-400" size={14} title="Extraction stage increasing" />;
    if (trend === 'decreasing')
      return <FiTrendingDown className="text-green-400" size={14} title="Extraction stage decreasing" />;
    return <FiMinus className="text-yellow-400" size={14} title="Stable" />;
  };

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
              Calibrating multivariate hydrogeological regression (Groundwater Stage ~ Rainfall + Historical Lag)…
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
              {error ?? 'No coupled groundwater and rainfall data available.'}
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
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-400 font-bold tracking-wider uppercase mb-4">
            <FiActivity size={12} />
            Hydrogeological Coupled Model
          </div>
          <h2 className="text-2xl font-bold tracking-wide text-white">
            Groundwater Prediction Coupled with Rainfall — {PREDICTION_YEAR}
          </h2>
          <p className="text-sm text-white/50 mt-2 max-w-2xl mx-auto leading-relaxed">
            Autoregressive Distributed Lag (ARDL) model predicting aquifer extraction stage using historical groundwater consumption and corresponding annual rainfall recharge.
          </p>
        </motion.div>

        {/* Rainfall Scenario Selector Controls */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
          <span className="text-xs text-white/40 uppercase tracking-wider font-bold mr-1 flex items-center gap-1.5">
            <FiSliders size={13} />
            2026 Monsoon Scenario:
          </span>
          {[
            { id: 'normal' as const, label: 'Normal Rainfall (100%)', icon: FiCloudRain, color: '#38BDF8' },
            { id: 'deficit' as const, label: 'Deficit / Drought (-20%)', icon: FiTrendingUp, color: '#EF4444' },
            { id: 'surplus' as const, label: 'Surplus Monsoon (+20%)', icon: FiTrendingDown, color: '#10B981' },
          ].map(({ id, label, icon: Icon, color }) => (
            <button
              key={id}
              onClick={() => setScenario(id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                scenario === id
                  ? 'bg-white/10 text-white shadow-lg border border-white/20'
                  : 'bg-white/[0.03] text-white/50 border border-white/5 hover:bg-white/[0.06] hover:text-white/80'
              }`}
              style={scenario === id ? { borderColor: `${color}80` } : {}}
            >
              <Icon size={13} style={{ color }} />
              {label}
            </button>
          ))}
        </div>
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
              label: 'Avg Predicted Extraction',
              value: `${summaryStats.avgStage.toFixed(1)}%`,
              sub: `Under ${scenario} rainfall`,
              icon: FiPercent,
              color: '#38BDF8',
            },
            {
              label: 'Over-Exploited States',
              value: String(summaryStats.overExploited),
              sub: `+ ${summaryStats.critical} critical states`,
              icon: FiAlertTriangle,
              color: '#EF4444',
            },
            {
              label: 'Safe States',
              value: String(summaryStats.safe),
              sub: `of ${predictions.length} states/UTs`,
              icon: FiCheckCircle,
              color: '#10B981',
            },
            {
              label: 'Coupled Model Avg R²',
              value: summaryStats.avgR2.toFixed(3),
              sub: 'Hydrogeological ARDL fit',
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
                  Aquifer Extraction & Rainfall History ({selectedState})
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

            {/* Chart Container */}
            <div className="h-80 relative">
              {chartData && <Line data={chartData as any} options={chartOptions} />}
            </div>

            {/* Model Mathematical Parameters */}
            {activePrediction && (
              <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  {
                    label: 'Model R² Score',
                    value: activePrediction.model.rSquared.toFixed(3),
                    highlight: '#10B981',
                  },
                  {
                    label: 'Rainfall Sensitivity (β₂)',
                    value: `${activePrediction.model.betaRainfall.toFixed(2)} %/m`,
                    sub: activePrediction.model.betaRainfall < 0 ? 'Recharge cushions extraction' : 'High pump correlation',
                  },
                  {
                    label: 'Rainfall vs GW Correlation',
                    value: `r = ${activePrediction.model.pearsonCorrRainGW.toFixed(2)}`,
                    sub: activePrediction.model.pearsonCorrRainGW < 0 ? 'Inverse (Recharge effect)' : 'Direct variation',
                  },
                  {
                    label: `2026 Predicted Stage`,
                    value: `${activePrediction.predictedStage.toFixed(1)}%`,
                    highlight: activePrediction.categoryColor,
                    sub: activePrediction.predictedCategory,
                  },
                ].map(({ label, value, highlight, sub }) => (
                  <div
                    key={label}
                    className="bg-white/[0.03] border border-white/5 rounded-lg p-2.5 text-center"
                  >
                    <p className="text-[10px] text-white/40 uppercase tracking-wider font-bold mb-0.5">
                      {label}
                    </p>
                    <p
                      className="text-xs font-bold font-mono text-white"
                      style={highlight ? { color: highlight } : {}}
                    >
                      {value}
                    </p>
                    {sub && <p className="text-[9px] text-white/30 mt-0.5 truncate">{sub}</p>}
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
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                {PREDICTION_YEAR} State Stress Rankings
              </h3>
              <span className="text-[10px] text-white/40 font-mono">
                {scenario.toUpperCase()}
              </span>
            </div>

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
                <strong className="text-white/50">ARDL Formula:</strong>{' '}
                <span className="font-mono text-cyan-400/80">
                  Stage_t = β₀ + β₁(Stage_{'{t-1}'}) + β₂(Rainfall_t) + β₃(Year)
                </span>
                . Quantifies natural aquifer recharge alongside anthropogenic draft.
              </p>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};

export default GroundwaterPrediction;
