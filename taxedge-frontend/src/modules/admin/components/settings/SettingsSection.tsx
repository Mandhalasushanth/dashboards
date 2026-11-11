import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button, DeferredContent, LoadingSpinner, useDocumentTitle } from '@/shared';
import { useAdminSettings } from '../../hooks/useAdminSettings';
import type { SettingsSectionId, SettingsValue } from '../../shared/settings.types';
import { SETTINGS_SECTIONS, isSettingsSectionId } from './config/settingsSections';
import { SettingsActionBar } from './SettingsActionBar';
import { SettingsNav } from './SettingsNav';
import { SettingsPanel } from './SettingsPanel';
import './SettingsSection.css';

const TAB_PARAM = 'tab';

/** Moves focus to the first invalid field once the tab holding it has rendered. */
function focusFirstInvalidField(): void {
  window.requestAnimationFrame(() => {
    document.querySelector<HTMLElement>('.tx-settings-panel [aria-invalid="true"]')?.focus();
  });
}

/** Warns before closing or reloading the tab while there are unsaved changes. */
function useUnsavedChangesPrompt(dirty: boolean): void {
  useEffect(() => {
    if (!dirty) {
      return undefined;
    }
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [dirty]);
}

/** Admin "Settings": organization, billing, security, workflow and notification preferences. */
export default function SettingsSection() {
  useDocumentTitle('Settings');
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get(TAB_PARAM);
  const activeId: SettingsSectionId = isSettingsSectionId(requestedTab) ? requestedTab : SETTINGS_SECTIONS[0].id;
  const activeSection = SETTINGS_SECTIONS.find((section) => section.id === activeId) ?? SETTINGS_SECTIONS[0];
  const settings = useAdminSettings(SETTINGS_SECTIONS);
  const dirty = settings.dirtySections.size > 0;
  useUnsavedChangesPrompt(dirty);

  const selectTab = (id: SettingsSectionId) => setSearchParams({ [TAB_PARAM]: id }, { replace: true });
  const changeValue = (key: string, value: SettingsValue) => settings.setValue(activeId, key, value);
  const handleSave = async () => {
    const invalidSection = await settings.save();
    if (invalidSection) {
      selectTab(invalidSection);
      focusFirstInvalidField();
    }
  };

  if (settings.status === 'loading' || !settings.draft) {
    return settings.status === 'error' ? (
      <div className="tx-settings__state" role="alert">
        <p>{settings.loadError}</p>
        <Button variant="secondary" iconName="rotate-ccw" onClick={settings.reload}>
          Try again
        </Button>
      </div>
    ) : (
      <DeferredContent>
        <div className="tx-settings__state">
          <LoadingSpinner size="lg" label="Loading settings" />
        </div>
      </DeferredContent>
    );
  }

  return (
    <div className="tx-settings">
      <SettingsNav
        sections={SETTINGS_SECTIONS}
        activeId={activeId}
        errors={settings.errors}
        dirtySections={settings.dirtySections}
        onSelect={selectTab}
      />
      <div className="tx-settings__content">
        <SettingsPanel
          section={activeSection}
          values={settings.draft[activeId]}
          errors={settings.errors[activeId] ?? {}}
          disabled={settings.saving}
          onChange={changeValue}
        />
        <SettingsActionBar
          dirty={dirty}
          saving={settings.saving}
          feedback={settings.feedback}
          onDiscard={settings.discard}
          onSave={() => void handleSave()}
        />
      </div>
    </div>
  );
}
