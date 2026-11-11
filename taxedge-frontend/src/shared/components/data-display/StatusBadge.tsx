import './StatusBadge.css';

export type BadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

export interface StatusBadgeProps {
  readonly label: string;
  readonly tone: BadgeTone;
}

export function StatusBadge({ label, tone }: StatusBadgeProps) {
  return <span className={`tx-badge tx-badge--${tone}`}>{label}</span>;
}
