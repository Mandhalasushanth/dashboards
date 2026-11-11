import { describe, expect, it } from 'vitest';
import {
  MAX_MESSAGE_LENGTH,
  parseContact,
  parseContactList,
  parseMessageList,
  validateMessageBody
} from '@/modules/admin/validation/communicationSchema';

const contact = {
  id: 11,
  name: 'Priya Sharma',
  role: 'CA_MANAGER',
  email: 'priya@taxedge.in',
  unreadCount: 2,
  lastMessage: { body: 'Done', sentAt: '2026-10-13T09:00:00Z', fromMe: false }
};

describe('parseContact', () => {
  it('accepts a staff contact and normalises the id', () => {
    expect(parseContact(contact)).toEqual({ ...contact, id: '11' });
  });

  it('accepts the administrator and customers as contacts but rejects unknown roles', () => {
    expect(parseContact({ ...contact, role: 'ADMIN' })?.role).toBe('ADMIN');
    expect(parseContact({ ...contact, role: 'CUSTOMER' })?.role).toBe('CUSTOMER');
    expect(parseContact({ ...contact, role: 'HACKER' })).toBeNull();
  });

  it('reads "sent by me" from fromMe, falling back to the original fromAdmin field', () => {
    expect(parseContact({ ...contact, lastMessage: { body: 'x', sentAt: '2026-10-13T09:00:00Z', fromAdmin: true } })?.lastMessage?.fromMe).toBe(true);
    expect(parseContact({ ...contact, lastMessage: { body: 'x', sentAt: '2026-10-13T09:00:00Z', fromMe: false, fromAdmin: true } })?.lastMessage?.fromMe).toBe(false);
  });

  it('cleans up bad counts and previews', () => {
    const parsed = parseContact({ ...contact, unreadCount: -3, lastMessage: { body: '', sentAt: 'x' } });
    expect(parsed?.unreadCount).toBe(0);
    expect(parsed?.lastMessage).toBeNull();
  });
});

describe('lists', () => {
  it('orders contacts by latest message, then alphabetically', () => {
    const list = parseContactList([
      { ...contact, id: 'a', name: 'Zara', lastMessage: null },
      { ...contact, id: 'b', name: 'Amit', lastMessage: null },
      { ...contact, id: 'c', lastMessage: { body: 'hi', sentAt: '2026-10-13T10:00:00Z', fromAdmin: true } }
    ]);
    expect(list.map((item) => item.id)).toEqual(['c', 'b', 'a']);
  });

  it('orders messages oldest first and drops invalid ones', () => {
    const list = parseMessageList({
      items: [
        { id: 2, body: 'second', sentAt: '2026-10-13T10:00:00Z', fromAdmin: true, read: true },
        { id: 1, body: 'first', sentAt: '2026-10-13T09:00:00Z', fromAdmin: false },
        { id: 3, body: '   ', sentAt: '2026-10-13T11:00:00Z' }
      ]
    });
    expect(list.map((message) => message.body)).toEqual(['first', 'second']);
  });
});

describe('validateMessageBody', () => {
  it('blocks blank and over-long messages', () => {
    expect(validateMessageBody('   \n ')).toMatch(/Type a message/);
    expect(validateMessageBody('x'.repeat(MAX_MESSAGE_LENGTH + 1))).toMatch(/at most 1000/);
    expect(validateMessageBody('  Please review the GST file.  ')).toBeNull();
  });
});
