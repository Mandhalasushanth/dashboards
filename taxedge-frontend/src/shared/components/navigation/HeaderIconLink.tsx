import { Link } from 'react-router-dom';
import { Icon, type IconName } from '../icons/Icon';
import './HeaderIconLink.css';

export interface HeaderIconLinkProps {
  readonly to: string;
  readonly iconName: IconName;
  readonly label: string;
  /** Unread/pending count; the badge is hidden when zero or absent. */
  readonly count?: number;
}

export function HeaderIconLink({ to, iconName, label, count }: HeaderIconLinkProps) {
  const accessibleLabel = count ? `${label} (${count} new)` : label;

  return (
    <Link to={to} className="tx-header-link" aria-label={accessibleLabel} title={label}>
      <Icon name={iconName} />
      {count ? (
        <span className="tx-header-link__badge" aria-hidden="true">
          {count > 99 ? '99+' : count}
        </span>
      ) : null}
    </Link>
  );
}
