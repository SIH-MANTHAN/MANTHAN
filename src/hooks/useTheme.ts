import { useCallback, useEffect, useState } from 'react';
import type { ThemeMode } from '../types';

const KEY = 'manthan-theme';

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(KEY) as ThemeMode | null;
    if (saved === 'day' || saved === 'night') return saved;
    return 'day';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(KEY, theme);
  }, [theme]);

  const setTheme = useCallback((mode: ThemeMode) => setThemeState(mode), []);
  const toggleTheme = useCallback(
    () => setThemeState((t) => (t === 'day' ? 'night' : 'day')),
    [],
  );

  return { theme, setTheme, toggleTheme };
}
