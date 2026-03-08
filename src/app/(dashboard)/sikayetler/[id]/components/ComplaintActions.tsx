'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DURUMLAR, type DurumValue } from '@/lib/constants';
import { Complaint, Profile } from '@/lib/database.types';
import { StatusBadge } from '../../components/StatusBadge';
import { EditComplaintModal } from './EditComplaintModal';

interface ComplaintActionsProps {
  complaint: Complaint;
  onComplaintUpdate: (updates: Partial<Complaint>) => void;
}

export function ComplaintActions({ complaint, onComplaintUpdate }: ComplaintActionsProps) {
  const supabase = createClient();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [editOpen, setEditOpen] = useState(false);

  // Profilleri çek
  useEffect(() => {
    const fetchProfiles = async () => {
      if (!supabase) return;
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name');
      if (data) setProfiles(data as Profile[]);
    };
    fetchProfiles();
  }, [supabase]);

  // Durum değiştirme — optimistic UI
  const handleDurumChange = async (newDurum: string) => {
    if (!supabase) return;
    const oldDurum = complaint.durum;

    // Optimistic: önce local güncelle
    onComplaintUpdate({ durum: newDurum as DurumValue });

    const { error } = await supabase
      .from('complaints')
      .update({ durum: newDurum })
      .eq('id', complaint.id);

    if (error) {
      // Rollback
      onComplaintUpdate({ durum: oldDurum });
      toast.error('Durum güncellenemedi', { description: error.message });
      return;
    }

    const durumLabel = DURUMLAR.find((d) => d.value === newDurum)?.label || newDurum;
    toast.success(`Durum "${durumLabel}" olarak güncellendi`);
  };

  // Atanan kişi değiştirme — optimistic UI
  const handleAtananChange = async (newAtanan: string) => {
    if (!supabase) return;
    const oldAtanan = complaint.atanan_kisi;
    const atananValue = newAtanan === 'none' ? null : newAtanan;

    onComplaintUpdate({ atanan_kisi: atananValue });

    const { error } = await supabase
      .from('complaints')
      .update({ atanan_kisi: atananValue })
      .eq('id', complaint.id);

    if (error) {
      onComplaintUpdate({ atanan_kisi: oldAtanan });
      toast.error('Atanan kişi güncellenemedi', { description: error.message });
      return;
    }

    const name = profiles.find((p) => p.id === atananValue)?.full_name || 'Atanmadı';
    toast.success(`Atanan kişi: ${name}`);
  };

  return (
    <div className="space-y-5">
      {/* Durum */}
      <div className="space-y-2">
        <Label className="text-xs text-slate-500 uppercase tracking-wider">Durum</Label>
        <Select value={complaint.durum} onValueChange={handleDurumChange}>
          <SelectTrigger className="h-10">
            <SelectValue>
              <StatusBadge durum={complaint.durum as DurumValue} />
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {DURUMLAR.map((d) => (
              <SelectItem key={d.value} value={d.value}>
                <span className="flex items-center gap-2">
                  <span>{d.emoji}</span>
                  {d.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Atanan Kişi */}
      <div className="space-y-2">
        <Label className="text-xs text-slate-500 uppercase tracking-wider">Atanan Kişi</Label>
        <Select
          value={complaint.atanan_kisi || 'none'}
          onValueChange={handleAtananChange}
        >
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Atanmamış" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Atanmamış</SelectItem>
            {profiles.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.full_name || p.id.slice(0, 8)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Düzenle Butonu */}
      <Button
        variant="outline"
        onClick={() => setEditOpen(true)}
        className="w-full gap-2 text-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Şikayeti Düzenle
      </Button>

      {/* Edit Modal */}
      <EditComplaintModal
        complaint={complaint}
        open={editOpen}
        onOpenChange={setEditOpen}
        onUpdated={onComplaintUpdate}
      />
    </div>
  );
}
