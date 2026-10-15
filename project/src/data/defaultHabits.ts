import type { Habit } from '@/types';

export const STORAGE_KEY = 'mindfulminute:data';
export const STORAGE_VERSION = 1;

export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createDefaultHabits(): Habit[] {
  const now = new Date().toISOString();
  return [
    {
      id: generateId(),
      name: 'One-minute breathing',
      durationSeconds: 60,
      icon: 'Wind',
      createdAt: now,
      updatedAt: now,
      archived: false,
    },
    {
      id: generateId(),
      name: 'Drink a glass of water',
      durationSeconds: 30,
      icon: 'GlassWater',
      createdAt: now,
      updatedAt: now,
      archived: false,
    },
    {
      id: generateId(),
      name: 'Stretch and reset',
      durationSeconds: 120,
      icon: 'Activity',
      createdAt: now,
      updatedAt: now,
      archived: false,
    },
    {
      id: generateId(),
      name: 'Write one gratitude note',
      durationSeconds: 60,
      icon: 'NotebookPen',
      createdAt: now,
      updatedAt: now,
      archived: false,
    },
  ];
}
