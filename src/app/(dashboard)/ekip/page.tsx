'use client';

import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { TeamTable } from '@/components/ekip/TeamTable';
import { InviteModal } from '@/components/ekip/InviteModal';

interface TeamMember {
  id: string;
  full_name: string | null;
  email?: string;
  created_at: string;
  open_count: number;
}

export default function EkipPage() {
  const supabase = createClient();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);

  const fetchMembers = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);

    // Profilleri çek
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, created_at')
      .order('full_name');

    if (!profiles) {
      setLoading(false);
      return;
    }

    // Her üye için açık şikayet sayısını çek
    const openCounts = await Promise.all(
      profiles.map(async (p: { id: string; full_name: string | null; created_at: string }) => {
        const { count } = await supabase
          .from('complaints')
          .select('id', { count: 'exact', head: true })
          .eq('atanan_kisi', p.id)
          .in('durum', ['yeni', 'islemde']);
        return { ...p, open_count: count || 0 };
      })
    );

    setMembers(openCounts);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ekip Üyeleri</h1>
          <p className="text-slate-500 mt-1">
            Ekip üyelerini yönetin ve yeni üye davet edin.
          </p>
        </div>
        <Button
          onClick={() => setInviteOpen(true)}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Üye Davet Et
        </Button>
      </div>

      {/* Tablo */}
      <TeamTable members={members} loading={loading} onRefresh={fetchMembers} />

      {/* Davet Modalı */}
      <InviteModal
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onInvited={fetchMembers}
      />
    </div>
  );
}
