/**
 * India Water Resources GIS Intelligence Platform
 * Color Scale Functions for Choropleth Maps
 */

import { RAINFALL_COLORS } from './constants';

/**
 * Returns a color for rainfall value based on mm amount
 */
export function getRainfallColor(value: number): string {
  if (value < 500) return '#EF4444';      // Very Low - Red
  if (value < 1000) return '#F97316';     // Low - Orange
  if (value < 1500) return '#EAB308';     // Moderate - Yellow
  if (value < 2000) return '#22C55E';     // High - Green
  return '#3B82F6';                        // Very High - Blue
}

/**
 * Returns a color based on rainfall category string
 */
export function getRainfallCategoryColor(category: string): string {
  return RAINFALL_COLORS[category] || '#9CA3AF';
}

/**
 * Returns a color for groundwater extraction stage (%)
 */
export function getGroundwaterColor(stagePercent: number): string {
  if (stagePercent < 40) return '#10B981';      // Safe - Green
  if (stagePercent < 60) return '#22D3EE';      // Moderate - Cyan
  if (stagePercent < 70) return '#38BDF8';      // Normal - Blue
  if (stagePercent < 90) return '#F59E0B';      // Semi-Critical - Amber
  if (stagePercent < 100) return '#F97316';     // Critical - Orange
  return '#EF4444';                              // Over-Exploited - Red
}

/**
 * Returns groundwater category based on extraction stage
 */
export function getGroundwaterCategory(stagePercent: number): string {
  if (stagePercent < 70) return 'Safe';
  if (stagePercent < 90) return 'Semi-Critical';
  if (stagePercent < 100) return 'Critical';
  return 'Over-Exploited';
}

/**
 * Generates a gradient color between two hex colors
 */
export function interpolateColor(color1: string, color2: string, factor: number): string {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);
  if (!c1 || !c2) return color1;

  const r = Math.round(c1.r + (c2.r - c1.r) * factor);
  const g = Math.round(c1.g + (c2.g - c1.g) * factor);
  const b = Math.round(c1.b + (c2.b - c1.b) * factor);

  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Converts hex color to RGB object
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Returns opacity for a value within a range (for continuous choropleth)
 */
export function getOpacityForValue(value: number, min: number, max: number): number {
  if (max === min) return 0.7;
  return 0.3 + ((value - min) / (max - min)) * 0.5;
}

/**
 * Rainfall legend items
 */
export const RAINFALL_LEGEND = [
  { label: 'Very Low (<500mm)', color: '#EF4444' },
  { label: 'Low (500-1000mm)', color: '#F97316' },
  { label: 'Moderate (1000-1500mm)', color: '#EAB308' },
  { label: 'High (1500-2000mm)', color: '#22C55E' },
  { label: 'Very High (>2000mm)', color: '#3B82F6' },
];

/**
 * Groundwater legend items
 */
export const GROUNDWATER_LEGEND = [
  { label: 'Safe (<70%)', color: '#10B981' },
  { label: 'Semi-Critical (70-90%)', color: '#F59E0B' },
  { label: 'Critical (90-100%)', color: '#F97316' },
  { label: 'Over-Exploited (>100%)', color: '#EF4444' },
];
