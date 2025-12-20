import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface InviteCodeDisplayProps {
  inviteCode: string;
}

export function InviteCodeDisplay({ inviteCode }: InviteCodeDisplayProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Invite code copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the code manually",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-gradient-to-br from-piano-purple/10 to-piano-pink/10 rounded-2xl p-8 space-y-4">
      <div className="text-center">
        <p className="text-sm font-medium text-muted-foreground mb-2">Your Studio Invite Code</p>
        <div className="text-5xl font-bold tracking-[0.3em] text-piano-purple font-mono">
          {inviteCode}
        </div>
      </div>
      <Button
        onClick={handleCopy}
        variant="outline"
        className="w-full h-12 text-base"
        aria-label="Copy invite code to clipboard"
      >
        {copied ? (
          <>
            <Check className="mr-2 h-5 w-5" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="mr-2 h-5 w-5" />
            Copy Code
          </>
        )}
      </Button>
      <p className="text-sm text-center text-muted-foreground">
        Share this code with your students so they can join your studio!
      </p>
    </div>
  );
}
