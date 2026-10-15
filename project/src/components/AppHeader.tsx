import { Leaf, LayoutDashboard, TrendingUp, Settings as SettingsIcon } from 'lucide-react';
import type { Page } from '@/types';

interface AppHeaderProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export function AppHeader({ currentPage, onNavigate }: AppHeaderProps) {
  const navItems: { page: Page; label: string; icon: typeof LayoutDashboard }[] = [
    { page: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { page: 'progress', label: 'Progress', icon: TrendingUp },
    { page: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <header className="sticky top-0 z-40 bg-cream/90 backdrop-blur-md border-b border-card-border">
      <div className="max-w-container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-sage-500 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-text-main tracking-tight">
              mindfulminute
              <span className="text-sage-400">.</span>
            </span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-1" aria-label="Main navigation">
            {navItems.map(({ page, label, icon: Icon }) => (
              <button
                key={page}
                onClick={() => onNavigate(page)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === page
                    ? 'bg-sage-100 text-sage-700'
                    : 'text-text-secondary hover:bg-sage-50 hover:text-text-main'
                }`}
                aria-current={currentPage === page ? 'page' : undefined}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Mobile nav */}
        <nav className="sm:hidden flex items-center justify-around pb-2" aria-label="Mobile navigation">
          {navItems.map(({ page, label, icon: Icon }) => (
            <button
              key={page}
              onClick={() => onNavigate(page)}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors min-w-[64px] ${
                currentPage === page
                  ? 'text-sage-700'
                  : 'text-text-secondary'
              }`}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              <Icon className={`w-5 h-5 ${currentPage === page ? 'text-sage-600' : ''}`} />
              {label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
