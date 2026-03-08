'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '../../components/StatusBadge';
import { ComplaintActions } from './ComplaintActions';
import { ComplaintNotes } from './ComplaintNotes';
import { Complaint, ComplaintNoteWithProfile, Profile } from '@/lib/database.types';
import { DurumValue } from '@/lib/constants';

interface ComplaintDetailProps {
  initialComplaint: Complaint & {
    atanan_kisi_profile?: Profile | null;
    created_by_profile?: Profile | null;
  };
  initialNotes: ComplaintNoteWithProfile[];
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
  return new Date(dateStr).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getDaysOpen(createdAt: string): number {
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
}

export function ComplaintDetail({ initialComplaint, initialNotes }: ComplaintDetailProps) {
  const router = useRouter();
  const supabase = createClient();
  const [complaint, setComplaint] = useState(initialComplaint);
  const daysOpen = getDaysOpen(complaint.created_at);
  const isOpen = complaint.durum === 'yeni' || complaint.durum === 'islemde';

  // Complaints Realtime subscription
  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel(`complaint-${complaint.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'complaints',
          filter: `id=eq.${complaint.id}`,
        },
        (payload: { new: Record<string, unknown> }) => {
          const updated = payload.new as unknown as Complaint;
          setComplaint((prev) => ({ ...prev, ...updated }));
          toast.info('Şikayet başka bir kullanıcı tarafından güncellendi');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, complaint.id]);

  // Şikayet güncellendiğinde (local optimistic + modal callback)
  const handleComplaintUpdate = useCallback((updates: Partial<Complaint>) => {
    setComplaint((prev) => ({ ...prev, ...updates }));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-slate-500 hover:text-slate-700 gap-1.5 -ml-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Şikayetlere Dön
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">#{complaint.id.slice(0, 8)}</span>
          <StatusBadge durum={complaint.durum as DurumValue} />
        </div>
      </div>

      {/* Main Layout: Sol + Sağ Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol Panel — Şikayet Bilgileri */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bilgi Kartı */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Şikayet Bilgileri</h2>
              {isOpen && (
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-md ${
                    daysOpen >= 7
                      ? 'bg-red-50 text-red-600 border border-red-200'
                      : daysOpen >= 3
                      ? 'bg-orange-50 text-orange-600 border border-orange-200'
                      : 'bg-slate-50 text-slate-500 border border-slate-200'
                  }`}
                >
                  {daysOpen} gündür açık
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <InfoItem label="Şube Kodu" value={complaint.sube_kodu} />
              <InfoItem
                label="Kanal"
                value={`${kanalIcons[complaint.sosyal_medya_kanali] || '💬'} ${complaint.sosyal_medya_kanali}`}
              />
              <InfoItem label="Kategori" value={complaint.kategori} />
              <InfoItem label="Şikayet Cinsi" value={complaint.sikayet_cinsi} />
              <InfoItem label="Müşteri Adı" value={complaint.musteri_adi || '—'} />
              <InfoItem label="Müşteri Hesabı" value={complaint.musteri_hesabi || '—'} />
            </div>

            <Separator />

            {/* Şikayet Notu */}
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Şikayet Notu</p>
              <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-700 leading-relaxed border border-slate-100">
                {complaint.sikayet_notu}
              </div>
            </div>

            <Separator />

            {/* Meta bilgiler */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-400">
              <span>
                📅 Kayıt: {formatDate(complaint.created_at)}
              </span>
              <span>
                🔄 Güncelleme: {formatDate(complaint.updated_at)}
              </span>
              <span>
                👤 Kaydeden: {complaint.created_by_profile?.full_name || complaint.created_by.slice(0, 8)}
              </span>
            </div>
          </div>

          {/* Aksiyon Notları */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <ComplaintNotes
              complaintId={complaint.id}
              initialNotes={initialNotes}
            />
          </div>
        </div>

        {/* Sağ Panel — Aksiyon Alanı */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sticky top-20">
            <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Aksiyonlar
            </h3>
            <ComplaintActions
              complaint={complaint}
              onComplaintUpdate={handleComplaintUpdate}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm font-medium text-slate-700">{value}</p>
    </div>
  );
}
