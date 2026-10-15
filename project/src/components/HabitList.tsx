import { Plus, ListTodo } from 'lucide-react';
import type { Habit } from '@/types';
import { HabitCard, HabitForm } from './HabitCard';
import { EmptyState } from './EmptyState';

interface HabitListProps {
  habits: Habit[];
  completedHabitIds: Set<string>;
  onToggle: (habitId: string) => void;
  onAddHabit: (name: string, durationSeconds: number, icon: string) => boolean;
  onEditHabit: (id: string, updates: { name: string; durationSeconds: number; icon: string }) => boolean;
  onArchiveHabit: (id: string) => void;
  onStartBreathing: () => void;
  isFormOpen: boolean;
  onFormOpen: () => void;
  onFormClose: () => void;
  editingHabit: Habit | null;
  onEditClick: (habit: Habit) => void;
}

export function HabitList({
  habits,
  completedHabitIds,
  onToggle,
  onAddHabit,
  onEditHabit,
  onArchiveHabit,
  onStartBreathing,
  isFormOpen,
  onFormOpen,
  onFormClose,
  editingHabit,
  onEditClick,
}: HabitListProps) {
  // Default habits are the first four; anything else is custom
  const defaultHabitIds = habits.slice(0, 4).map(h => h.id);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text-main">Your daily habits</h2>
        <button onClick={onFormOpen} className="btn-secondary text-sm">
          <Plus className="w-4 h-4" />
          Add habit
        </button>
      </div>

      {habits.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={ListTodo}
            title="No habits yet"
            message="Add your first habit to start building a calmer daily routine."
            action={{ label: 'Add a habit', onClick: onFormOpen }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {habits.map(habit => (
            <HabitCard
              key={habit.id}
              habit={habit}
              isCompleted={completedHabitIds.has(habit.id)}
              onToggle={onToggle}
              onEdit={onEditClick}
              onArchive={onArchiveHabit}
              isCustom={!defaultHabitIds.includes(habit.id)}
            />
          ))}
        </div>
      )}

      <HabitForm
        isOpen={isFormOpen}
        onClose={onFormClose}
        onSave={onAddHabit}
        editingHabit={editingHabit}
      />
    </div>
  );
}
