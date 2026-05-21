# Implementation Plan: SIMRS (Sistem Informasi Manajemen Rumah Sakit)

## Overview

Implementasi SIMRS menggunakan Next.js 14 App Router, Tailwind CSS, Prisma ORM dengan SQLite, dan NextAuth.js. Fokus utama: halaman login, dashboard dengan kartu 2D/3D, dan 12 halaman modul dengan fungsionalitas CRUD dasar.

## Tasks

- [ ] 1. Setup proyek dan konfigurasi dasar
  - [ ] 1.1 Inisialisasi proyek Next.js 14 dengan TypeScript dan Tailwind CSS
    - Buat proyek Next.js 14 dengan App Router
    - Konfigurasi TypeScript strict mode
    - Setup Tailwind CSS dengan konfigurasi tema warna (primary, secondary, success, warning, danger)
    - Tambahkan CSS keyframes untuk animasi `cardEntrance` dan utilitas `.card-3d`
    - Tambahkan media query `prefers-reduced-motion`
    - _Requirements: 3.1, 3.3, 3.7_

  - [ ] 1.2 Setup Prisma ORM dan skema database
    - Install Prisma dan konfigurasi SQLite sebagai datasource
    - Buat schema.prisma lengkap dengan semua model: User, RolePermission, Patient, Visit, MedicalRecord, MedicalRecordAudit, Doctor, Room, Procedure, BillingItem, Payment, RadiologyRequest, RadiologyResult, LabRequest, LabResult, Medicine, Dispensing, Claim, ClaimDocument, MedicalFee
    - Buat Prisma client singleton di `src/lib/prisma.ts`
    - Jalankan migrasi awal
    - _Requirements: 5.1, 6.1, 7.2, 8.1, 9.1, 10.1, 11.1, 12.2, 13.1, 14.1, 15.1_

  - [ ] 1.3 Buat seed data untuk pengembangan
    - Buat file `prisma/seed.ts` dengan data pengguna default (admin, dokter, perawat, kasir, apoteker, radiografer, analis_lab)
    - Tambahkan data master: dokter, ruangan, tindakan, tarif, obat
    - Tambahkan data pasien dan kunjungan contoh
    - Tambahkan role permissions untuk setiap peran
    - _Requirements: 5.1, 15.1, 15.2_

  - [ ] 1.4 Setup NextAuth.js dengan Credentials Provider
    - Install dan konfigurasi NextAuth.js di `src/lib/auth.ts`
    - Implementasi Credentials Provider dengan validasi bcrypt
    - Konfigurasi JWT session (maxAge: 8 jam)
    - Buat API route handler di `src/app/api/auth/[...nextauth]/route.ts`
    - Implementasi logika account lockout (5 kali gagal = kunci 15 menit)
    - Reset failed_attempts pada login berhasil
    - _Requirements: 1.2, 1.4, 1.5, 1.8_

  - [ ] 1.5 Implementasi middleware autentikasi
    - Buat `middleware.ts` dengan pengecekan session timeout 8 jam
    - Implementasi pengecekan inactivity 30 menit via cookie `last_activity`
    - Redirect ke `/login?reason=expired` atau `/login?reason=inactivity`
    - Konfigurasi matcher untuk `/dashboard/:path*`
    - _Requirements: 1.6, 1.7_

- [ ] 2. Checkpoint - Pastikan setup dasar berjalan
  - Pastikan semua konfigurasi benar, migrasi berhasil, dan seed data tersedia. Tanyakan ke pengguna jika ada pertanyaan.

- [ ] 3. Halaman login dan autentikasi
  - [ ] 3.1 Buat halaman login (`src/app/login/page.tsx`)
    - Buat form dengan field username (max 50 karakter) dan password (8-128 karakter, masked)
    - Implementasi submit handler yang memanggil NextAuth signIn
    - Tampilkan pesan error generic tanpa mengungkapkan field mana yang salah
    - Tampilkan pesan akun terkunci beserta sisa durasi penguncian
    - Tampilkan pesan session expired/inactivity berdasarkan query parameter `reason`
    - Redirect ke `/dashboard` pada login berhasil
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.8_

  - [ ]* 3.2 Tulis property test untuk Account Lockout State Machine
    - **Property 1: Account Lockout State Machine**
    - **Validates: Requirements 1.4, 1.5, 1.8**

  - [ ]* 3.3 Tulis property test untuk Generic Authentication Error Message
    - **Property 2: Generic Authentication Error Message**
    - **Validates: Requirements 1.3**

- [ ] 4. Dashboard dan komponen layout
  - [ ] 4.1 Buat komponen layout utama
    - Implementasi `src/components/layout/Sidebar.tsx` dengan daftar 12 modul
    - Implementasi `src/components/layout/Header.tsx` dengan nama pengguna, peran, dan tombol logout
    - Implementasi `src/components/layout/Breadcrumb.tsx` dengan navigasi hierarki
    - Buat `src/app/dashboard/layout.tsx` yang menggabungkan sidebar, header, dan breadcrumb
    - Tandai modul aktif di sidebar dengan gaya visual berbeda
    - _Requirements: 2.4, 2.5, 2.6, 4.1, 4.2, 4.3, 4.4_

  - [ ] 4.2 Buat komponen Card3D untuk dashboard
    - Implementasi `src/components/ui/Card3D.tsx` dengan efek hover 3D (rotasi max 5 derajat, elevasi max 8px)
    - Tambahkan entrance animation dengan staggered delay per kartu
    - Implementasi pengecekan `prefers-reduced-motion`
    - Tampilkan indikator error pada kartu yang gagal dimuat
    - _Requirements: 3.1, 3.2, 3.4, 3.5, 3.6, 3.7, 2.7_

  - [ ] 4.3 Buat halaman dashboard utama (`src/app/dashboard/page.tsx`)
    - Tampilkan grid 12 kartu modul: Referensi, Admission, RME, Billing, Radiologi, Laboratorium, Instalasi Farmasi, Kasir, Klaim, Jasa, Pengaturan, Billing Real
    - Setiap kartu memiliki ikon unik dan label tanpa pemotongan teks
    - Klik kartu navigasi ke halaman modul terkait
    - Layout responsif tanpa scroll horizontal (1024px - 1920px)
    - _Requirements: 2.1, 2.2, 2.3, 3.5_

  - [ ] 4.4 Buat komponen UI reusable
    - Implementasi `src/components/ui/DataTable.tsx` dengan paginasi
    - Implementasi `src/components/ui/FormField.tsx` dengan validasi
    - Implementasi `src/components/ui/StatusBadge.tsx`
    - Implementasi `src/components/ui/ConfirmDialog.tsx`
    - Buat utility functions: currency formatter (Rupiah), date utils
    - _Requirements: 5.6, 8.2, 11.1_

- [ ] 5. Checkpoint - Pastikan login dan dashboard berfungsi
  - Pastikan semua tests pass, login → dashboard flow bekerja. Tanyakan ke pengguna jika ada pertanyaan.

- [ ] 6. Modul Referensi
  - [ ] 6.1 Implementasi halaman dan API Modul Referensi
    - Buat `src/app/dashboard/referensi/page.tsx` dengan tab: Dokter, Ruangan, Tindakan, Tarif
    - Buat API route `src/app/api/referensi/route.ts` untuk CRUD semua kategori
    - Implementasi form tambah/ubah dengan validasi field wajib (nama, status aktif/nonaktif)
    - Implementasi pencarian dengan hasil max 50 per halaman dan paginasi
    - Implementasi soft-delete dengan pengecekan referensi di modul lain (tampilkan peringatan jika masih direferensikan)
    - Tampilkan konfirmasi keberhasilan operasi dalam max 3 detik
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [ ]* 6.2 Tulis property test untuk Data Master CRUD Round-Trip
    - **Property 4: Data Master CRUD Round-Trip**
    - **Validates: Requirements 5.1, 15.1**

  - [ ]* 6.3 Tulis property test untuk Referential Integrity on Delete
    - **Property 5: Referential Integrity on Delete**
    - **Validates: Requirements 5.4**

  - [ ]* 6.4 Tulis property test untuk Pagination Invariant
    - **Property 6: Pagination Invariant**
    - **Validates: Requirements 5.6, 6.4, 7.1, 11.1, 16.1**

- [ ] 7. Modul Admission
  - [ ] 7.1 Implementasi halaman dan API Modul Admission
    - Buat `src/app/dashboard/admission/page.tsx` dengan form pendaftaran pasien
    - Buat API route `src/app/api/admission/route.ts` dan `src/app/api/admission/search/route.ts`
    - Implementasi field wajib: nama lengkap (max 100), tanggal lahir (DD-MM-YYYY, tidak di masa depan), jenis kelamin, alamat (max 255), nomor telepon (8-15 digit), jenis penjamin
    - Generate nomor rekam medis unik otomatis
    - Implementasi pencarian pasien (min 3 karakter, max 50 hasil)
    - Tampilkan data pasien yang sudah ada ke form saat dipilih dari hasil pencarian
    - Pertahankan data form saat penyimpanan gagal
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

  - [ ]* 7.2 Tulis property test untuk Unique Generated Identifiers
    - **Property 7: Unique Generated Identifiers**
    - **Validates: Requirements 6.2, 12.3**

  - [ ]* 7.3 Tulis property test untuk Required Field Validation Rejection
    - **Property 3: Required Field Validation Rejection**
    - **Validates: Requirements 5.2, 6.1, 7.2, 9.2, 10.4, 13.1**

- [ ] 8. Modul Rekam Medis Elektronik (RME)
  - [ ] 8.1 Implementasi halaman dan API Modul RME
    - Buat `src/app/dashboard/rme/page.tsx` dengan daftar riwayat kunjungan (max 20 per halaman, kronologis terbaru)
    - Buat API routes: `src/app/api/rme/route.ts`, `src/app/api/rme/[id]/route.ts`, `src/app/api/rme/[id]/sign/route.ts`
    - Implementasi form catatan medis: keluhan (max 2000), diagnosis (kode ICD-10 dari daftar), tindakan (max 2000), resep opsional
    - Implementasi penandatanganan catatan (ubah status ke final, catat user + timestamp)
    - Cegah perubahan pada catatan yang sudah ditandatangani
    - Simpan audit trail setiap perubahan (timestamp, user, deskripsi perubahan)
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

  - [ ]* 8.2 Tulis property test untuk Medical Record Immutability After Signature
    - **Property 8: Medical Record Immutability After Signature**
    - **Validates: Requirements 7.6**

  - [ ]* 8.3 Tulis property test untuk Audit Trail Completeness
    - **Property 9: Audit Trail Completeness**
    - **Validates: Requirements 7.4**

- [ ] 9. Modul Billing
  - [ ] 9.1 Implementasi halaman dan API Modul Billing
    - Buat `src/app/dashboard/billing/page.tsx` dengan rincian biaya per kunjungan
    - Buat API route `src/app/api/billing/[visitId]/route.ts`
    - Hitung total tagihan dari tindakan, obat, kamar, dan layanan lain
    - Tampilkan rincian: nama item, kuantitas, tarif satuan, subtotal (format Rupiah)
    - Gunakan tarif dari Modul Referensi, tampilkan peringatan jika tarif tidak ditemukan
    - Item tanpa tarif tidak disertakan dalam total
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [ ]* 9.2 Tulis property test untuk Billing Total Calculation
    - **Property 10: Billing Total Calculation**
    - **Validates: Requirements 8.1, 8.3, 8.4**

- [ ] 10. Checkpoint - Pastikan modul inti berfungsi
  - Pastikan semua tests pass, flow Referensi → Admission → RME → Billing bekerja. Tanyakan ke pengguna jika ada pertanyaan.

- [ ] 11. Modul Radiologi
  - [ ] 11.1 Implementasi halaman dan API Modul Radiologi
    - Buat `src/app/dashboard/radiologi/page.tsx` dengan antrian dan form hasil
    - Buat API routes: `src/app/api/radiologi/route.ts`, `src/app/api/radiologi/[id]/result/route.ts`
    - Implementasi form permintaan: jenis pemeriksaan (max 100), area tubuh (max 100), catatan klinis (max 1000)
    - Status awal permintaan: "Menunggu"
    - Tampilkan antrian diurutkan tanggal permintaan (paling lama dulu)
    - Input hasil: interpretasi (max 5000), kesimpulan (max 2000)
    - Tautkan hasil ke rekam medis, ubah status jadi "Selesai"
    - Pertahankan data hasil jika penautkan gagal
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [ ]* 11.2 Tulis property test untuk Radiologi/Lab Request State Transitions
    - **Property 11: Radiologi/Lab Request State Transitions**
    - **Validates: Requirements 9.1, 9.3, 9.4**

- [ ] 12. Modul Laboratorium
  - [ ] 12.1 Implementasi halaman dan API Modul Laboratorium
    - Buat `src/app/dashboard/laboratorium/page.tsx` dengan antrian dan form hasil
    - Buat API routes: `src/app/api/laboratorium/route.ts`, `src/app/api/laboratorium/[id]/result/route.ts`
    - Implementasi form permintaan: jenis pemeriksaan (dari daftar), catatan klinis (max 1000)
    - Input hasil: nilai numerik, satuan, batas bawah, batas atas
    - Tandai hasil abnormal (< batas bawah atau > batas atas) dengan warna berbeda
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [ ]* 12.2 Tulis property test untuk Lab Result Abnormality Detection
    - **Property 12: Lab Result Abnormality Detection**
    - **Validates: Requirements 10.3**

- [ ] 13. Modul Instalasi Farmasi
  - [ ] 13.1 Implementasi halaman dan API Modul Farmasi
    - Buat `src/app/dashboard/farmasi/page.tsx` dengan daftar stok dan penyerahan obat
    - Buat API routes: `src/app/api/farmasi/route.ts`, `src/app/api/farmasi/dispense/route.ts`
    - Tampilkan daftar stok: nama, jumlah, satuan, kadaluarsa (max 50 per halaman)
    - Tampilkan status ketersediaan: tersedia (>10), stok rendah (1-10), tidak tersedia (0)
    - Kurangi stok otomatis saat penyerahan, catat waktu
    - Cegah penyerahan jika stok 0
    - Tampilkan peringatan stok rendah dengan indikator visual
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

  - [ ]* 13.2 Tulis property test untuk Pharmacy Stock Decrement on Dispensing
    - **Property 13: Pharmacy Stock Decrement on Dispensing**
    - **Validates: Requirements 11.3, 11.5**

  - [ ]* 13.3 Tulis property test untuk Medicine Availability Status
    - **Property 14: Medicine Availability Status**
    - **Validates: Requirements 11.2, 11.4**

- [ ] 14. Modul Kasir
  - [ ] 14.1 Implementasi halaman dan API Modul Kasir
    - Buat `src/app/dashboard/kasir/page.tsx` dengan form pembayaran
    - Buat API route `src/app/api/kasir/route.ts`
    - Tampilkan total tagihan dari Modul Billing beserta rincian item
    - Catat metode pembayaran (tunai, debit, kredit, transfer), jumlah dibayar, waktu, kasir
    - Hitung kembalian otomatis (presisi 2 desimal)
    - Tolak pembayaran tunai jika jumlah < total tagihan
    - Generate nomor transaksi unik
    - Hasilkan bukti pembayaran yang bisa dicetak
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

  - [ ]* 14.2 Tulis property test untuk Cash Payment Change Calculation
    - **Property 15: Cash Payment Change Calculation**
    - **Validates: Requirements 12.4, 12.5**

- [ ] 15. Checkpoint - Pastikan modul penunjang berfungsi
  - Pastikan semua tests pass, flow Radiologi/Lab/Farmasi/Kasir bekerja. Tanyakan ke pengguna jika ada pertanyaan.

- [ ] 16. Modul Klaim
  - [ ] 16.1 Implementasi halaman dan API Modul Klaim
    - Buat `src/app/dashboard/klaim/page.tsx` dengan daftar klaim dan form pengajuan
    - Buat API routes: `src/app/api/klaim/route.ts`, `src/app/api/klaim/[id]/status/route.ts`
    - Form pengajuan: nomor peserta, diagnosis, tindakan, dokumen pendukung (1-10 file, max 5MB/file)
    - Status awal: "diajukan", transisi: diajukan → diproses → disetujui/ditolak
    - Filter daftar klaim berdasarkan status dan rentang tanggal
    - _Requirements: 13.1, 13.2, 13.3, 13.4_

  - [ ]* 16.2 Tulis property test untuk Claim Status State Machine
    - **Property 16: Claim Status State Machine**
    - **Validates: Requirements 13.2**

- [ ] 17. Modul Jasa
  - [ ] 17.1 Implementasi halaman dan API Modul Jasa
    - Buat `src/app/dashboard/jasa/page.tsx` dengan rekapitulasi jasa medis
    - Buat API routes: `src/app/api/jasa/route.ts`, `src/app/api/jasa/export/route.ts`
    - Hitung jasa berdasarkan tarif tindakan per tenaga kesehatan (format Rupiah)
    - Tampilkan rekapitulasi: nama, jumlah tindakan, total nominal per periode
    - Validasi rentang tanggal (max 12 bulan, tanggal akhir >= tanggal awal)
    - Ekspor laporan PDF
    - Tampilkan pesan jika tidak ada data dalam periode
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

  - [ ]* 17.2 Tulis property test untuk Medical Fee Aggregation
    - **Property 18: Medical Fee Aggregation**
    - **Validates: Requirements 14.1, 14.2**

  - [ ]* 17.3 Tulis property test untuk Invalid Date Range Rejection
    - **Property 19: Invalid Date Range Rejection**
    - **Validates: Requirements 14.5**

- [ ] 18. Modul Pengaturan
  - [ ] 18.1 Implementasi halaman dan API Modul Pengaturan
    - Buat `src/app/dashboard/pengaturan/page.tsx` dengan tab: Pengguna, Peran & Hak Akses
    - Buat API routes: `src/app/api/pengaturan/users/route.ts`, `src/app/api/pengaturan/roles/route.ts`
    - Manajemen pengguna: tambah, ubah (nama, peran, status), nonaktifkan
    - Tolak username duplikat
    - Cegah nonaktifkan satu-satunya admin aktif
    - Pengaturan hak akses per modul (baca, tulis, hapus) per peran
    - Perubahan berlaku pada sesi berikutnya
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6_

  - [ ]* 18.2 Tulis property test untuk Username Uniqueness Constraint
    - **Property 20: Username Uniqueness Constraint**
    - **Validates: Requirements 15.4**

  - [ ]* 18.3 Tulis property test untuk Last Administrator Protection
    - **Property 21: Last Administrator Protection**
    - **Validates: Requirements 15.5**

- [ ] 19. Modul Billing Real-Time
  - [ ] 19.1 Implementasi halaman dan API Modul Billing Real-Time
    - Buat `src/app/dashboard/billing-real/page.tsx` dengan daftar pasien rawat inap
    - Buat API route `src/app/api/billing-real/route.ts`
    - Tampilkan: nama pasien, nomor RM, ruangan, tanggal masuk, jenis penjamin, akumulasi biaya (Rupiah)
    - Urutkan berdasarkan tanggal masuk terbaru, max 50 per halaman
    - Implementasi polling setiap 5 detik untuk update real-time
    - Filter berdasarkan ruangan, tanggal masuk, jenis penjamin (bisa kombinasi)
    - Tampilkan pesan jika filter tidak menghasilkan data
    - Pertahankan tampilan terakhir jika data gagal diambil
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5_

  - [ ]* 19.2 Tulis property test untuk Filter Results Match All Active Criteria
    - **Property 17: Filter Results Match All Active Criteria**
    - **Validates: Requirements 13.3, 16.3**

- [ ] 20. Integrasi dan penyelesaian
  - [ ] 20.1 Hubungkan navigasi dan breadcrumb antar semua modul
    - Pastikan sidebar menandai modul aktif di semua halaman
    - Pastikan breadcrumb menampilkan hierarki yang benar di setiap halaman
    - Pastikan tombol kembali ke Dashboard terlihat di semua halaman modul
    - Implementasi error boundary per modul (modul gagal tidak memengaruhi modul lain)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 2.7_

  - [ ]* 20.2 Tulis property test untuk Breadcrumb Path Correctness
    - **Property 22: Breadcrumb Path Correctness**
    - **Validates: Requirements 4.2**

  - [ ]* 20.3 Tulis unit test untuk komponen UI (Card3D, DataTable, FormField)
    - Test rendering komponen Card3D dengan dan tanpa reduced motion
    - Test DataTable dengan paginasi
    - Test FormField validasi
    - _Requirements: 3.1, 3.2, 3.6, 3.7_

- [ ] 21. Final checkpoint - Pastikan seluruh sistem berfungsi
  - Pastikan semua tests pass, navigasi antar modul lancar, dan semua fitur CRUD berjalan. Tanyakan ke pengguna jika ada pertanyaan.

## Notes

- Task yang ditandai `*` bersifat opsional dan dapat dilewati untuk MVP lebih cepat
- Setiap task mereferensikan requirement spesifik untuk traceabilitas
- Checkpoint memastikan validasi bertahap
- Property tests memvalidasi correctness properties universal dari dokumen desain
- Unit tests memvalidasi contoh spesifik dan edge cases
- Semua kode ditulis dalam TypeScript dengan Next.js 14 App Router

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["1.3", "1.4"] },
    { "id": 3, "tasks": ["1.5"] },
    { "id": 4, "tasks": ["3.1"] },
    { "id": 5, "tasks": ["3.2", "3.3", "4.1", "4.2"] },
    { "id": 6, "tasks": ["4.3", "4.4"] },
    { "id": 7, "tasks": ["6.1", "7.1"] },
    { "id": 8, "tasks": ["6.2", "6.3", "6.4", "7.2", "7.3", "8.1"] },
    { "id": 9, "tasks": ["8.2", "8.3", "9.1"] },
    { "id": 10, "tasks": ["9.2", "11.1", "12.1"] },
    { "id": 11, "tasks": ["11.2", "12.2", "13.1"] },
    { "id": 12, "tasks": ["13.2", "13.3", "14.1"] },
    { "id": 13, "tasks": ["14.2", "16.1", "17.1", "18.1"] },
    { "id": 14, "tasks": ["16.2", "17.2", "17.3", "18.2", "18.3", "19.1"] },
    { "id": 15, "tasks": ["19.2", "20.1"] },
    { "id": 16, "tasks": ["20.2", "20.3"] }
  ]
}
```
