/**
 * What the chat backend (ChatController) needs to know about the signed-in staff member: the access token
 * from login (sent as a Bearer token and on the STOMP CONNECT) and the account's id, role and manager.
 * Kept in sessionStorage with the rest of the session, so it disappears when the tab closes.
 */
const CHAT_STORAGE_KEY = 'taxedge.auth.chat';

export interface ChatCredentials {
  readonly accessToken: string;
  readonly id: string;
  readonly role: string;
  readonly fullName: string;
  readonly managerId: string | null;
}

export function saveChatCredentials(data: Readonly<Record<string, unknown>>): void {
  const token = typeof data.accessToken === 'string' ? data.accessToken : '';
  if (!token || data.id === undefined || data.id === null || typeof data.role !== 'string') {
    clearChatCredentials();
    return;
  }
  const credentials: ChatCredentials = {
    accessToken: token,
    id: String(data.id),
    role: data.role,
    fullName: typeof data.fullName === 'string' ? data.fullName : '',
    managerId: data.managerId === undefined || data.managerId === null ? null : String(data.managerId)
  };
  try {
    sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(credentials));
  } catch {
    // ignore
  }
}

export function loadChatCredentials(): ChatCredentials | null {
  try {
    const raw = sessionStorage.getItem(CHAT_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ChatCredentials) : null;
  } catch {
    return null;
  }
}

/** True once the access token's own expiry time has passed (staff tokens last about an hour). */
export function isChatTokenExpired(credentials: ChatCredentials): boolean {
  try {
    const payload = credentials.accessToken.split('.')[1] ?? '';
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))) as { exp?: number };
    return typeof json.exp === 'number' && json.exp * 1000 <= Date.now();
  } catch {
    return false;
  }
}

export function clearChatCredentials(): void {
  try {
    sessionStorage.removeItem(CHAT_STORAGE_KEY);
  } catch {
    // ignore
  }
}
