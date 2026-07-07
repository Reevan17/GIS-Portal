import React from 'react';
import { FiPlay, FiPause, FiChevronRight, FiChevronLeft, FiRefreshCw } from 'react-icons/fi';
import { useTimeline } from '../../hooks/useTimeline';
import type { AvailableYear } from '../../types';
import { AVAILABLE_YEARS } from '../../types';

interface YearSelectorProps {
  selectedYear: AvailableYear;
  onYearChange: (year: AvailableYear) => void;
  showPlayback?: boolean;
}

const YearSelector: React.FC<YearSelectorProps> = ({
  selectedYear,
  onYearChange,
  showPlayback = true,
}) => {
  const {
    isPlaying,
    currentYear,
    play,
    pause,
    reset,
    next,
    prev,
    setYear,
    speed,
    setSpeed,
  } = useTimeline(selectedYear);

  const handleSelect = (yr: AvailableYear) => {
    setYear(yr);
    onYearChange(yr);
  };

  // Only sync from timeline to parent if playing
  React.useEffect(() => {
    if (isPlaying && currentYear !== selectedYear) {
      onYearChange(currentYear as AvailableYear);
    }
  }, [currentYear, isPlaying]);

  // Sync timeline to parent when selectedYear changes externally (but not during playback)
  React.useEffect(() => {
    if (!isPlaying && selectedYear !== currentYear) {
      setYear(selectedYear);
    }
  }, [selectedYear, isPlaying]);

  return (
    <div className="flex flex-col gap-4 w-full p-4 bg-white/[0.04] dark:bg-white/[0.04] backdrop-blur-md border border-white/10 rounded-2xl">
      {/* Upper row: Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
          Timeline Year Selector
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full md:max-w-none">
          {AVAILABLE_YEARS.map((yr) => {
            const isSel = yr === selectedYear;
            return (
              <button
                key={yr}
                onClick={() => handleSelect(yr)}
                className={`relative px-3.5 py-1.5 rounded-lg text-xs font-bold tracking-wider transition-all duration-300 ${
                  isSel
                    ? 'bg-primary text-[#08111F] shadow-[0_0_12px_rgba(0,212,255,0.4)]'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                {yr}
              </button>
            );
          })}
        </div>
      </div>

      {/* Lower row: Slider and Play Controls */}
      {showPlayback && (
        <div className="flex flex-col md:flex-row items-center gap-4 pt-2 border-t border-white/5">
          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={prev}
              title="Previous Year"
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 transition"
            >
              <FiChevronLeft size={16} />
            </button>
            
            <button
              onClick={isPlaying ? pause : play}
              title={isPlaying ? 'Pause Timeline' : 'Play Timeline'}
              className="p-2.5 rounded-lg bg-primary hover:bg-[#00b4dd] text-[#08111F] font-bold shadow-[0_0_15px_rgba(0,212,255,0.3)] transition"
            >
              {isPlaying ? <FiPause size={16} /> : <FiPlay size={16} />}
            </button>

            <button
              onClick={next}
              title="Next Year"
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 transition"
            >
              <FiChevronRight size={16} />
            </button>

            <button
              onClick={reset}
              title="Reset"
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 hover:text-white transition"
            >
              <FiRefreshCw size={14} />
            </button>
          </div>

          {/* Timeline Slider bar */}
          <div className="flex-1 w-full flex items-center gap-3">
            <input
              type="range"
              min="0"
              max={AVAILABLE_YEARS.length - 1}
              value={AVAILABLE_YEARS.indexOf(selectedYear)}
              onChange={(e) => handleSelect(AVAILABLE_YEARS[parseInt(e.target.value)])}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
            />
            <span className="text-xs font-mono font-bold text-primary px-2 bg-primary/10 rounded border border-primary/20">
              {selectedYear}
            </span>
          </div>

          {/* Play speed control */}
          <div className="flex items-center gap-2">
            <label className="text-[10px] uppercase font-bold text-white/40 tracking-wider">
              Speed
            </label>
            <select
              value={speed}
              onChange={(e) => setSpeed(parseInt(e.target.value))}
              className="bg-background-light border border-white/10 rounded-lg px-2 py-1 text-xs text-white/80 focus:outline-none focus:border-primary"
            >
              <option value="3000">Slow (3s)</option>
              <option value="2000">Normal (2s)</option>
              <option value="1000">Fast (1s)</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default YearSelector;
