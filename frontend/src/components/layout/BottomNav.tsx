import { Home, Clock, Users, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Clock, label: 'Practice', path: '/practice' },
    { icon: Users, label: 'Community', path: '/community' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="container flex h-16 items-center justify-around px-4">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                'flex flex-col items-center gap-1 touch-target transition-colors',
                isActive
                  ? 'text-piano-purple'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon size={24} className={isActive ? 'fill-current' : ''} />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
