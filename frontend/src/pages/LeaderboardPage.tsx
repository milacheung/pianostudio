import { useState, useEffect } from 'react';
import { Trophy, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { LeaderboardPodium } from '@/components/leaderboard/LeaderboardPodium';
import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable';
import { apiService } from '@/services/api';
import type { LeaderboardResponse } from '@/types';
import { useAuth } from '@/context/AuthContext';

export function LeaderboardPage() {
  const { user } = useAuth();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'points' | 'streak' | 'weekly'>('points');

  const fetchLeaderboard = async (sort: 'points' | 'streak' | 'weekly') => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getLeaderboard(sort);
      setLeaderboardData(data);
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
      setError('Failed to load leaderboard. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(sortBy);
  }, [sortBy]);

  const handleSortChange = (newSort: 'points' | 'streak' | 'weekly') => {
    setSortBy(newSort);
  };

  // Find current user's rank
  const myRank = leaderboardData?.myRank;
  const isInTopList = leaderboardData?.entries.some((entry) => entry.studentId === user?.id);

  return (
    <div className="container max-w-4xl px-4 py-6">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-heading font-bold">Leaderboard</h1>
          <p className="text-muted-foreground mt-1">
            See how you rank against other students in your studio
          </p>
        </div>

        {/* My Rank Banner */}
        {myRank && user?.role === 'STUDENT' && !isInTopList && (
          <Card className="card-rounded bg-gradient-to-r from-piano-purple to-piano-pink text-white">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                    <Trophy className="text-white" size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-medium opacity-90">Your Current Rank</p>
                    <p className="text-2xl font-bold">#{myRank}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm opacity-90">
                    out of {leaderboardData?.totalStudents || 0} students
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <Card className="card-rounded">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 text-piano-purple animate-spin mb-4" />
              <p className="text-muted-foreground">Loading leaderboard...</p>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && !loading && (
          <Card className="card-rounded border-destructive">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Trophy className="h-16 w-16 text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-destructive">Error Loading Leaderboard</h3>
              <p className="text-sm text-muted-foreground max-w-md mb-4">{error}</p>
              <button
                onClick={() => fetchLeaderboard(sortBy)}
                className="px-4 py-2 bg-piano-purple text-white rounded-lg hover:bg-piano-purple-dark transition-colors"
              >
                Try Again
              </button>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!loading && !error && leaderboardData && leaderboardData.entries.length === 0 && (
          <Card className="card-rounded">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Trophy className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Students Yet</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Be the first to start practicing and earn points to appear on the leaderboard!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Leaderboard Content */}
        {!loading && !error && leaderboardData && leaderboardData.entries.length > 0 && (
          <>
            {/* Podium for Top 3 */}
            {leaderboardData.entries.length >= 3 && (
              <LeaderboardPodium entries={leaderboardData.entries} />
            )}

            {/* Full Leaderboard Table */}
            <LeaderboardTable
              entries={leaderboardData.entries}
              sortBy={sortBy}
              onSortChange={handleSortChange}
            />

            {/* Total Students Count */}
            <div className="text-center text-sm text-muted-foreground">
              Showing {leaderboardData.entries.length} of {leaderboardData.totalStudents} students
            </div>
          </>
        )}
      </div>
    </div>
  );
}
