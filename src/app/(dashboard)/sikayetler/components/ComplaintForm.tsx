'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  SUBE_KODLARI,
  SOSYAL_MEDYA_KANALLARI,
  KATEGORILER,
  SIKAYET_CINSLERI,
  DURUMLAR,
} from '@/lib/constants';
import { Profile } from '@/lib/database.types';

export function ComplaintForm() {
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);

  // Form state
  const [subeKodu, setSubeKodu] = useState('');
  const [sosyalMedyaKanali, setSosyalMedyaKanali] = useState('');
  const [kategori, setKategori] = useState('');
  const [sikayetCinsi, setSikayetCinsi] = useState('');
  const [musteriAdi, setMusteriAdi] = useState('');
  const [musteriHesabi, setMusteriHesabi] = useState('');
  const [sikayetNotu, setSikayetNotu] = useState('');
  const [atananKisi, setAtananKisi] = useState('');
  const [durum, setDurum] = useState('yeni');

  // Validasyon hataları
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!subeKodu) newErrors.subeKodu = 'Şube kodu seçiniz';
    if (!sosyalMedyaKanali) newErrors.sosyalMedyaKanali = 'Kanal seçiniz';
    if (!kategori) newErrors.kategori = 'Kategori seçiniz';
    if (!sikayetCinsi) newErrors.sikayetCinsi = 'Şikayet cinsi seçiniz';
    if (!sikayetNotu.trim()) newErrors.sikayetNotu = 'Şikayet notu giriniz';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!user || !supabase) return;

    setLoading(true);

    const { error } = await supabase.from('complaints').insert({
      sube_kodu: subeKodu,
      sosyal_medya_kanali: sosyalMedyaKanali,
      kategori,
      sikayet_cinsi: sikayetCinsi,
      musteri_adi: musteriAdi || null,
      musteri_hesabi: musteriHesabi || null,
      sikayet_notu: sikayetNotu,
      atanan_kisi: atananKisi || null,
      durum,
      created_by: user.id,
    });

    setLoading(false);

    if (error) {
      toast.error('Şikayet kaydedilemedi', {
        description: error.message,
      });
      return;
    }

    toast.success('Şikayet başarıyla kaydedildi');
    router.push('/sikayetler');
  };

  const fieldClass = (name: string) =>
    errors[name] ? 'border-red-400 focus:ring-red-400' : '';

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Row 1: Şube + Kanal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="subeKodu">
            Şube Kodu <span className="text-red-500">*</span>
          </Label>
          <Select value={subeKodu} onValueChange={setSubeKodu}>
            <SelectTrigger id="subeKodu" className={fieldClass('subeKodu')}>
              <SelectValue placeholder="Şube seçin" />
            </SelectTrigger>
            <SelectContent>
              {SUBE_KODLARI.map((kod) => (
                <SelectItem key={kod} value={kod}>
                  {kod}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.subeKodu && (
            <p className="text-xs text-red-500">{errors.subeKodu}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="sosyalMedyaKanali">
            Sosyal Medya Kanalı <span className="text-red-500">*</span>
          </Label>
          <Select value={sosyalMedyaKanali} onValueChange={setSosyalMedyaKanali}>
            <SelectTrigger id="sosyalMedyaKanali" className={fieldClass('sosyalMedyaKanali')}>
              <SelectValue placeholder="Kanal seçin" />
            </SelectTrigger>
            <SelectContent>
              {SOSYAL_MEDYA_KANALLARI.map((kanal) => (
                <SelectItem key={kanal} value={kanal}>
                  {kanal}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.sosyalMedyaKanali && (
            <p className="text-xs text-red-500">{errors.sosyalMedyaKanali}</p>
          )}
        </div>
      </div>

      {/* Row 2: Kategori + Şikayet Cinsi */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="kategori">
            Kategori <span className="text-red-500">*</span>
          </Label>
          <Select value={kategori} onValueChange={setKategori}>
            <SelectTrigger id="kategori" className={fieldClass('kategori')}>
              <SelectValue placeholder="Kategori seçin" />
            </SelectTrigger>
            <SelectContent>
              {KATEGORILER.map((kat) => (
                <SelectItem key={kat} value={kat}>
                  {kat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.kategori && (
            <p className="text-xs text-red-500">{errors.kategori}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="sikayetCinsi">
            Şikayet Cinsi <span className="text-red-500">*</span>
          </Label>
          <Select value={sikayetCinsi} onValueChange={setSikayetCinsi}>
            <SelectTrigger id="sikayetCinsi" className={fieldClass('sikayetCinsi')}>
              <SelectValue placeholder="Şikayet cinsi seçin" />
            </SelectTrigger>
            <SelectContent>
              {SIKAYET_CINSLERI.map((cins) => (
                <SelectItem key={cins} value={cins}>
                  {cins}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.sikayetCinsi && (
            <p className="text-xs text-red-500">{errors.sikayetCinsi}</p>
          )}
        </div>
      </div>

      {/* Row 3: Müşteri bilgileri */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="musteriAdi">Müşteri Adı</Label>
          <Input
            id="musteriAdi"
            placeholder="Müşteri adı (opsiyonel)"
            value={musteriAdi}
            onChange={(e) => setMusteriAdi(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="musteriHesabi">Müşteri Hesabı</Label>
          <Input
            id="musteriHesabi"
            placeholder="@kullaniciadi"
            value={musteriHesabi}
            onChange={(e) => setMusteriHesabi(e.target.value)}
          />
        </div>
      </div>

      {/* Şikayet Notu */}
      <div className="space-y-2">
        <Label htmlFor="sikayetNotu">
          Şikayet Notu <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="sikayetNotu"
          placeholder="Şikayet detayını yazınız..."
          rows={4}
          value={sikayetNotu}
          onChange={(e) => setSikayetNotu(e.target.value)}
          className={fieldClass('sikayetNotu')}
        />
        {errors.sikayetNotu && (
          <p className="text-xs text-red-500">{errors.sikayetNotu}</p>
        )}
      </div>

      {/* Row 4: Atanan + Durum */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="atananKisi">Atanan Kişi</Label>
          <Select value={atananKisi} onValueChange={setAtananKisi}>
            <SelectTrigger id="atananKisi">
              <SelectValue placeholder="Kişi seçin (opsiyonel)" />
            </SelectTrigger>
            <SelectContent>
              {profiles.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.full_name || p.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="durum">Durum</Label>
          <Select value={durum} onValueChange={setDurum}>
            <SelectTrigger id="durum">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DURUMLAR.map((d) => (
                <SelectItem key={d.value} value={d.value}>
                  {d.emoji} {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3 pt-2">
        <Button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Kaydediliyor...
            </span>
          ) : (
            'Şikayeti Kaydet'
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/sikayetler')}
        >
          İptal
        </Button>
      </div>
    </form>
  );
}
