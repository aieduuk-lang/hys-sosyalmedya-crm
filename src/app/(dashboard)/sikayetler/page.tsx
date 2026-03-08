'use client';

import { useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ComplaintFilters, type FilterState } from './components/ComplaintFilters';
import { ComplaintTable } from './components/ComplaintTable';
import { ComplaintWithRelations } from '@/lib/database.types';
import { generateCSV, downloadCSV } from '@/lib/exportCsv';

const PAGE_SIZE = 20;

function SikayetlerContent() {
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [complaints, setComplaints] = useState<ComplaintWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(() => {
    const p = searchParams.get('sayfa');
    return p ? parseInt(p, 10) : 1;
  });

  const buildQuery = useCallback(
    (filters: FilterState, paginated: boolean, currentPage?: number) => {
      if (!supabase) return null;

      let query = supabase
        .from('complaints')
        .select(
          `
          *,
          atanan_kisi_profile:profiles!complaints_atanan_kisi_fkey(id, full_name),
          created_by_profile:profiles!complaints_created_by_fkey(id, full_name)
        `,
          { count: 'exact' }
        )
        .order('created_at', { ascending: false });

      if (paginated && currentPage) {
        const from = (currentPage - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;
        query = query.range(from, to);
      }

      if (filters.sube) query = query.eq('sube_kodu', filters.sube);
      if (filters.kategori) query = query.eq('kategori', filters.kategori);
      if (filters.sikayet_cinsi) query = query.eq('sikayet_cinsi', filters.sikayet_cinsi);
      if (filters.durum) query = query.eq('durum', filters.durum);
      if (filters.atanan) query = query.eq('atanan_kisi', filters.atanan);
      if (filters.baslangic) query = query.gte('created_at', `${filters.baslangic}T00:00:00`);
      if (filters.bitis) query = query.lte('created_at', `${filters.bitis}T23:59:59`);

      return query;
    },
    [supabase]
  );

  const fetchComplaints = useCallback(
    async (filters: FilterState, currentPage: number) => {
      const query = buildQuery(filters, true, currentPage);
      if (!query) return;
      setLoading(true);

      const { data, count, error } = await query;

      if (!error && data) {
        setComplaints(data as unknown as ComplaintWithRelations[]);
        setTotalCount(count || 0);
      }

      setLoading(false);
    },
    [buildQuery]
  );

  const [currentFilters, setCurrentFilters] = useState<FilterState>({
    sube: '',
    kategori: '',
    sikayet_cinsi: '',
    durum: '',
    atanan: '',
    baslangic: '',
    bitis: '',
  });

  const handleFiltersChange = useCallback(
    (filters: FilterState) => {
      setCurrentFilters(filters);
      setPage(1);
      fetchComplaints(filters, 1);
    },
    [fetchComplaints]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage);
      fetchComplaints(currentFilters, newPage);
      const params = new URLSearchParams(window.location.search);
      if (newPage > 1) {
        params.set('sayfa', String(newPage));
      } else {
        params.delete('sayfa');
      }
    },
    [currentFilters, fetchComplaints]
  );

  const handleExportCSV = async () => {
    const query = buildQuery(currentFilters, false);
    if (!query) return;
    setExporting(true);

    const { data, error } = await query;

    if (error || !data) {
      toast.error('CSV oluşturulamadı', { description: error?.message, duration: 3000 });
      setExporting(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const csv = generateCSV(data as any);
    downloadCSV(csv);
    toast.success(`${data.length} kayıt CSV olarak indirildi`, { duration: 3000 });
    setExporting(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Şikayetler</h1>
          <p className="text-slate-500 mt-1">
            Tüm sosyal medya şikayetlerini görüntüleyin ve yönetin.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleExportCSV}
            disabled={exporting || totalCount === 0}
            className="gap-2 text-sm"
          >
            {exporting ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                İndiriliyor...
              </>
            ) : (
              <>📥 CSV İndir</>
            )}
          </Button>
          <Link href="/sikayetler/yeni">
            <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Yeni Şikayet
            </Button>
          </Link>
        </div>
      </div>

      {/* Filtreler */}
      <ComplaintFilters onFiltersChange={handleFiltersChange} />

      {/* Tablo */}
      <ComplaintTable
        complaints={complaints}
        loading={loading}
        page={page}
        totalCount={totalCount}
        pageSize={PAGE_SIZE}
        onPageChange={handlePageChange}
      />
    </div>
  );
}

export default function SikayetlerPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div>
            <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
            <div className="h-5 w-80 bg-slate-100 rounded animate-pulse mt-2" />
          </div>
          <div className="h-32 bg-slate-100 rounded-xl animate-pulse" />
          <div className="h-96 bg-slate-100 rounded-xl animate-pulse" />
        </div>
      }
    >
      <SikayetlerContent />
    </Suspense>
  );
}

