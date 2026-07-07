import React from 'react';

// Shimmer gradient style helper
const shimmerClass = "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent bg-white/5 rounded-xl";

export const MapSkeleton: React.FC = () => {
  return (
    <div className={`${shimmerClass} w-full h-[550px] border border-white/5 shadow-2xl`}>
      <div className="absolute top-4 left-4 z-10 w-32 h-8 bg-white/10 rounded-md" />
      <div className="absolute top-4 right-4 z-10 w-48 h-8 bg-white/10 rounded-md" />
      <div className="absolute bottom-4 left-4 z-10 w-24 h-12 bg-white/10 rounded-md" />
    </div>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className={`${shimmerClass} p-6 border border-white/5 flex flex-col gap-3 min-h-[120px]`}>
      <div className="w-1/3 h-4 bg-white/10 rounded" />
      <div className="w-2/3 h-8 bg-white/15 rounded-md" />
      <div className="w-1/2 h-3 bg-white/5 rounded" />
    </div>
  );
};

export const ChartSkeleton: React.FC = () => {
  return (
    <div className={`${shimmerClass} w-full h-[320px] p-6 border border-white/5 flex flex-col justify-between`}>
      <div className="flex justify-between items-center mb-4">
        <div className="w-1/4 h-5 bg-white/15 rounded" />
        <div className="w-20 h-4 bg-white/10 rounded" />
      </div>
      <div className="flex-1 flex items-end gap-3 px-2">
        <div className="flex-1 h-[20%] bg-white/10 rounded-t" />
        <div className="flex-1 h-[50%] bg-white/10 rounded-t" />
        <div className="flex-1 h-[80%] bg-white/10 rounded-t" />
        <div className="flex-1 h-[40%] bg-white/10 rounded-t" />
        <div className="flex-1 h-[90%] bg-white/10 rounded-t" />
        <div className="flex-1 h-[60%] bg-white/10 rounded-t" />
      </div>
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="w-full flex flex-col gap-3 border border-white/5 p-4 rounded-2xl bg-white/[0.04]">
      {/* Header */}
      <div className="flex gap-4 pb-2 border-b border-white/10">
        <div className={`${shimmerClass} flex-1 h-5`} />
        <div className={`${shimmerClass} w-24 h-5`} />
        <div className={`${shimmerClass} w-24 h-5`} />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center">
          <div className={`${shimmerClass} flex-1 h-4`} />
          <div className={`${shimmerClass} w-24 h-4`} />
          <div className={`${shimmerClass} w-24 h-4`} />
        </div>
      ))}
    </div>
  );
};
