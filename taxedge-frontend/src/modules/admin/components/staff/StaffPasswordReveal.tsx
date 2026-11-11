import { useEffect, useState } from 'react';
import { formatDateTime } from '@/core/utils/dateUtils';
import { logger } from '@/core/logging/logger';
import { messageOf } from '@/modules/workflow';
import { revealStaffPassword } from '../../api/adminStaffApi';
import type { StaffMember } from '../../shared/staff.types';

/** The password stays on screen only this long, so it is not left visible on an unattended desk. */
const VISIBLE_FOR_MS = 30_000;

type RevealState =
  | { readonly kind: 'hidden' }
  | { readonly kind: 'loading' }
  | { readonly kind: 'shown'; readonly password: string }
  | { readonly kind: 'unavailable'; readonly message: string };

/**
 * Masked password with Show / Hide for the administrator. Show opens the encrypted copy kept when the
 * administrator set the password; the value leaves the screen when hidden or after 30 seconds.
 */
export function StaffPasswordReveal({ member }: { readonly member: StaffMember }) {
  const [state, setState] = useState<RevealState>({ kind: 'hidden' });
  const [viewedAt, setViewedAt] = useState(member.passwordViewedAt ?? null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (state.kind !== 'shown') return undefined;
    const timer = window.setTimeout(() => setState({ kind: 'hidden' }), VISIBLE_FOR_MS);
    return () => window.clearTimeout(timer);
  }, [state]);

  const show = async () => {
    setState({ kind: 'loading' });
    setCopied(false);
    try {
      const password = await revealStaffPassword(member);
      const unavailable =
        'This password was set before passwords could be shown, or in another browser. Set a new one with Edit in the list, and it will show here from then on.';
      setState(password === null ? { kind: 'unavailable', message: unavailable } : { kind: 'shown', password });
      if (password !== null) setViewedAt(new Date().toISOString());
    } catch (error) {
      logger.warn('Password could not be revealed.', { error });
      setState({ kind: 'unavailable', message: messageOf(error, 'The password could not be shown. Try again.') });
    }
  };

  const copy = async (password: string) => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
    } catch (error) {
      logger.warn('Copy to clipboard failed.', { error });
    }
  };

  const shown = state.kind === 'shown';

  return (
    <span className="tx-staff-details__secret">
      <span className="tx-staff-details__inline">
        <code className="tx-staff-details__password" aria-live="polite">
          {shown ? state.password : '••••••••••'}
        </code>
        {shown ? (
          <>
            <button type="button" className="tx-staff-details__link" onClick={() => void copy(state.password)}>
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button type="button" className="tx-staff-details__link" onClick={() => setState({ kind: 'hidden' })}>
              Hide
            </button>
          </>
        ) : (
          <button type="button" className="tx-staff-details__link" disabled={state.kind === 'loading'} onClick={() => void show()}>
            {state.kind === 'loading' ? 'Showing…' : 'Show'}
          </button>
        )}
      </span>
      {shown ? <span className="tx-staff-details__muted">Hides automatically in 30 seconds. Share it with them privately.</span> : null}
      {state.kind === 'unavailable' ? <span className="tx-staff-details__warning">{state.message}</span> : null}
      {viewedAt ? <span className="tx-staff-details__muted">Last viewed {formatDateTime(viewedAt)}</span> : null}
    </span>
  );
}
