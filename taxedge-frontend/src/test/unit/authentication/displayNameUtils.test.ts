import { describe, expect, it } from 'vitest';
import { deriveDisplayNameFromUsername } from '@/modules/authentication/shared/utils/displayNameUtils';

describe('deriveDisplayNameFromUsername', () => {
  it('cuts the email domain and capitalizes simple names', () => {
    expect(deriveDisplayNameFromUsername('admin@gmail.com')).toBe('Admin');
    expect(deriveDisplayNameFromUsername('sushanth@taxedge.com')).toBe('Sushanth');
  });

  it('handles dot-separated and underscore-separated emails', () => {
    expect(deriveDisplayNameFromUsername('aarav.mehta@gmail.com')).toBe('Aarav Mehta');
    expect(deriveDisplayNameFromUsername('priya_sharma@taxedge.com')).toBe('Priya Sharma');
    expect(deriveDisplayNameFromUsername('john-doe@company.org')).toBe('John Doe');
  });

  it('handles usernames without @ domain', () => {
    expect(deriveDisplayNameFromUsername('admin')).toBe('Admin');
    expect(deriveDisplayNameFromUsername('ca.manager')).toBe('Ca Manager');
  });

  it('returns empty string for empty input', () => {
    expect(deriveDisplayNameFromUsername('')).toBe('');
  });
});
