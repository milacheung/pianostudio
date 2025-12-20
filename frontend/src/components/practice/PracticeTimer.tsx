import { Play, Pause, Square, Trophy, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { usePracticeTimer } from '@/hooks/usePracticeTimer';
import { useState, useEffect, useRef } from 'react';

interface PracticeTimerProps {
  assignmentId?: number;
  goalMinutes?: number;
  onComplete?: (minutes: number, points: number) => void;
}

const encouragementMessages = [
  "Great job! Keep it up!",
  "You're doing amazing!",
  "Fantastic work!",
  "Keep practicing!",
  "You're on fire!",
  "Wonderful progress!",
  "You're a star!",
  "Excellent work!",
];

export function PracticeTimer({ assignmentId, goalMinutes = 30, onComplete }: PracticeTimerProps) {
  const {
    isRunning,
    isPaused,
    isLoading,
    minutes,
    seconds,
    pointsEarned,
    start,
    pause,
    resume,
    stop,
    hasActiveSession,
    shouldCelebrate,
  } = usePracticeTimer();

  const [showCelebration, setShowCelebration] = useState(false);
  const [encouragementMessage, setEncouragementMessage] = useState('');
  const [displayedPoints, setDisplayedPoints] = useState(0);
  const [pointsBounce, setPointsBounce] = useState(false);
  const previousPointsRef = useRef(0);

  // Animate points counting up
  useEffect(() => {
    if (pointsEarned !== previousPointsRef.current) {
      // Trigger bounce animation
      setPointsBounce(true);
      setTimeout(() => setPointsBounce(false), 300);

      // Animate counting up
      const diff = pointsEarned - displayedPoints;
      if (diff > 0) {
        const step = Math.ceil(diff / 10);
        const interval = setInterval(() => {
          setDisplayedPoints((prev) => {
            const next = prev + step;
            if (next >= pointsEarned) {
              clearInterval(interval);
              return pointsEarned;
            }
            return next;
          });
        }, 50);
        return () => clearInterval(interval);
      } else {
        setDisplayedPoints(pointsEarned);
      }
      previousPointsRef.current = pointsEarned;
    }
  }, [pointsEarned, displayedPoints]);

  // Show celebration when hitting points milestone
  useEffect(() => {
    if (shouldCelebrate && pointsEarned > 0) {
      setShowCelebration(true);
      const randomMessage =
        encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)];
      setEncouragementMessage(randomMessage);

      // Hide celebration after 3 seconds
      const timer = setTimeout(() => {
        setShowCelebration(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [shouldCelebrate, pointsEarned]);

  const handleStart = () => {
    start(assignmentId);
  };

  const handleStop = async () => {
    const result = await stop();
    if (onComplete) {
      onComplete(result.minutes, result.pointsEarned);
    }
  };

  const togglePlay = () => {
    if (!hasActiveSession) {
      handleStart();
    } else if (isRunning) {
      pause();
    } else {
      resume();
    }
  };

  const formatTime = (mins: number, secs: number) => {
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const progressPercentage = goalMinutes > 0 ? (minutes / goalMinutes) * 100 : 0;

  // Calculate stroke dasharray for circular progress
  const radius = 140;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  return (
    <Card className="card-rounded-lg p-6 md:p-8 relative overflow-hidden">
      {/* Celebration Overlay */}
      {showCelebration && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-piano-purple/20 to-piano-pink/20 backdrop-blur-sm animate-in fade-in duration-500">
          <div className="flex flex-col items-center gap-4 animate-in zoom-in duration-300">
            <Sparkles className="w-24 h-24 text-piano-gold animate-pulse" strokeWidth={1.5} />
            <div className="text-3xl md:text-4xl font-heading font-bold text-piano-purple">
              +{pointsEarned - (Math.floor(minutes / 5) - 1) * 10} Points!
            </div>
            <div className="text-xl md:text-2xl font-heading text-piano-pink">
              {encouragementMessage}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center gap-6">
        {/* Circular Timer Display */}
        <div className="relative">
          <svg className="transform -rotate-90" width="320" height="320">
            {/* Background circle */}
            <circle
              cx="160"
              cy="160"
              r={radius}
              stroke="currentColor"
              strokeWidth="12"
              fill="none"
              className="text-muted"
            />
            {/* Progress circle */}
            <circle
              cx="160"
              cy="160"
              r={radius}
              stroke="url(#gradient)"
              strokeWidth="12"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-300 ease-in-out"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4ECDC4" />
                <stop offset="100%" stopColor="#3BA9A1" />
              </linearGradient>
            </defs>
          </svg>

          {/* Timer text in center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-6xl font-heading font-bold tabular-nums">{formatTime(minutes, seconds)}</div>
            <div className="text-sm text-muted-foreground mt-2">
              {goalMinutes > 0 && `Goal: ${goalMinutes} min`}
            </div>
          </div>
        </div>

        {/* Points Display */}
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-full bg-piano-gold/10 border border-piano-gold/20 transition-transform duration-300 ${
            pointsBounce ? 'scale-110' : 'scale-100'
          }`}
        >
          <Trophy className={`text-piano-gold transition-transform duration-300 ${pointsBounce ? 'rotate-12' : ''}`} size={20} />
          <span className="font-semibold text-lg tabular-nums">{displayedPoints} points earned</span>
        </div>

        {/* Goal Progress Bar */}
        {goalMinutes > 0 && (
          <div className="w-full">
            <Progress value={Math.min(progressPercentage, 100)} className="h-2" />
            <p className="text-sm text-muted-foreground text-center mt-2">
              {minutes} / {goalMinutes} minutes
            </p>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex gap-4">
          <Button
            size="lg"
            onClick={togglePlay}
            disabled={isLoading}
            className="touch-target w-32 h-32 rounded-full gradient-teal text-white hover:opacity-90 transition-opacity shadow-lg disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
            ) : isRunning ? (
              <Pause size={48} />
            ) : (
              <Play size={48} className="ml-1" />
            )}
          </Button>

          {hasActiveSession && (
            <Button
              size="lg"
              variant="outline"
              onClick={handleStop}
              disabled={isLoading}
              className="touch-target w-32 h-32 rounded-full border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50"
            >
              <Square size={48} />
            </Button>
          )}
        </div>

        {/* Helper text */}
        <p className="text-base text-muted-foreground text-center max-w-md font-medium">
          {!hasActiveSession && 'Ready to practice? Press play to start!'}
          {isPaused && 'Paused - your progress is safely saved'}
          {isRunning && minutes < 5 && 'Keep going! You earn 10 points every 5 minutes'}
          {isRunning && minutes >= 5 && "Awesome job! You're earning points!"}
        </p>
      </div>
    </Card>
  );
}
