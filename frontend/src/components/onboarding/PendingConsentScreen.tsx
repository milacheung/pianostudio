import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface PendingConsentScreenProps {
  parentEmail: string;
  onConsentApproved: () => void;
}

export function PendingConsentScreen({ parentEmail, onConsentApproved }: PendingConsentScreenProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const { toast } = useToast();

  // Poll for consent status every 30 seconds
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = await apiService.getConsentStatus();
        if (status.hasActiveConsent) {
          toast({
            title: 'Consent Approved!',
            description: 'Your parent has approved your account. Continuing setup...',
          });
          onConsentApproved();
        }
      } catch (err) {
        // Silent fail for polling - don't show error toast
        console.error('Error checking consent status:', err);
      }
    };

    // Check immediately on mount
    checkStatus();

    // Then poll every 30 seconds
    const interval = setInterval(checkStatus, 30000);

    return () => clearInterval(interval);
  }, [onConsentApproved, toast]);

  const handleCheckStatus = async () => {
    setIsChecking(true);

    try {
      const status = await apiService.getConsentStatus();

      if (status.hasActiveConsent) {
        toast({
          title: 'Consent Approved!',
          description: 'Your parent has approved your account. Continuing setup...',
        });
        onConsentApproved();
      } else if (status.consentRequestStatus === 'REJECTED') {
        toast({
          title: 'Consent Not Approved',
          description: 'Your parent did not approve the request. Please contact them or try again with a different email.',
          variant: 'destructive',
        });
      } else if (status.consentRequestStatus === 'EXPIRED') {
        toast({
          title: 'Request Expired',
          description: 'The consent request has expired. Please send a new request.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Still Waiting',
          description: 'Your parent hasn\'t responded yet. We\'ll keep checking!',
        });
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      toast({
        title: 'Error',
        description: errorMessage || 'Failed to check consent status',
        variant: 'destructive',
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleResendEmail = async () => {
    setIsResending(true);

    try {
      await apiService.requestParentalConsent(parentEmail);
      toast({
        title: 'Email Resent',
        description: `We've sent another consent request to ${parentEmail}`,
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      toast({
        title: 'Error',
        description: errorMessage || 'Failed to resend consent request',
        variant: 'destructive',
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-piano-purple/5 via-white to-piano-pink/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-6 md:p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="text-6xl" role="img" aria-label="Mail sent">
            📧
          </div>
          <h1 className="font-heading text-3xl font-bold text-gray-900">
            Almost there!
          </h1>
          <p className="text-base text-muted-foreground">
            We sent an email to
          </p>
          <p className="text-lg font-semibold text-piano-purple">
            {parentEmail}
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-piano-purple/5 border border-piano-purple/20 rounded-lg p-5 space-y-3">
          <h3 className="font-semibold text-base text-gray-900">What's next?</h3>
          <ol className="text-sm text-muted-foreground space-y-2">
            <li className="flex items-start gap-2">
              <span className="font-semibold text-piano-purple">1.</span>
              <span>Your parent or guardian will receive an email with a consent form</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-piano-purple">2.</span>
              <span>They'll review what information PianoStudio collects</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-semibold text-piano-purple">3.</span>
              <span>Once they approve, you'll be able to continue!</span>
            </li>
          </ol>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleCheckStatus}
            disabled={isChecking}
            className="w-full h-12 text-base font-semibold bg-piano-purple hover:bg-piano-purple-dark"
          >
            {isChecking ? 'Checking...' : 'Check if Approved'}
          </Button>

          <Button
            onClick={handleResendEmail}
            disabled={isResending}
            variant="outline"
            className="w-full h-12 text-base font-semibold"
          >
            {isResending ? 'Sending...' : 'Resend Email'}
          </Button>
        </div>

        {/* Help Text */}
        <div className="border-t border-gray-200 pt-4 space-y-2">
          <p className="text-sm text-muted-foreground text-center">
            <strong>Didn't receive the email?</strong>
          </p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Check the spam/junk folder</li>
            <li>• Make sure the email address is correct</li>
            <li>• Try resending the email</li>
          </ul>
        </div>

        {/* Auto-check indicator */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            We're automatically checking every 30 seconds
          </p>
        </div>
      </div>
    </div>
  );
}
