import { useManthan } from '../../context/ManthanContext';
import { formatTime } from '../../utils/format';
import { Button } from '../ui/Button';
import { EmptyState, LoadingState, SafetyPill } from '../ui/States';
import { t } from '../../i18n/ui';
import type { MapLayerId } from '../../types';
import '../pfz/Pfz.css';
import './Routes.css';

export function RoutesPanel() {
  const {
    dashboard,
    dashboardStatus,
    focusMap,
    selectedId,
    setSelectedId,
    setLayers,
    activeLayers,
    profile,
    setDrivingRoute,
  } = useManthan();
  const locale = profile?.locale ?? 'en';

  if (dashboardStatus === 'loading' && !dashboard) return <LoadingState label={t(locale, 'planningRoutes')} />;
  if (!dashboard?.routes.length) {
    return <EmptyState title={t(locale, 'noRoutesYet')} detail={t(locale, 'noRoutesDetail')} />;
  }

  return (
    <div className="routes-panel scrollable">
      <p className="section-kicker">{t(locale, 'routePlanningKicker')}</p>
      <h3 className="panel-heading">{t(locale, 'candidatePassages')}</h3>
      <p className="panel-sub">{t(locale, 'routesDesc')}</p>

      <ul className="route-list">
        {dashboard.routes.map((route) => (
          <li key={route.id} className={`route-card ${selectedId === route.id ? 'selected' : ''}`}>
            <header className="route-head">
              <h4>{route.name}</h4>
              <SafetyPill status={route.safety} locale={locale} />
            </header>
            <div className="route-stats">
              <span className="mono">{route.distanceNm} nm</span>
              <span className="mono">~{route.estimatedHours} h</span>
            </div>
            <p className="route-weather">{route.weatherSummary}</p>
            <p className="section-kicker">{t(locale, 'considerationsLabel')}</p>
            <ul className="route-considerations">
              {route.considerations.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
            {route.avoidedZones.length > 0 && (
              <p className="route-avoid">
                {t(locale, 'avoidsLabel')}: {route.avoidedZones.join(', ')}
              </p>
            )}
            <p className="route-time mono">{formatTime(route.timestamp, locale)}</p>
            <div className="pfz-actions">
              <Button
                size="sm"
                variant="soft"
                onClick={() => {
                  setSelectedId(route.id);
                  focusMap({ center: route.destination, zoom: 9, highlightIds: [route.id] });
                  setLayers([
                    ...new Set<MapLayerId>([...activeLayers, 'routes', 'restricted', 'pfz', 'user_location']),
                  ]);
                  if (profile) {
                    setDrivingRoute({
                      origin: profile.location,
                      destination: route.destination,
                      label: route.name,
                    });
                  }
                }}
              >
                {t(locale, 'viewDrivingPath')}
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
