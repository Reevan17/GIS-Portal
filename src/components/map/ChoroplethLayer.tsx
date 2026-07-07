import React, { useEffect, useRef } from 'react';
import { GeoJSON, useMap } from 'react-leaflet';
import type { Layer, LeafletMouseEvent, LeafletEvent } from 'leaflet';
import L from 'leaflet';
import type { Feature, GeoJsonObject } from 'geojson';
import { RAINFALL_COLORS, GROUNDWATER_COLORS } from '../../utils/constants';

// ─── Shared types ─────────────────────────────────────────────────────────────

type ChoroplethMode = 'rainfall' | 'groundwater_state' | 'groundwater_district';

interface ChoroplethLayerProps {
  data: GeoJsonObject;
  mode: ChoroplethMode;
  onFeatureClick?: (properties: Record<string, unknown>) => void;
  opacity?: number;
}

// ─── Color helpers ─────────────────────────────────────────────────────────────

function getRainfallColor(feature: Feature): string {
  const props = feature.properties as { rain_categ?: string };
  const cat = props?.rain_categ ?? 'Moderate';
  return RAINFALL_COLORS[cat] ?? '#94A3B8';
}

function getGroundwaterColor(feature: Feature): string {
  const props = feature.properties as { Stage_of_G?: number };
  const stage = props?.Stage_of_G ?? 0;
  if (stage > 100) return GROUNDWATER_COLORS.overExploited;
  if (stage > 90)  return GROUNDWATER_COLORS.critical;
  if (stage > 70)  return GROUNDWATER_COLORS.semiCritical;
  return GROUNDWATER_COLORS.safe;
}

function getColor(feature: Feature, mode: ChoroplethMode): string {
  if (mode === 'rainfall') return getRainfallColor(feature);
  return getGroundwaterColor(feature);
}

// ─── Tooltip content builders ─────────────────────────────────────────────────

function buildRainfallTooltip(props: Record<string, unknown>): string {
  return `
    <div style="font-family: 'Inter', sans-serif; min-width: 180px;">
      <div style="font-size: 13px; font-weight: 700; color: #00D4FF; margin-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 6px;">
        ${props.State ?? 'Unknown State'}
      </div>
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <div style="display: flex; justify-content: space-between; font-size: 11px;">
          <span style="color: rgba(255,255,255,0.6);">Rainfall</span>
          <span style="color: white; font-weight: 600;">${Number(props.rainfall ?? 0).toLocaleString('en-IN')} mm</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 11px;">
          <span style="color: rgba(255,255,255,0.6);">Category</span>
          <span style="color: white; font-weight: 600;">${props.rain_categ ?? 'N/A'}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 11px;">
          <span style="color: rgba(255,255,255,0.6);">National Rank</span>
          <span style="color: white; font-weight: 600;">#${props.rank ?? 'N/A'}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 11px;">
          <span style="color: rgba(255,255,255,0.6);">Year</span>
          <span style="color: white; font-weight: 600;">${props.Year ?? 'N/A'}</span>
        </div>
      </div>
    </div>
  `;
}

function buildGroundwaterTooltip(props: Record<string, unknown>, mode: ChoroplethMode): string {
  const name = mode === 'groundwater_district'
    ? (props.District ?? 'Unknown District')
    : (props.State ?? 'Unknown State');

  const stage = Number(props.Stage_of_G ?? 0);
  let category = 'Safe';
  let catColor = '#10B981';
  if (stage > 100) { category = 'Over-Exploited'; catColor = '#EF4444'; }
  else if (stage > 90) { category = 'Critical'; catColor = '#F97316'; }
  else if (stage > 70) { category = 'Semi-Critical'; catColor = '#F59E0B'; }

  return `
    <div style="font-family: 'Inter', sans-serif; min-width: 200px;">
      <div style="font-size: 13px; font-weight: 700; color: #00D4FF; margin-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 6px;">
        ${name}
      </div>
      <div style="display: flex; flex-direction: column; gap: 5px;">
        <div style="display: flex; justify-content: space-between; font-size: 11px;">
          <span style="color: rgba(255,255,255,0.6);">Annual Replenishment</span>
          <span style="color: white; font-weight: 600;">${Number(props.Annual_Rep ?? 0).toFixed(2)} BCM</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 11px;">
          <span style="color: rgba(255,255,255,0.6);">Net GW Availability</span>
          <span style="color: white; font-weight: 600;">${Number(props.Net_GW ?? 0).toFixed(2)} BCM</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 11px;">
          <span style="color: rgba(255,255,255,0.6);">Total Draft</span>
          <span style="color: white; font-weight: 600;">${Number(props.Total_Curr ?? 0).toFixed(2)} BCM</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 11px;">
          <span style="color: rgba(255,255,255,0.6);">GW Extraction Stage</span>
          <span style="color: ${catColor}; font-weight: 700;">${stage.toFixed(1)}% (${category})</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 11px;">
          <span style="color: rgba(255,255,255,0.6);">Year</span>
          <span style="color: white; font-weight: 600;">${props.Year ?? 'N/A'}</span>
        </div>
      </div>
    </div>
  `;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ChoroplethLayer: React.FC<ChoroplethLayerProps> = ({
  data,
  mode,
  onFeatureClick,
  opacity = 0.75,
}) => {
  const map = useMap();
  const geojsonRef = useRef<L.GeoJSON | null>(null);

  // Re-bind tooltip and click events whenever data or mode changes
  useEffect(() => {
    if (!geojsonRef.current) return;
    geojsonRef.current.eachLayer((layer: Layer) => {
      const leafletLayer = layer as L.Path;
      leafletLayer.unbindTooltip();
    });
  }, [data, mode]);

  // Automatically fit map bounds when district data loads
  useEffect(() => {
    if (geojsonRef.current && mode === 'groundwater_district' && (data as any)?.features?.length > 0) {
      try {
        const bounds = geojsonRef.current.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [30, 30], maxZoom: 8 });
        }
      } catch (e) {
        console.error('Failed to fit map bounds:', e);
      }
    }
  }, [data, mode, map]);

  const styleFeature = (feature?: Feature) => {
    if (!feature) return {};
    return {
      fillColor: getColor(feature, mode),
      weight: 0.8,
      opacity: 1,
      color: 'rgba(255,255,255,0.2)',
      fillOpacity: opacity,
    };
  };

  const onEachFeature = (feature: Feature, layer: Layer) => {
    const props = (feature.properties ?? {}) as Record<string, unknown>;
    const tooltipContent = mode === 'rainfall'
      ? buildRainfallTooltip(props)
      : buildGroundwaterTooltip(props, mode);

    (layer as L.Path).bindTooltip(tooltipContent, {
      sticky: true,
      className: 'leaflet-tooltip-dark',
      opacity: 1,
    });

    layer.on({
      mouseover: (e: LeafletEvent) => {
        const le = e as LeafletMouseEvent;
        (le.target as L.Path).setStyle({
          weight: 2,
          color: '#00D4FF',
          fillOpacity: Math.min(opacity + 0.15, 1),
        });
        (le.target as L.Path).bringToFront();
      },
      mouseout: (e: LeafletEvent) => {
        const le = e as LeafletMouseEvent;
        if (geojsonRef.current) {
          geojsonRef.current.resetStyle(le.target as L.Path);
        }
      },
      click: (e: LeafletEvent) => {
        const le = e as LeafletMouseEvent;
        const bounds = (le.target as L.Polygon).getBounds();
        map.fitBounds(bounds, { padding: [40, 40] });
        onFeatureClick?.(props);
      },
    });
  };

  return (
    <GeoJSON
      key={`${mode}-${(data as any)?.features?.length ?? 0}-${(data as any)?.features?.[0]?.properties?.State ?? ''}-${(data as any)?.features?.[0]?.properties?.rainfall ?? (data as any)?.features?.[0]?.properties?.Stage_of_G ?? ''}`}
      ref={geojsonRef}
      data={data}
      style={styleFeature}
      onEachFeature={onEachFeature}
    />
  );
};

export default ChoroplethLayer;
