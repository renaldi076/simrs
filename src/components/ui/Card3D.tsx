import React from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { COLOR_MAP } from '@/constants/theme';
import type { CardColorScheme } from '@/types/common';

interface Card3DProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  onClick: () => void;
  colorScheme: CardColorScheme;
  disabled?: boolean;
  error?: boolean;
  index?: number;
}

export function Card3D({
  icon,
  label,
  description,
  onClick,
  colorScheme,
  disabled = false,
  error = false,
  index = 0,
}: Card3DProps): React.ReactElement {
  const prefersReducedMotion = useReducedMotion();
  const colors = COLOR_MAP[colorScheme];

  const entranceVariants = prefersReducedMotion
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, delay: index * 0.06 },
        },
      };

  const hoverEffect = prefersReducedMotion
    ? {}
    : {
        rotateX: -3,
        rotateY: 3,
        y: -8,
        boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
        transition: { duration: 0.3 },
      };

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      variants={entranceVariants}
      initial="hidden"
      animate="visible"
      whileHover={disabled ? undefined : hoverEffect}
      style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
      className={`
        relative flex flex-col items-center gap-3 rounded-xl bg-white p-6
        shadow-sm border border-gray-100 transition-shadow
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      aria-label={label}
    >
      <div className={`rounded-xl p-3 ${colors.bg} ${colors.text}`}>
        {icon}
      </div>
      <span className="text-sm font-medium text-gray-800">{label}</span>
      {description && (
        <span className="text-xs text-gray-500 text-center">{description}</span>
      )}
      {error && (
        <span className="text-xs text-red-600 font-medium">Error</span>
      )}
    </motion.button>
  );
}

export default Card3D;
