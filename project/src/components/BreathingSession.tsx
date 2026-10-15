import { useEffect, useRef, useCallback } from 'react';
import { Pause, Play, RotateCcw, X, Check } from 'lucide-react';
import { Modal } from './Modal';
import { useBreathingTimer } from '@/hooks/useBreathingTimer';
import { formatCountdown } from '@/lib/dateUtils';
import type { BreathingPhase } from '@/types';

interface BreathingSessionProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  onMarkComplete: () => void;
  hasCompletedBreathingHabit: boolean;
  reducedMotion: boolean;
}

const PHASE_LABELS: Record<BreathingPhase, string> = {
  inhale: 'Breathe in',
  hold: 'Hold',
  exhale: 'Breathe out',
};

export function BreathingSession({
  isOpen,
  onClose,
  onComplete,
  onMarkComplete,
  hasCompletedBreathingHabit,
  reducedMotion,
}: BreathingSessionProps) {
  const handleComplete = useCallback(() => {
    onComplete();
  }, [onComplete]);

  const timer = useBreathingTimer(handleComplete, reducedMotion);

  // Start the timer when the modal opens
  useEffect(() => {
    if (isOpen && timer.state === 'idle') {
      timer.start();
    }
    // Cleanup when modal closes
    if (!isOpen && timer.state !== 'idle' && timer.state !== 'finished') {
      timer.stop();
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = () => {
    if (timer.state === 'running' || timer.state === 'paused') {
      if (window.confirm('Your breathing session is still in progress. Are you sure you want to exit?')) {
        timer.stop();
        onClose();
      }
    } else {
      timer.stop();
      onClose();
    }
  };

  // Calculate circle scale based on phase and progress within phase
  const getCircleScale = (): number => {
    if (reducedMotion) return 0.75;

    if (timer.state === 'finished') return 0.75;
    if (timer.state === 'paused' || timer.state === 'idle') return 0.75;

    const elapsed = timer.totalElapsed;
    const cycleLength = timer.pattern.inhale + timer.pattern.hold + timer.pattern.exhale;
    const cyclePos = elapsed % cycleLength;

    if (timer.phase === 'inhale') {
      // Scale from 0.5 to 1
      const progress = cyclePos / timer.pattern.inhale;
      return 0.5 + 0.5 * Math.min(1, progress);
    } else if (timer.phase === 'hold') {
      return 1;
    } else {
      // Scale from 1 to 0.5
      const exhaleElapsed = cyclePos - timer.pattern.inhale - timer.pattern.hold;
      const progress = exhaleElapsed / timer.pattern.exhale;
      return 1 - 0.5 * Math.min(1, progress);
    }
  };

  const circleScale = getCircleScale();
  const isFinished = timer.state === 'finished';

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg" closeOnBackdrop={false}>
      <div className="flex flex-col items-center">
        {/* Close button */}
        <div className="w-full flex justify-end mb-2">
          <button
            onClick={handleClose}
            className="p-2 rounded-lg text-text-secondary hover:bg-sage-50 hover:text-text-main transition-colors"
            aria-label="Exit breathing session"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isFinished ? (
          /* Completion state */
          <div className="flex flex-col items-center text-center py-8 px-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-sage-100 flex items-center justify-center mb-6">
              <Check className="w-8 h-8 text-sage-600" />
            </div>
            <h2 className="text-2xl font-semibold text-text-main mb-3">Well done.</h2>
            <p className="text-text-secondary mb-8 max-w-md leading-relaxed">
              You took a minute to slow down. That's all it takes. Come back anytime you need a reset.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
              {!hasCompletedBreathingHabit && (
                <button
                  onClick={() => {
                    onMarkComplete();
                    onClose();
                  }}
                  className="btn-primary flex-1"
                >
                  <Check className="w-4 h-4" />
                  Mark habit complete
                </button>
              )}
              <button onClick={handleClose} className="btn-secondary flex-1">
                Back to dashboard
              </button>
            </div>
          </div>
        ) : (
          /* Active session */
          <>
            <h2 className="text-2xl font-semibold text-text-main mb-1">Let's slow down.</h2>
            <p className="text-sm text-text-secondary mb-8 text-center max-w-md">
              Breathe comfortably with the guide. You can stop at any time — there's no pressure.
            </p>

            {/* Breathing circle */}
            <div
              className="relative flex items-center justify-center mb-8"
              style={{ width: '240px', height: '240px' }}
              aria-hidden={reducedMotion ? 'true' : 'false'}
            >
              {/* Outer ring */}
              <div
                className="absolute inset-0 rounded-full border-2 border-sage-200"
                style={{ opacity: 0.5 }}
              />

              {/* Animated circle */}
              {!reducedMotion && (
                <div
                  className="absolute rounded-full bg-gradient-to-br from-sage-200 to-sage-400"
                  style={{
                    width: '200px',
                    height: '200px',
                    transform: `scale(${circleScale})`,
                    transition: timer.state === 'running' ? 'transform 0.1s linear' : 'none',
                    opacity: 0.6,
                  }}
                />
              )}

              {/* Inner text */}
              <div className="relative z-10 flex flex-col items-center justify-center">
                <span
                  className="text-xl font-semibold text-forest mb-1"
                  role="status"
                  aria-live="polite"
                >
                  {PHASE_LABELS[timer.phase]}
                </span>
                <span className="text-4xl font-bold text-forest tabular-nums">
                  {timer.phaseTimeRemaining}
                </span>
                <span className="text-sm text-text-secondary mt-2 tabular-nums">
                  {formatCountdown(timer.totalTimeRemaining)} remaining
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              {timer.state === 'running' ? (
                <button
                  onClick={timer.pause}
                  className="btn-secondary"
                  aria-label="Pause breathing session"
                >
                  <Pause className="w-4 h-4" />
                  Pause
                </button>
              ) : (
                <button
                  onClick={timer.resume}
                  className="btn-primary"
                  aria-label="Resume breathing session"
                >
                  <Play className="w-4 h-4" />
                  Resume
                </button>
              )}

              <button
                onClick={timer.restart}
                className="btn-ghost"
                aria-label="Restart breathing session"
              >
                <RotateCcw className="w-4 h-4" />
                Restart
              </button>
            </div>

            {/* Progress dots for cycles */}
            <div className="flex items-center gap-2 mt-6" aria-hidden="true">
              {Array.from({ length: Math.ceil(timer.totalDuration / (timer.pattern.inhale + timer.pattern.hold + timer.pattern.exhale)) }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i < timer.cycleCount + 1 ? 'bg-sage-500' : 'bg-sage-100'
                  }`}
                />
              ))}
            </div>

            <p className="text-xs text-text-secondary mt-4 text-center max-w-sm">
              {timer.state === 'paused' && "Session paused. Resume when you're ready."}
              {timer.state === 'running' && 'Follow the circle as it grows and shrinks.'}
            </p>
          </>
        )}
      </div>
    </Modal>
  );
}
