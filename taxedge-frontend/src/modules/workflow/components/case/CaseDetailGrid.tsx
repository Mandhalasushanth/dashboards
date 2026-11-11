import type { ReactNode } from 'react';
import './CaseDetailGrid.css';

export interface DetailEntry {
  readonly label: string;
  readonly value: ReactNode;
}

/** Titled section of label/value pairs; two columns on wide screens, one on phones. */
export function CaseDetailGrid({ title, entries }: { readonly title: string; readonly entries: readonly DetailEntry[] }) {
  return (
    <section className="tx-case-section">
      <h3 className="tx-case-section__title">{title}</h3>
      <dl className="tx-case-grid">
        {entries.map((entry) => (
          <div key={entry.label} className="tx-case-grid__field">
            <dt className="tx-case-grid__label">{entry.label}</dt>
            <dd className="tx-case-grid__value">{entry.value || '—'}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
