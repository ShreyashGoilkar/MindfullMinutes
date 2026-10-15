import { useState } from 'react';
import type { Habit } from '@/types';
import { WelcomeSection } from '@/components/WelcomeSection';
import { ProgressSummary } from '@/components/ProgressSummary';
import { HabitList } from '@/components/HabitList';
import { Soundboard } from '@/components/Soundboard';
import { NextStep } from '@/components/NextStep';
import { BreathingSession } from '@/components/BreathingSession';
import type { UseAppDataReturn } from '@/hooks/useAppData';

interface DashboardPageProps {
  app: UseAppDataReturn;
  breathingModalOpen: boolean;
  setBreathingModalOpen: (open: boolean) => void;
  audio: {
    currentSound: import('@/lib/audio').SoundType | null;
    isPlaying: boolean;
    volume: number;
    error: string | null;
    toggle: (type: import('@/lib/audio').SoundType) => void;
    setVolume: (vol: number) => void;
  };
}

function getProgressMessage(completed: number, total: number): string {
  if (total === 0) return 'Add a habit to begin.';
  if (completed === 0) return 'Ready when you are.';
  if (completed === total) return 'Every habit done today. Well done.';
  if (completed >= total / 2) return "You're making time for yourself.";
  return 'A good start. Keep going.';
}

export function DashboardPage({
  app,
  breathingModalOpen,
  setBreathingModalOpen,
  audio,
}: DashboardPageProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const completedCount = app.completedHabitIds.size;
  const totalHabits = app.activeHabits.length;
  const percentage = totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0;
  const progressMessage = getProgressMessage(completedCount, totalHabits);

  const breathingHabit = app.activeHabits.find(
    h => h.icon === 'Wind' || h.name.toLowerCase().includes('breathing')
  );
  const hasCompletedBreathing = breathingHabit
    ? app.completedHabitIds.has(breathingHabit.id)
    : false;

  const handleEditClick = (habit: Habit) => {
    setEditingHabit(habit);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingHabit(null);
  };

  const handleSaveHabit = (name: string, durationSeconds: number, icon: string): boolean => {
    if (editingHabit) {
      return app.updateHabit(editingHabit.id, { name, durationSeconds, icon });
    } else {
      return app.addHabit(name, durationSeconds, icon);
    }
  };

  const handleArchive = (habit: Habit) => {
    // Check if habit has any completion history
    const hasHistory = app.completions.some(c => c.habitId === habit.id);
    if (hasHistory) {
      if (window.confirm(`"${habit.name}" has saved completion history. Removing it will hide it from your daily list, but past records will be kept for progress tracking. Continue?`)) {
        app.archiveHabit(habit.id);
      }
    } else {
      app.archiveHabit(habit.id);
    }
  };

  return (
    <div className="max-w-container mx-auto px-4 sm:px-6 py-6">
      <WelcomeSection onStartReset={() => setBreathingModalOpen(true)} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2">
          <ProgressSummary
            completed={completedCount}
            total={totalHabits}
            percentage={percentage}
            message={progressMessage}
          />
        </div>
        <div>
          <NextStep
            habits={app.activeHabits}
            completedHabitIds={app.completedHabitIds}
            onStartBreathing={() => setBreathingModalOpen(true)}
          />
        </div>
      </div>

      <div className="mb-8" id="habit-list-section">
        <HabitList
          habits={app.activeHabits}
          completedHabitIds={app.completedHabitIds}
          onToggle={app.toggleCompletion}
          onAddHabit={handleSaveHabit}
          onEditHabit={app.updateHabit}
          onArchiveHabit={handleArchive}
          onStartBreathing={() => setBreathingModalOpen(true)}
          isFormOpen={isFormOpen}
          onFormOpen={() => { setEditingHabit(null); setIsFormOpen(true); }}
          onFormClose={handleFormClose}
          editingHabit={editingHabit}
          onEditClick={handleEditClick}
        />
      </div>

      <div className="card p-5 mb-8">
        <Soundboard
          currentSound={audio.currentSound}
          isPlaying={audio.isPlaying}
          volume={audio.volume}
          error={audio.error}
          onToggle={audio.toggle}
          onVolumeChange={vol => {
            audio.setVolume(vol);
            app.updatePreferences({ volume: vol });
          }}
        />
      </div>

      {!app.storageAvailable && (
        <div className="card p-4 mb-6 border-error/20 bg-error/5">
          <p className="text-sm text-error">
            Browser storage is unavailable. Your habits and progress won't be saved between sessions.
          </p>
        </div>
      )}

      <BreathingSession
        isOpen={breathingModalOpen}
        onClose={() => setBreathingModalOpen(false)}
        onComplete={() => {}}
        onMarkComplete={() => {
          if (breathingHabit) {
            app.toggleCompletion(breathingHabit.id);
          }
        }}
        hasCompletedBreathingHabit={hasCompletedBreathing}
        reducedMotion={app.preferences.reducedMotion}
      />
    </div>
  );
}
