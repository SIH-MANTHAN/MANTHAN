import { MapPin, Navigation } from 'lucide-react';
import { useManthan } from '../../context/ManthanContext';
import { navigateToCoordinates } from '../../services/dataService';
import { formatDistance, formatTime } from '../../utils/format';
import { Button } from '../ui/Button';
import { EmptyState, LoadingState, SafetyPill, ProvenanceBadge } from '../ui/States';
import { t, productivityLabel } from '../../i18n/ui';
import type { MapLayerId } from '../../types';
import './Pfz.css';

export function PfzPanel() {
  const { dashboard, dashboardStatus, focusMap, selectedId, setSelectedId, refreshDashboard, profile, setDrivingRoute, setActivePanel, setLayers, activeLayers } =
    useManthan();
  const locale = profile?.locale ?? 'en';

  if (dashboardStatus === 'loading' && !dashboard) return <LoadingState label={t(locale, 'loadingFishingGrounds')} />;
  if (!dashboard) return <EmptyState title={t(locale, 'noPfzData')} detail={t(locale, 'noPfzDataDetail')} />;

  const items = dashboard.nearbyPfz;

  if (!items.length) {
    return <EmptyState title={t(locale, 'noNearbyPfz')} detail={t(locale, 'noAdvisoryZones')} />;
  }

  return (
    <div className="pfz-panel scrollable">
      <p className="section-kicker">{t(locale, 'fishingIntel')}</p>
      <h3 className="panel-heading">{t(locale, 'nearbyPfz')}</h3>
      <p className="panel-sub">{t(locale, 'pfzSub')}</p>

      <ul className="pfz-list">
        {items.map((pfz) => (
          <li key={pfz.id} className={`pfz-card ${selectedId === pfz.id ? 'selected' : ''}`}>
            <header className="pfz-card-head">
              <div>
                <h4>{pfz.name}</h4>
                <p className="pfz-meta mono">
                  {pfz.id.toUpperCase()} · {formatDistance(pfz.distanceKm)}
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: 'flex-end' }}>
                <SafetyPill status={pfz.safety} locale={locale} />
                <ProvenanceBadge source={pfz.source} locale={locale} />
              </div>
            </header>

            <div className="pfz-metrics">
              <div>
                <span>SST</span>
                <strong className="mono">{pfz.sstC}°C</strong>
              </div>
              <div>
                <span>Chl-a</span>
                <strong className="mono">{pfz.chlorophyllMgM3}</strong>
              </div>
              <div>
                <span>{t(locale, 'wavesLabel')}</span>
                <strong className="mono">{pfz.waveHeightM} m</strong>
              </div>
              <div>
                <span>{t(locale, 'windLabel')}</span>
                <strong className="mono">{pfz.windKnots} kt</strong>
              </div>
            </div>

            <p className="pfz-signal">
              {t(locale, 'productivity')}: <strong>{productivityLabel(locale, pfz.productivity)}</strong>
              <span className="pfz-valid mono">
                {t(locale, 'validUntil')} {formatTime(pfz.validUntil, locale)}
              </span>
            </p>

            <div className="pfz-actions">
              <Button
                size="sm"
                variant="soft"
                onClick={() => {
                  setSelectedId(pfz.id);
                  focusMap({ center: pfz.center, zoom: 9, highlightIds: [pfz.id] });
                }}
              >
                <MapPin size={14} /> {t(locale, 'viewOnMap')}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  const origin = profile?.location;
                  if (origin) {
                    setDrivingRoute({
                      origin,
                      destination: pfz.center,
                      label: pfz.name,
                    });
                    setLayers([
                      ...new Set<MapLayerId>([...activeLayers, 'routes', 'user_location', 'pfz']),
                    ]);
                    setActivePanel('overview');
                    focusMap({ center: pfz.center, zoom: 10, highlightIds: [pfz.id] });
                  }
                  navigateToCoordinates(pfz.center, origin, pfz.name);
                }}
              >
                <Navigation size={14} /> {t(locale, 'navigate')}
              </Button>
            </div>
          </li>
        ))}
      </ul>

      {dashboardStatus === 'error' && (
        <button type="button" className="link-btn" onClick={() => void refreshDashboard()}>
          {t(locale, 'retryLoad')}
        </button>
      )}
    </div>
  );
}
