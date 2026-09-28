import { useManthan } from '../../context/ManthanContext';
import { formatTime } from '../../utils/format';
import { EmptyState, LoadingState, SafetyPill, SeverityPill, ProvenanceBadge } from '../ui/States';
import { Button } from '../ui/Button';
import { t, productivityLabel } from '../../i18n/ui';
import { tideTrendLabel } from '../../i18n/calculator';
import '../pfz/Pfz.css';
import './Overview.css';

export function OverviewPanel() {
  const { dashboard, dashboardStatus, setActivePanel, focusMap, profile, refreshDashboard } = useManthan();
  const locale = profile?.locale ?? 'en';

  if (dashboardStatus === 'loading' && !dashboard) {
    return <LoadingState label={t(locale, 'drawingPicture')} />;
  }

  if (dashboardStatus === 'error' && !dashboard) {
    return <EmptyState title={t(locale, 'couldNotLoadConditions')} detail={t(locale, 'checkConnectionRetry')} />;
  }

  if (!dashboard || !profile) return null;

  const nearest = [...dashboard.nearbyPfz].sort((a, b) => a.distanceKm - b.distanceKm)[0];
  const topAlert = dashboard.alerts[0];

  return (
    <div className="overview-panel scrollable">
      <p className="section-kicker">{t(locale, 'overviewKicker')}</p>
      <h3 className="panel-heading">
        {t(locale, 'greetingPrefix')}, {profile.name.split(' ')[0]}
      </h3>
      <p className="panel-sub">
        {t(locale, 'correlatedConditionsFor')} <strong>{dashboard.locationLabel}</strong>.
      </p>

      <div className="overview-status">
        <div>
          <p className="section-kicker">{t(locale, 'safetyStatusLabel')}</p>
          <SafetyPill status={dashboard.safety.overall} locale={locale} />
        </div>
        <Button size="sm" variant="ghost" onClick={() => void refreshDashboard()}>
          {t(locale, 'refresh')}
        </Button>
      </div>

      <div className="condition-strip">
        <div>
          <span>SST</span>
          <strong className="mono">{dashboard.ocean.sst.valueC}°C</strong>
          <ProvenanceBadge source={dashboard.ocean.sst.source} locale={locale} />
        </div>
        <div>
          <span>Chl-a</span>
          <strong className="mono">{dashboard.ocean.chlorophyll.valueMgM3}</strong>
          <ProvenanceBadge source={dashboard.ocean.chlorophyll.source} locale={locale} />
        </div>
        <div>
          <span>{t(locale, 'wavesLabel')}</span>
          <strong className="mono">{dashboard.ocean.waves.heightM} m</strong>
          <ProvenanceBadge source={dashboard.ocean.waves.source} locale={locale} />
        </div>
        <div>
          <span>{t(locale, 'windLabel')}</span>
          <strong className="mono">{dashboard.ocean.wind.speedKnots} kt</strong>
          <ProvenanceBadge source={dashboard.ocean.wind.source} locale={locale} />
        </div>
      </div>

      <button type="button" className="overview-card" onClick={() => setActivePanel('safety')}>
        <div className="overview-card-top">
          <strong>{t(locale, 'seaConditions')}</strong>
          <SeverityPill severity={dashboard.ocean.waves.severity} locale={locale} />
        </div>
        <p>{dashboard.ocean.weather.description}</p>
        <p className="mono faint">
          {t(locale, 'tideLabel')} {tideTrendLabel(locale, dashboard.ocean.tide.trend)} · {dashboard.ocean.tide.currentHeightM} m
        </p>
      </button>

      {topAlert && (
        <button type="button" className="overview-card" onClick={() => setActivePanel('safety')}>
          <div className="overview-card-top">
            <strong>{t(locale, 'activeNotice')}</strong>
            <SeverityPill severity={topAlert.severity} locale={locale} />
          </div>
          <p>{topAlert.title}</p>
          <p className="faint">{topAlert.summary}</p>
        </button>
      )}

      {nearest && (
        <button
          type="button"
          className="overview-card"
          onClick={() => {
            setActivePanel('pfz');
            focusMap({ center: nearest.center, zoom: 9, highlightIds: [nearest.id] });
          }}
        >
          <div className="overview-card-top">
            <strong>{t(locale, 'nearestPfzCard')}</strong>
            <SafetyPill status={nearest.safety} locale={locale} />
          </div>
          <p>
            {nearest.name} · {nearest.distanceKm} km
          </p>
          <p className="faint">
            {t(locale, 'productivity')} {productivityLabel(locale, nearest.productivity)}
          </p>
        </button>
      )}

      <button type="button" className="overview-card" onClick={() => setActivePanel('marine_life')}>
        <div className="overview-card-top">
          <strong>{t(locale, 'marineLifeCard')}</strong>
          <span className="count-chip">{dashboard.marineLife.length}</span>
        </div>
        <p>
          {t(locale, 'latestPrefix')}: {dashboard.marineLife[0]?.commonName ?? '—'}
        </p>
        <p className="mono faint">
          {dashboard.marineLife[0] ? formatTime(dashboard.marineLife[0].observedAt, locale) : ''}
        </p>
      </button>

      <div className="quick-ask">
        <p className="section-kicker">{t(locale, 'quickAsk')}</p>
        <Button fullWidth variant="secondary" onClick={() => setActivePanel('ask')}>
          {t(locale, 'openAskManthan')}
        </Button>
      </div>
    </div>
  );
}
