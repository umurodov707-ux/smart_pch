import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'smartpch-theme';
const ThemeContext = createContext(null);

function readInitialTheme() {
  // index.html dagi skript sahifa chizilishidan oldin data-theme ni qo'yib bo'lgan
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(readInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'light' ? '#ffffff' : '#0b1120');
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {
      // Maxfiy rejimda localStorage yopiq bo'lishi mumkin
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
