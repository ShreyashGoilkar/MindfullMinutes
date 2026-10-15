import { useState, useEffect } from 'react';
import { Check, Undo2, Pencil, Archive } from 'lucide-react';
import type { Habit } from '@/types';
import { getIcon, HABIT_ICONS, ICON_NAMES } from '@/components/icons';
import { formatDuration } from '@/lib/dateUtils';
import { Modal } from './Modal';

interface HabitCardProps {
  habit: Habit;
  isCompleted: boolean;
  onToggle: (habitId: string) => void;
  onEdit: (habit: Habit) => void;
  onArchive: (habit: Habit) => void;
  isCustom: boolean;
}

export function HabitCard({ habit, isCompleted, onToggle, onEdit, onArchive, isCustom }: HabitCardProps) {
  const Icon = getIcon(habit.icon);

  return (
    <div
      className={`card p-4 transition-all duration-200 hover:shadow-md ${
        isCompleted ? 'bg-sage-50 border-sage-200' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`shrink-0 w-11 h-11 rounded-lg flex items-center justify-center transition-colors ${
            isCompleted ? 'bg-sage-500' : 'bg-sage-50'
          }`}
        >
          <Icon className={`w-5 h-5 ${isCompleted ? 'text-white' : 'text-sage-600'}`} />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-text-main text-sm leading-snug mb-0.5 truncate">
            {habit.name}
          </h3>
          <p className="text-xs text-text-secondary">{formatDuration(habit.durationSeconds)}</p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {isCustom && !isCompleted && (
            <>
              <button
                onClick={() => onEdit(habit)}
                className="p-2 rounded-lg text-text-secondary hover:bg-sage-50 hover:text-text-main transition-colors"
                aria-label={`Edit ${habit.name}`}
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => onArchive(habit)}
                className="p-2 rounded-lg text-text-secondary hover:bg-error/10 hover:text-error transition-colors"
                aria-label={`Remove ${habit.name}`}
              >
                <Archive className="w-4 h-4" />
              </button>
            </>
          )}

          <button
            onClick={() => onToggle(habit.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all min-h-[44px] ${
              isCompleted
                ? 'text-sage-700 bg-sage-100 hover:bg-sage-200'
                : 'text-white bg-sage-500 hover:bg-sage-600'
            }`}
            aria-label={isCompleted ? `Undo completion of ${habit.name}` : `Mark ${habit.name} as complete`}
          >
            {isCompleted ? (
              <>
                <Undo2 className="w-4 h-4" />
                <span className="hidden sm:inline">Undo</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span className="hidden sm:inline">Done</span>
              </>
            )}
          </button>
        </div>
      </div>

      {isCompleted && (
        <div className="flex items-center gap-1.5 mt-3 text-xs text-sage-700 font-medium">
          <Check className="w-3.5 h-3.5" />
          Completed today
        </div>
      )}
    </div>
  );
}

interface HabitFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, durationSeconds: number, icon: string) => boolean;
  editingHabit?: Habit | null;
}

export function HabitForm({ isOpen, onClose, onSave, editingHabit }: HabitFormProps) {
  const [name, setName] = useState('');
  const [duration, setDuration] = useState(60);
  const [icon, setIcon] = useState('Activity');
  const [errors, setErrors] = useState<{ name?: string; duration?: string }>({});

  useEffect(() => {
    if (editingHabit) {
      setName(editingHabit.name);
      setDuration(editingHabit.durationSeconds);
      setIcon(editingHabit.icon);
    } else {
      setName('');
      setDuration(60);
      setIcon(HABIT_ICONS[0]);
    }
    setErrors({});
  }, [editingHabit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    const newErrors: { name?: string; duration?: string } = {};

    if (!trimmed) newErrors.name = 'Please enter a habit name.';
    else if (trimmed.length > 60) newErrors.name = 'Habit names must be 60 characters or fewer.';

    if (!duration || duration < 1 || duration > 3600) newErrors.duration = 'Duration must be between 1 second and 1 hour.';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const success = onSave(trimmed, duration, icon);
    if (success) {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingHabit ? 'Edit habit' : 'Add a new habit'} size="md">
      <form onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="habit-name" className="block text-sm font-medium text-text-main mb-1.5">
              Habit name
            </label>
            <input
              id="habit-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={60}
              className="input-field"
              placeholder="e.g. Take a short walk"
              aria-invalid={errors.name ? 'true' : 'false'}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {errors.name && (
              <p id="name-error" className="text-sm text-error mt-1" role="alert">
                {errors.name}
              </p>
            )}
            <p className="text-xs text-text-secondary mt-1">{name.length}/60 characters</p>
          </div>

          <div>
            <label htmlFor="habit-duration" className="block text-sm font-medium text-text-main mb-1.5">
              Duration (seconds)
            </label>
            <input
              id="habit-duration"
              type="number"
              value={duration}
              onChange={e => setDuration(parseInt(e.target.value) || 0)}
              min={1}
              max={3600}
              className="input-field"
              aria-invalid={errors.duration ? 'true' : 'false'}
              aria-describedby={errors.duration ? 'duration-error' : undefined}
            />
            {errors.duration ? (
              <p id="duration-error" className="text-sm text-error mt-1" role="alert">
                {errors.duration}
              </p>
            ) : (
              <p className="text-xs text-text-secondary mt-1">
                {duration < 60 ? `${duration} seconds` : `${Math.floor(duration / 60)} min ${duration % 60 > 0 ? `${duration % 60} sec` : ''}`}
              </p>
            )}
          </div>

          <div>
            <span className="block text-sm font-medium text-text-main mb-2">Icon</span>
            <div className="grid grid-cols-6 gap-2">
              {ICON_NAMES.filter(n => HABIT_ICONS.includes(n)).map(iconName => {
                const IconComp = getIcon(iconName);
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setIcon(iconName)}
                    className={`flex items-center justify-center w-11 h-11 rounded-lg transition-colors ${
                      icon === iconName
                        ? 'bg-sage-500 text-white'
                        : 'bg-sage-50 text-sage-600 hover:bg-sage-100'
                    }`}
                    aria-label={`Select ${iconName} icon`}
                    aria-pressed={icon === iconName}
                  >
                    <IconComp className="w-5 h-5" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingHabit ? 'Save changes' : 'Add habit'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
