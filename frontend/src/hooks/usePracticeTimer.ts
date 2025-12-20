import { useState, useEffect, useCallback, useRef } from 'react';
import { apiService } from '@/services/api';

const STORAGE_KEY = 'pianostudio_practice_session';

export function usePracticeTimer() {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [assignmentId, setAssignmentId] = useState<number | undefined>();
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<Date | null>(null);
  const lastPointsMilestone = useRef<number>(0);

  // Load saved session from localStorage on mount
  useEffect(() => {
    const savedSession = localStorage.getItem(STORAGE_KEY);
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        const now = new Date();
        const savedStartTime = new Date(session.startTime);
        const timeDiff = Math.floor((now.getTime() - savedStartTime.getTime()) / 1000);

        setElapsedSeconds(session.elapsedSeconds + timeDiff);
        setAssignmentId(session.assignmentId);
        setSessionId(session.sessionId);
        startTimeRef.current = savedStartTime;
        setIsRunning(false); // Don't auto-resume, let user click play
      } catch (error) {
        console.error('Failed to load saved practice session:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Save to localStorage whenever session state changes
  useEffect(() => {
    if (startTimeRef.current && sessionId) {
      const session = {
        sessionId,
        startTime: startTimeRef.current.toISOString(),
        elapsedSeconds,
        isPaused: !isRunning,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    }
  }, [elapsedSeconds, sessionId, isRunning]);

  // Timer tick
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const start = useCallback(async (newAssignmentId?: number) => {
    if (!startTimeRef.current) {
      setIsLoading(true);
      try {
        // Call backend API to start session
        const session = await apiService.startPracticeSession(newAssignmentId);
        setSessionId(session.id);
        startTimeRef.current = new Date();
        setElapsedSeconds(0);
        setAssignmentId(newAssignmentId);
        setIsRunning(true);
      } catch (error) {
        console.error('Failed to start practice session:', error);
        // Still allow local timer to work even if API fails
        startTimeRef.current = new Date();
        setElapsedSeconds(0);
        setAssignmentId(newAssignmentId);
        setIsRunning(true);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Already have a session, just resume
      setIsRunning(true);
    }
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resume = useCallback(() => {
    setIsRunning(true);
  }, []);

  const stop = useCallback(async () => {
    setIsRunning(false);
    setIsLoading(true);

    const finalMinutes = Math.floor(elapsedSeconds / 60);
    const finalPoints = Math.floor(finalMinutes / 5) * 10; // 10 points per 5 minutes

    try {
      // Call backend API to end session
      if (sessionId) {
        await apiService.endPracticeSession(sessionId, finalMinutes);
      }
    } catch (error) {
      console.error('Failed to end practice session:', error);
    } finally {
      // Reset local state
      setElapsedSeconds(0);
      setAssignmentId(undefined);
      setSessionId(null);
      startTimeRef.current = null;
      lastPointsMilestone.current = 0;
      localStorage.removeItem(STORAGE_KEY);
      setIsLoading(false);
    }

    return { minutes: finalMinutes, pointsEarned: finalPoints };
  }, [elapsedSeconds, sessionId]);

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;

  // Calculate points earned (10 points per 5 minutes)
  const pointsEarned = Math.floor(minutes / 5) * 10;

  // Check if we've hit a new points milestone (for celebration)
  const shouldCelebrate = pointsEarned > lastPointsMilestone.current;
  if (shouldCelebrate) {
    lastPointsMilestone.current = pointsEarned;
  }

  return {
    isRunning,
    isPaused: !isRunning && !!startTimeRef.current,
    isLoading,
    elapsedSeconds,
    minutes,
    seconds,
    pointsEarned,
    sessionId,
    assignmentId,
    start,
    pause,
    resume,
    stop,
    hasActiveSession: !!startTimeRef.current,
    shouldCelebrate,
  };
}
