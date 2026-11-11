import { Component, type ErrorInfo, type ReactNode } from 'react';
import { logger } from '@/core/logging/logger';
import { Button, GeometricBackdrop } from '@/shared';
import './AppErrorBoundary.css';

interface AppErrorBoundaryProps {
  readonly children: ReactNode;
}

interface AppErrorBoundaryState {
  readonly hasError: boolean;
}

/** Last-resort fallback so a rendering failure never leaves a blank screen. */
export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    logger.error('Unhandled rendering error.', { error, componentStack: info.componentStack });
  }

  private readonly handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }
    return (
      <GeometricBackdrop>
        <section className="tx-error-boundary" role="alert">
          <h1 className="tx-error-boundary__title">Something went wrong</h1>
          <p className="tx-error-boundary__text">An unexpected error occurred. Please reload the page to continue.</p>
          <Button size="lg" onClick={this.handleReload}>
            Reload page
          </Button>
        </section>
      </GeometricBackdrop>
    );
  }
}
