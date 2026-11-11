import { useMemo, useState } from 'react';
import { Button, Icon, LoadingSpinner } from '@/shared';
import type { LoadStatus } from '../hooks/usePushNotifications';
import type { PushRecipient } from '../shared/pushNotification.types';
import './CustomerPicker.css';

export interface CustomerPickerProps {
  readonly recipients: readonly PushRecipient[];
  readonly status: LoadStatus;
  readonly selectedIds: readonly string[];
  readonly error?: string;
  readonly disabled?: boolean;
  readonly onToggle: (id: string) => void;
  readonly onSelectionChange: (ids: readonly string[]) => void;
  readonly onRetry: () => void;
}

function matches(recipient: PushRecipient, query: string): boolean {
  return [recipient.name, recipient.email, recipient.mobile, ...recipient.references].some((value) =>
    value.toLowerCase().includes(query)
  );
}

/** Searchable checklist of the customers a manager can notify. */
export function CustomerPicker({
  recipients,
  status,
  selectedIds,
  error,
  disabled,
  onToggle,
  onSelectionChange,
  onRetry
}: CustomerPickerProps) {
  const [search, setSearch] = useState('');
  const query = search.trim().toLowerCase();
  const visible = useMemo(() => (query ? recipients.filter((recipient) => matches(recipient, query)) : recipients), [recipients, query]);
  const visibleIds = visible.map((recipient) => recipient.id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));

  const toggleAllVisible = () =>
    onSelectionChange(
      allVisibleSelected
        ? selectedIds.filter((id) => !visibleIds.includes(id))
        : [...new Set([...selectedIds, ...visibleIds])]
    );

  if (status === 'loading') {
    return (
      <div className="tx-push-picker tx-push-picker--state">
        <LoadingSpinner label="Loading customers" />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="tx-push-picker tx-push-picker--state" role="alert">
        <p>Customers could not be loaded.</p>
        <Button variant="secondary" iconName="rotate-ccw" onClick={onRetry}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <fieldset className={`tx-push-picker${error ? ' tx-push-picker--invalid' : ''}`} aria-describedby={error ? 'tx-push-picker-error' : undefined}>
      <legend className="tx-push-picker__legend">
        Send to <span className="tx-push-picker__count">{selectedIds.length} selected</span>
      </legend>

      <div className="tx-push-picker__tools">
        <label className="tx-push-picker__search">
          <Icon name="search" size="sm" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, email, mobile or application number"
            aria-label="Search customers"
            disabled={disabled}
          />
        </label>
        <button type="button" className="tx-push-picker__all" onClick={toggleAllVisible} disabled={disabled || visible.length === 0}>
          {allVisibleSelected ? 'Clear shown' : `Select shown (${visible.length})`}
        </button>
      </div>

      {visible.length > 0 ? (
        <ul className="tx-push-picker__list">
          {visible.map((recipient) => {
            const checked = selectedIds.includes(recipient.id);
            return (
              <li key={recipient.id}>
                <label className={`tx-push-picker__item${checked ? ' tx-push-picker__item--checked' : ''}`}>
                  <input type="checkbox" checked={checked} onChange={() => onToggle(recipient.id)} disabled={disabled} />
                  <span className="tx-push-picker__person">
                    <span className="tx-push-picker__name">{recipient.name}</span>
                    <span className="tx-push-picker__meta">
                      {recipient.email || recipient.mobile}
                      {recipient.references.length > 0 ? ` · ${recipient.references.join(', ')}` : ''}
                    </span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="tx-push-picker__empty">
          {recipients.length === 0 ? 'No customers on your team’s applications yet.' : 'No customers match your search.'}
        </p>
      )}

      {error ? (
        <p id="tx-push-picker-error" className="tx-push-picker__error" role="alert">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
