import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface InviteCodeCardProps {
  inviteCode: string;
  studioName: string;
}

export function InviteCodeCard({ inviteCode, studioName }: InviteCodeCardProps) {
  const [copied, setCopied] = useState(false);

  // Generate the join URL that will be encoded in the QR code
  const joinUrl = `${window.location.origin}/join/${inviteCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Card className="card-rounded-lg border-2 border-piano-purple/20 bg-gradient-to-br from-piano-purple/5 to-piano-pink/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <UserPlus className="h-5 w-5 text-piano-purple" />
          Invite Students & Parents
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Share this with students and parents to join <span className="font-semibold">{studioName}</span>
        </p>

        {/* Two-column layout: QR Code | Invite Code */}
        <div className="flex gap-4">
          {/* QR Code */}
          <div className="flex flex-col items-center justify-center bg-white border-2 border-piano-purple/30 rounded-lg p-4">
            <QRCodeSVG
              value={joinUrl}
              size={120}
              level="M"
              fgColor="#7B68EE"
              bgColor="#ffffff"
            />
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Scan to join
            </p>
            <p className="text-xs text-piano-purple font-medium">
              扫码加入
            </p>
          </div>

          {/* Invite Code */}
          <div className="flex-1 bg-white border-2 border-piano-purple/30 rounded-lg px-4 py-3 flex flex-col justify-center">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Invite Code / 邀请码
                </p>
                <p className="text-2xl font-bold font-mono tracking-wider text-piano-purple">
                  {inviteCode}
                </p>
              </div>
              <Button
                onClick={handleCopy}
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 hover:bg-piano-purple/10"
              >
                {copied ? (
                  <Check className="h-5 w-5 text-green-600" />
                ) : (
                  <Copy className="h-5 w-5 text-piano-purple" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Or type this code when signing up
            </p>
          </div>
        </div>

        <div className="bg-white/50 rounded-lg p-3 border border-piano-purple/10">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Parents and students can scan the QR code or enter the invite code during sign up.
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed mt-1">
            家长和学生可以扫描二维码或在注册时输入邀请码。
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
