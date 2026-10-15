import type { AppData, Habit, CompletionRecord, Preferences } from '@/types';
import { STORAGE_KEY, STORAGE_VERSION, generateId, createDefaultHabits } from '@/data/defaultHabits';

const defaultPreferences: Preferences = {
  volume: 0.4,
  reducedMotion: false,
};

function createDefaultData(): AppData {
  return {
    version: STORAGE_VERSION,
    habits: createDefaultHabits(),
    completions: [],
    preferences: { ...defaultPreferences },
  };
}

function isStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

function normalizeHabit(h: Partial<Habit>): Habit | null {
  if (!h || typeof h.id !== 'string' || typeof h.name !== 'string') return null;
  return {
    id: h.id,
    name: h.name,
    durationSeconds: typeof h.durationSeconds === 'number' && h.durationSeconds > 0 ? h.durationSeconds : 60,
    icon: typeof h.icon === 'string' && h.icon.length > 0 ? h.icon : 'Activity',
    createdAt: h.createdAt || new Date().toISOString(),
    updatedAt: h.updatedAt || new Date().toISOString(),
    archived: typeof h.archived === 'boolean' ? h.archived : false,
  };
}

function normalizeCompletion(c: Partial<CompletionRecord>): CompletionRecord | null {
  if (!c || typeof c.id !== 'string' || typeof c.habitId !== 'string' || typeof c.dateKey !== 'string') return null;
  return {
    id: c.id,
    habitId: c.habitId,
    dateKey: c.dateKey,
    completedAt: c.completedAt || new Date().toISOString(),
  };
}

function normalizePreferences(p: Partial<Preferences>): Preferences {
  return {
    volume: typeof p.volume === 'number' && p.volume >= 0 && p.volume <= 1 ? p.volume : defaultPreferences.volume,
    reducedMotion: typeof p.reducedMotion === 'boolean' ? p.reducedMotion : defaultPreferences.reducedMotion,
  };
}

export function loadData(): AppData {
  if (!isStorageAvailable()) {
    return createDefaultData();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const defaults = createDefaultData();
      saveData(defaults);
      return defaults;
    }

    const parsed = JSON.parse(raw);

    const habits = Array.isArray(parsed.habits)
      ? parsed.habits.map(normalizeHabit).filter((h: Habit | null): h is Habit => h !== null)
      : [];

    const completions = Array.isArray(parsed.completions)
      ? parsed.completions.map(normalizeCompletion).filter((c: CompletionRecord | null): c is CompletionRecord => c !== null)
      : [];

    const preferences = normalizePreferences(parsed.preferences || {});

    if (habits.length === 0 && !Array.isArray(parsed.habits)) {
      return createDefaultData();
    }

    return {
      version: STORAGE_VERSION,
      habits: habits.length > 0 ? habits : createDefaultHabits(),
      completions,
      preferences,
    };
  } catch {
    return createDefaultData();
  }
}

export function saveData(data: AppData): { success: boolean; error?: string } {
  if (!isStorageAvailable()) {
    return { success: false, error: 'Browser storage is unavailable. Your changes will not be saved.' };
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return { success: true };
  } catch {
    return { success: false, error: 'Failed to save data. Storage may be full.' };
  }
}

export function resetData(): AppData {
  const defaults = createDefaultData();
  if (isStorageAvailable()) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
    } catch {
      // ignore
    }
  }
  return defaults;
}

export function isStorageUsable(): boolean {
  return isStorageAvailable();
}

export { generateId };
