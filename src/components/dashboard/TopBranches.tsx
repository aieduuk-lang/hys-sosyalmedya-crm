'use client';

interface TopBranchesProps {
  data: { sube: string; count: number }[];
  loading: boolean;
}

export function TopBranches({ data, loading }: TopBranchesProps) {
  const maxCount = data.length > 0 ? data[0].count : 1;

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="h-4 w-48 bg-slate-200 rounded animate-pulse mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 bg-slate-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">
        🏆 En Çok Şikayet Alan Şubeler
        <span className="text-xs font-normal text-slate-400 ml-1">(Top 5)</span>
      </h3>

      {data.length === 0 ? (
        <div className="py-8 text-center text-sm text-slate-400">
          Bu dönemde veri bulunamadı
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((item, i) => {
            const pct = (item.count / maxCount) * 100;
            return (
              <div key={item.sube} className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-400 w-4 text-right">
                  {i + 1}
                </span>
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-xs font-bold text-slate-700">
                  {item.sube}
                </span>
                <div className="flex-1">
                  <div className="h-5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-semibold text-slate-700 w-8 text-right">
                  {item.count}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
