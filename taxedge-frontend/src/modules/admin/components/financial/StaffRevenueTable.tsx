import { useState } from 'react';
import { formatRupees } from '@/modules/workflow';
import type { StaffRevenueRow } from '../../shared/financialDashboard';
import './StaffRevenueTable.css';

export interface StaffRevenueTableProps {
  readonly periodLabel: string;
  readonly agents: readonly StaffRevenueRow[];
  readonly managers: readonly StaffRevenueRow[];
}

type StaffTab = 'agents' | 'managers';

const TABS: readonly { id: StaffTab; label: string }[] = [
  { id: 'agents', label: 'By agent' },
  { id: 'managers', label: 'By manager' }
];

/** Revenue collected on the applications each agent worked on, or each manager handled, in the period. */
export function StaffRevenueTable({ periodLabel, agents, managers }: StaffRevenueTableProps) {
  const [tab, setTab] = useState<StaffTab>('agents');
  const rows = tab === 'agents' ? agents : managers;

  return (
    <section className="tx-staff-rev" aria-labelledby="tx-staff-rev-title">
      <header className="tx-staff-rev__head">
        <div>
          <h2 id="tx-staff-rev-title" className="tx-staff-rev__title">
            Staff-wise Revenue
          </h2>
          <p className="tx-staff-rev__hint">Fees paid in {periodLabel}, credited to the people who handled each application.</p>
        </div>
        <div className="tx-staff-rev__tabs" role="tablist" aria-label="Group revenue by">
          {TABS.map((entry) => (
            <button
              key={entry.id}
              type="button"
              role="tab"
              aria-selected={tab === entry.id}
              className={`tx-staff-rev__tab ${tab === entry.id ? 'tx-staff-rev__tab--active' : ''}`}
              onClick={() => setTab(entry.id)}
            >
              {entry.label}
            </button>
          ))}
        </div>
      </header>

      {rows.length === 0 ? (
        <p className="tx-staff-rev__empty">No payments in {periodLabel} yet. Revenue appears here as soon as a customer pays.</p>
      ) : (
        <table className="tx-staff-rev__table">
          <thead>
            <tr>
              <th scope="col">{tab === 'agents' ? 'Agent' : 'Manager'}</th>
              <th scope="col">Team</th>
              <th scope="col" className="tx-staff-rev__num">Paid applications</th>
              <th scope="col" className="tx-staff-rev__num">Revenue</th>
              <th scope="col">Share</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <th scope="row" data-label={tab === 'agents' ? 'Agent' : 'Manager'} className={row.id === 'UNASSIGNED' ? 'tx-staff-rev__muted' : ''}>
                  {row.name}
                </th>
                <td data-label="Team">{row.team}</td>
                <td data-label="Paid applications" className="tx-staff-rev__num">
                  {row.applications}
                </td>
                <td data-label="Revenue" className="tx-staff-rev__num tx-staff-rev__money">
                  {formatRupees(row.collected)}
                </td>
                <td data-label="Share">
                  <span className="tx-staff-rev__share">
                    <span className="tx-staff-rev__meter" aria-hidden="true">
                      <span style={{ width: `${row.sharePercent}%` }} />
                    </span>
                    {row.sharePercent}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
