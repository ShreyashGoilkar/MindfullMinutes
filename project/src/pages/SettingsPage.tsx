import { useState } from 'react';
import { Volume2, RotateCcw, ZapOff, Trash2 } from 'lucide-react';
import type { UseAppDataReturn } from '@/hooks/useAppData';
import { ConfirmDialog } from '@/components/ConfirmDialog';

interface SettingsPageProps {
  app: UseAppDataReturn;
  onVolumeChange: (vol: number) => void;
}

export function SettingsPage({ app, onVolumeChange }: SettingsPageProps) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const { preferences } = app;

  return (
    <div className="max-w-container mx-auto px-4 sm:px-6 py-6">
      <h1 className="text-2xl font-bold text-text-main mb-6">Settings</h1>

      <div className="max-w-2xl space-y-4">
        {/* Volume */}
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-sage-50 flex items-center justify-center">
              <Volume2 className="w-5 h-5 text-sage-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-text-main">Sound volume</h2>
              <p className="text-sm text-text-secondary">Controls the master volume for all ambient sounds.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <Volume2 className="w-5 h-5 text-text-secondary shrink-0" />
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(preferences.volume * 100)}
              onChange={e => {
                const vol = parseInt(e.target.value) / 100;
                onVolumeChange(vol);
                app.updatePreferences({ volume: vol });
              }}
              className="flex-1"
              aria-label="Sound volume"
            />
            <span className="text-sm text-text-main tabular-nums w-12 text-right font-medium">
              {Math.round(preferences.volume * 100)}%
            </span>
          </div>
        </div>

        {/* Reduced motion */}
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-sage-50 flex items-center justify-center">
              <ZapOff className="w-5 h-5 text-sage-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-text-main">Reduced motion</h2>
              <p className="text-sm text-text-secondary">Disables the breathing circle animation and other motion effects.</p>
            </div>
          </div>

          <label className="flex items-center gap-3 mt-4 cursor-pointer">
            <button
              onClick={() => app.updatePreferences({ reducedMotion: !preferences.reducedMotion })}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                preferences.reducedMotion ? 'bg-sage-500' : 'bg-card-border'
              }`}
              role="switch"
              aria-checked={preferences.reducedMotion}
              aria-label="Toggle reduced motion"
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  preferences.reducedMotion ? 'translate-x-6' : ''
                }`}
              />
            </button>
            <span className="text-sm text-text-main">
              {preferences.reducedMotion ? 'Reduced motion is on' : 'Reduced motion is off'}
            </span>
          </label>
        </div>

        {/* Reset data */}
        <div className="card p-5 border-error/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-error/10 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-error" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-text-main">Reset all data</h2>
              <p className="text-sm text-text-secondary">
                Removes your habits, completion history, and saved preferences, and restores the default habits.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="btn-danger mt-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset everything
          </button>
        </div>

        {/* About */}
        <div className="card p-5">
          <h2 className="text-base font-semibold text-text-main mb-2">About MindfulMinute</h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            MindfulMinute is a simple wellness companion for daily micro-habits, guided breathing, and ambient sounds.
            All your data is stored locally in your browser — nothing is sent to any server.
          </p>
          <p className="text-xs text-text-secondary mt-3">
            MindfulMinute is not a medical or mental-health treatment tool.
          </p>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showResetConfirm}
        title="Reset all data?"
        message="This will permanently remove your habits, completion history, and saved preferences, and restore the four default habits. This cannot be undone."
        confirmLabel="Yes, reset everything"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={() => {
          app.resetAll();
          setShowResetConfirm(false);
        }}
        onCancel={() => setShowResetConfirm(false)}
      />
    </div>
  );
}
