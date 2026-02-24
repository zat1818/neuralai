import { useState, useEffect } from 'react';
import { safeJsonParse } from '../utils/storage';

export type ThemePreset = 'UMBRELLA' | 'MATRIX' | 'ARCTIC' | 'GHOST' | 'SOVEREIGN' | 'TOXIC' | 'CUSTOM';

interface ThemeConfig {
  preset: ThemePreset;
  bg: string;
  accent: string;
  text: string;
  scanlines: boolean;
  particles: boolean;
  glitch: boolean;
  glowIntensity: number;
}

const DEFAULT_THEME: ThemeConfig = {
  preset: 'UMBRELLA',
  bg: '#050505',
  accent: '#8b0000',
  text: '#cccccc',
  scanlines: true,
  particles: true,
  glitch: true,
  glowIntensity: 50,
};

export function useTheme() {
  const [theme, setTheme] = useState<ThemeConfig>(() => {
    return safeJsonParse(localStorage.getItem('neural_theme'), DEFAULT_THEME);
  });

  useEffect(() => {
    localStorage.setItem('neural_theme', JSON.stringify(theme));
    applyTheme(theme);
  }, [theme]);

  const applyTheme = (config: ThemeConfig) => {
    const root = document.documentElement;
    root.style.setProperty('--color-neural-black', config.bg);
    root.style.setProperty('--color-neural-red', config.accent);
    root.style.setProperty('--color-neural-text', config.text);
    // In a real app, we'd handle more complex CSS variable mapping here
  };

  const resetTheme = () => setTheme(DEFAULT_THEME);

  return { theme, setTheme, resetTheme };
}
