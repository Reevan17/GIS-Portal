import React from 'react';
import { useApp } from '../../context/AppContext';
import { useMapContext } from '../../context/MapContext';
import { TILE_LAYERS } from '../../utils/constants';
import { FiLayers, FiEye, FiEyeOff } from 'react-icons/fi';

interface LayerControlProps {
  layers: {
    id: string;
    name: string;
    category: string;
  }[];
}

export const LayerControl: React.FC<LayerControlProps> = ({ layers }) => {
  const { activeLayerIds, toggleLayer } = useApp();
  const { activeBaseLayer, setActiveBaseLayer } = useMapContext();

  const groupedLayers = layers.reduce((acc, curr) => {
    if (!acc[curr.category]) {
      acc[curr.category] = [];
    }
    acc[curr.category].push(curr);
    return acc;
  }, {} as Record<string, typeof layers>);

  const categoryLabels: Record<string, string> = {
    administrative: 'Administrative Layers',
    rainfall: 'Rainfall Precipitation',
    groundwater_state: 'Groundwater (State)',
    groundwater_district: 'Groundwater (District)',
    other: 'Other Hydrology Layers',
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-background-light/95 border border-white/10 rounded-2xl shadow-xl w-72 max-h-[80vh] overflow-y-auto backdrop-blur-md">
      <div className="flex items-center gap-2 pb-2.5 border-b border-white/10">
        <FiLayers className="text-primary text-lg" />
        <span className="text-sm font-bold uppercase tracking-wider">GIS Layer Control</span>
      </div>

      {/* Base Layer Switcher */}
      <div className="flex flex-col gap-1.5 pb-2.5 border-b border-white/10">
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Base Layer Map</span>
        <div className="grid grid-cols-2 gap-1">
          {(Object.keys(TILE_LAYERS) as Array<keyof typeof TILE_LAYERS>).map((key) => (
            <button
              key={key}
              onClick={() => setActiveBaseLayer(key)}
              className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider transition ${
                activeBaseLayer === key
                  ? 'bg-primary text-[#08111F]'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {/* GIS Layers Toggler */}
      <div className="flex flex-col gap-4">
        {Object.entries(groupedLayers).map(([cat, list]) => (
          <div key={cat} className="flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70">
              {categoryLabels[cat] || cat}
            </span>
            <div className="flex flex-col gap-1.5">
              {list.map((lyr) => {
                const isActive = activeLayerIds.includes(lyr.id);
                return (
                  <button
                    key={lyr.id}
                    onClick={() => toggleLayer(lyr.id)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl border transition text-xs font-semibold ${
                      isActive
                        ? 'bg-primary/10 border-primary/30 text-white'
                        : 'bg-white/[0.02] border-white/5 text-white/60 hover:border-white/10'
                    }`}
                  >
                    <span>{lyr.name}</span>
                    {isActive ? (
                      <FiEye className="text-primary" />
                    ) : (
                      <FiEyeOff className="text-white/30" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LayerControl;
