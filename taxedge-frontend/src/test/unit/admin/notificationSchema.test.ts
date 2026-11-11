import { describe, expect, it } from 'vitest';
import { formatRelativeTime, getDayGroup } from '@/core/utils/dateUtils';
import { parseNotification, parseNotificationList } from '@/modules/admin/validation/notificationSchema';

const valid = {
  id: 7,
  category: 'PAYMENT',
  title: 'Payment received',
  message: 'Invoice paid.',
  createdAt: '2026-10-13T09:00:00Z',
  read: false,
  link: '/admin/revenue'
};

describe('parseNotification', () => {
  it('accepts a valid notification and normalises the id', () => {
    expect(parseNotification(valid)).toEqual({ ...valid, id: '7' });
  });

  it('skips entries without an id, title or valid date', () => {
    expect(parseNotification({ ...valid, id: '' })).toBeNull();
    expect(parseNotification({ ...valid, title: '  ' })).toBeNull();
    expect(parseNotification({ ...valid, createdAt: 'yesterday' })).toBeNull();
    expect(parseNotification('nope')).toBeNull();
  });

  it('falls back to SYSTEM for unknown categories and drops off-site links', () => {
    const parsed = parseNotification({ ...valid, category: 'MARKETING', link: 'https://evil.example' });
    expect(parsed?.category).toBe('SYSTEM');
    expect(parsed?.link).toBeNull();
    expect(parseNotification({ ...valid, link: '//evil.example' })?.link).toBeNull();
  });

  it('treats anything but true as unread', () => {
    expect(parseNotification({ ...valid, read: 'yes' })?.read).toBe(false);
  });
});

describe('parseNotificationList', () => {
  it('accepts arrays or { items }, drops invalid entries and sorts newest first', () => {
    const older = { ...valid, id: 'a', createdAt: '2026-10-10T09:00:00Z' };
    const newer = { ...valid, id: 'b', createdAt: '2026-10-12T09:00:00Z' };
    expect(parseNotificationList([older, null, newer]).map((item) => item.id)).toEqual(['b', 'a']);
    expect(parseNotificationList({ items: [older] })).toHaveLength(1);
    expect(parseNotificationList({})).toEqual([]);
  });
});

describe('date helpers', () => {
  const now = new Date(2026, 9, 13, 15, 0, 0);

  it('groups by calendar day', () => {
    expect(getDayGroup(new Date(2026, 9, 13, 0, 5).toISOString(), now)).toBe('Today');
    expect(getDayGroup(new Date(2026, 9, 12, 23, 50).toISOString(), now)).toBe('Yesterday');
    expect(getDayGroup(new Date(2026, 9, 10, 12, 0).toISOString(), now)).toBe('Earlier');
  });

  it('formats recent times relatively', () => {
    expect(formatRelativeTime(new Date(now.getTime() - 20_000).toISOString(), now.getTime())).toBe('just now');
    expect(formatRelativeTime(new Date(now.getTime() - 5 * 60_000).toISOString(), now.getTime())).toMatch(/5 minutes ago/);
    expect(formatRelativeTime(new Date(now.getTime() - 3 * 3_600_000).toISOString(), now.getTime())).toMatch(/3 hours ago/);
  });
});
