/**
 * Multivariate Hydrogeological Regression Engine
 * 
 * Predicts Groundwater Extraction Stage (%) based on:
 * 1. Previous Groundwater Stage (Lag-1 aquifer persistence)
 * 2. Corresponding Annual Rainfall (Aquifer recharge & draft reduction)
 * 3. Secular Time Trend (t - 2000)
 * 
 * Model Formulation (ARDL - Autoregressive Distributed Lag):
 * Stage_t = β0 + β1 * (Stage_{t-1} / 100) + β2 * (Rainfall_t / 1000) + β3 * ((Year_t - 2000) / 10)
 */

export interface HydrogeologicalPoint {
  year: number;
  groundwaterStage: number; // in %
  rainfall: number;         // in mm
}

export interface MultivariateGWModel {
  intercept: number;
  betaPrevStage: number;
  betaRainfall: number;
  betaTrend: number;
  rSquared: number;
  pearsonCorrRainGW: number;
  avgRainfall: number;
  latestRainfall: number;
  predict: (prevStage: number, scenarioRainfall: number, targetYear: number) => number;
}

// ── Matrix Math Helpers ───────────────────────────────────────────────────────
function matrixMult(A: number[][], B: number[][]): number[][] {
  const rowsA = A.length;
  const colsA = A[0].length;
  const colsB = B[0].length;
  const res: number[][] = Array(rowsA).fill(0).map(() => Array(colsB).fill(0));
  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsB; j++) {
      let sum = 0;
      for (let k = 0; k < colsA; k++) sum += A[i][k] * B[k][j];
      res[i][j] = sum;
    }
  }
  return res;
}

function transpose(A: number[][]): number[][] {
  return A[0].map((_, c) => A.map(r => r[c]));
}

function invertMatrix(M: number[][], lambda = 1e-3): number[][] | null {
  const n = M.length;
  const A = M.map((row, i) => row.map((v, j) => (i === j ? v + lambda : v)));
  const I = Array(n).fill(0).map((_, i) => Array(n).fill(0).map((__, j) => (i === j ? 1 : 0)));

  for (let i = 0; i < n; i++) {
    let pivot = A[i][i];
    if (Math.abs(pivot) < 1e-8) {
      pivot = 1e-8;
    }
    for (let j = 0; j < n; j++) {
      A[i][j] /= pivot;
      I[i][j] /= pivot;
    }
    for (let k = 0; k < n; k++) {
      if (k !== i) {
        const factor = A[k][i];
        for (let j = 0; j < n; j++) {
          A[k][j] -= factor * A[i][j];
          I[k][j] -= factor * I[i][j];
        }
      }
    }
  }
  return I;
}

// ── Pearson Correlation ───────────────────────────────────────────────────────
function calculatePearson(x: number[], y: number[]): number {
  const n = x.length;
  if (n < 2) return 0;
  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;

  let num = 0;
  let denX = 0;
  let denY = 0;

  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }

  const den = Math.sqrt(denX * denY);
  return den === 0 ? 0 : num / den;
}

// ── Main Fit Function ─────────────────────────────────────────────────────────
export function fitMultivariateGroundwaterModel(
  points: HydrogeologicalPoint[]
): MultivariateGWModel | null {
  // Need at least 4 historical periods to fit lag + rainfall + trend reliably
  if (points.length < 4) return null;

  const sorted = [...points].sort((a, b) => a.year - b.year);

  const rainValues = sorted.map(p => p.rainfall);
  const stageValues = sorted.map(p => p.groundwaterStage);
  const avgRainfall = rainValues.reduce((s, r) => s + r, 0) / rainValues.length;
  const latestRainfall = rainValues[rainValues.length - 1];
  const pearsonCorr = calculatePearson(rainValues, stageValues);

  // Construct Design Matrix X and Target Y with Lag-1
  // Row i corresponds to sorted[i], where previous is sorted[i-1]
  const X: number[][] = [];
  const Y: number[][] = [];

  for (let i = 1; i < sorted.length; i++) {
    const curr = sorted[i];
    const prev = sorted[i - 1];

    const prevStageNorm = prev.groundwaterStage / 100;
    const rainNorm = curr.rainfall / 1000;
    const trendNorm = (curr.year - 2000) / 10;

    X.push([1, prevStageNorm, rainNorm, trendNorm]);
    Y.push([curr.groundwaterStage]);
  }

  const Xt = transpose(X);
  const XtX = matrixMult(Xt, X);
  const invXtX = invertMatrix(XtX);

  if (!invXtX) return null;

  const XtY = matrixMult(Xt, Y);
  const beta = matrixMult(invXtX, XtY);

  const b0 = beta[0][0];
  const bPrev = beta[1][0];
  const bRain = beta[2][0];
  const bTrend = beta[3][0];

  // Calculate R-squared
  const yMean = Y.reduce((s, y) => s + y[0], 0) / Y.length;
  let ssTot = 0;
  let ssRes = 0;

  for (let i = 0; i < Y.length; i++) {
    const yActual = Y[i][0];
    const yPredicted =
      b0 +
      bPrev * X[i][1] +
      bRain * X[i][2] +
      bTrend * X[i][3];

    ssTot += Math.pow(yActual - yMean, 2);
    ssRes += Math.pow(yActual - yPredicted, 2);
  }

  const r2 = ssTot === 0 ? 0 : Math.max(0, Math.min(0.999, 1 - ssRes / ssTot));

  return {
    intercept: b0,
    betaPrevStage: bPrev,
    betaRainfall: bRain,
    betaTrend: bTrend,
    rSquared: r2,
    pearsonCorrRainGW: pearsonCorr,
    avgRainfall,
    latestRainfall,
    predict: (prevStage: number, scenarioRainfall: number, targetYear: number) => {
      const pStage = prevStage / 100;
      const rNorm = scenarioRainfall / 1000;
      const tNorm = (targetYear - 2000) / 10;
      const rawPrediction = b0 + bPrev * pStage + bRain * rNorm + bTrend * tNorm;
      return Math.max(0, rawPrediction);
    },
  };
}
