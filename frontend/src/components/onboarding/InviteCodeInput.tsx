import { Input } from '@/components/ui/input';
import type { ChangeEvent } from 'react';

interface InviteCodeInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
}

export function InviteCodeInput({
  value,
  onChange,
  error,
  placeholder = "Enter code"
}: InviteCodeInputProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const upperValue = e.target.value.toUpperCase().slice(0, 6);
    onChange(upperValue);
  };

  return (
    <div className="space-y-2">
      <Input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        maxLength={6}
        className={`
          text-center text-2xl font-bold tracking-[0.5em] uppercase
          h-16 rounded-xl
          ${error ? 'border-red-500 focus-visible:ring-red-500' : ''}
        `}
        aria-label="Invite code"
        aria-invalid={!!error}
        aria-describedby={error ? 'code-error' : undefined}
      />
      {error && (
        <p id="code-error" className="text-sm text-red-500 text-center" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
