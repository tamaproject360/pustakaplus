export type UserRole = 'super_admin' | 'pustakawan' | 'kontributor' | 'pembaca';

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  unit_kerja?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type CategoryType = 'perpustakaan' | 'knowledge';

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id?: string;
  type: CategoryType;
  created_at: string;
}

export type CollectionFormat = 'buku' | 'jurnal' | 'ebook' | 'multimedia';

export interface Collection {
  id: string;
  title: string;
  author?: string;
  publisher?: string;
  publish_year?: number;
  isbn?: string;
  issn?: string;
  format: CollectionFormat;
  language: string;
  subject?: string;
  description?: string;
  cover_url?: string;
  file_url?: string;
  barcode?: string;
  qr_code?: string;
  shelf_location?: string;
  total_copies: number;
  available_copies: number;
  marc21_data?: Record<string, unknown>;
  dublin_core_metadata?: Record<string, unknown>;
  category_id?: string;
  created_by?: string;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
  tags?: CollectionTag[];
  profiles?: Profile;
}

export interface CollectionTag {
  id: string;
  collection_id: string;
  tag: string;
}

export type BorrowStatus = 'dipinjam' | 'dikembalikan' | 'terlambat';

export interface Borrowing {
  id: string;
  user_id: string;
  collection_id: string;
  borrow_date: string;
  due_date: string;
  return_date?: string;
  status: BorrowStatus;
  fine_amount: number;
  fine_paid: boolean;
  notes?: string;
  processed_by?: string;
  created_at: string;
  collection?: Collection;
  user?: Profile;
  processor?: Profile;
}

export type ReservationStatus = 'menunggu' | 'tersedia' | 'dibatalkan' | 'selesai';

export interface Reservation {
  id: string;
  user_id: string;
  collection_id: string;
  reservation_date: string;
  status: ReservationStatus;
  queue_position?: number;
  notified_at?: string;
  created_at: string;
  collection?: Collection;
  user?: Profile;
}

export type KnowledgeType = 'artikel' | 'sop' | 'panduan' | 'lesson_learned' | 'best_practice';
export type KnowledgeStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'published';

export interface Knowledge {
  id: string;
  title: string;
  content?: string;
  summary?: string;
  type: KnowledgeType;
  file_url?: string;
  file_type?: string;
  thumbnail_url?: string;
  dublin_core_metadata?: Record<string, unknown>;
  status: KnowledgeStatus;
  rejection_feedback?: string;
  views_count: number;
  average_rating: number;
  category_id?: string;
  submitted_by?: string;
  reviewed_by?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
  category?: Category;
  tags?: KnowledgeTag[];
  submitter?: Profile;
  reviewer?: Profile;
  ratings?: Rating[];
}

export interface KnowledgeTag {
  id: string;
  knowledge_id: string;
  tag: string;
}

export interface Rating {
  id: string;
  knowledge_id: string;
  user_id: string;
  rating: number;
  review?: string;
  created_at: string;
  user?: Profile;
}

export type VisitPurpose = 'pinjam_buku' | 'baca_di_tempat' | 'riset' | 'meeting' | 'lainnya';

export interface GuestBook {
  id: string;
  user_id: string;
  visit_date: string;
  purpose: VisitPurpose;
  purpose_note?: string;
  check_out_time?: string;
  created_at: string;
  user?: Profile;
}

export type NotifType = 'info' | 'warning' | 'success' | 'error';
export type NotifChannel = 'in_app' | 'email' | 'both';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotifType;
  channel: NotifChannel;
  is_read: boolean;
  related_entity_type?: string;
  related_entity_id?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
  user?: Profile;
}

export interface SystemConfig {
  id: string;
  key: string;
  value: string;
  description?: string;
  updated_by?: string;
  updated_at: string;
}

export interface DashboardStats {
  totalCollections: number;
  totalBorrowings: number;
  activeBorrowings: number;
  totalKnowledge: number;
  publishedKnowledge: number;
  totalUsers: number;
  totalVisits: number;
  overdueItems: number;
}
