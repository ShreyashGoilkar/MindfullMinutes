import { useState, useEffect, useRef, useCallback } from 'react';
import type { BreathingPhase } from '@/types';

const PATTERN = { inhale: 4, hold: 2, exhale: 4 };
const TOTAL_DURATION = 60; // seconds
const CYCLE_LENGTH = PATTERN.inhale + PATTERN.hold + PATTERN.exhale;

export type TimerState = 'idle' | 'running' | 'paused' | 'finished';

export interface BreathingTimerState {
  state: TimerState;
  phase: BreathingPhase;
  phaseTimeRemaining: number;
  totalTimeRemaining: number;
  totalElapsed: number;
  cycleCount: number;
}

export function useBreathingTimer(
  onComplete: () => void,
  reducedMotion: boolean = false
) {
  const [state, setState] = useState<TimerState>('idle');
  const [phase, setPhase] = useState<BreathingPhase>('inhale');
  const [phaseTimeRemaining, setPhaseTimeRemaining] = useState(PATTERN.inhale);
  const [totalTimeRemaining, setTotalTimeRemaining] = useState(TOTAL_DURATION);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [progress, setProgress] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedElapsedRef = useRef<number>(0);
  const onCompleteRef = useRef(onComplete);
  const rafRef = useRef<number | null>(null);
  const phaseRef = useRef<{ phase: BreathingPhase; remaining: number; cycle: number }>({
    phase: 'inhale',
    remaining: PATTERN.inhale,
    cycle: 0,
  });

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const clearTimers = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const updatePhaseFromElapsed = useCallback((elapsed: number) => {
    const cyclePos = elapsed % CYCLE_LENGTH;
    let newPhase: BreathingPhase;
    let phaseRemaining: number;

    if (cyclePos < PATTERN.inhale) {
      newPhase = 'inhale';
      phaseRemaining = PATTERN.inhale - cyclePos;
    } else if (cyclePos < PATTERN.inhale + PATTERN.hold) {
      newPhase = 'hold';
      phaseRemaining = PATTERN.inhale + PATTERN.hold - cyclePos;
    } else {
      newPhase = 'exhale';
      phaseRemaining = CYCLE_LENGTH - cyclePos;
    }

    const cycle = Math.floor(elapsed / CYCLE_LENGTH);

    if (newPhase !== phaseRef.current.phase) {
      phaseRef.current.phase = newPhase;
      setPhase(newPhase);
    }

    phaseRef.current.remaining = Math.ceil(phaseRemaining);
    setPhaseTimeRemaining(Math.ceil(phaseRemaining));
    setCycleCount(cycle);
  }, []);

  const start = useCallback(() => {
    clearTimers();
    setState('running');
    startTimeRef.current = performance.now();
    pausedElapsedRef.current = 0;
    setTotalElapsed(0);
    setTotalTimeRemaining(TOTAL_DURATION);
    setPhase('inhale');
    setPhaseTimeRemaining(PATTERN.inhale);
    setCycleCount(0);
    setProgress(0);
    phaseRef.current = { phase: 'inhale', remaining: PATTERN.inhale, cycle: 0 };

    intervalRef.current = setInterval(() => {
      const now = performance.now();
      const elapsed = (now - startTimeRef.current) / 1000;
      const remaining = Math.max(0, TOTAL_DURATION - elapsed);

      setTotalElapsed(elapsed);
      setTotalTimeRemaining(remaining);
      setProgress(Math.min(1, elapsed / TOTAL_DURATION));
      updatePhaseFromElapsed(elapsed);

      if (remaining <= 0) {
        clearTimers();
        setState('finished');
        setTotalTimeRemaining(0);
        setPhase('inhale');
        setPhaseTimeRemaining(PATTERN.inhale);
        onCompleteRef.current();
      }
    }, 100);
  }, [clearTimers, updatePhaseFromElapsed]);

  const pause = useCallback(() => {
    if (state !== 'running') return;
    pausedElapsedRef.current = (performance.now() - startTimeRef.current) / 1000;
    clearTimers();
    setState('paused');
  }, [state, clearTimers]);

  const resume = useCallback(() => {
    if (state !== 'paused') return;
    setState('running');
    // Adjust start time to account for paused duration
    startTimeRef.current = performance.now() - pausedElapsedRef.current * 1000;

    intervalRef.current = setInterval(() => {
      const now = performance.now();
      const elapsed = (now - startTimeRef.current) / 1000;
      const remaining = Math.max(0, TOTAL_DURATION - elapsed);

      setTotalElapsed(elapsed);
      setTotalTimeRemaining(remaining);
      setProgress(Math.min(1, elapsed / TOTAL_DURATION));
      updatePhaseFromElapsed(elapsed);

      if (remaining <= 0) {
        clearTimers();
        setState('finished');
        setTotalTimeRemaining(0);
        setPhase('inhale');
        setPhaseTimeRemaining(PATTERN.inhale);
        onCompleteRef.current();
      }
    }, 100);
  }, [state, clearTimers, updatePhaseFromElapsed]);

  const restart = useCallback(() => {
    start();
  }, [start]);

  const stop = useCallback(() => {
    clearTimers();
    setState('idle');
    setPhase('inhale');
    setPhaseTimeRemaining(PATTERN.inhale);
    setTotalTimeRemaining(TOTAL_DURATION);
    setTotalElapsed(0);
    setCycleCount(0);
    setProgress(0);
    phaseRef.current = { phase: 'inhale', remaining: PATTERN.inhale, cycle: 0 };
  }, [clearTimers]);

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  return {
    state,
    phase,
    phaseTimeRemaining,
    totalTimeRemaining: Math.ceil(totalTimeRemaining),
    totalElapsed,
    cycleCount,
    progress,
    pattern: PATTERN,
    totalDuration: TOTAL_DURATION,
    reducedMotion,
    start,
    pause,
    resume,
    restart,
    stop,
  };
}
