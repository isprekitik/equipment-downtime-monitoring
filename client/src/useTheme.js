import { useEffect, useState } from 'react';

function getInitialTheme() {
  const savedTheme =
    localStorage.getItem('equipment-theme');

  if (
    savedTheme === 'dark' ||
    savedTheme === 'light'
  ) {
    return savedTheme;
  }

  if (
    window.matchMedia &&
    window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches
  ) {
    return 'dark';
  }

  return 'light';
}

export default function useTheme() {
  const [theme, setTheme] =
    useState(getInitialTheme);

  useEffect(() => {
    localStorage.setItem(
      'equipment-theme',
      theme
    );

    document.documentElement.dataset.theme =
      theme;
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) =>
      current === 'dark'
        ? 'light'
        : 'dark'
    );
  };

  return {
    theme,
    isDark: theme === 'dark',
    toggleTheme,
  };
}