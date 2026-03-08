-- =============================================
-- HYS Sosyal Medya CRM — Tablo Oluşturma
-- =============================================

-- 1. profiles tablosu (auth.users ile bağlantılı)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. complaints tablosu (Ana şikayet tablosu)
CREATE TABLE IF NOT EXISTS complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  sube_kodu TEXT NOT NULL 
    CHECK (sube_kodu IN ('02','03','04','05','07','08','09','10','13','14','19','20','21','22','24','25','26','27')),
  
  sosyal_medya_kanali TEXT NOT NULL 
    CHECK (sosyal_medya_kanali IN ('Instagram','X (Twitter)','Facebook','TikTok','Google Reviews','Diğer')),
  
  kategori TEXT NOT NULL 
    CHECK (kategori IN ('Mobilya','Beyaz Eşya','Elektronik','TV','Züccaciye','Ev Tekstili','Halı','Küçük Ev Aletleri','Yatak-Baza-Başlık','Mobilya Aksesuar')),
  
  sikayet_cinsi TEXT NOT NULL 
    CHECK (sikayet_cinsi IN ('Sevkiyat','Personel','Ürün Kalitesi','Montaj','Teslimat Gecikmesi','İade/Değişim','Fiyat','İletişim','Diğer')),
  
  musteri_adi TEXT,
  musteri_hesabi TEXT,
  sikayet_notu TEXT NOT NULL,
  
  durum TEXT NOT NULL DEFAULT 'yeni' 
    CHECK (durum IN ('yeni','islemde','cozuldu','cozulemedi')),
  
  atanan_kisi UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE
);

-- 3. complaint_notes tablosu (Aksiyon geçmişi notları)
CREATE TABLE IF NOT EXISTS complaint_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- İndeksler
-- =============================================
CREATE INDEX IF NOT EXISTS idx_complaints_durum ON complaints(durum);
CREATE INDEX IF NOT EXISTS idx_complaints_sube ON complaints(sube_kodu);
CREATE INDEX IF NOT EXISTS idx_complaints_kategori ON complaints(kategori);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON complaints(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_complaints_atanan ON complaints(atanan_kisi);
CREATE INDEX IF NOT EXISTS idx_complaint_notes_complaint ON complaint_notes(complaint_id);

-- =============================================
-- Trigger: updated_at otomatik güncelleme
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER complaints_updated_at
  BEFORE UPDATE ON complaints
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =============================================
-- Trigger: Yeni kullanıcı → profiles'a otomatik kayıt
-- =============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
