import { useState, useEffect } from 'react';
import type { Page } from '@/types';
import { useAppData } from '@/hooks/useAppData';
import { useAmbientAudio } from '@/hooks/useAmbientAudio';
import { AppHeader } from '@/components/AppHeader';
import { ToastContainer } from '@/components/Toast';
import { DashboardPage } from '@/pages/DashboardPage';
import { ProgressPage } from '@/pages/ProgressPage';
import { SettingsPage } from '@/pages/SettingsPage';

function App() {
  const app = useAppData();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [breathingModalOpen, setBreathingModalOpen] = useState(false);

  const audio = useAmbientAudio(app.preferences.volume);

  // Sync volume from saved preferences on mount
  useEffect(() => {
    audio.setVolume(app.preferences.volume);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Apply reduced motion preference
  useEffect(() => {
    if (app.preferences.reducedMotion) {
      document.documentElement.setAttribute('data-reduced-motion', 'true');
    } else {
      document.documentElement.removeAttribute('data-reduced-motion');
    }
  }, [app.preferences.reducedMotion]);

  return (
    <div className="min-h-screen bg-cream">
      <AppHeader currentPage={currentPage} onNavigate={setCurrentPage} />

      <main>
        {currentPage === 'dashboard' && (
          <DashboardPage
            app={app}
            breathingModalOpen={breathingModalOpen}
            setBreathingModalOpen={setBreathingModalOpen}
            audio={audio}
          />
        )}
        {currentPage === 'progress' && (
          <ProgressPage app={app} onGoToDashboard={() => setCurrentPage('dashboard')} />
        )}
        {currentPage === 'settings' && (
          <SettingsPage app={app} onVolumeChange={audio.setVolume} />
        )}
      </main>

      <footer className="max-w-container mx-auto px-4 sm:px-6 py-8 text-center">
        <p className="text-xs text-text-secondary">
          mindfulminute. — A little calm goes a long way.
        </p>
      </footer>

      <ToastContainer toasts={app.toasts} onDismiss={app.dismissToast} />
    </div>
  );
}

export default App;
