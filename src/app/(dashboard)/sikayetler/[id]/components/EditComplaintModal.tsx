'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  SUBE_KODLARI,
  SOSYAL_MEDYA_KANALLARI,
  KATEGORILER,
  SIKAYET_CINSLERI,
} from '@/lib/constants';
import { Complaint } from '@/lib/database.types';

interface EditComplaintModalProps {
  complaint: Complaint;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (updated: Partial<Complaint>) => void;
}

export function EditComplaintModal({
  complaint,
  open,
  onOpenChange,
  onUpdated,
}: EditComplaintModalProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const [subeKodu, setSubeKodu] = useState(complaint.sube_kodu);
  const [sosyalMedyaKanali, setSosyalMedyaKanali] = useState(complaint.sosyal_medya_kanali);
  const [kategori, setKategori] = useState(complaint.kategori);
  const [sikayetCinsi, setSikayetCinsi] = useState(complaint.sikayet_cinsi);
  const [musteriAdi, setMusteriAdi] = useState(complaint.musteri_adi || '');
  const [musteriHesabi, setMusteriHesabi] = useState(complaint.musteri_hesabi || '');
  const [sikayetNotu, setSikayetNotu] = useState(complaint.sikayet_notu);

  const handleSave = async () => {
    if (!supabase) return;
    setLoading(true);

    const updates = {
      sube_kodu: subeKodu,
      sosyal_medya_kanali: sosyalMedyaKanali,
      kategori,
      sikayet_cinsi: sikayetCinsi,
      musteri_adi: musteriAdi || null,
      musteri_hesabi: musteriHesabi || null,
      sikayet_notu: sikayetNotu,
    };

    const { error } = await supabase
      .from('complaints')
      .update(updates)
      .eq('id', complaint.id);

    setLoading(false);

    if (error) {
      toast.error('Şikayet güncellenemedi', { description: error.message });
      return;
    }

    toast.success('Şikayet güncellendi');
    onUpdated(updates);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Şikayeti Düzenle</DialogTitle>
          <DialogDescription>
            Şikayet bilgilerini güncelleyin. Durum ve atanan kişi detay
            sayfasından değiştirilebilir.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Şube Kodu</Label>
              <Select value={subeKodu} onValueChange={setSubeKodu}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUBE_KODLARI.map((kod) => (
                    <SelectItem key={kod} value={kod}>{kod}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Sosyal Medya Kanalı</Label>
              <Select value={sosyalMedyaKanali} onValueChange={setSosyalMedyaKanali}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SOSYAL_MEDYA_KANALLARI.map((k) => (
                    <SelectItem key={k} value={k}>{k}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Kategori</Label>
              <Select value={kategori} onValueChange={setKategori}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {KATEGORILER.map((k) => (
                    <SelectItem key={k} value={k}>{k}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Şikayet Cinsi</Label>
              <Select value={sikayetCinsi} onValueChange={setSikayetCinsi}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SIKAYET_CINSLERI.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Müşteri Adı</Label>
              <Input
                value={musteriAdi}
                onChange={(e) => setMusteriAdi(e.target.value)}
                placeholder="Opsiyonel"
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Müşteri Hesabı</Label>
              <Input
                value={musteriHesabi}
                onChange={(e) => setMusteriHesabi(e.target.value)}
                placeholder="@kullaniciadi"
                className="h-9 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Şikayet Notu</Label>
            <Textarea
              value={sikayetNotu}
              onChange={(e) => setSikayetNotu(e.target.value)}
              rows={4}
              className="text-sm resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="text-sm">
            İptal
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-sm"
          >
            {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
