import { useState, useEffect } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import type { Assignment } from '@/types';

interface CreateAssignmentModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AssignmentFormData) => Promise<void>;
  assignment?: Assignment | null;
}

export interface AssignmentFormData {
  title: string;
  description: string;
  goalMinutes: number;
  dueDate: string;
  pointsValue: number;
  attachments?: string;
}

export function CreateAssignmentModal({
  open,
  onClose,
  onSubmit,
  assignment,
}: CreateAssignmentModalProps) {
  const [formData, setFormData] = useState<AssignmentFormData>({
    title: '',
    description: '',
    goalMinutes: 30,
    dueDate: '',
    pointsValue: 100,
    attachments: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof AssignmentFormData, string>>>({});

  useEffect(() => {
    if (assignment) {
      // Edit mode - populate form with assignment data
      setFormData({
        title: assignment.title,
        description: assignment.description,
        goalMinutes: assignment.goalMinutes,
        dueDate: assignment.dueDate.split('T')[0], // Convert to YYYY-MM-DD
        pointsValue: assignment.pointsValue,
        attachments: assignment.attachments || '',
      });
    } else {
      // Create mode - set default due date to 7 days from now
      const defaultDueDate = new Date();
      defaultDueDate.setDate(defaultDueDate.getDate() + 7);
      setFormData({
        title: '',
        description: '',
        goalMinutes: 30,
        dueDate: defaultDueDate.toISOString().split('T')[0],
        pointsValue: 100,
        attachments: '',
      });
    }
    setErrors({});
  }, [assignment, open]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof AssignmentFormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (formData.goalMinutes <= 0) {
      newErrors.goalMinutes = 'Goal minutes must be greater than 0';
    }
    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }
    if (formData.pointsValue <= 0) {
      newErrors.pointsValue = 'Points must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Failed to save assignment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof AssignmentFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading">
            {assignment ? 'Edit Assignment' : 'Create Assignment'}
          </DialogTitle>
          <DialogDescription>
            {assignment
              ? 'Update assignment details and goals for your students.'
              : 'Create a new practice assignment for your students.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="e.g., Scales Practice"
              className={errors.title ? 'border-destructive' : ''}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="What should students practice?"
              rows={3}
              className={errors.description ? 'border-destructive' : ''}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="goalMinutes">
                Goal (minutes) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="goalMinutes"
                type="number"
                min="1"
                value={formData.goalMinutes}
                onChange={(e) => handleChange('goalMinutes', parseInt(e.target.value) || 0)}
                className={errors.goalMinutes ? 'border-destructive' : ''}
              />
              {errors.goalMinutes && (
                <p className="text-xs text-destructive">{errors.goalMinutes}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pointsValue">
                Points <span className="text-destructive">*</span>
              </Label>
              <Input
                id="pointsValue"
                type="number"
                min="1"
                value={formData.pointsValue}
                onChange={(e) => handleChange('pointsValue', parseInt(e.target.value) || 0)}
                className={errors.pointsValue ? 'border-destructive' : ''}
              />
              {errors.pointsValue && (
                <p className="text-xs text-destructive">{errors.pointsValue}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">
              Due Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleChange('dueDate', e.target.value)}
              className={errors.dueDate ? 'border-destructive' : ''}
            />
            {errors.dueDate && (
              <p className="text-xs text-destructive">{errors.dueDate}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="attachments">Attachments (optional)</Label>
            <Input
              id="attachments"
              value={formData.attachments}
              onChange={(e) => handleChange('attachments', e.target.value)}
              placeholder="Sheet music link, video URL, etc."
            />
          </div>

          <div className="flex gap-3 pt-4">
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
              {loading ? 'Saving...' : assignment ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
