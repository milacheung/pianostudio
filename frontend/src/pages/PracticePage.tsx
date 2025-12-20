import { PracticeTimer } from '@/components/practice/PracticeTimer';
import { PointsDisplay } from '@/components/common/PointsDisplay';
import { StreakBadge } from '@/components/common/StreakBadge';
import { Card } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { apiService } from '@/services/api';
import type { PracticeStats } from '@/types';
import { TrendingUp, Target } from 'lucide-react';
import { useDailyGoal } from '@/hooks/useDailyGoal';

export function PracticePage() {
  const [stats, setStats] = useState<PracticeStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const { dailyGoal } = useDailyGoal();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoadingStats(true);
      const practiceStats = await apiService.getPracticeStats();
      setStats(practiceStats);
    } catch (error) {
      console.error('Failed to load practice stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handlePracticeComplete = async (minutes: number, points: number) => {
    console.log(`Practice completed: ${minutes} minutes, ${points} points`);
    // Refresh stats after completing practice
    await loadStats();
  };

  return (
    <div className="container max-w-4xl px-4 py-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-heading font-bold text-piano-purple">
            Practice Time!
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Track your practice and earn points
          </p>
        </div>

        {/* Stats Cards Row */}
        {!isLoadingStats && stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {/* Total Points */}
            <Card className="p-4 flex flex-col items-center gap-2">
              <div className="text-xs text-muted-foreground uppercase font-semibold">Total Points</div>
              <PointsDisplay points={stats.totalPoints} size="lg" />
            </Card>

            {/* Current Streak */}
            <Card className="p-4 flex flex-col items-center gap-2">
              <div className="text-xs text-muted-foreground uppercase font-semibold">Streak</div>
              <StreakBadge streak={stats.currentStreak} size="lg" />
            </Card>

            {/* Today's Goal Progress */}
            <Card className="p-4 flex flex-col items-center gap-2">
              <div className="text-xs text-muted-foreground uppercase font-semibold">Today's Goal</div>
              <div className="flex items-center gap-2">
                <Target className={`${stats.totalMinutesToday >= dailyGoal ? 'text-green-500' : 'text-piano-teal'}`} size={20} />
                <span className={`text-xl font-bold ${stats.totalMinutesToday >= dailyGoal ? 'text-green-500' : ''}`}>
                  {stats.totalMinutesToday}/{dailyGoal} min
                </span>
              </div>
              {stats.totalMinutesToday >= dailyGoal && (
                <span className="text-xs text-green-500 font-medium">Goal reached!</span>
              )}
            </Card>

            {/* This Week */}
            <Card className="p-4 flex flex-col items-center gap-2">
              <div className="text-xs text-muted-foreground uppercase font-semibold">This Week</div>
              <div className="flex items-center gap-2">
                <TrendingUp className="text-piano-purple" size={20} />
                <span className="text-xl font-bold">{stats.totalMinutesWeek} min</span>
              </div>
            </Card>
          </div>
        )}

        {/* Practice Timer */}
        <PracticeTimer goalMinutes={dailyGoal} onComplete={handlePracticeComplete} />

        {/* Helpful Tips */}
        <Card className="p-4 md:p-6 bg-gradient-to-br from-piano-purple/5 to-piano-teal/5">
          <h3 className="font-heading font-bold text-lg mb-3">Practice Tips</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-piano-purple font-bold">•</span>
              <span>Earn 10 points for every 5 minutes you practice</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-piano-pink font-bold">•</span>
              <span>Practice every day to build your streak</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-piano-teal font-bold">•</span>
              <span>Your progress is automatically saved - refresh anytime!</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
