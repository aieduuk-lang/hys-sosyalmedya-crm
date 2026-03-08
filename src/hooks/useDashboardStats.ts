'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import {
  startOfWeek,
  startOfMonth,
  subMonths,
  format,
  eachDayOfInterval,
  eachWeekOfInterval,
  startOfDay,
  endOfDay,
} from 'date-fns';

export type DateRange = 'week' | 'month' | '3months' | 'all';

export interface DashboardStats {
  totalComplaints: number;
  openComplaints: number;
  resolvedThisPeriod: number;
  avgResolutionDays: number;
  branchOpen: { sube: string; count: number }[];
  categoryDistribution: { kategori: string; count: number }[];
  channelDistribution: { kanal: string; count: number }[];
  trendData: { date: string; count: number }[];
  topBranches: { sube: string; count: number }[];
  assigneeStats: { id: string | null; name: string; count: number }[];
}

const EMPTY_STATS: DashboardStats = {
  totalComplaints: 0,
  openComplaints: 0,
  resolvedThisPeriod: 0,
  avgResolutionDays: 0,
  branchOpen: [],
  categoryDistribution: [],
  channelDistribution: [],
  trendData: [],
  topBranches: [],
  assigneeStats: [],
};

function getDateRangeStart(range: DateRange): Date | null {
  const now = new Date();
  switch (range) {
    case 'week':
      return startOfWeek(now, { weekStartsOn: 1 });
    case 'month':
      return startOfMonth(now);
    case '3months':
      return subMonths(startOfMonth(now), 2);
    case 'all':
      return null;
  }
}

export function useDashboardStats(dateRange: DateRange) {
  const supabase = createClient();
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);

    const rangeStart = getDateRangeStart(dateRange);
    const rangeISO = rangeStart ? rangeStart.toISOString() : null;

    try {
      const [
        totalRes,
        openRes,
        resolvedRes,
        avgRes,
        branchRes,
        catRes,
        channelRes,
        trendRes,
        topBranchRes,
        assigneeRes,
        unassignedRes,
        profilesRes,
      ] = await Promise.all([
        // 1. Toplam şikayet (dönemde)
        (() => {
          let q = supabase.from('complaints').select('id', { count: 'exact', head: true });
          if (rangeISO) q = q.gte('created_at', rangeISO);
          return q;
        })(),

        // 2. Açık şikayetler (dönem fark etmez)
        supabase
          .from('complaints')
          .select('id', { count: 'exact', head: true })
          .in('durum', ['yeni', 'islemde']),

        // 3. Bu dönem çözülen
        (() => {
          let q = supabase
            .from('complaints')
            .select('id', { count: 'exact', head: true })
            .eq('durum', 'cozuldu');
          if (rangeISO) q = q.gte('updated_at', rangeISO);
          return q;
        })(),

        // 4. Ortalama çözüm süresi
        (() => {
          let q = supabase
            .from('complaints')
            .select('created_at, updated_at')
            .eq('durum', 'cozuldu');
          if (rangeISO) q = q.gte('updated_at', rangeISO);
          return q;
        })(),

        // 5. Şubeye göre açık (dönem fark etmez)
        supabase
          .from('complaints')
          .select('sube_kodu')
          .in('durum', ['yeni', 'islemde']),

        // 6. Kategoriye göre (dönemde)
        (() => {
          let q = supabase.from('complaints').select('kategori');
          if (rangeISO) q = q.gte('created_at', rangeISO);
          return q;
        })(),

        // 7. Kanala göre (dönemde)
        (() => {
          let q = supabase.from('complaints').select('sosyal_medya_kanali');
          if (rangeISO) q = q.gte('created_at', rangeISO);
          return q;
        })(),

        // 8. Trend (dönemde)
        (() => {
          let q = supabase.from('complaints').select('created_at');
          if (rangeISO) q = q.gte('created_at', rangeISO);
          return q.order('created_at', { ascending: true });
        })(),

        // 9. Top şubeler (dönemde)
        (() => {
          let q = supabase.from('complaints').select('sube_kodu');
          if (rangeISO) q = q.gte('created_at', rangeISO);
          return q;
        })(),

        // 10. Atanan kişi bazlı açık (dönem fark etmez)
        supabase
          .from('complaints')
          .select('atanan_kisi')
          .in('durum', ['yeni', 'islemde'])
          .not('atanan_kisi', 'is', null),

        // 11. Atanmamış açık
        supabase
          .from('complaints')
          .select('id', { count: 'exact', head: true })
          .in('durum', ['yeni', 'islemde'])
          .is('atanan_kisi', null),

        // 12. Profiller
        supabase.from('profiles').select('id, full_name'),
      ]);

      // Hesaplamalar
      const totalComplaints = totalRes.count || 0;
      const openComplaints = openRes.count || 0;
      const resolvedThisPeriod = resolvedRes.count || 0;

      // Ortalama çözüm süresi
      let avgResolutionDays = 0;
      if (avgRes.data && avgRes.data.length > 0) {
        const totalDays = avgRes.data.reduce((sum: number, c: { created_at: string; updated_at: string }) => {
          return sum + (new Date(c.updated_at).getTime() - new Date(c.created_at).getTime()) / (1000 * 60 * 60 * 24);
        }, 0);
        avgResolutionDays = Math.round((totalDays / avgRes.data.length) * 10) / 10;
      }

      // Şubeye göre açık
      const branchMap = new Map<string, number>();
      branchRes.data?.forEach((c: { sube_kodu: string }) => {
        branchMap.set(c.sube_kodu, (branchMap.get(c.sube_kodu) || 0) + 1);
      });
      const branchOpen = Array.from(branchMap.entries())
        .map(([sube, count]) => ({ sube, count }))
        .sort((a, b) => b.count - a.count);

      // Kategoriye göre
      const catMap = new Map<string, number>();
      catRes.data?.forEach((c: { kategori: string }) => {
        catMap.set(c.kategori, (catMap.get(c.kategori) || 0) + 1);
      });
      const categoryDistribution = Array.from(catMap.entries())
        .map(([kategori, count]) => ({ kategori, count }))
        .sort((a, b) => b.count - a.count);

      // Kanala göre
      const channelMap = new Map<string, number>();
      channelRes.data?.forEach((c: { sosyal_medya_kanali: string }) => {
        channelMap.set(c.sosyal_medya_kanali, (channelMap.get(c.sosyal_medya_kanali) || 0) + 1);
      });
      const channelDistribution = Array.from(channelMap.entries())
        .map(([kanal, count]) => ({ kanal, count }))
        .sort((a, b) => b.count - a.count);

      // Trend
      const isWeekly = dateRange === '3months' || dateRange === 'all';
      const trendMap = new Map<string, number>();
      const now = new Date();

      if (!isWeekly) {
        const start = rangeStart || new Date(trendRes.data?.[0]?.created_at || now);
        const days = eachDayOfInterval({ start: startOfDay(start), end: endOfDay(now) });
        days.forEach((d) => trendMap.set(format(d, 'yyyy-MM-dd'), 0));
        trendRes.data?.forEach((c: { created_at: string }) => {
          const key = format(new Date(c.created_at), 'yyyy-MM-dd');
          trendMap.set(key, (trendMap.get(key) || 0) + 1);
        });
      } else {
        const start = rangeStart || new Date(trendRes.data?.[0]?.created_at || now);
        const weeks = eachWeekOfInterval({ start, end: now }, { weekStartsOn: 1 });
        weeks.forEach((w) => trendMap.set(format(w, 'yyyy-MM-dd'), 0));
        trendRes.data?.forEach((c: { created_at: string }) => {
          const w = startOfWeek(new Date(c.created_at), { weekStartsOn: 1 });
          const key = format(w, 'yyyy-MM-dd');
          trendMap.set(key, (trendMap.get(key) || 0) + 1);
        });
      }
      const trendData = Array.from(trendMap.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Top şubeler
      const topMap = new Map<string, number>();
      topBranchRes.data?.forEach((c: { sube_kodu: string }) => {
        topMap.set(c.sube_kodu, (topMap.get(c.sube_kodu) || 0) + 1);
      });
      const topBranches = Array.from(topMap.entries())
        .map(([sube, count]) => ({ sube, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Atanan kişi bazlı
      const assignMap = new Map<string, number>();
      assigneeRes.data?.forEach((c: { atanan_kisi: string }) => {
        assignMap.set(c.atanan_kisi, (assignMap.get(c.atanan_kisi) || 0) + 1);
      });
      const profileMap = new Map<string, string>();
      profilesRes.data?.forEach((p: { id: string; full_name: string | null }) => {
        profileMap.set(p.id, p.full_name || p.id.slice(0, 8));
      });
      const assigneeStats: DashboardStats['assigneeStats'] = Array.from(assignMap.entries())
        .map(([id, count]) => ({ id, name: profileMap.get(id) || id.slice(0, 8), count }))
        .sort((a, b) => b.count - a.count);
      // Atanmamış
      const unassignedCount = unassignedRes.count || 0;
      if (unassignedCount > 0) {
        assigneeStats.push({ id: null, name: 'Atanmamış', count: unassignedCount });
      }

      setStats({
        totalComplaints,
        openComplaints,
        resolvedThisPeriod,
        avgResolutionDays,
        branchOpen,
        categoryDistribution,
        channelDistribution,
        trendData,
        topBranches,
        assigneeStats,
      });
    } catch (err) {
      console.error('Dashboard veri çekme hatası:', err);
    }

    setLoading(false);
  }, [supabase, dateRange]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading };
}
