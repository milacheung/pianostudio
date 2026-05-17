import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Music, Loader2, CheckCircle, XCircle, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { apiService } from '@/services/api';
import type { MagicLinkCheckResponse } from '@/types';

export function MagicLinkLoginPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [status, setStatus] = useState<'checking' | 'valid' | 'invalid' | 'logging_in' | 'success' | 'error'>('checking');
  const [linkInfo, setLinkInfo] = useState<MagicLinkCheckResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (!token) {
      setStatus('invalid');
      setErrorMessage('No magic link token provided');
      return;
    }

    checkMagicLink();
  }, [token]);

  const checkMagicLink = async () => {
    try {
      const response = await apiService.checkMagicLink(token!);
      setLinkInfo(response);

      if (response.valid) {
        setStatus('valid');
      } else {
        setStatus('invalid');
        if (response.expired) {
          setErrorMessage('This link has expired. Please ask your teacher to send a new invite.');
        } else if (response.used) {
          setErrorMessage('This link has already been used. If you need to sign in again, please use Google login.');
        } else {
          setErrorMessage(response.message || 'This link is no longer valid.');
        }
      }
    } catch (error) {
      console.error('Failed to check magic link:', error);
      setStatus('invalid');
      setErrorMessage('Failed to verify the magic link. Please try again.');
    }
  };

  const handleLogin = async () => {
    if (!token) return;

    setStatus('logging_in');
    try {
      const response = await apiService.validateMagicLink(token);

      if (response.success) {
        setStatus('success');
        // Store the token and redirect
        await login(response.token);
        navigate('/', { replace: true });
      } else {
        setStatus('error');
        setErrorMessage('Failed to sign in. Please try again.');
      }
    } catch (error) {
      console.error('Failed to login with magic link:', error);
      setStatus('error');
      setErrorMessage('Failed to sign in. The link may have expired.');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = apiService.getGoogleAuthUrl();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-purple">
      <Card className="w-full max-w-md card-rounded-lg shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full gradient-purple shadow-lg">
              <Music className="h-12 w-12 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-heading bg-gradient-to-r from-piano-purple to-piano-pink bg-clip-text text-transparent">
            PianoStudio
          </CardTitle>
          <CardDescription className="text-base">
            Parent Portal Access
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {status === 'checking' && (
            <div className="text-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-piano-purple mx-auto" />
              <p className="mt-4 text-muted-foreground">Verifying your magic link...</p>
            </div>
          )}

          {status === 'valid' && linkInfo && (
            <div className="space-y-6">
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-800">Link Verified!</p>
                    <p className="text-sm text-green-700 mt-1">
                      You're about to access <span className="font-semibold">{linkInfo.studentName}'s</span> practice progress.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                size="lg"
                onClick={handleLogin}
                className="w-full touch-target gradient-purple text-white hover:opacity-90 transition-opacity"
              >
                <Link2 className="mr-2 h-5 w-5" />
                Sign In as Parent
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Signing in as: <span className="font-medium">{linkInfo.email}</span>
              </p>
            </div>
          )}

          {status === 'logging_in' && (
            <div className="text-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-piano-purple mx-auto" />
              <p className="mt-4 text-muted-foreground">Signing you in...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
              <p className="mt-4 font-medium text-green-800">Success!</p>
              <p className="text-sm text-muted-foreground mt-1">Redirecting to your dashboard...</p>
            </div>
          )}

          {(status === 'invalid' || status === 'error') && (
            <div className="space-y-6">
              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                <div className="flex items-start gap-3">
                  <XCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800">Link Not Valid</p>
                    <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
                  </div>
                </div>
              </div>

              <div className="text-center space-y-3">
                <p className="text-sm text-muted-foreground">
                  Already have an account? Sign in with Google:
                </p>
                <Button
                  size="lg"
                  onClick={handleGoogleLogin}
                  variant="outline"
                  className="w-full touch-target"
                >
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
