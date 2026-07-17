import regression from 'regression';

export interface DataPoint {
  x: number;
  y: number;
}

export interface RegressionModel {
  slope: number; // We'll keep this as a proxy for trend direction (derivative at the end)
  rSquared: number;
  predict: (x: number) => number;
}

/**
 * Fit a polynomial regression model (degree 2) to a set of data points.
 * Returns a model with a predict function and R² (coefficient of determination).
 *
 * Returns null if fewer than 3 data points are provided.
 */
export function fitPolynomialRegression(points: DataPoint[]): RegressionModel | null {
  const n = points.length;
  if (n < 3) return null;

  const YEAR_OFFSET = 2000;
  const data: [number, number][] = points.map(p => [p.x - YEAR_OFFSET, p.y]);

  // Test both Linear and Polynomial degree 2
  const linearResult = regression.linear(data);
  const polyResult = regression.polynomial(data, { order: 2 });

  // Select the model with the higher R^2 score
  const result = polyResult.r2 > linearResult.r2 ? polyResult : linearResult;

  // Bound R^2 to 0 if it's still somehow negative (meaning worse than a flat average)
  const finalR2 = Math.max(0, result.r2);

  return {
    slope: result.predict(data[n-1][0])[1] - result.predict(data[n-2][0])[1],
    rSquared: finalR2,
    predict: (x: number) => result.predict(x - YEAR_OFFSET)[1],
  };
}

/**
 * Predict y for a given x using a fitted model.
 */
export function predict(model: RegressionModel, x: number): number {
  return model.predict(x);
}

/**
 * Result for a single state's prediction.
 */
export interface StatePrediction {
  state: string;
  predictedRainfall: number;
  historicalData: DataPoint[];
  model: RegressionModel;
  trend: 'increasing' | 'decreasing' | 'stable';
  latestRainfall: number;
}
