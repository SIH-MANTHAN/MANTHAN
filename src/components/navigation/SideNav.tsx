import {
  Calculator,
  Compass,
  Fish,
  Layers,
  LifeBuoy,
  Map as MapIcon,
  MessageCircle,
  Route,
  Shield,
} from 'lucide-react';
import type { PanelId } from '../../types';
import { useManthan } from '../../context/ManthanContext';
import { t, type UiKey } from '../../i18n/ui';
import { tc } from '../../i18n/calculator';
import './SideNav.css';

const ITEMS: { id: PanelId; key?: UiKey; calc?: boolean; icon: typeof MapIcon }[] = [
  { id: 'overview', key: 'navOverview', icon: Compass },
  { id: 'ask', key: 'navAsk', icon: MessageCircle },
  { id: 'pfz', key: 'navPfz', icon: Fish },
  { id: 'safety', key: 'navSafety', icon: Shield },
  { id: 'marine_life', key: 'navLife', icon: LifeBuoy },
  { id: 'geofencing', key: 'navZones', icon: MapIcon },
  { id: 'routes', key: 'navRoutes', icon: Route },
  { id: 'calculator', calc: true, icon: Calculator },
  { id: 'layers', key: 'navLayers', icon: Layers },
];

export function SideNav() {
  const { activePanel, setActivePanel, profile } = useManthan();
  const locale = profile?.locale ?? 'en';

  return (
    <nav className="side-nav" aria-label="MANTHAN navigation">
      <div className="side-brand" title="MANTHAN">
        <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden>
          <rect width="32" height="32" rx="7" fill="var(--accent)" />
          <path
            d="M5 20c3-4 5-5 7-3s2 5 5 4 4-4 7-2"
            stroke="#FBF5E8"
            strokeWidth="1.8"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="23" cy="10" r="2" fill="var(--gold)" />
        </svg>
      </div>
      <ul className="side-list">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const active = activePanel === item.id;
          const label = item.calc ? tc(locale, 'navCalc') : t(locale, item.key!);
          return (
            <li key={item.id}>
              <button
                type="button"
                className={`side-item ${active ? 'active' : ''}`}
                onClick={() => setActivePanel(item.id)}
                aria-current={active ? 'page' : undefined}
                title={label}
              >
                <Icon size={18} strokeWidth={1.75} />
                <span>{label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
