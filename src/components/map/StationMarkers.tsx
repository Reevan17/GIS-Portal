import React, { useRef } from 'react';
import { CircleMarker, Popup } from 'react-leaflet';
import type { StationCollection } from '../../types';
import { FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';

interface StationMarkersProps {
  data: StationCollection;
  showLabels?: boolean;
}

function getMarkerColor(wlsPre: number | null, wlsPost: number | null): string {
  if (wlsPre === null && wlsPost === null) return '#94A3B8'; // grey - no data
  const val = wlsPre ?? wlsPost ?? 0;
  // Positive = deeper water table (more extraction needed)
  if (val > 10) return '#EF4444';    // Critical - very deep
  if (val > 5)  return '#F59E0B';    // Semi-critical
  if (val > 2)  return '#22C55E';    // Moderate - normal
  return '#00D4FF';                   // Shallow / recharge zone
}

function getTrendIcon(trend: string | null): React.ReactNode {
  if (!trend) return <span className="text-white/40 text-xs">No data</span>;
  const t = trend.toLowerCase();
  if (t.includes('declin') || t.includes('fall')) {
    return <span className="text-red-400 text-xs flex items-center gap-1"><FiAlertTriangle size={10} />Declining</span>;
  }
  if (t.includes('rise') || t.includes('improv')) {
    return <span className="text-green-400 text-xs flex items-center gap-1"><FiCheckCircle size={10} />Rising</span>;
  }
  return <span className="text-yellow-400 text-xs">Stable</span>;
}

export const StationMarkers: React.FC<StationMarkersProps> = ({
  data,
  showLabels = false,
}) => {
  const layerRef = useRef(null);

  if (!data?.features?.length) return null;

  return (
    <>
      {data.features.map((feature, idx) => {
        const coords = feature.geometry.coordinates as [number, number];
        const props = feature.properties;

        // GeoJSON coords are [lng, lat]
        const lat = coords[1];
        const lng = coords[0];

        if (typeof lat !== 'number' || typeof lng !== 'number') return null;
        if (isNaN(lat) || isNaN(lng)) return null;

        const color = getMarkerColor(props.WLS_Pre, props.WLS_Post);

        return (
          <CircleMarker
            key={`station-${idx}`}
            ref={layerRef}
            center={[lat, lng]}
            radius={showLabels ? 6 : 5}
            pathOptions={{
              fillColor: color,
              color: 'rgba(255,255,255,0.4)',
              weight: 1,
              fillOpacity: 0.85,
            }}
          >
            <Popup>
              <div className="min-w-[200px] p-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#00D4FF',
                    marginBottom: 8,
                    paddingBottom: 6,
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  {props.STATION_NA || 'Unknown Station'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {[
                    { label: 'State',       value: props.STATE || '—' },
                    { label: 'District',    value: props.DISTRICT || '—' },
                    { label: 'Site Type',   value: props.SITE_TYPE || '—' },
                    {
                      label: 'Pre-Monsoon WL',
                      value: props.WLS_Pre != null ? `${props.WLS_Pre.toFixed(2)} m` : 'N/A',
                    },
                    {
                      label: 'Post-Monsoon WL',
                      value: props.WLS_Post != null ? `${props.WLS_Post.toFixed(2)} m` : 'N/A',
                    },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: 11,
                        gap: 8,
                      }}
                    >
                      <span style={{ color: 'rgba(255,255,255,0.55)' }}>{label}</span>
                      <span style={{ color: 'white', fontWeight: 600, textAlign: 'right' }}>
                        {String(value)}
                      </span>
                    </div>
                  ))}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 11,
                      marginTop: 2,
                    }}
                  >
                    <span style={{ color: 'rgba(255,255,255,0.55)' }}>Long-Term Trend</span>
                    <span>{getTrendIcon(props.WLS_Long_T)}</span>
                  </div>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </>
  );
};

export default StationMarkers;
