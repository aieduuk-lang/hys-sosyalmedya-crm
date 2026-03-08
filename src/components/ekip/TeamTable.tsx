'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface TeamMember {
  id: string;
  full_name: string | null;
  email?: string;
  created_at: string;
  open_count: number;
}

interface TeamTableProps {
  members: TeamMember[];
  loading: boolean;
  onRefresh: () => void;
}

const avatarColors = [
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-purple-500 to-violet-600',
  'from-orange-500 to-amber-600',
  'from-pink-500 to-rose-600',
  'from-cyan-500 to-sky-600',
];

function getInitials(name: string | null): string {
  if (!name) return '?';
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function SkeletonRow() {
  return (
    <TableRow>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableCell key={i}>
          <div className="h-4 bg-slate-200 rounded animate-pulse" style={{ width: `${40 + Math.random() * 40}%` }} />
        </TableCell>
      ))}
    </TableRow>
  );
}

export function TeamTable({ members, loading, onRefresh }: TeamTableProps) {
  const supabase = createClient();
  const [editMember, setEditMember] = useState<TeamMember | null>(null);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);

  const openEdit = (member: TeamMember) => {
    setEditMember(member);
    setEditName(member.full_name || '');
  };

  const handleSaveName = async () => {
    if (!editMember || !supabase) return;
    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: editName.trim() || null })
      .eq('id', editMember.id);

    setSaving(false);

    if (error) {
      toast.error('İsim güncellenemedi', { description: error.message, duration: 3000 });
      return;
    }

    toast.success('İsim güncellendi', { duration: 3000 });
    setEditMember(null);
    onRefresh();
  };

  if (!loading && members.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
        <span className="text-4xl">👥</span>
        <h3 className="mt-4 text-lg font-medium text-slate-700">Ekip üyesi bulunamadı</h3>
        <p className="text-sm text-slate-500 mt-2">İlk üyeyi davet ederek başlayın.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80">
              <TableHead className="text-xs">Üye</TableHead>
              <TableHead className="text-xs">E-posta</TableHead>
              <TableHead className="text-xs">Kayıt Tarihi</TableHead>
              <TableHead className="text-xs">Açık Şikayet</TableHead>
              <TableHead className="text-xs w-[80px]">İşlem</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
              : members.map((m, i) => (
                  <TableRow key={m.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-white text-[10px] font-semibold`}
                        >
                          {getInitials(m.full_name)}
                        </div>
                        <span className="text-sm font-medium text-slate-700">
                          {m.full_name || <span className="italic text-slate-400">İsimsiz</span>}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">{m.email || '—'}</TableCell>
                    <TableCell className="text-xs text-slate-500">{formatDate(m.created_at)}</TableCell>
                    <TableCell>
                      <Link href={`/sikayetler?atanan=${m.id}`}>
                        <Badge
                          variant="outline"
                          className={`cursor-pointer text-xs font-semibold ${
                            m.open_count >= 5
                              ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                              : m.open_count >= 3
                              ? 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {m.open_count}
                        </Badge>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(m)}
                        className="h-7 text-xs text-slate-500 hover:text-blue-600 gap-1"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Düzenle
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      {/* İsim Düzenleme Modalı */}
      <Dialog open={!!editMember} onOpenChange={(open) => !open && setEditMember(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>İsim Güncelle</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Ad Soyad"
              onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditMember(null)} className="text-sm">
              İptal
            </Button>
            <Button
              onClick={handleSaveName}
              disabled={saving}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-sm"
            >
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
