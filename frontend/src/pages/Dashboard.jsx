import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Award, Trophy, Flame, Target, BookOpen, Calendar, Sparkles,
  BookMarked, UserCheck, Play, Sparkle,
  Settings, LogOut, Download, ShoppingBag, Video, CheckCircle2, LayoutDashboard
} from 'lucide-react';
import { Link } from 'react-router-dom';
import GlassCard from '../components/ui/GlassCard';
import GlowButton from '../components/ui/GlowButton';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import ThemeToggle from '../components/ui/ThemeToggle';
import AdaptiveStudyPanel from '../components/dashboard/AdaptiveStudyPanel';
import EliteEmailAgentPanel from '../components/dashboard/EliteEmailAgentPanel';
import api from '../utils/api';

export default function Dashboard() {
  const { user, logout } = useAuth();
  
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(1455); // simulated upcoming class clock (24m 15s)
  const [upcomingClass, setUpcomingClass] = useState(null);

  // Helper to format countdowns
  const formatCountdown = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}h : ${m.toString().padStart(2, '0')}m : ${s.toString().padStart(2, '0')}s`;
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 1455));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const res = await api.get('/dashboard/overview');
        if (res.data.success) {
          setDashboardData(res.data.data);
        }

        const classRes = await api.get('/zoom/dashboard-classes');
        if (classRes.data.success && classRes.data.data.length > 0) {
          const cls = classRes.data.data[0];
          setUpcomingClass(cls);

          const diffMs = new Date(cls.scheduledAt) - new Date();
          if (diffMs > 0) {
            setTimeLeft(Math.floor(diffMs / 1000));
          }
        }
      } catch (err) {
        console.error('Error fetching dashboard summary:', err);
      } finally {
        setLoading(false);
      }
    };

    void loadDashboardData();
  }, []);

  // Compute 12-week study heatmap grid (84 blocks total)
  const getHeatmapGrid = () => {
    const grid = [];
    const today = new Date();
    const currentDay = today.getDay(); // 0 is Sunday, 6 Saturday
    
    // Find the Sunday of the week 11 weeks ago
    const startDate = new Date();
    startDate.setDate(today.getDate() - 11 * 7 - currentDay);
    
    for (let i = 0; i < 12 * 7; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const count = dashboardData?.heatmap?.[dateStr] || 0;
      grid.push({ date: d, dateStr, count });
    }
    return grid;
  };

  // Convert MongoDB timestamps to relative time
  const getRelativeTime = (timestamp) => {
    const diffMs = new Date() - new Date(timestamp);
    const mins = Math.floor(diffMs / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  // Maps log type to icons and descriptions
  const getLogDetails = (log) => {
    switch (log.type) {
      case 'course_enrolled':
        return {
          detail: `Enrolled in Course: "${log.metadata?.courseName || 'Class'}"`,
          icon: BookOpen,
          color: 'text-brand-primary bg-brand-primary-light dark:bg-brand-primary/10 border-brand-primary/20'
        };
      case 'lesson_completed':
        return {
          detail: `Completed Lecture: "${log.metadata?.lessonName || 'Topic'}"`,
          icon: CheckCircle2,
          color: 'text-brand-green bg-brand-green/10 border-brand-green/20'
        };
      case 'course_completed':
        return {
          detail: `Graduated Masterclass! Completed: "${log.metadata?.courseName || 'Course'}"`,
          icon: Award,
          color: 'text-brand-yellow bg-brand-yellow/10 border-brand-yellow/20'
        };
      case 'note_purchased':
        return {
          detail: `Purchased Study Book: "${log.metadata?.noteName || 'E-Note'}"`,
          icon: ShoppingBag,
          color: 'text-brand-orange bg-brand-orange/10 border-brand-orange/20'
        };
      case 'note_downloaded':
        return {
          detail: `Downloaded Study Book: "${log.metadata?.noteName || 'E-Note'}"`,
          icon: Download,
          color: 'text-brand-primary bg-brand-primary/10 border-brand-primary/20'
        };
      case 'live_class_joined':
        return {
          detail: `Joined Live Session: "${log.metadata?.className || 'Zoom Meeting'}"`,
          icon: Video,
          color: 'text-brand-orange bg-brand-orange/10 border-brand-orange/20'
        };
      default:
        return {
          detail: 'Simulated activity record finalized',
          icon: UserCheck,
          color: 'text-brand-muted bg-brand-base border-brand-border'
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-base flex flex-col items-center justify-center text-brand-text">
        <div className="h-10 w-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 font-mono text-xs text-brand-muted font-bold">Synchronizing command station profile...</p>
      </div>
    );
  }

  const name = user?.name || 'Student';
  // For new users dashboardData will be null/empty — always show real zeros, never fake data
  const isNewUser = !dashboardData || (
    !dashboardData.stats?.xp &&
    !dashboardData.stats?.streak &&
    !dashboardData.recentLogs?.length
  );
  const stats = [
    { label: 'Total XP Earned', value: dashboardData?.stats?.xp ?? 0, icon: Trophy, color: 'text-brand-yellow bg-brand-yellow/10 border-brand-yellow/20' },
    { label: 'Study Streak', value: dashboardData?.stats?.streak ?? 0, icon: Flame, color: 'text-brand-orange bg-brand-orange/10 border-brand-orange/20' },
    { label: 'Platform Rank', value: dashboardData?.stats?.rank ?? '—', icon: Target, color: 'text-brand-primary bg-brand-primary-light dark:bg-brand-primary/10 border-brand-primary/20' },
    { label: 'Lectures Done', value: dashboardData?.stats?.lecturesDone ?? 0, icon: BookOpen, color: 'text-brand-green bg-brand-green/10 border-brand-green/20' }
  ];

  const quickTools = [
    { title: 'Doubt Solver', path: '/ai-tools', desc: 'Ask doubts step-by-step', bg: 'from-pink-500/10 to-rose-500/5 hover:border-pink-400/35 text-pink-500' },
    { title: 'Summariser', path: '/ai-tools', desc: 'Synthesise files to text', bg: 'from-indigo-500/10 to-violet-500/5 hover:border-indigo-400/35 text-indigo-500' },
    { title: 'Flashcards', path: '/ai-tools', desc: 'Generate index revision cards', bg: 'from-cyan-500/10 to-blue-500/5 hover:border-cyan-400/35 text-cyan-500' },
    { title: 'Essay Writer', path: '/ai-tools', desc: 'Formulate thesis answers', bg: 'from-amber-500/10 to-orange-500/5 hover:border-orange-400/35 text-orange-500' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 bg-brand-base min-h-screen text-brand-text transition-colors duration-300">
      
      {/* Welcome Hero Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 overflow-hidden border border-brand-primary/20 bg-gradient-to-tr from-brand-primary/5 via-brand-card to-brand-orange/5 shadow-sm mb-8">
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-tr from-brand-primary/10 to-brand-orange/10 rounded-full filter blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <span className="text-[10px] font-mono text-brand-primary font-bold tracking-wider uppercase bg-brand-primary-light dark:bg-brand-primary/10 px-2.5 py-1 rounded flex items-center gap-1 w-fit">
            <LayoutDashboard className="h-3 w-3" />
            STUDENT COMMAND STATION &bull; ROLE: {user?.role?.toUpperCase()}
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-brand-text mt-3">
            {isNewUser ? `Welcome, ${name.split(' ')[0]}! 🎉` : `Welcome back, ${name.split(' ')[0]}! 👋`}
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted mt-2 max-w-xl leading-relaxed">
            {isNewUser
              ? 'Your command station is all set. Browse masterclasses, enroll in a course, and start building your first study streak today.'
              : <>You maintain a <span className="font-bold text-brand-orange">{dashboardData?.stats?.streak || 0}-day study streak</span>. Watch chapters of your active masterclasses to secure today's study metrics.</>
            }
          </p>
        </div>

        <div className="absolute top-1/2 -translate-y-1/2 right-12 opacity-10 hidden md:block">
          <Award className="h-44 w-44 text-brand-primary" />
        </div>
      </div>

      {/* Stats Counter Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <GlassCard key={idx} className="p-4 sm:p-5 flex items-center justify-between bg-brand-card shadow-sm border border-brand-border">
              <div>
                <span className="text-[10px] font-mono text-brand-dim uppercase tracking-wider block font-bold">{stat.label}</span>
                <span className="font-sora text-xl sm:text-2xl font-extrabold text-brand-text mt-1 block">
                  <AnimatedCounter value={stat.value.toString()} />
                </span>
              </div>
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center border shrink-0 ${stat.color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* ── New-User Onboarding Banner ─────────────────────────── */}
      {isNewUser && (
        <div className="mb-8 rounded-3xl border border-brand-primary/20 bg-gradient-to-br from-brand-primary/5 via-brand-card to-brand-orange/5 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4 text-brand-primary fill-current" />
            <span className="text-xs font-mono text-brand-primary font-bold uppercase tracking-wider">Get Started — Complete these steps to unlock your dashboard</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { emoji: '📚', title: 'Browse Courses', desc: 'Explore 2,000+ exam-aligned masterclasses', path: '/courses', accent: 'from-brand-primary/10 to-brand-primary/5 hover:border-brand-primary/40' },
              { emoji: '🤖', title: 'Try AI Tools', desc: 'Solve doubts, generate summaries, flashcards', path: '/ai-tools', accent: 'from-pink-500/10 to-rose-500/5 hover:border-pink-400/40' },
              { emoji: '🎥', title: 'Join Live Class', desc: 'Attend a free trial session today', path: '/live-class', accent: 'from-cyan-500/10 to-blue-500/5 hover:border-cyan-400/40' },
              { emoji: '📝', title: 'Download Notes', desc: 'Curated handwritten study PDFs', path: '/notes', accent: 'from-amber-500/10 to-orange-500/5 hover:border-amber-400/40' },
            ].map((item, i) => (
              <Link
                key={i}
                to={item.path}
                className={`rounded-2xl border border-brand-border bg-gradient-to-b ${item.accent} p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md flex flex-col gap-2`}
              >
                <span className="text-2xl">{item.emoji}</span>
                <span className="text-xs font-bold text-brand-text">{item.title}</span>
                <span className="text-[10px] text-brand-dim leading-relaxed">{item.desc}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {user?.role === 'elite_student' && (
        <>
          <AdaptiveStudyPanel />
          <EliteEmailAgentPanel />
        </>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Continue learning and AI suite */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Continue Learning Widget */}
          <div className="space-y-3">
            <h2 className="font-display text-base sm:text-lg font-bold text-brand-text flex items-center gap-2">
              <Play className="h-4.5 w-4.5 text-brand-primary fill-current" />
              Continue Learning Active Chapters
            </h2>

            {dashboardData?.resumeCourse ? (
              <GlassCard className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-brand-card border border-brand-border shadow-sm">
                <div className="space-y-1.5 w-full max-w-md">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-brand-primary font-mono tracking-wider uppercase bg-brand-primary-light dark:bg-brand-primary/10 px-2 py-0.5 rounded">
                      {dashboardData.resumeCourse.category}
                    </span>
                    <span className="text-[9px] font-mono text-brand-dim">
                      {dashboardData.resumeCourse.chapterTitle} &bull; {dashboardData.resumeCourse.lessonTitle}
                    </span>
                  </div>
                  <h3 className="text-sm font-extrabold text-brand-text mt-1">{dashboardData.resumeCourse.title}</h3>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-brand-base dark:bg-brand-primary/5 h-2 rounded-full overflow-hidden border border-brand-border mt-3">
                    <div 
                      className="h-full bg-gradient-to-r from-brand-primary to-brand-orange transition-all duration-500" 
                      style={{ width: `${dashboardData.resumeCourse.completionPercent}%` }} 
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto shrink-0 gap-4">
                  <span className="text-xs font-mono text-brand-muted font-bold">{dashboardData.resumeCourse.completionPercent}% Complete</span>
                  <Link
                    to={`/courses/${dashboardData.resumeCourse.slug}/player`}
                    className="rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white px-4 py-2.5 text-xs font-bold transition-all shadow-sm"
                  >
                    Resume Lesson
                  </Link>
                </div>
              </GlassCard>
            ) : (
              <GlassCard className="p-6 text-center border border-brand-border bg-brand-card rounded-2xl">
                <BookMarked className="h-8 w-8 text-brand-dim mx-auto" />
                <h4 className="text-xs font-bold mt-2">No active class resumed yet.</h4>
                <p className="text-[10px] text-brand-muted mt-1">Enroll in any exam syllabus or lecture chapter to begin.</p>
                <Link to="/courses" className="mt-3 inline-block rounded-xl bg-brand-primary text-white text-xs font-bold px-4 py-2 hover:bg-brand-primary-dark transition-all">
                  Browse Masterclasses Catalog
                </Link>
              </GlassCard>
            )}
          </div>

          {/* GitHub-style weekly study heatmap grid */}
          <div className="space-y-3">
            <h2 className="font-display text-base sm:text-lg font-bold text-brand-text flex items-center gap-2">
              <Calendar className="h-4.5 w-4.5 text-brand-orange" />
              Study Activity Heatmap (Last 12 Weeks)
            </h2>

            <GlassCard className="p-5 bg-brand-card border border-brand-border shadow-sm overflow-x-auto">
              <div className="flex flex-col items-center gap-4 min-w-[500px]">
                {/* Calendar Grid wrapper */}
                <div className="flex gap-2 w-full justify-center">
                  
                  {/* Days labels */}
                  <div className="grid grid-rows-7 text-[8px] font-mono text-brand-dim pr-2 text-right justify-between select-none h-[115px] pt-1">
                    <span>Sun</span>
                    <span>Tue</span>
                    <span>Thu</span>
                    <span>Sat</span>
                  </div>

                  {/* 12 columns by 7 rows */}
                  <div className="grid grid-flow-col grid-rows-7 gap-1 h-[115px]">
                    {getHeatmapGrid().map((cell, idx) => {
                      // Color cell based on counts
                      let colorClass = 'bg-brand-border/20'; // 0
                      if (cell.count === 1) colorClass = 'bg-brand-primary/25 border border-brand-primary/10';
                      if (cell.count === 2) colorClass = 'bg-brand-primary/50';
                      if (cell.count === 3) colorClass = 'bg-brand-primary/75';
                      if (cell.count >= 4) colorClass = 'bg-brand-primary shadow-glow-cyan/25';
                      
                      return (
                        <div
                          key={idx}
                          className={`h-3.5 w-3.5 rounded-sm transition-all duration-300 hover:scale-110 cursor-pointer ${colorClass}`}
                          title={`${cell.date.toLocaleDateString()}: ${cell.count} study activities`}
                        />
                      );
                    })}
                  </div>

                </div>

                {/* Heatmap Legend indicator */}
                <div className="flex justify-end w-full items-center gap-1.5 text-[9px] font-mono text-brand-dim pr-8">
                  <span>Less</span>
                  <div className="h-2.5 w-2.5 rounded-sm bg-brand-border/20" />
                  <div className="h-2.5 w-2.5 rounded-sm bg-brand-primary/25" />
                  <div className="h-2.5 w-2.5 rounded-sm bg-brand-primary/50" />
                  <div className="h-2.5 w-2.5 rounded-sm bg-brand-primary/75" />
                  <div className="h-2.5 w-2.5 rounded-sm bg-brand-primary" />
                  <span>More</span>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* AI Tools Suite Grid */}
          <div className="space-y-3">
            <h2 className="font-display text-base sm:text-lg font-bold text-brand-text flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-brand-orange fill-current" />
              AI Studio Workspace Suite
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {quickTools.map((tool, index) => (
                <Link
                  key={index}
                  to={tool.path}
                  className={`rounded-2xl border border-brand-border bg-brand-card p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-sm flex flex-col justify-between items-center h-32 bg-gradient-to-b ${tool.bg}`}
                >
                  <div className="h-9 w-9 rounded-xl bg-brand-card border border-brand-border flex items-center justify-center text-brand-primary">
                    <Sparkle className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-brand-text block">{tool.title}</span>
                    <span className="text-[9px] text-brand-dim mt-0.5 block line-clamp-1">{tool.desc}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Live Countdown and Activity lists */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Live class card */}
          <GlassCard className="p-6 border-2 border-brand-primary/20 dark:border-brand-primary/10 bg-gradient-to-tr from-brand-primary-light/40 to-transparent bg-brand-card">
            <div className="flex items-center gap-2 mb-4">
              <span className="h-2.5 w-2.5 rounded-full bg-brand-orange animate-ping shrink-0" />
              <span className="text-[10px] font-mono text-brand-orange font-bold uppercase tracking-wider">
                Live Classroom Countdown
              </span>
            </div>

            <h3 className="text-sm font-bold text-brand-text leading-snug">
              {upcomingClass ? upcomingClass.title : 'Live Optical Physics Drill Session & Doubt clearance'}
            </h3>
            <p className="text-xs text-brand-muted mt-1">
              Course: {upcomingClass?.course?.title || 'Advanced Board Mock Prep'}
            </p>

            <div className="rounded-xl bg-brand-base p-4 border border-brand-border mt-4 text-center">
              <span className="text-[10px] text-brand-dim font-mono block">STARTING IN</span>
              <span className="text-base font-extrabold text-brand-text font-mono mt-1 block">
                {formatCountdown(timeLeft)}
              </span>
            </div>

            <Link to="/live-class">
              <GlowButton variant="primary" className="w-full mt-4 text-xs py-2.5 uppercase font-bold tracking-wider bg-brand-orange border-transparent">
                Enter Live Class
              </GlowButton>
            </Link>
          </GlassCard>

          {/* Recent activities feed */}
          <GlassCard className="p-5 space-y-4 bg-brand-card">
            <h3 className="font-display text-sm font-bold text-brand-text border-b border-brand-border pb-2">
              Recent Study Activity logs
            </h3>
            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
              {dashboardData?.recentLogs && dashboardData.recentLogs.length > 0 ? (
                dashboardData.recentLogs.map((log) => {
                  const logDetail = getLogDetails(log);
                  const Icon = logDetail.icon;
                  return (
                    <div key={log._id} className="flex gap-3 text-xs border-b border-brand-border/40 pb-3 last:border-b-0 last:pb-0">
                      <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 border ${logDetail.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-brand-text font-semibold leading-normal">{logDetail.detail}</p>
                        <span className="text-[9px] text-brand-dim font-mono block">{getRelativeTime(log.createdAt)}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-[10px] text-brand-muted text-center py-4">No recent activity logs recorded yet.</p>
              )}
            </div>
          </GlassCard>

          {/* Dashboard settings card */}
          <GlassCard className="p-5 space-y-4 bg-brand-card border border-brand-border shadow-sm">
            <h3 className="font-display text-sm font-bold text-brand-text border-b border-brand-border pb-2 flex items-center gap-1.5">
              <Settings className="h-4 w-4 text-brand-primary" />
              Workspace Appearance & Settings
            </h3>
            
            <div className="flex flex-col gap-4">
              {/* Theme Selector row */}
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-brand-text block">Dark / Light Appearance</span>
                  <span className="text-[10px] text-brand-dim mt-0.5 block font-mono">Switch layout overrides</span>
                </div>
                <ThemeToggle />
              </div>

              {/* Logout row */}
              <div className="border-t border-brand-border/40 pt-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-brand-text block">Session Authorization</span>
                  <span className="text-[10px] text-brand-dim mt-0.5 block font-mono">Sign out of active account</span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-1 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Logout
                </button>
              </div>
            </div>
          </GlassCard>

        </div>

      </div>

    </div>
  );
}
