import { useEffect, useState, type ReactNode } from 'react';

export interface DeferredContentProps {
  readonly children: ReactNode;
  /** How long to wait before showing the content. */
  readonly delayMs?: number;
}

/**
 * Shows its children only after a short delay. Wrap loading indicators in it so that fast loads
 * finish without a spinner flashing on screen; slow loads still show the indicator.
 */
export function DeferredContent({ children, delayMs = 250 }: DeferredContentProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delayMs);
    return () => clearTimeout(timer);
  }, [delayMs]);

  return visible ? <>{children}</> : null;
}
