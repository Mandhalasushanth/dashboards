import { formatRelativeTime } from '@/core/utils/dateUtils';
import { ROLE_PROFILES } from '@/modules/authentication';
import { StatusBadge, type BadgeTone } from '@/shared';
import type { StaffMember, StaffTier } from '../../shared/staff.types';
import './StaffTable.css';

export interface StaffTableProps {
  readonly tier: StaffTier;
  readonly members: readonly StaffMember[];
  readonly pendingIds: ReadonlySet<string>;
  /** Leave out to hide Activate/Deactivate (manager accounts have no inactive state). */
  readonly onToggleActive?: (member: StaffMember) => void;
  /** When given, each row gets a Delete button. */
  readonly onDelete?: (member: StaffMember) => void;
  readonly onEdit: (member: StaffMember) => void;
  readonly onView: (member: StaffMember) => void;
}

function slaTone(member: StaffMember): BadgeTone {
  if (member.completedThisMonth === 0) return 'neutral';
  if (member.slaPercent >= 90) return 'success';
  return member.slaPercent >= 80 ? 'warning' : 'danger';
}

export function StaffTable({ tier, members, pendingIds, onToggleActive, onDelete, onEdit, onView }: StaffTableProps) {
  return (
    <div className="tx-staff-table">
      <table>
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Role</th>
            {tier === 'AGENT' ? <th scope="col">Reports to</th> : null}
            <th scope="col" className="tx-staff-table__num">Open cases</th>
            <th scope="col" className="tx-staff-table__num">Done this month</th>
            <th scope="col" className="tx-staff-table__num">SLA met</th>
            <th scope="col">Last sign-in</th>
            <th scope="col">Status</th>
            <th scope="col"><span className="tx-sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.id} className={member.active ? '' : 'tx-staff-table__row--inactive'}>
              <td data-label="Name">
                <span className="tx-staff-table__name">{member.fullName}</span>
                <span className="tx-staff-table__meta">
                  {member.username}
                </span>
              </td>
              <td data-label="Role">{ROLE_PROFILES[member.role].label}</td>
              {tier === 'AGENT' ? <td data-label="Reports to">{member.managerName ?? 'Unassigned'}</td> : null}
              <td className="tx-staff-table__num" data-label="Open cases">{member.openCases}</td>
              <td className="tx-staff-table__num" data-label="Done this month">{member.completedThisMonth}</td>
              <td className="tx-staff-table__num" data-label="SLA met">
                <StatusBadge tone={slaTone(member)} label={member.completedThisMonth === 0 ? '—' : `${member.slaPercent}%`} />
              </td>
              <td data-label="Last sign-in">{member.lastLoginAt ? formatRelativeTime(member.lastLoginAt) : 'Never signed in'}</td>
              <td data-label="Status">
                <StatusBadge tone={member.active ? 'success' : 'neutral'} label={member.active ? 'Active' : 'Inactive'} />
              </td>
              <td className="tx-staff-table__actions">
                <button type="button" className="tx-staff-table__toggle" onClick={() => onView(member)} aria-label={`View ${member.fullName}`}>
                  View
                </button>
                <button
                  type="button"
                  className="tx-staff-table__toggle"
                  disabled={pendingIds.has(member.id)}
                  onClick={() => onEdit(member)}
                  aria-label={`Edit ${member.fullName}`}
                >
                  Edit
                </button>
                {onToggleActive ? (
                  <button
                    type="button"
                    className={`tx-staff-table__toggle ${member.active ? 'tx-staff-table__toggle--danger' : ''}`}
                    disabled={pendingIds.has(member.id)}
                    onClick={() => onToggleActive(member)}
                    aria-label={`${member.active ? 'Deactivate' : 'Activate'} ${member.fullName}`}
                  >
                    {member.active ? 'Deactivate' : 'Activate'}
                  </button>
                ) : null}
                {onDelete ? (
                  <button
                    type="button"
                    className="tx-staff-table__toggle tx-staff-table__toggle--danger"
                    disabled={pendingIds.has(member.id)}
                    onClick={() => onDelete(member)}
                    aria-label={`Delete ${member.fullName}`}
                  >
                    Delete
                  </button>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
