import { Users, Clock, BookOpen, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StudioStatsCardsProps {
  totalStudents: number;
  weeklyPracticeMinutes: number;
  activeAssignments: number;
  averageStreak: number;
}

export function StudioStatsCards({
  totalStudents,
  weeklyPracticeMinutes,
  activeAssignments,
  averageStreak,
}: StudioStatsCardsProps) {
  const stats = [
    {
      label: 'Total Students',
      value: totalStudents,
      icon: Users,
      color: 'text-piano-purple',
      bgColor: 'bg-piano-purple/10',
    },
    {
      label: 'Practice This Week',
      value: `${Math.floor(weeklyPracticeMinutes / 60)}h ${weeklyPracticeMinutes % 60}m`,
      icon: Clock,
      color: 'text-piano-teal',
      bgColor: 'bg-piano-teal/10',
    },
    {
      label: 'Active Assignments',
      value: activeAssignments,
      icon: BookOpen,
      color: 'text-piano-pink',
      bgColor: 'bg-piano-pink/10',
    },
    {
      label: 'Average Streak',
      value: `${averageStreak} days`,
      icon: TrendingUp,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.label}
            className="card-rounded overflow-hidden transition-all hover:shadow-md"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
