# Repository Guidelines

## Project Overview

**PustakaPlus** adalah aplikasi manajemen perpustakaan dan manajemen pengetahuan (knowledge management) berbasis web yang dibangun untuk keperluan instansi/organisasi. Aplikasi ini mengintegrasikan dua domain utama:

1. **Perpustakaan Digital** — manajemen koleksi buku/jurnal/ebook/multimedia, peminjaman, reservasi, dan laporan.
2. **Knowledge Management** — kontribusi, kurasi, dan publikasi artikel, SOP, panduan, lesson learned, dan best practice.

### Fitur Utama

| Fitur | Keterangan |
|---|---|
| Katalog Publik | Penelusuran koleksi perpustakaan tanpa login |
| Knowledge Base Publik | Akses artikel dan pengetahuan yang telah dipublikasi |
| Manajemen Koleksi | CRUD koleksi, barcode/QR, metadata MARC21 & Dublin Core |
| Peminjaman & Reservasi | Alur pinjam, pengembalian, denda, antrian reservasi |
| Knowledge Workflow | Draft → Submit → Review → Approved/Rejected → Published |
| Buku Tamu (Guest Book) | Pencatatan kunjungan dan tujuan kunjungan |
| Notifikasi | Notifikasi in-app dan email multi-channel |
| Laporan & Statistik | Dashboard statistik dan export laporan |
| Audit Log | Pencatatan seluruh aksi pengguna untuk akuntabilitas |
| Manajemen Pengguna | CRUD user, role assignment (super_admin only) |
| Pengaturan Sistem | Konfigurasi parameter aplikasi (super_admin only) |

### Roles & Akses

| Role | Deskripsi |
|---|---|
| `super_admin` | Akses penuh ke seluruh fitur termasuk Users, Audit Logs, Settings |
| `pustakawan` | Akses pengelolaan koleksi, peminjaman, reservasi, laporan |
| `kontributor` | Dapat submit knowledge, mengelola konten milik sendiri |
| `pembaca` | Akses baca katalog, pinjam/reservasi, baca knowledge |

---

## Tech Stack

| Kategori | Library/Tool | Versi |
|---|---|---|
| UI Framework | React | ^18.3.1 |
| Language | TypeScript | ^5.5.3 |
| Build Tool | Vite | ^5.4.2 |
| Routing | React Router DOM | ^7.13.0 |
| Backend / Auth / DB | Supabase JS | ^2.57.4 |
| Styling | Tailwind CSS | ^3.4.1 |
| Icon Library | Lucide React | ^0.344.0 |
| Chart / Visualization | Recharts | ^3.7.0 |
| Date Utility | date-fns | ^4.1.0 |
| PostCSS | autoprefixer + postcss | ^10.4.18 / ^8.4.35 |
| Linter | ESLint + typescript-eslint | ^9.9.1 / ^8.3.0 |

**Environment Variables (`.env.local`):**
```
VITE_SUPABASE_URL=<your-supabase-project-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

---

## Folder & File Project Structure

```
pusatakaplus/
├── docs/                          # Dokumentasi proyek
│   └── specs.md                   # Repository guidelines (file ini)
├── public/                        # Static assets
├── src/
│   ├── App.tsx                    # Root component, routing definition
│   ├── main.tsx                   # Entry point, ReactDOM.createRoot
│   ├── index.css                  # Global CSS + Tailwind directives
│   ├── vite-env.d.ts              # Vite environment type declarations
│   │
│   ├── components/
│   │   ├── catalog/
│   │   │   └── CollectionCard.tsx     # Card koleksi perpustakaan
│   │   ├── knowledge/
│   │   │   └── KnowledgeCard.tsx      # Card artikel knowledge
│   │   ├── layout/
│   │   │   ├── DashboardLayout.tsx    # Layout dengan Sidebar untuk area dashboard
│   │   │   ├── Footer.tsx             # Footer publik
│   │   │   ├── Navbar.tsx             # Navbar publik dengan auth state
│   │   │   ├── ProtectedRoute.tsx     # Guard route berdasarkan auth + role
│   │   │   └── Sidebar.tsx            # Sidebar navigasi dashboard
│   │   └── ui/
│   │       ├── Badge.tsx              # Badge/tag label
│   │       ├── EmptyState.tsx         # Tampilan state data kosong
│   │       ├── LoadingSpinner.tsx     # Loading indicator
│   │       ├── Modal.tsx              # Modal/dialog overlay
│   │       └── StatsCard.tsx          # Card statistik dashboard
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx            # React Context untuk auth state global
│   │
│   ├── lib/
│   │   ├── supabase.ts                # Inisialisasi Supabase client
│   │   ├── types.ts                   # Seluruh TypeScript interfaces & types
│   │   └── utils.ts                   # Fungsi utility umum
│   │
│   └── pages/
│       ├── auth/
│       │   ├── LoginPage.tsx          # Halaman login
│       │   └── RegisterPage.tsx       # Halaman registrasi
│       ├── dashboard/
│       │   ├── DashboardPage.tsx      # Overview & statistik
│       │   ├── CollectionsPage.tsx    # Manajemen koleksi perpustakaan
│       │   ├── BorrowingsPage.tsx     # Manajemen peminjaman
│       │   ├── ReservationsPage.tsx   # Manajemen reservasi
│       │   ├── KnowledgesPage.tsx     # Manajemen knowledge (admin/pustakawan)
│       │   ├── GuestBookPage.tsx      # Buku tamu
│       │   ├── UsersPage.tsx          # Manajemen users [super_admin]
│       │   ├── ReportsPage.tsx        # Laporan [pustakawan, super_admin]
│       │   ├── AuditLogsPage.tsx      # Audit log [super_admin]
│       │   ├── NotificationsPage.tsx  # Notifikasi pengguna
│       │   ├── SettingsPage.tsx       # Pengaturan sistem [super_admin]
│       │   └── ProfilePage.tsx        # Profil pengguna
│       └── public/
│           ├── HomePage.tsx           # Landing page
│           ├── CatalogPage.tsx        # Katalog koleksi publik
│           ├── CollectionDetailPage.tsx # Detail koleksi
│           ├── KnowledgeBasePage.tsx  # Knowledge base publik
│           └── KnowledgeDetailPage.tsx # Detail artikel knowledge
│
├── supabase/
│   ├── functions/
│   │   └── create-demo-users/
│   │       └── index.ts               # Edge function: seed demo users
│   └── migrations/
│       ├── 20260219054025_create_pustakaplus_schema.sql  # Schema utama
│       └── 20260219055947_fix_handle_new_user_trigger.sql # Fix trigger user
│
├── index.html                     # HTML entry point
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── eslint.config.js
```

### Route Map

| Path | Komponen | Guard |
|---|---|---|
| `/` | `HomePage` | — |
| `/catalog` | `CatalogPage` | — |
| `/catalog/:id` | `CollectionDetailPage` | — |
| `/knowledge` | `KnowledgeBasePage` | — |
| `/knowledge/:id` | `KnowledgeDetailPage` | — |
| `/login` | `LoginPage` | — |
| `/register` | `RegisterPage` | — |
| `/dashboard` | `DashboardPage` | Auth |
| `/dashboard/collections` | `CollectionsPage` | Auth |
| `/dashboard/borrowings` | `BorrowingsPage` | Auth |
| `/dashboard/reservations` | `ReservationsPage` | Auth |
| `/dashboard/knowledges` | `KnowledgesPage` | Auth |
| `/dashboard/guest-book` | `GuestBookPage` | Auth |
| `/dashboard/users` | `UsersPage` | Auth + `super_admin` |
| `/dashboard/reports` | `ReportsPage` | Auth + `pustakawan\|super_admin` |
| `/dashboard/audit-logs` | `AuditLogsPage` | Auth + `super_admin` |
| `/dashboard/notifications` | `NotificationsPage` | Auth |
| `/dashboard/settings` | `SettingsPage` | Auth + `super_admin` |
| `/dashboard/profile` | `ProfilePage` | Auth |
| `*` | Redirect → `/` | — |

---

## Commands

```bash
# Jalankan development server (localhost:5173)
npm run dev

# Build untuk production
npm run build

# Preview build production
npm run preview

# Linting dengan ESLint
npm run lint

# Type checking tanpa emitting file
npm run typecheck
```

---

## Code Style

### TypeScript

- Selalu gunakan **TypeScript strict mode**. Tidak ada penggunaan `any` kecuali ada justifikasi kuat.
- Semua tipe data domain aplikasi didefinisikan di `src/lib/types.ts`.
- Gunakan `interface` untuk object shapes, `type` untuk union types dan literal types.
- Selalu annotasikan return type fungsi yang tidak trivial.

```typescript
// ✅ Gunakan interface untuk object shapes
interface CollectionFilterState {
  search: string;
  format: CollectionFormat | 'all';
  categoryId: string;
}

// ✅ Gunakan type untuk union/literal
type BorrowStatus = 'dipinjam' | 'dikembalikan' | 'terlambat';

// ❌ Hindari any
const data: any = await fetchSomething(); // JANGAN
```

### React Components

- Semua komponen menggunakan **function components** dengan TypeScript.
- Default export untuk setiap komponen (satu file = satu komponen utama).
- Props interface didefinisikan secara eksplisit di atas fungsi komponen.
- Gunakan **named exports** untuk hooks dan utilities, **default export** untuk komponen.

```tsx
// ✅ Pola standar komponen
interface MyComponentProps {
  label: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

export default function MyComponent({ label, onClick, children }: MyComponentProps) {
  return (
    <div onClick={onClick}>
      <span>{label}</span>
      {children}
    </div>
  );
}
```

- Gunakan `useAuth()` hook untuk mengakses auth state — JANGAN akses supabase langsung di komponen tanpa melalui hook/abstraksi.
- Data fetching dilakukan dengan `useEffect` + `useState` atau idealnya dengan custom hooks.

### Imports

Urutan import yang harus diikuti (dari atas ke bawah):

1. React core (`react`, `react-dom`)
2. React Router (`react-router-dom`)
3. Third-party libraries (`@supabase/supabase-js`, `lucide-react`, `date-fns`, `recharts`)
4. Internal contexts (`../../contexts/...`)
5. Internal lib/utils (`../../lib/...`)
6. Internal components (`../../components/...` atau `../components/...`)
7. Internal pages (jarang diimport lintas page)

```tsx
// ✅ Contoh urutan import
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Collection } from '../../lib/types';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
```

Gunakan **path aliases relatif** bukan absolute. Tidak ada konfigurasi path alias (`@/`) saat ini.

### Naming Conventions

| Entitas | Konvensi | Contoh |
|---|---|---|
| Komponen React | PascalCase | `CollectionCard`, `DashboardLayout` |
| File komponen | PascalCase + `.tsx` | `CollectionCard.tsx` |
| Hooks | camelCase + prefix `use` | `useAuth`, `useCollections` |
| Fungsi biasa | camelCase | `formatDate`, `getBorrowStatus` |
| Konstanta | SCREAMING_SNAKE_CASE | `MAX_BORROW_LIMIT` |
| Interface/Type | PascalCase | `Collection`, `UserRole` |
| Variabel state | camelCase | `isLoading`, `selectedCollection` |
| Handler props | prefix `on` + PascalCase | `onClose`, `onSubmit`, `onDelete` |
| Handler fungsi | prefix `handle` + PascalCase | `handleSubmit`, `handleDelete` |
| Supabase query vars | camelCase | `data`, `error` |
| CSS classes | Tailwind utility classes langsung (tidak ada BEM) | — |

### Error Handling

- Semua operasi Supabase harus menangani `error` dari destructured response.
- Tampilkan error ke user melalui state lokal (alert, toast, atau inline message) — JANGAN `console.error` saja.
- Loading state selalu dikelola dengan `isLoading` boolean.

```typescript
// ✅ Pola standar data fetching
const [data, setData] = useState<Collection[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    const { data, error } = await supabase.from('collections').select('*');
    if (error) {
      setError(error.message);
    } else {
      setData(data ?? []);
    }
    setIsLoading(false);
  };
  fetchData();
}, []);

// ✅ Render berdasarkan state
if (isLoading) return <LoadingSpinner />;
if (error) return <p className="text-red-500">{error}</p>;
if (data.length === 0) return <EmptyState ... />;
```

---

## UI Components

Semua reusable UI components berada di `src/components/ui/`. Gunakan komponen ini secara konsisten di seluruh aplikasi — JANGAN membuat elemen inline yang menduplikasi fungsinya.

### `Badge`
```tsx
import Badge from '../../components/ui/Badge';

// variant: 'default' | 'outline'
<Badge className="bg-blue-100 text-blue-700">buku</Badge>
<Badge variant="outline" className="text-green-600">tersedia</Badge>
```

### `EmptyState`
Gunakan saat data kosong setelah fetch, dengan icon dan pesan yang relevan dengan konteks.
```tsx
import EmptyState from '../../components/ui/EmptyState';

<EmptyState
  icon={BookOpen}
  title="Belum ada koleksi"
  description="Koleksi belum ditambahkan atau tidak ditemukan."
  action={{ label: 'Tambah Koleksi', onClick: handleOpenModal }}
/>
```

### `LoadingSpinner`
```tsx
import LoadingSpinner from '../../components/ui/LoadingSpinner';

// size: 'sm' | 'md' | 'lg'
<LoadingSpinner size="lg" className="min-h-screen" />
```

### `Modal`
Digunakan untuk form tambah/edit, konfirmasi hapus, dan detail view.
```tsx
import Modal from '../../components/ui/Modal';

<Modal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  title="Tambah Koleksi"
  size="lg" // 'sm' | 'md' | 'lg' | 'xl'
>
  {/* form content */}
</Modal>
```

### `StatsCard`
Digunakan di DashboardPage untuk menampilkan angka statistik.
```tsx
import StatsCard from '../../components/ui/StatsCard';
import { BookOpen } from 'lucide-react';

<StatsCard
  title="Total Koleksi"
  value={stats.totalCollections}
  icon={BookOpen}
  color="blue"   // 'blue' | 'green' | 'yellow' | 'red' | 'purple'
  trend="+12%"   // opsional
/>
```

### Layout Wrappers

- **`PublicLayout`** (didefinisikan inline di `App.tsx`): membungkus halaman publik dengan `<Navbar>` dan `<Footer>`.
- **`DashboardLayout`**: membungkus seluruh area `/dashboard/*` dengan `<Sidebar>` dan area konten utama.
- **`ProtectedRoute`**: guard komponen dengan prop `roles?: UserRole[]` opsional untuk role-based access.

```tsx
// Penggunaan ProtectedRoute dengan role restriction
<ProtectedRoute roles={['super_admin']}>
  <UsersPage />
</ProtectedRoute>
```

---

## Accessibility

- Semua elemen interaktif (`button`, `input`, `select`) harus punya label yang terbaca screen reader (`aria-label`, `<label>`, atau `htmlFor`).
- Gunakan elemen HTML semantik: `<nav>`, `<main>`, `<header>`, `<footer>`, `<section>`, `<article>`.
- Warna tidak boleh menjadi satu-satunya penyampai informasi — selalu sertakan teks label atau icon.
- Komponen Modal harus dapat ditutup dengan tombol `Escape` dan fokus harus ter-trap di dalam modal.
- Tabel data harus menggunakan `<th scope="col">` dan `<caption>` yang deskriptif.
- Rasio kontras warna minimum WCAG AA (4.5:1 untuk teks normal, 3:1 untuk teks besar).
- Link dan button harus punya focus indicator yang jelas (Tailwind: `focus:ring-2 focus:ring-offset-2`).

---

## Design System

Aplikasi menggunakan **Tailwind CSS** sebagai design system. Semua styling dilakukan melalui utility classes — tidak ada file CSS terpisah per komponen.

### Palet Warna Utama

| Token | Tailwind Class | Kegunaan |
|---|---|---|
| Primary | `blue-600`, `blue-700` | Tombol utama, link aktif, aksen |
| Success | `green-600`, `green-100` | Status sukses, tersedia |
| Warning | `yellow-500`, `yellow-100` | Status warning, terlambat |
| Danger | `red-600`, `red-100` | Error, hapus, terlambat |
| Neutral | `gray-50` – `gray-900` | Background, teks, border |
| Purple | `purple-600`, `purple-100` | Knowledge, badge khusus |

### Typography

- Heading halaman: `text-2xl font-bold text-gray-900`
- Sub-heading section: `text-lg font-semibold text-gray-900`
- Body teks: `text-sm text-gray-600`
- Label form: `text-sm font-medium text-gray-700`
- Placeholder / hint: `text-sm text-gray-400`

### Spacing & Layout

- Container dashboard: `p-6` (padding konsisten di seluruh halaman dashboard)
- Card: `bg-white rounded-xl shadow-sm border border-gray-200 p-6`
- Jarak antar section: `space-y-6`
- Grid stats: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6`

### Form & Input

```tsx
// ✅ Pola input standar
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Judul Koleksi
  </label>
  <input
    type="text"
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    placeholder="Masukkan judul..."
  />
</div>
```

### Button Variants

```tsx
// Primary
<button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
  Simpan
</button>

// Secondary / Outline
<button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
  Batal
</button>

// Danger
<button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
  Hapus
</button>

// Icon Button
<button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
  <Edit className="w-4 h-4" />
</button>
```

### Status Badge Colors

| Status | Class |
|---|---|
| `dipinjam` / `submitted` | `bg-blue-100 text-blue-700` |
| `dikembalikan` / `approved` / `tersedia` | `bg-green-100 text-green-700` |
| `terlambat` / `rejected` | `bg-red-100 text-red-700` |
| `menunggu` / `draft` | `bg-yellow-100 text-yellow-700` |
| `published` | `bg-purple-100 text-purple-700` |
| `dibatalkan` | `bg-gray-100 text-gray-700` |

### Icon Usage

Semua icon menggunakan **Lucide React**. Ukuran standar:
- Icon dalam tombol: `w-4 h-4`
- Icon dalam navigasi sidebar: `w-5 h-5`
- Icon dalam EmptyState / ilustrasi: `w-12 h-12` atau `w-16 h-16`
- Icon dalam StatsCard: `w-6 h-6`

```tsx
import { BookOpen, Users, FileText, Bell } from 'lucide-react';
```
