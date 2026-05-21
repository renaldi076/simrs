const PREFIX = 'simrs_';

export const storageService = {
  get<T>(key: string): T | null {
    const item = localStorage.getItem(PREFIX + key);
    if (!item) return null;
    try {
      return JSON.parse(item) as T;
    } catch {
      return null;
    }
  },
  set<T>(key: string, value: T): void {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  },
  remove(key: string): void {
    localStorage.removeItem(PREFIX + key);
  },
  clear(): void {
    Object.keys(localStorage)
      .filter(k => k.startsWith(PREFIX))
      .forEach(k => localStorage.removeItem(k));
  },
};
