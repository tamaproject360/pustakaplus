/*
  # PustakaPlus - Complete Database Schema

  ## Overview
  Full schema for PustakaPlus library and knowledge management system.

  ## Tables Created
  1. `profiles` - User profiles extending Supabase auth
  2. `categories` - Hierarchical categories for library and knowledge
  3. `collections` - Library collection items (books, journals, ebooks, multimedia)
  4. `collection_tags` - Tags for collections
  5. `borrowings` - Borrowing records
  6. `reservations` - Book reservation queue
  7. `knowledges` - Knowledge base articles/documents
  8. `knowledge_tags` - Tags for knowledge items
  9. `ratings` - Ratings and reviews for knowledge items
  10. `guest_book` - Visitor check-in records
  11. `notifications` - In-app notifications
  12. `audit_logs` - System activity audit trail
  13. `system_config` - Configurable system settings

  ## Security
  - RLS enabled on all tables
  - Role-based policies for each table
*/

-- ==========================================
-- ENUMS
-- ==========================================

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('super_admin', 'pustakawan', 'kontributor', 'pembaca');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE category_type AS ENUM ('perpustakaan', 'knowledge');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE collection_format AS ENUM ('buku', 'jurnal', 'ebook', 'multimedia');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE borrow_status AS ENUM ('dipinjam', 'dikembalikan', 'terlambat');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE reservation_status AS ENUM ('menunggu', 'tersedia', 'dibatalkan', 'selesai');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE knowledge_type AS ENUM ('artikel', 'sop', 'panduan', 'lesson_learned', 'best_practice');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE knowledge_status AS ENUM ('draft', 'submitted', 'approved', 'rejected', 'published');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE visit_purpose AS ENUM ('pinjam_buku', 'baca_di_tempat', 'riset', 'meeting', 'lainnya');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE notif_type AS ENUM ('info', 'warning', 'success', 'error');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE notif_channel AS ENUM ('in_app', 'email', 'both');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ==========================================
-- PROFILES
-- ==========================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL DEFAULT '',
  email VARCHAR(255) UNIQUE NOT NULL DEFAULT '',
  role user_role NOT NULL DEFAULT 'pembaca',
  unit_kerja VARCHAR(255),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Super admin can update any profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "Super admin can insert profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "Allow insert on registration"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ==========================================
-- CATEGORIES
-- ==========================================

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  parent_id UUID REFERENCES categories(id),
  type category_type NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "Pustakawan can manage categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('pustakawan', 'super_admin'))
  );

CREATE POLICY "Pustakawan can update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('pustakawan', 'super_admin'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('pustakawan', 'super_admin'))
  );

CREATE POLICY "Pustakawan can delete categories"
  ON categories FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('pustakawan', 'super_admin'))
  );

-- ==========================================
-- COLLECTIONS
-- ==========================================

CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  author VARCHAR(500),
  publisher VARCHAR(255),
  publish_year INTEGER,
  isbn VARCHAR(20),
  issn VARCHAR(20),
  format collection_format NOT NULL DEFAULT 'buku',
  language VARCHAR(50) DEFAULT 'id',
  subject TEXT,
  description TEXT,
  cover_url TEXT,
  file_url TEXT,
  barcode VARCHAR(100) UNIQUE,
  qr_code TEXT,
  shelf_location VARCHAR(100),
  total_copies INTEGER DEFAULT 1,
  available_copies INTEGER DEFAULT 1,
  marc21_data JSONB,
  dublin_core_metadata JSONB,
  category_id UUID REFERENCES categories(id),
  created_by UUID REFERENCES profiles(id),
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view collections"
  ON collections FOR SELECT
  USING (true);

CREATE POLICY "Pustakawan can insert collections"
  ON collections FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('pustakawan', 'super_admin'))
  );

CREATE POLICY "Pustakawan can update collections"
  ON collections FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('pustakawan', 'super_admin'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('pustakawan', 'super_admin'))
  );

CREATE POLICY "Pustakawan can delete collections"
  ON collections FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('pustakawan', 'super_admin'))
  );

-- ==========================================
-- COLLECTION TAGS
-- ==========================================

CREATE TABLE IF NOT EXISTS collection_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE NOT NULL,
  tag VARCHAR(100) NOT NULL
);

ALTER TABLE collection_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view collection tags"
  ON collection_tags FOR SELECT
  USING (true);

CREATE POLICY "Pustakawan can manage collection tags"
  ON collection_tags FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('pustakawan', 'super_admin'))
  );

CREATE POLICY "Pustakawan can delete collection tags"
  ON collection_tags FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('pustakawan', 'super_admin'))
  );

-- ==========================================
-- BORROWINGS
-- ==========================================

CREATE TABLE IF NOT EXISTS borrowings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  collection_id UUID REFERENCES collections(id) NOT NULL,
  borrow_date TIMESTAMPTZ DEFAULT now(),
  due_date TIMESTAMPTZ NOT NULL,
  return_date TIMESTAMPTZ,
  status borrow_status DEFAULT 'dipinjam',
  fine_amount DECIMAL(10,2) DEFAULT 0,
  fine_paid BOOLEAN DEFAULT false,
  notes TEXT,
  processed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE borrowings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own borrowings"
  ON borrowings FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('pustakawan', 'super_admin'))
  );

CREATE POLICY "Authenticated users can create borrowings"
  ON borrowings FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('pustakawan', 'super_admin'))
  );

CREATE POLICY "Pustakawan can update borrowings"
  ON borrowings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('pustakawan', 'super_admin'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('pustakawan', 'super_admin'))
  );

-- ==========================================
-- RESERVATIONS
-- ==========================================

CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  collection_id UUID REFERENCES collections(id) NOT NULL,
  reservation_date TIMESTAMPTZ DEFAULT now(),
  status reservation_status DEFAULT 'menunggu',
  queue_position INTEGER,
  notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reservations"
  ON reservations FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('pustakawan', 'super_admin'))
  );

CREATE POLICY "Authenticated users can create reservations"
  ON reservations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reservations"
  ON reservations FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('pustakawan', 'super_admin'))
  )
  WITH CHECK (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('pustakawan', 'super_admin'))
  );

CREATE POLICY "Users can delete own reservations"
  ON reservations FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('pustakawan', 'super_admin'))
  );

-- ==========================================
-- KNOWLEDGES
-- ==========================================

CREATE TABLE IF NOT EXISTS knowledges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  content TEXT,
  summary TEXT,
  type knowledge_type NOT NULL DEFAULT 'artikel',
  file_url TEXT,
  file_type VARCHAR(50),
  thumbnail_url TEXT,
  dublin_core_metadata JSONB,
  status knowledge_status DEFAULT 'draft',
  rejection_feedback TEXT,
  views_count INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  category_id UUID REFERENCES categories(id),
  submitted_by UUID REFERENCES profiles(id),
  reviewed_by UUID REFERENCES profiles(id),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE knowledges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published knowledges"
  ON knowledges FOR SELECT
  USING (
    status = 'published' OR
    auth.uid() = submitted_by OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('pustakawan', 'super_admin'))
  );

CREATE POLICY "Kontributor can insert knowledges"
  ON knowledges FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = submitted_by AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('kontributor', 'pustakawan', 'super_admin'))
  );

CREATE POLICY "Kontributor can update own draft knowledges"
  ON knowledges FOR UPDATE
  TO authenticated
  USING (
    (auth.uid() = submitted_by AND status IN ('draft', 'rejected')) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('pustakawan', 'super_admin'))
  )
  WITH CHECK (
    (auth.uid() = submitted_by AND status IN ('draft', 'rejected', 'submitted')) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('pustakawan', 'super_admin'))
  );

CREATE POLICY "Kontributor can delete own draft knowledges"
  ON knowledges FOR DELETE
  TO authenticated
  USING (
    (auth.uid() = submitted_by AND status = 'draft') OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('pustakawan', 'super_admin'))
  );

-- ==========================================
-- KNOWLEDGE TAGS
-- ==========================================

CREATE TABLE IF NOT EXISTS knowledge_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  knowledge_id UUID REFERENCES knowledges(id) ON DELETE CASCADE NOT NULL,
  tag VARCHAR(100) NOT NULL
);

ALTER TABLE knowledge_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view knowledge tags"
  ON knowledge_tags FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage knowledge tags"
  ON knowledge_tags FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM knowledges k
      WHERE k.id = knowledge_id AND (
        k.submitted_by = auth.uid() OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('pustakawan', 'super_admin'))
      )
    )
  );

CREATE POLICY "Authenticated users can delete knowledge tags"
  ON knowledge_tags FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM knowledges k
      WHERE k.id = knowledge_id AND (
        k.submitted_by = auth.uid() OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('pustakawan', 'super_admin'))
      )
    )
  );

-- ==========================================
-- RATINGS
-- ==========================================

CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  knowledge_id UUID REFERENCES knowledges(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  review TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(knowledge_id, user_id)
);

ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view ratings"
  ON ratings FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert ratings"
  ON ratings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ratings"
  ON ratings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own ratings"
  ON ratings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ==========================================
-- GUEST BOOK
-- ==========================================

CREATE TABLE IF NOT EXISTS guest_book (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  visit_date TIMESTAMPTZ DEFAULT now(),
  purpose visit_purpose NOT NULL,
  purpose_note TEXT,
  check_out_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE guest_book ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own guest book entries"
  ON guest_book FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('pustakawan', 'super_admin'))
  );

CREATE POLICY "Authenticated users can insert guest book"
  ON guest_book FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own guest book entries"
  ON guest_book FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('pustakawan', 'super_admin'))
  )
  WITH CHECK (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('pustakawan', 'super_admin'))
  );

-- ==========================================
-- NOTIFICATIONS
-- ==========================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type notif_type DEFAULT 'info',
  channel notif_channel DEFAULT 'in_app',
  is_read BOOLEAN DEFAULT false,
  related_entity_type VARCHAR(100),
  related_entity_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('pustakawan', 'super_admin'))
  );

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- AUDIT LOGS
-- ==========================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID,
  details JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin can view audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "Authenticated users can insert audit logs"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- SYSTEM CONFIG
-- ==========================================

CREATE TABLE IF NOT EXISTS system_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view system config"
  ON system_config FOR SELECT
  USING (true);

CREATE POLICY "Super admin can manage system config"
  ON system_config FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "Super admin can update system config"
  ON system_config FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

-- ==========================================
-- INDEXES
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_collections_category ON collections(category_id);
CREATE INDEX IF NOT EXISTS idx_collections_format ON collections(format);
CREATE INDEX IF NOT EXISTS idx_collections_isbn ON collections(isbn);
CREATE INDEX IF NOT EXISTS idx_collections_featured ON collections(is_featured);
CREATE INDEX IF NOT EXISTS idx_collections_created_at ON collections(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_borrowings_user ON borrowings(user_id);
CREATE INDEX IF NOT EXISTS idx_borrowings_collection ON borrowings(collection_id);
CREATE INDEX IF NOT EXISTS idx_borrowings_status ON borrowings(status);
CREATE INDEX IF NOT EXISTS idx_borrowings_due_date ON borrowings(due_date);
CREATE INDEX IF NOT EXISTS idx_reservations_user ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_collection ON reservations(collection_id);
CREATE INDEX IF NOT EXISTS idx_knowledges_status ON knowledges(status);
CREATE INDEX IF NOT EXISTS idx_knowledges_category ON knowledges(category_id);
CREATE INDEX IF NOT EXISTS idx_knowledges_submitted_by ON knowledges(submitted_by);
CREATE INDEX IF NOT EXISTS idx_knowledges_published_at ON knowledges(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_guest_book_user ON guest_book(user_id);
CREATE INDEX IF NOT EXISTS idx_guest_book_visit_date ON guest_book(visit_date DESC);

-- ==========================================
-- SEED DEFAULT SYSTEM CONFIG
-- ==========================================

INSERT INTO system_config (key, value, description) VALUES
  ('max_borrow_limit', '5', 'Maksimal buku yang dapat dipinjam per pengguna'),
  ('borrow_duration_days', '14', 'Durasi peminjaman default (hari)'),
  ('fine_per_day', '1000', 'Denda per hari keterlambatan (Rupiah)'),
  ('app_name', 'PustakaPlus', 'Nama aplikasi'),
  ('app_description', 'Sistem Manajemen Perpustakaan & Knowledge Management', 'Deskripsi aplikasi'),
  ('institution_name', 'Instansi Pemerintah', 'Nama instansi')
ON CONFLICT (key) DO NOTHING;

-- ==========================================
-- SEED DEFAULT CATEGORIES
-- ==========================================

INSERT INTO categories (name, slug, type) VALUES
  ('Ilmu Komputer', 'ilmu-komputer', 'perpustakaan'),
  ('Manajemen', 'manajemen', 'perpustakaan'),
  ('Hukum & Peraturan', 'hukum-peraturan', 'perpustakaan'),
  ('Ekonomi & Keuangan', 'ekonomi-keuangan', 'perpustakaan'),
  ('Sosial & Politik', 'sosial-politik', 'perpustakaan'),
  ('Teknik & Infrastruktur', 'teknik-infrastruktur', 'perpustakaan'),
  ('Kesehatan', 'kesehatan', 'perpustakaan'),
  ('Pendidikan', 'pendidikan', 'perpustakaan'),
  ('SOP & Prosedur', 'sop-prosedur', 'knowledge'),
  ('Panduan Teknis', 'panduan-teknis', 'knowledge'),
  ('Best Practice', 'best-practice', 'knowledge'),
  ('Lesson Learned', 'lesson-learned', 'knowledge'),
  ('Regulasi & Kebijakan', 'regulasi-kebijakan', 'knowledge'),
  ('Laporan & Kajian', 'laporan-kajian', 'knowledge')
ON CONFLICT (slug) DO NOTHING;

-- ==========================================
-- FUNCTION: Handle new user profile creation
-- ==========================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'pembaca')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ==========================================
-- FUNCTION: Update average rating
-- ==========================================

CREATE OR REPLACE FUNCTION update_knowledge_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE knowledges
  SET average_rating = (
    SELECT COALESCE(AVG(rating::DECIMAL), 0)
    FROM ratings
    WHERE knowledge_id = COALESCE(NEW.knowledge_id, OLD.knowledge_id)
  )
  WHERE id = COALESCE(NEW.knowledge_id, OLD.knowledge_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_rating_change ON ratings;
CREATE TRIGGER on_rating_change
  AFTER INSERT OR UPDATE OR DELETE ON ratings
  FOR EACH ROW EXECUTE FUNCTION update_knowledge_rating();
