import { MapPin } from 'lucide-react';
import { useManthan } from '../../context/ManthanContext';
import { formatTime } from '../../utils/format';
import { Button } from '../ui/Button';
import { EmptyState, LoadingState } from '../ui/States';
import { t } from '../../i18n/ui';
import '../pfz/Pfz.css';
import './MarineLife.css';

export function MarineLifePanel() {
  const { dashboard, dashboardStatus, focusMap, selectedId, setSelectedId, profile } = useManthan();
  const locale = profile?.locale ?? 'en';

  if (dashboardStatus === 'loading' && !dashboard) return <LoadingState label={t(locale, 'loadingObservations')} />;
  if (!dashboard?.marineLife.length) {
    return <EmptyState title={t(locale, 'noObservations')} detail={t(locale, 'observationsWillAppear')} />;
  }

  return (
    <div className="life-panel scrollable">
      <p className="section-kicker">{t(locale, 'marineLifeKicker')}</p>
      <h3 className="panel-heading">{t(locale, 'recentObservations')}</h3>
      <p className="panel-sub">{t(locale, 'sightingsLinked')}</p>

      <ul className="life-list">
        {dashboard.marineLife.map((obs) => (
          <li key={obs.id} className={`life-card ${selectedId === obs.id ? 'selected' : ''}`}>
            <div className={`life-badge cat-${obs.category}`} aria-hidden />
            <div className="life-body">
              <h4>{obs.commonName}</h4>
              <p className="life-latin">{obs.species}</p>
              <p className="life-notes">{obs.notes}</p>
              <p className="life-meta mono">
                {obs.count} {t(locale, 'observedSuffix')} · {obs.confidence} {t(locale, 'confidenceSuffix')} ·{' '}
                {formatTime(obs.observedAt, locale)}
              </p>
              <p className="life-meta">{obs.observer}</p>
              <Button
                size="sm"
                variant="soft"
                onClick={() => {
                  setSelectedId(obs.id);
                  focusMap({ center: obs.location, zoom: 9, highlightIds: [obs.id] });
                }}
              >
                <MapPin size={14} /> {t(locale, 'viewOnMap')}
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
