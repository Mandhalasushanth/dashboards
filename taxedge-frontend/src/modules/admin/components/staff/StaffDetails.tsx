import { useEffect, useState, type ReactNode } from 'react';
import { formatDateTime, formatRelativeTime } from '@/core/utils/dateUtils';
import { logger } from '@/core/logging/logger';
import { ROLE_PROFILES } from '@/modules/authentication';
import { Button, StatusBadge } from '@/shared';
import { fetchStaff } from '../../api/adminStaffApi';
import { ROLE_DOMAIN, type StaffMember } from '../../shared/staff.types';
import { StaffPasswordReveal } from './StaffPasswordReveal';
import './StaffDetails.css';

export interface StaffDetailsProps {
  readonly member: StaffMember;
  readonly onClose: () => void;
}

const DOMAIN_LABELS = Object.freeze({ CA: 'CA services (GST, ITR, Incorporation)', LOAN: 'Loan services (Loans, Insurance)' });

/**
 * Read-only view of everything the administrator knows about one manager or agent, including the sign-in
 * password, which stays masked until the administrator chooses Show. Changes are made with Edit in the list.
 */
export function StaffDetails({ member, onClose }: StaffDetailsProps) {
  const isManager = member.role.endsWith('MANAGER');
  const [team, setTeam] = useState<readonly StaffMember[] | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isManager) return undefined;
    let current = true;
    fetchStaff('AGENT')
      .then((agents) => current && setTeam(agents.filter((agent) => agent.managerId === member.id)))
      .catch((error: unknown) => {
        logger.warn('Agents of this manager are unavailable.', { error });
        if (current) setTeam([]);
      });
    return () => {
      current = false;
    };
  }, [isManager, member.id]);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(member.username);
      setCopied(true);
    } catch (error) {
      logger.warn('Copy to clipboard failed.', { error });
    }
  };

  const fact = (label: string, value: ReactNode) => (
    <div className="tx-staff-details__fact">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );

  const teamValue = () => {
    if (team === null) return 'Loading…';
    return team.length ? team.map((agent) => agent.fullName).join(', ') : 'No agents report to this manager yet';
  };

  return (
    <section className="tx-staff-details" aria-label={`${member.fullName} details`}>
      <header className="tx-staff-details__head">
        <div>
          <h2 className="tx-staff-details__name">{member.fullName}</h2>
          <p className="tx-staff-details__role">
            {ROLE_PROFILES[member.role].label} · ID {member.id}
          </p>
        </div>
        <StatusBadge tone={member.active ? 'success' : 'neutral'} label={member.active ? 'Active' : 'Inactive'} />
      </header>

      <h3 className="tx-staff-details__group">Sign-in</h3>
      <dl className="tx-staff-details__grid">
        {fact(
          'Username (sign-in email)',
          <span className="tx-staff-details__inline">
            {member.username}
            <button type="button" className="tx-staff-details__link" onClick={() => void copyEmail()}>
              {copied ? 'Copied' : 'Copy'}
            </button>
          </span>
        )}
        {fact('Password', <StaffPasswordReveal member={member} />)}
        {fact('Last sign-in', member.lastLoginAt ? `${formatRelativeTime(member.lastLoginAt)} (${formatDateTime(member.lastLoginAt)})` : 'Never signed in')}
        {fact('Account created', formatDateTime(member.joinedAt))}
      </dl>

      <h3 className="tx-staff-details__group">Role & team</h3>
      <dl className="tx-staff-details__grid">
        {fact('Role', ROLE_PROFILES[member.role].label)}
        {fact('Domain', DOMAIN_LABELS[ROLE_DOMAIN[member.role]])}
        {isManager ? fact('Agents reporting to them', teamValue()) : fact('Reports to', member.managerName ?? 'Unassigned')}
      </dl>

      <h3 className="tx-staff-details__group">Work</h3>
      <dl className="tx-staff-details__grid">
        {fact('Open cases', member.openCases)}
        {fact('Done this month', member.completedThisMonth)}
        {fact('SLA met', member.completedThisMonth === 0 ? '—' : `${member.slaPercent}%`)}
      </dl>

      <div className="tx-staff-details__actions">
        <Button variant="secondary" iconName="x" onClick={onClose}>
          Close
        </Button>
      </div>
    </section>
  );
}
