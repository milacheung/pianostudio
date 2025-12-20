import { useState, useEffect } from 'react';
import { Clock, Trophy, Flame, TrendingUp } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiService } from '@/services/api';
import { StatsCard } from './StatsCard';
import { QuickPracticeButton } from './QuickPracticeButton';
import { ActiveAssignments } from './ActiveAssignments';
import { RecentActivity } from './RecentActivity';
import { StreakWarning } from './StreakWarning';
import type { StudentDashboardData } from '@/types';

export function StudentDashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const data = await apiService.getStudentDashboard();
        setDashboardData(data);
      } catch (err) {
        console.error('Failed to fetch dashboard:', err);
        // Use mock data as fallback
        setDashboardData({
          stats: {
            totalMinutesToday: 0,
            totalMinutesWeek: 0,
            totalMinutesMonth: 0,
            currentStreak: 0,
            totalPoints: 0,
          },
          activeAssignments: [],
          recentSessions: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const formatDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="container max-w-6xl px-4 py-6 space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-20 bg-gray-200 rounded-lg"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-40 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }


  const stats = dashboardData?.stats || {
    totalMinutesToday: 0,
    totalMinutesWeek: 0,
    totalMinutesMonth: 0,
    currentStreak: 0,
    totalPoints: 0,
  };

  return (
    <div className="container max-w-6xl px-4 py-6 space-y-6">
      {/* Header Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-piano-purple">
            Hi {user?.firstName || user?.name || 'Student'}! 👋
          </h1>
          {stats.currentStreak > 0 && (
            <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full bg-piano-streak/10 border border-piano-streak/30">
              <Flame className="h-4 w-4 text-piano-streak fill-current" />
              <span className="text-sm font-semibold text-piano-streak">
                {stats.currentStreak} day streak
              </span>
            </div>
          )}
        </div>
        <p className="text-muted-foreground font-medium">{formatDate()}</p>
      </div>

      {/* Streak Warning */}
      <StreakWarning
        currentStreak={stats.currentStreak}
        practicedToday={stats.totalMinutesToday > 0}
      />

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatsCard
          icon={Clock}
          label="Today's Practice"
          value={stats.totalMinutesToday}
          suffix=" min"
          color="teal"
        />
        <StatsCard
          icon={TrendingUp}
          label="This Week"
          value={stats.totalMinutesWeek}
          suffix=" min"
          color="purple"
        />
        <StatsCard
          icon={Trophy}
          label="Total Points"
          value={stats.totalPoints.toLocaleString()}
          color="gold"
        />
        <StatsCard
          icon={Flame}
          label="Current Streak"
          value={stats.currentStreak}
          suffix=" days"
          color="orange"
        />
      </div>

      {/* Quick Practice Button */}
      <QuickPracticeButton />

      {/* Active Assignments */}
      <ActiveAssignments assignments={dashboardData?.activeAssignments || []} />

      {/* Recent Activity */}
      <RecentActivity sessions={dashboardData?.recentSessions || []} />
    </div>
  );
}
