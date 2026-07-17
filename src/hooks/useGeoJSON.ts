import { useState, useEffect } from 'react';
import type { FeatureCollection } from 'geojson';
import { normalizeFeatures } from '../utils/normalizeFeatures';

// In-memory cache to avoid redundant network calls
const geoJSONCache = new Map<string, FeatureCollection>();


export function useGeoJSON(filePath: string | null) {
  const [data, setData] = useState<FeatureCollection | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!filePath) {
      setData(null);
      return;
    }

    const resolvedPath = filePath.startsWith('/') || filePath.startsWith('http')
      ? filePath
      : `/data/${filePath}`;

    if (geoJSONCache.has(resolvedPath)) {
      setData(geoJSONCache.get(resolvedPath)!);
      setError(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    fetch(resolvedPath)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch GeoJSON layer: ${res.statusText}`);
        return res.json();
      })
      .then((jsonData) => {
        if (isMounted) {
          normalizeFeatures(jsonData, filePath);
          geoJSONCache.set(resolvedPath, jsonData);
          setData(jsonData);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Error loading map layer data.');
          setIsLoading(false);
          setData(null);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [filePath]);

  return { data, isLoading, error };
}

export default useGeoJSON;
