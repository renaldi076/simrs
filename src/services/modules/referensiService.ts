import { storageService } from '@/services/storageService';
import { generateId } from '@/utils/formatters';

export interface ReferensiItem {
  id: string;
  kode: string;
  nama: string;
  isActive: boolean;
  extra?: Record<string, any>;
}

const getStorageKey = (menuKey: string): string => `ref_${menuKey}`;

// --- Seed data for adm_pasien ---
const PASIEN_SEED: Omit<ReferensiItem, 'id'>[] = [
  { kode: '000271690', nama: 'EUIS KOMARIAH', isActive: true },
  { kode: '000271689', nama: 'PENDI KUSNADI', isActive: true },
  { kode: '000271688', nama: 'RATNA SARI DEWI', isActive: true },
  { kode: '000271687', nama: 'DADANG SUPRIATNA', isActive: true },
  { kode: '000271686', nama: 'SRI MULYANI', isActive: true },
  { kode: '000271685', nama: 'AGUS HERMAWAN', isActive: true },
  { kode: '000271684', nama: 'NINING SUHARTI', isActive: true },
  { kode: '000271683', nama: 'UJANG SURYANA', isActive: true },
  { kode: '000271682', nama: 'IIS SUSILAWATI', isActive: true },
  { kode: '000271681', nama: 'BAMBANG SUGIARTO', isActive: true },
  { kode: '000271680', nama: 'YANTI NURHAYATI', isActive: true },
  { kode: '000271679', nama: 'HASAN BASRI', isActive: true },
  { kode: '000271678', nama: 'DEWI KARTINI', isActive: true },
  { kode: '000271677', nama: 'ASEP SUNANDAR', isActive: true },
  { kode: '000271676', nama: 'NENENG HASANAH', isActive: true },
  { kode: '000271675', nama: 'DEDI MULYADI', isActive: true },
  { kode: '000271674', nama: 'TUTI ALAWIYAH', isActive: true },
  { kode: '000271673', nama: 'SOPIAN HADI', isActive: true },
  { kode: '000271672', nama: 'CUCU RAHAYU', isActive: true },
  { kode: '000271671', nama: 'WAWAN SETIAWAN', isActive: true },
];

// --- Seed data for all referensi menu items ---
const SEED_DATA: Record<string, Omit<ReferensiItem, 'id'>[]> = {
  tarif: [
    { kode: 'TRF001', nama: 'Konsultasi Dokter Umum', isActive: true, extra: { kategori: 'layanan', jumlah: 100000 } },
    { kode: 'TRF002', nama: 'Konsultasi Dokter Spesialis', isActive: true, extra: { kategori: 'layanan', jumlah: 200000 } },
    { kode: 'TRF003', nama: 'Rawat Inap Kelas 3', isActive: true, extra: { kategori: 'kamar', jumlah: 200000 } },
    { kode: 'TRF004', nama: 'Rawat Inap Kelas 2', isActive: true, extra: { kategori: 'kamar', jumlah: 350000 } },
    { kode: 'TRF005', nama: 'Rawat Inap Kelas 1', isActive: true, extra: { kategori: 'kamar', jumlah: 500000 } },
    { kode: 'TRF006', nama: 'Rawat Inap VIP', isActive: true, extra: { kategori: 'kamar', jumlah: 1000000 } },
  ],
  obat: [
    { kode: 'OBT001', nama: 'Paracetamol 500mg', isActive: true, extra: { satuan: 'Tablet', harga: 2500, stok: 250 } },
    { kode: 'OBT002', nama: 'Amoxicillin 500mg', isActive: true, extra: { satuan: 'Kapsul', harga: 5000, stok: 120 } },
    { kode: 'OBT003', nama: 'Omeprazole 20mg', isActive: true, extra: { satuan: 'Kapsul', harga: 8000, stok: 80 } },
    { kode: 'OBT004', nama: 'Cetirizine 10mg', isActive: true, extra: { satuan: 'Tablet', harga: 3500, stok: 5 } },
    { kode: 'OBT005', nama: 'Metformin 500mg', isActive: true, extra: { satuan: 'Tablet', harga: 4000, stok: 45 } },
    { kode: 'OBT006', nama: 'Amlodipine 5mg', isActive: true, extra: { satuan: 'Tablet', harga: 6000, stok: 8 } },
    { kode: 'OBT007', nama: 'Ibuprofen 400mg', isActive: true, extra: { satuan: 'Tablet', harga: 3500, stok: 60 } },
    { kode: 'OBT008', nama: 'Ciprofloxacin 500mg', isActive: true, extra: { satuan: 'Tablet', harga: 7500, stok: 40 } },
    { kode: 'OBT009', nama: 'Dexamethasone 0.5mg', isActive: true, extra: { satuan: 'Tablet', harga: 3000, stok: 100 } },
    { kode: 'OBT010', nama: 'Lansoprazole 30mg', isActive: true, extra: { satuan: 'Kapsul', harga: 9000, stok: 35 } },
  ],
  tindakan: [
    { kode: 'TDK001', nama: 'Konsultasi Dokter Umum', isActive: true, extra: { kategori: 'konsultasi', tarif: 100000 } },
    { kode: 'TDK002', nama: 'Konsultasi Dokter Spesialis', isActive: true, extra: { kategori: 'konsultasi', tarif: 200000 } },
    { kode: 'TDK003', nama: 'Tindakan Medis Kecil', isActive: true, extra: { kategori: 'tindakan', tarif: 250000 } },
    { kode: 'TDK004', nama: 'Tindakan Medis Sedang', isActive: true, extra: { kategori: 'tindakan', tarif: 500000 } },
    { kode: 'TDK005', nama: 'Operasi Minor', isActive: true, extra: { kategori: 'operasi', tarif: 2000000 } },
    { kode: 'TDK006', nama: 'Operasi Mayor', isActive: true, extra: { kategori: 'operasi', tarif: 8000000 } },
    { kode: 'TDK007', nama: 'Rontgen', isActive: true, extra: { kategori: 'radiologi', tarif: 150000 } },
    { kode: 'TDK008', nama: 'USG', isActive: true, extra: { kategori: 'radiologi', tarif: 250000 } },
  ],
  group_tarif: [
    { kode: 'GT01', nama: 'Tarif Umum', isActive: true },
    { kode: 'GT02', nama: 'Tarif BPJS', isActive: true },
    { kode: 'GT03', nama: 'Tarif Asuransi', isActive: true },
    { kode: 'GT04', nama: 'Tarif Perusahaan', isActive: true },
  ],
  kelompok_cbg: [
    { kode: 'CBG01', nama: 'Kelompok Bedah', isActive: true },
    { kode: 'CBG02', nama: 'Kelompok Non-Bedah', isActive: true },
    { kode: 'CBG03', nama: 'Kelompok Obat', isActive: true },
    { kode: 'CBG04', nama: 'Kelompok Prosedur', isActive: true },
  ],
  validasi_rj: [
    { kode: 'VRJ01', nama: 'Validasi Konsultasi', isActive: true },
    { kode: 'VRJ02', nama: 'Validasi Tindakan', isActive: true },
    { kode: 'VRJ03', nama: 'Validasi Obat', isActive: true },
  ],
  signa: [
    { kode: '3X1', nama: '3 kali sehari 1', isActive: true },
    { kode: '2X1', nama: '2 kali sehari 1', isActive: true },
    { kode: '1X1', nama: '1 kali sehari 1', isActive: true },
    { kode: '3X2', nama: '3 kali sehari 2', isActive: true },
    { kode: 'PRN', nama: 'Jika perlu', isActive: true },
    { kode: 'AC', nama: 'Sebelum makan', isActive: true },
    { kode: 'PC', nama: 'Sesudah makan', isActive: true },
  ],
  cara_pakai: [
    { kode: 'ORAL', nama: 'Diminum', isActive: true },
    { kode: 'TOPIKAL', nama: 'Dioleskan', isActive: true },
    { kode: 'INJEKSI', nama: 'Disuntikkan', isActive: true },
    { kode: 'INHALASI', nama: 'Dihirup', isActive: true },
    { kode: 'SUBLINGUAL', nama: 'Dibawah lidah', isActive: true },
    { kode: 'REKTAL', nama: 'Melalui dubur', isActive: true },
  ],
  supplier: [
    { kode: 'SUP001', nama: 'PT Kimia Farma', isActive: true, extra: { alamat: 'Jakarta', telepon: '021-1234567' } },
    { kode: 'SUP002', nama: 'PT Kalbe Farma', isActive: true, extra: { alamat: 'Bekasi', telepon: '021-2345678' } },
    { kode: 'SUP003', nama: 'PT Sanbe Farma', isActive: true, extra: { alamat: 'Bandung', telepon: '022-1234567' } },
    { kode: 'SUP004', nama: 'PT Dexa Medica', isActive: true, extra: { alamat: 'Palembang', telepon: '0711-123456' } },
    { kode: 'SUP005', nama: 'PT Phapros', isActive: true, extra: { alamat: 'Semarang', telepon: '024-1234567' } },
  ],
  gudang: [
    { kode: 'GDG01', nama: 'Gudang Utama', isActive: true, extra: { lokasi: 'Lantai 1' } },
    { kode: 'GDG02', nama: 'Gudang Farmasi', isActive: true, extra: { lokasi: 'Lantai 2' } },
    { kode: 'GDG03', nama: 'Gudang Alkes', isActive: true, extra: { lokasi: 'Lantai 1' } },
  ],
  satuan: [
    { kode: 'TAB', nama: 'Tablet', isActive: true },
    { kode: 'KAP', nama: 'Kapsul', isActive: true },
    { kode: 'BTL', nama: 'Botol', isActive: true },
    { kode: 'AMP', nama: 'Ampul', isActive: true },
    { kode: 'VIA', nama: 'Vial', isActive: true },
    { kode: 'TUB', nama: 'Tube', isActive: true },
    { kode: 'PCS', nama: 'Pcs', isActive: true },
    { kode: 'SAC', nama: 'Sachet', isActive: true },
  ],
  kesatuan: [
    { kode: 'KST01', nama: 'TNI AD', isActive: true },
    { kode: 'KST02', nama: 'TNI AL', isActive: true },
    { kode: 'KST03', nama: 'TNI AU', isActive: true },
    { kode: 'KST04', nama: 'POLRI', isActive: true },
    { kode: 'KST05', nama: 'UMUM', isActive: true },
  ],
  pangkat: [
    { kode: 'PGK01', nama: 'PRAJURIT', isActive: true },
    { kode: 'PGK02', nama: 'BINTARA', isActive: true },
    { kode: 'PGK03', nama: 'PERWIRA', isActive: true },
    { kode: 'PGK04', nama: 'PNS', isActive: true },
  ],
  golongan: [
    { kode: 'GOL01', nama: 'Golongan I', isActive: true },
    { kode: 'GOL02', nama: 'Golongan II', isActive: true },
    { kode: 'GOL03', nama: 'Golongan III', isActive: true },
    { kode: 'GOL04', nama: 'Golongan IV', isActive: true },
  ],
  pendidikan: [
    { kode: 'PDD00', nama: 'BELUM SEKOLAH', isActive: true },
    { kode: 'PDD01', nama: 'SD', isActive: true },
    { kode: 'PDD02', nama: 'SMP', isActive: true },
    { kode: 'PDD03', nama: 'SMA', isActive: true },
    { kode: 'PDD04', nama: 'D3', isActive: true },
    { kode: 'PDD05', nama: 'S1', isActive: true },
    { kode: 'PDD06', nama: 'S2', isActive: true },
    { kode: 'PDD07', nama: 'S3', isActive: true },
  ],
  pekerjaan: [
    { kode: 'PKJ01', nama: 'PNS', isActive: true },
    { kode: 'PKJ02', nama: 'TNI/POLRI', isActive: true },
    { kode: 'PKJ03', nama: 'SWASTA', isActive: true },
    { kode: 'PKJ04', nama: 'WIRASWASTA', isActive: true },
    { kode: 'PKJ05', nama: 'PETANI', isActive: true },
    { kode: 'PKJ06', nama: 'BURUH', isActive: true },
    { kode: 'PKJ07', nama: 'PEDAGANG', isActive: true },
    { kode: 'PKJ08', nama: 'PELAJAR/MAHASISWA', isActive: true },
    { kode: 'PKJ09', nama: 'IRT', isActive: true },
    { kode: 'PKJ99', nama: 'LAINNYA', isActive: true },
  ],
  agama: [
    { kode: 'AGM01', nama: 'ISLAM', isActive: true },
    { kode: 'AGM02', nama: 'KRISTEN', isActive: true },
    { kode: 'AGM03', nama: 'KATOLIK', isActive: true },
    { kode: 'AGM04', nama: 'HINDU', isActive: true },
    { kode: 'AGM05', nama: 'BUDDHA', isActive: true },
    { kode: 'AGM06', nama: 'KONGHUCU', isActive: true },
  ],
  suku: [
    { kode: 'SKU01', nama: 'SUNDA', isActive: true },
    { kode: 'SKU02', nama: 'JAWA', isActive: true },
    { kode: 'SKU03', nama: 'BATAK', isActive: true },
    { kode: 'SKU04', nama: 'MINANG', isActive: true },
    { kode: 'SKU05', nama: 'BETAWI', isActive: true },
    { kode: 'SKU06', nama: 'MELAYU', isActive: true },
    { kode: 'SKU07', nama: 'BUGIS', isActive: true },
    { kode: 'SKU99', nama: 'LAINNYA', isActive: true },
  ],
  status_keluarga: [
    { kode: 'SK01', nama: 'KEPALA KELUARGA', isActive: true },
    { kode: 'SK02', nama: 'SUAMI', isActive: true },
    { kode: 'SK03', nama: 'ISTRI', isActive: true },
    { kode: 'SK04', nama: 'ANAK', isActive: true },
    { kode: 'SK05', nama: 'LAINNYA', isActive: true },
  ],
  perusahaan: [
    { kode: 'PRS01', nama: 'PT. TELKOM INDONESIA', isActive: true },
    { kode: 'PRS02', nama: 'PT. PLN (PERSERO)', isActive: true },
    { kode: 'PRS03', nama: 'PEMERINTAH DAERAH', isActive: true },
    { kode: 'PRS04', nama: 'PT. PERTAMINA', isActive: true },
    { kode: 'PRS05', nama: 'WIRASWASTA', isActive: true },
  ],
  penjamin: [
    { kode: 'PJM01', nama: 'Umum / Bayar Sendiri', isActive: true, extra: { tipe: 'umum' } },
    { kode: 'PJM02', nama: 'BPJS Kesehatan', isActive: true, extra: { tipe: 'bpjs' } },
    { kode: 'PJM03', nama: 'Asuransi Prudential', isActive: true, extra: { tipe: 'asuransi' } },
    { kode: 'PJM04', nama: 'Asuransi Allianz', isActive: true, extra: { tipe: 'asuransi' } },
    { kode: 'PJM05', nama: 'Asuransi Manulife', isActive: true, extra: { tipe: 'asuransi' } },
  ],
  type_pembayaran: [
    { kode: 'TPB01', nama: 'Tunai', isActive: true },
    { kode: 'TPB02', nama: 'Kartu Debit', isActive: true },
    { kode: 'TPB03', nama: 'Kartu Kredit', isActive: true },
    { kode: 'TPB04', nama: 'Transfer Bank', isActive: true },
  ],
  provinsi: [
    { kode: '32', nama: 'JAWA BARAT', isActive: true },
    { kode: '31', nama: 'DKI JAKARTA', isActive: true },
    { kode: '33', nama: 'JAWA TENGAH', isActive: true },
    { kode: '35', nama: 'JAWA TIMUR', isActive: true },
    { kode: '36', nama: 'BANTEN', isActive: true },
    { kode: '34', nama: 'DI YOGYAKARTA', isActive: true },
  ],
  kabupaten_kota: [
    { kode: '3204', nama: 'KAB. BANDUNG', isActive: true },
    { kode: '3273', nama: 'KOTA BANDUNG', isActive: true },
    { kode: '3171', nama: 'KOTA JAKARTA PUSAT', isActive: true },
    { kode: '3374', nama: 'KOTA SEMARANG', isActive: true },
    { kode: '3578', nama: 'KOTA SURABAYA', isActive: true },
    { kode: '3603', nama: 'KAB. TANGERANG', isActive: true },
  ],
  kecamatan: [
    { kode: '320401', nama: 'Kec. Cileunyi', isActive: true },
    { kode: '320402', nama: 'Kec. Cilengkrang', isActive: true },
    { kode: '320403', nama: 'Kec. Bojongsoang', isActive: true },
    { kode: '327301', nama: 'Kec. Bandung Wetan', isActive: true },
    { kode: '327302', nama: 'Kec. Sumur Bandung', isActive: true },
  ],
  kelurahan: [
    { kode: '3204010001', nama: 'Kel. Cileunyi Kulon', isActive: true },
    { kode: '3204010002', nama: 'Kel. Cileunyi Wetan', isActive: true },
    { kode: '3204020001', nama: 'Kel. Cilengkrang', isActive: true },
    { kode: '3273010001', nama: 'Kel. Citarum', isActive: true },
    { kode: '3273010002', nama: 'Kel. Tamansari', isActive: true },
  ],
  bagian: [
    { kode: 'BGN01', nama: 'Bagian Umum', isActive: true },
    { kode: 'BGN02', nama: 'Bagian Keuangan', isActive: true },
    { kode: 'BGN03', nama: 'Bagian Kepegawaian', isActive: true },
    { kode: 'BGN04', nama: 'Bagian Pelayanan', isActive: true },
    { kode: 'BGN05', nama: 'Bagian Rekam Medis', isActive: true },
  ],
  golongan_2: [
    { kode: 'GOL01', nama: 'Golongan I', isActive: true },
    { kode: 'GOL02', nama: 'Golongan II', isActive: true },
    { kode: 'GOL03', nama: 'Golongan III', isActive: true },
    { kode: 'GOL04', nama: 'Golongan IV', isActive: true },
  ],
  pendidikan_2: [
    { kode: 'PDD00', nama: 'BELUM SEKOLAH', isActive: true },
    { kode: 'PDD01', nama: 'SD', isActive: true },
    { kode: 'PDD02', nama: 'SMP', isActive: true },
    { kode: 'PDD03', nama: 'SMA', isActive: true },
    { kode: 'PDD04', nama: 'D3', isActive: true },
    { kode: 'PDD05', nama: 'S1', isActive: true },
    { kode: 'PDD06', nama: 'S2', isActive: true },
    { kode: 'PDD07', nama: 'S3', isActive: true },
  ],
  anggota: [
    { kode: 'ANG01', nama: 'Anggota Aktif', isActive: true },
    { kode: 'ANG02', nama: 'Anggota Pensiunan', isActive: true },
    { kode: 'ANG03', nama: 'Keluarga Anggota', isActive: true },
    { kode: 'ANG04', nama: 'Non-Anggota', isActive: true },
  ],
  pdf: [
    { kode: 'PDF01', nama: 'Template Surat Keterangan Sehat', isActive: true },
    { kode: 'PDF02', nama: 'Template Resume Medis', isActive: true },
    { kode: 'PDF03', nama: 'Template Informed Consent', isActive: true },
  ],
  profesi: [
    { kode: 'PRF01', nama: 'Dokter Umum', isActive: true },
    { kode: 'PRF02', nama: 'Dokter Spesialis', isActive: true },
    { kode: 'PRF03', nama: 'Perawat', isActive: true },
    { kode: 'PRF04', nama: 'Bidan', isActive: true },
    { kode: 'PRF05', nama: 'Apoteker', isActive: true },
    { kode: 'PRF06', nama: 'Analis Kesehatan', isActive: true },
  ],
  diagnosa_perawat: [
    { kode: 'DP01', nama: 'Nyeri Akut', isActive: true },
    { kode: 'DP02', nama: 'Risiko Infeksi', isActive: true },
    { kode: 'DP03', nama: 'Gangguan Pola Tidur', isActive: true },
    { kode: 'DP04', nama: 'Defisit Nutrisi', isActive: true },
    { kode: 'DP05', nama: 'Gangguan Mobilitas Fisik', isActive: true },
  ],
  dokumen_master: [
    { kode: 'DOC01', nama: 'Surat Keterangan Sakit', isActive: true },
    { kode: 'DOC02', nama: 'Surat Rujukan', isActive: true },
    { kode: 'DOC03', nama: 'Resume Medis', isActive: true },
    { kode: 'DOC04', nama: 'Informed Consent', isActive: true },
  ],
  item_5: [
    { kode: 'IT501', nama: 'Item 5 Data 1', isActive: true },
    { kode: 'IT502', nama: 'Item 5 Data 2', isActive: true },
  ],
  item_6: [
    { kode: 'IT601', nama: 'Item 6 Data 1', isActive: true },
    { kode: 'IT602', nama: 'Item 6 Data 2', isActive: true },
  ],
};

function initializePasienSeed(): void {
  const key = getStorageKey('adm_pasien');
  const existing = storageService.get<ReferensiItem[]>(key);
  if (existing && existing.length > 0) return;
  const items: ReferensiItem[] = PASIEN_SEED.map(s => ({ ...s, id: generateId() }));
  storageService.set(key, items);
}

function initializeAllSeeds(menuKey: string): void {
  const seedItems = SEED_DATA[menuKey];
  if (!seedItems) return;
  const key = getStorageKey(menuKey);
  const existing = storageService.get<ReferensiItem[]>(key);
  if (existing && existing.length > 0) return;
  const items: ReferensiItem[] = seedItems.map(s => ({ ...s, id: generateId() }));
  storageService.set(key, items);
}

function getAllRaw(menuKey: string): ReferensiItem[] {
  if (menuKey === 'adm_pasien') {
    initializePasienSeed();
  }
  initializeAllSeeds(menuKey);
  return storageService.get<ReferensiItem[]>(getStorageKey(menuKey)) || [];
}

function saveAll(menuKey: string, data: ReferensiItem[]): void {
  storageService.set(getStorageKey(menuKey), data);
}

export const referensiService = {
  getAll(menuKey: string, search = ''): ReferensiItem[] {
    let items = getAllRaw(menuKey);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (item) =>
          item.kode.toLowerCase().includes(q) ||
          item.nama.toLowerCase().includes(q)
      );
    }
    return items;
  },

  getById(menuKey: string, id: string): ReferensiItem | null {
    const items = getAllRaw(menuKey);
    return items.find((item) => item.id === id) || null;
  },

  create(menuKey: string, data: Omit<ReferensiItem, 'id'>): ReferensiItem {
    const items = getAllRaw(menuKey);
    const newItem: ReferensiItem = { ...data, id: generateId() };
    items.push(newItem);
    saveAll(menuKey, items);
    return newItem;
  },

  update(menuKey: string, id: string, data: Partial<ReferensiItem>): ReferensiItem | null {
    const items = getAllRaw(menuKey);
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return null;
    items[index] = { ...items[index], ...data };
    saveAll(menuKey, items);
    return items[index];
  },

  remove(menuKey: string, id: string): boolean {
    const items = getAllRaw(menuKey);
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return false;
    items.splice(index, 1);
    saveAll(menuKey, items);
    return true;
  },

  getNextRMNumber(): string {
    const items = getAllRaw('adm_pasien');
    if (items.length === 0) return '000271691';
    const maxNum = items.reduce((max, item) => {
      const num = parseInt(item.kode, 10);
      return isNaN(num) ? max : Math.max(max, num);
    }, 0);
    return String(maxNum + 1).padStart(9, '0');
  },
};
