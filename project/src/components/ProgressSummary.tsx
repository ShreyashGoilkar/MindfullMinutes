import { CheckCircle2 } from 'lucide-react';

interface ProgressSummaryProps {
  completed: number;
  total: number;
  percentage: number;
  message: string;
}

export function ProgressSummary({ completed, total, percentage, message }: ProgressSummaryProps) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-text-main">Today's progress</h2>
        {completed > 0 && (
          <div className="flex items-center gap-1.5 text-sm text-success">
            <CheckCircle2 className="w-4 h-4" />
            <span className="font-medium">{completed} done</span>
          </div>
        )}
      </div>

      {total === 0 ? (
        <div className="text-sm text-text-secondary py-2">
          You have no active habits. Add one to start tracking your daily progress.
        </div>
      ) : (
        <>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-3xl font-bold text-text-main">{completed}</span>
            <span className="text-sm text-text-secondary">of {total} habits completed</span>
          </div>

          <div className="h-3 rounded-full bg-sage-50 overflow-hidden mb-3" role="progressbar" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}>
            <div
              className="h-full rounded-full bg-sage-500 progress-bar"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-sage-700">{percentage}% complete</span>
            <span className="text-sm text-text-secondary">{message}</span>
          </div>
        </>
      )}
    </div>
  );
}
