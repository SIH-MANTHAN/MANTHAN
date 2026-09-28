import { ManthanProvider, useManthan } from './context/ManthanContext';
import { Onboarding } from './components/onboarding/Onboarding';
import { Dashboard } from './components/dashboard/Dashboard';
import './App.css';

function Shell() {
  const { profile } = useManthan();
  return profile?.onboardingComplete ? <Dashboard /> : <Onboarding />;
}

export default function App() {
  return (
    <ManthanProvider>
      <Shell />
    </ManthanProvider>
  );
}
