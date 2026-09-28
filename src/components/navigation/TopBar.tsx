import { Moon, Sun, MapPin, LogOut } from 'lucide-react';
import { useManthan } from '../../context/ManthanContext';
import { LOCALE_META, t, roleLabel } from '../../i18n/ui';
import type { LocaleCode } from '../../types';
import './TopBar.css';

export function TopBar() {
  const {
    theme,
    toggleTheme,
    profile,
    resetOnboarding,
    geofenceWarning,
    dismissGeofenceWarning,
    setLocale,
  } = useManthan();

  if (!profile) return null;
  const locale = profile.locale;

  return (
    <header className="top-bar">
      <div className="top-left">
        <h1 className="top-brand">MANTHAN</h1>
        <span className="top-divider" aria-hidden />
        <span className="top-location">
          <MapPin size={14} />
          {profile.locationLabel}
        </span>
      </div>

      <div className="top-right">
        {geofenceWarning && (
          <div className="geo-banner" role="status">
            <span>{geofenceWarning}</span>
            <button type="button" onClick={dismissGeofenceWarning} aria-label={t(locale, 'dismiss')}>
              ×
            </button>
          </div>
        )}
        <label className="lang-select" title={t(locale, 'language')}>
          <span className="sr-only">{t(locale, 'language')}</span>
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value as LocaleCode)}
            aria-label={t(locale, 'language')}
          >
            {(Object.keys(LOCALE_META) as LocaleCode[]).map((code) => (
              <option key={code} value={code}>
                {LOCALE_META[code].native}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="icon-btn"
          onClick={toggleTheme}
          aria-label={theme === 'day' ? t(locale, 'switchToNight') : t(locale, 'switchToDay')}
          title={theme === 'day' ? t(locale, 'nightLabel') : t(locale, 'dayLabel')}
        >
          {theme === 'day' ? <Moon size={16} /> : <Sun size={16} />}
        </button>
        <div className="user-chip" title={`${profile.name} · ${roleLabel(locale, profile.role)}`}>
          <span className="user-avatar" aria-hidden>
            {profile.name.charAt(0).toUpperCase()}
          </span>
          <span className="user-meta">
            <strong>{profile.name}</strong>
            <em>{roleLabel(locale, profile.role)}</em>
          </span>
        </div>
        <button
          type="button"
          className="icon-btn"
          onClick={resetOnboarding}
          aria-label={t(locale, 'resetProfile')}
          title={t(locale, 'resetOnboarding')}
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
