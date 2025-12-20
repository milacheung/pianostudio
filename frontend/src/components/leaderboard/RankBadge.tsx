import { Trophy, Medal, Award } from 'lucide-react';

interface RankBadgeProps {
  rank: number;
  size?: 'sm' | 'md' | 'lg';
}

export function RankBadge({ rank, size = 'md' }: RankBadgeProps) {
  const sizeClasses = {
    sm: 'h-6 w-6 text-sm',
    md: 'h-8 w-8 text-base',
    lg: 'h-10 w-10 text-lg',
  };

  const iconSize = {
    sm: 20,
    md: 24,
    lg: 28,
  };

  // Top 3 get medals
  if (rank === 1) {
    return (
      <div className={`flex items-center justify-center ${sizeClasses[size]}`}>
        <Trophy className="text-piano-gold fill-piano-gold" size={iconSize[size]} />
      </div>
    );
  }

  if (rank === 2) {
    return (
      <div className={`flex items-center justify-center ${sizeClasses[size]}`}>
        <Medal className="text-gray-400 fill-gray-400" size={iconSize[size]} />
      </div>
    );
  }

  if (rank === 3) {
    return (
      <div className={`flex items-center justify-center ${sizeClasses[size]}`}>
        <Award className="text-amber-700 fill-amber-700" size={iconSize[size]} />
      </div>
    );
  }

  // Ranks 4+ get a number badge
  return (
    <div
      className={`flex items-center justify-center ${sizeClasses[size]} rounded-full bg-muted font-semibold text-muted-foreground`}
    >
      {rank}
    </div>
  );
}
