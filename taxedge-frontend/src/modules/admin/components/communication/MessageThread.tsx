import { useEffect, useRef } from 'react';
import { formatDayLabel, formatTime } from '@/core/utils/dateUtils';
import { Icon } from '@/shared';
import type { DisplayMessage } from '../../hooks/useConversation';
import './MessageThread.css';

export interface MessageThreadProps {
  readonly messages: readonly DisplayMessage[];
  readonly contactFirstName: string;
}

interface ThreadRow {
  readonly message: DisplayMessage;
  /** Day separator shown above the first message of each day. */
  readonly dayLabel: string | null;
}

function toRows(messages: readonly DisplayMessage[], now: Date): ThreadRow[] {
  return messages.map((message, index) => {
    const label = formatDayLabel(message.sentAt, now);
    const previous = index > 0 ? formatDayLabel(messages[index - 1].sentAt, now) : null;
    return { message, dayLabel: label === previous ? null : label };
  });
}

function deliveryState(message: DisplayMessage): { icon: 'clock' | 'check' | 'check-check'; label: string } {
  if (message.pending) {
    return { icon: 'clock', label: 'Sending' };
  }
  return message.read ? { icon: 'check-check', label: 'Read' } : { icon: 'check', label: 'Sent' };
}

/** Chat bubbles grouped by day; the signed-in user's messages on the right with delivery ticks. */
export function MessageThread({ messages, contactFirstName }: MessageThreadProps) {
  const threadRef = useRef<HTMLDivElement>(null);
  const rows = toRows(messages, new Date());

  // Keep the newest message in view inside the thread container without scrolling the browser window.
  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [messages.length]);

  if (messages.length === 0) {
    return (
      <div className="tx-thread tx-thread--empty">
        <p>No messages yet. Say hello to {contactFirstName}.</p>
      </div>
    );
  }

  return (
    <div ref={threadRef} className="tx-thread" role="log" aria-live="polite" aria-label="Messages">
      {rows.map(({ message, dayLabel }) => {
        const delivery = deliveryState(message);
        return (
          <div key={message.id} className="tx-thread__row-group">
            {dayLabel ? (
              <p className="tx-thread__day">
                <span>{dayLabel}</span>
              </p>
            ) : null}
            <div className={message.fromMe ? 'tx-thread__row tx-thread__row--mine' : 'tx-thread__row'}>
              <div className={message.fromMe ? 'tx-bubble tx-bubble--mine' : 'tx-bubble'}>
                <p className="tx-bubble__text">{message.body}</p>
                <span className="tx-bubble__meta">
                  <time dateTime={message.sentAt}>{formatTime(message.sentAt)}</time>
                  {message.fromMe ? (
                    <span className="tx-bubble__status" title={delivery.label}>
                      <Icon name={delivery.icon} size="sm" />
                      <span className="tx-sr-only">{delivery.label}</span>
                    </span>
                  ) : null}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
