import { useState, useEffect } from 'react';
import { Plus, Calendar, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { apiService } from '@/services/api';
import { AssignmentCard } from '@/components/assignments/AssignmentCard';
import { CreateAssignmentModal, type AssignmentFormData } from '@/components/assignments/CreateAssignmentModal';
import { AssignmentProgressDialog } from '@/components/assignments/AssignmentProgressDialog';
import type { Assignment } from '@/types';
import { useToast } from '@/hooks/use-toast';

export function AssignmentsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  const isTeacher = user?.role === 'TEACHER';

  useEffect(() => {
    loadAssignments();
  }, [isTeacher]);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const data = isTeacher
        ? await apiService.getAssignments()
        : await apiService.getMyAssignments();
      setAssignments(data);
    } catch (error) {
      console.error('Failed to load assignments:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load assignments. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (data: AssignmentFormData) => {
    try {
      if (editingAssignment) {
        await apiService.updateAssignment(editingAssignment.id, data);
        toast({
          title: 'Success',
          description: 'Assignment updated successfully!',
        });
      } else {
        await apiService.createAssignment(data);
        toast({
          title: 'Success',
          description: 'Assignment created successfully!',
        });
      }
      await loadAssignments();
      setEditingAssignment(null);
    } catch (error) {
      console.error('Failed to save assignment:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save assignment. Please try again.',
      });
      throw error;
    }
  };

  const handleDelete = async (assignment: Assignment) => {
    if (!confirm(`Are you sure you want to delete "${assignment.title}"?`)) {
      return;
    }

    try {
      await apiService.deleteAssignment(assignment.id);
      toast({
        title: 'Success',
        description: 'Assignment deleted successfully!',
      });
      await loadAssignments();
    } catch (error) {
      console.error('Failed to delete assignment:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete assignment. Please try again.',
      });
    }
  };

  const handleEdit = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setCreateModalOpen(true);
  };

  const handleLogProgress = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setProgressDialogOpen(true);
  };

  const handleProgressSubmit = async (minutes: number) => {
    if (!selectedAssignment) return;

    try {
      await apiService.updateAssignmentProgress(selectedAssignment.id, minutes);
      toast({
        title: 'Success',
        description: `Logged ${minutes} minutes of practice!`,
      });
      await loadAssignments();
    } catch (error) {
      console.error('Failed to log progress:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to log progress. Please try again.',
      });
      throw error;
    }
  };

  const handleCloseCreateModal = () => {
    setCreateModalOpen(false);
    setEditingAssignment(null);
  };

  // Sort assignments: incomplete first, then by due date
  const sortedAssignments = [...assignments].sort((a, b) => {
    const aCompleted = a.studentProgress?.completed ?? false;
    const bCompleted = b.studentProgress?.completed ?? false;

    if (aCompleted !== bCompleted) {
      return aCompleted ? 1 : -1;
    }

    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  return (
    <div className="container max-w-4xl px-4 py-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold">Assignments</h1>
            <p className="text-muted-foreground mt-1">
              {isTeacher
                ? 'Create and manage practice assignments for your students'
                : 'Complete assignments to earn bonus points'}
            </p>
          </div>
          {isTeacher && (
            <Button
              onClick={() => setCreateModalOpen(true)}
              className="bg-piano-purple hover:bg-piano-purple-dark"
            >
              <Plus size={20} className="mr-2" />
              Create
            </Button>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-piano-purple" />
          </div>
        )}

        {/* Empty State */}
        {!loading && assignments.length === 0 && (
          <Card className="card-rounded">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {isTeacher ? 'No Assignments Created' : 'No Assignments Yet'}
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                {isTeacher
                  ? 'Create your first practice assignment to help your students track their progress.'
                  : 'Your teacher hasn\'t assigned any practice tasks yet. Check back later!'}
              </p>
              {isTeacher && (
                <Button
                  onClick={() => setCreateModalOpen(true)}
                  className="mt-6 bg-piano-purple hover:bg-piano-purple-dark"
                >
                  <Plus size={20} className="mr-2" />
                  Create Assignment
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Assignments List */}
        {!loading && assignments.length > 0 && (
          <div className="space-y-4">
            {sortedAssignments.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                isTeacher={isTeacher}
                onLogProgress={handleLogProgress}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <CreateAssignmentModal
        open={createModalOpen}
        onClose={handleCloseCreateModal}
        onSubmit={handleCreateOrUpdate}
        assignment={editingAssignment}
      />

      {/* Progress Dialog */}
      <AssignmentProgressDialog
        open={progressDialogOpen}
        onClose={() => setProgressDialogOpen(false)}
        assignment={selectedAssignment}
        onSubmit={handleProgressSubmit}
      />
    </div>
  );
}
