import { Award } from 'lucide-react';
import type { Badge, StudentBadge } from '@/types';

// Map badge criteria to emoji icons
const BADGE_ICONS: Record<string, string> = {
  'sessions_1': '🎵',
  'streak_7': '🔥',
  'streak_30': '🏆',
  'hours_100': '💯',
  'assignments_10': '📝',
};

interface BadgeCardProps {
  badge: Badge;
  earnedAt?: string;
  size?: 'sm' | 'md' | 'lg';
  showDescription?: boolean;
}

export function BadgeCard({ badge, earnedAt, size = 'md', showDescription = true }: BadgeCardProps) {
  const isEarned = !!earnedAt;
  const icon = BADGE_ICONS[badge.criteria] || '🏅';

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-20 h-20',
    lg: 'w-24 h-24',
  };

  const iconSizes = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center transition-all ${
          isEarned
            ? 'bg-gradient-to-br from-piano-gold/20 to-piano-gold/10 border-2 border-piano-gold shadow-lg'
            : 'bg-gray-100 border-2 border-gray-200 opacity-50 grayscale'
        }`}
      >
        <span className={iconSizes[size]}>{icon}</span>
      </div>
      <div className="text-center">
        <p className={`font-semibold ${size === 'sm' ? 'text-xs' : 'text-sm'} ${isEarned ? '' : 'text-gray-400'}`}>
          {badge.name}
        </p>
        {showDescription && (
          <p className={`text-muted-foreground ${size === 'sm' ? 'text-[10px]' : 'text-xs'} max-w-[120px]`}>
            {badge.description}
          </p>
        )}
        {isEarned && earnedAt && (
          <p className="text-[10px] text-piano-gold mt-1">
            {new Date(earnedAt).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
}

interface BadgeGridProps {
  allBadges: Badge[];
  earnedBadges: StudentBadge[];
  size?: 'sm' | 'md' | 'lg';
  showDescription?: boolean;
}

export function BadgeGrid({ allBadges, earnedBadges, size = 'md', showDescription = true }: BadgeGridProps) {
  // Create a map of earned badges by ID
  const earnedMap = new Map(earnedBadges.map((eb) => [eb.badge.id, eb.earnedAt]));

  return (
    <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
      {allBadges.map((badge) => (
        <BadgeCard
          key={badge.id}
          badge={badge}
          earnedAt={earnedMap.get(badge.id)}
          size={size}
          showDescription={showDescription}
        />
      ))}
    </div>
  );
}

interface EarnedBadgesListProps {
  earnedBadges: StudentBadge[];
  maxDisplay?: number;
}

export function EarnedBadgesList({ earnedBadges, maxDisplay = 5 }: EarnedBadgesListProps) {
  const displayBadges = earnedBadges.slice(0, maxDisplay);
  const remainingCount = earnedBadges.length - maxDisplay;

  if (earnedBadges.length === 0) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <Award className="h-4 w-4" />
        <span>No badges earned yet</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {displayBadges.map((eb) => {
        const icon = BADGE_ICONS[eb.badge.criteria] || '🏅';
        return (
          <div
            key={eb.id}
            className="w-8 h-8 rounded-full bg-piano-gold/20 border border-piano-gold/50 flex items-center justify-center"
            title={`${eb.badge.name} - ${eb.badge.description}`}
          >
            <span className="text-sm">{icon}</span>
          </div>
        );
      })}
      {remainingCount > 0 && (
        <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
          <span className="text-xs text-gray-500">+{remainingCount}</span>
        </div>
      )}
    </div>
  );
}
