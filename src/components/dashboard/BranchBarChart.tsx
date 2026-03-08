'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface BranchBarChartProps {
  data: { sube: string; count: number }[];
  loading: boolean;
}

const BAR_COLOR = '#3b82f6';

export function BranchBarChart({ data, loading }: BranchBarChartProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="h-4 w-48 bg-slate-200 rounded animate-pulse mb-4" />
        <div className="h-64 bg-slate-100 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
        🏢 Şubeye Göre Açık Şikayetler
        <span className="text-xs font-normal text-slate-400">(anlık)</span>
      </h3>

      {data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-sm text-slate-400">
          Açık şikayet bulunamadı
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(data.length * 36, 200)}>
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis
              dataKey="sube"
              type="category"
              tick={{ fontSize: 12, fill: '#475569', fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={((value: number) => [value, 'Açık Şikayet']) as any}
              contentStyle={{
                background: '#1e293b',
                border: 'none',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '12px',
              }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={24}>
              {data.map((_, i) => (
                <Cell key={i} fill={BAR_COLOR} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
