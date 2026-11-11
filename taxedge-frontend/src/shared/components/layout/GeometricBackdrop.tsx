import type { ReactNode } from 'react';
import './GeometricBackdrop.css';

export interface GeometricBackdropProps {
  readonly children: ReactNode;
  /** Renders as <main> by default so full-screen pages get a landmark. */
  readonly as?: 'main' | 'div';
}

/** Full-viewport dark navy geometric canvas shared by sign-in, loading and status screens. */
export function GeometricBackdrop({ children, as: Element = 'main' }: GeometricBackdropProps) {
  return (
    <Element className="tx-backdrop">
      <div className="tx-backdrop__glow" aria-hidden="true" />
      <div className="tx-backdrop__content">{children}</div>
    </Element>
  );
}
