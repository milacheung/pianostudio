import { useNavigate } from 'react-router-dom';
import { BookOpen, Calendar, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { Assignment } from '@/types';

interface ActiveAssignmentsProps {
  assignments: Assignment[];
}

export function ActiveAssignments({ assignments }: ActiveAssignmentsProps) {
  const navigate = useNavigate();

  const formatDueDate = (dueDate: string) => {
    const date = new Date(dueDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Due today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Due tomorrow';
    } else {
      const daysUntil = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntil < 7) {
        return `Due in ${daysUntil} days`;
      }
      return `Due ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }
  };

  // Show max 3 assignments
  const displayedAssignments = assignments.slice(0, 3);

  return (
    <Card className="card-rounded">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-piano-purple" />
            Active Assignments
          </CardTitle>
          {assignments.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => navigate('/assignments')}>
              View All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {assignments.length === 0 ? (
          <div className="text-center py-8 space-y-2">
            <div className="bg-piano-purple/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
              <BookOpen className="h-8 w-8 text-piano-purple" />
            </div>
            <p className="text-sm text-muted-foreground">No assignments yet! Enjoy some free practice.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className="p-4 rounded-lg border hover:bg-accent cursor-pointer transition-colors duration-200"
                onClick={() => navigate(`/assignments/${assignment.id}`)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-heading font-semibold text-base">{assignment.title}</h4>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDueDate(assignment.dueDate)}</span>
                    </div>
                  </div>
                  <TrendingUp className="h-5 w-5 text-piano-gold" />
                </div>
                {assignment.goalMinutes > 0 && (
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium text-piano-purple">
                        {assignment.studentProgress?.progressMinutes || 0} / {assignment.goalMinutes} min
                      </span>
                    </div>
                    <Progress value={assignment.studentProgress?.progressPercentage || 0} className="h-2" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
