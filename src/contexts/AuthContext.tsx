import React, { createContext, useReducer, useEffect, useCallback } from 'react';
import type {
  AuthState,
  AuthAction,
  LoginCredentials,
  LoginResult,
  User,
} from '@/types/auth';
import {
  initializeUsers,
  login as authLogin,
  logout as authLogout,
  getSession,
  isSessionValid,
  updateLastActivity as updateStorageActivity,
} from '@/services/authService';
import { storageService } from '@/services/storageService';

interface StoredUser {
  id: string;
  username: string;
  fullName: string;
  role: User['role'];
  isActive: boolean;
}

interface AuthContextValue {
  state: AuthState;
  login: (credentials: LoginCredentials) => LoginResult;
  logout: (reason?: 'manual' | 'inactivity' | 'expired') => void;
  updateActivity: () => void;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  sessionStartedAt: null,
  lastActivityAt: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        user: action.payload.user,
        isAuthenticated: true,
        sessionStartedAt: action.payload.session.startedAt,
        lastActivityAt: action.payload.session.lastActivityAt,
      };
    case 'LOGOUT':
      return { ...initialState };
    case 'UPDATE_ACTIVITY':
      return {
        ...state,
        lastActivityAt: Date.now(),
      };
    case 'SESSION_CHECK': {
      const session = getSession();
      if (!session || !isSessionValid(session)) {
        return { ...initialState };
      }
      return state;
    }
    default:
      return state;
  }
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize users and restore session on mount
  useEffect(() => {
    initializeUsers();

    const session = getSession();
    if (session && isSessionValid(session)) {
      // Restore user from stored users
      const users = storageService.get<StoredUser[]>('users') ?? [];
      const storedUser = users.find(u => u.id === session.userId);
      if (storedUser) {
        const user: User = {
          id: storedUser.id,
          username: storedUser.username,
          fullName: storedUser.fullName,
          role: storedUser.role,
          isActive: storedUser.isActive,
          permissions: [],
        };
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user, session } });
      }
    }
  }, []);

  const login = useCallback((credentials: LoginCredentials): LoginResult => {
    const result = authLogin(credentials);
    if (result.success) {
      const session = getSession()!;
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user: result.user, session } });
    }
    return result;
  }, []);

  const logout = useCallback((reason?: 'manual' | 'inactivity' | 'expired') => {
    authLogout();
    dispatch({ type: 'LOGOUT', payload: { reason: reason ?? 'manual' } });
  }, []);

  const updateActivity = useCallback(() => {
    updateStorageActivity();
    dispatch({ type: 'UPDATE_ACTIVITY' });
  }, []);

  return (
    <AuthContext.Provider value={{ state, login, logout, updateActivity }}>
      {children}
    </AuthContext.Provider>
  );
}
