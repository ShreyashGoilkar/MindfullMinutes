import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import type { Habit } from '@/types';
import { getIcon } from '@/components/icons';
import { formatDuration } from '@/lib/dateUtils';

interface NextStepProps {
  habits: Habit[];
  completedHabitIds: Set<string>;
  onStartBreathing: () => void;
}

export function NextStep({ habits, completedHabitIds, onStartBreathing }: NextStepProps) {
  const incomplete = habits.find(h => !completedHabitIds.has(h.id));
  const allDone = habits.length > 0 && !incomplete;

  if (habits.length === 0) {
    return (
      <div className="card p-5 bg-sage-50">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-sage-500" />
          <h3 className="text-sm font-semibold text-text-main">Your next tiny step</h3>
        </div>
        <p className="text-sm text-text-secondary">
          Add a habit to get started, or try a one-minute breathing exercise.
        </p>
        <button onClick={onStartBreathing} className="btn-primary mt-3 text-sm">
          Start breathing
        </button>
      </div>
    );
  }

  if (allDone) {
    return (
      <div className="card p-5 bg-sage-50">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="w-4 h-4 text-success" />
          <h3 className="text-sm font-semibold text-text-main">Your next tiny step</h3>
        </div>
        <p className="text-sm text-text-secondary">
          Every habit is done for today. Take a moment to enjoy that.
        </p>
      </div>
    );
  }

  if (!incomplete) return null;

  const Icon = getIcon(incomplete.icon);

  const handleAction = () => {
    if (incomplete.icon === 'Wind' || incomplete.name.toLowerCase().includes('breathing')) {
      onStartBreathing();
    } else {
      document.getElementById(`habit-${incomplete.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="card p-5 bg-gradient-to-br from-sage-50 to-white">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-sage-500" />
        <h3 className="text-sm font-semibold text-text-main">Your next tiny step</h3>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-sage-50 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-sage-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-main truncate">{incomplete.name}</p>
          <p className="text-xs text-text-secondary">{formatDuration(incomplete.durationSeconds)}</p>
        </div>
      </div>

      <button onClick={handleAction} className="btn-primary w-full text-sm">
        Start now
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
