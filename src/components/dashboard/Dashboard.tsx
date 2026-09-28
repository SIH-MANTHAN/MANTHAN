import { useEffect } from 'react';
import { useManthan } from '../../context/ManthanContext';
import { SideNav } from '../navigation/SideNav';
import { TopBar } from '../navigation/TopBar';
import { MarineMap } from '../map/MarineMap';
import { OverviewPanel } from './OverviewPanel';
import { AskManthan } from '../chat/AskManthan';
import { PfzPanel } from '../pfz/PfzPanel';
import { SafetyPanel } from '../safety/SafetyPanel';
import { MarineLifePanel } from '../marine/MarineLifePanel';
import { GeofencingPanel } from '../geofencing/GeofencingPanel';
import { RoutesPanel } from '../routes/RoutesPanel';
import { LayersPanel } from '../map/LayersPanel';
import { FishingCalculator } from '../calculator/FishingCalculator';
import './Dashboard.css';

export function Dashboard() {
  const { activePanel, refreshDashboard, dashboardStatus, profile } = useManthan();

  useEffect(() => {
    if (profile) void refreshDashboard();
  }, [profile, refreshDashboard]);

  const panel = (() => {
    switch (activePanel) {
      case 'ask':
        return <AskManthan />;
      case 'pfz':
        return <PfzPanel />;
      case 'safety':
        return <SafetyPanel />;
      case 'marine_life':
        return <MarineLifePanel />;
      case 'geofencing':
        return <GeofencingPanel />;
      case 'routes':
        return <RoutesPanel />;
      case 'layers':
        return <LayersPanel />;
      case 'calculator':
        return <FishingCalculator />;
      default:
        return <OverviewPanel />;
    }
  })();

  return (
    <div className="dashboard">
      <SideNav />
      <div className="dashboard-main">
        <TopBar />
        <div className="dashboard-workspace">
          <aside className={`insight-panel ${activePanel === 'ask' ? 'wide' : ''}`} aria-label="Intelligence panel">
            <div className="insight-inner">{panel}</div>
          </aside>
          <section className="chart-stage" aria-label="Marine chart">
            <div className="chart-frame">
              <MarineMap />
              {dashboardStatus === 'loading' && (
                <div className="chart-loading" aria-live="polite">
                  <span className="spinner" />
                  Updating layers…
                </div>
              )}
              <div className="chart-ornament" aria-hidden>
                <span>N</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
