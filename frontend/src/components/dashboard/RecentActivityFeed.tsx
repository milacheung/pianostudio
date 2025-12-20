import { Clock, Award, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import type { RecentActivityItem } from '@/types';

interface RecentActivityFeedProps {
  activities: RecentActivityItem[];
}

export function RecentActivityFeed({ activities }: RecentActivityFeedProps) {
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'practice':
        return <Clock className="h-4 w-4 text-piano-teal" />;
      case 'assignment_complete':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Award className="h-4 w-4 text-piano-purple" />;
    }
  };

  if (activities.length === 0) {
    return (
      <Card className="card-rounded">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-piano-purple/10 mb-3">
              <Clock className="h-6 w-6 text-piano-purple/50" />
            </div>
            <p className="text-sm text-muted-foreground">No recent activity yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-rounded">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-piano-purple" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors"
            >
              <Avatar className="h-10 w-10 mt-0.5">
                <img
                  src={
                    activity.studentAvatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(activity.studentName)}&background=7B68EE&color=fff`
                  }
                  alt={activity.studentName}
                />
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-semibold">{activity.studentName}</span>{' '}
                      <span className="text-muted-foreground">{activity.description}</span>
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(activity.timestamp)}
                      </span>
                      {activity.points && (
                        <div className="flex items-center gap-1">
                          <Award className="h-3 w-3 text-piano-gold" />
                          <span className="text-xs font-semibold text-piano-gold">
                            +{activity.points} pts
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0">{getActivityIcon(activity.type)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
