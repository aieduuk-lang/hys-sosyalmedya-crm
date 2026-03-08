'use client';

import { DashboardStats } from '@/hooks/useDashboardStats';

interface StatCardsProps {
  stats: DashboardStats;
  loading: boolean;
}

const cards = [
  {
    key: 'totalComplaints' as const,
    label: 'Toplam Şikayet',
    emoji: '📋',
    color: 'from-blue-500 to-indigo-600',
    bgGlow: 'bg-blue-500/10',
  },
  {
    key: 'openComplaints' as const,
    label: 'Açık Şikayetler',
    emoji: '🔴',
    color: 'from-red-500 to-rose-600',
    bgGlow: 'bg-red-500/10',
  },
  {
    key: 'resolvedThisPeriod' as const,
    label: 'Bu Dönem Çözülen',
    emoji: '✅',
    color: 'from-emerald-500 to-teal-600',
    bgGlow: 'bg-emerald-500/10',
  },
  {
    key: 'avgResolutionDays' as const,
    label: 'Ort. Çözüm Süresi',
    emoji: '⏱',
    color: 'from-amber-500 to-orange-600',
    bgGlow: 'bg-amber-500/10',
    suffix: ' gün',
  },
];

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-200 rounded-lg" />
        <div className="space-y-2 flex-1">
          <div className="h-3 w-24 bg-slate-200 rounded" />
          <div className="h-6 w-16 bg-slate-200 rounded" />
        </div>
      </div>
    </div>
  );
}

export function StatCards({ stats, loading }: StatCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const value = stats[card.key];
        return (
          <div
            key={card.key}
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 relative overflow-hidden group hover:shadow-md transition-shadow"
          >
            <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full ${card.bgGlow} blur-2xl opacity-60 group-hover:opacity-80 transition-opacity`} />
            <div className="relative flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center text-lg shadow-sm`}>
                {card.emoji}
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">{card.label}</p>
                <p className="text-xl font-bold text-slate-900">
                  {value}
                  {'suffix' in card && <span className="text-sm font-normal text-slate-400">{card.suffix}</span>}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
