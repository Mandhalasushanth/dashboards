import { apiClient } from "@/core/api/apiClient";
import { JwtUtils, tokenManager } from "@/core/authentication/tokenManager";
import { logger } from "@/core/logging/logger";
import type { Application, ChatMessage } from "@/types/domain";
import { connectStomp, type StompConnection } from "./stompClient";

/**
 * Chat between a customer and the manager handling their application, over the backend chat
 * (ChatController): history over REST (GET /api/v1/chat/history/{partnerId}) and sends over STOMP
 * (/app/chat.send). The manager is whoever took the application (the bucket, GET /api/v1/bucket/manager/0).
 * Nothing is saved on the phone: every screen reads what the server holds.
 */
const HISTORY_PAGE_SIZE = 100;
const SEND_TIMEOUT_MS = 10_000;
const BUCKET_REFRESH_MS = 30_000;

export interface ApplicationManager {
  /** The chat address of the manager, e.g. "MANAGER:7". */
  principal: string;
  name: string;
}

type Raw = Record<string, unknown>;
const isRecord = (value: unknown): value is Raw => typeof value === "object" && value !== null && !Array.isArray(value);

/** The customer's own id: the subject of their sign-in token. */
export async function currentCustomerId(): Promise<string | null> {
  const token = await tokenManager.getAccessToken();
  return token ? (JwtUtils.decodePayload(token)?.sub ?? null) : null;
}

/** Every id the backend might know this application by. */
function applicationIds(app: Application): string[] {
  const data = app.formData ?? {};
  return [app.id, data.gstId, data.applicationId, data.arn, data.filingId, data.id]
    .filter((value) => value !== undefined && value !== null && String(value).trim() !== "")
    .map((value) => String(value).trim());
}

let bucketCache: { at: number; items: Raw[] } | null = null;

async function bucketItems(): Promise<Raw[]> {
  if (bucketCache && Date.now() - bucketCache.at < BUCKET_REFRESH_MS) return bucketCache.items;
  const raw = await apiClient.get<unknown>("/api/v1/bucket/manager/0");
  const items = Array.isArray(raw) ? raw.filter(isRecord) : [];
  bucketCache = { at: Date.now(), items };
  return items;
}

/** The manager who took this application, or null while nobody has. */
export async function findManagerFor(app: Application): Promise<ApplicationManager | null> {
  const ids = applicationIds(app);
  const items = await bucketItems();
  const mine = items.find((item) => typeof item.applicationId === "string" && ids.includes(item.applicationId) && isRecord(item.manager) && item.manager.id !== undefined);
  if (!mine || !isRecord(mine.manager)) return null;
  return {
    principal: `MANAGER:${String(mine.manager.id)}`,
    name: typeof mine.manager.fullName === "string" && mine.manager.fullName.trim() ? mine.manager.fullName : "Your manager",
  };
}

/** Turns the server's message into the chat tab's message (the customer's own messages are "user"). */
function toChatMessage(raw: unknown, customerId: string): ChatMessage | null {
  if (!isRecord(raw) || typeof raw.content !== "string" || typeof raw.sentAt !== "string") return null;
  const mine = raw.senderId === customerId;
  return {
    id: String(raw.id ?? raw.clientMessageId ?? `${raw.sentAt}-${raw.content}`),
    sender: mine ? "user" : "staff",
    text: raw.content,
    timestamp: raw.sentAt,
  };
}

export async function fetchHistory(partnerPrincipal: string): Promise<ChatMessage[]> {
  const customerId = await currentCustomerId();
  if (!customerId) return [];
  const raw = await apiClient.get<unknown>(`/api/v1/chat/history/${encodeURIComponent(partnerPrincipal)}?page=0&size=${HISTORY_PAGE_SIZE}`);
  const list = Array.isArray(raw) ? raw : [];
  return list
    .map((entry) => toChatMessage(entry, customerId))
    .filter((message): message is ChatMessage => message !== null)
    .sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp));
}

async function wsUrl(): Promise<string> {
  const base = (await apiClient.ensureBaseUrlLoaded()).replace(/\/$/, "");
  return `${base.replace(/^http/, "ws")}/ws`;
}

let connection: Promise<StompConnection> | null = null;
let connectionToken: string | null = null;
const incomingListeners = new Set<() => void>();
const waiting = new Map<string, { resolve: (message: ChatMessage | null) => void; reject: (error: Error) => void }>();

function parse(body: string): unknown {
  try {
    return JSON.parse(body);
  } catch {
    return null;
  }
}

async function openConnection(): Promise<StompConnection> {
  const token = await tokenManager.getAccessToken();
  const customerId = await currentCustomerId();
  if (!token || !customerId) throw new Error("Sign in again to use chat.");
  if (connection && connectionToken !== token) connection = null;
  if (connection) {
    try {
      const open = await connection;
      if (open.isOpen()) return open;
    } catch {
      // fall through and reconnect
    }
  }
  connectionToken = token;
  const next = connectStomp(await wsUrl(), token).then((open) => {
    open.subscribe("/user/queue/messages", (frame) => {
      const dto = parse(frame.body);
      const clientId = isRecord(dto) && typeof dto.clientMessageId === "string" ? dto.clientMessageId : null;
      const pending = clientId ? waiting.get(clientId) : undefined;
      if (clientId && pending && isRecord(dto) && dto.senderId === customerId) {
        waiting.delete(clientId);
        pending.resolve(toChatMessage(dto, customerId));
      } else {
        incomingListeners.forEach((listener) => listener());
      }
    });
    open.subscribe("/user/queue/errors", (frame) => {
      const error = new Error(frame.body || "The message could not be sent.");
      waiting.forEach((pending) => pending.reject(error));
      waiting.clear();
    });
    return open;
  });
  connection = next;
  next.catch(() => {
    if (connection === next) connection = null;
  });
  return next;
}

/** Sends a message to the manager and resolves once the server has stored it. */
export async function sendToManager(manager: ApplicationManager, text: string): Promise<ChatMessage | null> {
  const open = await openConnection();
  const customerId = await currentCustomerId();
  const clientMessageId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  return new Promise<ChatMessage | null>((resolve, reject) => {
    const timer = setTimeout(() => {
      waiting.delete(clientMessageId);
      reject(new Error("The message was not confirmed by the server. Try again."));
    }, SEND_TIMEOUT_MS);
    waiting.set(clientMessageId, {
      resolve: (message) => {
        clearTimeout(timer);
        resolve(message);
      },
      reject: (error) => {
        clearTimeout(timer);
        reject(error);
      },
    });
    open.send("/app/chat.send", {
      recipientId: manager.principal,
      content: text,
      clientMessageId,
      senderName: customerId ?? undefined,
      messageType: "TEXT",
    });
  });
}

/** Calls back when the manager writes, keeping the socket open (and re-opening it) while someone listens. */
export function subscribeIncoming(listener: () => void): () => void {
  incomingListeners.add(listener);
  const keepOpen = () => {
    openConnection().catch((error: unknown) => logger.debug("[chat] socket not open yet", { error }));
  };
  keepOpen();
  const timer = setInterval(keepOpen, 5_000);
  return () => {
    incomingListeners.delete(listener);
    clearInterval(timer);
  };
}
