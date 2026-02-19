<div align="center">

# 📚 PustakaPlus

**Sistem Manajemen Perpustakaan & Knowledge Management**

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-2.57-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

[Demo](#) · [Dokumentasi](docs/specs.md) · [Laporkan Bug](https://github.com/tamaproject360/pustakaplus/issues) · [Request Fitur](https://github.com/tamaproject360/pustakaplus/issues)

</div>

---

## 📋 Daftar Isi

- [Tentang Proyek](#tentang-proyek)
- [Fitur Utama](#fitur-utama)
- [Tech Stack](#tech-stack)
- [Memulai](#memulai)
  - [Prasyarat](#prasyarat)
  - [Instalasi](#instalasi)
  - [Konfigurasi Environment](#konfigurasi-environment)
  - [Setup Database (Supabase)](#setup-database-supabase)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [Struktur Proyek](#struktur-proyek)
- [Roles & Hak Akses](#roles--hak-akses)
- [Standar Internasional](#standar-internasional)
- [Kontribusi](#kontribusi)
- [Lisensi](#lisensi)

---

## Tentang Proyek

**PustakaPlus** adalah aplikasi web manajemen perpustakaan dan knowledge management yang dirancang untuk kebutuhan instansi/organisasi. Aplikasi ini mengintegrasikan dua domain utama:

- **📚 Perpustakaan Digital** — Katalog OPAC publik, manajemen koleksi (buku, jurnal, e-book, multimedia), sirkulasi (peminjaman, pengembalian, denda), reservasi, dan laporan statistik.
- **🧠 Knowledge Management** — Repositori artikel, SOP, panduan, lesson learned, dan best practice dengan alur kerja kontribusi: Draft → Submit → Review → Publish.

Dibangun dengan standar internasional **OPAC**, **AACR2**, **MARC21**, **Dublin Core**, dan **ISO 30401:2018** untuk memastikan interoperabilitas dan kualitas pengelolaan informasi.

---

## Fitur Utama

### Modul Perpustakaan
| Fitur | Status |
|---|---|
| Katalog OPAC — penelusuran publik tanpa login | ✅ Tersedia |
| CRUD Koleksi (buku, jurnal, e-book, multimedia) | ✅ Tersedia |
| Metadata MARC21 & Dublin Core | ✅ Tersedia |
| Barcode & QR Code per koleksi | ✅ Tersedia |
| Peminjaman, pengembalian & perhitungan denda otomatis | ✅ Tersedia |
| Sistem antrian reservasi | ✅ Tersedia |
| Laporan & statistik perpustakaan | ✅ Tersedia |

### Modul Knowledge Management
| Fitur | Status |
|---|---|
| Knowledge base publik (artikel, SOP, panduan, best practice) | ✅ Tersedia |
| Workflow review: Draft → Submit → Approved/Rejected → Published | ✅ Tersedia |
| Rating & review konten (1–5 bintang) | ✅ Tersedia |
| Kategorisasi & tagging konten | ✅ Tersedia |

### Modul Umum
| Fitur | Status |
|---|---|
| Autentikasi & manajemen sesi (Supabase Auth) | ✅ Tersedia |
| Role-based access control (4 peran) | ✅ Tersedia |
| Buku tamu & statistik kunjungan | ✅ Tersedia |
| Notifikasi in-app & email | ✅ Tersedia |
| Audit log seluruh aktivitas sistem | ✅ Tersedia |
| Manajemen pengguna & konfigurasi sistem | ✅ Tersedia |
| Dashboard statistik per peran | ✅ Tersedia |

---

## Tech Stack

| Kategori | Library / Tool | Versi |
|---|---|---|
| UI Framework | [React](https://react.dev) | ^18.3.1 |
| Language | [TypeScript](https://www.typescriptlang.org) | ^5.5.3 |
| Build Tool | [Vite](https://vitejs.dev) | ^5.4.2 |
| Routing | [React Router DOM](https://reactrouter.com) | ^7.13.0 |
| Backend / Auth / DB | [Supabase](https://supabase.com) | ^2.57.4 |
| Styling | [Tailwind CSS](https://tailwindcss.com) | ^3.4.1 |
| Icons | [Lucide React](https://lucide.dev) | ^0.344.0 |
| Charts | [Recharts](https://recharts.org) | ^3.7.0 |
| Date Utilities | [date-fns](https://date-fns.org) | ^4.1.0 |
| Linter | ESLint + typescript-eslint | ^9.9.1 |

---

## Memulai

### Prasyarat

Pastikan perangkat Anda telah terpasang:

- **Node.js** v18 atau lebih tinggi — [Download](https://nodejs.org)
- **npm** v9+ (disertakan bersama Node.js)
- Akun **Supabase** — [Daftar gratis](https://supabase.com)

Verifikasi instalasi:

```bash
node --version   # v18.x.x atau lebih tinggi
npm --version    # 9.x.x atau lebih tinggi
```

### Instalasi

1. **Clone repository:**

```bash
git clone https://github.com/tamaproject360/pustakaplus.git
cd pustakaplus
```

2. **Install dependensi:**

```bash
npm install
```

### Konfigurasi Environment

1. Buat file `.env.local` di direktori root:

```bash
cp .env.example .env.local
```

2. Isi variabel environment yang diperlukan:

```env
# Supabase — dapatkan dari https://app.supabase.com → Project Settings → API
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

> **Penting:** Jangan pernah commit file `.env.local` ke repository. File ini sudah tercantum dalam `.gitignore`.

### Setup Database (Supabase)

1. Buat proyek baru di [Supabase Dashboard](https://app.supabase.com).

2. Buka **SQL Editor** di Supabase Dashboard, lalu jalankan migrasi secara berurutan:

```bash
# Migrasi 1 — Schema utama
supabase/migrations/20260219054025_create_pustakaplus_schema.sql

# Migrasi 2 — Fix trigger user
supabase/migrations/20260219055947_fix_handle_new_user_trigger.sql
```

   Atau salin isi setiap file dan jalankan langsung di **SQL Editor** Supabase.

3. **(Opsional) Seed data demo** — Deploy edge function untuk membuat akun demo:

```bash
# Gunakan Supabase CLI
supabase functions deploy create-demo-users
supabase functions invoke create-demo-users
```

---

## Menjalankan Aplikasi

```bash
# Development server (http://localhost:5173)
npm run dev

# Build untuk production
npm run build

# Preview hasil build production
npm run preview

# Type checking
npm run typecheck

# Linting
npm run lint
```

Buka browser dan akses [http://localhost:5173](http://localhost:5173).

---

## Struktur Proyek

```
pusatakaplus/
├── docs/                          # Dokumentasi proyek
│   ├── specs.md                   # Repository guidelines & design system
│   └── blueprint.md               # Spesifikasi & arsitektur lengkap
│
├── src/
│   ├── App.tsx                    # Root component & routing
│   ├── main.tsx                   # Entry point
│   ├── index.css                  # Global styles + Tailwind directives
│   │
│   ├── components/
│   │   ├── catalog/               # Komponen katalog perpustakaan
│   │   ├── knowledge/             # Komponen knowledge base
│   │   ├── layout/                # Navbar, Sidebar, DashboardLayout, ProtectedRoute
│   │   └── ui/                    # Badge, Modal, LoadingSpinner, EmptyState, StatsCard
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx        # Global auth state (user, profile, hasRole)
│   │
│   ├── lib/
│   │   ├── supabase.ts            # Supabase client instance
│   │   ├── types.ts               # Semua TypeScript interfaces & types
│   │   └── utils.ts               # Helper functions (formatDate, formatCurrency, dll.)
│   │
│   └── pages/
│       ├── auth/                  # LoginPage, RegisterPage
│       ├── dashboard/             # Semua halaman area admin/dashboard
│       └── public/                # HomePage, CatalogPage, KnowledgeBasePage, dll.
│
├── supabase/
│   ├── functions/                 # Supabase Edge Functions
│   └── migrations/                # SQL migration files
│
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

---

## Roles & Hak Akses

| Role | Deskripsi | Akses Halaman |
|---|---|---|
| `super_admin` | Administrator sistem penuh | Semua halaman termasuk Users, Audit Logs, Settings |
| `pustakawan` | Pengelola perpustakaan & konten | Koleksi, Peminjaman, Reservasi, Knowledge, Laporan |
| `kontributor` | Pengupload pengetahuan | Submit & kelola knowledge milik sendiri |
| `pembaca` | Pengguna umum | Katalog, pinjam/reservasi, baca knowledge |

### Route yang Dilindungi

```
/dashboard/*                  → Semua role (login required)
/dashboard/users              → super_admin only
/dashboard/audit-logs         → super_admin only
/dashboard/settings           → super_admin only
/dashboard/reports            → pustakawan, super_admin
```

---

## Standar Internasional

| Standar | Penerapan |
|---|---|
| **OPAC** | Katalog online publik yang dapat diakses tanpa login |
| **AACR2** | Katalogisasi bibliografi konsisten pada deskripsi koleksi |
| **MARC21** | Format metadata bibliografi (field marc21_data pada koleksi) |
| **Dublin Core** | Skema metadata untuk koleksi digital dan knowledge (`dublin_core_metadata`) |
| **ISO 30401:2018** | Framework pengelolaan knowledge institusional |
| **WCAG 2.1 AA** | Standar aksesibilitas web |

---

## Kontribusi

Kontribusi sangat diterima! Berikut cara berkontribusi:

1. **Fork** repository ini
2. Buat branch fitur baru:
   ```bash
   git checkout -b feature/nama-fitur-anda
   ```
3. Commit perubahan dengan pesan yang deskriptif:
   ```bash
   git commit -m "feat: tambah fitur export laporan ke PDF"
   ```
4. Push ke branch Anda:
   ```bash
   git push origin feature/nama-fitur-anda
   ```
5. Buka **Pull Request** ke branch `main`

### Pedoman Commit Message

Gunakan format [Conventional Commits](https://www.conventionalcommits.org):

```
feat:     Fitur baru
fix:      Perbaikan bug
docs:     Perubahan dokumentasi
style:    Formatting (tidak mengubah logika)
refactor: Refactoring kode
test:     Menambah atau memperbaiki test
chore:    Pemeliharaan (build, dependencies, dsb.)
```

### Code Style

Baca [docs/specs.md](docs/specs.md) untuk panduan lengkap konvensi kode, naming conventions, pola komponen, dan design system yang digunakan dalam proyek ini.

---

## Lisensi

Didistribusikan di bawah lisensi **MIT**. Lihat file [LICENSE](LICENSE) untuk detail lebih lanjut.

---

<div align="center">

*© 2026 PustakaPlus. All rights reserved.*

Dibuat dengan ❤️ untuk digitalisasi perpustakaan instansi Indonesia.

</div>
