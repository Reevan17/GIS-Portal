/**
 * India Water Resources GIS Intelligence Platform
 * Type Definitions
 * 
 * These types map directly to the GeoJSON properties exported from QGIS.
 */

import type { FeatureCollection, Feature, MultiPolygon, MultiLineString, Point } from 'geojson';

// ─── Available Years ─────────────────────────────────────────────
export const AVAILABLE_YEARS = [2013, 2017, 2020, 2022, 2023, 2024, 2025] as const;
export type AvailableYear = typeof AVAILABLE_YEARS[number];

// ─── Rainfall ────────────────────────────────────────────────────
export interface RainfallProperties {
  State: string;
  rainfall: number;
  rain_categ: string;    // "Very Low" | "Low" | "Moderate" | "High" | "Very High"
  rank: number;
  Year: number;
}

export type RainfallFeature = Feature<MultiPolygon, RainfallProperties>;
export type RainfallCollection = FeatureCollection<MultiPolygon, RainfallProperties>;

// ─── Groundwater (State Level) ───────────────────────────────────
export interface GroundwaterStateProperties {
  State: string;
  Annual_Rep: number;    // Annual Replenishable GW Resource (BCM)
  Net_GW: number;        // Net GW Availability (BCM)
  Existing_G: number;    // Existing GW Draft for Irrigation (BCM)
  Existing_1: number;    // Existing GW Draft for Domestic & Industrial (BCM)
  Total_Curr: number;    // Total Current Draft (BCM)
  GW_Availab: number;    // GW Availability for Future (BCM)
  Stage_of_G: number;    // Stage of GW Extraction (%)
  Year: number;
}

export type GroundwaterStateFeature = Feature<MultiPolygon, GroundwaterStateProperties>;
export type GroundwaterStateCollection = FeatureCollection<MultiPolygon, GroundwaterStateProperties>;

// ─── Groundwater (District Level) ────────────────────────────────
export interface GroundwaterDistrictProperties {
  District: string;
  Annual_Rep: number;
  Net_GW: number;
  Existing_G: number;
  Existing_1: number;
  Total_Curr: number;
  GW_Availab: number;
  Stage_of_G: number;
  Year: number;
}

export type GroundwaterDistrictFeature = Feature<MultiPolygon, GroundwaterDistrictProperties>;
export type GroundwaterDistrictCollection = FeatureCollection<MultiPolygon, GroundwaterDistrictProperties>;

// ─── Groundwater Quality Stations ────────────────────────────────
export interface StationProperties {
  STATION_NA: string;    // Station Name
  STATE: string;
  DISTRICT: string;
  SITE_TYPE: string;     // e.g., "Dug Well"
  WLS_Pre: number | null;   // Water Level Pre-monsoon
  WLS_Post: number | null;  // Water Level Post-monsoon
  WLS_Long_T: string | null; // Long-term WL trend
}

export type StationFeature = Feature<Point, StationProperties>;
export type StationCollection = FeatureCollection<Point, StationProperties>;

// ─── Administrative (States) ─────────────────────────────────────
export interface StateProperties {
  State: string;
}

export type StateFeature = Feature<MultiPolygon, StateProperties>;
export type StateCollection = FeatureCollection<MultiPolygon, StateProperties>;

// ─── Rivers ──────────────────────────────────────────────────────
export interface RiverProperties {
  River_Name: string;
  Basin_Name: string;
  Sub_Basin: string;
  length_km: number;
}

export type RiverFeature = Feature<MultiLineString, RiverProperties>;
export type RiverCollection = FeatureCollection<MultiLineString, RiverProperties>;

// ─── Watersheds ──────────────────────────────────────────────────
export interface WatershedProperties {
  basin_name: string;
  watershed_: string;    // Watershed name/code
  sub_basin_: string;    // Sub-basin name
  area_sqkm: number;
}

export type WatershedFeature = Feature<MultiPolygon, WatershedProperties>;
export type WatershedCollection = FeatureCollection<MultiPolygon, WatershedProperties>;

// ─── River Basins (Derived) ──────────────────────────────────────
export interface RiverBasinProperties {
  basin_name: string;
  area_sqkm: number;
  states_covered?: string[];
  avg_rainfall?: number;
  avg_groundwater?: number;
}

export type RiverBasinFeature = Feature<MultiPolygon, RiverBasinProperties>;
export type RiverBasinCollection = FeatureCollection<MultiPolygon, RiverBasinProperties>;

// ─── District Boundaries ─────────────────────────────────────────
export interface DistrictProperties {
  District: string;
}

export type DistrictFeature = Feature<MultiPolygon, DistrictProperties>;
export type DistrictCollection = FeatureCollection<MultiPolygon, DistrictProperties>;

// ─── Layer Configuration ─────────────────────────────────────────
export type LayerCategory = 
  | 'administrative'
  | 'rainfall'
  | 'groundwater_state'
  | 'groundwater_district'
  | 'other';

export interface LayerConfig {
  id: string;
  name: string;
  category: LayerCategory;
  filePath: string;
  visible: boolean;
  opacity: number;
  type: 'polygon' | 'line' | 'point';
  year?: AvailableYear;
  state?: string;  // For district-level layers
}

// ─── Rainfall Categories ─────────────────────────────────────────
export type RainfallCategory = 'Very Low' | 'Low' | 'Moderate' | 'High' | 'Very High';

// ─── Groundwater Categories ──────────────────────────────────────
export type GroundwaterCategory = 'Safe' | 'Semi-Critical' | 'Critical' | 'Over-Exploited';

// ─── Supported District States ───────────────────────────────────
export const DISTRICT_STATES = ['Karnataka', 'Kerala', 'Tamil Nadu'] as const;
export type DistrictState = typeof DISTRICT_STATES[number];

// ─── App State ───────────────────────────────────────────────────
export interface AppState {
  selectedYear: AvailableYear;
  activeLayerIds: string[];
  selectedState: string | null;
  selectedDistrict: string | null;
  searchQuery: string;
  isSearchOpen: boolean;
  theme: 'dark' | 'light';
  isLoading: boolean;
  sidebarOpen: boolean;
}

// ─── Map State ───────────────────────────────────────────────────
export interface MapState {
  center: [number, number];
  zoom: number;
  bounds: [[number, number], [number, number]] | null;
}

// ─── Chart Data Types ────────────────────────────────────────────
export interface TrendDataPoint {
  year: number;
  value: number;
  label?: string;
}

export interface ComparisonData {
  name: string;
  values: Record<string, number>;
}

// ─── Search Result ───────────────────────────────────────────────
export interface SearchResult {
  type: 'state' | 'district' | 'river_basin' | 'watershed' | 'station';
  name: string;
  coordinates: [number, number];
  details?: Record<string, string | number>;
}

// ─── Export Format ───────────────────────────────────────────────
export type ExportFormat = 'csv' | 'geojson' | 'png' | 'pdf';

// ─── Statistics Card ─────────────────────────────────────────────
export interface StatCard {
  title: string;
  value: number;
  suffix?: string;
  icon: string;
  color: string;
  description?: string;
}
