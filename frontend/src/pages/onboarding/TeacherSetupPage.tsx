import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InviteCodeDisplay } from '@/components/onboarding/InviteCodeDisplay';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function TeacherSetupPage() {
  const navigate = useNavigate();
  const { completeOnboarding } = useAuth();
  const { toast } = useToast();

  const [studioName, setStudioName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate studio name
    if (studioName.trim().length < 2) {
      setError('Studio name must be at least 2 characters');
      return;
    }
    if (studioName.trim().length > 50) {
      setError('Studio name must be less than 50 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await completeOnboarding({
        role: 'TEACHER',
        studioName: studioName.trim(),
      });

      // Show success screen with invite code
      if (response.studio?.inviteCode) {
        setInviteCode(response.studio.inviteCode);
      } else {
        // If no invite code returned, redirect to home
        toast({
          title: "Studio created!",
          description: "Your studio has been set up successfully.",
        });
        navigate('/', { replace: true });
      }
    } catch (err) {
      console.error('Failed to create studio:', err);
      setError('Failed to create studio. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Success screen showing invite code
  if (inviteCode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-piano-purple/5 via-white to-piano-pink/5 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="font-heading text-3xl font-bold text-gray-900">
              Studio Created!
            </h1>
            <p className="text-muted-foreground">
              Your studio <span className="font-semibold text-piano-purple">{studioName}</span> is ready!
            </p>
          </div>

          <InviteCodeDisplay inviteCode={inviteCode} />

          <Button
            onClick={() => navigate('/', { replace: true })}
            className="w-full h-12 bg-gradient-to-r from-piano-purple to-piano-purple-dark hover:opacity-90"
            size="lg"
          >
            Continue to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Setup form
  return (
    <div className="min-h-screen bg-gradient-to-br from-piano-purple/5 via-white to-piano-pink/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Back button */}
        <button
          onClick={() => navigate('/onboarding')}
          className="flex items-center gap-2 text-muted-foreground hover:text-gray-900 transition-colors"
          aria-label="Go back to role selection"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="text-5xl mb-3">🎼</div>
          <h1 className="font-heading text-3xl font-bold text-gray-900">
            Create Your Studio
          </h1>
          <p className="text-muted-foreground">
            This is where your students will practice!
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
            <div className="space-y-2">
              <label htmlFor="studioName" className="text-sm font-medium text-gray-700">
                Studio Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="studioName"
                type="text"
                value={studioName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStudioName(e.target.value)}
                placeholder="e.g. Sarah's Piano Studio"
                maxLength={50}
                required
                className="h-12 text-base"
                aria-invalid={!!error}
                aria-describedby={error ? 'studio-error' : undefined}
              />
              <p className="text-xs text-muted-foreground">
                {studioName.length}/50 characters
              </p>
            </div>

            {error && (
              <p id="studio-error" className="text-sm text-red-500" role="alert">
                {error}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading || !studioName.trim()}
            className="w-full h-12 bg-gradient-to-r from-piano-purple to-piano-purple-dark hover:opacity-90 disabled:opacity-50"
            size="lg"
          >
            {loading ? 'Creating Studio...' : 'Create Studio'}
          </Button>
        </form>
      </div>
    </div>
  );
}
