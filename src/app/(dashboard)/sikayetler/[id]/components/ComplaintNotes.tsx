'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ComplaintNoteWithProfile } from '@/lib/database.types';

interface ComplaintNotesProps {
  complaintId: string;
  initialNotes: ComplaintNoteWithProfile[];
}

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getInitials(name: string | null | undefined): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const avatarColors = [
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-purple-500 to-violet-600',
  'from-orange-500 to-amber-600',
  'from-pink-500 to-rose-600',
  'from-cyan-500 to-sky-600',
];

function getAvatarColor(id: string): string {
  const hash = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return avatarColors[hash % avatarColors.length];
}

export function ComplaintNotes({ complaintId, initialNotes }: ComplaintNotesProps) {
  const { user } = useAuth();
  const supabase = createClient();
  const [notes, setNotes] = useState<ComplaintNoteWithProfile[]>(initialNotes);
  const [newNote, setNewNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Not listesini yeniden çek
  const fetchNotes = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase
      .from('complaint_notes')
      .select('*, profiles:profiles!complaint_notes_created_by_fkey(id, full_name)')
      .eq('complaint_id', complaintId)
      .order('created_at', { ascending: true });
    if (data) setNotes(data as unknown as ComplaintNoteWithProfile[]);
  }, [supabase, complaintId]);

  // Realtime subscription — complaint_notes
  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel(`notes-${complaintId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'complaint_notes',
          filter: `complaint_id=eq.${complaintId}`,
        },
        () => {
          // Sessiz güncelleme — toast yok
          fetchNotes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, complaintId, fetchNotes]);

  const handleAddNote = async () => {
    if (!newNote.trim() || !user || !supabase) return;

    setSubmitting(true);

    const { error } = await supabase.from('complaint_notes').insert({
      complaint_id: complaintId,
      note: newNote.trim(),
      created_by: user.id,
    });

    setSubmitting(false);

    if (error) {
      toast.error('Not eklenemedi', { description: error.message });
      return;
    }

    setNewNote('');
    await fetchNotes();
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        Aksiyon Notları
        <span className="text-xs font-normal text-slate-400">({notes.length})</span>
      </h3>

      {/* Notlar Zaman Çizelgesi */}
      {notes.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-sm">
          Henüz aksiyon notu eklenmemiş.
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {notes.map((note) => {
            const profileName = note.profiles?.full_name || 'Bilinmeyen';
            const color = getAvatarColor(note.created_by);

            return (
              <div key={note.id} className="flex gap-3 group">
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-white text-[10px] font-semibold shrink-0 mt-0.5`}
                >
                  {getInitials(profileName)}
                </div>

                {/* Not İçeriği */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-slate-700">
                      {profileName}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {formatDateTime(note.created_at)}
                    </span>
                  </div>
                  <div className="text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                    {note.note}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Not Ekleme */}
      <div className="border-t border-slate-100 pt-4 space-y-2">
        <Textarea
          placeholder="Aksiyon notu yazın..."
          rows={3}
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          className="resize-none text-sm"
        />
        <div className="flex justify-end">
          <Button
            onClick={handleAddNote}
            disabled={submitting || !newNote.trim()}
            size="sm"
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white gap-1.5"
          >
            {submitting ? (
              <span className="flex items-center gap-1.5">
                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Ekleniyor...
              </span>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Not Ekle
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
