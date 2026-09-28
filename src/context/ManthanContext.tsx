import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  ChatMessage,
  Coordinates,
  DashboardSnapshot,
  LocaleCode,
  MapLayerId,
  PanelId,
  ThemeMode,
  UserProfile,
} from '../types';
import type { DrivingRouteRequest } from '../utils/maps';
import { useTheme } from '../hooks/useTheme';
import { fetchDashboard } from '../services/dataService';
import { fetchLiveOcean, waveSeverity, windSeverity } from '../services/liveOceanService';
import { askManthan } from '../services/chatService';
import { askLlm, llmConfigured } from '../services/llmService';
import { mapLayers } from '../data/mock/marine';
import { localizeChat, resolveChatLocale } from '../i18n/chat';
import { t, weatherCodeLabel } from '../i18n/ui';
import { uid } from '../utils/format';

const PROFILE_KEY = 'manthan-profile';

interface MapFocus {
  center: Coordinates;
  zoom?: number;
  highlightIds?: string[];
}

interface ManthanContextValue {
  theme: ThemeMode;
  toggleTheme: () => void;
  profile: UserProfile | null;
  completeOnboarding: (profile: UserProfile) => void;
  resetOnboarding: () => void;
  setLocale: (locale: LocaleCode) => void;
  dashboard: DashboardSnapshot | null;
  dashboardStatus: 'idle' | 'loading' | 'success' | 'error';
  refreshDashboard: () => Promise<void>;
  activePanel: PanelId;
  setActivePanel: (p: PanelId) => void;
  activeLayers: Set<MapLayerId>;
  toggleLayer: (id: MapLayerId) => void;
  setLayers: (ids: MapLayerId[]) => void;
  messages: ChatMessage[];
  chatStatus: 'idle' | 'planning' | 'error';
  sendMessage: (text: string) => Promise<void>;
  mapFocus: MapFocus | null;
  focusMap: (focus: MapFocus) => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  geofenceWarning: string | null;
  dismissGeofenceWarning: () => void;
  drivingRoute: DrivingRouteRequest | null;
  setDrivingRoute: (route: DrivingRouteRequest | null) => void;
}

const ManthanContext = createContext<ManthanContextValue | null>(null);

export function loadSavedProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UserProfile;
    return parsed.onboardingComplete ? parsed : null;
  } catch {
    return null;
  }
}

const defaultLayers = new Set<MapLayerId>(
  mapLayers.filter((l) => l.defaultOn).map((l) => l.id),
);

function buildChatSeed(locale: LocaleCode): ChatMessage[] {
  return [
    {
      id: 'sys-1',
      role: 'system',
      content: t(locale, 'chatSeedMessage'),
      timestamp: new Date().toISOString(),
    },
  ];
}

export function ManthanProvider({ children }: { children: ReactNode }) {
  const { theme, toggleTheme } = useTheme();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [dashboard, setDashboard] = useState<DashboardSnapshot | null>(null);
  const [dashboardStatus, setDashboardStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [activePanel, setActivePanel] = useState<PanelId>('overview');
  const [activeLayers, setActiveLayers] = useState<Set<MapLayerId>>(defaultLayers);
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    buildChatSeed('en'),
  );
  const [chatStatus, setChatStatus] = useState<'idle' | 'planning' | 'error'>('idle');
  const [mapFocus, setMapFocus] = useState<MapFocus | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [geofenceWarning, setGeofenceWarning] = useState<string | null>(null);
  const [drivingRoute, setDrivingRoute] = useState<DrivingRouteRequest | null>(null);

  const refreshDashboard = useCallback(async () => {
    setDashboardStatus('loading');
    try {
      const locale = profile?.locale ?? 'en';
      const data = await fetchDashboard(profile?.location, profile?.locationLabel, locale);

      // Layer in genuinely live, free (no-key) marine + weather readings from
      // Open-Meteo wherever the network allows it. Silently keeps the dated
      // reference/mock figures if the fetch fails (offline demo, blocked
      // network, etc.) — never breaks the dashboard.
      const live = await fetchLiveOcean(data.location);
      if (live.marine?.waveHeightM != null) {
        const newWave = {
          ...data.ocean.waves,
          heightM: Number(live.marine.waveHeightM.toFixed(2)),
          periodS: live.marine.wavePeriodS ?? data.ocean.waves.periodS,
          directionDeg: live.marine.waveDirectionDeg ?? data.ocean.waves.directionDeg,
          severity: waveSeverity(live.marine.waveHeightM),
          timestamp: live.fetchedAt,
          source: 'Open-Meteo Marine (live)',
        };
        data.ocean.waves = newWave;
        data.safety.wave = newWave;
      }
      if (live.marine?.seaSurfaceTempC != null) {
        data.ocean.sst = {
          ...data.ocean.sst,
          valueC: Number(live.marine.seaSurfaceTempC.toFixed(1)),
          timestamp: live.fetchedAt,
          source: 'Open-Meteo Marine (live)',
        };
      }
      if (live.weather?.windSpeedKnots != null) {
        const newWind = {
          ...data.ocean.wind,
          speedKnots: Math.round(live.weather.windSpeedKnots),
          gustKnots:
            live.weather.windGustKnots != null
              ? Math.round(live.weather.windGustKnots)
              : data.ocean.wind.gustKnots,
          directionDeg: live.weather.windDirectionDeg ?? data.ocean.wind.directionDeg,
          severity: windSeverity(live.weather.windSpeedKnots),
          timestamp: live.fetchedAt,
          source: 'Open-Meteo Weather (live)',
        };
        data.ocean.wind = newWind;
        data.safety.wind = newWind;
      }
      if (live.weather?.temperatureC != null) {
        const newWeather = {
          ...data.ocean.weather,
          temperatureC: Math.round(live.weather.temperatureC),
          humidityPct: live.weather.humidityPct ?? data.ocean.weather.humidityPct,
          pressureHpa: live.weather.pressureHpa ?? data.ocean.weather.pressureHpa,
          description:
            live.weather.weatherCode != null
              ? weatherCodeLabel(locale, live.weather.weatherCode)
              : data.ocean.weather.description,
          timestamp: live.fetchedAt,
          source: 'Open-Meteo Weather (live)',
        };
        data.ocean.weather = newWeather;
        data.safety.weather = newWeather;
      }

      setDashboard(data);
      setDashboardStatus('success');
      if (data.geofences.some((g) => g.type === 'restricted')) {
        const near = data.geofences.find((g) => g.type === 'restricted');
        if (near) setGeofenceWarning(near.warningMessage);
      }
    } catch {
      setDashboardStatus('error');
    }
  }, [profile?.location, profile?.locationLabel, profile?.locale]);

  const completeOnboarding = useCallback((p: UserProfile) => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
    setProfile(p);
    setActivePanel('overview');
    setMessages(buildChatSeed(p.locale));
  }, []);

  const setLocale = useCallback((locale: LocaleCode) => {
    setProfile((prev) => {
      if (!prev) return prev;
      const next = { ...prev, locale };
      localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
      return next;
    });
    // Only replace the seed greeting — never touch an in-progress conversation.
    setMessages((prev) =>
      prev.length === 1 && prev[0].id === 'sys-1' ? buildChatSeed(locale) : prev,
    );
  }, []);

  const resetOnboarding = useCallback(() => {
    localStorage.removeItem(PROFILE_KEY);
    setProfile(null);
    setDashboard(null);
    setMessages(buildChatSeed('en'));
  }, []);

  const toggleLayer = useCallback((id: MapLayerId) => {
    setActiveLayers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const setLayers = useCallback((ids: MapLayerId[]) => {
    setActiveLayers(new Set(ids));
  }, []);

  const focusMap = useCallback((focus: MapFocus) => {
    setMapFocus(focus);
    if (focus.highlightIds?.[0]) setSelectedId(focus.highlightIds[0]);
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const preferred = profile?.locale ?? 'en';
      const locale = resolveChatLocale(trimmed, preferred);
      const userMsg: ChatMessage = {
        id: uid('user'),
        role: 'user',
        content: trimmed,
        timestamp: new Date().toISOString(),
        locale,
      };
      setMessages((m) => [...m, userMsg]);
      setChatStatus('planning');
      setActivePanel('ask');

      const planningText = localizeChat('default', locale, {}).planning;
      const pending: ChatMessage = {
        id: uid('pending'),
        role: 'assistant',
        content: planningText,
        timestamp: new Date().toISOString(),
        status: 'planning',
        locale,
      };
      setMessages((m) => [...m, pending]);

      try {
        let reply: ChatMessage | null = null;
        if (llmConfigured()) {
          const llmText = await askLlm(trimmed, locale, dashboard);
          if (llmText) {
            reply = {
              id: uid('assistant'),
              role: 'assistant',
              content: llmText,
              timestamp: new Date().toISOString(),
              locale,
            };
          }
        }
        if (!reply) {
          reply = await askManthan(trimmed, locale, profile?.location);
        }
        setMessages((m) => m.filter((x) => x.id !== pending.id).concat(reply!));
        setChatStatus('idle');
        if (reply.explanation?.mapFocus) {
          const mf = reply.explanation.mapFocus;
          focusMap({
            center: mf.center,
            zoom: mf.zoom,
            highlightIds: mf.highlightIds,
          });
          if (mf.layers?.length) {
            setActiveLayers((prev) => {
              const next = new Set(prev);
              mf.layers!.forEach((l) => next.add(l));
              return next;
            });
          }
        }
      } catch {
        setMessages((m) =>
          m
            .filter((x) => x.id !== pending.id)
            .concat({
              id: uid('err'),
              role: 'assistant',
              content: t(locale, 'unableToComplete'),
              timestamp: new Date().toISOString(),
              status: 'error',
            }),
        );
        setChatStatus('error');
      }
    },
    [focusMap, profile?.location, profile?.locale, dashboard],
  );

  const value = useMemo<ManthanContextValue>(
    () => ({
      theme,
      toggleTheme,
      profile,
      completeOnboarding,
      resetOnboarding,
      setLocale,
      dashboard,
      dashboardStatus,
      refreshDashboard,
      activePanel,
      setActivePanel,
      activeLayers,
      toggleLayer,
      setLayers,
      messages,
      chatStatus,
      sendMessage,
      mapFocus,
      focusMap,
      selectedId,
      setSelectedId,
      geofenceWarning,
      dismissGeofenceWarning: () => setGeofenceWarning(null),
      drivingRoute,
      setDrivingRoute,
    }),
    [
      theme,
      toggleTheme,
      profile,
      completeOnboarding,
      resetOnboarding,
      setLocale,
      dashboard,
      dashboardStatus,
      refreshDashboard,
      activePanel,
      activeLayers,
      toggleLayer,
      setLayers,
      messages,
      chatStatus,
      sendMessage,
      mapFocus,
      focusMap,
      selectedId,
      geofenceWarning,
      drivingRoute,
    ],
  );

  return <ManthanContext.Provider value={value}>{children}</ManthanContext.Provider>;
}

export function useManthan() {
  const ctx = useContext(ManthanContext);
  if (!ctx) throw new Error('useManthan must be used within ManthanProvider');
  return ctx;
}
