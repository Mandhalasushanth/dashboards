import { describe, expect, it } from 'vitest';
import {
  hasFieldErrors,
  normalizeCredentials,
  validateLoginField,
  validateLoginForm
} from '@/modules/authentication/validation/loginSchema';

describe('loginSchema', () => {
  it('requires both fields', () => {
    const errors = validateLoginForm({ username: '', password: '' });
    expect(errors.username).toBe('Username is required.');
    expect(errors.password).toBe('Password is required.');
    expect(hasFieldErrors(errors)).toBe(true);
  });

  it('rejects whitespace-only and malformed usernames', () => {
    expect(validateLoginField('username', '   ')).toBe('Username is required.');
    expect(validateLoginField('username', 'ab')).toMatch(/at least 3/);
    expect(validateLoginField('username', 'bad name')).toMatch(/may only contain/);
    expect(validateLoginField('username', '.leadingdot')).toMatch(/may only contain/);
  });

  it('accepts emails ending in admin@gmail.com, manager@gmail.com or agent@gmail.com', () => {
    expect(validateLoginField('username', 'admin@gmail.com')).toBeNull();
    expect(validateLoginField('username', 'camanager@gmail.com')).toBeNull();
    expect(validateLoginField('username', '  loanagent@gmail.com  ')).toBeNull();
  });

  it('rejects emails without one of the three endings', () => {
    expect(validateLoginField('username', 'priya@taxedge.in')).toMatch(/admin@gmail.com, manager@gmail.com or agent@gmail.com/);
    expect(validateLoginField('username', 'ca.manager.demo')).toMatch(/admin@gmail.com/);
  });

  it('enforces password length without trimming', () => {
    expect(validateLoginField('password', 'short')).toMatch(/at least 8/);
    expect(validateLoginField('password', 'x'.repeat(129))).toMatch(/at most 128/);
    expect(validateLoginField('password', ' spaced pass ')).toBeNull();
  });

  it('trims the username but never changes its letters, and sends the password as typed', () => {
    expect(normalizeCredentials({ username: '  admin.demo ', password: ' Secret#1 ' })).toEqual({
      username: 'admin.demo',
      password: ' Secret#1 '
    });
  });

  it('rejects capital letters in the username instead of quietly lower-casing them', () => {
    expect(validateLoginField('username', 'Admin@gmail.com')).toMatch(/small letters only/);
    expect(validateLoginField('username', 'sushanthADMIN@gmail.com')).toMatch(/small letters only/);
    expect(validateLoginField('username', 'sushanthadmin@gmail.com')).toBeNull();
  });
});
