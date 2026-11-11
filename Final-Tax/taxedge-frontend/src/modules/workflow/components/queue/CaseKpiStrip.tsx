import { Link } from 'react-router-dom';
import { Icon } from '@/shared';
import type { KpiDefinition } from '../../shared/workflowViews';
import type { CaseSummary } from '../../shared/workflow.types';
import './CaseKpiStrip.css';

export interface CaseKpiStripProps {
  readonly kpis: readonly KpiDefinition[];
  readonly summary: CaseSummary | null;
  /** In a queue, clicking a card filters it; on a dashboard each card links to its queue instead. */
  readonly onSelect?: (kpi: KpiDefinition) => void;
  readonly activeKey?: string | null;
}

function KpiBody({ kpi, value }: { readonly kpi: KpiDefinition; readonly value: string }) {
  return (
    <>
      <span className={`tx-case-kpi__icon tx-case-kpi__icon--${kpi.tone}`}>
        <Icon name={kpi.iconName} size="sm" />
      </span>
      <span className="tx-case-kpi__text">
        <span className="tx-case-kpi__label">{kpi.label}</span>
        <span className="tx-case-kpi__value">{value}</span>
      </span>
    </>
  );
}

/** Counts come from the server summary; "—" is shown until they arrive, never a placeholder number. */
export function CaseKpiStrip({ kpis, summary, onSelect, activeKey = null }: CaseKpiStripProps) {
  const renderKpi = (kpi: KpiDefinition) => {
    const value = summary ? summary[kpi.key].toLocaleString() : '—';
    const label = `${kpi.label}: ${value}`;
    const className = `tx-case-kpi tx-case-kpi--tone-${kpi.tone} ${activeKey === kpi.key ? 'tx-case-kpi--active' : ''}`.trim();
    if (kpi.to) {
      return (
        <Link key={kpi.key} to={kpi.to} className={className} aria-label={label}>
          <KpiBody kpi={kpi} value={value} />
        </Link>
      );
    }
    return onSelect && kpi.filter ? (
      <button key={kpi.key} type="button" className={className} onClick={() => onSelect(kpi)} aria-label={`${label}. Filter the list`} aria-pressed={activeKey === kpi.key}>
        <KpiBody kpi={kpi} value={value} />
      </button>
    ) : (
      <div key={kpi.key} className={`${className} tx-case-kpi--static`} aria-label={label}>
        <KpiBody kpi={kpi} value={value} />
      </div>
    );
  };

  // More than six cards would wrap as six and a few left over; four per row keeps the rows even.
  return <div className={kpis.length > 6 ? 'tx-case-kpis tx-case-kpis--even' : 'tx-case-kpis'}>{kpis.map(renderKpi)}</div>;
}
