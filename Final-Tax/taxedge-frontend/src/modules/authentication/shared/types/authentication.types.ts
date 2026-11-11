import type { SessionUser } from './session.types';

export interface LoginCredentials {
  readonly username: string;
  readonly password: string;
}

export type LoginField = keyof LoginCredentials;

export type LoginFieldErrors = Partial<Record<LoginField, string>>;

export interface AccountCredentialUpdates {
  readonly newUsername?: string;
  readonly newPassword?: string;
}

/** Transport-agnostic authentication port; the HTTP adapter is used everywhere except the dev demo mode. */
export interface AuthenticationGateway {
  login(credentials: LoginCredentials): Promise<SessionUser>;
  fetchSession(): Promise<SessionUser | null>;
  logout(): Promise<void>;
  verifyPassword?(username: string, password: string): Promise<boolean>;
  updateCredentials?(userId: number | string, updates: AccountCredentialUpdates): Promise<SessionUser>;
}
