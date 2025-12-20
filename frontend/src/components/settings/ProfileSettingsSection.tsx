import { useState } from 'react';
import { User, Mail, Shield, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DeleteAccountDialog } from './DeleteAccountDialog';
import type { User as UserType } from '@/types';

interface ProfileSettingsSectionProps {
  user: UserType;
  hasStudents?: boolean;
}

export function ProfileSettingsSection({ user, hasStudents = false }: ProfileSettingsSectionProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const getRoleBadgeColor = (role: string | null) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'TEACHER':
        return 'bg-piano-purple/10 text-piano-purple border-piano-purple/20';
      case 'STUDENT':
        return 'bg-piano-teal/10 text-piano-teal border-piano-teal/20';
      case 'PARENT':
        return 'bg-piano-pink/10 text-piano-pink border-piano-pink/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatRole = (role: string | null) => {
    if (!role) return 'No Role';
    return role.charAt(0) + role.slice(1).toLowerCase();
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-heading">Profile Settings</CardTitle>
          <CardDescription>
            Manage your account information and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* User Info Section */}
          <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
            <Avatar className="h-16 w-16">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-piano-purple/10 flex items-center justify-center">
                  <User className="h-8 w-8 text-piano-purple" />
                </div>
              )}
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-semibold truncate">{user.name}</h3>
                <Badge
                  variant="outline"
                  className={getRoleBadgeColor(user.role)}
                >
                  <Shield className="h-3 w-3 mr-1" />
                  {formatRole(user.role)}
                </Badge>
              </div>

              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span className="truncate">{user.email}</span>
              </div>

              {user.studioName && (
                <div className="mt-2">
                  <span className="text-sm text-muted-foreground">Studio: </span>
                  <span className="text-sm font-medium">{user.studioName}</span>
                </div>
              )}

              {user.inviteCode && user.role === 'TEACHER' && (
                <div className="mt-2">
                  <span className="text-sm text-muted-foreground">Invite Code: </span>
                  <span className="text-sm font-mono font-medium bg-muted px-2 py-0.5 rounded">
                    {user.inviteCode}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="border-t pt-6">
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-semibold text-destructive flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Danger Zone
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Irreversible actions that affect your account
                </p>
              </div>

              <div className="p-4 rounded-lg border border-destructive/20 bg-destructive/5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h5 className="font-medium text-sm">Delete Account</h5>
                    <p className="text-sm text-muted-foreground mt-1">
                      Permanently delete your account and all associated data. This action cannot be
                      undone.
                    </p>
                    {hasStudents && (
                      <p className="text-xs text-destructive mt-2 font-medium">
                        You must remove all students before deleting your account.
                      </p>
                    )}
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteDialogOpen(true)}
                    className="shrink-0"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <DeleteAccountDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        hasStudents={hasStudents}
      />
    </>
  );
}

function AlertTriangle({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" x2="12" y1="9" y2="13" />
      <line x1="12" x2="12.01" y1="17" y2="17" />
    </svg>
  );
}
