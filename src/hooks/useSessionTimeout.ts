import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getSession, isSessionValid } from '@/services/authService';

const CHECK_INTERVAL_MS = 60 * 1000; // 1 minute
const ACTIVITY_DEBOUNCE_MS = 60 * 1000; // 1 minute

export function useSessionTimeout(): void {
  const { state, logout, updateActivity } = useAuth();
  const lastActivityUpdate = useRef<number>(Date.now());

  const handleActivity = useCallback(() => {
    const now = Date.now();
    if (now - lastActivityUpdate.current >= ACTIVITY_DEBOUNCE_MS) {
      lastActivityUpdate.current = now;
      updateActivity();
    }
  }, [updateActivity]);

  // Listen for user interaction events
  useEffect(() => {
    if (!state.isAuthenticated) return;

    const events = ['click', 'keypress', 'mousemove'] as const;
    events.forEach(event => window.addEventListener(event, handleActivity));

    return () => {
      events.forEach(event => window.removeEventListener(event, handleActivity));
    };
  }, [state.isAuthenticated, handleActivity]);

  // Periodic session validity check
  useEffect(() => {
    if (!state.isAuthenticated) return;

    const interval = setInterval(() => {
      const session = getSession();
      if (!session) {
        logout('expired');
        return;
      }

      if (!isSessionValid(session)) {
        const now = Date.now();
        if (now >= session.expiresAt) {
          logout('expired');
        } else {
          logout('inactivity');
        }
      }
    }, CHECK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [state.isAuthenticated, logout]);
}
