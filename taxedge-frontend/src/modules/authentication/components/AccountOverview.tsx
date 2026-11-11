import { environment } from '@/core/config/environment';
import { formatDateTime } from '@/core/utils/dateUtils';
import { humanizeConstant } from '@/core/utils/stringUtils';
import { PERMISSION_LABELS } from '../shared/config/rolePermissions';
import { DOMAIN_LABELS, TIER_LABELS } from '../shared/config/roleRoutes';
import { getRoleProfile } from '../services/accessControlService';
import { SummaryCard } from '@/shared';
import type { SessionUser } from '../shared/types/session.types';
import './AccountOverview.css';

export interface AccountOverviewProps {
  readonly user: SessionUser;
}

interface DetailRow {
  readonly label: string;
  readonly value: string;
}

function buildIdentityRows(user: SessionUser): DetailRow[] {
  const profile = getRoleProfile(user.role);
  return [
    { label: 'Name', value: user.displayName },
    { label: 'Username', value: user.username },
    { label: 'Role', value: profile.label },
    { label: 'Service area', value: DOMAIN_LABELS[profile.domain] },
    { label: 'Level', value: TIER_LABELS[profile.tier] }
  ];
}

function buildSessionRows(user: SessionUser): DetailRow[] {
  return [
    { label: 'Signed in', value: formatDateTime(user.lastLoginAt) },
    { label: 'Idle sign-out', value: `${Math.round(environment.sessionIdleTimeoutMs / 60_000)} minutes` }
  ];
}

function renderRow(row: DetailRow) {
  return (
    <div key={row.label} className="tx-account-overview__row">
      <dt>{row.label}</dt>
      <dd>{row.value}</dd>
    </div>
  );
}

function renderPermission(permission: string) {
  return (
    <li key={permission} className="tx-account-overview__chip">
      {PERMISSION_LABELS[permission] ?? humanizeConstant(permission)}
    </li>
  );
}

/** Account, session and server-granted access for the signed-in user. */
export function AccountOverview({ user }: AccountOverviewProps) {
  return (
    <div className="tx-account-overview">
      <SummaryCard iconName="user" title="Your account">
        <dl className="tx-account-overview__list">{buildIdentityRows(user).map(renderRow)}</dl>
      </SummaryCard>
      <SummaryCard iconName="clock" title="Session">
        <dl className="tx-account-overview__list">{buildSessionRows(user).map(renderRow)}</dl>
      </SummaryCard>
      <SummaryCard iconName="shield-check" title="Access granted">
        {user.permissions.length > 0 ? (
          <ul className="tx-account-overview__chips">{user.permissions.map(renderPermission)}</ul>
        ) : (
          <p className="tx-account-overview__empty">No permissions have been granted to this account yet.</p>
        )}
      </SummaryCard>
    </div>
  );
}
