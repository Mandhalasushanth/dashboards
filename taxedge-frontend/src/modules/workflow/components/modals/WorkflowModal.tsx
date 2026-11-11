import { useEffect, useId, useRef, type FormEvent, type ReactNode } from 'react';
import { Icon } from '@/shared';
import './WorkflowModal.css';

export interface WorkflowModalProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly onClose: () => void;
  readonly onSubmit: () => void;
  readonly footer: ReactNode;
  readonly children: ReactNode;
  readonly size?: 'md' | 'lg';
  /** While saving, Escape and the backdrop cannot close the dialog mid-request. */
  readonly busy?: boolean;
}

/** Accessible form dialog: labelled, focus moves inside on open and returns on close, Escape closes. */
export function WorkflowModal({ title, subtitle, onClose, onSubmit, footer, children, size = 'md', busy = false }: WorkflowModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const firstField = dialogRef.current?.querySelector<HTMLElement>('input, select, textarea, button:not(.tx-wf-modal__close)');
    (firstField ?? dialogRef.current)?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [busy, onClose]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <div className="tx-wf-modal__overlay" onMouseDown={(event) => event.target === event.currentTarget && !busy && onClose()}>
      <div ref={dialogRef} className={`tx-wf-modal tx-wf-modal--${size}`} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}>
        <header className="tx-wf-modal__header">
          <div>
            <h2 id={titleId} className="tx-wf-modal__title">
              {title}
            </h2>
            {subtitle ? <p className="tx-wf-modal__subtitle">{subtitle}</p> : null}
          </div>
          <button type="button" className="tx-wf-modal__close" onClick={onClose} disabled={busy} aria-label="Close dialog">
            <Icon name="x" />
          </button>
        </header>
        <form className="tx-wf-modal__form" onSubmit={handleSubmit} noValidate>
          <div className="tx-wf-modal__body">{children}</div>
          <footer className="tx-wf-modal__footer">{footer}</footer>
        </form>
      </div>
    </div>
  );
}
