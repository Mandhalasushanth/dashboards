import { BRAND_ASSETS } from '@/core/config/appConfig';
import { environment } from '@/core/config/environment';
import { Icon } from '@/shared';
import { PUSH_CATEGORIES } from '../shared/pushNotification.config';
import type { PushCategory } from '../shared/pushNotification.types';
import './PushPhonePreview.css';

export interface PushPhonePreviewProps {
  readonly title: string;
  readonly message: string;
  readonly category: PushCategory | '';
}

/** How the push will look on a customer's phone lock screen, updated as the sender types. */
export function PushPhonePreview({ title, message, category }: PushPhonePreviewProps) {
  const meta = category ? PUSH_CATEGORIES[category] : null;
  return (
    <figure className="tx-push-preview" aria-label="Phone preview">
      <div className="tx-push-preview__phone">
        <span className="tx-push-preview__notch" aria-hidden="true" />
        <p className="tx-push-preview__time" aria-hidden="true">
          9:41
        </p>
        <div className="tx-push-preview__card">
          <div className="tx-push-preview__app">
            <img src={BRAND_ASSETS.logo} alt="" className="tx-push-preview__logo" />
            <span>{environment.appName}</span>
            <span className="tx-push-preview__now">now</span>
          </div>
          <p className="tx-push-preview__title">
            {meta ? <Icon name={meta.icon} size="sm" /> : null}
            <span>{title.trim() || 'Notification title'}</span>
          </p>
          <p className="tx-push-preview__message">{message.trim() || 'Your message will appear here.'}</p>
        </div>
      </div>
      <figcaption className="tx-push-preview__caption">Preview on the customer’s mobile app</figcaption>
    </figure>
  );
}
