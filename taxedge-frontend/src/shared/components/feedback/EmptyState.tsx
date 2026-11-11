import { Icon, type IconName } from '../icons/Icon';
import './EmptyState.css';

export interface EmptyStateProps {
  readonly title: string;
  readonly message: string;
  readonly iconName?: IconName;
}

export function EmptyState({ title, message, iconName = 'inbox' }: EmptyStateProps) {
  return (
    <div className="tx-empty">
      <span className="tx-empty__icon">
        <Icon name={iconName} size="lg" />
      </span>
      <h2 className="tx-empty__title">{title}</h2>
      <p className="tx-empty__text">{message}</p>
    </div>
  );
}
