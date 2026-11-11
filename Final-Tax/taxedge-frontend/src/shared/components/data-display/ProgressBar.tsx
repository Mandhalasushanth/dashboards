import './ProgressBar.css';

export interface ProgressBarProps {
  readonly value: number;
  readonly max: number;
  readonly label: string;
}

/** Fill snaps to 5% steps (CSS classes, no inline styles); turns amber near the limit and red past it. */
export function ProgressBar({ value, max, label }: ProgressBarProps) {
  const ratio = max > 0 ? value / max : 0;
  const step = Math.min(100, Math.max(0, Math.round((ratio * 100) / 5) * 5));
  const tone = ratio > 1 ? 'danger' : ratio > 0.85 ? 'warning' : 'ok';

  return (
    <div className="tx-progress" role="progressbar" aria-label={label} aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
      <span className={`tx-progress__fill tx-progress__fill--${tone} tx-progress__fill--p${step}`} />
    </div>
  );
}
