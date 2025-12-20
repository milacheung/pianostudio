import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { apiService } from '@/services/api';

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    // Check if user is already authenticated
    if (isAuthenticated) {
      navigate('/', { replace: true });
      return;
    }

    // Handle OAuth callback with token
    const token = searchParams.get('token');
    if (token) {
      login(token)
        .then(() => {
          navigate('/', { replace: true });
        })
        .catch((error) => {
          console.error('Login failed:', error);
        });
    }
  }, [isAuthenticated, searchParams, navigate, login]);

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
            Welcome to PianoStudio
          </CardTitle>
          <CardDescription className="text-base text-center">
            <span className="block">Track practice, earn points, and grow together</span>
            <span className="block text-sm mt-1 text-muted-foreground/80">
              记录练习、赚取积分、共同成长
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Role explanations */}
          <div className="bg-gradient-to-r from-piano-purple/5 to-piano-pink/5 rounded-xl p-4 space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-xl">👨‍🏫</span>
              <div>
                <p className="font-medium text-gray-800">Piano Teachers</p>
                <p className="text-muted-foreground">Create a studio and manage your students</p>
                <p className="text-muted-foreground/80 text-xs">创建工作室，管理学生</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">👨‍👩‍👧</span>
              <div>
                <p className="font-medium text-gray-800">Parents</p>
                <p className="text-muted-foreground">Track your child's piano progress</p>
                <p className="text-muted-foreground/80 text-xs">跟踪孩子的钢琴学习进度</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Button
              size="lg"
              onClick={handleGoogleLogin}
              className="w-full touch-target gradient-purple text-white hover:opacity-90 transition-opacity"
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

          <div className="space-y-2 text-center text-sm text-muted-foreground">
            <p>By continuing, you agree to our Terms of Service and Privacy Policy.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
