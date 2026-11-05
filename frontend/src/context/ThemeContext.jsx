import { useEffect, useMemo, useState } from 'react';
import ThemeContext from './ThemeContextValue';

function getInitialTheme() {
  try {
    return localStorage.getItem('hostex_theme') === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('hostex_theme', theme);
    } catch {
      // The selected theme remains active for this session when storage is unavailable.
    }
  }, [theme]);

  const value = useMemo(() => ({
    theme,
    toggleTheme: () => setTheme((current) => current === 'dark' ? 'light' : 'dark'),
  }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
