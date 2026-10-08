import { useCallback, useEffect, useState } from 'react';
import {
  CircleAlert,
  Clock3,
  Crown,
  Medal,
  RefreshCw,
  TrendingUp,
  Trophy,
  UserRound,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/ui/GlassCard';
import api from '../utils/api';

const cohortDetails = {
  elite_student: {
    title: 'Elite Student Leaderboard',
    description: 'Elite students only, ranked by MongoDB-recorded XP and verified course watch time.',
  },
  free_student: {
    title: 'Free Student Leaderboard',
    description: 'Free students only, ranked by MongoDB-recorded XP and verified course watch time.',
  },
};

const formatWatchTime = (seconds) => {
  const totalMinutes = Math.floor(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
};

export default function Leaderboard() {
  const { user } = useAuth();
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshedAt, setRefreshedAt] = useState(null);
  const cohort = user?.role;
  const details = cohortDetails[cohort];

  const fetchLeaderboard = useCallback(async (isInitial = false) => {
    if (!details) {
      setError('Student leaderboard is available to free and elite student accounts.');
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/leaderboard');
      setRankings(response.data.data.rankings);
      setRefreshedAt(response.data.data.refreshedAt);
      setError('');
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
        'Could not load current student rankings from MongoDB.'
      );
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [details]);

  useEffect(() => {
    let active = true;
    const refresh = async (initial = false) => {
      if (!active) return;
      await fetchLeaderboard(initial);
    };
    refresh(true);
    const interval = window.setInterval(() => refresh(), 15000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [fetchLeaderboard]);

  const topThree = rankings.slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto min-h-screen bg-brand-base px-4 py-12 text-brand-text transition-colors duration-300 sm:px-6 lg:px-8">
      <header className="mx-auto mb-10 max-w-3xl text-center">
        <span className="rounded-full bg-brand-primary-light px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-brand-primary dark:bg-brand-primary/10">
          Live MongoDB standings · {cohort === 'elite_student' ? 'Elite cohort' : 'Free cohort'}
        </span>
        <h1 className="mt-4 font-display text-3xl font-extrabold sm:text-5xl">
          {details?.title || 'Student Leaderboard'}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-xs leading-relaxed text-brand-muted sm:text-sm">
          {details?.description || 'Student rankings are restricted to enrolled student accounts.'}
          {' '}Only students enrolled in at least one course are listed. Rankings refresh every 15 seconds.
        </p>
      </header>

      <div className="mx-auto max-w-5xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-muted">
            <TrendingUp className="h-4 w-4 text-brand-primary" />
            {refreshedAt
              ? `Last refreshed ${new Date(refreshedAt).toLocaleTimeString()}`
              : 'Waiting for live student records'}
          </div>
          <button
            type="button"
            onClick={() => fetchLeaderboard(true)}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-brand-border bg-brand-card px-3 py-2 text-xs font-bold text-brand-text hover:border-brand-primary/40 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh now
          </button>
        </div>

        {error && (
          <div role="alert" className="mb-4 flex items-start gap-2 rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-300">
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <GlassCard className="p-12 text-center text-sm text-brand-muted">
            Loading enrolled students from MongoDB...
          </GlassCard>
        ) : rankings.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <Trophy className="mx-auto h-10 w-10 text-brand-dim" />
            <h2 className="mt-4 text-base font-bold text-brand-text">No enrolled students in this leaderboard yet</h2>
            <p className="mt-2 text-xs text-brand-muted">
              Rankings appear when students in this cohort enroll in a course and have recorded XP or watch activity.
            </p>
          </GlassCard>
        ) : (
          <>
            {topThree.length > 0 && (
              <div className="mb-8 grid items-end gap-4 md:grid-cols-3">
                {topThree.map((student) => (
                  <GlassCard
                    key={student.id}
                    className={`relative flex flex-col items-center justify-between rounded-2xl border p-5 text-center ${
                      student.rank === 1
                        ? 'min-h-56 border-amber-400/40 bg-gradient-to-b from-amber-400/15 to-brand-card md:order-2'
                        : student.rank === 2
                          ? 'min-h-48 border-slate-400/30 bg-brand-card md:order-1'
                          : 'min-h-44 border-orange-500/30 bg-brand-card md:order-3'
                    }`}
                  >
                    <span className="absolute right-4 top-3 font-mono text-xs font-bold text-brand-dim">
                      #{student.rank}
                    </span>
                    {student.rank === 1
                      ? <Crown className="h-7 w-7 text-amber-500" />
                      : <Medal className={`h-7 w-7 ${student.rank === 2 ? 'text-slate-400' : 'text-orange-500'}`} />}
                    <div className="mt-3">
                      <h2 className="font-display text-sm font-extrabold text-brand-text">
                        {student.name}{String(student.id) === String(user?._id || user?.id) ? ' (You)' : ''}
                      </h2>
                      <p className="mt-1 text-[10px] text-brand-muted">
                        {student.enrolledCourseCount} enrolled {student.enrolledCourseCount === 1 ? 'course' : 'courses'}
                      </p>
                    </div>
                    <div className="mt-4 grid w-full grid-cols-2 gap-2 border-t border-brand-border pt-3">
                      <span className="text-xs font-extrabold text-brand-primary">{student.xp.toLocaleString()} XP</span>
                      <span className="text-xs font-bold text-brand-muted">{formatWatchTime(student.watchTimeSeconds)}</span>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}

            <GlassCard className="overflow-hidden border border-brand-border bg-brand-card shadow-sm">
              <div className="flex items-center justify-between gap-3 border-b border-brand-border p-4 sm:p-5">
                <h2 className="flex items-center gap-2 font-display text-sm font-bold">
                  <Trophy className="h-4 w-4 text-brand-primary" />
                  {cohort === 'elite_student' ? 'Elite student standings' : 'Free student standings'}
                </h2>
                <span className="text-[10px] font-mono font-bold text-brand-dim">
                  {rankings.length} enrolled {rankings.length === 1 ? 'student' : 'students'}
                </span>
              </div>
              <div className="divide-y divide-brand-border/70">
                {rankings.map((student) => (
                  <div key={student.id} className="grid grid-cols-[2.5rem_minmax(0,1fr)_5.5rem_5rem] items-center gap-2 px-4 py-3 sm:grid-cols-[3rem_minmax(0,1fr)_8rem_7rem] sm:px-5">
                    <span className="text-center font-mono text-xs font-bold text-brand-dim">#{student.rank}</span>
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
                        <UserRound className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-brand-text">
                          {student.name}{String(student.id) === String(user?._id || user?.id) ? ' (You)' : ''}
                        </p>
                        <p className="text-[10px] text-brand-muted">
                          {student.enrolledCourseCount} enrolled {student.enrolledCourseCount === 1 ? 'course' : 'courses'}
                        </p>
                      </div>
                    </div>
                    <span className="text-right text-xs font-extrabold text-brand-primary">
                      {student.xp.toLocaleString()} XP
                    </span>
                    <span className="flex items-center justify-end gap-1 text-xs font-semibold text-brand-muted">
                      <Clock3 className="h-3.5 w-3.5" />
                      {formatWatchTime(student.watchTimeSeconds)}
                    </span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </>
        )}
      </div>
    </div>
  );
}
