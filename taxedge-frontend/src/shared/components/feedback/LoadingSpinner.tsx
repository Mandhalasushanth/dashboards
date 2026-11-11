import './LoadingSpinner.css';

export interface LoadingSpinnerProps {
  readonly size?: 'sm' | 'lg';
  /** Announced to screen readers; omit when a surrounding element already describes the loading state. */
  readonly label?: string;
}

export function LoadingSpinner({ size = 'sm', label }: LoadingSpinnerProps) {
  return (
    <span className={`tx-spinner tx-spinner--${size}`} role={label ? 'status' : undefined}>
      {label ? <span className="tx-sr-only">{label}</span> : null}
    </span>
  );
}
