import { GeometricBackdrop } from '../layout/GeometricBackdrop';
import { DeferredContent } from './DeferredContent';
import { LoadingSpinner } from './LoadingSpinner';
import './PageLoader.css';

export interface PageLoaderProps {
  readonly message: string;
}

/** Full-screen loading state, e.g. while the session is verified. Hidden for quick loads to avoid a flash. */
export function PageLoader({ message }: PageLoaderProps) {
  return (
    <DeferredContent>
      <GeometricBackdrop>
        <div className="tx-page-loader" aria-live="polite">
          <span className="tx-page-loader__spinner">
            <LoadingSpinner size="lg" />
          </span>
          <p className="tx-page-loader__message">{message}</p>
        </div>
      </GeometricBackdrop>
    </DeferredContent>
  );
}
