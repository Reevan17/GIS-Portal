/**
 * India Water Resources GIS Intelligence Platform
 * Application Constants
 */

// ─── Color Palette ───────────────────────────────────────────────
export const COLORS = {
  background: '#08111F',
  backgroundLight: '#0D1B2A',
  backgroundLighter: '#1B2838',
  primary: '#00D4FF',
  primaryDark: '#00A3CC',
  secondary: '#2563EB',
  secondaryLight: '#3B82F6',
  accent: '#38BDF8',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  card: 'rgba(255, 255, 255, 0.08)',
  cardHover: 'rgba(255, 255, 255, 0.12)',
  cardBorder: 'rgba(255, 255, 255, 0.1)',
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textMuted: 'rgba(255, 255, 255, 0.4)',
} as const;

// ─── Rainfall Category Colors ────────────────────────────────────
export const RAINFALL_COLORS: Record<string, string> = {
  'Very Low': '#EF4444',
  'Low': '#F97316',
  'Moderate': '#EAB308',
  'High': '#22C55E',
  'Very High': '#3B82F6',
};

// ─── Groundwater Extraction Stage Colors ─────────────────────────
export const GROUNDWATER_COLORS = {
  safe: '#10B981',        // < 70%
  semiCritical: '#F59E0B', // 70-90%
  critical: '#F97316',     // 90-100%
  overExploited: '#EF4444', // > 100%
} as const;

// ─── Map Configuration ──────────────────────────────────────────
export const MAP_CONFIG = {
  center: [22.5, 82.5] as [number, number],
  zoom: 5,
  minZoom: 4,
  maxZoom: 18,
  maxBounds: [[6, 68], [37, 98]] as [[number, number], [number, number]],
} as const;

// ─── Tile Layers ─────────────────────────────────────────────────
export const TILE_LAYERS = {
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
    name: 'Dark',
  },
  light: {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
    name: 'Light',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri',
    name: 'Satellite',
  },
  terrain: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenTopoMap',
    name: 'Terrain',
  },
} as const;

// ─── Available Years ─────────────────────────────────────────────
export const YEARS = [2013, 2017, 2020, 2022, 2023, 2024, 2025] as const;

// ─── District States ─────────────────────────────────────────────
export const DISTRICT_STATES_CONFIG = {
  Karnataka: {
    name: 'Karnataka',
    center: [15.3173, 75.7139] as [number, number],
    zoom: 7,
    filePrefix: 'karnataka',
  },
  Kerala: {
    name: 'Kerala',
    center: [10.8505, 76.2711] as [number, number],
    zoom: 8,
    filePrefix: 'kerala',
  },
  'Tamil Nadu': {
    name: 'Tamil Nadu',
    center: [11.1271, 78.6569] as [number, number],
    zoom: 7,
    filePrefix: 'tamilnadu',
  },
} as const;

// ─── Navigation Items ────────────────────────────────────────────
export const NAV_ITEMS = [
  { label: 'Dashboard', path: '/', icon: 'dashboard' },
  { label: 'Rainfall', path: '/rainfall', icon: 'rainfall' },
  { label: 'Groundwater', path: '/groundwater', icon: 'groundwater' },
  { label: 'River Basins', path: '/river-basins', icon: 'river' },
  { label: 'Watersheds', path: '/watersheds', icon: 'watershed' },
  { label: 'Water Quality', path: '/water-quality', icon: 'quality' },
  { label: 'Analytics', path: '/analytics', icon: 'analytics' },
  { label: 'About', path: '/about', icon: 'about' },
] as const;

// ─── Statistics Card Configs ─────────────────────────────────────
export const STAT_CARDS = [
  { title: 'Total States', value: 36, suffix: '', icon: 'states', color: '#00D4FF' },
  { title: 'Total Districts', value: 773, suffix: '+', icon: 'districts', color: '#2563EB' },
  { title: 'Rainfall Years', value: 7, suffix: '', icon: 'years', color: '#38BDF8' },
  { title: 'Groundwater Years', value: 7, suffix: '', icon: 'gw_years', color: '#10B981' },
  { title: 'River Basins', value: 25, suffix: '+', icon: 'basins', color: '#F59E0B' },
  { title: 'Watersheds', value: 1000, suffix: '+', icon: 'watersheds', color: '#8B5CF6' },
  { title: 'Water Quality Stations', value: 500, suffix: '+', icon: 'stations', color: '#EC4899' },
  { title: 'Avg Rainfall', value: 1180, suffix: 'mm', icon: 'rainfall', color: '#06B6D4' },
  { title: 'Avg GW Extraction', value: 63, suffix: '%', icon: 'extraction', color: '#F97316' },
] as const;

// ─── Choropleth Breakpoints ──────────────────────────────────────
export const RAINFALL_BREAKS = [500, 1000, 1500, 2000] as const;
export const GW_EXTRACTION_BREAKS = [40, 60, 80, 100] as const;
