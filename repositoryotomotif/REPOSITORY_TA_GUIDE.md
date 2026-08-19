# Panduan Membangun Digital Repository Tugas Akhir

Dokumen ini adalah panduan kerja untuk project `repositoryotomotif`.
Ikuti dari atas ke bawah. Jangan menyalin semua tahap sekaligus karena setiap tahap perlu diuji sebelum masuk ke tahap berikutnya.

## 1. Target Produk

Versi pertama website adalah Digital Repository Tugas Akhir berbasis metadata.

Fokus V1:

- Beranda repository
- Daftar dan pencarian tugas akhir
- Detail tugas akhir
- Author/mahasiswa
- Dosen dan pembimbing
- Program studi
- Upload file PDF
- Status verifikasi
- Dashboard admin sederhana
- Statistik repository

SDGs belum dibuat pada V1. SDGs ditambahkan pada V2 setelah alur repository stabil.

Alur utama:

```text
Mahasiswa -> Upload metadata + PDF -> Pending
Admin -> Verifikasi -> Approved/Rejected
Publik -> Melihat TA yang Published -> Search/Filter -> Detail/Download
```

## 2. Teknologi Project

Project menggunakan:

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Prisma 7
- MySQL/MariaDB dari XAMPP

Perintah dasar:

```powershell
npm install
npm run dev
npm run lint
npx prisma generate
npx prisma migrate dev --name nama_migration
```

Buka project melalui alamat yang dipakai server. Untuk akses dari perangkat lain di jaringan, jalankan:

```powershell
npm run dev -- --hostname 0.0.0.0
```

Kemudian buka:

```text
http://10.71.161.64:3000
```

Jika memakai alamat IP, pastikan `next.config.ts` memuat:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["10.71.161.64"],
};

export default nextConfig;
```

## 3. Aturan Visual

Arah desain yang digunakan:

- Putih hangat, biru navy, biru muda, dan aksen amber
- Ruang kosong cukup luas
- Border tipis, bayangan lembut
- Radius komponen kecil sampai sedang, maksimal 12px
- Judul tegas tetapi tidak terlalu besar
- Kartu hanya untuk item berulang, bukan membungkus seluruh halaman
- Gunakan ikon dari `lucide-react` jika sudah dipasang
- Hindari warna ungu dominan dan gradient berlebihan
- Semua halaman harus nyaman dibaca di mobile

Palet dasar:

```css
:root {
  --ink: #17324d;
  --muted: #65758b;
  --line: #dbe5ee;
  --paper: #ffffff;
  --soft: #f4f8fb;
  --blue: #1456a0;
  --blue-soft: #eaf3ff;
  --amber: #d99616;
  --success: #23845b;
}
```

## 4. Struktur Folder Target

Tambahkan struktur berikut secara bertahap:

```text
app/
  page.tsx                         # Beranda
  globals.css                      # Token warna dan style global
  layout.tsx
  repository/page.tsx              # Daftar TA + filter
  repository/[id]/page.tsx         # Detail TA
  authors/page.tsx                 # Direktori mahasiswa
  authors/[id]/page.tsx            # Profil mahasiswa
  lecturers/page.tsx               # Direktori dosen
  lecturers/[id]/page.tsx          # Profil dosen
  statistics/page.tsx              # Statistik repository
  about/page.tsx                   # Tentang repository
  submit/page.tsx                  # Form upload TA
  dashboard/page.tsx               # Dashboard pengguna
  admin/submissions/page.tsx       # Verifikasi admin
  api/theses/route.ts              # GET dan POST TA
  api/theses/[id]/route.ts         # GET, PUT, DELETE TA
  api/lecturers/route.ts
  api/students/route.ts
  api/statistics/route.ts
components/
  navbar.tsx
  footer.tsx
  thesis-card.tsx
  search-form.tsx
  filter-bar.tsx
  stat-card.tsx
  status-badge.tsx
lib/
  prisma.ts
  thesis-status.ts
prisma/
  schema.prisma
public/
  uploads/                         # Jangan commit file upload besar
```

## 5. Tahap 0 - Pastikan Fondasi Berjalan

### 5.1 `.env`

Lokasi: `.env` di root project.

Untuk XAMPP dengan user root tanpa password:

```env
DATABASE_URL="mysql://root:@localhost:3306/repository_otomotif"
```

Jika MySQL memakai password:

```env
DATABASE_URL="mysql://root:PASSWORD@localhost:3306/repository_otomotif"
```

Jangan memasukkan `.env` ke Git.

### 5.2 Prisma client

Lokasi: `lib/prisma.ts`.

Gunakan isi berikut:

```ts
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const databaseUrl = new URL(process.env.DATABASE_URL!);

const adapter = new PrismaMariaDb({
  host: databaseUrl.hostname,
  port: Number(databaseUrl.port),
  user: databaseUrl.username,
  password: databaseUrl.password,
  database: databaseUrl.pathname.slice(1),
});

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

Tes koneksi:

```powershell
npx prisma migrate status
```

Jika perintah gagal, periksa XAMPP, nama database, port, user, password, dan `DATABASE_URL`.

## 6. Tahap 1 - Database Repository

Lokasi: `prisma/schema.prisma`.

Ganti model sederhana secara bertahap dengan schema inti berikut. Model `User` tetap dipertahankan untuk login dan kepemilikan data.

```prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "mysql"
}

enum UserRole {
  ADMIN
  STUDENT
  LECTURER
}

enum ThesisStatus {
  DRAFT
  PENDING
  APPROVED
  PUBLISHED
  REJECTED
}

model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  password  String?
  role      UserRole @default(STUDENT)
  student   Student?
  lecturer  Lecturer?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model StudyProgram {
  id          Int        @id @default(autoincrement())
  name        String
  code        String     @unique
  students    Student[]
  theses      Thesis[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

model Student {
  id            Int          @id @default(autoincrement())
  userId        Int          @unique
  nim           String       @unique
  user          User         @relation(fields: [userId], references: [id])
  studyProgramId Int
  studyProgram  StudyProgram @relation(fields: [studyProgramId], references: [id])
  theses        Thesis[]
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
}

model Lecturer {
  id           Int              @id @default(autoincrement())
  userId       Int              @unique
  nip          String?          @unique
  department   String?
  user         User             @relation(fields: [userId], references: [id])
  supervisions ThesisSupervisor[]
  createdAt    DateTime         @default(now())
  updatedAt    DateTime         @updatedAt
}

model Thesis {
  id          Int              @id @default(autoincrement())
  title       String
  slug        String           @unique
  abstract    String           @db.Text
  year        Int
  documentType String          @default("TUGAS_AKHIR")
  status      ThesisStatus     @default(DRAFT)
  rejectionNote String?
  studentId   Int
  studyProgramId Int
  student     Student          @relation(fields: [studentId], references: [id])
  studyProgram StudyProgram    @relation(fields: [studyProgramId], references: [id])
  supervisors ThesisSupervisor[]
  keywords    ThesisKeyword[]
  files       ThesisFile[]
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt

  @@index([title])
  @@index([year])
  @@index([status])
  @@index([studyProgramId])
}

model ThesisSupervisor {
  thesisId   Int
  lecturerId Int
  isPrimary  Boolean  @default(false)
  thesis     Thesis   @relation(fields: [thesisId], references: [id], onDelete: Cascade)
  lecturer   Lecturer @relation(fields: [lecturerId], references: [id])

  @@id([thesisId, lecturerId])
}

model Keyword {
  id      Int             @id @default(autoincrement())
  name    String          @unique
  theses  ThesisKeyword[]
}

model ThesisKeyword {
  thesisId  Int
  keywordId Int
  thesis    Thesis  @relation(fields: [thesisId], references: [id], onDelete: Cascade)
  keyword   Keyword @relation(fields: [keywordId], references: [id], onDelete: Cascade)

  @@id([thesisId, keywordId])
}

model ThesisFile {
  id        Int      @id @default(autoincrement())
  thesisId  Int
  fileName  String
  filePath  String
  mimeType  String
  fileSize  Int
  thesis    Thesis   @relation(fields: [thesisId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
}
```

Jalankan:

```powershell
npx prisma format
npx prisma migrate dev --name add_repository_core
npx prisma generate
```

Catatan: schema besar di atas akan mengubah database. Backup database terlebih dahulu.

## 7. Tahap 2 - Komponen Navigasi

Lokasi: `components/navbar.tsx`.

```tsx
import Link from "next/link";

const links = [
  ["Beranda", "/"],
  ["Repository", "/repository"],
  ["Dosen", "/lecturers"],
  ["Statistik", "/statistics"],
  ["Tentang", "/about"],
] as const;

export function Navbar() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="brand">
          <span className="brand-mark">R</span>
          <span>
            <strong>Repository TA</strong>
            <small>Digital Academic Archive</small>
          </span>
        </Link>
        <nav className="main-nav" aria-label="Navigasi utama">
          {links.map(([label, href]) => (
            <Link href={href} key={href}>{label}</Link>
          ))}
        </nav>
        <Link href="/login" className="login-button">Masuk</Link>
      </div>
    </header>
  );
}
```

Lokasi: `app/layout.tsx`. Tambahkan `<Navbar />` dan `<Footer />` di sekitar `children`.

```tsx
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

<body>
  <Navbar />
  <main>{children}</main>
  <Footer />
</body>
```

## 8. Tahap 3 - Style Soft dan Bersih

Lokasi: `app/globals.css`.

Pertahankan `@import "tailwindcss";`, lalu tambahkan token berikut. Sesuaikan class komponen dengan token ini.

```css
:root {
  --background: #f6f9fc;
  --foreground: #17324d;
  --ink: #17324d;
  --muted: #65758b;
  --line: #dbe5ee;
  --paper: #ffffff;
  --soft: #eef5fa;
  --blue: #1456a0;
  --blue-soft: #eaf3ff;
  --amber: #d99616;
}

* { box-sizing: border-box; }
body {
  margin: 0;
  background: var(--background);
  color: var(--foreground);
  font-family: Arial, Helvetica, sans-serif;
}
.site-header {
  position: sticky;
  top: 0;
  z-index: 20;
  border-bottom: 1px solid var(--line);
  background: rgba(255,255,255,.94);
  backdrop-filter: blur(12px);
}
.site-header-inner {
  display: flex;
  min-height: 76px;
  max-width: 1180px;
  align-items: center;
  gap: 28px;
  margin: auto;
  padding: 0 24px;
}
.brand { display: flex; align-items: center; gap: 10px; color: var(--ink); text-decoration: none; }
.brand-mark { display: grid; width: 38px; height: 38px; place-items: center; border-radius: 10px; background: var(--blue); color: white; font-weight: 800; }
.brand strong, .brand small { display: block; }
.brand small { margin-top: 3px; color: var(--muted); font-size: 11px; }
.main-nav { display: flex; flex: 1; justify-content: center; gap: 24px; }
.main-nav a { color: var(--muted); font-size: 14px; text-decoration: none; }
.main-nav a:hover { color: var(--blue); }
.login-button { border-radius: 8px; background: var(--blue); padding: 11px 18px; color: white; text-decoration: none; font-weight: 700; }
@media (max-width: 760px) {
  .site-header-inner { flex-wrap: wrap; padding-block: 14px; }
  .main-nav { order: 3; width: 100%; justify-content: flex-start; gap: 14px; overflow-x: auto; }
  .main-nav a { white-space: nowrap; }
}
```

## 9. Tahap 4 - API Daftar TA

Lokasi: `app/api/theses/route.ts`.

```ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();
  const year = Number(searchParams.get("year"));

  const theses = await prisma.thesis.findMany({
    where: {
      status: "PUBLISHED",
      ...(query ? { title: { contains: query } } : {}),
      ...(Number.isInteger(year) && year > 0 ? { year } : {}),
    },
    include: {
      student: { include: { user: true } },
      studyProgram: true,
      supervisors: { include: { lecturer: { include: { user: true } } } },
      keywords: { include: { keyword: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(theses);
}
```

Untuk tahap awal, API dapat dibuat publik hanya untuk status `PUBLISHED`. API admin dan upload dibuat setelah autentikasi selesai.

## 10. Tahap 5 - Halaman Repository

Lokasi: `app/repository/page.tsx`.

```tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function RepositoryPage() {
  const theses = await prisma.thesis.findMany({
    where: { status: "PUBLISHED" },
    include: {
      student: { include: { user: true } },
      studyProgram: true,
      keywords: { include: { keyword: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-10 max-w-2xl">
        <p className="mb-3 text-sm font-bold uppercase tracking-wider text-blue-700">Koleksi akademik</p>
        <h1 className="text-4xl font-bold text-slate-900">Repository Tugas Akhir</h1>
        <p className="mt-4 text-slate-500">Temukan penelitian mahasiswa berdasarkan judul, tahun, program studi, dan topik.</p>
      </div>
      <form className="mb-8 flex gap-3" action="/repository">
        <input name="q" placeholder="Cari judul, author, atau keyword..." className="min-h-12 flex-1 rounded-lg border border-slate-200 bg-white px-4 outline-none focus:border-blue-500" />
        <button className="rounded-lg bg-blue-700 px-5 font-bold text-white">Cari</button>
      </form>
      <div className="grid gap-5 md:grid-cols-2">
        {theses.map((thesis) => (
          <article key={thesis.id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-blue-700">{thesis.studyProgram.name} - {thesis.year}</p>
            <h2 className="mt-3 text-xl font-bold text-slate-900">{thesis.title}</h2>
            <p className="mt-3 text-sm text-slate-500">{thesis.student.user.name}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {thesis.keywords.map(({ keyword }) => <span key={keyword.id} className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700">#{keyword.name}</span>)}
            </div>
            <Link href={`/repository/${thesis.id}`} className="mt-6 inline-block font-bold text-blue-700">Lihat detail -&gt;</Link>
          </article>
        ))}
      </div>
    </section>
  );
}
```

## 11. Tahap 6 - Detail TA

Lokasi: `app/repository/[id]/page.tsx`.

```tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function ThesisDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const thesis = await prisma.thesis.findUnique({
    where: { id: Number(id), status: "PUBLISHED" },
    include: {
      student: { include: { user: true } },
      studyProgram: true,
      supervisors: { include: { lecturer: { include: { user: true } } } },
      keywords: { include: { keyword: true } },
      files: true,
    },
  });
  if (!thesis) notFound();

  return (
    <article className="mx-auto max-w-4xl px-6 py-16">
      <p className="text-sm font-bold text-blue-700">{thesis.studyProgram.name} - {thesis.year}</p>
      <h1 className="mt-4 text-4xl font-bold text-slate-900">{thesis.title}</h1>
      <dl className="mt-8 grid gap-5 border-y border-slate-200 py-6 sm:grid-cols-2">
        <div><dt className="text-sm text-slate-500">Author</dt><dd className="mt-1 font-bold">{thesis.student.user.name}</dd></div>
        <div><dt className="text-sm text-slate-500">NIM</dt><dd className="mt-1 font-bold">{thesis.student.nim}</dd></div>
      </dl>
      <h2 className="mt-10 text-xl font-bold">Abstrak</h2>
      <p className="mt-3 whitespace-pre-line leading-8 text-slate-600">{thesis.abstract}</p>
      <h2 className="mt-10 text-xl font-bold">Pembimbing</h2>
      <ul className="mt-3 space-y-2 text-slate-600">
        {thesis.supervisors.map(({ lecturer }) => <li key={lecturer.id}>{lecturer.user.name}</li>)}
      </ul>
      <h2 className="mt-10 text-xl font-bold">File</h2>
      {thesis.files.map((file) => <a key={file.id} href={file.filePath} className="mt-3 block font-bold text-blue-700">{file.fileName}</a>)}
    </article>
  );
}
```

## 12. Tahap 7 - Beranda

Lokasi: `app/page.tsx`.

Beranda harus berisi urutan berikut:

1. Hero singkat dengan judul repository
2. Search besar menuju `/repository?q=...`
3. Statistik jumlah TA, mahasiswa, dan dosen
4. TA terbaru
5. Program studi
6. Pembimbing populer
7. Footer

Contoh hero:

```tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <section className="bg-blue-50 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-bold uppercase tracking-wider text-blue-700">Digital academic archive</p>
          <h1 className="mt-4 max-w-3xl text-5xl font-bold tracking-tight text-slate-900">Temukan karya Tugas Akhir dalam satu repository.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">Koleksi penelitian mahasiswa yang tertata, mudah dicari, dan dapat diakses dengan nyaman.</p>
          <form action="/repository" className="mt-8 flex max-w-2xl gap-3">
            <input name="q" placeholder="Cari judul, author, atau keyword" className="min-h-14 flex-1 rounded-lg border border-slate-200 bg-white px-5" />
            <button className="rounded-lg bg-blue-700 px-6 font-bold text-white">Cari TA</button>
          </form>
          <Link href="/repository" className="mt-5 inline-block font-bold text-blue-700">Jelajahi semua repository -&gt;</Link>
        </div>
      </section>
    </>
  );
}
```

## 13. Tahap 8 - Upload dan Verifikasi

Urutan implementasi:

1. Buat halaman `app/submit/page.tsx`.
2. Buat form metadata: judul, abstrak, tahun, NIM, program studi, keyword, pembimbing.
3. Validasi ukuran file PDF maksimal 10 MB.
4. Simpan metadata dengan status `PENDING`.
5. Simpan file di object storage atau folder upload server.
6. Buat halaman admin `app/admin/submissions/page.tsx`.
7. Admin dapat memilih `APPROVED`, `PUBLISHED`, atau `REJECTED`.
8. Hanya status `PUBLISHED` yang tampil di halaman publik.

Jangan menyimpan password dalam bentuk biasa. Saat authentication dibuat, pasang `bcrypt` atau library auth yang sesuai.

## 14. Tahap 9 - Authentication

Authentication dikerjakan setelah repository publik bisa berjalan.

Role:

- `ADMIN`: verifikasi dan mengelola seluruh data
- `STUDENT`: mengirim dan melihat TA sendiri
- `LECTURER`: melihat TA yang dibimbing

Halaman yang perlu dilindungi:

```text
/submit
/dashboard
/admin/*
```

Jangan hanya menyembunyikan tombol di frontend. API juga wajib memeriksa session dan role.

## 15. Tahap 10 - Statistik

Buat API `app/api/statistics/route.ts` yang menghitung:

- Total TA published
- Total mahasiswa
- Total dosen
- Jumlah TA per tahun
- Jumlah TA per program studi
- Jumlah TA per keyword
- Jumlah TA per pembimbing

Untuk tahap pertama gunakan angka dan tabel sederhana. Grafik dapat ditambahkan kemudian dengan library chart.

## 16. Tahap 11 - SDGs sebagai Modul V2

Jangan menambahkan kolom SDG ke model `Thesis` secara langsung. Gunakan tabel terpisah:

```prisma
model Sdg {
  id          Int          @id @default(autoincrement())
  number      Int          @unique
  name        String
  description String?      @db.Text
  targets     SdgTarget[]
  theses      ThesisSdg[]
}

model SdgTarget {
  id        Int    @id @default(autoincrement())
  sdgId     Int
  code      String @unique
  name      String
  sdg       Sdg    @relation(fields: [sdgId], references: [id])
}

model ThesisSdg {
  thesisId       Int
  sdgId          Int
  justification  String? @db.Text
  thesis         Thesis @relation(fields: [thesisId], references: [id], onDelete: Cascade)
  sdg            Sdg    @relation(fields: [sdgId], references: [id])

  @@id([thesisId, sdgId])
}
```

Dengan cara ini, struktur inti TA tidak perlu dibongkar ketika SDGs mulai dibuat.

## 17. Urutan Pengerjaan yang Disarankan

```text
[ ] 1. Perbaiki layout, navbar, footer, dan style global
[ ] 2. Pastikan database inti dan migration berjalan
[ ] 3. Buat data dummy mahasiswa, dosen, prodi, dan TA
[ ] 4. Buat halaman repository publik
[ ] 5. Buat halaman detail TA
[ ] 6. Buat search dan filter
[ ] 7. Buat direktori mahasiswa dan dosen
[ ] 8. Buat statistik dasar
[ ] 9. Buat authentication
[ ] 10. Buat submit TA dan upload PDF
[ ] 11. Buat dashboard mahasiswa dan dosen
[ ] 12. Buat dashboard admin dan verifikasi
[ ] 13. Uji seluruh alur
[ ] 14. Baru mulai modul SDGs
```

## 18. Checklist Testing Setiap Tahap

Setelah mengubah kode, jalankan:

```powershell
npm run lint
npx tsc --noEmit
npm run dev
```

Uji manual:

- `/` dapat dibuka
- `/repository` menampilkan data
- `/repository/[id]` menampilkan detail
- Search tidak error saat kosong
- Data tanggal selalu valid
- API mengembalikan status yang benar
- File PDF tidak bisa diakses sebelum published
- User tanpa role admin tidak dapat membuka API admin
- Layout tidak rusak di mobile

## 19. Catatan Penting dari Masalah Sebelumnya

Pernah ditemukan tanggal MySQL `0000-00-00 00:00:00`. Nilai ini tidak valid untuk JavaScript dan membuat Prisma gagal mengirim JSON dengan error `RangeError: Invalid time value`.

Jangan memasukkan tanggal nol ke database. Gunakan:

```sql
CURRENT_TIMESTAMP(3)
```

atau tanggal valid seperti:

```text
2026-08-19 00:00:00.000
```

Jika `/users` kembali error, cek tiga hal:

```powershell
npx prisma migrate status
Invoke-WebRequest http://localhost:3000/api/users
Get-Content .next/dev/logs/next-development.log -Tail 80
```

## 20. Prinsip Belajar

- Kerjakan satu tahap sampai berhasil sebelum lanjut.
- Setelah membuat schema, jalankan migration dan cek database.
- Setelah membuat API, tes API langsung sebelum membuat UI.
- Setelah membuat UI, tes desktop dan mobile.
- Jangan menyalin kode tanpa memahami lokasi file dan tujuan setiap bagian.
- Simpan perubahan kecil agar mudah dilacak jika terjadi error.
- Jangan memasukkan SDGs sebelum repository inti selesai.

Dokumen ini adalah blueprint V1. Implementasi terbaik dilakukan bertahap melalui commit atau checkpoint kecil, bukan dengan menulis seluruh aplikasi dalam satu kali perubahan.
