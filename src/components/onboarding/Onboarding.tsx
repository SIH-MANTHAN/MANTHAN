import { useMemo, useState } from 'react';
import type { Coordinates, LocaleCode, UserNeed, UserRole } from '../../types';
import { useManthan, loadSavedProfile } from '../../context/ManthanContext';
import { Button } from '../ui/Button';
import { DEFAULT_LOCATION, DEFAULT_LOCATION_LABEL } from '../../data/mock/marine';
import { getCurrentCoordinates } from '../../utils/geolocation';
import { LOCALE_META, VOICE_LOCALES, t, roleLabel, roleHint, needLabel } from '../../i18n/ui';
import './Onboarding.css';

const ROLES: UserRole[] = [
  'fisher',
  'researcher',
  'observer',
  'maritime',
  'coastal_authority',
  'marine_operator',
  'other',
];

const NEEDS: UserNeed[] = [
  'fishing_zones',
  'weather',
  'sea_conditions',
  'navigation',
  'marine_life',
  'safety_alerts',
  'ocean_analysis',
  'research',
];

/** Location labels are proper place names; kept language-neutral, coordinates unaffected by locale. */
const LOCATIONS: { label: string; coords: Coordinates }[] = [
  { label: 'Mumbai Harbour approaches', coords: DEFAULT_LOCATION },
  { label: 'Ratnagiri coast', coords: { lat: 16.9944, lng: 73.3 } },
  { label: 'Kochi approaches', coords: { lat: 9.9312, lng: 76.2673 } },
  { label: 'Chennai coast', coords: { lat: 13.0827, lng: 80.2707 } },
  { label: 'Visakhapatnam', coords: { lat: 17.6868, lng: 83.2185 } },
];

export function Onboarding() {
  const { completeOnboarding } = useManthan();
  const [step, setStep] = useState(0);
  const saved = useMemo(() => loadSavedProfile(), []);
  const [name, setName] = useState(saved?.name ?? '');
  const [locale, setLocale] = useState<LocaleCode>(saved?.locale ?? 'en');
  const [role, setRole] = useState<UserRole | null>(null);
  const [needs, setNeeds] = useState<UserNeed[]>([]);
  const [location, setLocation] = useState<Coordinates>(DEFAULT_LOCATION);
  const [locationLabel, setLocationLabel] = useState(DEFAULT_LOCATION_LABEL);
  const [locBusy, setLocBusy] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);
  const [locOk, setLocOk] = useState(false);

  const canNext = useMemo(() => {
    if (step === 0) return name.trim().length >= 2;
    if (step === 1) return role !== null;
    if (step === 2) return needs.length > 0;
    if (step === 3) return Boolean(locationLabel);
    return false;
  }, [step, name, role, needs, locationLabel]);

  const toggleNeed = (id: UserNeed) => {
    setNeeds((prev) => (prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id]));
  };

  const detectCurrentLocation = async () => {
    setLocError(null);
    setLocOk(false);
    setLocBusy(true);
    const result = await getCurrentCoordinates();
    setLocBusy(false);
    if (!result.ok) {
      setLocError(result.message);
      return;
    }
    setLocation(result.coords);
    setLocationLabel(t(locale, 'currentLocationLabel'));
    setLocOk(true);
  };

  const finish = () => {
    if (!role) return;
    completeOnboarding({
      name: name.trim(),
      role,
      needs,
      location,
      locationLabel,
      locale,
      onboardingComplete: true,
    });
  };

  return (
    <div className="onboard">
      <div className="onboard-atmosphere" aria-hidden>
        <svg className="onboard-wave" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path
            d="M0,60 C150,100 350,20 600,60 C850,100 1050,20 1200,60 L1200,120 L0,120 Z"
            fill="currentColor"
          />
        </svg>
        <div className="onboard-compass" />
      </div>

      <div className="onboard-card animate-fade-up">
        <header className="onboard-brand">
          <div className="brand-mark" aria-hidden>
            <svg viewBox="0 0 48 48" width="40" height="40">
              <rect width="48" height="48" rx="10" fill="var(--accent)" />
              <path
                d="M8 30c5-6 9-9 12-6s4 9 9 7 7-7 11-4"
                stroke="#FBF5E8"
                strokeWidth="2.2"
                fill="none"
                strokeLinecap="round"
              />
              <circle cx="34" cy="14" r="3" fill="var(--gold)" />
            </svg>
          </div>
          <div>
            <p className="brand-name">MANTHAN</p>
            <p className="brand-tag">{t(locale, 'brandTag')}</p>
          </div>
        </header>

        <div className="onboard-progress" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={4}>
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={`prog-dot ${i <= step ? 'on' : ''}`} />
          ))}
        </div>

        {step === 0 && (
          <div className="onboard-step animate-fade-up">
            <h1>{t(locale, 'welcome')}</h1>
            <p className="lede">{t(locale, 'welcomeLede')}</p>
            <div className="field">
              <label htmlFor="name">{t(locale, 'yourName')}</label>
              <input
                id="name"
                autoFocus
                placeholder={t(locale, 'namePlaceholder')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && canNext && setStep(1)}
              />
            </div>
            <div className="field" style={{ marginTop: '1rem' }}>
              <label htmlFor="locale">{t(locale, 'chooseLanguage')}</label>
              <select
                id="locale"
                value={locale}
                onChange={(e) => setLocale(e.target.value as LocaleCode)}
              >
                {(Object.keys(LOCALE_META) as LocaleCode[]).map((code) => (
                  <option key={code} value={code}>
                    {LOCALE_META[code].native}
                    {VOICE_LOCALES.includes(code) ? ' · 🎤' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="onboard-step animate-fade-up">
            <h1>{t(locale, 'yourRole')}</h1>
            <p className="lede">{t(locale, 'roleLede')}</p>
            <div className="role-grid">
              {ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`role-card ${role === r ? 'active' : ''}`}
                  onClick={() => setRole(r)}
                >
                  <span className="role-label">{roleLabel(locale, r)}</span>
                  <span className="role-hint">{roleHint(locale, r)}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="onboard-step animate-fade-up">
            <h1>{t(locale, 'yourNeeds')}</h1>
            <p className="lede">{t(locale, 'needsLede')}</p>
            <div className="chip-grid">
              {NEEDS.map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`chip ${needs.includes(n) ? 'active' : ''}`}
                  onClick={() => toggleNeed(n)}
                >
                  {needLabel(locale, n)}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="onboard-step animate-fade-up">
            <h1>{t(locale, 'yourLocation')}</h1>
            <p className="lede">{t(locale, 'locationLede')}</p>
            <div className="loc-actions">
              <Button variant="secondary" onClick={() => void detectCurrentLocation()} disabled={locBusy}>
                {locBusy ? t(locale, 'locating') : t(locale, 'useCurrentLocation')}
              </Button>
            </div>
            {locError && <p className="loc-error">{locError}</p>}
            {locOk && (
              <p className="loc-success">
                {t(locale, 'locationSuccess')}:{' '}
                <span className="mono">
                  {location.lat.toFixed(5)}°, {location.lng.toFixed(5)}°
                </span>
              </p>
            )}
            <p className="section-kicker" style={{ marginTop: '1rem' }}>
              {t(locale, 'orChooseManually')}
            </p>
            <div className="loc-list">
              {LOCATIONS.map((loc) => (
                <button
                  key={loc.label}
                  type="button"
                  className={`loc-item ${locationLabel === loc.label ? 'active' : ''}`}
                  onClick={() => {
                    setLocation(loc.coords);
                    setLocationLabel(loc.label);
                    setLocOk(false);
                    setLocError(null);
                  }}
                >
                  <span>{loc.label}</span>
                  <span className="mono loc-coords">
                    {loc.coords.lat.toFixed(2)}°, {loc.coords.lng.toFixed(2)}°
                  </span>
                </button>
              ))}
            </div>
            {locationLabel === t(locale, 'currentLocationLabel') && !locOk && (
              <p className="loc-selected mono">
                {location.lat.toFixed(4)}°, {location.lng.toFixed(4)}°
              </p>
            )}
          </div>
        )}

        <footer className="onboard-footer">
          {step > 0 ? (
            <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
              {t(locale, 'back')}
            </Button>
          ) : (
            <span />
          )}
          {step < 3 ? (
            <Button disabled={!canNext} onClick={() => setStep((s) => s + 1)}>
              {t(locale, 'continue')}
            </Button>
          ) : (
            <Button disabled={!canNext} onClick={finish}>
              {t(locale, 'enter')}
            </Button>
          )}
        </footer>
      </div>
    </div>
  );
}
