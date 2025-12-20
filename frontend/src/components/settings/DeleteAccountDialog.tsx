import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiService } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

interface DeleteAccountDialogProps {
  open: boolean;
  onClose: () => void;
  hasStudents?: boolean;
}

export function DeleteAccountDialog({
  open,
  onClose,
  hasStudents = false,
}: DeleteAccountDialogProps) {
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    if (open) {
      setConfirmText('');
      setError('');
    }
  }, [open]);

  const isConfirmValid = confirmText === 'DELETE';

  const handleDelete = async () => {
    if (!isConfirmValid) return;

    setLoading(true);
    setError('');

    try {
      await apiService.deleteAccount();

      // Clear auth state and redirect to login
      await logout();
      navigate('/login', { replace: true });
    } catch (err: any) {
      console.error('Failed to delete account:', err);
      setError(
        err.response?.data?.message ||
        'Failed to delete account. Please try again or contact support.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <AlertDialogTitle className="text-2xl font-heading">
              Delete Account
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-left space-y-3">
            {hasStudents ? (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="font-medium text-destructive">
                  Cannot delete account while you have students
                </p>
                <p className="text-sm mt-2 text-muted-foreground">
                  You must remove all students from your studio before deleting your account.
                  Please ensure all students are safely transferred or their data is backed up.
                </p>
              </div>
            ) : (
              <>
                <p className="font-medium text-foreground">
                  This action is permanent and cannot be undone.
                </p>
                <p>Deleting your account will:</p>
                <ul className="list-disc list-inside space-y-1 text-sm ml-2">
                  <li>Permanently delete your profile and settings</li>
                  <li>Remove all your practice history and stats</li>
                  <li>Delete all your posts and reactions</li>
                  <li>Remove you from your studio</li>
                  <li>Erase all your data from our servers</li>
                </ul>
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {!hasStudents && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="confirm-delete" className="text-sm font-medium">
                Type <span className="font-mono font-bold">DELETE</span> to confirm
                <span className="text-destructive ml-1">*</span>
              </Label>
              <Input
                id="confirm-delete"
                type="text"
                value={confirmText}
                onChange={(e) => {
                  setConfirmText(e.target.value);
                  setError('');
                }}
                placeholder="Type DELETE here"
                className={error ? 'border-destructive' : ''}
                disabled={loading}
                autoComplete="off"
              />
              {error && (
                <p className="text-xs text-destructive mt-1">{error}</p>
              )}
            </div>
          </div>
        )}

        <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          <AlertDialogCancel
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {hasStudents ? 'Close' : 'Cancel'}
          </AlertDialogCancel>
          {!hasStudents && (
            <AlertDialogAction
              onClick={handleDelete}
              disabled={!isConfirmValid || loading}
              className="w-full sm:w-auto bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {loading ? 'Deleting...' : 'Delete Account'}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
