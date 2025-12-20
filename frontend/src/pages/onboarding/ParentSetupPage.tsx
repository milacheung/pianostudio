import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InviteCodeInput } from '@/components/onboarding/InviteCodeInput';
import { ArrowLeft, Loader2, Plus, Trash2, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import type { StudentSummary, CreateStudentRequest } from '@/types';

interface ChildForm extends CreateStudentRequest {
  tempId: string; // for React key
}

export function ParentSetupPage() {
  const navigate = useNavigate();
  const { completeOnboarding, refreshUser } = useAuth();
  const { toast } = useToast();

  // Step 1: Enter invite code, Step 2: Add children
  const [step, setStep] = useState<'code' | 'add-children'>('code');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check for pending invite code from QR code scan
  useEffect(() => {
    const pendingCode = localStorage.getItem('pendingInviteCode');
    if (pendingCode) {
      setInviteCode(pendingCode.toUpperCase());
      localStorage.removeItem('pendingInviteCode');
    }
  }, []);

  // Step 2: Child forms and saved children
  const [childForms, setChildForms] = useState<ChildForm[]>([
    { tempId: crypto.randomUUID(), name: '', age: undefined, grade: '' }
  ]);
  const [savedChildren, setSavedChildren] = useState<StudentSummary[]>([]);
  const [savingChild, setSavingChild] = useState<string | null>(null);

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (inviteCode.length !== 6) {
      setError('Invite code must be 6 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await completeOnboarding({
        role: 'PARENT',
        inviteCode: inviteCode.toUpperCase(),
      });

      if (response.needsStudentCreation) {
        setStep('add-children');
      } else {
        // Already has children, go to dashboard
        navigate('/', { replace: true });
      }
    } catch (err: any) {
      console.error('Failed to join studio:', err);

      if (err.response?.status === 404) {
        setError('Invalid invite code. Please check and try again.');
      } else {
        setError('Failed to join studio. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const addChildForm = () => {
    setChildForms([
      ...childForms,
      { tempId: crypto.randomUUID(), name: '', age: undefined, grade: '' }
    ]);
  };

  const removeChildForm = (tempId: string) => {
    if (childForms.length > 1) {
      setChildForms(childForms.filter(f => f.tempId !== tempId));
    }
  };

  const updateChildForm = (tempId: string, field: keyof CreateStudentRequest, value: string | number | undefined) => {
    setChildForms(childForms.map(f =>
      f.tempId === tempId ? { ...f, [field]: value } : f
    ));
  };

  const saveChild = async (form: ChildForm) => {
    if (!form.name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your child's name.",
        variant: "destructive",
      });
      return;
    }

    setSavingChild(form.tempId);
    setError('');

    try {
      const child = await apiService.createStudent({
        name: form.name.trim(),
        age: form.age,
        grade: form.grade?.trim() || undefined,
      });

      setSavedChildren([...savedChildren, child]);
      // Remove the saved form
      setChildForms(childForms.filter(f => f.tempId !== form.tempId));
      // If no more forms, add an empty one
      if (childForms.length === 1) {
        setChildForms([{ tempId: crypto.randomUUID(), name: '', age: undefined, grade: '' }]);
      }

      toast({
        title: "Child added!",
        description: `${child.name} has been added to your family.`,
      });
    } catch (err: any) {
      console.error('Failed to create student:', err);
      toast({
        title: "Failed to add child",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSavingChild(null);
    }
  };

  const handleFinish = async () => {
    if (savedChildren.length === 0) {
      toast({
        title: "Add at least one child",
        description: "Please add at least one child before continuing.",
        variant: "destructive",
      });
      return;
    }

    // Refresh user data and navigate to dashboard
    await refreshUser();
    toast({
      title: "Welcome to PianoStudio!",
      description: "You can now track your children's progress.",
    });
    navigate('/', { replace: true });
  };

  // Step 1: Enter invite code
  if (step === 'code') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-piano-purple/5 via-white to-piano-pink/5 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <button
            onClick={() => navigate('/onboarding')}
            className="flex items-center gap-2 text-muted-foreground hover:text-gray-900 transition-colors"
            aria-label="Go back to role selection"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>

          <div className="text-center space-y-2">
            <div className="text-5xl mb-3">👨‍👩‍👧</div>
            <h1 className="font-heading text-3xl font-bold text-gray-900">
              Join Your Child's Studio
            </h1>
            <p className="text-muted-foreground">
              Enter the invite code from your child's teacher
            </p>
          </div>

          <form onSubmit={handleCodeSubmit} className="space-y-6">
            <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
              <InviteCodeInput
                value={inviteCode}
                onChange={setInviteCode}
                error={error}
                placeholder="ABC123"
              />

              <div className="bg-piano-pink/10 rounded-xl p-4 text-sm text-gray-700">
                <p className="font-medium mb-1">Need help?</p>
                <p className="text-muted-foreground">
                  Ask your child's teacher for the studio invite code.
                </p>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || inviteCode.length !== 6}
              className="w-full h-12 bg-gradient-to-r from-piano-purple to-piano-pink hover:opacity-90 disabled:opacity-50"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Joining Studio...
                </>
              ) : (
                'Continue'
              )}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // Step 2: Add children
  return (
    <div className="min-h-screen bg-gradient-to-br from-piano-purple/5 via-white to-piano-pink/5 flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="text-5xl mb-3">👶</div>
          <h1 className="font-heading text-3xl font-bold text-gray-900">
            Add Your Children
          </h1>
          <p className="text-muted-foreground">
            Tell us about your children learning piano
          </p>
        </div>

        {/* Saved children */}
        {savedChildren.length > 0 && (
          <div className="bg-green-50 rounded-2xl p-4 space-y-2">
            <p className="text-sm font-medium text-green-800">Added children:</p>
            <div className="space-y-2">
              {savedChildren.map(child => (
                <div key={child.id} className="flex items-center gap-2 bg-white rounded-lg p-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="font-medium">{child.name}</span>
                  {child.age && <span className="text-sm text-muted-foreground">({child.age} years old)</span>}
                  {child.grade && <span className="text-sm text-muted-foreground">- {child.grade}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Child forms */}
        <div className="space-y-4">
          {childForms.map((form, index) => (
            <div key={form.tempId} className="bg-white rounded-2xl shadow-md p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">
                  {savedChildren.length > 0 ? 'Add another child' : `Child ${index + 1}`}
                </h3>
                {childForms.length > 1 && (
                  <button
                    onClick={() => removeChildForm(form.tempId)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    aria-label="Remove child form"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`name-${form.tempId}`}>Name *</Label>
                  <Input
                    id={`name-${form.tempId}`}
                    placeholder="Enter child's name"
                    value={form.name}
                    onChange={(e) => updateChildForm(form.tempId, 'name', e.target.value)}
                    className="h-12"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`age-${form.tempId}`}>Age</Label>
                    <Input
                      id={`age-${form.tempId}`}
                      type="number"
                      placeholder="e.g., 7"
                      min={3}
                      max={18}
                      value={form.age ?? ''}
                      onChange={(e) => updateChildForm(form.tempId, 'age', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`grade-${form.tempId}`}>Grade</Label>
                    <Input
                      id={`grade-${form.tempId}`}
                      placeholder="e.g., 2nd"
                      value={form.grade ?? ''}
                      onChange={(e) => updateChildForm(form.tempId, 'grade', e.target.value)}
                      className="h-12"
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={() => saveChild(form)}
                disabled={!form.name.trim() || savingChild === form.tempId}
                className="w-full bg-piano-purple hover:bg-piano-purple-dark"
              >
                {savingChild === form.tempId ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Child
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>

        {/* Add another child button */}
        {savedChildren.length > 0 && childForms.length === 0 && (
          <Button
            variant="outline"
            onClick={addChildForm}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Another Child
          </Button>
        )}

        {/* Finish button */}
        <Button
          onClick={handleFinish}
          disabled={savedChildren.length === 0}
          className="w-full h-12 bg-gradient-to-r from-piano-purple to-piano-pink hover:opacity-90 disabled:opacity-50"
          size="lg"
        >
          {savedChildren.length === 0 ? (
            'Add at least one child to continue'
          ) : (
            `Continue with ${savedChildren.length} ${savedChildren.length === 1 ? 'child' : 'children'}`
          )}
        </Button>
      </div>
    </div>
  );
}
