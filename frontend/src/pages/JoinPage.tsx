import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

/**
 * JoinPage - Handles invite link from QR code
 * URL: /join/:code
 *
 * This page:
 * 1. Extracts the invite code from the URL
 * 2. Stores it in localStorage for later use during onboarding
 * 3. Redirects to the login page
 *
 * After the user signs in with Google, they'll go through onboarding
 * and the invite code will be pre-filled from localStorage.
 */
export function JoinPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (code) {
      // Store the invite code for later use during onboarding
      localStorage.setItem('pendingInviteCode', code);
      console.log('Stored invite code:', code);
    }

    // Redirect to login page
    navigate('/login', { replace: true });
  }, [code, navigate]);

  // Show a brief loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-piano-purple/10 to-piano-pink/10">
      <div className="text-center">
        <div className="h-12 w-12 border-4 border-piano-purple border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Preparing to join studio...</p>
        <p className="mt-2 text-sm text-muted-foreground">正在准备加入工作室...</p>
      </div>
    </div>
  );
}
