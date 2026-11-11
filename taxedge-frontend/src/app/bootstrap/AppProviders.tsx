import { useEffect, type ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { restoreSession, startSessionSync } from '@/modules/authentication';
import { PageLoader } from '@/shared';
import { useAuthStore } from '@/store';
import { AppErrorBoundary } from './AppErrorBoundary';

interface ProvidersProps {
  readonly children: ReactNode;
}

/** Verifies the session cookie with the server before any route renders, then keeps tabs in sync. */
function SessionBootstrap({ children }: ProvidersProps) {
  const status = useAuthStore((snapshot) => snapshot.status);

  useEffect(() => {
    const stopSync = startSessionSync();
    void restoreSession();
    return stopSync;
  }, []);

  return status === 'initializing' ? <PageLoader message="Verifying your secure session…" /> : <>{children}</>;
}

export function AppProviders({ children }: ProvidersProps) {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AppErrorBoundary>
        <SessionBootstrap>{children}</SessionBootstrap>
      </AppErrorBoundary>
    </BrowserRouter>
  );
}
