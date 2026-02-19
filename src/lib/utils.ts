import { format, formatDistanceToNow, isPast, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

export function formatDate(dateStr: string, fmt = 'd MMMM yyyy') {
  try {
    return format(parseISO(dateStr), fmt, { locale: id });
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string) {
  try {
    return format(parseISO(dateStr), 'd MMM yyyy, HH:mm', { locale: id });
  } catch {
    return dateStr;
  }
}

export function timeAgo(dateStr: string) {
  try {
    return formatDistanceToNow(parseISO(dateStr), { addSuffix: true, locale: id });
  } catch {
    return dateStr;
  }
}

export function isOverdue(dueDateStr: string) {
  try {
    return isPast(parseISO(dueDateStr));
  } catch {
    return false;
  }
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function truncate(text: string, length = 120) {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
}

export function generateBarcode(id: string) {
  return `PPL-${id.substring(0, 8).toUpperCase()}`;
}

export const roleLabels: Record<string, string> = {
  super_admin: 'Super Admin',
  pustakawan: 'Pustakawan',
  kontributor: 'Kontributor',
  pembaca: 'Pembaca',
};

export const roleColors: Record<string, string> = {
  super_admin: 'bg-red-100 text-red-700',
  pustakawan: 'bg-blue-100 text-blue-700',
  kontributor: 'bg-green-100 text-green-700',
  pembaca: 'bg-gray-100 text-gray-700',
};

export const formatLabels: Record<string, string> = {
  buku: 'Buku',
  jurnal: 'Jurnal',
  ebook: 'E-Book',
  multimedia: 'Multimedia',
};

export const statusLabels: Record<string, string> = {
  dipinjam: 'Dipinjam',
  dikembalikan: 'Dikembalikan',
  terlambat: 'Terlambat',
  menunggu: 'Menunggu',
  tersedia: 'Tersedia',
  dibatalkan: 'Dibatalkan',
  selesai: 'Selesai',
  draft: 'Draft',
  submitted: 'Menunggu Review',
  approved: 'Disetujui',
  rejected: 'Ditolak',
  published: 'Dipublish',
};

export const statusColors: Record<string, string> = {
  dipinjam: 'bg-amber-100 text-amber-700',
  dikembalikan: 'bg-green-100 text-green-700',
  terlambat: 'bg-red-100 text-red-700',
  menunggu: 'bg-amber-100 text-amber-700',
  tersedia: 'bg-green-100 text-green-700',
  dibatalkan: 'bg-gray-100 text-gray-700',
  selesai: 'bg-blue-100 text-blue-700',
  draft: 'bg-gray-100 text-gray-700',
  submitted: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  published: 'bg-blue-100 text-blue-700',
};

export const purposeLabels: Record<string, string> = {
  pinjam_buku: 'Pinjam Buku',
  baca_di_tempat: 'Baca di Tempat',
  riset: 'Riset',
  meeting: 'Meeting',
  lainnya: 'Lainnya',
};

export const knowledgeTypeLabels: Record<string, string> = {
  artikel: 'Artikel',
  sop: 'SOP',
  panduan: 'Panduan',
  lesson_learned: 'Lesson Learned',
  best_practice: 'Best Practice',
};

export const knowledgeTypeColors: Record<string, string> = {
  artikel: 'bg-blue-100 text-blue-700',
  sop: 'bg-green-100 text-green-700',
  panduan: 'bg-amber-100 text-amber-700',
  lesson_learned: 'bg-purple-100 text-purple-700',
  best_practice: 'bg-teal-100 text-teal-700',
};
