import type { ReactNode } from 'react';
import { Icon, type IconName } from '../icons/Icon';
import './SummaryCard.css';

export interface SummaryCardProps {
  readonly iconName: IconName;
  readonly title: string;
  readonly children: ReactNode;
}

export function SummaryCard({ iconName, title, children }: SummaryCardProps) {
  return (
    <article className="tx-summary-card">
      <header className="tx-summary-card__header">
        <span className="tx-summary-card__icon">
          <Icon name={iconName} />
        </span>
        <h2 className="tx-summary-card__title">{title}</h2>
      </header>
      <div className="tx-summary-card__body">{children}</div>
    </article>
  );
}
