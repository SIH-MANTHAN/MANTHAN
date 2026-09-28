import { useManthan } from '../../context/ManthanContext';
import { formatTime } from '../../utils/format';
import { EmptyState, LoadingState, SafetyPill, SeverityPill, ProvenanceBadge } from '../ui/States';
import { t } from '../../i18n/ui';
import { tideTrendLabel } from '../../i18n/calculator';
import '../pfz/Pfz.css';
import './Safety.css';

export function SafetyPanel() {
  const { dashboard, dashboardStatus, profile } = useManthan();
  const locale = profile?.locale ?? 'en';

  if (dashboardStatus === 'loading' && !dashboard) return <LoadingState label={t(locale, 'assessingSafety')} />;
  if (!dashboard) return <EmptyState title={t(locale, 'noSafetyAssessment')} />;

  const s = dashboard.safety;

  return (
    <div className="safety-panel scrollable">
      <p className="section-kicker">{t(locale, 'navSafety')}</p>
      <div className="safety-head">
        <h3 className="panel-heading">{t(locale, 'operationalSeaSafety')}</h3>
        <SafetyPill status={s.overall} locale={locale} />
      </div>
      <p className="panel-sub">{s.summary}</p>

      <div className="safety-grid">
        <div className="safety-tile">
          <p className="section-kicker">{t(locale, 'wavesLabel')}</p>
          <p className="safety-value mono">{s.wave.heightM} m</p>
          <p className="safety-meta">
            {t(locale, 'periodSuffix')} {s.wave.periodS}s · <SeverityPill severity={s.wave.severity} locale={locale} />
          </p>
          <ProvenanceBadge source={s.wave.source} locale={locale} />
        </div>
        <div className="safety-tile">
          <p className="section-kicker">{t(locale, 'windLabel')}</p>
          <p className="safety-value mono">{s.wind.speedKnots} kt</p>
          <p className="safety-meta">
            {t(locale, 'gustsPrefix')} {s.wind.gustKnots} kt · <SeverityPill severity={s.wind.severity} locale={locale} />
          </p>
          <ProvenanceBadge source={s.wind.source} locale={locale} />
        </div>
        <div className="safety-tile">
          <p className="section-kicker">{t(locale, 'weatherLabel')}</p>
          <p className="safety-value">{s.weather.temperatureC}°C</p>
          <p className="safety-meta">{s.weather.description}</p>
          <ProvenanceBadge source={s.weather.source} locale={locale} />
        </div>
        <div className="safety-tile">
          <p className="section-kicker">{t(locale, 'tideLabel')}</p>
          <p className="safety-value mono">{s.tide.currentHeightM} m</p>
          <p className="safety-meta">
            {tideTrendLabel(locale, s.tide.trend)} · {t(locale, 'nextHighPrefix')} {formatTime(s.tide.nextHigh.time, locale)}
          </p>
          <ProvenanceBadge source={s.tide.source} locale={locale} />
        </div>
      </div>

      <p className="section-kicker" style={{ marginTop: '1.1rem' }}>
        {t(locale, 'alertsAdvisories')}
      </p>
      <ul className="alert-list">
        {dashboard.alerts.map((a) => (
          <li key={a.id} className={`alert-item severity-${a.severity}`}>
            <div className="alert-top">
              <strong>{a.title}</strong>
              <SeverityPill severity={a.severity} locale={locale} />
            </div>
            <p>{a.summary}</p>
            {a.actionable && <p className="alert-action">{a.actionable}</p>}
            <p className="alert-source mono">
              {a.source} · {formatTime(a.issuedAt, locale)}
            </p>
          </li>
        ))}
      </ul>

      <p className="section-kicker" style={{ marginTop: '1rem' }}>
        {t(locale, 'recommendations')}
      </p>
      <ul className="reco-list">
        {s.recommendations.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
      <p className="assessed mono">
        {t(locale, 'assessedPrefix')} {formatTime(s.timestamp, locale)}
      </p>
    </div>
  );
}
