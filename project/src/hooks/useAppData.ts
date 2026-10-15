import { useState, useEffect, useCallback, useRef } from 'react';
import type { AppData, Habit, CompletionRecord, Preferences } from '@/types';
import { loadData, saveData, resetData, generateId, isStorageUsable } from '@/lib/storage';
import { createDefaultHabits } from '@/data/defaultHabits';
import { getDateKey } from '@/lib/dateUtils';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export function useAppData() {
  const [data, setData] = useState<AppData>(() => loadData());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [storageAvailable] = useState(() => isStorageUsable());
  const dataRef = useRef(data);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const persist = useCallback((newData: AppData): boolean => {
    const result = saveData(newData);
    if (!result.success) {
      showToast(result.error || 'Failed to save', 'error');
      return false;
    }
    return true;
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = generateId();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addHabit = useCallback((name: string, durationSeconds: number, icon: string): boolean => {
    const trimmed = name.trim();
    if (!trimmed) {
      showToast('Please enter a habit name.', 'error');
      return false;
    }
    if (trimmed.length > 60) {
      showToast('Habit names must be 60 characters or fewer.', 'error');
      return false;
    }
    if (durationSeconds < 1 || durationSeconds > 3600) {
      showToast('Duration must be between 1 second and 1 hour.', 'error');
      return false;
    }

    const now = new Date().toISOString();
    const habit: Habit = {
      id: generateId(),
      name: trimmed,
      durationSeconds,
      icon,
      createdAt: now,
      updatedAt: now,
      archived: false,
    };

    const newData = { ...dataRef.current, habits: [...dataRef.current.habits, habit] };
    setData(newData);
    if (persist(newData)) {
      showToast('Habit added.', 'success');
      return true;
    }
    return false;
  }, [persist, showToast]);

  const updateHabit = useCallback((id: string, updates: Partial<Pick<Habit, 'name' | 'durationSeconds' | 'icon'>>): boolean => {
    const trimmed = (updates.name ?? '').trim();
    if (updates.name !== undefined && !trimmed) {
      showToast('Please enter a habit name.', 'error');
      return false;
    }
    if (updates.name && trimmed.length > 60) {
      showToast('Habit names must be 60 characters or fewer.', 'error');
      return false;
    }
    if (updates.durationSeconds !== undefined && (updates.durationSeconds < 1 || updates.durationSeconds > 3600)) {
      showToast('Duration must be between 1 second and 1 hour.', 'error');
      return false;
    }

    const newData = {
      ...dataRef.current,
      habits: dataRef.current.habits.map(h =>
        h.id === id
          ? {
              ...h,
              name: updates.name !== undefined ? trimmed : h.name,
              durationSeconds: updates.durationSeconds ?? h.durationSeconds,
              icon: updates.icon ?? h.icon,
              updatedAt: new Date().toISOString(),
            }
          : h
      ),
    };
    setData(newData);
    if (persist(newData)) {
      showToast('Habit updated.', 'success');
      return true;
    }
    return false;
  }, [persist, showToast]);

  const archiveHabit = useCallback((id: string): boolean => {
    const newData = {
      ...dataRef.current,
      habits: dataRef.current.habits.map(h =>
        h.id === id ? { ...h, archived: true, updatedAt: new Date().toISOString() } : h
      ),
    };
    setData(newData);
    if (persist(newData)) {
      showToast('Habit removed.', 'success');
      return true;
    }
    return false;
  }, [persist, showToast]);

  const deleteHabit = useCallback((id: string): boolean => {
    const newData = {
      ...dataRef.current,
      habits: dataRef.current.habits.filter(h => h.id !== id),
    };
    setData(newData);
    if (persist(newData)) {
      showToast('Habit deleted.', 'success');
      return true;
    }
    return false;
  }, [persist, showToast]);

  const toggleCompletion = useCallback((habitId: string, dateKey: string = getDateKey()): boolean => {
    const existing = dataRef.current.completions.find(
      c => c.habitId === habitId && c.dateKey === dateKey
    );

    let newCompletions: CompletionRecord[];
    let message: string;

    if (existing) {
      newCompletions = dataRef.current.completions.filter(c => c.id !== existing.id);
      message = 'Completion undone.';
    } else {
      newCompletions = [
        ...dataRef.current.completions,
        {
          id: generateId(),
          habitId,
          dateKey,
          completedAt: new Date().toISOString(),
        },
      ];
      message = 'Nice work. One small win.';
    }

    const newData = { ...dataRef.current, completions: newCompletions };
    setData(newData);
    if (persist(newData)) {
      showToast(message, 'success');
      return true;
    }
    return false;
  }, [persist, showToast]);

  const updatePreferences = useCallback((updates: Partial<Preferences>): boolean => {
    const newData = {
      ...dataRef.current,
      preferences: { ...dataRef.current.preferences, ...updates },
    };
    setData(newData);
    return persist(newData);
  }, [persist]);

  const resetAll = useCallback((): boolean => {
    const defaults = resetData();
    setData(defaults);
    showToast('All data has been reset.', 'success');
    return true;
  }, [showToast]);

  const activeHabits = data.habits.filter(h => !h.archived);
  const todayKey = getDateKey();
  const todayCompletions = data.completions.filter(c => c.dateKey === todayKey);
  const completedHabitIds = new Set(todayCompletions.map(c => c.habitId));

  return {
    data,
    activeHabits,
    allHabits: data.habits,
    completions: data.completions,
    preferences: data.preferences,
    todayCompletions,
    completedHabitIds,
    toasts,
    storageAvailable,
    addHabit,
    updateHabit,
    archiveHabit,
    deleteHabit,
    toggleCompletion,
    updatePreferences,
    resetAll,
    showToast,
    dismissToast,
  };
}

export type UseAppDataReturn = ReturnType<typeof useAppData>;
