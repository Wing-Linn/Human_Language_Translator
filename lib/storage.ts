import { AppSettings, FavoriteEntry, HistoryEntry } from './types';

const KEYS = {
  history: 'human-translator:history',
  favorites: 'human-translator:favorites',
  settings: 'human-translator:settings',
  ai: 'human-translator:ai',
} as const;

const HISTORY_LIMIT = 100;

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export const storageAvailable = (): boolean => {
  try {
    const k = '__ht_test__';
    localStorage.setItem(k, '1');
    localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
};

export function loadHistory(): HistoryEntry[] {
  const data = readJson<HistoryEntry[]>(KEYS.history);
  if (!Array.isArray(data)) return [];
  return data
    .filter(
      (e) =>
        e &&
        typeof e.id === 'string' &&
        typeof e.inputText === 'string' &&
        e.result &&
        typeof e.result === 'object'
    )
    .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
}

export function saveHistoryEntry(entry: HistoryEntry): HistoryEntry[] {
  const list = [entry, ...loadHistory().filter((e) => e.id !== entry.id)].slice(0, HISTORY_LIMIT);
  writeJson(KEYS.history, list);
  return list;
}

export function deleteHistoryEntry(id: string): HistoryEntry[] {
  const list = loadHistory().filter((e) => e.id !== id);
  writeJson(KEYS.history, list);
  return list;
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(KEYS.history);
  } catch {
    // ignore
  }
}

export function loadFavorites(): FavoriteEntry[] {
  const data = readJson<FavoriteEntry[]>(KEYS.favorites);
  if (!Array.isArray(data)) return [];
  return data
    .filter((e) => e && typeof e.id === 'string' && typeof e.content === 'string')
    .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
}

export function saveFavoriteEntry(entry: FavoriteEntry): FavoriteEntry[] {
  const list = [entry, ...loadFavorites().filter((e) => e.id !== entry.id)];
  writeJson(KEYS.favorites, list);
  return list;
}

export function deleteFavoriteEntry(id: string): FavoriteEntry[] {
  const list = loadFavorites().filter((e) => e.id !== id);
  writeJson(KEYS.favorites, list);
  return list;
}

const DEFAULT_SETTINGS: AppSettings = { version: 1, autoSaveHistory: true };

export function loadSettings(): AppSettings {
  const data = readJson<Partial<AppSettings>>(KEYS.settings);
  if (!data || typeof data !== 'object') return { ...DEFAULT_SETTINGS };
  return {
    version: 1,
    autoSaveHistory: data.autoSaveHistory !== false,
  };
}

export function saveSettings(settings: AppSettings): void {
  writeJson(KEYS.settings, settings);
}

export interface AiConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

export function loadAiConfig(): AiConfig | null {
  const data = readJson<Partial<AiConfig>>(KEYS.ai);
  if (!data || typeof data.apiKey !== 'string' || typeof data.model !== 'string') return null;
  if (!data.apiKey.trim() || !data.model.trim()) return null;
  return {
    apiKey: data.apiKey.trim().slice(0, 200),
    baseUrl: (data.baseUrl ?? '').trim().slice(0, 300),
    model: data.model.trim().slice(0, 100),
  };
}

export function saveAiConfig(config: AiConfig): void {
  writeJson(KEYS.ai, {
    apiKey: config.apiKey.trim(),
    baseUrl: config.baseUrl.trim(),
    model: config.model.trim(),
  });
}

export function clearAiConfig(): void {
  try {
    localStorage.removeItem(KEYS.ai);
  } catch {
    // ignore
  }
}

export function clearAllLocalData(): void {
  try {
    localStorage.removeItem(KEYS.history);
    localStorage.removeItem(KEYS.favorites);
    localStorage.removeItem(KEYS.settings);
    localStorage.removeItem(KEYS.ai);
  } catch {
    // ignore
  }
}
