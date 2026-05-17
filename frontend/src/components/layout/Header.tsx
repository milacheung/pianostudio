import { Link } from 'react-router-dom';
import { Music } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PointsDisplay } from '@/components/common/PointsDisplay';
import { RoleBadge } from '@/components/common/RoleBadge';
import { useAuth } from '@/context/AuthContext';

export function Header() {
  const { user } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-purple">
            <Music className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-heading font-semibold bg-gradient-to-r from-piano-purple to-piano-pink bg-clip-text text-transparent">
            PianoStudio
          </h1>
        </Link>

        {/* Right side - Points, Role Badge, and Avatar */}
        <div className="flex items-center gap-3">
          {user && (
            <>
              <PointsDisplay points={0} size="sm" />
              <RoleBadge role={user.role} />
              <Avatar className="h-9 w-9 border-2 border-piano-purple">
                <AvatarImage src={user.avatarUrl} alt={user.name} />
                <AvatarFallback className="bg-piano-purple text-white text-sm">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
