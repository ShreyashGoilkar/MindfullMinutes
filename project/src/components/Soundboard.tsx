import { Play, Pause, Volume2, VolumeX, AlertCircle } from 'lucide-react';
import { SOUND_CONFIGS } from '@/lib/audio';
import { getIcon } from '@/components/icons';
import type { SoundType } from '@/lib/audio';

interface SoundboardProps {
  currentSound: SoundType | null;
  isPlaying: boolean;
  volume: number;
  error: string | null;
  onToggle: (type: SoundType) => void;
  onVolumeChange: (vol: number) => void;
}

export function Soundboard({
  currentSound,
  isPlaying,
  volume,
  error,
  onToggle,
  onVolumeChange,
}: SoundboardProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-text-main">Your soundscape</h2>
          <p className="text-sm text-text-secondary mt-0.5">Play calming sounds while you breathe or work.</p>
        </div>

        {/* Master volume */}
        <div className="flex items-center gap-2 min-w-[140px]">
          {volume === 0 ? (
            <VolumeX className="w-5 h-5 text-text-secondary shrink-0" />
          ) : (
            <Volume2 className="w-5 h-5 text-sage-600 shrink-0" />
          )}
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(volume * 100)}
            onChange={e => onVolumeChange(parseInt(e.target.value) / 100)}
            className="flex-1"
            aria-label="Master volume"
          />
          <span className="text-xs text-text-secondary tabular-nums w-8 text-right">
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 mb-3 px-4 py-3 rounded-lg bg-error/5 border border-error/20 text-sm text-error">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {SOUND_CONFIGS.map(config => {
          const Icon = getIcon(config.icon);
          const isActive = currentSound === config.type && isPlaying;

          return (
            <button
              key={config.type}
              onClick={() => onToggle(config.type)}
              className={`card p-5 text-left transition-all duration-200 hover:shadow-md group ${
                isActive ? 'border-sage-400 bg-sage-50' : ''
              }`}
              aria-pressed={isActive}
              aria-label={`${isActive ? 'Pause' : 'Play'} ${config.label} ambient sound`}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                    isActive ? 'bg-sage-500' : 'bg-sage-50 group-hover:bg-sage-100'
                  }`}
                >
                  <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-sage-600'}`} />
                </div>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    isActive
                      ? 'bg-sage-500 text-white'
                      : 'bg-sage-50 text-sage-600 group-hover:bg-sage-100'
                  }`}
                >
                  {isActive ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5 ml-0.5" />
                  )}
                </div>
              </div>

              <h3 className="font-semibold text-text-main text-sm mb-1">{config.label}</h3>
              <p className="text-xs text-text-secondary leading-relaxed">{config.description}</p>

              {isActive && (
                <div className="flex items-center gap-1.5 mt-3 text-xs text-sage-700 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-sage-500 animate-pulse" />
                  Playing
                </div>
              )}
            </button>
          );
        })}
      </div>

      {!currentSound && !error && (
        <p className="text-xs text-text-secondary text-center mt-3">
          No sound playing. Tap a card to start.
        </p>
      )}
    </div>
  );
}
