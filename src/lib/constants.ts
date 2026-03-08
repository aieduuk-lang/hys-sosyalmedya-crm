// Şube Kodları
export const SUBE_KODLARI = [
  '02', '03', '04', '05', '07', '08', '09', '10',
  '13', '14', '19', '20', '21', '22', '24', '25', '26', '27',
] as const;

// Sosyal Medya Kanalları
export const SOSYAL_MEDYA_KANALLARI = [
  'Instagram',
  'X (Twitter)',
  'Facebook',
  'TikTok',
  'Google Reviews',
  'Diğer',
] as const;

// Kategoriler
export const KATEGORILER = [
  'Mobilya',
  'Beyaz Eşya',
  'Elektronik',
  'TV',
  'Züccaciye',
  'Ev Tekstili',
  'Halı',
  'Küçük Ev Aletleri',
  'Yatak-Baza-Başlık',
  'Mobilya Aksesuar',
] as const;

// Şikayet Cinsi
export const SIKAYET_CINSLERI = [
  'Sevkiyat',
  'Personel',
  'Ürün Kalitesi',
  'Montaj',
  'Teslimat Gecikmesi',
  'İade/Değişim',
  'Fiyat',
  'İletişim',
  'Diğer',
] as const;

// Durum
export const DURUMLAR = [
  { value: 'yeni', label: 'Yeni', emoji: '🔴', color: 'bg-red-500' },
  { value: 'islemde', label: 'İşlemde', emoji: '🟡', color: 'bg-yellow-500' },
  { value: 'cozuldu', label: 'Çözüldü', emoji: '🟢', color: 'bg-green-500' },
  { value: 'cozulemedi', label: 'Çözülemedi', emoji: '⚫', color: 'bg-gray-800' },
] as const;

export type SubeKodu = (typeof SUBE_KODLARI)[number];
export type SosyalMedyaKanali = (typeof SOSYAL_MEDYA_KANALLARI)[number];
export type Kategori = (typeof KATEGORILER)[number];
export type SikayetCinsi = (typeof SIKAYET_CINSLERI)[number];
export type DurumValue = (typeof DURUMLAR)[number]['value'];
