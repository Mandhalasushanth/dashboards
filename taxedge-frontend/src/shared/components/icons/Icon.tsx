import './Icon.css';

/** Icons are local SVGs in /public/assets/icons, rendered as CSS masks so they inherit `color`. */
export type IconName =
  | 'user'
  | 'lock'
  | 'eye'
  | 'eye-off'
  | 'alert-circle'
  | 'log-out'
  | 'shield-check'
  | 'clock'
  | 'layout-dashboard'
  | 'chevron-left'
  | 'menu'
  | 'file-spreadsheet'
  | 'users'
  | 'shield'
  | 'user-check'
  | 'layers'
  | 'credit-card'
  | 'bar-chart'
  | 'message-square'
  | 'bell'
  | 'settings'
  | 'building'
  | 'receipt'
  | 'globe'
  | 'sliders'
  | 'circle-check'
  | 'rotate-ccw'
  | 'save'
  | 'file-up'
  | 'check'
  | 'check-check'
  | 'trash'
  | 'mail'
  | 'arrow-right'
  | 'inbox'
  | 'search'
  | 'send'
  | 'calendar'
  | 'phone'
  | 'plus'
  | 'x'
  | 'zoom-in'
  | 'zoom-out'
  | 'rotate-cw'
  | 'download'
  | 'star'
  | 'calculator'
  | 'alert-triangle'
  | 'briefcase'
  | 'list-checks'
  | 'file-text'
  | 'printer'
  | 'chevron-right'
  | 'trending-up'
  | 'landmark';

export type IconSize = 'sm' | 'md' | 'lg';

export interface IconProps {
  readonly name: IconName;
  readonly size?: IconSize;
  readonly className?: string;
}

export function Icon({ name, size = 'md', className = '' }: IconProps) {
  const classes = ['tx-icon', `tx-icon--${name}`, `tx-icon--${size}`, className].filter(Boolean).join(' ');
  return <span className={classes} aria-hidden="true" />;
}
