import { useState } from 'react';
import { Loader2, UserPlus, Mail, Send } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import type { StudentSummary, TeacherCreateStudentRequest } from '@/types';

interface AddStudentDialogProps {
  open: boolean;
  onClose: () => void;
  onStudentAdded: (student: StudentSummary) => void;
}

export function AddStudentDialog({ open, onClose, onStudentAdded }: AddStudentDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<TeacherCreateStudentRequest>({
    name: '',
    age: undefined,
    grade: '',
    parentEmail: '',
    sendInvite: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: 'Name required',
        description: "Please enter the student's name.",
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const student = await apiService.createStudentAsTeacher({
        name: formData.name.trim(),
        age: formData.age,
        grade: formData.grade?.trim() || undefined,
        parentEmail: formData.parentEmail?.trim() || undefined,
        sendInvite: formData.sendInvite,
      });

      toast({
        title: 'Student added!',
        description: formData.sendInvite && formData.parentEmail
          ? `${student.name} has been added and invite sent to ${formData.parentEmail}.`
          : `${student.name} has been added to your studio.`,
      });

      onStudentAdded(student);
      handleClose();
    } catch (error) {
      console.error('Failed to add student:', error);
      toast({
        title: 'Failed to add student',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      age: undefined,
      grade: '',
      parentEmail: '',
      sendInvite: false,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-piano-purple" />
            Add New Student
          </DialogTitle>
          <DialogDescription>
            Add a student to your studio. Optionally invite their parent.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Student Name *</Label>
            <Input
              id="name"
              placeholder="Enter student's name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="h-11"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                placeholder="e.g., 8"
                min={3}
                max={18}
                value={formData.age ?? ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    age: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="grade">Grade</Label>
              <Input
                id="grade"
                placeholder="e.g., 3rd"
                value={formData.grade ?? ''}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                className="h-11"
              />
            </div>
          </div>

          <div className="border-t pt-4 mt-4">
            <p className="text-sm font-medium mb-3 flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              Parent Invitation (Optional)
            </p>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="parentEmail">Parent Email</Label>
                <Input
                  id="parentEmail"
                  type="email"
                  placeholder="parent@example.com"
                  value={formData.parentEmail ?? ''}
                  onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                  className="h-11"
                />
              </div>

              {formData.parentEmail && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sendInvite"
                    checked={formData.sendInvite}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, sendInvite: checked === true })
                    }
                  />
                  <Label htmlFor="sendInvite" className="text-sm font-normal cursor-pointer">
                    Send invite email now
                  </Label>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Parents can view their child's progress and receive weekly updates.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="bg-piano-purple hover:bg-piano-purple-dark"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : formData.sendInvite && formData.parentEmail ? (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Add & Send Invite
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Student
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
