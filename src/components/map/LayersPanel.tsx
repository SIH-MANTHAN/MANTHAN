import { getMapLayers } from '../../services/dataService';
import { useManthan } from '../../context/ManthanContext';
import type { MapLayerId } from '../../types';
import { t, layerLabel, layerDescription } from '../../i18n/ui';
import '../pfz/Pfz.css';
import './Layers.css';

const GROUPS = [
  { id: 'ocean', key: 'groupOcean' },
  { id: 'safety', key: 'groupSafety' },
  { id: 'ops', key: 'groupOps' },
  { id: 'life', key: 'groupLife' },
] as const;

export function LayersPanel() {
  const { activeLayers, toggleLayer, profile } = useManthan();
  const locale = profile?.locale ?? 'en';
  const layers = getMapLayers();

  return (
    <div className="layers-panel scrollable">
      <p className="section-kicker">{t(locale, 'chartLayersKicker')}</p>
      <h3 className="panel-heading">{t(locale, 'mapLayersTitle')}</h3>
      <p className="panel-sub">{t(locale, 'layersDesc')}</p>

      {GROUPS.map((group) => (
        <div key={group.id} className="layer-group">
          <p className="section-kicker">{t(locale, group.key)}</p>
          <ul className="layer-list">
            {layers
              .filter((l) => l.group === group.id)
              .map((layer) => {
                const on = activeLayers.has(layer.id as MapLayerId);
                return (
                  <li key={layer.id}>
                    <button
                      type="button"
                      className={`layer-toggle ${on ? 'on' : ''}`}
                      onClick={() => toggleLayer(layer.id)}
                      aria-pressed={on}
                    >
                      <span className="layer-switch" aria-hidden />
                      <span>
                        <strong>{layerLabel(locale, layer.id as MapLayerId)}</strong>
                        <em>{layerDescription(locale, layer.id as MapLayerId)}</em>
                      </span>
                    </button>
                  </li>
                );
              })}
          </ul>
        </div>
      ))}
    </div>
  );
}
