import './RoleBadge.css';

export interface RoleBadgeProps {
  /** e.g. "Chartered Accountancy (CA)" */
  readonly areaLabel: string;
  /** e.g. "Manager" */
  readonly levelLabel: string;
}

/** Pill showing a staff member's service area and level, for use on dark headers. */
export function RoleBadge({ areaLabel, levelLabel }: RoleBadgeProps) {
  return (
    <span className="tx-role-badge">
      <span>{areaLabel}</span>
      <span className="tx-role-badge__level">{levelLabel}</span>
    </span>
  );
}
