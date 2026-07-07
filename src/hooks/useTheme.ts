import { useEffect, useState } from 'react';

type Theme = 'system' | 'light' | 'dark';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('system');

  // Read localStorage after mount (client-only)
  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme;
    if (stored) setTheme(stored);
  }, []);

  const applyTheme = (isDark: boolean) => {
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.classList.toggle('light', !isDark);
  };

  useEffect(() => {
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyTheme(prefersDark);
    } else {
      applyTheme(theme === 'dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') applyTheme(e.matches);
    };
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, [theme]);

  return { theme, setTheme };
}