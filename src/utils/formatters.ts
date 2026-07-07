/**
 * India Water Resources GIS Intelligence Platform
 * Formatting Utilities
 */

/**
 * Formats a number with comma separators
 */
export function formatNumber(value: number, decimals = 2): string {
  if (Number.isInteger(value)) {
    return value.toLocaleString('en-IN');
  }
  return value.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Formats rainfall value with unit
 */
export function formatRainfall(value: number): string {
  return `${formatNumber(value)} mm`;
}

/**
 * Formats groundwater value with unit (BCM)
 */
export function formatGroundwater(value: number): string {
  return `${formatNumber(value)} BCM`;
}

/**
 * Formats percentage
 */
export function formatPercentage(value: number): string {
  return `${formatNumber(value)}%`;
}

/**
 * Formats area in sq km
 */
export function formatArea(value: number): string {
  return `${formatNumber(value, 1)} sq km`;
}

/**
 * Returns change percentage between two values
 */
export function getChangePercent(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Formats change with arrow indicator
 */
export function formatChange(changePercent: number): { text: string; isPositive: boolean } {
  const isPositive = changePercent >= 0;
  const arrow = isPositive ? '↑' : '↓';
  return {
    text: `${arrow} ${Math.abs(changePercent).toFixed(1)}%`,
    isPositive,
  };
}

/**
 * Truncates text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Capitalizes first letter of each word
 */
export function titleCase(str: string): string {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Formats a file size in bytes to human-readable
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Generates a rank suffix (1st, 2nd, 3rd, etc.)
 */
export function ordinalSuffix(rank: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = rank % 100;
  return rank + (s[(v - 20) % 10] || s[v] || s[0]);
}
