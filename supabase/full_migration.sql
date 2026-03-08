-- =============================================
-- HYS Sosyal Medya CRM — Tüm Migrasyon (Tek Script)
-- Bu scripti Supabase Dashboard > SQL Editor'da çalıştırın.
-- =============================================

-- =============================================
-- 1. TABLOLAR
-- =============================================

-- profiles tablosu (auth.users ile bağlantılı)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- complaints tablosu (Ana şikayet tablosu)
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

-- complaint_notes tablosu (Aksiyon geçmişi notları)
CREATE TABLE IF NOT EXISTS complaint_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 2. İNDEKSLER
-- =============================================
CREATE INDEX IF NOT EXISTS idx_complaints_durum ON complaints(durum);
CREATE INDEX IF NOT EXISTS idx_complaints_sube ON complaints(sube_kodu);
CREATE INDEX IF NOT EXISTS idx_complaints_kategori ON complaints(kategori);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON complaints(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_complaints_atanan ON complaints(atanan_kisi);
CREATE INDEX IF NOT EXISTS idx_complaint_notes_complaint ON complaint_notes(complaint_id);

-- =============================================
-- 3. TRİGGER: updated_at otomatik güncelleme
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
-- 4. TRİGGER: Yeni kullanıcı → profiles'a otomatik kayıt
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

-- =============================================
-- 5. ROW LEVEL SECURITY
-- =============================================

-- RLS'i aktif et
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_notes ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "Giriş yapmış kullanıcılar profilleri görebilir"
  ON profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Kullanıcılar kendi profilini güncelleyebilir"
  ON profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- complaints
CREATE POLICY "Giriş yapmış kullanıcılar şikayetleri görebilir"
  ON complaints FOR SELECT TO authenticated USING (true);

CREATE POLICY "Giriş yapmış kullanıcılar şikayet ekleyebilir"
  ON complaints FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Giriş yapmış kullanıcılar şikayetleri güncelleyebilir"
  ON complaints FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

-- complaint_notes
CREATE POLICY "Giriş yapmış kullanıcılar notları görebilir"
  ON complaint_notes FOR SELECT TO authenticated USING (true);

CREATE POLICY "Kullanıcılar kendi notlarını ekleyebilir"
  ON complaint_notes FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Kullanıcılar kendi notlarını güncelleyebilir"
  ON complaint_notes FOR UPDATE TO authenticated
  USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());

-- =============================================
-- 6. REALTIME — complaints ve complaint_notes tablolarını aktif et
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE complaints;
ALTER PUBLICATION supabase_realtime ADD TABLE complaint_notes;
