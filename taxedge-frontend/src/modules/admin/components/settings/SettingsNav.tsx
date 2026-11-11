import { useEffect, useRef } from 'react';
import { Icon } from '@/shared';
import type { SettingsErrors, SettingsSectionConfig, SettingsSectionId } from '../../shared/settings.types';
import './SettingsNav.css';

export interface SettingsNavProps {
  readonly sections: readonly SettingsSectionConfig[];
  readonly activeId: SettingsSectionId;
  readonly errors: SettingsErrors;
  readonly dirtySections: ReadonlySet<SettingsSectionId>;
  readonly onSelect: (id: SettingsSectionId) => void;
}

/** Horizontal tab bar under the page header; scrolls sideways when the tabs do not fit. */
export function SettingsNav({ sections, activeId, errors, dirtySections, onSelect }: SettingsNavProps) {
  const navRef = useRef<HTMLElement>(null);

  // On narrow screens, slide the bar so the active tab is centred (horizontal only; the page does not jump).
  useEffect(() => {
    const nav = navRef.current;
    const tab = nav?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (nav && tab && nav.scrollWidth > nav.clientWidth) {
      nav.scrollTo({ left: tab.offsetLeft - (nav.clientWidth - tab.offsetWidth) / 2, behavior: 'smooth' });
    }
  }, [activeId]);

  const renderTab = (section: SettingsSectionConfig) => {
    const active = section.id === activeId;
    const hasErrors = Boolean(errors[section.id]);
    const status = hasErrors ? 'has errors' : dirtySections.has(section.id) ? 'unsaved changes' : '';
    return (
      <button
        key={section.id}
        type="button"
        role="tab"
        id={`tx-settings-tab-${section.id}`}
        aria-selected={active}
        aria-controls={`tx-settings-panel-${section.id}`}
        className={active ? 'tx-settings-nav__tab tx-settings-nav__tab--active' : 'tx-settings-nav__tab'}
        onClick={() => onSelect(section.id)}
      >
        <Icon name={section.iconName} />
        <span className="tx-settings-nav__label">{section.label}</span>
        {status ? (
          <span
            className={hasErrors ? 'tx-settings-nav__dot tx-settings-nav__dot--error' : 'tx-settings-nav__dot'}
            aria-label={status}
            title={status}
          />
        ) : null}
      </button>
    );
  };

  return (
    <nav ref={navRef} className="tx-settings-nav" role="tablist" aria-label="Settings sections" aria-orientation="horizontal">
      {sections.map(renderTab)}
    </nav>
  );
}
