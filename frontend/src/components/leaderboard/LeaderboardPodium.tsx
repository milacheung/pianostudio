import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Trophy, Medal, Award, Flame } from 'lucide-react';
import type { LeaderboardEntry } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface LeaderboardPodiumProps {
  entries: LeaderboardEntry[];
}

export function LeaderboardPodium({ entries }: LeaderboardPodiumProps) {
  const { user } = useAuth();

  // Only show top 3
  const topThree = entries.slice(0, 3);

  // Rearrange for podium effect: [2nd, 1st, 3rd]
  const podiumOrder = [
    topThree[1], // 2nd place on left
    topThree[0], // 1st place in center
    topThree[2], // 3rd place on right
  ].filter(Boolean);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-300 to-yellow-500';
    if (rank === 2) return 'from-gray-300 to-gray-400';
    if (rank === 3) return 'from-amber-600 to-amber-800';
    return 'from-gray-100 to-gray-300';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="text-piano-gold fill-piano-gold" size={32} />;
    if (rank === 2) return <Medal className="text-gray-400 fill-gray-400" size={28} />;
    if (rank === 3) return <Award className="text-amber-700 fill-amber-700" size={24} />;
    return null;
  };

  const getPodiumHeight = (rank: number) => {
    if (rank === 1) return 'h-32';
    if (rank === 2) return 'h-24';
    if (rank === 3) return 'h-20';
    return 'h-16';
  };

  const isCurrentUser = (entry: LeaderboardEntry) => {
    return user?.id === entry.studentId;
  };

  if (topThree.length === 0) {
    return null;
  }

  return (
    <Card className="card-rounded overflow-hidden bg-gradient-to-br from-piano-purple/5 to-piano-pink/5">
      <div className="p-6">
        <h3 className="text-lg font-heading font-bold text-center mb-6 flex items-center justify-center gap-2">
          <Trophy className="text-piano-gold" size={24} />
          Top Performers
        </h3>

        {/* Podium */}
        <div className="flex items-end justify-center gap-4 mb-6">
          {podiumOrder.map((entry) => {
            if (!entry) return null;
            const isMe = isCurrentUser(entry);

            return (
              <div
                key={entry.studentId}
                className={`flex flex-col items-center ${
                  entry.rank === 1 ? 'w-32' : 'w-28'
                }`}
              >
                {/* Avatar */}
                <div className="relative mb-3">
                  <Avatar
                    className={`${
                      entry.rank === 1
                        ? 'h-24 w-24 border-4'
                        : entry.rank === 2
                        ? 'h-20 w-20 border-3'
                        : 'h-18 w-18 border-2'
                    } border-white shadow-lg ring-4 ring-${
                      entry.rank === 1 ? 'yellow' : entry.rank === 2 ? 'gray' : 'amber'
                    }-300`}
                  >
                    <AvatarImage src={entry.avatarUrl} alt={entry.studentName} />
                    <AvatarFallback className="bg-gradient-to-br from-piano-purple to-piano-pink text-white font-bold text-lg">
                      {getInitials(entry.studentName)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Medal Badge */}
                  <div className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-lg">
                    {getRankIcon(entry.rank)}
                  </div>
                </div>

                {/* Name */}
                <div className="text-center mb-2">
                  <p
                    className={`font-semibold ${
                      entry.rank === 1 ? 'text-base' : 'text-sm'
                    } truncate max-w-full`}
                  >
                    {entry.studentName}
                  </p>
                  {isMe && (
                    <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-piano-purple text-white mt-1">
                      You
                    </span>
                  )}
                </div>

                {/* Stats */}
                <div className="text-center mb-2 space-y-1">
                  <div className="flex items-center justify-center gap-1">
                    <Trophy className="text-piano-gold" size={14} />
                    <span className="text-sm font-bold">
                      {entry.totalPoints.toLocaleString()}
                    </span>
                  </div>
                  {entry.currentStreak > 0 && (
                    <div className="flex items-center justify-center gap-1">
                      <Flame className="text-piano-streak" size={14} />
                      <span className="text-xs font-semibold">
                        {entry.currentStreak}
                      </span>
                    </div>
                  )}
                </div>

                {/* Podium Step */}
                <div
                  className={`w-full ${getPodiumHeight(
                    entry.rank
                  )} bg-gradient-to-b ${getRankColor(
                    entry.rank
                  )} rounded-t-lg shadow-inner flex items-center justify-center`}
                >
                  <span className="text-white font-bold text-3xl opacity-50">
                    {entry.rank}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
