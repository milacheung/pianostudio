import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiService } from '@/services/api';
import type { ConsentRequestResponse } from '@/types';

interface ParentEmailStepProps {
  onConsentRequested: (result: ConsentRequestResponse) => void;
}

export function ParentEmailStep({ onConsentRequested }: ParentEmailStepProps) {
  const [parentEmail, setParentEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
    setError('');

    // Validate email
    if (!parentEmail.trim()) {
      setError('Please enter your parent or guardian\'s email');
      return;
    }

    if (!validateEmail(parentEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await apiService.requestParentalConsent(parentEmail.trim());
      onConsentRequested(result);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage || 'Failed to send consent request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="text-5xl" role="img" aria-label="Parent and child">
          👨‍👩‍👧
        </div>
        <h2 className="font-heading text-2xl font-bold text-gray-900">
          We need a parent's permission
        </h2>
        <p className="text-sm text-muted-foreground">
          Since you're under 16, we'll send an email to your parent or guardian to approve your account
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-piano-purple/5 border border-piano-purple/20 rounded-lg p-4 space-y-2">
        <h3 className="font-semibold text-sm text-gray-900">What happens next?</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• We'll send an email to your parent/guardian</li>
          <li>• They'll review and approve your account</li>
          <li>• Once approved, you can start using PianoStudio</li>
        </ul>
      </div>

      {/* Email Input */}
      <div className="space-y-2">
        <Label htmlFor="parentEmail" className="text-sm font-medium">
          Parent/Guardian Email Address
        </Label>
        <Input
          id="parentEmail"
          type="email"
          placeholder="parent@example.com"
          value={parentEmail}
          onChange={(e) => setParentEmail(e.target.value)}
          onKeyPress={handleKeyPress}
          className="h-12 text-base"
          autoComplete="email"
          autoFocus
        />
        <p className="text-xs text-muted-foreground">
          Make sure this email is correct - we'll send the approval link here
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-600 text-center">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={isSubmitting || !parentEmail.trim()}
        className="w-full h-12 text-base font-semibold bg-piano-purple hover:bg-piano-purple-dark"
      >
        {isSubmitting ? 'Sending...' : 'Send Consent Request'}
      </Button>

      {/* Privacy Note */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <p className="text-xs text-muted-foreground text-center">
          We take your privacy seriously. Your parent's email will only be used for consent verification and important account communications.
        </p>
      </div>
    </div>
  );
}
