import { useState, useRef, useCallback, useEffect } from 'react';
import type { SoundType } from '@/lib/audio';
import { AmbientAudioEngine } from '@/lib/audio';

export function useAmbientAudio(initialVolume: number = 0.4) {
  const [currentSound, setCurrentSound] = useState<SoundType | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(initialVolume);
  const [error, setError] = useState<string | null>(null);
  const engineRef = useRef<AmbientAudioEngine | null>(null);

  useEffect(() => {
    engineRef.current = new AmbientAudioEngine();
    engineRef.current.setVolume(initialVolume);

    return () => {
      engineRef.current?.dispose();
    };
  }, []);

  const setVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolumeState(clamped);
    engineRef.current?.setVolume(clamped);
  }, []);

  const play = useCallback(async (type: SoundType): Promise<void> => {
    setError(null);
    if (!engineRef.current) return;

    const success = await engineRef.current.play(type);
    if (success) {
      setCurrentSound(type);
      setIsPlaying(true);
    } else {
      setError('Unable to play audio. Your browser may not support the Web Audio API.');
      setCurrentSound(null);
      setIsPlaying(false);
    }
  }, []);

  const pause = useCallback((): void => {
    engineRef.current?.stop();
    setIsPlaying(false);
    setCurrentSound(null);
  }, []);

  const toggle = useCallback(async (type: SoundType): Promise<void> => {
    if (currentSound === type && isPlaying) {
      pause();
    } else {
      await play(type);
    }
  }, [currentSound, isPlaying, play, pause]);

  return {
    currentSound,
    isPlaying,
    volume,
    error,
    play,
    pause,
    toggle,
    setVolume,
  };
}
