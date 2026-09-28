import { useManthan } from '../../context/ManthanContext';
import { EmptyState, LoadingState, SeverityPill, ProvenanceBadge } from '../ui/States';
import { Button } from '../ui/Button';
import { t, geofenceTypeLabel } from '../../i18n/ui';
import { cleanSource } from '../../utils/provenance';
import '../pfz/Pfz.css';
import './Geofencing.css';

export function GeofencingPanel() {
  const { dashboard, dashboardStatus, selectedId, setSelectedId, focusMap, setLayers, activeLayers, profile } =
    useManthan();
  const locale = profile?.locale ?? 'en';

  if (dashboardStatus === 'loading' && !dashboard) return <LoadingState label={t(locale, 'loadingBoundaries')} />;
  if (!dashboard?.geofences.length) return <EmptyState title={t(locale, 'noGeofenceData')} />;

  return (
    <div className="geo-panel scrollable">
      <p className="section-kicker">{t(locale, 'geofencingKicker')}</p>
      <h3 className="panel-heading">{t(locale, 'boundariesProtected')}</h3>
      <p className="panel-sub">{t(locale, 'geofencingDesc')}</p>

      <ul className="geo-list">
        {dashboard.geofences.map((g) => (
          <li key={g.id} className={`geo-card type-${g.type} ${selectedId === g.id ? 'selected' : ''}`}>
            <div className="geo-top">
              <div>
                <p className="geo-type">{geofenceTypeLabel(locale, g.type)}</p>
                <h4>{g.name}</h4>
              </div>
              <SeverityPill severity={g.severity} locale={locale} />
            </div>
            <p className="geo-desc">{g.description}</p>
            <p className="geo-warn">{g.warningMessage}</p>
            <p className="geo-source mono">
              {cleanSource(g.source)} <ProvenanceBadge source={g.source} locale={locale} />
            </p>
            <Button
              size="sm"
              variant="soft"
              onClick={() => {
                setSelectedId(g.id);
                const c = g.polygon[0];
                focusMap({ center: c, zoom: 9, highlightIds: [g.id] });
                const next = new Set(activeLayers);
                if (g.type === 'mpa') next.add('mpa');
                else if (g.type === 'restricted') next.add('restricted');
                else if (g.type === 'esa') next.add('esa');
                else if (g.type === 'maritime_boundary') next.add('maritime_boundary');
                else next.add('geofences');
                setLayers(Array.from(next));
              }}
            >
              {t(locale, 'focusOnMap')}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
