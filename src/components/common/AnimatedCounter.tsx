import React, { useEffect, useState } from 'react';

interface AnimatedCounterProps {
  target: number;
  duration?: number; // duration in ms
  suffix?: string;
  decimals?: number;
  className?: string;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  target,
  duration = 1500,
  suffix = '',
  decimals = 0,
  className = '',
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = 0;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Easing function: easeOutExpo
      const easing = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      const currentValue = startValue + easing * (target - startValue);
      setCount(currentValue);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [target, duration]);

  const formattedValue = count.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span className={`font-mono font-bold ${className}`}>
      {formattedValue}
      {suffix}
    </span>
  );
};

export default AnimatedCounter;
