import { tokenManager } from "./tokenManager";

export interface UserSession {
  userId: string;
  phone: string;
  name?: string;
  email?: string;
  isAuthenticated: boolean;
  role?: string;
}

class SessionManager {
  private currentSession: UserSession | null = null;
  private listeners: Array<(session: UserSession | null) => void> = [];

  getSession(): UserSession | null {
    return this.currentSession;
  }

  setSession(session: UserSession): void {
    this.currentSession = session;
    this.notifyListeners();
  }

  async logout(): Promise<void> {
    this.currentSession = null;
    await tokenManager.clearTokens();
    this.notifyListeners();
  }

  subscribe(listener: (session: UserSession | null) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      listener(this.currentSession);
    });
  }
}

export const sessionManager = new SessionManager();
export default sessionManager;
