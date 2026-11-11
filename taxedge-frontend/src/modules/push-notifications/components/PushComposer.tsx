import type { FormEvent } from 'react';
import { Button, Icon, InlineAlert, InputField, SelectField, TextAreaField } from '@/shared';
import type { PushNotificationsController } from '../hooks/usePushNotifications';
import {
  CATEGORIES_BY_MODE,
  DEFAULT_PLACEHOLDERS,
  PUSH_CATEGORIES,
  PUSH_LIMITS
} from '../shared/pushNotification.config';
import type { PushCategory } from '../shared/pushNotification.types';
import { CustomerPicker } from './CustomerPicker';
import { PushPhonePreview } from './PushPhonePreview';
import './PushComposer.css';

export interface PushComposerProps {
  readonly controller: PushNotificationsController;
}

/** The send form: type, title, message and audience, with a live phone preview beside it. */
export function PushComposer({ controller }: PushComposerProps) {
  const { draft, errors, mode, sending } = controller;
  const meta = draft.category ? PUSH_CATEGORIES[draft.category] : null;
  const categoryOptions = CATEGORIES_BY_MODE[mode].map((value) => ({ value, label: PUSH_CATEGORIES[value].label }));
  const countLabel = `${controller.recipientCount} customer${controller.recipientCount === 1 ? '' : 's'}`;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!sending) void controller.send();
  };

  return (
    <section className="tx-push-composer" aria-labelledby="tx-push-composer-title">
      <header className="tx-push-composer__header">
        <span className="tx-push-composer__icon">
          <Icon name="send" />
        </span>
        <div>
          <h2 id="tx-push-composer-title" className="tx-push-composer__title">
            Send push notification
          </h2>
          <p className="tx-push-composer__sub">
            {mode === 'ADMIN'
              ? 'Goes to every customer who uses the mobile app.'
              : 'Goes only to the customers you select from your team’s applications.'}
          </p>
        </div>
      </header>

      <div className="tx-push-composer__body">
        <form className="tx-push-composer__form" onSubmit={handleSubmit} noValidate>
          {controller.notice ? (
            <InlineAlert tone={controller.notice.tone}>{controller.notice.message}</InlineAlert>
          ) : null}

          <SelectField<PushCategory>
            id="tx-push-category"
            label="Notification type"
            value={draft.category}
            onChange={(value) => controller.change('category', value)}
            options={categoryOptions}
            placeholder="Select a notification type"
            error={errors.category}
          />

          <InputField
            id="tx-push-title"
            label="Title"
            value={draft.title}
            onChange={(value) => controller.change('title', value)}
            placeholder={meta?.placeholderTitle ?? DEFAULT_PLACEHOLDERS.title}
            maxLength={PUSH_LIMITS.titleMax}
            error={errors.title}
            required
          />

          <TextAreaField
            id="tx-push-message"
            label="Message"
            value={draft.message}
            onChange={(value) => controller.change('message', value)}
            placeholder={meta?.placeholderMessage ?? DEFAULT_PLACEHOLDERS.message}
            rows={4}
            maxLength={PUSH_LIMITS.messageMax}
            error={errors.message}
          />

          {mode === 'ADMIN' ? (
            <div className="tx-push-composer__audience">
              <Icon name="users" size="sm" />
              <span>
                Send to: <strong>All customers</strong>
                {controller.recipientStatus === 'ready' ? ` (${countLabel})` : ''}
              </span>
            </div>
          ) : (
            <CustomerPicker
              recipients={controller.recipients}
              status={controller.recipientStatus}
              selectedIds={draft.recipientIds}
              error={errors.recipientIds}
              disabled={sending}
              onToggle={controller.toggleRecipient}
              onSelectionChange={controller.setSelection}
              onRetry={controller.reload}
            />
          )}

          <div className="tx-push-composer__actions">
            <Button type="button" variant="secondary" onClick={controller.reset} disabled={sending}>
              Clear
            </Button>
            <Button type="submit" iconName="send" loading={sending} loadingLabel="Sending…">
              {mode === 'ADMIN' ? 'Send to all customers' : `Send to ${countLabel}`}
            </Button>
          </div>
        </form>

        <PushPhonePreview title={draft.title} message={draft.message} category={draft.category} />
      </div>
    </section>
  );
}
