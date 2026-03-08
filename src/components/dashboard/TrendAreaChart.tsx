'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { DateRange } from '@/hooks/useDashboardStats';

interface TrendAreaChartProps {
  data: { date: string; count: number }[];
  dateRange: DateRange;
  loading: boolean;
}

export function TrendAreaChart({ data, dateRange, loading }: TrendAreaChartProps) {
  const isWeekly = dateRange === '3months' || dateRange === 'all';

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="h-4 w-48 bg-slate-200 rounded animate-pulse mb-4" />
        <div className="h-72 bg-slate-100 rounded animate-pulse" />
      </div>
    );
  }

  const formatTick = (dateStr: string) => {
    try {
      const d = parseISO(dateStr);
      if (isWeekly) return format(d, 'dd MMM', { locale: tr });
      return format(d, 'dd/MM', { locale: tr });
    } catch {
      return dateStr;
    }
  };

  const formatTooltipLabel = (dateStr: string) => {
    try {
      const d = parseISO(dateStr);
      if (isWeekly) return `Hafta: ${format(d, 'dd MMMM yyyy', { locale: tr })}`;
      return format(d, 'dd MMMM yyyy, EEEE', { locale: tr });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-700">
          📈 Şikayet Trendi
        </h3>
        <span className="text-xs text-slate-400">
          {isWeekly ? 'Haftalık' : 'Günlük'}
        </span>
      </div>

      {data.length === 0 ? (
        <div className="h-72 flex items-center justify-center text-sm text-slate-400">
          Bu dönemde veri bulunamadı
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <defs>
              <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={formatTick}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              interval={data.length > 14 ? Math.floor(data.length / 7) : 0}
            />
            <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              labelFormatter={((label: string) => formatTooltipLabel(label)) as any}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={((value: number) => [value, 'Şikayet']) as any}
              contentStyle={{
                background: '#1e293b',
                border: 'none',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '12px',
              }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#trendGradient)"
              dot={data.length <= 31 ? { r: 3, fill: '#3b82f6', strokeWidth: 0 } : false}
              activeDot={{ r: 5, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
