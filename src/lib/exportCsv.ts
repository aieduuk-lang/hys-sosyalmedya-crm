import { format } from 'date-fns';

const DURUM_LABELS: Record<string, string> = {
  yeni: 'Yeni',
  islemde: 'İşlemde',
  cozuldu: 'Çözüldü',
  cozulemedi: 'Çözülemedi',
};

interface ExportRow {
  id: string;
  created_at: string;
  updated_at: string;
  sube_kodu: string;
  sosyal_medya_kanali: string;
  kategori: string;
  sikayet_cinsi: string;
  musteri_adi: string | null;
  musteri_hesabi: string | null;
  sikayet_notu: string;
  durum: string;
  atanan_kisi_profile?: { full_name: string | null } | null;
  created_by_profile?: { full_name: string | null } | null;
}

function escapeCSV(val: string): string {
  if (val.includes('"') || val.includes(',') || val.includes('\n') || val.includes('\r')) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

function formatDateCSV(dateStr: string): string {
  try {
    return format(new Date(dateStr), 'dd.MM.yyyy HH:mm');
  } catch {
    return dateStr;
  }
}

export function generateCSV(rows: ExportRow[]): string {
  const headers = [
    'ID',
    'Tarih',
    'Şube Kodu',
    'Sosyal Medya Kanalı',
    'Kategori',
    'Şikayet Cinsi',
    'Müşteri Adı',
    'Müşteri Hesabı',
    'Şikayet Notu',
    'Durum',
    'Atanan Kişi',
    'Kaydeden',
    'Kayıt Tarihi',
    'Güncelleme Tarihi',
  ];

  const csvRows = rows.map((r) =>
    [
      r.id.slice(0, 8),
      formatDateCSV(r.created_at),
      r.sube_kodu,
      r.sosyal_medya_kanali,
      r.kategori,
      r.sikayet_cinsi,
      r.musteri_adi || '',
      r.musteri_hesabi || '',
      r.sikayet_notu,
      DURUM_LABELS[r.durum] || r.durum,
      r.atanan_kisi_profile?.full_name || '',
      r.created_by_profile?.full_name || '',
      formatDateCSV(r.created_at),
      formatDateCSV(r.updated_at),
    ]
      .map(escapeCSV)
      .join(',')
  );

  return headers.map(escapeCSV).join(',') + '\n' + csvRows.join('\n');
}

export function downloadCSV(csvContent: string, filename?: string): void {
  // UTF-8 BOM — Excel'de Türkçe karakter sorunu olmasın
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const dateStr = format(new Date(), 'yyyy-MM-dd');
  const fname = filename || `hys-sikayetler-${dateStr}.csv`;

  const a = document.createElement('a');
  a.href = url;
  a.download = fname;
  a.click();
  URL.revokeObjectURL(url);
}
