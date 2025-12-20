import { useNavigate } from 'react-router-dom';
import { RoleCard } from '@/components/onboarding/RoleCard';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';

export function RoleSelectionPage() {
  const navigate = useNavigate();
  const { user, needsOnboarding } = useAuth();

  useEffect(() => {
    // Redirect if user doesn't need onboarding
    if (user && !needsOnboarding) {
      navigate('/', { replace: true });
    }
  }, [user, needsOnboarding, navigate]);

  const handleRoleSelect = (role: 'teacher' | 'parent') => {
    navigate(`/onboarding/${role}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-piano-purple/5 via-white to-piano-pink/5 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-gray-900">
            Welcome to PianoStudio! 🎹
          </h1>
          <p className="text-lg text-muted-foreground">
            Tell us who you are:
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid gap-4 md:gap-6">
          <RoleCard
            icon="🎼"
            title="Teacher"
            description="I teach piano lessons and want to create a studio"
            onClick={() => handleRoleSelect('teacher')}
          />
          <RoleCard
            icon="👨‍👩‍👧"
            title="Parent"
            description="My child is learning piano (I have an invite code)"
            onClick={() => handleRoleSelect('parent')}
          />
        </div>

        {/* User info */}
        {user && (
          <p className="text-center text-sm text-muted-foreground">
            Signed in as {user.email}
          </p>
        )}
      </div>
    </div>
  );
}
