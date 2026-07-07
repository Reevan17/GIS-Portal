import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  padding?: string;
}

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = true,
  padding = 'p-6',
}) => {
  const cardStyle = `
    glass-card
    ${padding}
    bg-white/[0.06]
    dark:bg-white/[0.06]
    backdrop-blur-xl
    border
    border-white/10
    rounded-2xl
    text-white
    shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `;

  if (hoverable) {
    return (
      <motion.div
        className={cardStyle}
        onClick={onClick}
        whileHover={{
          scale: 1.015,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderColor: 'rgba(56, 189, 248, 0.3)', // Accent glow
          boxShadow: '0 8px 32px 0 rgba(0, 212, 255, 0.15)',
        }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={cardStyle} onClick={onClick}>
      {children}
    </div>
  );
};

export default GlassCard;
