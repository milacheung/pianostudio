import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { apiService } from '@/services/api';
import type { AgeVerificationResponse } from '@/types';

interface AgeVerificationStepProps {
  onVerified: (result: AgeVerificationResponse) => void;
}

export function AgeVerificationStep({ onVerified }: AgeVerificationStepProps) {
  const [month, setMonth] = useState<string>('');
  const [day, setDay] = useState<string>('');
  const [year, setYear] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 100; // Max age 100
  const maxYear = currentYear - 4; // Minimum age 4

  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  const days = Array.from({ length: 31 }, (_, i) => {
    const day = (i + 1).toString().padStart(2, '0');
    return { value: day, label: day };
  });

  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => {
    const year = (maxYear - i).toString();
    return { value: year, label: year };
  });

  const validateDate = (): boolean => {
    if (!month || !day || !year) {
      setError('Please select your complete birth date');
      return false;
    }

    const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const today = new Date();

    // Check if date is valid
    if (isNaN(birthDate.getTime())) {
      setError('Please enter a valid date');
      return false;
    }

    // Check if date is in the future
    if (birthDate > today) {
      setError('Birth date cannot be in the future');
      return false;
    }

    // Calculate age
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();
    const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;

    // Check minimum age (4 years old)
    if (actualAge < 4) {
      setError('You must be at least 4 years old to use PianoStudio');
      return false;
    }

    setError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!validateDate()) {
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Format date as YYYY-MM-DD
      const birthDate = `${year}-${month}-${day}`;
      const result = await apiService.verifyAge(birthDate);
      onVerified(result);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage || 'Failed to verify age. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="text-5xl" role="img" aria-label="Birthday cake">
          🎂
        </div>
        <h2 className="font-heading text-2xl font-bold text-gray-900">
          What's your birth date?
        </h2>
        <p className="text-sm text-muted-foreground">
          We need to verify your age to ensure a safe experience for everyone
        </p>
      </div>

      {/* Date Selectors */}
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {/* Month */}
          <div className="space-y-2">
            <Label htmlFor="month" className="text-sm font-medium">
              Month
            </Label>
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger id="month" className="h-12 text-base">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Day */}
          <div className="space-y-2">
            <Label htmlFor="day" className="text-sm font-medium">
              Day
            </Label>
            <Select value={day} onValueChange={setDay}>
              <SelectTrigger id="day" className="h-12 text-base">
                <SelectValue placeholder="Day" />
              </SelectTrigger>
              <SelectContent>
                {days.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Year */}
          <div className="space-y-2">
            <Label htmlFor="year" className="text-sm font-medium">
              Year
            </Label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger id="year" className="h-12 text-base">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y.value} value={y.value}>
                    {y.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600 text-center">{error}</p>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={isSubmitting || !month || !day || !year}
        className="w-full h-12 text-base font-semibold bg-piano-purple hover:bg-piano-purple-dark"
      >
        {isSubmitting ? 'Verifying...' : 'Continue'}
      </Button>

      {/* Privacy Note */}
      <p className="text-xs text-muted-foreground text-center">
        Your birth date is used only for age verification and is stored securely
      </p>
    </div>
  );
}
