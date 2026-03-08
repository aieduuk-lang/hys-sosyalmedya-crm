-- =============================================
-- HYS Sosyal Medya CRM — Row Level Security
-- =============================================

-- RLS'i aktif et
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_notes ENABLE ROW LEVEL SECURITY;

-- =============================================
-- profiles tablosu RLS
-- =============================================
CREATE POLICY "Giriş yapmış kullanıcılar profilleri görebilir"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Kullanıcılar kendi profilini güncelleyebilir"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- =============================================
-- complaints tablosu RLS
-- =============================================
CREATE POLICY "Giriş yapmış kullanıcılar şikayetleri görebilir"
  ON complaints FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Giriş yapmış kullanıcılar şikayet ekleyebilir"
  ON complaints FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Giriş yapmış kullanıcılar şikayetleri güncelleyebilir"
  ON complaints FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =============================================
-- complaint_notes tablosu RLS
-- =============================================
CREATE POLICY "Giriş yapmış kullanıcılar notları görebilir"
  ON complaint_notes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Kullanıcılar kendi notlarını ekleyebilir"
  ON complaint_notes FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Kullanıcılar kendi notlarını güncelleyebilir"
  ON complaint_notes FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());
