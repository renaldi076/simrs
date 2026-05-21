import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps): React.ReactElement {
  const { state } = useAuth();
  const location = useLocation();

  useSessionTimeout();

  if (state.isAuthenticated === false && state.user === null && state.sessionStartedAt === null) {
    // Could be still loading — but since we use synchronous localStorage, we treat null session as unauthenticated
  }

  if (!state.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

// Loading wrapper for async auth checks if needed in future
export function AuthGuardWithLoading({ children }: AuthGuardProps): React.ReactElement {
  const { state } = useAuth();
  const location = useLocation();
  const [isChecking, setIsChecking] = React.useState(true);

  useSessionTimeout();

  React.useEffect(() => {
    // Simulate brief check for session restoration
    const timer = setTimeout(() => setIsChecking(false), 100);
    return () => clearTimeout(timer);
  }, []);

  if (isChecking) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!state.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
