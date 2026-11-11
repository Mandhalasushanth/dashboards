import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type KeyboardEvent } from 'react';
import { Icon, LoadingSpinner } from '@/shared';
import { MAX_MESSAGE_LENGTH } from '../../validation/communicationSchema';
import './MessageComposer.css';

export interface MessageComposerProps {
  /** Resets the draft when the conversation changes. */
  readonly conversationKey: string;
  readonly recipientName: string;
  readonly sending: boolean;
  readonly onSend: (body: string) => Promise<boolean>;
}

/** Show the character counter once the draft is this close to the limit. */
const COUNTER_THRESHOLD = MAX_MESSAGE_LENGTH - 200;

/** Message box: Enter sends, Shift+Enter adds a line; blank or over-long messages cannot be sent. */
export function MessageComposer({ conversationKey, recipientName, sending, onSend }: MessageComposerProps) {
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const canSend = draft.trim().length > 0 && draft.length <= MAX_MESSAGE_LENGTH && !sending;

  useEffect(() => {
    setDraft('');
    inputRef.current?.focus();
  }, [conversationKey]);

  const submit = async () => {
    if (!canSend) {
      return;
    }
    const accepted = await onSend(draft);
    if (accepted) {
      setDraft('');
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submit();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void submit();
    }
  };

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => setDraft(event.target.value.slice(0, MAX_MESSAGE_LENGTH));

  return (
    <form className="tx-composer" onSubmit={handleSubmit}>
      <label className="tx-sr-only" htmlFor="tx-composer-input">
        Message {recipientName}
      </label>
      <textarea
        id="tx-composer-input"
        ref={inputRef}
        className="tx-composer__input"
        value={draft}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={`Message ${recipientName}…`}
        rows={1}
        maxLength={MAX_MESSAGE_LENGTH}
        aria-describedby="tx-composer-hint"
      />
      <div className="tx-composer__side">
        {draft.length >= COUNTER_THRESHOLD ? (
          <span className="tx-composer__counter" aria-live="polite">
            {draft.length}/{MAX_MESSAGE_LENGTH}
          </span>
        ) : null}
        <button type="submit" className="tx-composer__send" disabled={!canSend} aria-label="Send message" title="Send (Enter)">
          {sending ? <LoadingSpinner /> : <Icon name="send" />}
        </button>
      </div>
      <p id="tx-composer-hint" className="tx-sr-only">
        Press Enter to send, Shift and Enter for a new line.
      </p>
    </form>
  );
}
