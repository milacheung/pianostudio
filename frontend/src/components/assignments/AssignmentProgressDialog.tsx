import { useState, useEffect } from 'react';
import { Clock, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import type { Assignment } from '@/types';

interface AssignmentProgressDialogProps {
  open: boolean;
  onClose: () => void;
  assignment: Assignment | null;
  onSubmit: (minutes: number) => Promise<void>;
}

export function AssignmentProgressDialog({
  open,
  onClose,
  assignment,
  onSubmit,
}: AssignmentProgressDialogProps) {
  const [minutes, setMinutes] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (open) {
      setMinutes('');
      setError('');
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const minutesNum = parseInt(minutes);
    if (!minutesNum || minutesNum <= 0) {
      setError('Please enter a valid number of minutes');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(minutesNum);
      onClose();
    } catch (error) {
      console.error('Failed to log progress:', error);
      setError('Failed to log progress. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!assignment) return null;

  const currentProgress = assignment.studentProgress?.progressMinutes || 0;
  const newProgress = currentProgress + (parseInt(minutes) || 0);
  const goalMinutes = assignment.goalMinutes;
  const currentPercentage = Math.min((currentProgress / goalMinutes) * 100, 100);
  const newPercentage = Math.min((newProgress / goalMinutes) * 100, 100);
  const willComplete = newProgress >= goalMinutes;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading">Log Practice Time</DialogTitle>
          <DialogDescription>
            Add practice minutes to: {assignment.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Current Progress */}
          <div className="p-4 rounded-lg bg-muted space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Current Progress</span>
              <span className="font-medium">
                {currentProgress} / {goalMinutes} min
              </span>
            </div>
            <Progress value={currentPercentage} className="h-2" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="minutes">
                Minutes Practiced <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="minutes"
                  type="number"
                  min="1"
                  value={minutes}
                  onChange={(e) => {
                    setMinutes(e.target.value);
                    setError('');
                  }}
                  placeholder="e.g., 30"
                  className={error ? 'border-destructive' : ''}
                  autoFocus
                />
                <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>

            {/* Preview New Progress */}
            {minutes && parseInt(minutes) > 0 && (
              <div className="p-4 rounded-lg bg-piano-purple/10 border border-piano-purple/20 space-y-2">
                <div className="flex justify-between text-sm items-center">
                  <span className="font-medium text-piano-purple">New Progress</span>
                  <span className="font-bold text-piano-purple">
                    {newProgress} / {goalMinutes} min
                  </span>
                </div>
                <Progress value={newPercentage} className="h-2" />
                {willComplete && (
                  <div className="flex items-center gap-2 text-sm text-piano-teal font-medium pt-2">
                    <CheckCircle2 size={16} />
                    <span>Assignment will be completed!</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-piano-purple hover:bg-piano-purple-dark"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Log Progress'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
