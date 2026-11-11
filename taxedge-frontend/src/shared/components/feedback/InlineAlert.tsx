import type { ReactNode } from 'react';
import { Icon, type IconName } from '../icons/Icon';
import './InlineAlert.css';

export type AlertTone = 'info' | 'success' | 'warning' | 'error';

const TONE_ICONS: Readonly<Record<AlertTone, IconName>> = Object.freeze({
  info: 'shield-check',
  success: 'circle-check',
  warning: 'clock',
  error: 'alert-circle'
});

export interface InlineAlertProps {
  readonly tone: AlertTone;
  readonly children: ReactNode;
  /** "dark" for the navy sign-in screen; everything else sits on light surfaces. */
  readonly surface?: 'light' | 'dark';
}

/** Errors interrupt assistive technology immediately; info and warnings are announced politely. */
export function InlineAlert({ tone, children, surface = 'light' }: InlineAlertProps) {
  return (
    <div className={`tx-alert tx-alert--${tone} tx-alert--on-${surface}`} role={tone === 'error' ? 'alert' : 'status'}>
      <Icon name={TONE_ICONS[tone]} className="tx-alert__icon" />
      <div className="tx-alert__message">{children}</div>
    </div>
  );
}
