import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create demo users
  const hashedPassword = await bcrypt.hash('password123', 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@pustakaplus.id' },
    update: {},
    create: {
      name: 'Super Administrator',
      email: 'superadmin@pustakaplus.id',
      passwordHash: hashedPassword,
      role: 'super_admin',
      unitKerja: 'IT & Sistem',
      isActive: true,
    },
  });

  const pustakawan = await prisma.user.upsert({
    where: { email: 'pustakawan@pustakaplus.id' },
    update: {},
    create: {
      name: 'Budi Santoso',
      email: 'pustakawan@pustakaplus.id',
      passwordHash: hashedPassword,
      role: 'pustakawan',
      unitKerja: 'Perpustakaan',
      isActive: true,
    },
  });

  const kontributor = await prisma.user.upsert({
    where: { email: 'kontributor@pustakaplus.id' },
    update: {},
    create: {
      name: 'Siti Rahayu',
      email: 'kontributor@pustakaplus.id',
      passwordHash: hashedPassword,
      role: 'kontributor',
      unitKerja: 'Penelitian & Pengembangan',
      isActive: true,
    },
  });

  const pembaca = await prisma.user.upsert({
    where: { email: 'pembaca@pustakaplus.id' },
    update: {},
    create: {
      name: 'Ahmad Fauzi',
      email: 'pembaca@pustakaplus.id',
      passwordHash: hashedPassword,
      role: 'pembaca',
      unitKerja: 'Administrasi Umum',
      isActive: true,
    },
  });

  console.log('Users created:', { superAdmin: superAdmin.email, pustakawan: pustakawan.email });

  // Create categories
  const catBuku = await prisma.category.upsert({
    where: { slug: 'teknologi' },
    update: {},
    create: { name: 'Teknologi', slug: 'teknologi', type: 'perpustakaan' },
  });

  const catManajemen = await prisma.category.upsert({
    where: { slug: 'manajemen' },
    update: {},
    create: { name: 'Manajemen', slug: 'manajemen', type: 'perpustakaan' },
  });

  const catHukum = await prisma.category.upsert({
    where: { slug: 'hukum' },
    update: {},
    create: { name: 'Hukum & Regulasi', slug: 'hukum', type: 'perpustakaan' },
  });

  const catKmArtikel = await prisma.category.upsert({
    where: { slug: 'km-artikel' },
    update: {},
    create: { name: 'Artikel & Kajian', slug: 'km-artikel', type: 'knowledge' },
  });

  const catKmSop = await prisma.category.upsert({
    where: { slug: 'km-sop' },
    update: {},
    create: { name: 'SOP & Prosedur', slug: 'km-sop', type: 'knowledge' },
  });

  console.log('Categories created.');

  // Create demo collections
  const collections = [
    {
      title: 'Pemrograman Python untuk Pemula',
      author: 'Dr. Bambang Wijaya',
      publisher: 'Penerbit Akademi',
      publishYear: 2023,
      isbn: '978-602-12345-01-1',
      format: 'buku' as const,
      description: 'Panduan lengkap belajar pemrograman Python dari dasar hingga mahir.',
      totalCopies: 5,
      availableCopies: 4,
      isFeatured: true,
      categoryId: catBuku.id,
      barcode: 'PKP-2024-001',
      createdBy: pustakawan.id,
      tags: ['python', 'programming', 'pemula'],
    },
    {
      title: 'Manajemen Proyek Modern',
      author: 'Prof. Dewi Kusuma',
      publisher: 'Gramedia Pustaka',
      publishYear: 2022,
      isbn: '978-602-12345-02-2',
      format: 'buku' as const,
      description: 'Metodologi manajemen proyek terkini menggunakan pendekatan agile dan hybrid.',
      totalCopies: 3,
      availableCopies: 3,
      isFeatured: true,
      categoryId: catManajemen.id,
      barcode: 'PKP-2024-002',
      createdBy: pustakawan.id,
      tags: ['manajemen', 'proyek', 'agile'],
    },
    {
      title: 'Hukum Administrasi Negara',
      author: 'Dr. Raden Sukarno',
      publisher: 'Badan Penerbit Hukum',
      publishYear: 2021,
      isbn: '978-602-12345-03-3',
      format: 'buku' as const,
      description: 'Kajian komprehensif hukum administrasi negara Indonesia.',
      totalCopies: 2,
      availableCopies: 2,
      categoryId: catHukum.id,
      barcode: 'PKP-2024-003',
      createdBy: pustakawan.id,
      tags: ['hukum', 'administrasi', 'negara'],
    },
    {
      title: 'Jurnal Teknologi Informasi Vol. 5',
      author: 'Tim Redaksi',
      publisher: 'Lembaga Riset Teknologi',
      publishYear: 2024,
      issn: '2301-1234',
      format: 'jurnal' as const,
      description: 'Kumpulan paper penelitian bidang teknologi informasi.',
      totalCopies: 10,
      availableCopies: 10,
      isFeatured: true,
      categoryId: catBuku.id,
      barcode: 'PKP-2024-004',
      createdBy: pustakawan.id,
      tags: ['jurnal', 'IT', 'penelitian'],
    },
    {
      title: 'E-book: Data Science dengan R',
      author: 'Dr. Maya Sari',
      publisher: 'Digital Learning Center',
      publishYear: 2023,
      format: 'ebook' as const,
      description: 'Panduan praktis analisis data menggunakan bahasa R.',
      totalCopies: 999,
      availableCopies: 999,
      isFeatured: true,
      categoryId: catBuku.id,
      barcode: 'PKP-2024-005',
      createdBy: pustakawan.id,
      tags: ['data science', 'R', 'analisis'],
    },
  ];

  for (const col of collections) {
    const { tags, ...colData } = col;
    await prisma.collection.upsert({
      where: { barcode: colData.barcode },
      update: {},
      create: {
        ...colData,
        tags: { create: tags.map(tag => ({ tag })) },
      },
    });
  }

  console.log('Collections created.');

  // Create demo knowledge items
  const knowledgeItems = [
    {
      title: 'Best Practice Pengelolaan Arsip Digital',
      content: 'Panduan lengkap mengenai best practice dalam mengelola arsip digital di instansi pemerintah...',
      summary: 'Panduan best practice arsip digital untuk instansi pemerintah sesuai regulasi.',
      type: 'best_practice' as const,
      status: 'published' as const,
      submittedBy: kontributor.id,
      reviewedBy: pustakawan.id,
      publishedAt: new Date(),
      categoryId: catKmArtikel.id,
      viewsCount: 150,
      averageRating: 4.5,
      tags: ['arsip', 'digital', 'pemerintah'],
    },
    {
      title: 'SOP Peminjaman Buku Perpustakaan',
      content: 'Standar Operasional Prosedur peminjaman buku perpustakaan instansi...',
      summary: 'SOP lengkap alur peminjaman dan pengembalian buku.',
      type: 'sop' as const,
      status: 'published' as const,
      submittedBy: pustakawan.id,
      reviewedBy: superAdmin.id,
      publishedAt: new Date(),
      categoryId: catKmSop.id,
      viewsCount: 89,
      averageRating: 4.0,
      tags: ['SOP', 'peminjaman', 'perpustakaan'],
    },
    {
      title: 'Lesson Learned: Implementasi Sistem ERP',
      content: 'Pengalaman dan pelajaran berharga dalam implementasi sistem ERP di lingkungan pemerintahan...',
      summary: 'Pelajaran penting dari implementasi ERP di instansi.',
      type: 'lesson_learned' as const,
      status: 'published' as const,
      submittedBy: kontributor.id,
      reviewedBy: pustakawan.id,
      publishedAt: new Date(),
      categoryId: catKmArtikel.id,
      viewsCount: 220,
      averageRating: 4.8,
      tags: ['ERP', 'implementasi', 'lesson learned'],
    },
    {
      title: 'Panduan Penggunaan Aplikasi SIPD',
      content: 'Panduan teknis penggunaan Sistem Informasi Pemerintahan Daerah (SIPD)...',
      summary: 'Panduan teknis SIPD untuk pengguna.',
      type: 'panduan' as const,
      status: 'draft' as const,
      submittedBy: kontributor.id,
      categoryId: catKmSop.id,
      tags: ['SIPD', 'panduan', 'teknis'],
    },
  ];

  for (const km of knowledgeItems) {
    const { tags, ...kmData } = km;
    const existing = await prisma.knowledge.findFirst({ where: { title: km.title } });
    if (!existing) {
      await prisma.knowledge.create({
        data: {
          ...kmData,
          tags: { create: tags.map(tag => ({ tag })) },
        },
      });
    }
  }

  console.log('Knowledge items created.');

  // Create system configs
  const configs = [
    { key: 'borrow_duration_days', value: '14', description: 'Durasi peminjaman default (hari)' },
    { key: 'max_borrow_per_user', value: '3', description: 'Maksimal peminjaman per pengguna' },
    { key: 'fine_per_day', value: '1000', description: 'Denda per hari keterlambatan (Rp)' },
    { key: 'library_name', value: 'PustakaPlus', description: 'Nama perpustakaan' },
    { key: 'library_address', value: 'Jl. Merdeka No. 1, Jakarta', description: 'Alamat perpustakaan' },
    { key: 'library_email', value: 'pustaka@instansi.go.id', description: 'Email perpustakaan' },
    { key: 'library_phone', value: '021-1234567', description: 'Nomor telepon perpustakaan' },
  ];

  for (const config of configs) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: {},
      create: { ...config, updatedBy: superAdmin.id },
    });
  }

  console.log('System configs created.');
  console.log('\n=== Seed selesai! ===');
  console.log('Demo accounts:');
  console.log('  super_admin : superadmin@pustakaplus.id / password123');
  console.log('  pustakawan  : pustakawan@pustakaplus.id / password123');
  console.log('  kontributor : kontributor@pustakaplus.id / password123');
  console.log('  pembaca     : pembaca@pustakaplus.id / password123');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
