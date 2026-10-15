import { TrendingUp, CheckCircle2, Flame, Calendar } from 'lucide-react';
import type { Habit, CompletionRecord } from '@/types';
import type { UseAppDataReturn } from '@/hooks/useAppData';
import { getDateKey, getLast7Days, formatShortDate, formatDayLabel } from '@/lib/dateUtils';
import { EmptyState } from '@/components/EmptyState';
import { CalendarDays } from 'lucide-react';

interface ProgressPageProps {
  app: UseAppDataReturn;
  onGoToDashboard: () => void;
}

function calculateStreak(completions: CompletionRecord[]): number {
  if (completions.length === 0) return 0;

  // Get unique dates with at least one completion
  const dateKeys = new Set(completions.map(c => c.dateKey));

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // If today has activity, start from today; otherwise start from yesterday
  const todayKey = getDateKey(today);
  let checkDate = new Date(today);

  if (!dateKeys.has(todayKey)) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const checkKey = getDateKey(checkDate);
    if (dateKeys.has(checkKey)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

interface DayData {
  date: Date;
  dateKey: string;
  completed: number;
  total: number;
  percentage: number;
}

function getWeeklyData(habits: Habit[], completions: CompletionRecord[]): DayData[] {
  const last7 = getLast7Days();

  return last7.map(date => {
    const dateKey = getDateKey(date);
    const dayCompletions = completions.filter(c => c.dateKey === dateKey);

    // For past days, count habits that existed at that time
    const dayDate = new Date(date);
    dayDate.setHours(23, 59, 59, 999);

    // Count active habits that were created on or before this date
    const relevantHabits = habits.filter(h => {
      const habitCreated = new Date(h.createdAt);
      return habitCreated <= dayDate && !h.archived;
    });

    // For today, use all active habits
    const total = getDateKey() === dateKey
      ? habits.filter(h => !h.archived).length
      : relevantHabits.length;

    const completed = dayCompletions.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { date, dateKey, completed, total, percentage };
  });
}

export function ProgressPage({ app, onGoToDashboard }: ProgressPageProps) {
  const { completions, activeHabits, completedHabitIds } = app;

  const totalCompletedToday = completedHabitIds.size;
  const percentageToday = activeHabits.length > 0
    ? Math.round((totalCompletedToday / activeHabits.length) * 100)
    : 0;
  const totalSessions = completions.length;
  const streak = calculateStreak(completions);
  const weeklyData = getWeeklyData(app.allHabits, completions);

  const hasAnyCompletions = completions.length > 0;
  const maxCompleted = Math.max(...weeklyData.map(d => d.completed), 1);

  if (!hasAnyCompletions) {
    return (
      <div className="max-w-container mx-auto px-4 sm:px-6 py-6">
        <h1 className="text-2xl font-bold text-text-main mb-6">Progress</h1>
        <div className="card">
          <EmptyState
            icon={CalendarDays}
            title="No progress yet"
            message="Your progress will appear here as you complete habits. Start by finishing one on your dashboard."
            action={{ label: 'Go to dashboard', onClick: onGoToDashboard }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-container mx-auto px-4 sm:px-6 py-6">
      <h1 className="text-2xl font-bold text-text-main mb-6">Progress</h1>

      {/* Overview cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-sage-50 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-sage-600" />
            </div>
            <span className="text-xs text-text-secondary font-medium">Today</span>
          </div>
          <p className="text-2xl font-bold text-text-main">
            {totalCompletedToday}<span className="text-sm text-text-secondary font-normal"> / {activeHabits.length}</span>
          </p>
          <p className="text-xs text-text-secondary">habits completed</p>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-sage-50 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-sage-600" />
            </div>
            <span className="text-xs text-text-secondary font-medium">Completion</span>
          </div>
          <p className="text-2xl font-bold text-text-main">{percentageToday}%</p>
          <p className="text-xs text-text-secondary">of today's habits</p>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-sage-50 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-sage-600" />
            </div>
            <span className="text-xs text-text-secondary font-medium">All time</span>
          </div>
          <p className="text-2xl font-bold text-text-main">{totalSessions}</p>
          <p className="text-xs text-text-secondary">total completions</p>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-soft-peach flex items-center justify-center">
              <Flame className="w-4 h-4 text-sage-700" />
            </div>
            <span className="text-xs text-text-secondary font-medium">Streak</span>
          </div>
          <p className="text-2xl font-bold text-text-main">
            {streak}<span className="text-sm text-text-secondary font-normal"> {streak === 1 ? 'day' : 'days'}</span>
          </p>
          <p className="text-xs text-text-secondary">consecutive active days</p>
        </div>
      </div>

      {/* Weekly chart */}
      <div className="card p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-main">This week</h2>
          <span className="text-xs text-text-secondary">Last 7 days</span>
        </div>

        <div className="flex items-end justify-between gap-2 h-48" role="img" aria-label="Weekly habit completion chart">
          {weeklyData.map((day, i) => {
            const barHeight = day.completed > 0 ? (day.completed / maxCompleted) * 100 : 0;
            const isToday = day.dateKey === getDateKey();

            return (
              <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                <span className="text-xs font-medium text-text-main tabular-nums">
                  {day.completed > 0 ? day.completed : ''}
                </span>
                <div className="w-full flex-1 flex items-end">
                  <div
                    className={`w-full rounded-t-md progress-bar min-h-[2px] ${
                      day.completed > 0
                        ? isToday ? 'bg-sage-500' : 'bg-sage-300'
                        : 'bg-sage-50'
                    }`}
                    style={{ height: `${barHeight}%`, minHeight: day.completed > 0 ? '8px' : '2px' }}
                    title={`${formatShortDate(day.date)}: ${day.completed} of ${day.total} habits completed`}
                  />
                </div>
                <span className={`text-xs ${isToday ? 'text-sage-700 font-semibold' : 'text-text-secondary'}`}>
                  {formatDayLabel(day.date)}
                </span>
                <span className="text-[10px] text-text-secondary hidden sm:block">
                  {formatShortDate(day.date)}
                </span>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-text-secondary mt-4 leading-relaxed">
          Bars show the number of habits completed each day. Today's bar is highlighted in darker sage.
          {weeklyData.filter(d => d.total === 0).length > 0 && ' Some days may show no data if no habits existed yet.'}
        </p>
      </div>

      {/* Streak explanation */}
      <div className="card p-5">
        <h3 className="text-base font-semibold text-text-main mb-2">How streaks work</h3>
        <p className="text-sm text-text-secondary leading-relaxed">
          A day counts as active when you complete at least one habit. Consecutive active days build your streak.
          A missed day resets it to zero — but there's no penalty. Start again whenever you're ready.
        </p>
      </div>
    </div>
  );
}
