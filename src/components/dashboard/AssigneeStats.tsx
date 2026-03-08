'use client';

import { Badge } from '@/components/ui/badge';

interface AssigneeStatsProps {
  data: { id: string | null; name: string; count: number }[];
  loading: boolean;
}

const avatarColors = [
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-purple-500 to-violet-600',
  'from-orange-500 to-amber-600',
  'from-pink-500 to-rose-600',
  'from-cyan-500 to-sky-600',
];

function getInitials(name: string): string {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

export function AssigneeStats({ data, loading }: AssigneeStatsProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="h-4 w-48 bg-slate-200 rounded animate-pulse mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-200 rounded-lg animate-pulse" />
              <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">
        👥 Kişi Bazlı Açık Şikayetler
        <span className="text-xs font-normal text-slate-400 ml-1">(anlık)</span>
      </h3>

      {data.length === 0 ? (
        <div className="py-8 text-center text-sm text-slate-400">
          Açık şikayet bulunamadı
        </div>
      ) : (
        <div className="space-y-2.5">
          {data.map((item, i) => {
            const isUnassigned = !item.id;
            const color = isUnassigned
              ? 'from-slate-400 to-slate-500'
              : avatarColors[i % avatarColors.length];

            return (
              <div
                key={item.id || 'unassigned'}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div
                  className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-white text-[10px] font-semibold shrink-0`}
                >
                  {isUnassigned ? '?' : getInitials(item.name)}
                </div>
                <span className={`text-sm flex-1 ${isUnassigned ? 'text-slate-400 italic' : 'text-slate-700 font-medium'}`}>
                  {item.name}
                </span>
                <Badge
                  variant="outline"
                  className={`text-xs font-semibold px-2 ${
                    item.count >= 5
                      ? 'bg-red-50 text-red-600 border-red-200'
                      : item.count >= 3
                      ? 'bg-orange-50 text-orange-600 border-orange-200'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  {item.count}
                </Badge>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
