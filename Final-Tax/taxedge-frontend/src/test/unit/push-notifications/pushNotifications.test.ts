import { describe, expect, it } from 'vitest';
import { recipientsFromCases } from '@/modules/push-notifications/shared/recipientSources';
import { validatePushDraft } from '@/modules/push-notifications/validation/pushNotificationValidation';

const client = (name: string, pan: string) => ({ name, email: `${name.toLowerCase()}@example.com`, mobile: '9876543210', pan });

describe('validatePushDraft', () => {
  const valid = {
    title: 'GST return due',
    message: 'Your GSTR-3B is due on the 20th.',
    category: 'REMINDER' as const,
    audience: 'ALL_CUSTOMERS' as const,
    recipientIds: []
  };

  it('accepts a complete draft for all customers', () => {
    expect(validatePushDraft(valid)).toEqual({});
  });

  it('requires title, message and type', () => {
    const errors = validatePushDraft({ ...valid, title: ' ', message: '', category: '' });
    expect(errors.title).toMatch(/required/);
    expect(errors.message).toMatch(/required/);
    expect(errors.category).toMatch(/type/);
  });

  it('requires at least one customer when sending to selected customers', () => {
    expect(validatePushDraft({ ...valid, audience: 'SELECTED_CUSTOMERS' }).recipientIds).toMatch(/at least one/);
  });

  it('limits the title length', () => {
    expect(validatePushDraft({ ...valid, title: 'x'.repeat(66) }).title).toMatch(/at most 65/);
  });
});

describe('recipientsFromCases', () => {
  it('lists each customer once with all their application numbers, A to Z', () => {
    const recipients = recipientsFromCases([
      { referenceNumber: 'CA-2', client: client('Ravi', 'ABCPR1234K') },
      { referenceNumber: 'CA-1', client: client('Asha', 'ABCPA1234K') },
      { referenceNumber: 'CA-3', client: client('Ravi', 'ABCPR1234K') }
    ]);
    expect(recipients.map((recipient) => recipient.name)).toEqual(['Asha', 'Ravi']);
    expect(recipients[1]?.references).toEqual(['CA-2', 'CA-3']);
  });
});
