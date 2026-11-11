/**
 * "Workflow data changed" signal. Any successful write emits it, so every mounted queue, KPI strip and
 * sidebar badge reloads from the same source and counts never drift from the application list.
 *
 * The signal also crosses browser tabs (a manager assigning in one tab updates the agent's dashboard in
 * another), fires when the window regains focus, and on a short poll so changes made by other people
 * on other devices show up without a manual reload.
 */
const listeners = new Set<() => void>();
const CHANNEL_NAME = 'taxedge.workflow.changes';
const POLL_INTERVAL_MS = 15_000;
const channel = typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel(CHANNEL_NAME);
let detachBrowserSignals: (() => void) | null = null;

function notifyLocal(): void {
  listeners.forEach((listener) => listener());
}

function handleStorage(event: StorageEvent): void {
  if (event.key === null || event.key.startsWith('taxedge.demo.workflow')) {
    notifyLocal();
  }
}

function handleVisibility(): void {
  if (document.visibilityState === 'visible') {
    notifyLocal();
  }
}

function pollWhenVisible(): void {
  if (document.visibilityState === 'visible') {
    notifyLocal();
  }
}

function attachBrowserSignals(): () => void {
  const timer = window.setInterval(pollWhenVisible, POLL_INTERVAL_MS);
  const handleMessage = () => notifyLocal();
  window.addEventListener('storage', handleStorage);
  window.addEventListener('focus', notifyLocal);
  document.addEventListener('visibilitychange', handleVisibility);
  channel?.addEventListener('message', handleMessage);
  return () => {
    window.clearInterval(timer);
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener('focus', notifyLocal);
    document.removeEventListener('visibilitychange', handleVisibility);
    channel?.removeEventListener('message', handleMessage);
  };
}

export function onWorkflowChanged(listener: () => void): () => void {
  listeners.add(listener);
  detachBrowserSignals = detachBrowserSignals ?? attachBrowserSignals();
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && detachBrowserSignals) {
      detachBrowserSignals();
      detachBrowserSignals = null;
    }
  };
}

export function emitWorkflowChanged(): void {
  notifyLocal();
  try {
    channel?.postMessage('changed');
  } catch {
    // Another tab missing one signal is harmless: it still refreshes on focus and on the poll.
  }
}
