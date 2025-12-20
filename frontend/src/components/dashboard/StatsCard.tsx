import { Card, CardContent } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color?: 'purple' | 'teal' | 'pink' | 'orange' | 'gold';
  suffix?: string;
}

export function StatsCard({ icon: Icon, label, value, color = 'purple', suffix }: StatsCardProps) {
  const colorClasses = {
    purple: 'text-piano-purple',
    teal: 'text-piano-teal',
    pink: 'text-piano-pink',
    orange: 'text-piano-streak',
    gold: 'text-piano-gold',
  };

  return (
    <Card className="card-rounded hover:shadow-md transition-shadow duration-200">
      <CardContent className="pt-6 space-y-3">
        <div className={`inline-flex p-2 rounded-lg bg-${color === 'purple' ? 'piano-purple' : color === 'teal' ? 'piano-teal' : color === 'pink' ? 'piano-pink' : color === 'orange' ? 'piano-streak' : 'piano-gold'}/10`}>
          <Icon className={`h-6 w-6 ${colorClasses[color]}`} />
        </div>
        <div className="space-y-1">
          <p className={`text-3xl font-heading font-bold ${colorClasses[color]}`}>
            {value}{suffix}
          </p>
          <p className="text-sm text-muted-foreground font-medium">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
