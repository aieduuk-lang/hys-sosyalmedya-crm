'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  SUBE_KODLARI,
  KATEGORILER,
  SIKAYET_CINSLERI,
  DURUMLAR,
} from '@/lib/constants';
import { Profile } from '@/lib/database.types';
import { createClient } from '@/lib/supabase';

interface ComplaintFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
}

export interface FilterState {
  sube: string;
  kategori: string;
  sikayet_cinsi: string;
  durum: string;
  atanan: string;
  baslangic: string;
  bitis: string;
}

const EMPTY_FILTERS: FilterState = {
  sube: '',
  kategori: '',
  sikayet_cinsi: '',
  durum: '',
  atanan: '',
  baslangic: '',
  bitis: '',
};

export function ComplaintFilters({ onFiltersChange }: ComplaintFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [profiles, setProfiles] = useState<Profile[]>([]);

  // URL params'dan filtre state'i oku
  const [filters, setFilters] = useState<FilterState>(() => ({
    sube: searchParams.get('sube') || '',
    kategori: searchParams.get('kategori') || '',
    sikayet_cinsi: searchParams.get('sikayet_cinsi') || '',
    durum: searchParams.get('durum') || '',
    atanan: searchParams.get('atanan') || '',
    baslangic: searchParams.get('baslangic') || '',
    bitis: searchParams.get('bitis') || '',
  }));

  // Profilleri çek
  useEffect(() => {
    const fetchProfiles = async () => {
      if (!supabase) return;
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name');
      if (data) setProfiles(data);
    };
    fetchProfiles();
  }, [supabase]);

  // Filtre değiştiğinde URL'i güncelle ve parent'a bildir
  const applyFilters = useCallback(
    (newFilters: FilterState) => {
      setFilters(newFilters);

      // URL query params'a yaz
      const params = new URLSearchParams();
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
      const qs = params.toString();
      router.push(qs ? `/sikayetler?${qs}` : '/sikayetler', { scroll: false });

      onFiltersChange(newFilters);
    },
    [onFiltersChange, router]
  );

  // İlk yüklemede URL filtrelerini parent'a bildir
  useEffect(() => {
    onFiltersChange(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateFilter = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    applyFilters(newFilters);
  };

  const clearFilters = () => {
    applyFilters(EMPTY_FILTERS);
  };

  const hasActiveFilters = Object.values(filters).some(Boolean);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filtreler
        </h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-xs text-slate-500 hover:text-red-500 h-7"
          >
            Filtreleri Temizle
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {/* Şube */}
        <div className="space-y-1">
          <Label className="text-xs text-slate-500">Şube</Label>
          <Select
            value={filters.sube || 'all'}
            onValueChange={(v) => updateFilter('sube', v === 'all' ? '' : v)}
          >
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Tümü" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              {SUBE_KODLARI.map((kod) => (
                <SelectItem key={kod} value={kod}>{kod}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Kategori */}
        <div className="space-y-1">
          <Label className="text-xs text-slate-500">Kategori</Label>
          <Select
            value={filters.kategori || 'all'}
            onValueChange={(v) => updateFilter('kategori', v === 'all' ? '' : v)}
          >
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Tümü" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              {KATEGORILER.map((kat) => (
                <SelectItem key={kat} value={kat}>{kat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Şikayet Cinsi */}
        <div className="space-y-1">
          <Label className="text-xs text-slate-500">Şikayet Cinsi</Label>
          <Select
            value={filters.sikayet_cinsi || 'all'}
            onValueChange={(v) => updateFilter('sikayet_cinsi', v === 'all' ? '' : v)}
          >
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Tümü" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              {SIKAYET_CINSLERI.map((cins) => (
                <SelectItem key={cins} value={cins}>{cins}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Durum */}
        <div className="space-y-1">
          <Label className="text-xs text-slate-500">Durum</Label>
          <Select
            value={filters.durum || 'all'}
            onValueChange={(v) => updateFilter('durum', v === 'all' ? '' : v)}
          >
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Tümü" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              {DURUMLAR.map((d) => (
                <SelectItem key={d.value} value={d.value}>
                  {d.emoji} {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Atanan Kişi */}
        <div className="space-y-1">
          <Label className="text-xs text-slate-500">Atanan Kişi</Label>
          <Select
            value={filters.atanan || 'all'}
            onValueChange={(v) => updateFilter('atanan', v === 'all' ? '' : v)}
          >
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Tümü" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              {profiles.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.full_name || p.id.slice(0, 8)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tarih Başlangıç */}
        <div className="space-y-1">
          <Label className="text-xs text-slate-500">Başlangıç</Label>
          <Input
            type="date"
            value={filters.baslangic}
            onChange={(e) => updateFilter('baslangic', e.target.value)}
            className="h-9 text-xs"
          />
        </div>

        {/* Tarih Bitiş */}
        <div className="space-y-1">
          <Label className="text-xs text-slate-500">Bitiş</Label>
          <Input
            type="date"
            value={filters.bitis}
            onChange={(e) => updateFilter('bitis', e.target.value)}
            className="h-9 text-xs"
          />
        </div>
      </div>
    </div>
  );
}
