import { Trophy } from 'lucide-react';

interface PointsDisplayProps {
  points: number;
  size?: 'sm' | 'md' | 'lg';
}

export function PointsDisplay({ points, size = 'md' }: PointsDisplayProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  };

  const iconSize = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  return (
    <div className="flex items-center gap-2">
      <Trophy className="text-piano-gold" size={iconSize[size]} />
      <span className={`font-semibold ${sizeClasses[size]}`}>{points.toLocaleString()} pts</span>
    </div>
  );
}
