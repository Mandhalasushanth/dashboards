import { useCallback, useEffect, useRef, useState } from "react";
import { logger } from "@/core/logging/logger";
import type { Application, ChatMessage } from "@/types/domain";
import { fetchHistory, findManagerFor, sendToManager, subscribeIncoming, type ApplicationManager } from "../services/chatService";

const REFRESH_MS = 4_000;

export interface ApplicationChat {
  /** The manager who took the application, or null while nobody has (nobody to write to yet). */
  manager: ApplicationManager | null;
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  sending: boolean;
  send: (text: string) => Promise<void>;
}

/**
 * The chat on an application's Chat tab, read from and sent to the backend chat. The thread refreshes as the
 * manager's messages arrive, with a short poll as a back-up. Nothing is stored on the phone.
 */
export function useApplicationChat(app: Application | null | undefined, enabled: boolean): ApplicationChat {
  const [manager, setManager] = useState<ApplicationManager | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const managerRef = useRef<ApplicationManager | null>(null);
  const appKey = app?.id ?? null;

  useEffect(() => {
    if (!enabled || !app) return undefined;
    let active = true;

    const load = async (quiet: boolean) => {
      if (!quiet) setLoading(true);
      try {
        const found = managerRef.current ?? (await findManagerFor(app));
        if (!active) return;
        managerRef.current = found;
        setManager(found);
        if (found) setMessages(await fetchHistory(found.principal));
        if (active) setError(null);
      } catch (loadError) {
        logger.warn("[chat] could not load the conversation", { error: loadError });
        if (active) setError("Unable to load the chat. Check your connection.");
      } finally {
        if (active && !quiet) setLoading(false);
      }
    };

    void load(false);
    const stopListening = subscribeIncoming(() => void load(true));
    const timer = setInterval(() => void load(true), REFRESH_MS);
    return () => {
      active = false;
      managerRef.current = null;
      stopListening();
      clearInterval(timer);
    };
    // The application is identified by its id; its other fields change without changing who the manager is.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appKey, enabled]);

  const send = useCallback(async (text: string) => {
    const target = managerRef.current;
    if (!target) throw new Error("A manager has not taken your application yet, so there is nobody to message.");
    setSending(true);
    try {
      const stored = await sendToManager(target, text);
      if (stored) setMessages((current) => (current.some((entry) => entry.id === stored.id) ? current : [...current, stored]));
      setError(null);
    } finally {
      setSending(false);
    }
  }, []);

  return { manager, messages, loading, error, sending, send };
}
