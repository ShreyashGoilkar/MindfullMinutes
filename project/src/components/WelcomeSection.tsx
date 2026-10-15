import { Wind } from 'lucide-react';
import { formatDateNatural } from '@/lib/dateUtils';

interface WelcomeSectionProps {
  onStartReset: () => void;
}

export function WelcomeSection({ onStartReset }: WelcomeSectionProps) {
  return (
    <div className="mb-6">
      <p className="text-sm text-sage-600 font-medium mb-1">
        {formatDateNatural()}
      </p>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text-main leading-tight">
            Take a breath.
          </h1>
          <p className="text-text-secondary mt-1">
            Small steps. A calmer day.
          </p>
        </div>
        <button onClick={onStartReset} className="btn-primary text-sm">
          <Wind className="w-4 h-4" />
          Start my reset
        </button>
      </div>
    </div>
  );
}
