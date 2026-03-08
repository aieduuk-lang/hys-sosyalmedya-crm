'use client';

import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { StatusBadge } from './StatusBadge';
import { ComplaintWithRelations } from '@/lib/database.types';
import { DurumValue } from '@/lib/constants';

interface ComplaintTableProps {
  complaints: ComplaintWithRelations[];
  loading: boolean;
  page: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

const kanalIcons: Record<string, string> = {
  'Instagram': '📷',
  'X (Twitter)': '𝕏',
  'Facebook': '📘',
  'TikTok': '🎵',
  'Google Reviews': '⭐',
  'Diğer': '💬',
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function getDaysOpen(createdAt: string): number {
  const created = new Date(createdAt);
  const now = new Date();
  const diff = now.getTime() - created.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function SkeletonRow() {
  return (
    <TableRow>
      {Array.from({ length: 10 }).map((_, i) => (
        <TableCell key={i}>
          <div className="h-4 bg-slate-200 rounded animate-pulse" style={{ width: `${50 + Math.random() * 50}%` }} />
        </TableCell>
      ))}
    </TableRow>
  );
}

export function ComplaintTable({
  complaints,
  loading,
  page,
  totalCount,
  pageSize,
  onPageChange,
}: ComplaintTableProps) {
  const totalPages = Math.ceil(totalCount / pageSize);

  if (!loading && complaints.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
        <span className="text-4xl">🔍</span>
        <h3 className="mt-4 text-lg font-medium text-slate-700">
          Şikayet bulunamadı
        </h3>
        <p className="text-sm text-slate-500 mt-2">
          Filtrelerinizi değiştirerek tekrar deneyin.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tablo */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80">
              <TableHead className="w-[80px] text-xs">#</TableHead>
              <TableHead className="text-xs">Tarih</TableHead>
              <TableHead className="text-xs">Şube</TableHead>
              <TableHead className="text-xs">Kanal</TableHead>
              <TableHead className="text-xs">Kategori</TableHead>
              <TableHead className="text-xs">Şikayet Cinsi</TableHead>
              <TableHead className="text-xs">Müşteri</TableHead>
              <TableHead className="text-xs">Durum</TableHead>
              <TableHead className="text-xs">Atanan</TableHead>
              <TableHead className="text-xs">Bekleme</TableHead>
              <TableHead className="text-xs w-[70px]">İşlem</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              : complaints.map((c) => {
                  const daysOpen = getDaysOpen(c.created_at);
                  const isOpen = c.durum === 'yeni' || c.durum === 'islemde';
                  const isWarning = isOpen && daysOpen >= 7;
                  const musteriDisplay = [c.musteri_adi, c.musteri_hesabi]
                    .filter(Boolean)
                    .join(' · ') || '—';

                  return (
                    <TableRow key={c.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-mono text-xs text-slate-400">
                        {c.id.slice(0, 8)}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 whitespace-nowrap">
                        {formatDate(c.created_at)}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-xs font-semibold text-slate-700">
                          {c.sube_kodu}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs whitespace-nowrap">
                        <span className="mr-1">{kanalIcons[c.sosyal_medya_kanali] || '💬'}</span>
                        {c.sosyal_medya_kanali}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">{c.kategori}</TableCell>
                      <TableCell className="text-xs text-slate-600">{c.sikayet_cinsi}</TableCell>
                      <TableCell className="text-xs text-slate-600 max-w-[140px] truncate" title={musteriDisplay}>
                        {musteriDisplay}
                      </TableCell>
                      <TableCell>
                        <StatusBadge durum={c.durum as DurumValue} />
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">
                        {c.atanan_kisi_profile?.full_name || '—'}
                      </TableCell>
                      <TableCell>
                        {isOpen ? (
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded-md ${
                              isWarning
                                ? 'bg-red-50 text-red-600 border border-red-200'
                                : daysOpen >= 3
                                ? 'bg-orange-50 text-orange-600 border border-orange-200'
                                : 'bg-slate-50 text-slate-500 border border-slate-200'
                            }`}
                          >
                            {daysOpen} gün
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Link href={`/sikayetler/${c.id}`}>
                          <Button variant="ghost" size="sm" className="h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                            Detay
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-xs text-slate-500">
            Toplam <span className="font-medium text-slate-700">{totalCount}</span> kayıt
            {' · '}Sayfa <span className="font-medium text-slate-700">{page}</span> / {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="h-8 text-xs"
            >
              ← Önceki
            </Button>
            {/* Sayfa numaraları */}
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onPageChange(pageNum)}
                  className={`h-8 w-8 text-xs p-0 ${pageNum === page ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                >
                  {pageNum}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="h-8 text-xs"
            >
              Sonraki →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
