import { createServerSupabaseClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import { ComplaintDetail } from './components/ComplaintDetail';
import { Complaint, ComplaintNoteWithProfile, Profile } from '@/lib/database.types';

type ComplaintWithProfiles = Complaint & {
  atanan_kisi_profile: Profile | null;
  created_by_profile: Profile | null;
};

export default async function SikayetDetayPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createServerSupabaseClient();

  // Şikayet bilgilerini çek (profiller ile JOIN)
  const { data: complaint, error } = await supabase
    .from('complaints')
    .select(
      `
      *,
      atanan_kisi_profile:profiles!complaints_atanan_kisi_fkey(id, full_name),
      created_by_profile:profiles!complaints_created_by_fkey(id, full_name)
    `
    )
    .eq('id', params.id)
    .single();

  if (error || !complaint) {
    notFound();
  }

  // Aksiyon notlarını çek (profiller ile JOIN)
  const { data: notes } = await supabase
    .from('complaint_notes')
    .select('*, profiles:profiles!complaint_notes_created_by_fkey(id, full_name)')
    .eq('complaint_id', params.id)
    .order('created_at', { ascending: true });

  return (
    <ComplaintDetail
      initialComplaint={complaint as unknown as ComplaintWithProfiles}
      initialNotes={(notes as unknown as ComplaintNoteWithProfile[]) || []}
    />
  );
}

