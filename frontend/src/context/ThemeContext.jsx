import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({ theme: 'light', toggleTheme: () => {} });

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const stored = localStorage.getItem('notepediax-theme');
    const sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = stored || (sysDark ? 'dark' : 'light');
    apply(initial);
  }, []);

  function apply(t) {
    setTheme(t);
    document.documentElement.setAttribute('data-theme', t);
    document.documentElement.classList.toggle('dark', t === 'dark');
    localStorage.setItem('notepediax-theme', t);
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme: () => apply(theme === 'light' ? 'dark' : 'light') }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
