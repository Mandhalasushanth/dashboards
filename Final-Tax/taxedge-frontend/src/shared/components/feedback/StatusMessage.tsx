import { Link } from 'react-router-dom';
import { Icon, type IconName } from '../icons/Icon';
import { GeometricBackdrop } from '../layout/GeometricBackdrop';
import './StatusMessage.css';

export interface StatusMessageProps {
  readonly iconName: IconName;
  readonly code?: string;
  readonly title: string;
  readonly description: string;
  readonly actionLabel: string;
  readonly actionTo: string;
}

/** Full-screen message for routing outcomes such as "not found" or "access denied". */
export function StatusMessage({ iconName, code, title, description, actionLabel, actionTo }: StatusMessageProps) {
  return (
    <GeometricBackdrop>
      <section className="tx-status" aria-labelledby="tx-status-title">
        <span className="tx-status__badge">
          <Icon name={iconName} size="lg" />
        </span>
        {code ? <p className="tx-status__code">{code}</p> : null}
        <h1 id="tx-status-title" className="tx-status__title">
          {title}
        </h1>
        <p className="tx-status__description">{description}</p>
        <Link to={actionTo} replace className="tx-status__action">
          <Icon name="chevron-left" size="sm" />
          <span>{actionLabel}</span>
        </Link>
      </section>
    </GeometricBackdrop>
  );
}
