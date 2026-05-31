'use client';

import { useCallback, useState } from 'react';
import { MOCK_USER } from '@/lib/mock-data';
import type { LoginFormData, User } from '@/lib/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  });

  const login = useCallback(async (data: LoginFormData) => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    await new Promise((r) => setTimeout(r, 1200));

    if (!data.email || !data.password) {
      setState((s) => ({
        ...s,
        isLoading: false,
        error: 'Email and password cannot be empty.',
      }));
      return false;
    }

    setState({
      user: MOCK_USER,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });
    return true;
  }, []);

  const logout = useCallback(() => {
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  }, []);

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }));
  }, []);

  return {
    user: state.user ?? MOCK_USER,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    login,
    logout,
    clearError,
  };
}
