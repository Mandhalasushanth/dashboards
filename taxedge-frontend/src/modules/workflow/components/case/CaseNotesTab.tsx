import { useState } from 'react';
import { formatDateTime } from '@/core/utils/dateUtils';
import { ROLE_PROFILES } from '@/modules/authentication';
import { Button, EmptyState, Icon, TextAreaField } from '@/shared';
import { validateNote } from '../../services/transitionRules';
import { MAX_NOTE_LENGTH } from '../../shared/workflowStatuses';
import type { InternalNote } from '../../shared/workflow.types';
import type { CaseTabProps } from './CaseDrawer';
import './CaseNotesTab.css';

/** Internal working notes. Staff-only: never included in client-facing views. */
export function CaseNotesTab({ item, controller }: CaseTabProps) {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const canAdd = item.access?.canAddNote ?? false;

  const handleAdd = async () => {
    const message = validateNote(text, true, 'A note');
    setError(message);
    if (!message && (await controller.mutate({ type: 'NOTE', text }))) {
      setText('');
    }
  };

  const renderNote = (note: InternalNote) => (
    <li key={note.id} className="tx-case-note">
      <div className="tx-case-note__header">
        <span className="tx-case-note__author">
          {note.authorName} <span className="tx-case-note__role">{ROLE_PROFILES[note.authorRole].label}</span>
        </span>
        <time className="tx-case-note__time" dateTime={note.createdAt}>
          {formatDateTime(note.createdAt)}
        </time>
      </div>
      <p className="tx-case-note__text">{note.text}</p>
    </li>
  );

  return (
    <section className="tx-case-notes">
      <p className="tx-case-notes__banner">
        <Icon name="lock" size="sm" /> Internal only — notes are never shown to the client.
      </p>
      {item.notes.length === 0 ? (
        <EmptyState title="No internal notes" message="Notes between the manager and the agent appear here. Customers never see them." iconName="message-square" />
      ) : (
        <ul className="tx-case-notes__list">{[...item.notes].reverse().map(renderNote)}</ul>
      )}
      {canAdd ? (
        <div className="tx-case-notes__composer">
          <TextAreaField id="tx-case-note-new" label="Add internal note" value={text} onChange={setText} rows={3} maxLength={MAX_NOTE_LENGTH} error={error} />
          <Button iconName="send" onClick={() => void handleAdd()} loading={controller.busy} loadingLabel="Saving…">
            Add Note
          </Button>
        </div>
      ) : null}
    </section>
  );
}
