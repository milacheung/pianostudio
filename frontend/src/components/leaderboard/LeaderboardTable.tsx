import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { RankBadge } from './RankBadge';
import { Trophy, Flame, Clock } from 'lucide-react';
import type { LeaderboardEntry } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  sortBy: 'points' | 'streak' | 'weekly';
  onSortChange: (sortBy: 'points' | 'streak' | 'weekly') => void;
}

export function LeaderboardTable({ entries, sortBy, onSortChange }: LeaderboardTableProps) {
  const { user } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isCurrentUser = (entry: LeaderboardEntry) => {
    return user?.id === entry.studentId;
  };

  const getSortButtonClass = (sort: string) => {
    return `flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
      sortBy === sort
        ? 'bg-piano-purple text-white shadow-md'
        : 'bg-muted text-muted-foreground hover:bg-accent'
    }`;
  };

  return (
    <div className="space-y-4">
      {/* Sort Buttons */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button onClick={() => onSortChange('points')} className={getSortButtonClass('points')}>
          <Trophy size={16} />
          <span>Total Points</span>
        </button>
        <button onClick={() => onSortChange('streak')} className={getSortButtonClass('streak')}>
          <Flame size={16} />
          <span>Streak</span>
        </button>
        <button onClick={() => onSortChange('weekly')} className={getSortButtonClass('weekly')}>
          <Clock size={16} />
          <span>This Week</span>
        </button>
      </div>

      {/* Leaderboard List */}
      <Card className="card-rounded">
        <CardContent className="p-0">
          <div className="divide-y">
            {entries.map((entry) => {
              const isMe = isCurrentUser(entry);
              return (
                <div
                  key={entry.studentId}
                  className={`flex items-center gap-4 p-4 transition-colors ${
                    isMe
                      ? 'bg-piano-purple/10 border-l-4 border-piano-purple'
                      : 'hover:bg-accent'
                  }`}
                >
                  {/* Rank Badge */}
                  <div className="w-10 flex justify-center">
                    <RankBadge rank={entry.rank} size="md" />
                  </div>

                  {/* Avatar */}
                  <Avatar className="h-14 w-14 border-2 border-background shadow-sm">
                    <AvatarImage src={entry.avatarUrl} alt={entry.studentName} />
                    <AvatarFallback className="bg-gradient-to-br from-piano-purple to-piano-pink text-white font-semibold">
                      {getInitials(entry.studentName)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Name and Stats */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-base truncate">
                        {entry.studentName}
                      </h4>
                      {isMe && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-piano-purple text-white">
                          You
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5">
                      {/* Points */}
                      <div className="flex items-center gap-1.5">
                        <Trophy className="text-piano-gold" size={16} />
                        <span className="text-sm font-semibold">
                          {entry.totalPoints.toLocaleString()}
                        </span>
                      </div>

                      {/* Streak */}
                      <div className="flex items-center gap-1.5">
                        <Flame className="text-piano-streak" size={16} />
                        <span className="text-sm font-semibold">
                          {entry.currentStreak} day{entry.currentStreak !== 1 ? 's' : ''}
                        </span>
                      </div>

                      {/* Weekly Minutes */}
                      <div className="flex items-center gap-1.5">
                        <Clock className="text-piano-teal" size={16} />
                        <span className="text-sm font-semibold">
                          {entry.weeklyMinutes} min
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Primary Stat (based on sort) */}
                  <div className="text-right">
                    {sortBy === 'points' && (
                      <div className="text-2xl font-bold text-piano-gold">
                        {entry.totalPoints.toLocaleString()}
                      </div>
                    )}
                    {sortBy === 'streak' && (
                      <div className="text-2xl font-bold text-piano-streak">
                        {entry.currentStreak}
                      </div>
                    )}
                    {sortBy === 'weekly' && (
                      <div className="text-2xl font-bold text-piano-teal">
                        {entry.weeklyMinutes}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {sortBy === 'points' && 'points'}
                      {sortBy === 'streak' && 'days'}
                      {sortBy === 'weekly' && 'min'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
