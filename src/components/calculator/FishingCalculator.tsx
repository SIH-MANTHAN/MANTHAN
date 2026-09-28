import { useState } from 'react';
import { useManthan } from '../../context/ManthanContext';
import { ProvenanceBadge } from '../ui/States';
import { Button } from '../ui/Button';
import { computeFishingProbability, tc, type CalcInput } from '../../i18n/calculator';
import '../pfz/Pfz.css';
import './Calculator.css';

const FIELDS: { k: keyof CalcInput; label: 'sst' | 'chl' | 'front' | 'waves' | 'wind'; min: number; max: number; step: number }[] = [
  { k: 'sst', label: 'sst', min: 22, max: 34, step: 0.1 },
  { k: 'chl', label: 'chl', min: 0, max: 5, step: 0.05 },
  { k: 'front', label: 'front', min: 0, max: 2, step: 0.05 },
  { k: 'waves', label: 'waves', min: 0, max: 5, step: 0.1 },
  { k: 'wind', label: 'wind', min: 0, max: 50, step: 1 },
];

export function FishingCalculator() {
  const { dashboard, profile } = useManthan();
  const locale = profile?.locale ?? 'en';
  const initial: CalcInput = {
    sst: dashboard?.ocean.sst.valueC ?? 28,
    chl: dashboard?.ocean.chlorophyll.valueMgM3 ?? 0.5,
    front: 0.6,
    waves: dashboard?.ocean.waves.heightM ?? 1,
    wind: dashboard?.ocean.wind.speedKnots ?? 10,
  };
  const [v, setV] = useState<CalcInput>(initial);
  const r = computeFishingProbability(v);

  return (
    <div className="calc-panel scrollable">
      <p className="section-kicker">{tc(locale, 'navCalc')}</p>
      <h3 className="panel-heading">{tc(locale, 'title')}</h3>
      <p className="panel-sub">{tc(locale, 'sub')}</p>

      <div className={`calc-score band-${r.band}`}>
        <span className="calc-score-label">{tc(locale, 'score')}</span>
        <strong className="mono">{r.score}%</strong>
        <span className="calc-band">{tc(locale, r.band)}</span>
      </div>
      {r.capped && <p className="calc-warn">{tc(locale, 'unsafeNote')}</p>}

      <div className="calc-fields">
        {FIELDS.map((f) => (
          <label key={f.k} className="calc-field">
            <span>
              {tc(locale, f.label)}: <strong className="mono">{Number(v[f.k].toFixed(2))}</strong>
            </span>
            <input
              type="range"
              min={f.min}
              max={f.max}
              step={f.step}
              value={v[f.k]}
              onChange={(e) => setV({ ...v, [f.k]: Number(e.target.value) })}
            />
          </label>
        ))}
      </div>

      <p className="section-kicker" style={{ marginTop: '1rem' }}>{tc(locale, 'factors')}</p>
      <ul className="calc-factors">
        {r.factors.map((f) => (
          <li key={f.key}>
            <span>{tc(locale, f.key)}</span>
            <div className="calc-bar"><div style={{ width: `${Math.round(f.value * 100)}%` }} /></div>
            <span className="mono">{Math.round(f.value * 100)}</span>
          </li>
        ))}
      </ul>

      <div className="calc-foot">
        <Button size="sm" variant="soft" onClick={() => setV(initial)}>{tc(locale, 'reset')}</Button>
        <ProvenanceBadge source={dashboard?.ocean.sst.source} locale={locale} />
      </div>
      <p className="calc-note">{tc(locale, 'prefilled')}</p>
      <p className="calc-note">{tc(locale, 'disclaimer')}</p>
    </div>
  );
}
