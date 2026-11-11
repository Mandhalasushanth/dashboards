import { toInitials } from '@/core/utils/stringUtils';
import type { ContactRole } from '../../shared/communication.types';
import { STAFF_ROLE_THEME } from './config/staffRoleTheme';
import './ContactAvatar.css';

export interface ContactAvatarProps {
  readonly name: string;
  readonly role: ContactRole;
  readonly size?: 'md' | 'lg';
}

/** Initials on a role-coloured circle, so each staff group is recognisable at a glance. */
export function ContactAvatar({ name, role, size = 'md' }: ContactAvatarProps) {
  return (
    <span className={`tx-contact-avatar tx-contact-avatar--${STAFF_ROLE_THEME[role].tone} tx-contact-avatar--${size}`} aria-hidden="true">
      {toInitials(name)}
    </span>
  );
}
