import { createClientError } from '@/core/api';
import { isRole } from '../shared/types/role.types';
import type { SessionUser } from '../shared/types/session.types';

type RawRecord = Record<string, unknown>;

function isRecord(value: unknown): value is RawRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readText(record: RawRecord, field: string): string | null {
  const value = record[field];
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }
  return typeof value === 'number' ? String(value) : null;
}

function readPermissions(record: RawRecord): string[] {
  const value = record.permissions;
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

/**
 * Validates the server's user payload at runtime. An unknown role is rejected rather than
 * guessed, so a malformed or tampered response can never unlock a workspace.
 */
export function parseSessionUser(raw: unknown): SessionUser {
  if (!isRecord(raw)) {
    throw createClientError('INVALID_RESPONSE');
  }
  const id = readText(raw, 'id');
  const username = readText(raw, 'username');
  const role = raw.role;
  if (!id || !username || !isRole(role)) {
    throw createClientError('INVALID_RESPONSE');
  }
  return Object.freeze({
    id,
    username,
    displayName: readText(raw, 'displayName') ?? username,
    role,
    permissions: Object.freeze(readPermissions(raw)),
    lastLoginAt: readText(raw, 'lastLoginAt')
  });
}
