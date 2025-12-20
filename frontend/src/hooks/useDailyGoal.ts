import { useState, useEffect, useCallback } from 'react';

const DAILY_GOAL_KEY = 'pianostudio_daily_goal';
const DEFAULT_GOAL = 30;

export function useDailyGoal() {
  const [dailyGoal, setDailyGoalState] = useState(DEFAULT_GOAL);

  // Load saved goal from localStorage
  useEffect(() => {
    const savedGoal = localStorage.getItem(DAILY_GOAL_KEY);
    if (savedGoal) {
      setDailyGoalState(parseInt(savedGoal, 10));
    }

    // Listen for changes from other tabs/components
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === DAILY_GOAL_KEY && e.newValue) {
        setDailyGoalState(parseInt(e.newValue, 10));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const setDailyGoal = useCallback((minutes: number) => {
    setDailyGoalState(minutes);
    localStorage.setItem(DAILY_GOAL_KEY, minutes.toString());
  }, []);

  return { dailyGoal, setDailyGoal };
}
