import { API_ENDPOINTS, apiClient } from '@/core/api';
import { environment } from '@/core/config/environment';
import type {
  AdminSettings,
  SectionValues,
  SettingsFieldConfig,
  SettingsSectionConfig,
  SettingsValue
} from '../shared/settings.types';
import { createDataCache } from './adminDataCache';

/** Last settings loaded or saved, so revisiting the page is instant. */
export const adminSettingsCache = createDataCache<AdminSettings>();

type RawRecord = Record<string, unknown>;

function asRecord(value: unknown): RawRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? (value as RawRecord) : {};
}

/** Coerces a server value to the field's form type; unusable values fall back to the default. */
function toFormValue(field: SettingsFieldConfig, raw: unknown): SettingsValue {
  if (field.type === 'toggle') {
    return typeof raw === 'boolean' ? raw : field.defaultValue;
  }
  return typeof raw === 'string' || typeof raw === 'number' ? String(raw) : field.defaultValue;
}

/** Numbers travel as numbers, text is trimmed, toggles stay booleans. */
function toPayloadValue(field: SettingsFieldConfig, value: SettingsValue): unknown {
  if (typeof value === 'boolean') {
    return value;
  }
  const trimmed = value.trim();
  return field.type === 'number' && trimmed !== '' ? Number(trimmed) : trimmed;
}

function fromPayload(sections: readonly SettingsSectionConfig[], payload: unknown): AdminSettings {
  const root = asRecord(payload);
  return Object.fromEntries(
    sections.map((section) => {
      const saved = asRecord(root[section.id]);
      return [section.id, Object.fromEntries(section.fields.map((field) => [field.key, toFormValue(field, saved[field.key])]))];
    })
  ) as AdminSettings;
}

function toPayload(sections: readonly SettingsSectionConfig[], settings: AdminSettings): RawRecord {
  return Object.fromEntries(
    sections.map((section) => {
      const values: SectionValues = settings[section.id];
      return [
        section.id,
        Object.fromEntries(section.fields.map((field) => [field.key, toPayloadValue(field, values[field.key] ?? field.defaultValue)]))
      ];
    })
  );
}

interface SettingsStore {
  read(): Promise<unknown>;
  write(payload: RawRecord): Promise<unknown>;
}

const httpStore: SettingsStore = Object.freeze({
  read: () => apiClient.get<unknown>(API_ENDPOINTS.admin.settings),
  write: (payload: RawRecord) => apiClient.put<unknown>(API_ENDPOINTS.admin.settings, payload)
});

async function getStore(): Promise<SettingsStore> {
  // Statically removed from production builds, like the demo authentication gateway.
  if (import.meta.env.DEV && environment.demoAuthEnabled) {
    const { demoSettingsStore } = await import('../dev/demoSettingsStore');
    return demoSettingsStore;
  }
  return httpStore;
}

export async function fetchAdminSettings(sections: readonly SettingsSectionConfig[]): Promise<AdminSettings> {
  const store = await getStore();
  const settings = fromPayload(sections, await store.read());
  adminSettingsCache.remember(settings);
  return settings;
}

/** Saves all sections and returns what the server stored, so the form reflects any server-side normalisation. */
export async function saveAdminSettings(sections: readonly SettingsSectionConfig[], settings: AdminSettings): Promise<AdminSettings> {
  const store = await getStore();
  const stored = await store.write(toPayload(sections, settings));
  const saved = fromPayload(sections, stored ?? toPayload(sections, settings));
  adminSettingsCache.remember(saved);
  return saved;
}
