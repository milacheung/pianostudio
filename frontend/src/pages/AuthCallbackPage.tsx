import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setError('No authentication token received');
        return;
      }

      try {
        await login(token);
        navigate('/', { replace: true });
      } catch (err) {
        console.error('Login failed:', err);
        setError('Authentication failed. Please try again.');
      }
    };

    handleCallback();
  }, [searchParams, login, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <h1 className="text-2xl font-heading font-bold text-destructive mb-2">
            Oops!
          </h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-piano-purple text-white rounded-lg hover:bg-piano-purple-dark transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="h-12 w-12 border-4 border-piano-purple border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-muted-foreground font-heading">
          Signing you in...
        </p>
      </div>
    </div>
  );
}
