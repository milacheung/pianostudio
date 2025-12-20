import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiService } from '@/services/api';
import type { ConsentFormData } from '@/types';

export function ConsentFormPage() {
  const { token } = useParams<{ token: string }>();
  const [formData, setFormData] = useState<ConsentFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [parentSignature, setParentSignature] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<'approved' | 'rejected' | null>(null);

  useEffect(() => {
    const fetchFormData = async () => {
      if (!token) {
        setError('Invalid consent link');
        setLoading(false);
        return;
      }

      try {
        const data = await apiService.getConsentFormData(token);

        if (!data.valid) {
          setError(data.message || 'This consent link is no longer valid');
        } else if (data.expired) {
          setError('This consent link has expired. Please ask your child to send a new request.');
        } else {
          setFormData(data);
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage || 'Failed to load consent form. Please check the link and try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchFormData();
  }, [token]);

  const handleSubmit = async (approved: boolean) => {
    if (approved && !parentSignature.trim()) {
      setError('Please enter your full name to sign the consent form');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await apiService.submitConsentResponse(token!, approved, parentSignature.trim() || undefined);
      setSubmitted(true);
      setApprovalStatus(approved ? 'approved' : 'rejected');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage || 'Failed to submit consent response. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-piano-purple/5 via-white to-piano-pink/5 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-piano-purple border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading consent form...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !formData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-piano-purple/5 via-white to-piano-pink/5 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-6 md:p-8 space-y-6">
          <div className="text-center space-y-3">
            <div className="text-6xl" role="img" aria-label="Error">
              ⚠️
            </div>
            <h1 className="font-heading text-2xl font-bold text-gray-900">
              Unable to Load Form
            </h1>
            <p className="text-base text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Success state - after submission
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-piano-purple/5 via-white to-piano-pink/5 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-6 md:p-8 space-y-6">
          <div className="text-center space-y-3">
            <div className="text-6xl" role="img" aria-label={approvalStatus === 'approved' ? 'Success' : 'Declined'}>
              {approvalStatus === 'approved' ? '✅' : '❌'}
            </div>
            <h1 className="font-heading text-3xl font-bold text-gray-900">
              {approvalStatus === 'approved' ? 'Thank You!' : 'Consent Not Granted'}
            </h1>
            <p className="text-base text-muted-foreground">
              {approvalStatus === 'approved'
                ? `You've approved ${formData?.childFirstName}'s PianoStudio account. They can now continue setting up their account!`
                : `You've declined the consent request for ${formData?.childFirstName}'s PianoStudio account.`}
            </p>
          </div>

          {approvalStatus === 'approved' && (
            <div className="bg-piano-purple/5 border border-piano-purple/20 rounded-lg p-4">
              <p className="text-sm text-muted-foreground text-center">
                {formData?.childFirstName} will receive a notification that their account has been approved.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main consent form
  return (
    <div className="min-h-screen bg-gradient-to-br from-piano-purple/5 via-white to-piano-pink/5 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 text-center space-y-3">
          <div className="text-5xl" role="img" aria-label="Music">
            🎹
          </div>
          <h1 className="font-heading text-3xl font-bold text-gray-900">
            PianoStudio Parental Consent
          </h1>
          <p className="text-base text-muted-foreground">
            Your child, <strong>{formData?.childFirstName}</strong>, would like to join PianoStudio
          </p>
        </div>

        {/* What is PianoStudio */}
        <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 space-y-4">
          <h2 className="font-heading text-xl font-bold text-gray-900">
            What is PianoStudio?
          </h2>
          <p className="text-sm text-muted-foreground">
            PianoStudio is a mobile-first web application designed for piano teaching studios. It helps students track their practice time, complete assignments, and engage with their music community in a safe, supervised environment.
          </p>
        </div>

        {/* Information We Collect */}
        <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 space-y-4">
          <h2 className="font-heading text-xl font-bold text-gray-900">
            Information We Collect
          </h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Account Information:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Name and email address (from Google Sign-In)</li>
                <li>Profile photo (optional)</li>
                <li>Date of birth (for age verification)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Practice Data:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Practice session times and durations</li>
                <li>Assignment progress and completion</li>
                <li>Achievement badges earned</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Community Content:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Posts and comments within their studio</li>
                <li>Reactions to community content</li>
              </ul>
            </div>
          </div>
        </div>

        {/* How We Use Information */}
        <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 space-y-4">
          <h2 className="font-heading text-xl font-bold text-gray-900">
            How We Use This Information
          </h2>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-2">
            <li>Track practice progress and provide feedback</li>
            <li>Enable communication between students, parents, and teachers within their studio</li>
            <li>Display achievements and progress on leaderboards (within their studio only)</li>
            <li>Send important notifications about assignments and studio activities</li>
          </ul>
        </div>

        {/* Privacy Protections */}
        <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 space-y-4">
          <h2 className="font-heading text-xl font-bold text-gray-900">
            Privacy Protections
          </h2>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-2">
            <li>Your child's information is never shared with third parties for marketing purposes</li>
            <li>All data is encrypted and stored securely</li>
            <li>Community features are restricted to their piano studio only</li>
            <li>You can request to review or delete your child's data at any time</li>
            <li>Your child's account can be deleted at any time by contacting support</li>
          </ul>
        </div>

        {/* Your Rights */}
        <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 space-y-4">
          <h2 className="font-heading text-xl font-bold text-gray-900">
            Your Rights (COPPA Compliance)
          </h2>
          <div className="text-sm text-muted-foreground space-y-3">
            <p>As a parent or guardian, you have the right to:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Review the personal information collected from your child</li>
              <li>Request that we delete your child's personal information</li>
              <li>Refuse to allow further collection or use of your child's information</li>
              <li>Revoke your consent at any time</li>
            </ul>
            <p className="mt-3">
              To exercise these rights, please contact us at{' '}
              <a href="mailto:privacy@pianostudio.com" className="text-piano-purple hover:underline">
                privacy@pianostudio.com
              </a>
            </p>
          </div>
        </div>

        {/* Consent Form */}
        <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 space-y-6">
          <h2 className="font-heading text-xl font-bold text-gray-900">
            Consent Form
          </h2>

          <div className="bg-piano-purple/5 border border-piano-purple/20 rounded-lg p-4">
            <p className="text-sm text-gray-900">
              I, the parent or legal guardian of <strong>{formData?.childFirstName}</strong>, have read and understood the information above. I consent to the collection, use, and disclosure of my child's personal information as described.
            </p>
          </div>

          {/* Signature */}
          <div className="space-y-2">
            <Label htmlFor="signature" className="text-sm font-medium">
              Your Full Name (Electronic Signature)
            </Label>
            <Input
              id="signature"
              type="text"
              placeholder="Enter your full name"
              value={parentSignature}
              onChange={(e) => setParentSignature(e.target.value)}
              className="h-12 text-base"
              autoComplete="name"
            />
            <p className="text-xs text-muted-foreground">
              By entering your name, you are providing an electronic signature
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600 text-center">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting || !parentSignature.trim()}
              className="flex-1 h-12 text-base font-semibold bg-piano-purple hover:bg-piano-purple-dark"
            >
              {isSubmitting ? 'Processing...' : 'I Approve'}
            </Button>
            <Button
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
              variant="outline"
              className="flex-1 h-12 text-base font-semibold"
            >
              I Do Not Approve
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            This consent will be recorded with today's date: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
