import type { ReactNode } from 'react';
import { Icon, type IconName } from '../icons/Icon';
import './KpiCard.css';

export type KpiTone = 'default' | 'success' | 'danger' | 'orange';

export interface KpiCardProps {
  readonly label: string;
  readonly value: string;
  readonly iconName?: IconName;
  readonly tone?: KpiTone;
}

export function KpiCard({ label, value, iconName, tone = 'default' }: KpiCardProps) {
  return (
    <div className={`tx-kpi tx-kpi--${tone}`}>
      {iconName ? (
        <span className="tx-kpi__icon">
          <Icon name={iconName} size="sm" />
        </span>
      ) : null}
      <div>
        <p className="tx-kpi__label">{label}</p>
        <p className="tx-kpi__value">{value}</p>
      </div>
    </div>
  );
}

export function KpiGrid({ children }: { readonly children: ReactNode }) {
  return <div className="tx-kpi-grid">{children}</div>;
}
