'use client';

import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDashboardStats, type DateRange } from '@/hooks/useDashboardStats';
import { StatCards } from '@/components/dashboard/StatCards';
import { BranchBarChart } from '@/components/dashboard/BranchBarChart';
import { CategoryDonutChart } from '@/components/dashboard/CategoryDonutChart';
import { ChannelBarChart } from '@/components/dashboard/ChannelBarChart';
import { TrendAreaChart } from '@/components/dashboard/TrendAreaChart';
import { TopBranches } from '@/components/dashboard/TopBranches';
import { AssigneeStats } from '@/components/dashboard/AssigneeStats';

const dateRangeOptions: { value: DateRange; label: string }[] = [
  { value: 'week', label: 'Bu Hafta' },
  { value: 'month', label: 'Bu Ay' },
  { value: '3months', label: 'Son 3 Ay' },
  { value: 'all', label: 'Tüm Zamanlar' },
];

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange>('month');
  const { stats, loading } = useDashboardStats(dateRange);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">
            Şikayet yönetim sistemi genel görünümü
          </p>
        </div>
        <Select
          value={dateRange}
          onValueChange={(v) => setDateRange(v as DateRange)}
        >
          <SelectTrigger className="w-44 h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {dateRangeOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Özet Kartlar */}
      <StatCards stats={stats} loading={loading} />

      {/* Grafik Satırı 1: Trend (tam genişlik) */}
      <TrendAreaChart data={stats.trendData} dateRange={dateRange} loading={loading} />

      {/* Grafik Satırı 2: Bar + Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BranchBarChart data={stats.branchOpen} loading={loading} />
        <CategoryDonutChart data={stats.categoryDistribution} loading={loading} />
      </div>

      {/* Grafik Satırı 3: Kanal (tam genişlik) */}
      <ChannelBarChart data={stats.channelDistribution} loading={loading} />

      {/* Alt Bölüm: Top Şubeler + Kişi Bazlı */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopBranches data={stats.topBranches} loading={loading} />
        <AssigneeStats data={stats.assigneeStats} loading={loading} />
      </div>
    </div>
  );
}
