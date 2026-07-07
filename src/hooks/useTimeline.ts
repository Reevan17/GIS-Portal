import { useState, useEffect, useCallback } from 'react';
import type { AvailableYear } from '../types';
import { AVAILABLE_YEARS } from '../types';

export function useTimeline(initialYear: AvailableYear = 2024) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentYearIndex, setCurrentYearIndex] = useState<number>(() => {
    const index = AVAILABLE_YEARS.indexOf(initialYear);
    return index !== -1 ? index : AVAILABLE_YEARS.length - 1;
  });
  const [speed, setSpeed] = useState<number>(2000); // interval duration in ms (2000 default)

  const currentYear = AVAILABLE_YEARS[currentYearIndex];

  const play = useCallback(() => setIsPlaying(true), []);
  const pause = useCallback(() => setIsPlaying(false), []);
  
  const reset = useCallback(() => {
    setCurrentYearIndex(0);
    setIsPlaying(false);
  }, []);

  const next = useCallback(() => {
    setCurrentYearIndex((prevIndex) => (prevIndex + 1) % AVAILABLE_YEARS.length);
  }, []);

  const prev = useCallback(() => {
    setCurrentYearIndex((prevIndex) => (prevIndex - 1 + AVAILABLE_YEARS.length) % AVAILABLE_YEARS.length);
  }, []);

  const setYear = useCallback((year: AvailableYear) => {
    const idx = AVAILABLE_YEARS.indexOf(year);
    if (idx !== -1) {
      setCurrentYearIndex(idx);
    }
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      next();
    }, speed);

    return () => clearInterval(interval);
  }, [isPlaying, speed, next]);

  return {
    isPlaying,
    currentYear,
    currentYearIndex,
    play,
    pause,
    reset,
    next,
    prev,
    setYear,
    speed,
    setSpeed,
    years: AVAILABLE_YEARS,
  };
}
export default useTimeline;
