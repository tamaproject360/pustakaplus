# Blueprint — PustakaPlus: Sistem Perpustakaan & Knowledge Management

Buatkan saya aplikasi dengan spesifikasi :

---

## 1. 🎯 Ringkasan Proyek

| Item | Detail |
| --- | --- |
| **Nama Aplikasi** | PustakaPlus |
| **Jenis Aplikasi** | Web Application (Full-stack) |
| **Deskripsi** | Sistem manajemen perpustakaan dan knowledge management untuk instansi pemerintah yang mengikuti standar internasional (OPAC, AACR2, MARC21) dengan performa tinggi dan mudah diakses |
| **Signature** | *© 2026 PustakaPlus. All rights reserved.* |

---

## 2. 👥 Target Pengguna & Role

Aplikasi ini memiliki **4 peran pengguna** dengan hak akses berbeda:

| Role | Deskripsi | Hak Akses Utama |
| --- | --- | --- |
| 🛡️ Super Admin | Mengelola sistem secara keseluruhan | Full akses: konfigurasi sistem, manajemen user, audit log, semua dashboard |
| 📚 Pustakawan / Admin Konten | Mengelola koleksi buku & knowledge base | CRUD koleksi, katalogisasi, approve/reject knowledge, kelola peminjaman, laporan |
| ✍️ Kontributor | Mengunggah & berbagi pengetahuan | Upload knowledge, isi metadata, submit untuk review, lihat status submission |
| 👤 Pembaca / Pengguna Biasa | Mengakses, meminjam buku, membaca knowledge base | Cari koleksi (tanpa login), pinjam buku (login), rating & review (login) |

---

## 3. 📜 Standar Internasional yang Didukung

| Standar | Deskripsi | Penerapan di PustakaPlus |
| --- | --- | --- |
| **OPAC** | Online Public Access Catalog | Katalog online publik untuk pencarian koleksi tanpa login |
| **AACR2** | Anglo-American Cataloguing Rules, 2nd Ed. | Aturan katalogisasi untuk deskripsi bibliografi yang konsisten |
| **MARC21** | Machine-Readable Cataloging | Format standar pertukaran data bibliografi, import/export data katalog |
| **ISBN/ISSN Lookup** | International Standard Book/Serial Number | Auto-lookup untuk mengisi data buku/jurnal secara otomatis via API |
| **Barcode/QR Code** | Identifikasi koleksi fisik | Generate & scan barcode/QR untuk identifikasi dan sirkulasi koleksi |
| **ISO 30401:2018** | Knowledge Management Systems | Framework pengelolaan pengetahuan institusional |
| **Dublin Core** | Metadata Standard | Skema metadata standar untuk deskripsi resource digital |

---

## 4. 📦 Fitur Lengkap Aplikasi

### 📚 4.1 Modul Perpustakaan

1. **Katalog OPAC (Online Public Access Catalog)**
    - Halaman pencarian publik tanpa login
    - Pencarian berdasarkan judul, pengarang, subjek, ISBN, tahun terbit
    - Filter berdasarkan kategori, bahasa, format (buku, jurnal, e-book, multimedia)
    - Tampilan hasil pencarian dengan cover, metadata, dan ketersediaan
    - Detail koleksi lengkap dengan deskripsi bibliografi AACR2
2. **Manajemen Koleksi**
    - CRUD koleksi: buku, jurnal, e-book, multimedia
    - Katalogisasi sesuai standar **AACR2** dan format **MARC21**
    - Import/export data bibliografi dalam format MARC21
    - **ISBN/ISSN auto-lookup** via API eksternal (Open Library API / Google Books API)
    - Upload cover buku dan file digital (e-book, PDF)
    - Manajemen kategori, subjek, dan tag
    - Manajemen lokasi rak dan inventaris fisik
3. **Barcode/QR Code**
    - Generate barcode/QR Code untuk setiap koleksi
    - Scan barcode/QR untuk identifikasi koleksi cepat
    - Integrasi scanner dengan proses peminjaman/pengembalian
4. **Sirkulasi (Peminjaman & Pengembalian)**
    - Peminjaman buku (memerlukan login)
    - Pengembalian buku dengan scan barcode/QR
    - Perhitungan denda otomatis untuk keterlambatan
    - Riwayat peminjaman per pengguna
    - Batas maksimal peminjaman per pengguna (konfigurabel)
    - Durasi peminjaman default (konfigurabel)
5. **Reservasi Buku**
    - Reservasi buku yang sedang dipinjam
    - Notifikasi otomatis saat buku tersedia
    - Antrian reservasi
6. **Laporan & Statistik Perpustakaan**
    - Statistik koleksi (total, per kategori, per format)
    - Statistik peminjaman (harian, mingguan, bulanan, tahunan)
    - Buku terpopuler / paling sering dipinjam
    - Laporan denda
    - Export laporan ke Excel/PDF

### 🧠 4.2 Modul Knowledge Management

1. **Knowledge Base**
    - Repositori artikel, SOP, panduan, lesson learned, best practice
    - Kategorisasi dan tagging konten
    - Metadata sesuai standar **Dublin Core**
    - Pencarian full-text menggunakan **Meilisearch**
    - Tampilan konten dengan card layout (inspirasi OKR World Bank)
    - Featured publications / konten unggulan di halaman utama
    - Tab "Recently Added" dan "Recently Published"
2. **Upload & Kategorisasi Dokumen**
    - Upload dokumen (PDF, Word, PPT, dll.) ke **MinIO**
    - Isi metadata: judul, penulis, kategori, tag, deskripsi
    - Workflow: Kontributor submit → Admin review → Approve/Reject → Publish
    - Status tracking untuk submission
3. **Pencarian Full-Text**
    - Powered by **Meilisearch**
    - Pencarian cepat dan relevan di seluruh knowledge base
    - Search suggestions dan typo tolerance
    - Filter hasil berdasarkan kategori, penulis, tanggal
4. **Rating & Review Konten**
    - Rating bintang (1-5) untuk setiap konten (memerlukan login)
    - Review/komentar pada konten (memerlukan login)
    - Rata-rata rating ditampilkan di card konten
5. **Knowledge Sharing Dashboard**
    - Statistik kontribusi per pengguna
    - Konten terpopuler berdasarkan views dan rating
    - Tren topik
    - Grafik pertumbuhan knowledge base

### 📒 4.3 Modul Buku Tamu

1. **Check-in Pengunjung**
    - Form check-in untuk pegawai yang datang ke perpustakaan fisik
    - Login diperlukan agar data otomatis terisi dari profil pengguna
    - Data yang dicatat: nama, unit kerja, waktu kunjungan, tujuan kunjungan
    - Opsi check-in cepat (one-tap setelah login)
2. **Dashboard Statistik Kunjungan**
    - Statistik kunjungan: harian, mingguan, bulanan
    - Grafik tren kunjungan
    - Analisis tujuan kunjungan
    - Jam puncak kunjungan
3. **Export Data Kunjungan**
    - Export ke Excel/PDF
    - Filter berdasarkan periode, unit kerja, tujuan

### ⚙️ 4.4 Modul Umum

1. **Dashboard per Role**
    - **Super Admin:** Overview sistem, statistik pengguna, audit log, konfigurasi
    - **Pustakawan:** Statistik koleksi, peminjaman aktif, pengembalian hari ini, reservasi pending
    - **Kontributor:** Status submission, konten yang sudah dipublish, statistik views
    - **Pembaca:** Riwayat peminjaman, buku yang sedang dipinjam, rekomendasi
2. **Manajemen Pengguna & Hak Akses**
    - CRUD pengguna
    - Assign role dan permission
    - Profil pengguna (nama, email, unit kerja, foto)
    - Aktivasi/deaktivasi akun
3. **Notifikasi**
    - **In-app notification:** Notifikasi di dalam aplikasi
    - **Email notification:** Pengingat jatuh tempo, konfirmasi peminjaman, status submission
    - Preferensi notifikasi per pengguna
4. **Audit Log / Riwayat Aktivitas**
    - Log semua aktivitas penting (login, CRUD, peminjaman, dll.)
    - Filter berdasarkan user, tanggal, jenis aktivitas
    - Hanya bisa diakses oleh Super Admin
5. **Laporan & Export Data**
    - Export semua laporan ke **Excel** dan **PDF**
    - Laporan bisa difilter berdasarkan periode dan parameter lainnya

---

## 5. 🔄 Alur Kerja (Workflow)

### 📚 5.1 Alur Perpustakaan

```mermaid
flowchart TD
    A["Pustakawan Login"] --> B["Input / Katalogisasi Koleksi (AACR2 + MARC21)"]
    B --> C["Generate Barcode/QR Code"]
    C --> D["Koleksi Tersedia di OPAC"]
    D --> E["Pegawai Buka OPAC (Tanpa Login)"]
    E --> F["Cari & Telusuri Koleksi"]
    F --> G{"Ingin Pinjam?"}
    G -->|Ya| H["Login"]
    H --> I["Pinjam Buku"]
    I --> J["Terima Notifikasi Jatuh Tempo"]
    J --> K["Kembalikan Buku"]
    K --> L{"Terlambat?"}
    L -->|Ya| M["Denda Otomatis"]
    L -->|Tidak| N["Selesai"]
    M --> N
    G -->|Tidak| N
```

### 🧠 5.2 Alur Knowledge Management

```mermaid
flowchart TD
    A["Kontributor Login"] --> B["Upload Dokumen / Artikel"]
    B --> C["Isi Metadata & Kategori"]
    C --> D["Submit untuk Review"]
    D --> E["Admin Konten Review"]
    E --> F{"Approve?"}
    F -->|Ya| G["Konten Terpublish di Knowledge Base"]
    F -->|Tidak| H["Reject dengan Feedback"]
    H --> B
    G --> I["Pegawai Telusuri Knowledge (Tanpa Login)"]
    I --> J{"Ingin Rating/Review?"}
    J -->|Ya| K["Login"]
    K --> L["Beri Rating & Review"]
    J -->|Tidak| M["Selesai"]
    L --> M
```

### 📒 5.3 Alur Buku Tamu

```mermaid
flowchart TD
    A["Pegawai Datang ke Perpustakaan"] --> B["Login di Kiosk/Device"]
    B --> C["Data Otomatis Terisi dari Profil"]
    C --> D["Pilih Tujuan Kunjungan"]
    D --> E["Check-in Berhasil"]
    E --> F["Data Masuk ke Dashboard Statistik"]
```

---

## 6. 🎨 Desain & User Interface

### 6.1 Halaman Publik (OPAC & Knowledge Base)

Terinspirasi dari **World Bank Open Knowledge Repository (OKR)**:

- **Hero Banner** — Banner besar di bagian atas dengan gambar dan deskripsi singkat PustakaPlus
- **Search Bar Prominent** — Kolom pencarian besar dan menonjol di halaman utama
- **Featured Publications** — Carousel/slider untuk koleksi unggulan atau terbaru
- **Tab Navigation** — Tab "Recently Added" & "Recently Published"
- **Card Layout** — Tampilan koleksi dalam bentuk kartu dengan cover, judul, tanggal, dan deskripsi
- **Detail Preview** — Label kategori, metadata lengkap, dan tombol "Show More"
- **Clean & Professional** — Desain bersih, rapi, whitespace yang cukup
- **Footer** — Navigasi, informasi kontak, signature

### 6.2 Halaman Admin / Pustakawan (Dashboard)

- **Sidebar Navigation (Collapsible)** — Bisa dibuka/tutup untuk memaksimalkan ruang kerja
- **Tabel Data** — Untuk manajemen koleksi, pengguna, peminjaman
- **Chart & Statistik** — Grafik interaktif di dashboard (bar chart, pie chart, line chart)
- **Breadcrumb Navigation** — Untuk navigasi yang jelas di dalam admin panel
- **Action Buttons** — Tombol aksi yang jelas (tambah, edit, hapus, export)

### 6.3 Tema Visual

| Elemen | Spesifikasi |
| --- | --- |
| **Warna Utama** | Biru tua (Navy) — `#1B3A5C` — kesan profesional, terpercaya, pemerintahan |
| **Warna Aksen** | Oranye/Amber — `#F59E0B` — sentuhan hangat dan modern |
| **Warna Latar** | Putih `#FFFFFF`  • Abu-abu terang `#F3F4F6` — bersih dan mudah dibaca |
| **Warna Teks** | Abu-abu gelap `#1F2937` untuk body, Navy untuk heading |
| **Font** | Sans-serif modern: **Inter** (primary), fallback: Open Sans, Roboto |
| **Nuansa** | Clean, profesional, modern, institusional |
| **Border Radius** | 8px untuk card, 6px untuk button — kesan modern dan friendly |
| **Shadow** | Subtle shadow pada card dan dropdown untuk kedalaman |

### 6.4 Responsivitas

- ✅ **Full mobile responsive** — tampilan menyesuaikan di HP, tablet, dan desktop
- Breakpoints: Mobile (< 640px), Tablet (640px–1024px), Desktop (> 1024px)
- Sidebar admin collapsible menjadi hamburger menu di mobile
- Card layout menyesuaikan grid: 1 kolom (mobile), 2 kolom (tablet), 4 kolom (desktop)

---

## 7. 🛠️ Stack Teknologi

| Layer | Teknologi | Versi (Rekomendasi) | Fungsi |
| --- | --- | --- | --- |
| **Frontend** | Next.js (React) | v14+ | SSR/SSG untuk performa tinggi, SEO-friendly untuk OPAC publik |
| **UI Library** | Tailwind CSS + shadcn/ui | v3+ / latest | Styling responsive, komponen UI modern dan customizable |
| **Backend** | Node.js + Express | v20+ / v4+ | REST API server, business logic, integrasi layanan |
| **Database** | PostgreSQL | v16+ | Database relasional utama, mendukung full-text search |
| **ORM** | Prisma | v5+ | Type-safe ORM, migrasi database, query builder |
| **Authentication** | NextAuth.js | v5+ | Autentikasi fleksibel, mendukung flow "login-later" |
| **File Storage** | MinIO | latest | S3-compatible storage untuk e-book, dokumen, cover buku |
| **Search Engine** | Meilisearch | v1+ | Full-text search cepat untuk OPAC dan Knowledge Base |
| **Containerization** | Docker + Docker Compose | latest | Containerisasi untuk konsistensi dev-to-prod |

### 7.1 Arsitektur Sistem

```mermaid
flowchart TB
    subgraph "Client Layer"
        A["Browser (Desktop/Mobile)"]
    end
    subgraph "Frontend Layer"
        B["Next.js (SSR/SSG)"]
        C["Tailwind CSS + shadcn/ui"]
    end
    subgraph "Backend Layer"
        D["Express.js (REST API)"]
        E["NextAuth.js (Auth)"]
    end
    subgraph "Data Layer"
        F[("PostgreSQL")]
        G["Prisma ORM"]
    end
    subgraph "Service Layer"
        H["Meilisearch (Search)"]
        I["MinIO (File Storage)"]
    end
    subgraph "Infrastructure"
        J["Docker + Docker Compose"]
    end
    A --> B
    B --> C
    B --> D
    D --> E
    D --> G
    G --> F
    D --> H
    D --> I
    J -.->|contains| B
    J -.->|contains| D
    J -.->|contains| F
    J -.->|contains| H
    J -.->|contains| I
```

---

## 8. 🗄️ Struktur Database (Skema Utama)

### 8.1 Tabel Utama

```sql
-- ==========================================
-- MODUL PENGGUNA
-- ==========================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('super_admin', 'pustakawan', 'kontributor', 'pembaca') NOT NULL DEFAULT 'pembaca',
    unit_kerja VARCHAR(255),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- MODUL PERPUSTAKAAN
-- ==========================================

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    parent_id UUID REFERENCES categories(id),
    type ENUM('perpustakaan', 'knowledge') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    author VARCHAR(500),
    publisher VARCHAR(255),
    publish_year INTEGER,
    isbn VARCHAR(20),
    issn VARCHAR(20),
    format ENUM('buku', 'jurnal', 'ebook', 'multimedia') NOT NULL DEFAULT 'buku',
    language VARCHAR(50) DEFAULT 'id',
    subject TEXT,
    description TEXT,
    cover_url TEXT,
    file_url TEXT,
    barcode VARCHAR(100) UNIQUE,
    qr_code VARCHAR(100) UNIQUE,
    shelf_location VARCHAR(100),
    total_copies INTEGER DEFAULT 1,
    available_copies INTEGER DEFAULT 1,
    marc21_data JSONB,
    dublin_core_metadata JSONB,
    category_id UUID REFERENCES categories(id),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE collection_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
    tag VARCHAR(100) NOT NULL
);

CREATE TABLE borrowings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) NOT NULL,
    collection_id UUID REFERENCES collections(id) NOT NULL,
    borrow_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP NOT NULL,
    return_date TIMESTAMP,
    status ENUM('dipinjam', 'dikembalikan', 'terlambat') DEFAULT 'dipinjam',
    fine_amount DECIMAL(10,2) DEFAULT 0,
    fine_paid BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) NOT NULL,
    collection_id UUID REFERENCES collections(id) NOT NULL,
    reservation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('menunggu', 'tersedia', 'dibatalkan', 'selesai') DEFAULT 'menunggu',
    queue_position INTEGER,
    notified_at TIMESTAMP
);

-- ==========================================
-- MODUL KNOWLEDGE MANAGEMENT
-- ==========================================

CREATE TABLE knowledges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    content TEXT,
    summary TEXT,
    type ENUM('artikel', 'sop', 'panduan', 'lesson_learned', 'best_practice') NOT NULL,
    file_url TEXT,
    file_type VARCHAR(50),
    dublin_core_metadata JSONB,
    status ENUM('draft', 'submitted', 'approved', 'rejected', 'published') DEFAULT 'draft',
    rejection_feedback TEXT,
    views_count INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    category_id UUID REFERENCES categories(id),
    submitted_by UUID REFERENCES users(id),
    reviewed_by UUID REFERENCES users(id),
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE knowledge_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    knowledge_id UUID REFERENCES knowledges(id) ON DELETE CASCADE,
    tag VARCHAR(100) NOT NULL
);

CREATE TABLE ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    knowledge_id UUID REFERENCES knowledges(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    review TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(knowledge_id, user_id)
);

-- ==========================================
-- MODUL BUKU TAMU
-- ==========================================

CREATE TABLE guest_book (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) NOT NULL,
    visit_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    purpose ENUM('pinjam_buku', 'baca_di_tempat', 'riset', 'meeting', 'lainnya') NOT NULL,
    purpose_note TEXT,
    check_out_time TIMESTAMP
);

-- ==========================================
-- MODUL UMUM
-- ==========================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'warning', 'success', 'error') DEFAULT 'info',
    channel ENUM('in_app', 'email', 'both') DEFAULT 'in_app',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE system_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 9. 🔌 Struktur API (REST API Endpoints)

### 9.1 Autentikasi

| Method | Endpoint | Deskripsi | Auth |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Registrasi pengguna baru | ❌ |
| POST | `/api/auth/login` | Login | ❌ |
| POST | `/api/auth/logout` | Logout | ✅ |
| GET | `/api/auth/me` | Profil pengguna saat ini | ✅ |
| PUT | `/api/auth/profile` | Update profil | ✅ |

### 9.2 Koleksi Perpustakaan

| Method | Endpoint | Deskripsi | Auth |
| --- | --- | --- | --- |
| GET | `/api/collections` | Daftar koleksi (OPAC) | ❌ |
| GET | `/api/collections/:id` | Detail koleksi | ❌ |
| POST | `/api/collections` | Tambah koleksi baru | ✅ Pustakawan |
| PUT | `/api/collections/:id` | Update koleksi | ✅ Pustakawan |
| DELETE | `/api/collections/:id` | Hapus koleksi | ✅ Pustakawan |
| GET | `/api/collections/search` | Pencarian OPAC (Meilisearch) | ❌ |
| POST | `/api/collections/isbn-lookup` | Auto-lookup ISBN | ✅ Pustakawan |
| POST | `/api/collections/import-marc21` | Import data MARC21 | ✅ Pustakawan |
| GET | `/api/collections/export-marc21` | Export data MARC21 | ✅ Pustakawan |
| POST | `/api/collections/:id/barcode` | Generate barcode/QR | ✅ Pustakawan |

### 9.3 Sirkulasi

| Method | Endpoint | Deskripsi | Auth |
| --- | --- | --- | --- |
| POST | `/api/borrowings` | Pinjam buku | ✅ Pembaca |
| PUT | `/api/borrowings/:id/return` | Kembalikan buku | ✅ Pustakawan |
| GET | `/api/borrowings/my` | Riwayat peminjaman saya | ✅ |
| GET | `/api/borrowings` | Semua peminjaman | ✅ Pustakawan |
| POST | `/api/reservations` | Reservasi buku | ✅ Pembaca |
| GET | `/api/reservations/my` | Reservasi saya | ✅ |
| DELETE | `/api/reservations/:id` | Batalkan reservasi | ✅ |

### 9.4 Knowledge Management

| Method | Endpoint | Deskripsi | Auth |
| --- | --- | --- | --- |
| GET | `/api/knowledges` | Daftar knowledge (publik) | ❌ |
| GET | `/api/knowledges/:id` | Detail knowledge | ❌ |
| POST | `/api/knowledges` | Upload knowledge baru | ✅ Kontributor |
| PUT | `/api/knowledges/:id` | Update knowledge | ✅ Kontributor |
| PUT | `/api/knowledges/:id/review` | Approve/Reject | ✅ Pustakawan |
| GET | `/api/knowledges/search` | Pencarian full-text | ❌ |
| POST | `/api/knowledges/:id/rating` | Beri rating & review | ✅ |
| GET | `/api/knowledges/:id/ratings` | Daftar rating & review | ❌ |

### 9.5 Buku Tamu

| Method | Endpoint | Deskripsi | Auth |
| --- | --- | --- | --- |
| POST | `/api/guest-book/check-in` | Check-in pengunjung | ✅ |
| PUT | `/api/guest-book/:id/check-out` | Check-out pengunjung | ✅ |
| GET | `/api/guest-book` | Daftar kunjungan | ✅ Pustakawan |
| GET | `/api/guest-book/stats` | Statistik kunjungan | ✅ Pustakawan |

### 9.6 Pengguna & Sistem

| Method | Endpoint | Deskripsi | Auth |
| --- | --- | --- | --- |
| GET | `/api/users` | Daftar pengguna | ✅ Super Admin |
| POST | `/api/users` | Tambah pengguna | ✅ Super Admin |
| PUT | `/api/users/:id` | Update pengguna | ✅ Super Admin |
| DELETE | `/api/users/:id` | Hapus pengguna | ✅ Super Admin |
| GET | `/api/notifications` | Notifikasi saya | ✅ |
| PUT | `/api/notifications/:id/read` | Tandai sudah dibaca | ✅ |
| GET | `/api/audit-logs` | Audit log | ✅ Super Admin |
| GET | `/api/dashboard/stats` | Statistik dashboard | ✅ |
| GET | `/api/reports/:type` | Generate laporan | ✅ Pustakawan |

---

## 10. 📁 Struktur Folder Proyek

```
pustakaplus/
├── docker-compose.yml
├── .env.example
├── README.md
│
├── frontend/                          # Next.js Frontend
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── Dockerfile
│   ├── public/
│   │   ├── images/
│   │   └── favicon.ico
│   └── src/
│       ├── app/                       # Next.js App Router
│       │   ├── (public)/              # Halaman publik (tanpa login)
│       │   │   ├── page.tsx           # Homepage / OPAC
│       │   │   ├── catalog/
│       │   │   │   ├── page.tsx       # Pencarian katalog
│       │   │   │   └── [id]/page.tsx  # Detail koleksi
│       │   │   └── knowledge/
│       │   │       ├── page.tsx       # Knowledge Base
│       │   │       └── [id]/page.tsx  # Detail knowledge
│       │   ├── (auth)/                # Halaman autentikasi
│       │   │   ├── login/page.tsx
│       │   │   └── register/page.tsx
│       │   ├── (dashboard)/           # Halaman dashboard (perlu login)
│       │   │   ├── layout.tsx         # Layout dengan sidebar
│       │   │   ├── dashboard/page.tsx
│       │   │   ├── collections/
│       │   │   ├── borrowings/
│       │   │   ├── reservations/
│       │   │   ├── knowledges/
│       │   │   ├── guest-book/
│       │   │   ├── users/
│       │   │   ├── reports/
│       │   │   ├── audit-logs/
│       │   │   ├── notifications/
│       │   │   └── settings/
│       │   └── layout.tsx
│       ├── components/
│       │   ├── ui/                    # shadcn/ui components
│       │   ├── layout/
│       │   │   ├── Navbar.tsx
│       │   │   ├── Sidebar.tsx
│       │   │   ├── Footer.tsx
│       │   │   └── HeroBanner.tsx
│       │   ├── catalog/
│       │   │   ├── SearchBar.tsx
│       │   │   ├── CollectionCard.tsx
│       │   │   ├── CollectionCarousel.tsx
│       │   │   └── CollectionDetail.tsx
│       │   ├── knowledge/
│       │   │   ├── KnowledgeCard.tsx
│       │   │   ├── RatingStars.tsx
│       │   │   └── ReviewForm.tsx
│       │   ├── dashboard/
│       │   │   ├── StatsCard.tsx
│       │   │   ├── ChartWidget.tsx
│       │   │   └── DataTable.tsx
│       │   └── common/
│       │       ├── BarcodeScanner.tsx
│       │       ├── FileUpload.tsx
│       │       └── NotificationBell.tsx
│       ├── lib/
│       │   ├── api.ts                 # API client
│       │   ├── auth.ts                # NextAuth config
│       │   └── utils.ts
│       ├── hooks/
│       └── types/
│
├── backend/                           # Express.js Backend
│   ├── package.json
│   ├── Dockerfile
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts                   # Entry point
│       ├── config/
│       │   ├── database.ts
│       │   ├── meilisearch.ts
│       │   ├── minio.ts
│       │   └── email.ts
│       ├── middleware/
│       │   ├── auth.ts
│       │   ├── roleGuard.ts
│       │   ├── rateLimiter.ts
│       │   ├── validator.ts
│       │   └── errorHandler.ts
│       ├── routes/
│       │   ├── auth.routes.ts
│       │   ├── collection.routes.ts
│       │   ├── borrowing.routes.ts
│       │   ├── reservation.routes.ts
│       │   ├── knowledge.routes.ts
│       │   ├── guestBook.routes.ts
│       │   ├── user.routes.ts
│       │   ├── notification.routes.ts
│       │   ├── report.routes.ts
│       │   └── dashboard.routes.ts
│       ├── controllers/
│       │   ├── auth.controller.ts
│       │   ├── collection.controller.ts
│       │   ├── borrowing.controller.ts
│       │   ├── reservation.controller.ts
│       │   ├── knowledge.controller.ts
│       │   ├── guestBook.controller.ts
│       │   ├── user.controller.ts
│       │   ├── notification.controller.ts
│       │   ├── report.controller.ts
│       │   └── dashboard.controller.ts
│       ├── services/
│       │   ├── auth.service.ts
│       │   ├── collection.service.ts
│       │   ├── borrowing.service.ts
│       │   ├── reservation.service.ts
│       │   ├── knowledge.service.ts
│       │   ├── guestBook.service.ts
│       │   ├── search.service.ts
│       │   ├── storage.service.ts
│       │   ├── barcode.service.ts
│       │   ├── isbn.service.ts
│       │   ├── marc21.service.ts
│       │   ├── notification.service.ts
│       │   ├── email.service.ts
│       │   └── report.service.ts
│       ├── prisma/
│       │   ├── schema.prisma
│       │   └── seed.ts
│       └── utils/
│           ├── logger.ts
│           └── helpers.ts
│
└── docs/
    ├── API.md                         # Dokumentasi API (Swagger/OpenAPI)
    ├── DEPLOYMENT.md                  # Panduan deployment
    └── USER_GUIDE.md                  # Panduan pengguna
```

---

## 11. 🐳 Docker Compose Configuration

```yaml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:4000/api
    depends_on:
      - backend
    restart: unless-stopped

  backend:
    build: ./backend
    ports:
      - "4000:4000"
    environment:
      - DATABASE_URL=postgresql://pustakaplus:password@postgres:5432/pustakaplus
      - MEILISEARCH_HOST=http://meilisearch:7700
      - MEILISEARCH_API_KEY=masterKey
      - MINIO_ENDPOINT=minio
      - MINIO_PORT=9000
      - MINIO_ACCESS_KEY=minioadmin
      - MINIO_SECRET_KEY=minioadmin
      - JWT_SECRET=your-secret-key
    depends_on:
      - postgres
      - meilisearch
      - minio
    restart: unless-stopped

  postgres:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_DB=pustakaplus
      - POSTGRES_USER=pustakaplus
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  meilisearch:
    image: getmeili/meilisearch:latest
    ports:
      - "7700:7700"
    environment:
      - MEILI_MASTER_KEY=masterKey
    volumes:
      - meilisearch_data:/meili_data
    restart: unless-stopped

  minio:
    image: minio/minio:latest
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      - MINIO_ROOT_USER=minioadmin
      - MINIO_ROOT_PASSWORD=minioadmin
    command: server /data --console-address ":9001"
    volumes:
      - minio_data:/data
    restart: unless-stopped

volumes:
  postgres_data:
  meilisearch_data:
  minio_data:
```

---

## 12. 🔒 Keamanan

- **Rate Limiting** — Batasi jumlah request per IP untuk mencegah abuse
- **Input Validation** — Validasi semua input menggunakan Zod/Joi
- **CSRF Protection** — Token CSRF untuk form submission
- **Helmet.js** — HTTP security headers
- **Enkripsi Password** — bcrypt dengan salt rounds yang aman
- **CORS** — Konfigurasi CORS yang ketat untuk production
- **SQL Injection Prevention** — Prisma ORM secara default mencegah SQL injection
- **XSS Protection** — Sanitize semua output HTML
- **HTTPS** — Wajib untuk production (on-premise)

---

## 13. 🌐 Fitur Tambahan (Best Practice)

### 13.1 SEO Optimization

- Meta tags dinamis untuk halaman OPAC dan Knowledge
- Sitemap otomatis
- Structured data (JSON-LD) untuk koleksi perpustakaan
- Open Graph tags untuk sharing di media sosial

### 13.2 Multi-bahasa (i18n)

- Bahasa Indonesia (default)
- Bahasa Inggris
- Menggunakan `next-intl` atau `next-i18next`

### 13.3 Aksesibilitas (a11y)

- Sesuai standar **WCAG 2.1 Level AA**
- Keyboard navigation
- Screen reader friendly
- Kontras warna yang memadai
- Alt text untuk semua gambar

### 13.4 Backup & Recovery

- Backup otomatis PostgreSQL (daily/weekly)
- Backup MinIO storage
- Strategi restore yang terdokumentasi
- Retention policy untuk backup

### 13.5 API Documentation

- **Swagger/OpenAPI 3.0** untuk dokumentasi API interaktif
- Tersedia di endpoint `/api/docs`
- Contoh request/response untuk setiap endpoint

---

## 14. 🚀 Deployment Strategy

| Tahap | Lingkungan | Detail |
| --- | --- | --- |
| 🛠️ **Development** | Lokal ([localhost](http://localhost)) | `docker-compose up` untuk menjalankan seluruh stack |
| 🚀 **Production** | On-Premise (server internal) | Docker containers di server instansi, HTTPS via reverse proxy (Nginx) |

### 14.1 Quick Start (Development)

```bash
# Clone repository
git clone https://github.com/your-org/pustakaplus.git
cd pustakaplus

# Copy environment file
cp .env.example .env

# Start semua services
docker-compose up -d

# Jalankan migrasi database
cd backend && npx prisma migrate dev

# Seed data awal
npx prisma db seed

# Akses aplikasi
# Frontend: http://localhost:3000
# Backend API: http://localhost:4000/api
# Meilisearch: http://localhost:7700
# MinIO Console: http://localhost:9001
```

---

*© 2026 PustakaPlus. All rights reserved.*

---

Mohon buat ini sebagai aplikasi yang lengkap dan siap produksi. Implementasikan semua fitur, dan pastikan semuanya berfungsi dengan lancar. Fokuslah untuk menciptakan sesuatu yang terlihat profesional dan yang benar-benar dapat saya gunakan.