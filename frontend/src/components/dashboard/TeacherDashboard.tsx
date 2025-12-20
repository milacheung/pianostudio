import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, TrendingUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { apiService } from '@/services/api';
import { InviteCodeCard } from './InviteCodeCard';
import { StudioStatsCards } from './StudioStatsCards';
import { StudentListTable } from './StudentListTable';
import { RecentActivityFeed } from './RecentActivityFeed';
import type { TeacherDashboardData } from '@/types';

export function TeacherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<TeacherDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiService.getTeacherDashboard();
        setDashboardData(data);
      } catch (err) {
        console.error('Failed to fetch teacher dashboard:', err);
        // Fall back to mock data if API fails
        setDashboardData(getMockTeacherData(user));
        setError('Using demo data - backend API not connected');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="container max-w-6xl px-4 py-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-piano-purple" />
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="container max-w-6xl px-4 py-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Failed to load dashboard data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl px-4 py-6 space-y-6">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-heading font-bold text-piano-purple">
          {dashboardData.studio.name}
        </h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.firstName || user?.name}! Here's what's happening in your studio.
        </p>
      </div>

      {/* Demo Data Warning */}
      {error && (
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg">
          <div className="flex items-start gap-2">
            <div className="text-orange-600 text-sm">
              <p className="font-semibold mb-1">Demo Mode</p>
              <p>{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Invite Code Card */}
      <InviteCodeCard
        inviteCode={dashboardData.studio.inviteCode}
        studioName={dashboardData.studio.name}
      />

      {/* Stats Cards */}
      <StudioStatsCards
        totalStudents={dashboardData.stats.totalStudents}
        weeklyPracticeMinutes={dashboardData.stats.weeklyPracticeMinutes}
        activeAssignments={dashboardData.stats.activeAssignments}
        averageStreak={dashboardData.stats.averageStreak}
      />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          onClick={() => navigate('/assignments')}
          className="h-auto py-6 px-6 bg-gradient-to-r from-piano-purple to-piano-purple-dark hover:from-piano-purple-dark hover:to-piano-purple touch-target"
          size="lg"
        >
          <div className="flex items-center gap-3 w-full">
            <BookOpen className="h-6 w-6" />
            <div className="flex-1 text-left">
              <p className="font-semibold text-base">Create Assignment</p>
              <p className="text-sm opacity-90">Set goals for your students</p>
            </div>
          </div>
        </Button>
        <Button
          onClick={() => navigate('/leaderboard')}
          className="h-auto py-6 px-6 bg-gradient-to-r from-piano-teal to-teal-600 hover:from-teal-600 hover:to-piano-teal touch-target"
          size="lg"
        >
          <div className="flex items-center gap-3 w-full">
            <TrendingUp className="h-6 w-6" />
            <div className="flex-1 text-left">
              <p className="font-semibold text-base">View Leaderboard</p>
              <p className="text-sm opacity-90">See top performers</p>
            </div>
          </div>
        </Button>
      </div>

      {/* Student List */}
      <StudentListTable students={dashboardData.students} />

      {/* Recent Activity */}
      <RecentActivityFeed activities={dashboardData.recentActivity} />
    </div>
  );
}

// Mock data fallback when API is not available
function getMockTeacherData(user: any): TeacherDashboardData {
  const studioName = user?.studioName || "Demo Piano Studio";
  const inviteCode = user?.inviteCode || "PIANO1";

  return {
    studio: {
      id: 1,
      name: studioName,
      inviteCode: inviteCode,
      studentCount: 8,
    },
    stats: {
      totalStudents: 8,
      weeklyPracticeMinutes: 420,
      activeAssignments: 3,
      averageStreak: 4,
    },
    students: [
      {
        id: 1,
        userId: 10,
        name: "Emma Johnson",
        avatarUrl: undefined,
        lastPractice: "2025-12-10T15:30:00",
        weeklyMinutes: 90,
        currentStreak: 7,
        totalPoints: 450,
      },
      {
        id: 2,
        userId: 11,
        name: "Liam Chen",
        avatarUrl: undefined,
        lastPractice: "2025-12-09T18:15:00",
        weeklyMinutes: 60,
        currentStreak: 3,
        totalPoints: 280,
      },
      {
        id: 3,
        userId: 12,
        name: "Sophia Martinez",
        avatarUrl: undefined,
        lastPractice: "2025-12-10T12:00:00",
        weeklyMinutes: 75,
        currentStreak: 5,
        totalPoints: 380,
      },
      {
        id: 4,
        userId: 13,
        name: "Noah Williams",
        avatarUrl: undefined,
        lastPractice: "2025-12-08T16:45:00",
        weeklyMinutes: 45,
        currentStreak: 2,
        totalPoints: 220,
      },
      {
        id: 5,
        userId: 14,
        name: "Olivia Brown",
        avatarUrl: undefined,
        lastPractice: "2025-12-10T14:20:00",
        weeklyMinutes: 85,
        currentStreak: 6,
        totalPoints: 410,
      },
      {
        id: 6,
        userId: 15,
        name: "Ethan Davis",
        avatarUrl: undefined,
        lastPractice: "2025-12-07T17:30:00",
        weeklyMinutes: 30,
        currentStreak: 1,
        totalPoints: 150,
      },
      {
        id: 7,
        userId: 16,
        name: "Ava Garcia",
        avatarUrl: undefined,
        lastPractice: "2025-12-10T10:15:00",
        weeklyMinutes: 70,
        currentStreak: 4,
        totalPoints: 340,
      },
      {
        id: 8,
        userId: 17,
        name: "Mason Rodriguez",
        avatarUrl: undefined,
        lastPractice: undefined,
        weeklyMinutes: 0,
        currentStreak: 0,
        totalPoints: 95,
      },
    ],
    recentActivity: [
      {
        id: 1,
        studentName: "Emma Johnson",
        studentAvatar: undefined,
        type: "practice",
        description: "practiced for 30 minutes",
        timestamp: "2025-12-10T15:30:00",
        points: 60,
      },
      {
        id: 2,
        studentName: "Olivia Brown",
        studentAvatar: undefined,
        type: "practice",
        description: "practiced for 25 minutes",
        timestamp: "2025-12-10T14:20:00",
        points: 50,
      },
      {
        id: 3,
        studentName: "Sophia Martinez",
        studentAvatar: undefined,
        type: "assignment_complete",
        description: "completed 'Scales Practice'",
        timestamp: "2025-12-10T12:00:00",
        points: 100,
      },
      {
        id: 4,
        studentName: "Ava Garcia",
        studentAvatar: undefined,
        type: "practice",
        description: "practiced for 20 minutes",
        timestamp: "2025-12-10T10:15:00",
        points: 40,
      },
      {
        id: 5,
        studentName: "Liam Chen",
        studentAvatar: undefined,
        type: "practice",
        description: "practiced for 30 minutes",
        timestamp: "2025-12-09T18:15:00",
        points: 60,
      },
    ],
  };
}
