import { Crown, GraduationCap, Heart, Shield } from 'lucide-react';
import type { UserRole } from '@/types';

interface RoleBadgeProps {
  role: UserRole | null;
  size?: 'sm' | 'md';
}

const roleConfig: Record<string, {
  icon: typeof Crown;
  label: string;
  gradient: string;
  ariaLabel: string;
}> = {
  ADMIN: {
    icon: Shield,
    label: 'Admin',
    gradient: 'gradient-purple',
    ariaLabel: 'Your role: Admin',
  },
  TEACHER: {
    icon: Crown,
    label: 'Teacher',
    gradient: 'gradient-purple',
    ariaLabel: 'Your role: Teacher',
  },
  STUDENT: {
    icon: GraduationCap,
    label: 'Student',
    gradient: 'gradient-teal',
    ariaLabel: 'Your role: Student',
  },
  PARENT: {
    icon: Heart,
    label: 'Parent',
    gradient: 'gradient-pink',
    ariaLabel: 'Your role: Parent',
  },
};

export function RoleBadge({ role, size = 'sm' }: RoleBadgeProps) {
  if (!role) return null;

  const config = roleConfig[role];
  if (!config) return null;

  const Icon = config.icon;

  const sizeClasses = {
    sm: {
      container: 'h-7 px-2.5 gap-1.5',
      icon: 'h-3.5 w-3.5',
      text: 'text-xs',
    },
    md: {
      container: 'h-8 px-3 gap-2',
      icon: 'h-4 w-4',
      text: 'text-sm',
    },
  };

  const classes = sizeClasses[size];

  return (
    <div
      className={`${config.gradient} ${classes.container} rounded-full flex items-center text-white font-medium shadow-sm transition-transform hover:scale-105`}
      role="status"
      aria-label={config.ariaLabel}
      title={config.ariaLabel}
    >
      <Icon className={classes.icon} />
      <span className={`${classes.text} hidden md:inline`}>{config.label}</span>
    </div>
  );
}
