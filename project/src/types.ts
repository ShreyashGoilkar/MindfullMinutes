export interface Habit {
  id: string;
  name: string;
  durationSeconds: number;
  icon: string;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

export interface CompletionRecord {
  id: string;
  habitId: string;
  dateKey: string;
  completedAt: string;
}

export interface Preferences {
  volume: number;
  reducedMotion: boolean;
}

export interface AppData {
  version: number;
  habits: Habit[];
  completions: CompletionRecord[];
  preferences: Preferences;
}

export type Page = 'dashboard' | 'progress' | 'settings';

export type BreathingPhase = 'inhale' | 'hold' | 'exhale';

export interface BreathingPattern {
  inhale: number;
  hold: number;
  exhale: number;
}

export type IconName = string;
