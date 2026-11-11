import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { defaultMessageFor, isApiError } from '@/core/api';
import { logger } from '@/core/logging/logger';
import { adminSettingsCache, fetchAdminSettings, saveAdminSettings } from '../api/adminSettingsApi';
import type {
  AdminSettings,
  SettingsErrors,
  SettingsSectionConfig,
  SettingsSectionId,
  SettingsValue
} from '../shared/settings.types';
import { validateSettings, validateSettingsSection } from '../validation/settingsSchema';

export type SettingsLoadStatus = 'loading' | 'ready' | 'error';

export interface SaveFeedback {
  readonly tone: 'success' | 'error';
  readonly message: string;
}

export interface AdminSettingsController {
  readonly status: SettingsLoadStatus;
  readonly loadError: string | null;
  readonly draft: AdminSettings | null;
  readonly errors: SettingsErrors;
  readonly dirtySections: ReadonlySet<SettingsSectionId>;
  readonly saving: boolean;
  readonly feedback: SaveFeedback | null;
  readonly setValue: (sectionId: SettingsSectionId, key: string, value: SettingsValue) => void;
  /** Validates and saves every section. Returns the first section with errors, if any. */
  readonly save: () => Promise<SettingsSectionId | null>;
  readonly discard: () => void;
  readonly reload: () => void;
}

function toMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message;
  }
  logger.error('Unexpected settings failure.', error);
  return defaultMessageFor('UNKNOWN');
}

function findDirtySections(sections: readonly SettingsSectionConfig[], saved: AdminSettings | null, draft: AdminSettings | null) {
  return new Set(
    sections
      .filter((section) => saved && draft && JSON.stringify(saved[section.id]) !== JSON.stringify(draft[section.id]))
      .map((section) => section.id)
  );
}

/**
 * Loads admin settings, tracks edits per section, validates and saves them.
 * A cached copy (from an earlier visit) is shown immediately and refreshed in the background.
 */
export function useAdminSettings(sections: readonly SettingsSectionConfig[]): AdminSettingsController {
  const [cached] = useState(() => adminSettingsCache.peek());
  const [status, setStatus] = useState<SettingsLoadStatus>(cached ? 'ready' : 'loading');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saved, setSaved] = useState<AdminSettings | null>(cached);
  const [draft, setDraft] = useState<AdminSettings | null>(cached);
  const [errors, setErrors] = useState<SettingsErrors>({});
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<SaveFeedback | null>(null);
  const [loadCount, setLoadCount] = useState(0);
  // Latest saved/draft for the background refresh, which must not overwrite edits already in progress.
  const editsRef = useRef({ saved, draft });
  editsRef.current = { saved, draft };

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!editsRef.current.saved) {
        setStatus('loading');
      }
      try {
        const settings = await fetchAdminSettings(sections);
        const { saved: shown, draft: edited } = editsRef.current;
        const hasEdits = shown !== null && JSON.stringify(shown) !== JSON.stringify(edited);
        if (active && !hasEdits) {
          setSaved(settings);
          setDraft(settings);
          setErrors({});
        }
        if (active) {
          setStatus('ready');
        }
      } catch (error) {
        if (active && !editsRef.current.saved) {
          setLoadError(toMessage(error));
          setStatus('error');
        }
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [sections, loadCount]);

  const dirtySections = useMemo(() => findDirtySections(sections, saved, draft), [sections, saved, draft]);

  const setValue = useCallback(
    (sectionId: SettingsSectionId, key: string, value: SettingsValue) => {
      if (!draft) {
        return;
      }
      const sectionValues = { ...draft[sectionId], [key]: value };
      setDraft({ ...draft, [sectionId]: sectionValues });
      setFeedback(null);
      const section = sections.find((entry) => entry.id === sectionId);
      const shown = errors[sectionId];
      if (!section || !shown) {
        return;
      }
      // Re-check the whole tab but only update messages already on screen, so fixing one field
      // (e.g. the state) clears a related message (e.g. the GSTIN) without flagging untouched fields.
      const fresh = validateSettingsSection(section, sectionValues);
      const stillInvalid = Object.fromEntries(
        Object.keys(shown)
          .filter((errorKey) => fresh[errorKey])
          .map((errorKey) => [errorKey, fresh[errorKey]])
      );
      setErrors({ ...errors, [sectionId]: Object.keys(stillInvalid).length > 0 ? stillInvalid : undefined });
    },
    [draft, errors, sections]
  );

  const save = useCallback(async (): Promise<SettingsSectionId | null> => {
    if (!draft || saving) {
      return null;
    }
    const validation = validateSettings(sections, draft);
    setErrors(validation);
    const firstInvalid = sections.find((section) => validation[section.id]);
    if (firstInvalid) {
      const count = Object.values(validation).reduce((total, sectionErrors) => total + Object.keys(sectionErrors ?? {}).length, 0);
      setFeedback({ tone: 'error', message: `Fix ${count} highlighted ${count === 1 ? 'field' : 'fields'} before saving.` });
      return firstInvalid.id;
    }
    setSaving(true);
    setFeedback(null);
    try {
      const stored = await saveAdminSettings(sections, draft);
      setSaved(stored);
      setDraft(stored);
      setFeedback({ tone: 'success', message: 'Settings saved.' });
    } catch (error) {
      setFeedback({ tone: 'error', message: toMessage(error) });
    } finally {
      setSaving(false);
    }
    return null;
  }, [draft, saving, sections]);

  const discard = useCallback(() => {
    setDraft(saved);
    setErrors({});
    setFeedback(null);
  }, [saved]);

  const reload = useCallback(() => setLoadCount((count) => count + 1), []);

  return { status, loadError, draft, errors, dirtySections, saving, feedback, setValue, save, discard, reload };
}
