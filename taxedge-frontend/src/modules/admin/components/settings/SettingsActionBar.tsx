import { Button, Icon } from '@/shared';
import type { SaveFeedback } from '../../hooks/useAdminSettings';
import './SettingsActionBar.css';

export interface SettingsActionBarProps {
  readonly dirty: boolean;
  readonly saving: boolean;
  readonly feedback: SaveFeedback | null;
  readonly onDiscard: () => void;
  readonly onSave: () => void;
}

function statusText(dirty: boolean, feedback: SaveFeedback | null): { tone: string; text: string } {
  if (feedback) {
    return { tone: feedback.tone, text: feedback.message };
  }
  return dirty ? { tone: 'pending', text: 'You have unsaved changes.' } : { tone: 'idle', text: 'All changes saved.' };
}

/** Sticky footer under the settings panel: save status, discard and save. */
export function SettingsActionBar({ dirty, saving, feedback, onDiscard, onSave }: SettingsActionBarProps) {
  const status = statusText(dirty, feedback);

  return (
    <div className="tx-settings-actions">
      <p className={`tx-settings-actions__status tx-settings-actions__status--${status.tone}`} role="status" aria-live="polite">
        {status.tone === 'success' ? <Icon name="circle-check" size="sm" /> : null}
        {status.tone === 'error' ? <Icon name="alert-circle" size="sm" /> : null}
        <span>{status.text}</span>
      </p>
      <div className="tx-settings-actions__buttons">
        <Button variant="secondary" iconName="rotate-ccw" onClick={onDiscard} disabled={!dirty || saving}>
          Discard
        </Button>
        <Button iconName="save" onClick={onSave} loading={saving} loadingLabel="Saving…" disabled={!dirty}>
          Save changes
        </Button>
      </div>
    </div>
  );
}
