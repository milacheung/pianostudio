import { useAuth } from '@/context/AuthContext';
import { StudentDashboard } from '@/components/dashboard/StudentDashboard';
import { TeacherDashboard } from '@/components/dashboard/TeacherDashboard';
import { ParentDashboard } from '@/components/dashboard/ParentDashboard';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';

export function HomePage() {
  const { user } = useAuth();

  // Route to appropriate dashboard based on user role
  if (user?.role === 'ADMIN') {
    return <AdminDashboard />;
  } else if (user?.role === 'STUDENT') {
    return <StudentDashboard />;
  } else if (user?.role === 'TEACHER') {
    return <TeacherDashboard />;
  } else if (user?.role === 'PARENT') {
    return <ParentDashboard />;
  }

  // Fallback for users without a role (shouldn't happen after onboarding)
  return (
    <div className="container max-w-6xl px-4 py-6">
      <div className="text-center py-12 space-y-4">
        <h1 className="text-3xl font-heading font-bold text-piano-purple">
          Welcome to PianoStudio!
        </h1>
        <p className="text-muted-foreground">
          Please complete your profile setup to continue.
        </p>
      </div>
    </div>
  );
}
