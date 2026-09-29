import React from 'react';
import { 
  Trophy, Award, Sparkles, TrendingUp, ShieldAlert, Check, 
  Flame, Crown, Medal, ArrowUp, ArrowDown, User
} from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';

export default function Leaderboard() {
  const rankingList = [
    { 
      rank: 1, 
      name: 'Suhail Khan', 
      xp: '2,450 XP', 
      level: 'Level 5 Legend', 
      medal: '🥇', 
      trend: 'up',
      color: 'border-brand-yellow/30 bg-gradient-to-tr from-brand-yellow/10 via-brand-card to-transparent shadow-md' 
    },
    { 
      rank: 2, 
      name: 'Aryan Kumar (You)', 
      xp: '1,820 XP', 
      level: 'Level 4 Scholar', 
      medal: '🥈', 
      trend: 'none',
      color: 'border-brand-primary/20 bg-brand-card' 
    },
    { 
      rank: 3, 
      name: 'Tanya Gupta', 
      xp: '1,450 XP', 
      level: 'Level 3 Pro', 
      medal: '🥉', 
      trend: 'up',
      color: 'border-brand-orange/20 bg-brand-card' 
    },
    { 
      rank: 4, 
      name: 'Preeti Sharma', 
      xp: '1,120 XP', 
      level: 'Level 3 Scholar',
      trend: 'down'
    },
    { 
      rank: 5, 
      name: 'Amit Singh', 
      xp: '950 XP', 
      level: 'Level 2 Intermediate',
      trend: 'up'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 bg-brand-base min-h-screen text-brand-text transition-colors duration-300">
      
      {/* Header Section */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="text-[10px] font-mono text-brand-primary bg-brand-primary-light dark:bg-brand-primary/10 px-3 py-1.5 rounded-full font-bold uppercase tracking-wider">
          ACADEMIC RATING MATRIX
        </span>
        <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-brand-text mt-3">
          XP Rank{' '}
          <span className="bg-gradient-to-r from-brand-primary via-brand-orange to-brand-primary bg-clip-text text-transparent">
            Podium
          </span>
        </h1>
        <p className="text-brand-muted text-xs sm:text-sm mt-3 max-w-xl mx-auto leading-relaxed">
          Unlock weekly bonuses, compete in mock drill test series, and download student note packages to claim your Legend badge.
        </p>
      </div>

      {/* Ranks 3D-Like Podium Widget */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end max-w-3xl mx-auto mb-12">
        
        {/* Rank 2 (Silver) */}
        <GlassCard className="p-6 text-center border border-brand-border bg-brand-card h-[220px] flex flex-col justify-between order-2 md:order-1 relative shadow-sm">
          <div className="absolute top-3 right-3 text-brand-dim text-xs font-mono">#2</div>
          <div className="space-y-2 flex flex-col items-center">
            <span className="text-3xl">🥈</span>
            <div>
              <h3 className="font-display text-sm font-extrabold text-brand-text mt-1">{rankingList[1].name}</h3>
              <span className="text-[10px] text-brand-dim block font-mono font-semibold">{rankingList[1].level}</span>
            </div>
          </div>
          <div className="pt-3 border-t border-brand-border/60">
            <span className="font-sora text-sm font-bold text-brand-primary">{rankingList[1].xp}</span>
          </div>
        </GlassCard>

        {/* Rank 1 (Gold, Taller Card) */}
        <GlassCard className="p-6 text-center border-2 border-brand-yellow/30 bg-gradient-to-tr from-brand-yellow/10 via-brand-card to-brand-primary/5 h-[265px] flex flex-col justify-between order-1 md:order-2 relative shadow-md">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-yellow text-white h-6 w-6 rounded-full flex items-center justify-center shadow">
            <Crown className="h-3.5 w-3.5 fill-current" />
          </div>
          <div className="absolute top-3 right-3 text-brand-yellow text-xs font-mono font-bold">#1</div>
          
          <div className="space-y-2 flex flex-col items-center mt-2">
            <span className="text-4xl">🥇</span>
            <div>
              <h3 className="font-display text-base font-extrabold text-brand-text mt-1">{rankingList[0].name}</h3>
              <span className="text-[10px] text-brand-yellow block font-mono font-bold uppercase tracking-wider">{rankingList[0].level}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-brand-border/60">
            <span className="font-sora text-base font-extrabold text-brand-primary">{rankingList[0].xp}</span>
          </div>
        </GlassCard>

        {/* Rank 3 (Bronze) */}
        <GlassCard className="p-6 text-center border border-brand-border bg-brand-card h-[200px] flex flex-col justify-between order-3 relative shadow-sm">
          <div className="absolute top-3 right-3 text-brand-dim text-xs font-mono">#3</div>
          <div className="space-y-2 flex flex-col items-center">
            <span className="text-3xl">🥉</span>
            <div>
              <h3 className="font-display text-sm font-extrabold text-brand-text mt-1">{rankingList[2].name}</h3>
              <span className="text-[10px] text-brand-dim block font-mono font-semibold">{rankingList[2].level}</span>
            </div>
          </div>
          <div className="pt-3 border-t border-brand-border/60">
            <span className="font-sora text-sm font-bold text-brand-primary">{rankingList[2].xp}</span>
          </div>
        </GlassCard>

      </div>

      {/* Global Rankings Listing Table */}
      <GlassCard className="max-w-3xl mx-auto p-5 sm:p-6 bg-brand-card border border-brand-border shadow-sm">
        
        <div className="flex justify-between items-center border-b border-brand-border pb-4 mb-4">
          <h3 className="font-display text-sm sm:text-base font-bold text-brand-text flex items-center gap-2">
            <TrendingUp className="h-4.5 w-4.5 text-brand-primary" />
            Global Student Leaderboard Standings
          </h3>
          <span className="text-[10px] font-mono text-brand-dim font-bold">UPDATED LATEST 10 MINUTES AGO</span>
        </div>

        <div className="space-y-2.5">
          {rankingList.map((student) => (
            <div 
              key={student.rank} 
              className={`flex items-center justify-between p-4 rounded-xl border border-brand-border bg-brand-base/40 hover:border-brand-primary/30 hover:bg-brand-card transition-all`}
            >
              <div className="flex items-center gap-4">
                <span className="font-mono text-xs font-bold text-brand-dim w-6 text-center">
                  #{student.rank}
                </span>

                <div className="h-8 w-8 rounded-lg bg-brand-primary-light dark:bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                  <User className="h-4 w-4" />
                </div>

                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm font-extrabold text-brand-text">
                    {student.name}
                  </span>
                  <span className="text-[9px] text-brand-dim font-mono">{student.level}</span>
                </div>
              </div>

              {/* Ranks medals or trend indicators */}
              <div className="flex items-center gap-4 text-xs font-mono font-bold">
                <span className="text-brand-primary font-sora font-semibold">
                  {student.xp}
                </span>

                {student.medal ? (
                  <span className="text-sm shrink-0">{student.medal}</span>
                ) : (
                  <div className="flex items-center gap-0.5 text-brand-dim shrink-0">
                    {student.trend === 'up' && <ArrowUp className="h-3.5 w-3.5 text-brand-green" />}
                    {student.trend === 'down' && <ArrowDown className="h-3.5 w-3.5 text-brand-orange" />}
                    <span className="text-[9px] uppercase">{student.trend}</span>
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>

      </GlassCard>

    </div>
  );
}
