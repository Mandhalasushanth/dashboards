import { useCallback, useMemo, useState } from 'react';
import { Button, DeferredContent, Icon, LoadingSpinner, useDocumentTitle, type IconName } from '@/shared';
import { formatRupees, useWorkflowResource, workflowApi } from '@/modules/workflow';
import {
  buildFinancialSnapshot,
  currentPeriod,
  periodLabel,
  periodOptions,
  type FinancePeriod,
  type FinanceView,
  type RevenueFigure
} from '../../shared/financialDashboard';
import { FinancialTrendChart } from './FinancialTrendChart';
import { StaffRevenueTable } from './StaffRevenueTable';
import './FinancialDashboardSection.css';

/** Every application the admin can see; the server returns them all to the administrator. */
const ALL_CASES = { pageSize: 10_000 } as const;

const VIEWS: readonly { id: FinanceView; label: string }[] = [
  { id: 'MONTH', label: 'Monthly' },
  { id: 'YEAR', label: 'Yearly' }
];

interface CardSpec {
  readonly label: string;
  readonly figure: RevenueFigure;
  readonly iconName: IconName;
  readonly hint: string;
  readonly tone?: 'primary' | 'warning';
}

const payments = (figure: RevenueFigure, noun = 'payment') => `${figure.payments} ${noun}${figure.payments === 1 ? '' : 's'}`;

/**
 * Financial Dashboard: today's takings, the month's or year's revenue by service, money still owed and
 * revenue per staff member, all computed from the applications and refreshed whenever one changes.
 */
export default function FinancialDashboardSection() {
  useDocumentTitle('Financial Dashboard');
  const [period, setPeriod] = useState<FinancePeriod>(() => currentPeriod('MONTH'));
  const load = useCallback(() => workflowApi.listCases(ALL_CASES), []);
  const cases = useWorkflowResource(load, 'Financial figures are unavailable right now.');
  const snapshot = useMemo(() => (cases.data ? buildFinancialSnapshot(cases.data.items, period) : null), [cases.data, period]);
  const options = useMemo(() => periodOptions(period.view), [period.view]);

  if (cases.status === 'loading' && !snapshot) {
    return (
      <DeferredContent>
        <div className="tx-fin__state">
          <LoadingSpinner size="lg" label="Loading the financial dashboard" />
        </div>
      </DeferredContent>
    );
  }

  if (!snapshot) {
    return (
      <div className="tx-fin__state" role="alert">
        <p>{cases.error ?? 'Financial figures are unavailable right now.'}</p>
        <Button variant="secondary" iconName="rotate-ccw" onClick={() => void cases.reload()}>
          Try again
        </Button>
      </div>
    );
  }

  const isMonth = period.view === 'MONTH';
  const change = snapshot.changePercent;
  const changeText = change === null ? `No payments in the previous ${isMonth ? 'month' : 'year'}` : `${change >= 0 ? '▲' : '▼'} ${Math.abs(change)}% vs previous ${isMonth ? 'month' : 'year'}`;

  const cards: readonly CardSpec[] = [
    { label: "Today's Revenue", figure: snapshot.today, iconName: 'clock', hint: payments(snapshot.today) },
    { label: isMonth ? 'Monthly Revenue' : 'Yearly Revenue', figure: snapshot.period, iconName: 'trending-up', hint: changeText, tone: 'primary' },
    { label: 'GST Revenue', figure: snapshot.gst, iconName: 'receipt', hint: payments(snapshot.gst, 'paid application') },
    { label: 'ITR Revenue', figure: snapshot.itr, iconName: 'calculator', hint: payments(snapshot.itr, 'paid application') },
    { label: 'Loan Processing Revenue', figure: snapshot.loan, iconName: 'landmark', hint: payments(snapshot.loan, 'paid application') },
    { label: 'Pending Payments', figure: snapshot.pending, iconName: 'credit-card', hint: `${payments(snapshot.pending, 'application')} awaiting payment`, tone: 'warning' }
  ];

  return (
    <div className="tx-fin">
      <div className="tx-fin__toolbar">
        <div className="tx-fin__views" role="tablist" aria-label="Report period">
          {VIEWS.map((view) => (
            <button
              key={view.id}
              type="button"
              role="tab"
              aria-selected={period.view === view.id}
              className={`tx-fin__view ${period.view === view.id ? 'tx-fin__view--active' : ''}`}
              onClick={() => setPeriod(currentPeriod(view.id))}
            >
              {view.label}
            </button>
          ))}
        </div>
        <label className="tx-fin__picker">
          <Icon name="calendar" size="sm" />
          <span className="tx-sr-only">{isMonth ? 'Month' : 'Financial year'}</span>
          <select value={period.key} onChange={(event) => setPeriod({ view: period.view, key: event.target.value })}>
            {options.map((option) => (
              <option key={option.key} value={option.key}>
                {periodLabel(option)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="tx-fin__cards">
        {cards.map((card) => (
          <article key={card.label} className={`tx-fin__card ${card.tone ? `tx-fin__card--${card.tone}` : ''}`}>
            <span className="tx-fin__card-icon" aria-hidden="true">
              <Icon name={card.iconName} size="sm" />
            </span>
            <span className="tx-fin__card-label">{card.label}</span>
            <strong className="tx-fin__card-value">{formatRupees(card.figure.amount)}</strong>
            <span className="tx-fin__card-hint">{card.hint}</span>
          </article>
        ))}
      </div>

      {snapshot.other.amount > 0 ? (
        <p className="tx-fin__note">
          Also collected in {snapshot.periodLabel}: {formatRupees(snapshot.other.amount)} from Incorporation and Insurance ({payments(snapshot.other, 'application')}), included in the {isMonth ? 'monthly' : 'yearly'} total.
        </p>
      ) : null}

      <FinancialTrendChart title={`Revenue collected · ${isMonth ? 'per day' : 'per month'} · ${snapshot.periodLabel}`} buckets={snapshot.trend} />

      <StaffRevenueTable periodLabel={snapshot.periodLabel} agents={snapshot.agents} managers={snapshot.managers} />
    </div>
  );
}
