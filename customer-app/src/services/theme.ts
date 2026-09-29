export type Theme = 'light' | 'dark';

const THEME_KEY = 'cloth_shop_theme';

class ThemeService {
  private currentTheme: Theme = 'light';
  private listeners: ((theme: Theme) => void)[] = [];

  constructor() {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(THEME_KEY) as Theme : null;
    if (saved === 'dark' || saved === 'light') {
      this.currentTheme = saved;
    } else {
      // Default to Light Mode as preferred by user
      this.currentTheme = 'light';
    }
    this.applyTheme(this.currentTheme);
  }

  getTheme(): Theme {
    return this.currentTheme;
  }

  setTheme(theme: Theme) {
    this.currentTheme = theme;
    localStorage.setItem(THEME_KEY, theme);
    this.applyTheme(theme);
    this.notify();
  }

  toggleTheme() {
    this.setTheme(this.currentTheme === 'dark' ? 'light' : 'dark');
  }

  subscribe(callback: (theme: Theme) => void) {
    this.listeners.push(callback);
    callback(this.currentTheme);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private applyTheme(theme: Theme) {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }

  private notify() {
    this.listeners.forEach(cb => cb(this.currentTheme));
  }
}

export const themeService = new ThemeService();
