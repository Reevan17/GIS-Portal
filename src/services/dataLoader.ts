import type { FeatureCollection } from 'geojson';
import type {
  AvailableYear,
  RainfallProperties,
  GroundwaterStateProperties,
  GroundwaterDistrictProperties,
  StationProperties,
  StateProperties,
  WatershedProperties,
  RiverBasinProperties,
  DistrictProperties,
} from '../types';

// Cache map to save fetched JSONs
const fetchCache = new Map<string, any>();

async function fetchJson<T>(url: string): Promise<T> {
  if (fetchCache.has(url)) {
    return fetchCache.get(url) as T;
  }
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to load data from ${url}: ${res.statusText}`);
  }
  const data = await res.json();
  fetchCache.set(url, data);
  return data as T;
}

export const dataLoader = {
  // Administrative Layer
  loadStates: (): Promise<FeatureCollection<any, StateProperties>> => {
    return fetchJson<FeatureCollection<any, StateProperties>>('/data/india_states.geojson');
  },

  // State-wise Rainfall
  loadRainfallData: (year: AvailableYear): Promise<FeatureCollection<any, RainfallProperties>> => {
    return fetchJson<FeatureCollection<any, RainfallProperties>>(`/data/rainfall_${year}.geojson`);
  },

  // State-wise Groundwater
  loadGroundwaterStateData: (year: AvailableYear): Promise<FeatureCollection<any, GroundwaterStateProperties>> => {
    return fetchJson<FeatureCollection<any, GroundwaterStateProperties>>(`/data/groundwater_states_${year}.geojson`);
  },

  // District-wise Groundwater
  loadGroundwaterDistrictData: (state: string, year: AvailableYear): Promise<FeatureCollection<any, GroundwaterDistrictProperties>> => {
    const formattedState = state.toLowerCase().replace(/\s+/g, '');
    return fetchJson<FeatureCollection<any, GroundwaterDistrictProperties>>(`/data/${formattedState}_groundwater_${year}.geojson`);
  },

  // District Boundaries
  loadDistricts: (state: string): Promise<FeatureCollection<any, DistrictProperties>> => {
    const formattedState = state.toLowerCase().replace(/\s+/g, '');
    return fetchJson<FeatureCollection<any, DistrictProperties>>(`/data/${formattedState}_districts.geojson`);
  },

  // Other GIS Layers
  loadRiverBasins: (): Promise<FeatureCollection<any, RiverBasinProperties>> => {
    return fetchJson<FeatureCollection<any, RiverBasinProperties>>('/data/river_basins.geojson');
  },

  loadWatersheds: (): Promise<FeatureCollection<any, WatershedProperties>> => {
    return fetchJson<FeatureCollection<any, WatershedProperties>>('/data/watersheds.geojson');
  },

  loadStations: (): Promise<FeatureCollection<any, StationProperties>> => {
    return fetchJson<FeatureCollection<any, StationProperties>>('/data/groundwater_quality_stations.geojson');
  },

  // Loader helpers for bulk analytics
  getAllRainfallData: async (years: AvailableYear[]): Promise<Record<AvailableYear, FeatureCollection<any, RainfallProperties>>> => {
    const promises = years.map(async (yr) => {
      try {
        const data = await dataLoader.loadRainfallData(yr);
        return { yr, data };
      } catch {
        return { yr, data: { type: 'FeatureCollection', features: [] } as any };
      }
    });
    const results = await Promise.all(promises);
    return results.reduce((acc, curr) => {
      acc[curr.yr] = curr.data;
      return acc;
    }, {} as Record<AvailableYear, FeatureCollection<any, RainfallProperties>>);
  },

  getAllGroundwaterStateData: async (years: AvailableYear[]): Promise<Record<AvailableYear, FeatureCollection<any, GroundwaterStateProperties>>> => {
    const promises = years.map(async (yr) => {
      try {
        // Try fetching states data for this year
        const data = await fetchJson<FeatureCollection<any, GroundwaterStateProperties>>(`/data/groundwater_states_${yr}.geojson`);
        return { yr, data };
      } catch {
        return { yr, data: { type: 'FeatureCollection', features: [] } as any };
      }
    });
    const results = await Promise.all(promises);
    return results.reduce((acc, curr) => {
      acc[curr.yr] = curr.data;
      return acc;
    }, {} as Record<AvailableYear, FeatureCollection<any, GroundwaterStateProperties>>);
  }
};

export default dataLoader;
