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

interface ChannelBarChartProps {
  data: { kanal: string; count: number }[];
  loading: boolean;
}

const kanalIcons: Record<string, string> = {
  'Instagram': '📷',
  'X (Twitter)': '𝕏',
  'Facebook': '📘',
  'TikTok': '🎵',
  'Google Reviews': '⭐',
  'Diğer': '💬',
};

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export function ChannelBarChart({ data, loading }: ChannelBarChartProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="h-4 w-48 bg-slate-200 rounded animate-pulse mb-4" />
        <div className="h-64 bg-slate-100 rounded animate-pulse" />
      </div>
    );
  }

  const formatted = data.map((d) => ({
    ...d,
    label: `${kanalIcons[d.kanal] || '💬'} ${d.kanal}`,
  }));

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">📱 Kanala Göre Dağılım</h3>

      {data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-sm text-slate-400">
          Bu dönemde veri bulunamadı
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={formatted} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: '#475569' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={((value: number) => [value, 'Şikayet']) as any}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              labelFormatter={((label: string) => label) as any}
              contentStyle={{
                background: '#1e293b',
                border: 'none',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '12px',
              }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={48}>
              {formatted.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
