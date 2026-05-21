# Requirements Document - SIMRS (Sistem Informasi Manajemen Rumah Sakit)

## Introduction

SIMRS adalah sistem informasi manajemen rumah sakit berbasis web yang dibangun dengan Next.js, menyediakan antarmuka pengguna yang menarik dengan elemen 2D/3D dan ramah pengguna. Sistem ini mencakup modul-modul utama operasional rumah sakit mulai dari pendaftaran pasien, rekam medis elektronik, billing, hingga klaim asuransi. Pengguna masuk melalui halaman login dan diarahkan ke dashboard utama yang berisi navigasi ke seluruh modul.

## Glossary

- **SIMRS**: Sistem Informasi Manajemen Rumah Sakit — aplikasi web utama yang mengelola seluruh operasional rumah sakit
- **Pengguna**: Staf rumah sakit yang memiliki akun dan mengakses sistem (dokter, perawat, admin, kasir, apoteker)
- **Halaman_Login**: Halaman autentikasi yang memvalidasi kredensial pengguna sebelum memberikan akses ke sistem
- **Dashboard**: Halaman utama setelah login yang menampilkan navigasi ke seluruh modul dalam bentuk menu visual
- **Modul_Referensi**: Modul pengelolaan data master seperti data dokter, ruangan, tindakan, dan tarif
- **Modul_Admission**: Modul pendaftaran dan penerimaan pasien rawat inap maupun rawat jalan
- **Modul_RME**: Modul Rekam Medis Elektronik untuk pencatatan riwayat medis pasien secara digital
- **Modul_Billing**: Modul penghitungan dan pengelolaan tagihan pasien
- **Modul_Radiologi**: Modul pengelolaan pemeriksaan dan hasil radiologi
- **Modul_Laboratorium**: Modul pengelolaan pemeriksaan dan hasil laboratorium
- **Modul_Farmasi**: Modul Instalasi Farmasi untuk pengelolaan obat dan resep
- **Modul_Kasir**: Modul pembayaran dan transaksi keuangan pasien
- **Modul_Klaim**: Modul pengelolaan klaim asuransi dan BPJS
- **Modul_Jasa**: Modul penghitungan dan distribusi jasa medis tenaga kesehatan
- **Modul_Pengaturan**: Modul konfigurasi sistem dan manajemen pengguna
- **Modul_Billing_Real**: Modul pemantauan billing secara real-time
- **UI_2D_3D**: Antarmuka pengguna yang menggunakan elemen visual 2D dan 3D untuk meningkatkan pengalaman pengguna
- **Sesi**: Periode aktif pengguna setelah berhasil login hingga logout atau timeout

## Requirements

### Requirement 1: Autentikasi Pengguna

**User Story:** Sebagai Pengguna, saya ingin login ke sistem dengan aman, sehingga hanya pengguna yang berwenang yang dapat mengakses SIMRS.

#### Acceptance Criteria

1. THE Halaman_Login SHALL menampilkan form input untuk username (maksimal 50 karakter) dan password (8 hingga 128 karakter) dengan input password ditampilkan dalam bentuk tersamarkan (masked)
2. WHEN Pengguna memasukkan kredensial yang valid dan menekan tombol login, THE SIMRS SHALL mengautentikasi Pengguna dan mengarahkan ke Dashboard dalam waktu kurang dari 2 detik
3. IF Pengguna memasukkan kredensial yang tidak valid, THEN THE Halaman_Login SHALL menampilkan pesan error yang mengindikasikan kredensial tidak valid tanpa mengungkapkan informasi spesifik tentang field mana yang salah
4. IF Pengguna gagal login sebanyak 5 kali berturut-turut, THEN THE SIMRS SHALL mengunci akun tersebut selama 15 menit dan menampilkan pesan yang mengindikasikan akun terkunci beserta sisa durasi penguncian
5. WHEN Pengguna berhasil login, THE SIMRS SHALL membuat Sesi dengan durasi maksimal 8 jam, dan mereset penghitung kegagalan login menjadi nol
6. IF Sesi tidak aktif (tidak ada interaksi Pengguna berupa klik, navigasi, atau input) selama 30 menit, THEN THE SIMRS SHALL mengakhiri Sesi dan mengarahkan Pengguna kembali ke Halaman_Login dengan pesan yang mengindikasikan sesi telah berakhir karena tidak aktif
7. IF durasi Sesi telah mencapai 8 jam, THEN THE SIMRS SHALL mengakhiri Sesi dan mengarahkan Pengguna kembali ke Halaman_Login dengan pesan yang mengindikasikan sesi telah berakhir
8. IF Pengguna mencoba login saat akun dalam status terkunci, THEN THE Halaman_Login SHALL menampilkan pesan yang mengindikasikan akun masih terkunci beserta sisa durasi penguncian tanpa memproses kredensial yang dimasukkan

### Requirement 2: Dashboard Utama

**User Story:** Sebagai Pengguna, saya ingin melihat dashboard yang menampilkan semua modul dalam tampilan yang menarik dan mudah dinavigasi, sehingga saya dapat mengakses modul yang dibutuhkan dengan cepat.

#### Acceptance Criteria

1. WHEN Pengguna berhasil login, THE Dashboard SHALL menampilkan 12 menu modul: Referensi, Admission, RME, Billing, Radiologi, Laboratorium, Instalasi Farmasi, Kasir, Klaim, Jasa, Pengaturan, dan Billing Real dalam bentuk grid kartu
2. THE Dashboard SHALL menampilkan setiap modul sebagai kartu yang berisi satu ikon unik per modul dan label nama modul yang dapat dibaca tanpa pemotongan teks
3. WHEN Pengguna mengklik kartu modul, THE Dashboard SHALL mengarahkan Pengguna ke halaman modul yang dipilih dalam waktu maksimal 3 detik
4. THE Dashboard SHALL menampilkan nama lengkap dan peran Pengguna yang sedang login di bagian header halaman
5. THE Dashboard SHALL menampilkan tombol logout di bagian header dengan label teks "Logout" atau ikon logout yang selalu terlihat tanpa perlu scroll
6. WHEN Pengguna mengklik tombol logout, THE Dashboard SHALL mengakhiri sesi Pengguna dan mengarahkan Pengguna kembali ke halaman login
7. IF modul gagal dimuat saat Dashboard ditampilkan, THEN THE Dashboard SHALL tetap menampilkan modul lain yang berhasil dimuat dan menampilkan indikator error pada kartu modul yang gagal

### Requirement 3: Antarmuka Pengguna 2D/3D yang Menarik

**User Story:** Sebagai Pengguna, saya ingin menggunakan antarmuka yang menarik secara visual dengan elemen 2D/3D, sehingga pengalaman menggunakan sistem menjadi nyaman dan modern.

#### Acceptance Criteria

1. THE UI_2D_3D SHALL menggunakan efek bayangan (shadow), gradien, dan transisi animasi dengan durasi maksimal 400 milidetik pada elemen kartu modul di Dashboard
2. WHEN Pengguna mengarahkan kursor ke kartu modul, THE UI_2D_3D SHALL menampilkan efek hover berupa transformasi 3D dengan rotasi perspektif maksimal 5 derajat atau elevasi maksimal 8 piksel, dalam durasi transisi 300 milidetik
3. THE UI_2D_3D SHALL menggunakan skema warna yang konsisten (maksimal 5 warna utama yang digunakan berulang) di seluruh halaman dengan kontras minimum rasio 4.5:1 untuk teks terhadap latar belakang
4. THE UI_2D_3D SHALL menampilkan ikon modul dengan gaya ilustrasi yang seragam (satu jenis gaya: outline atau filled, tidak campuran) dan berukuran minimal 48x48 piksel
5. THE SIMRS SHALL menampilkan seluruh konten dan elemen navigasi tanpa scroll horizontal pada layar dengan lebar antara 1024 piksel hingga 1920 piksel, dengan tata letak yang menyesuaikan lebar layar
6. WHEN halaman dimuat, THE UI_2D_3D SHALL menampilkan animasi masuk (entrance animation) pada elemen kartu dengan durasi maksimal 500 milidetik
7. IF pengaturan sistem operasi pengguna mengaktifkan preferensi reduced motion, THEN THE UI_2D_3D SHALL menonaktifkan seluruh animasi transisi dan transformasi 3D serta menampilkan elemen secara langsung tanpa animasi

### Requirement 4: Navigasi dan Tata Letak

**User Story:** Sebagai Pengguna, saya ingin navigasi yang konsisten dan intuitif di seluruh sistem, sehingga saya tidak kesulitan berpindah antar modul.

#### Acceptance Criteria

1. THE SIMRS SHALL menampilkan sidebar navigasi atau header navigasi dengan posisi, urutan menu, dan elemen visual yang sama di setiap halaman modul
2. WHILE Pengguna berada di halaman modul, THE SIMRS SHALL menampilkan breadcrumb yang menunjukkan setiap level hierarki navigasi dari Dashboard hingga halaman aktif, dengan setiap level berupa tautan yang dapat diklik untuk kembali ke level tersebut
3. THE SIMRS SHALL menampilkan tombol kembali ke Dashboard pada posisi tetap yang terlihat tanpa scroll di setiap halaman modul
4. WHILE Pengguna berada di dalam modul, THE SIMRS SHALL menampilkan nama modul aktif dengan gaya visual yang berbeda dari modul lainnya di navigasi, berupa minimal salah satu dari: warna latar belakang berbeda, indikator garis tepi, atau perubahan ketebalan font
5. IF halaman modul gagal dimuat dalam waktu 5 detik, THEN THE SIMRS SHALL menampilkan pesan kesalahan yang menginformasikan kegagalan navigasi dan menyediakan tautan untuk kembali ke halaman sebelumnya atau Dashboard

### Requirement 5: Modul Referensi

**User Story:** Sebagai Pengguna, saya ingin mengelola data master rumah sakit, sehingga data referensi selalu akurat dan terkini.

#### Acceptance Criteria

1. THE Modul_Referensi SHALL menyediakan antarmuka untuk mengelola data master (tambah, ubah, hapus, cari) untuk kategori: dokter, ruangan, tindakan, dan tarif
2. WHEN Pengguna menambahkan atau mengubah data master, THE Modul_Referensi SHALL memvalidasi kelengkapan field wajib sebelum menyimpan, dimana setiap kategori memiliki minimal field nama dan status aktif/nonaktif sebagai field wajib
3. IF validasi field wajib gagal, THEN THE Modul_Referensi SHALL menampilkan indikasi kesalahan pada setiap field yang belum lengkap dan tidak menyimpan data tersebut
4. IF Pengguna mencoba menghapus data master yang masih direferensikan oleh transaksi atau modul lain, THEN THE Modul_Referensi SHALL menampilkan pesan peringatan yang menyebutkan modul terkait dan mencegah penghapusan
5. WHEN Pengguna berhasil menambah, mengubah, atau menghapus data master, THE Modul_Referensi SHALL menampilkan konfirmasi keberhasilan dalam waktu maksimal 3 detik dan memperbarui daftar data master secara otomatis
6. WHEN Pengguna melakukan pencarian data master, THE Modul_Referensi SHALL menampilkan hasil pencarian maksimal 50 data per halaman dengan dukungan paginasi, dan menampilkan pesan bila tidak ada hasil yang cocok

### Requirement 6: Modul Admission

**User Story:** Sebagai Pengguna, saya ingin mendaftarkan pasien dengan cepat dan akurat, sehingga proses penerimaan pasien berjalan efisien.

#### Acceptance Criteria

1. THE Modul_Admission SHALL menyediakan form pendaftaran pasien baru dengan field wajib: nama lengkap (maksimal 100 karakter), tanggal lahir (format DD-MM-YYYY, tidak boleh di masa depan), jenis kelamin (Laki-laki/Perempuan), alamat (maksimal 255 karakter), nomor telepon (8-15 digit angka), dan jenis penjamin (umum/BPJS/asuransi)
2. WHEN Pengguna menyimpan data pendaftaran yang valid, THE Modul_Admission SHALL menghasilkan nomor rekam medis unik secara otomatis dan menampilkan konfirmasi penyimpanan berhasil dalam waktu maksimal 3 detik
3. IF satu atau lebih field wajib kosong atau tidak sesuai format, THEN THE Modul_Admission SHALL menampilkan pesan kesalahan yang menunjukkan field mana yang perlu diperbaiki dan tidak menyimpan data pendaftaran
4. THE Modul_Admission SHALL menyediakan fungsi pencarian pasien berdasarkan nama (minimal 3 karakter input) atau nomor rekam medis, dan menampilkan maksimal 50 hasil yang cocok dalam waktu maksimal 3 detik
5. IF pencarian pasien tidak menemukan hasil, THEN THE Modul_Admission SHALL menampilkan pesan bahwa data pasien tidak ditemukan
6. IF Pengguna memilih pasien dari hasil pencarian yang sudah terdaftar sebelumnya, THEN THE Modul_Admission SHALL menampilkan seluruh data pasien yang tersimpan ke dalam form pendaftaran untuk digunakan kembali
7. IF penyimpanan data pendaftaran gagal karena gangguan sistem, THEN THE Modul_Admission SHALL menampilkan pesan kesalahan yang mengindikasikan kegagalan penyimpanan dan mempertahankan data yang sudah diisi pada form

### Requirement 7: Modul Rekam Medis Elektronik (RME)

**User Story:** Sebagai Pengguna, saya ingin mencatat dan mengakses riwayat medis pasien secara digital, sehingga informasi medis pasien tersedia dengan lengkap dan mudah diakses.

#### Acceptance Criteria

1. THE Modul_RME SHALL menampilkan riwayat kunjungan pasien dalam urutan kronologis terbaru dengan maksimal 20 entri per halaman dan menyediakan navigasi halaman untuk mengakses entri selanjutnya
2. WHEN Pengguna membuat catatan medis baru, THE Modul_RME SHALL menyediakan field wajib untuk: keluhan (maksimal 2000 karakter), diagnosis (kode ICD-10 yang dipilih dari daftar standar), dan tindakan (maksimal 2000 karakter), serta field opsional untuk resep obat
3. IF Pengguna menyimpan catatan medis baru tanpa mengisi salah satu field wajib (keluhan, diagnosis, atau tindakan), THEN THE Modul_RME SHALL mencegah penyimpanan dan menampilkan indikasi field mana yang belum diisi
4. THE Modul_RME SHALL menyimpan setiap perubahan catatan medis beserta timestamp dan identitas Pengguna yang melakukan perubahan dalam bentuk riwayat audit yang dapat dilihat kembali
5. WHEN Pengguna memilih untuk menandatangani catatan medis, THE Modul_RME SHALL mengubah status catatan menjadi final dan mencatat identitas Pengguna serta timestamp penandatanganan
6. IF Pengguna mencoba mengubah catatan medis yang sudah ditandatangani, THEN THE Modul_RME SHALL mencegah perubahan dan menampilkan pesan yang mengindikasikan bahwa catatan sudah final dan tidak dapat diubah

### Requirement 8: Modul Billing

**User Story:** Sebagai Pengguna, saya ingin menghitung tagihan pasien secara otomatis berdasarkan tindakan dan layanan yang diberikan, sehingga proses billing akurat dan efisien.

#### Acceptance Criteria

1. THE Modul_Billing SHALL menghitung total tagihan berdasarkan tindakan, obat, kamar, dan layanan lain yang tercatat dalam sistem, dengan hasil dalam format mata uang Rupiah dengan presisi dua desimal
2. WHEN Pengguna membuka billing pasien, THE Modul_Billing SHALL menampilkan rincian biaya per item yang mencakup nama item, kuantitas, tarif satuan, dan subtotal dalam waktu maksimal 3 detik
3. THE Modul_Billing SHALL menggunakan tarif dari Modul_Referensi sebagai dasar perhitungan
4. IF tarif untuk item tertentu tidak ditemukan di Modul_Referensi, THEN THE Modul_Billing SHALL menampilkan peringatan pada item tersebut dan tidak menyertakan item tanpa tarif dalam total perhitungan

### Requirement 9: Modul Radiologi

**User Story:** Sebagai Pengguna, saya ingin mengelola permintaan dan hasil pemeriksaan radiologi, sehingga proses pemeriksaan radiologi terdokumentasi dengan baik.

#### Acceptance Criteria

1. THE Modul_Radiologi SHALL menyediakan antarmuka untuk membuat permintaan pemeriksaan radiologi dengan field wajib: jenis pemeriksaan (maksimum 100 karakter), area tubuh (maksimum 100 karakter), dan catatan klinis (maksimum 1000 karakter), di mana permintaan yang berhasil dibuat akan berstatus "Menunggu"
2. IF Pengguna mengirim permintaan pemeriksaan radiologi dengan field wajib yang kosong, THEN THE Modul_Radiologi SHALL menampilkan pesan kesalahan yang menunjukkan field mana yang belum diisi dan tidak menyimpan permintaan tersebut
3. WHEN Pengguna menginput hasil pemeriksaan radiologi, THE Modul_Radiologi SHALL menyimpan hasil yang mencakup field: interpretasi/bacaan (maksimum 5000 karakter) dan kesimpulan (maksimum 2000 karakter), menautkannya ke rekam medis pasien terkait, dan mengubah status permintaan menjadi "Selesai"
4. THE Modul_Radiologi SHALL menampilkan daftar antrian pemeriksaan radiologi yang berstatus "Menunggu", diurutkan berdasarkan tanggal permintaan dari yang paling lama, dengan menampilkan minimal: nama pasien, jenis pemeriksaan, area tubuh, dan tanggal permintaan
5. IF penautkan hasil ke rekam medis pasien gagal, THEN THE Modul_Radiologi SHALL menampilkan pesan kesalahan yang menunjukkan kegagalan penyimpanan, mempertahankan data hasil yang sudah diinput, dan tidak mengubah status permintaan

### Requirement 10: Modul Laboratorium

**User Story:** Sebagai Pengguna, saya ingin mengelola permintaan dan hasil pemeriksaan laboratorium, sehingga proses pemeriksaan lab terdokumentasi dan hasilnya mudah diakses.

#### Acceptance Criteria

1. THE Modul_Laboratorium SHALL menyediakan antarmuka untuk membuat permintaan pemeriksaan lab dengan field wajib: jenis pemeriksaan (dipilih dari daftar yang telah ditentukan) dan catatan klinis (teks bebas, maksimal 1000 karakter)
2. WHEN hasil pemeriksaan lab tersedia, THE Modul_Laboratorium SHALL memungkinkan Pengguna menginput nilai hasil (numerik beserta satuan) dan nilai rentang normal (batas bawah dan batas atas) sebagai referensi
3. IF hasil pemeriksaan bernilai lebih rendah dari batas bawah atau lebih tinggi dari batas atas rentang normal, THEN THE Modul_Laboratorium SHALL menandai hasil tersebut secara visual dengan warna latar belakang yang berbeda dari hasil dalam rentang normal
4. IF Pengguna mengirim permintaan pemeriksaan lab tanpa mengisi salah satu field wajib, THEN THE Modul_Laboratorium SHALL menampilkan pesan kesalahan yang mengindikasikan field mana yang belum diisi dan tidak menyimpan permintaan tersebut

### Requirement 11: Modul Instalasi Farmasi

**User Story:** Sebagai Pengguna, saya ingin mengelola stok obat dan memproses resep, sehingga ketersediaan obat terjaga dan resep diproses dengan akurat.

#### Acceptance Criteria

1. THE Modul_Farmasi SHALL menampilkan daftar stok obat beserta nama obat, jumlah tersedia, satuan, dan tanggal kadaluarsa, dengan maksimal 50 item per halaman dan dukungan paginasi
2. WHEN resep dari Modul_RME diterima, THE Modul_Farmasi SHALL menampilkan daftar obat yang diminta beserta status ketersediaannya (tersedia/tidak tersedia/stok rendah)
3. WHEN obat diserahkan ke pasien, THE Modul_Farmasi SHALL mengurangi stok obat secara otomatis sesuai jumlah yang diserahkan dan mencatat waktu penyerahan
4. IF stok obat mencapai batas minimum (10 unit atau kurang), THEN THE Modul_Farmasi SHALL menampilkan peringatan stok rendah dengan indikator visual warna berbeda pada item tersebut
5. IF obat yang diminta dalam resep tidak tersedia (stok 0), THEN THE Modul_Farmasi SHALL menampilkan indikator "Tidak Tersedia" pada item tersebut dan mencegah proses penyerahan untuk item tersebut

### Requirement 12: Modul Kasir

**User Story:** Sebagai Pengguna, saya ingin memproses pembayaran pasien dengan cepat dan akurat, sehingga transaksi keuangan tercatat dengan benar.

#### Acceptance Criteria

1. WHEN Pengguna membuka halaman kasir untuk pasien tertentu, THE Modul_Kasir SHALL menampilkan total tagihan pasien dari Modul_Billing beserta rincian item tagihan dalam waktu maksimal 3 detik
2. WHEN Pengguna memproses pembayaran, THE Modul_Kasir SHALL mencatat metode pembayaran (tunai, kartu debit, kartu kredit, transfer), jumlah yang dibayarkan, tanggal dan waktu transaksi, serta identitas Pengguna yang memproses
3. WHEN pembayaran berhasil, THE Modul_Kasir SHALL menghasilkan bukti pembayaran yang dapat dicetak yang memuat minimal: nomor transaksi unik, nama pasien, rincian tagihan, jumlah dibayar, metode pembayaran, tanggal dan waktu, serta nama kasir
4. WHEN Pengguna memasukkan jumlah uang tunai yang diterima, THE Modul_Kasir SHALL menghitung dan menampilkan kembalian dengan presisi dua desimal (satuan Rupiah)
5. IF jumlah pembayaran tunai yang dimasukkan kurang dari total tagihan, THEN THE Modul_Kasir SHALL menampilkan pesan kesalahan yang menunjukkan kekurangan jumlah pembayaran dan tidak memproses transaksi
6. IF pembayaran non-tunai gagal diproses, THEN THE Modul_Kasir SHALL menampilkan pesan kesalahan yang menunjukkan kegagalan transaksi dan mempertahankan data tagihan tanpa perubahan status

### Requirement 13: Modul Klaim

**User Story:** Sebagai Pengguna, saya ingin mengelola klaim asuransi dan BPJS, sehingga proses klaim berjalan lancar dan terdokumentasi.

#### Acceptance Criteria

1. THE Modul_Klaim SHALL menyediakan antarmuka untuk membuat pengajuan klaim dengan data wajib: nomor peserta, diagnosis, tindakan, dan minimal 1 dokumen pendukung (maksimal 10 dokumen, masing-masing maksimal 5 MB)
2. WHEN klaim diajukan, THE Modul_Klaim SHALL mencatat klaim dengan status awal "diajukan" dan mencatat tanggal pengajuan, serta mendukung transisi status secara berurutan: diajukan → diproses → disetujui atau ditolak
3. THE Modul_Klaim SHALL menampilkan daftar klaim dengan filter berdasarkan status (diajukan, diproses, disetujui, ditolak) dan rentang tanggal pengajuan (tanggal awal dan tanggal akhir)
4. IF pengguna mengajukan klaim tanpa mengisi salah satu data wajib (nomor peserta, diagnosis, tindakan, atau dokumen pendukung), THEN THE Modul_Klaim SHALL menampilkan pesan kesalahan yang menunjukkan field mana yang belum diisi dan tidak menyimpan data klaim tersebut

### Requirement 14: Modul Jasa

**User Story:** Sebagai Pengguna, saya ingin menghitung dan mendistribusikan jasa medis tenaga kesehatan, sehingga pembagian jasa dilakukan secara transparan dan akurat.

#### Acceptance Criteria

1. THE Modul_Jasa SHALL menghitung jasa medis untuk setiap tenaga kesehatan berdasarkan tarif tindakan yang tercatat dalam sistem, dengan hasil perhitungan ditampilkan dalam format mata uang Rupiah dengan presisi dua desimal
2. WHEN Pengguna memilih periode rekapitulasi (rentang tanggal awal dan tanggal akhir, maksimal 12 bulan), THE Modul_Jasa SHALL menampilkan rekapitulasi jasa per tenaga kesehatan yang mencakup: nama tenaga kesehatan, jumlah tindakan, dan total nominal jasa dalam periode tersebut
3. WHEN Pengguna memilih periode laporan dan memilih opsi cetak atau ekspor PDF, THE Modul_Jasa SHALL menghasilkan laporan distribusi jasa dalam waktu tidak lebih dari 30 detik untuk periode maksimal 12 bulan
4. IF tidak terdapat data tindakan dalam periode yang dipilih, THEN THE Modul_Jasa SHALL menampilkan pesan yang mengindikasikan bahwa tidak ada data jasa pada periode tersebut tanpa menghasilkan laporan kosong
5. IF tanggal akhir periode lebih awal dari tanggal awal, THEN THE Modul_Jasa SHALL menampilkan pesan kesalahan yang mengindikasikan bahwa rentang periode tidak valid dan mempertahankan nilai input sebelumnya

### Requirement 15: Modul Pengaturan

**User Story:** Sebagai Pengguna dengan peran administrator, saya ingin mengelola konfigurasi sistem dan akun pengguna, sehingga sistem dapat disesuaikan dengan kebutuhan rumah sakit.

#### Acceptance Criteria

1. THE Modul_Pengaturan SHALL menyediakan antarmuka manajemen pengguna yang mencakup operasi tambah, ubah (nama, peran, status aktif), dan nonaktifkan akun, dengan setiap akun memiliki minimal field: nama lengkap, username (maksimal 50 karakter), peran, dan status aktif/nonaktif
2. THE Modul_Pengaturan SHALL menyediakan pengaturan peran dan hak akses per modul, di mana setiap peran dapat dikonfigurasi dengan kombinasi izin baca, tulis, dan hapus untuk masing-masing modul yang tersedia dalam sistem
3. WHEN administrator mengubah hak akses Pengguna, THE Modul_Pengaturan SHALL menerapkan perubahan pada Sesi berikutnya dari Pengguna yang bersangkutan
4. IF administrator mencoba menambah akun dengan username yang sudah terdaftar, THEN THE Modul_Pengaturan SHALL menolak operasi dan menampilkan pesan kesalahan yang menunjukkan bahwa username telah digunakan
5. IF administrator mencoba menonaktifkan satu-satunya akun dengan peran administrator yang masih aktif, THEN THE Modul_Pengaturan SHALL menolak operasi dan menampilkan pesan kesalahan yang menunjukkan bahwa minimal satu akun administrator aktif harus tersedia
6. WHEN administrator berhasil menambah, mengubah, atau menonaktifkan akun pengguna, THE Modul_Pengaturan SHALL menampilkan notifikasi konfirmasi keberhasilan dalam waktu maksimal 3 detik setelah operasi selesai

### Requirement 16: Modul Billing Real-Time

**User Story:** Sebagai Pengguna, saya ingin memantau billing pasien secara real-time, sehingga saya dapat melihat akumulasi biaya pasien yang sedang dirawat kapan saja.

#### Acceptance Criteria

1. THE Modul_Billing_Real SHALL menampilkan daftar pasien rawat inap yang mencakup nama pasien, nomor rekam medis, ruangan, tanggal masuk, jenis penjamin, dan akumulasi biaya dalam format mata uang Rupiah dengan presisi dua desimal, diurutkan berdasarkan tanggal masuk terbaru, dengan maksimal 50 pasien per halaman
2. WHEN tindakan atau layanan baru ditambahkan ke pasien, THE Modul_Billing_Real SHALL memperbarui total biaya dalam waktu kurang dari 5 detik
3. THE Modul_Billing_Real SHALL menyediakan filter berdasarkan ruangan, tanggal masuk (rentang tanggal awal dan akhir), dan jenis penjamin, dimana filter dapat dikombinasikan secara bersamaan
4. IF filter yang diterapkan tidak menghasilkan data pasien, THEN THE Modul_Billing_Real SHALL menampilkan pesan yang menginformasikan bahwa tidak ada pasien yang sesuai dengan kriteria filter
5. IF data billing tidak dapat diambil dari sumber data, THEN THE Modul_Billing_Real SHALL menampilkan pesan kesalahan yang menginformasikan bahwa data tidak tersedia dan mempertahankan tampilan terakhir yang berhasil dimuat
