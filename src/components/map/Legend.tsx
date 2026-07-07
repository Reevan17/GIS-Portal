import React from 'react';

interface LegendItem {
  label: string;
  color: string;
}

interface LegendProps {
  title: string;
  items: LegendItem[];
}

export const Legend: React.FC<LegendProps> = ({ title, items }) => {
  return (
    <div className="p-4 bg-background-light/90 border border-white/10 rounded-2xl shadow-xl w-64 backdrop-blur-md">
      <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 block mb-2.5">
        {title}
      </span>
      <div className="flex flex-col gap-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded border border-white/10 shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs font-semibold text-white/80">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Legend;
