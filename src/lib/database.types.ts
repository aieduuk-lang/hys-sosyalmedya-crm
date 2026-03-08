export interface Profile {
  id: string;
  full_name: string | null;
  created_at: string;
}

export interface Complaint {
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
  durum: 'yeni' | 'islemde' | 'cozuldu' | 'cozulemedi';
  atanan_kisi: string | null;
  created_by: string;
}

export interface ComplaintNote {
  id: string;
  complaint_id: string;
  note: string;
  created_by: string;
  created_at: string;
}

// Join types
export interface ComplaintWithRelations extends Complaint {
  atanan_kisi_profile?: Profile | null;
  created_by_profile?: Profile | null;
}

export interface ComplaintNoteWithProfile extends ComplaintNote {
  profiles?: Profile | null;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      complaints: {
        Row: Complaint;
        Insert: Omit<Complaint, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Complaint, 'id' | 'created_at'>>;
      };
      complaint_notes: {
        Row: ComplaintNote;
        Insert: Omit<ComplaintNote, 'id' | 'created_at'>;
        Update: Partial<Omit<ComplaintNote, 'id' | 'created_at'>>;
      };
    };
  };
}
