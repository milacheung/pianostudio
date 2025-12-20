import { Flame } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface StreakBadgeProps {
  streak: number;
  size?: 'sm' | 'md' | 'lg';
}

export function StreakBadge({ streak, size = 'md' }: StreakBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2',
  };

  const iconSize = {
    sm: 12,
    md: 16,
    lg: 20,
  };

  return (
    <Badge
      variant="outline"
      className={`flex items-center gap-1 border-piano-streak bg-piano-streak/10 text-piano-streak ${sizeClasses[size]}`}
    >
      <Flame size={iconSize[size]} className="fill-current" />
      <span className="font-semibold">{streak} day streak</span>
    </Badge>
  );
}
