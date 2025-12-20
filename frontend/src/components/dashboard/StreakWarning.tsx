import { useState, useEffect } from 'react';
import { AlertTriangle, Clock, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface StreakWarningProps {
  currentStreak: number;
  practicedToday: boolean;
}

export function StreakWarning({ currentStreak, practicedToday }: StreakWarningProps) {
  const navigate = useNavigate();
  const [timeUntilMidnight, setTimeUntilMidnight] = useState('');
  const [urgency, setUrgency] = useState<'normal' | 'warning' | 'critical'>('normal');

  useEffect(() => {
    const calculateTimeUntilMidnight = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);

      const diff = midnight.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      // Set urgency based on time remaining
      if (hours < 1) {
        setUrgency('critical');
      } else if (hours < 3) {
        setUrgency('warning');
      } else {
        setUrgency('normal');
      }

      if (hours > 0) {
        setTimeUntilMidnight(`${hours}h ${minutes}m`);
      } else {
        setTimeUntilMidnight(`${minutes}m`);
      }
    };

    calculateTimeUntilMidnight();
    const interval = setInterval(calculateTimeUntilMidnight, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Don't show if no streak or already practiced today
  if (currentStreak === 0 || practicedToday) {
    return null;
  }

  const urgencyStyles = {
    normal: {
      container: 'bg-amber-50 border-amber-200',
      icon: 'text-amber-500',
      text: 'text-amber-800',
      subtext: 'text-amber-600',
    },
    warning: {
      container: 'bg-orange-50 border-orange-300',
      icon: 'text-orange-500',
      text: 'text-orange-800',
      subtext: 'text-orange-600',
    },
    critical: {
      container: 'bg-red-50 border-red-300 animate-pulse',
      icon: 'text-red-500',
      text: 'text-red-800',
      subtext: 'text-red-600',
    },
  };

  const styles = urgencyStyles[urgency];

  return (
    <div className={`rounded-lg border-2 p-4 ${styles.container}`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-full bg-white/50 ${styles.icon}`}>
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={`font-semibold ${styles.text}`}>
              Your {currentStreak}-day streak is at risk!
            </h3>
            <Flame className={`h-4 w-4 ${styles.icon} fill-current`} />
          </div>
          <p className={`text-sm mt-1 ${styles.subtext}`}>
            Practice before midnight to keep your streak going.
          </p>
          <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${styles.text}`}>
            <Clock className="h-4 w-4" />
            <span>{timeUntilMidnight} remaining</span>
          </div>
        </div>
        <Button
          onClick={() => navigate('/practice')}
          size="sm"
          className="bg-piano-streak hover:bg-piano-streak/90 text-white shrink-0"
        >
          Practice Now
        </Button>
      </div>
    </div>
  );
}
