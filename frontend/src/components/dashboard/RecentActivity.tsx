import { Clock, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PracticeSession } from '@/types';

interface RecentActivityProps {
  sessions: PracticeSession[];
}

export function RecentActivity({ sessions }: RecentActivityProps) {
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  // Show last 3 sessions
  const recentSessions = sessions.slice(0, 3);

  return (
    <Card className="card-rounded">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-piano-purple" />
          Recent Practice
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentSessions.length === 0 ? (
          <div className="text-center py-8 space-y-2">
            <div className="bg-piano-teal/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
              <Clock className="h-8 w-8 text-piano-teal" />
            </div>
            <p className="text-sm text-muted-foreground">No practice sessions yet. Start your first one!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-piano-teal/10 p-2 rounded-lg">
                    <Clock className="h-5 w-5 text-piano-teal" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{formatTimestamp(session.startTime)}</p>
                    <p className="text-xs text-muted-foreground">{session.minutes} minutes</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-piano-gold font-semibold text-sm">
                  <Trophy className="h-4 w-4" />
                  <span>+{session.pointsEarned}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
