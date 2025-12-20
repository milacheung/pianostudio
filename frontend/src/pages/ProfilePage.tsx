import { useState, useEffect } from 'react';
import { LogOut, Settings, Trophy, Flame, Clock, Trash2, AlertTriangle, Target, Check, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StreakBadge } from '@/components/common/StreakBadge';
import { BadgeGrid } from '@/components/badges';
import { useAuth } from '@/context/AuthContext';
import { DeleteAccountDialog } from '@/components/settings';
import { apiService } from '@/services/api';
import type { Badge, StudentBadge } from '@/types';

const DAILY_GOAL_KEY = 'pianostudio_daily_goal';
const DEFAULT_GOAL = 30;
const GOAL_OPTIONS = [15, 30, 45, 60, 90];

export function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dailyGoal, setDailyGoal] = useState(DEFAULT_GOAL);
  const [goalSaved, setGoalSaved] = useState(false);
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [earnedBadges, setEarnedBadges] = useState<StudentBadge[]>([]);
  const [badgesLoading, setBadgesLoading] = useState(true);

  // Load saved goal from localStorage
  useEffect(() => {
    const savedGoal = localStorage.getItem(DAILY_GOAL_KEY);
    if (savedGoal) {
      setDailyGoal(parseInt(savedGoal, 10));
    }
  }, []);

  // Fetch badges
  useEffect(() => {
    const fetchBadges = async () => {
      try {
        setBadgesLoading(true);
        const [all, earned] = await Promise.all([
          apiService.getAllBadges(),
          apiService.getMyBadges(),
        ]);
        setAllBadges(all);
        setEarnedBadges(earned);
      } catch (error) {
        console.error('Failed to fetch badges:', error);
      } finally {
        setBadgesLoading(false);
      }
    };

    fetchBadges();
  }, []);

  const handleGoalChange = (minutes: number) => {
    setDailyGoal(minutes);
    localStorage.setItem(DAILY_GOAL_KEY, minutes.toString());
    setGoalSaved(true);
    setTimeout(() => setGoalSaved(false), 2000);
  };

  // TODO: Fetch from API
  const studentProfile = {
    totalPoints: 0,
    currentStreak: 0,
    longestStreak: 0,
  };

  const stats = {
    totalPracticeMinutes: 0,
    totalSessions: 0,
    averageSessionMinutes: 0,
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="container max-w-4xl px-4 py-6">
      <div className="space-y-6">
        {/* Profile Header */}
        <Card className="card-rounded-lg gradient-purple border-0 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border-4 border-white/20">
                <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                <AvatarFallback className="bg-white text-piano-purple text-2xl">
                  {user && getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-2xl font-heading font-bold">{user?.name}</h1>
                <p className="text-purple-100">{user?.email}</p>
                <div className="mt-2">
                  <StreakBadge streak={studentProfile.currentStreak} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="card-rounded">
            <CardContent className="pt-6 text-center">
              <Trophy className="h-8 w-8 text-piano-gold mx-auto mb-2" />
              <div className="text-2xl font-bold">{studentProfile.totalPoints}</div>
              <p className="text-xs text-muted-foreground mt-1">Total Points</p>
            </CardContent>
          </Card>

          <Card className="card-rounded">
            <CardContent className="pt-6 text-center">
              <Flame className="h-8 w-8 text-piano-streak mx-auto mb-2" />
              <div className="text-2xl font-bold">{studentProfile.longestStreak}</div>
              <p className="text-xs text-muted-foreground mt-1">Longest Streak</p>
            </CardContent>
          </Card>

          <Card className="card-rounded">
            <CardContent className="pt-6 text-center">
              <Clock className="h-8 w-8 text-piano-teal mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.totalPracticeMinutes}</div>
              <p className="text-xs text-muted-foreground mt-1">Total Minutes</p>
            </CardContent>
          </Card>

          <Card className="card-rounded">
            <CardContent className="pt-6 text-center">
              <Settings className="h-8 w-8 text-piano-purple mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.totalSessions}</div>
              <p className="text-xs text-muted-foreground mt-1">Total Sessions</p>
            </CardContent>
          </Card>
        </div>

        {/* Badges Section */}
        <Card className="card-rounded">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-piano-gold" />
              Badges
              <span className="text-sm font-normal text-muted-foreground ml-auto">
                {earnedBadges.length} / {allBadges.length} earned
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {badgesLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-piano-purple border-t-transparent rounded-full" />
              </div>
            ) : allBadges.length > 0 ? (
              <BadgeGrid allBadges={allBadges} earnedBadges={earnedBadges} size="md" />
            ) : (
              <p className="text-center text-muted-foreground py-4">
                No badges available yet. Keep practicing!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Practice Goal Settings */}
        <Card className="card-rounded">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-piano-teal" />
              Daily Practice Goal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Set your daily practice target. This helps track your progress and maintain your streak.
            </p>
            <div className="flex flex-wrap gap-2">
              {GOAL_OPTIONS.map((minutes) => (
                <Button
                  key={minutes}
                  variant={dailyGoal === minutes ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleGoalChange(minutes)}
                  className={dailyGoal === minutes ? 'bg-piano-teal hover:bg-piano-teal/90' : ''}
                >
                  {minutes} min
                </Button>
              ))}
            </div>
            {goalSaved && (
              <div className="flex items-center gap-1 mt-3 text-sm text-green-600">
                <Check className="h-4 w-4" />
                Goal saved!
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card className="card-rounded">
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <h4 className="font-medium">Role</h4>
                <p className="text-sm text-muted-foreground">{user?.role}</p>
              </div>
            </div>

            <Button variant="outline" className="w-full justify-start" disabled>
              <Settings className="mr-2 h-4 w-4" />
              Edit Profile (Coming Soon)
            </Button>

            <Button variant="destructive" className="w-full justify-start" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log Out
            </Button>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="card-rounded border-destructive/30">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className="font-medium text-sm">Delete Account</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Permanently delete your account and all associated data. This cannot be undone.
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteDialogOpen(true)}
                className="shrink-0"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <DeleteAccountDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        hasStudents={user?.role === 'TEACHER'} // TODO: Check actual student count
      />
    </div>
  );
}
