import { useState } from 'react';
import {
  Button,
  DeferredContent,
  EmptyState,
  Icon,
  InlineAlert,
  KpiCard,
  KpiGrid,
  LoadingSpinner,
  useDocumentTitle
} from '@/shared';
import { useStaffDirectory } from '../../hooks/useStaffDirectory';
import { TIER_LABELS, type StaffDomainFilter, type StaffMember, type StaffStatusFilter, type StaffTier } from '../../shared/staff.types';
import { StaffDetails } from './StaffDetails';
import { StaffForm } from './StaffForm';
import { StaffTable } from './StaffTable';
import './StaffDirectory.css';

const DOMAIN_OPTIONS: readonly { value: StaffDomainFilter; label: string }[] = [
  { value: 'ALL', label: 'All domains' },
  { value: 'CA', label: 'CA services' },
  { value: 'LOAN', label: 'Loan services' }
];

const STATUS_OPTIONS: readonly { value: StaffStatusFilter; label: string }[] = [
  { value: 'ALL', label: 'Any status' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' }
];

export interface StaffDirectoryProps {
  readonly tier: StaffTier;
  readonly title: string;
}

/** Shared admin directory for managers or agents: summary, filters, table and provisioning form. */
export function StaffDirectory({ tier, title }: StaffDirectoryProps) {
  useDocumentTitle(title);
  const staff = useStaffDirectory(tier);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<StaffMember | null>(null);
  const [viewing, setViewing] = useState<StaffMember | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const labels = TIER_LABELS[tier];

  const openEditor = (member: StaffMember) => {
    setAdding(false);
    setViewing(null);
    setNotice(null);
    setEditing(member);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (staff.status === 'loading') {
    return (
      <DeferredContent>
        <div className="tx-staff-dir__state">
          <LoadingSpinner size="lg" label={`Loading ${labels.plural}`} />
        </div>
      </DeferredContent>
    );
  }

  if (staff.status === 'error') {
    return (
      <div className="tx-staff-dir__state" role="alert">
        <p>{staff.error}</p>
        <Button variant="secondary" iconName="rotate-ccw" onClick={staff.reload}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="tx-staff-dir">
      <KpiGrid>
        <KpiCard label={`Total ${labels.plural}`} value={String(staff.summary.total)} iconName="users" />
        <KpiCard label="Active" value={String(staff.summary.active)} iconName="user-check" tone="success" />
        <KpiCard label="CA / Loan" value={`${staff.summary.ca} / ${staff.summary.loan}`} iconName="briefcase" />
        <KpiCard label="Open cases" value={String(staff.summary.openCases)} iconName="list-checks" tone="orange" />
      </KpiGrid>

      <div className="tx-staff-dir__toolbar">
        <label className="tx-staff-dir__search">
          <Icon name="search" size="sm" />
          <span className="tx-sr-only">Search {labels.plural}</span>
          <input
            type="search"
            placeholder="Search name, email or ID"
            maxLength={60}
            value={staff.search}
            onChange={(event) => staff.setSearch(event.target.value.replace(/[<>"'`]/g, '').slice(0, 60))}
          />
        </label>
        <select aria-label="Domain" className="tx-staff-dir__select" value={staff.domain} onChange={(event) => staff.setDomain(event.target.value as StaffDomainFilter)}>
          {DOMAIN_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select aria-label="Status" className="tx-staff-dir__select" value={staff.statusFilter} onChange={(event) => staff.setStatusFilter(event.target.value as StaffStatusFilter)}>
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {adding || editing ? null : (
          <Button iconName="plus" onClick={() => { setAdding(true); setViewing(null); setNotice(null); }}>
            Add {labels.singular}
          </Button>
        )}
      </div>

      {notice ? <InlineAlert tone="info">{notice}</InlineAlert> : null}
      {staff.error ? <InlineAlert tone="error">{staff.error}</InlineAlert> : null}

      {adding ? (
        <StaffForm
          tier={tier}
          managers={staff.managers}
          existingUsernames={staff.members.map((member) => member.username)}
          onSubmit={staff.create}
          onCancel={() => setAdding(false)}
          onSaved={(name) => {
            setAdding(false);
            setNotice(`${name} can now sign in with their email and the password you set.`);
          }}
        />
      ) : null}

      {editing ? (
        <StaffForm
          key={editing.id}
          tier={tier}
          member={editing}
          managers={staff.managers}
          existingUsernames={staff.members.map((member) => member.username)}
          onSubmit={(input) => staff.update(editing.id, input)}
          onCancel={() => setEditing(null)}
          onSaved={(name, passwordReset) => {
            setEditing(null);
            setNotice(passwordReset ? `${name}'s details and password were updated. They sign in with the new password from now on.` : `${name}'s details were updated.`);
          }}
        />
      ) : null}

      {viewing && !editing ? (
        <StaffDetails
          key={viewing.id}
          member={staff.members.find((member) => member.id === viewing.id) ?? viewing}
          onClose={() => setViewing(null)}
        />
      ) : null}

      {staff.visible.length > 0 ? (
        <StaffTable
          tier={tier}
          members={staff.visible}
          pendingIds={staff.pendingIds}
          onDelete={(member) => {
            if (window.confirm(`Delete ${member.fullName}'s account? They will no longer be able to sign in.`)) void staff.remove(member);
          }}
          onEdit={openEditor}
          onView={(member) => {
            setAdding(false);
            setEditing(null);
            setNotice(null);
            setViewing(member);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      ) : (
        <div className="tx-staff-dir__empty">
          <EmptyState
            iconName="users"
            title={staff.members.length ? `No ${labels.plural} match these filters` : `No ${labels.plural} yet`}
            message={staff.members.length ? 'Clear the search or change the filters.' : `Add the first ${labels.singular} to give them sign-in access.`}
          />
        </div>
      )}
    </div>
  );
}
