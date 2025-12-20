import { Calendar, Clock, Trophy, CheckCircle2, AlertCircle, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { Assignment } from '@/types';

interface AssignmentCardProps {
  assignment: Assignment;
  isTeacher?: boolean;
  onLogProgress?: (assignment: Assignment) => void;
  onEdit?: (assignment: Assignment) => void;
  onDelete?: (assignment: Assignment) => void;
}

export function AssignmentCard({
  assignment,
  isTeacher = false,
  onLogProgress,
  onEdit,
  onDelete,
}: AssignmentCardProps) {
  const formatDueDate = (dueDate: string) => {
    const date = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(date);
    due.setHours(0, 0, 0, 0);

    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: 'Overdue', variant: 'destructive' as const };
    } else if (diffDays === 0) {
      return { text: 'Due today', variant: 'default' as const };
    } else if (diffDays === 1) {
      return { text: 'Due tomorrow', variant: 'secondary' as const };
    } else if (diffDays <= 7) {
      return { text: `Due in ${diffDays} days`, variant: 'secondary' as const };
    } else {
      return {
        text: `Due ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        variant: 'outline' as const,
      };
    }
  };

  const dueInfo = formatDueDate(assignment.dueDate);
  const progress = assignment.studentProgress;
  const progressPercentage = progress?.progressPercentage ?? 0;
  const isCompleted = progress?.completed ?? false;
  const isOverdue = dueInfo.variant === 'destructive';

  return (
    <Card className="card-rounded hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-xl font-heading truncate">
                {assignment.title}
              </CardTitle>
              {isCompleted && (
                <Badge className="bg-piano-teal text-white shrink-0">
                  <CheckCircle2 size={14} className="mr-1" />
                  Complete
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge className="bg-piano-gold text-white">
              <Trophy size={14} className="mr-1" />
              {assignment.pointsValue} pts
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">{assignment.description}</p>

        <div className="flex items-center gap-4 text-sm flex-wrap">
          <div className="flex items-center gap-1.5">
            <Clock size={16} className="text-piano-teal shrink-0" />
            <span className="font-medium">{assignment.goalMinutes} min goal</span>
          </div>
          <Badge variant={dueInfo.variant} className="flex items-center gap-1">
            {isOverdue && <AlertCircle size={14} />}
            <Calendar size={14} />
            <span>{dueInfo.text}</span>
          </Badge>
        </div>

        {!isTeacher && progress && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium text-piano-purple">
                {progress.progressMinutes} / {assignment.goalMinutes} min
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            {progress.completedAt && (
              <p className="text-xs text-muted-foreground">
                Completed {new Date(progress.completedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {!isTeacher && !isCompleted && onLogProgress && (
            <Button
              onClick={() => onLogProgress(assignment)}
              className="flex-1 bg-piano-purple hover:bg-piano-purple-dark"
            >
              <Clock size={16} className="mr-2" />
              Log Progress
            </Button>
          )}
          {isTeacher && (
            <>
              <Button
                onClick={() => onEdit?.(assignment)}
                variant="outline"
                className="flex-1"
              >
                <Edit size={16} className="mr-2" />
                Edit
              </Button>
              <Button
                onClick={() => onDelete?.(assignment)}
                variant="outline"
                className="text-destructive hover:text-destructive"
              >
                <Trash2 size={16} />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
