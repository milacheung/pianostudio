import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { apiService } from '@/services/api';
import type { User, CompleteSignupResponse } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  needsOnboarding: boolean;
  completeOnboarding: (data: {
    role: 'TEACHER' | 'PARENT';
    studioName?: string;
    inviteCode?: string;
  }) => Promise<CompleteSignupResponse>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth token on mount
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const currentUser = await apiService.getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          console.error('Failed to fetch current user:', error);
          localStorage.removeItem('auth_token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (token: string) => {
    localStorage.setItem('auth_token', token);
    try {
      const currentUser = await apiService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      localStorage.removeItem('auth_token');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('auth_token');
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const currentUser = await apiService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      throw error;
    }
  };

  const completeOnboarding = async (data: {
    role: 'TEACHER' | 'PARENT';
    studioName?: string;
    inviteCode?: string;
  }): Promise<CompleteSignupResponse> => {
    try {
      const response = await apiService.completeSignup(data);
      setUser(response.user);
      return response;
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    needsOnboarding: !!user && !user.hasCompletedOnboarding,
    completeOnboarding,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
