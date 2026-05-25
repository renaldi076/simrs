import React, { useState, useEffect, useCallback } from 'react';
import {
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Pencil,
  Printer,
  RefreshCw,
  ClipboardList,
  Trash2,
  XCircle,
  Phone,
  RotateCcw,
  Monitor,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { storageService } from '@/services/storageService';
import { generateId } from '@/utils/formatters';

// --- Types ---
interface PendaftaranRecord {
  id: string;
  nomorPendaftaran: string;
  tanggalDatang: string;
  jenisDaftar: string;
  jenisPeserta: string;
  statusKecelakaan: string;
  tindakLanjut: string;
  datangVia: string;
  l6: string;
  rekamMedis: string;
  tampilanNama: string;
  dokter: string;
  tujuan: string;
  poliRuangan: string;
  noSEP: string;
  noSKD: string;
  tujuanKunjungan: string;
  userPendaftaran: string;
  statusDaftar: string;
  // new fields
  kodeBooking?: string;
  jenisPelayanan?: string;
  noKartuBpjs?: string;
  noNIK?: string;
  diagnosa?: string;
  nomerAntrianPoli?: string;
  asalRujukan?: string;
  noRujukan?: string;
  tglRujukan?: string;
  noSuratKontrol?: string;
  dpjpPemberiSurat?: string;
  cob?: string;
  noTelepon?: string;
  kelasHakRawat?: string;
  catatan?: string;
  asesmenPelayanan?: string;
  // Informasi Pasien
  alamatPasien?: string;
  statusKeluargaPasien?: string;
  kesatuanPasien?: string;
  // Penanggung Jawab
  namaPJ?: string;
  hubunganPJ?: string;
  alamatPJ?: string;
  teleponPJ?: string;
  // Naik Kelas
  naikKelasRawat?: string;
  pembiayaan?: string;
  penanggungJawabKelas?: string;
  // SEP Internal
  noSEPInternal?: string;
  nomorSurat?: string;
  tglRujukanInternal?: string;
  kodePoli?: string;
}

interface MenuItem {
  type: 'item';
  key: string;
  label: string;
}

interface MenuSeparator {
  type: 'separator';
}

interface MenuGroup {
  type: 'group';
  key: string;
  label: string;
  children: (MenuItem | MenuSeparator)[];
}

type MenuEntry = MenuItem | MenuSeparator | MenuGroup;

// --- Menu Definition ---
const ANTRIAN_CHILDREN: (MenuItem | MenuSeparator)[] = [
  { type: 'item', key: 'layar_operasi', label: 'Layar Operasi' },
  { type: 'item', key: 'layar_antrian', label: 'Layar Antrian' },
  { type: 'separator' },
  { type: 'item', key: 'mesin_antrian_pasien', label: 'MESIN ANTRIAN PASIEN' },
  { type: 'separator' },
  { type: 'item', key: 'mesin_antrian_user', label: 'MESIN ANTRIAN USER' },
];

const PEMETAAN_CHILDREN: (MenuItem | MenuSeparator)[] = [
  { type: 'item', key: 'dashboard_rs', label: 'Dashboard RS' },
  { type: 'item', key: 'pemetaan_ruangan', label: 'Pemetaan Ruangan' },
  { type: 'item', key: 'data_aplicares', label: 'Data Aplicares' },
  { type: 'item', key: 'sirs', label: 'SIRS' },
];

const ADMISSION_MENU: MenuEntry[] = [
  { type: 'group', key: 'antrian', label: 'Antrian', children: ANTRIAN_CHILDREN },
  { type: 'separator' },
  { type: 'item', key: 'pendaftaran', label: 'Pendaftaran' },
  { type: 'separator' },
  { type: 'item', key: 'rencana_kontrol', label: 'Rencana Kontrol/SPRI' },
  { type: 'item', key: 'approval_penjamin', label: 'Approval Penjamin SEP' },
  { type: 'item', key: 'pasien_pulang', label: 'Pasien Pulang' },
  { type: 'item', key: 'rujukan', label: 'Rujukan' },
  { type: 'item', key: 'prb', label: 'Pembuatan Rujuk Balik (PRB)' },
  { type: 'separator' },
  { type: 'item', key: 'jadwal_operasi', label: 'Jadwal Operasi' },
  { type: 'separator' },
  { type: 'item', key: 'mutasi_pasien', label: 'Mutasi Pasien' },
  { type: 'group', key: 'pemetaan_ruangan', label: 'Pemetaan Ruangan', children: PEMETAAN_CHILDREN },
  { type: 'separator' },
  { type: 'item', key: 'lembar_klaim', label: 'Lembar Pengajuan Klaim' },
  { type: 'separator' },
  { type: 'group', key: 'laporan', label: 'Laporan', children: [] },
];

// --- Seed Data ---
const STORAGE_KEY = 'admission_pendaftaran';

function getSeedData(): PendaftaranRecord[] {
  return [
    { id: generateId(), nomorPendaftaran: 'RJ2026E008091', tanggalDatang: '2026-05-20T14:09:00', jenisDaftar: 'BPJS', jenisPeserta: 'PEGAWAI PEMERINTAH DENGAN PERJANJIAN KERJA', statusKecelakaan: 'BUKAN KECELAKAAN', tindakLanjut: '-', datangVia: 'LANGSUNG', l6: '-', rekamMedis: '000205603', tampilanNama: 'TANZILA QURROTA', dokter: 'dr. ABDURRAHMAN, Sp.OT', tujuan: 'Orthopedi', poliRuangan: 'Poli Orthopedi', noSEP: '0014R00108260520001', noSKD: '-', tujuanKunjungan: 'Konsultasi', userPendaftaran: 'ADM_RINA', statusDaftar: 'Terdaftar' },
    { id: generateId(), nomorPendaftaran: 'RJ2026E008089', tanggalDatang: '2026-05-20T14:07:00', jenisDaftar: 'BPJS', jenisPeserta: 'PEKERJA MANDIRI', statusKecelakaan: 'BUKAN KECELAKAAN', tindakLanjut: '-', datangVia: 'LANGSUNG', l6: '-', rekamMedis: '000269353', tampilanNama: 'WAHYUNI DEWI', dokter: 'dr. Hendra Sp.PD', tujuan: 'Penyakit Dalam', poliRuangan: 'Poli Penyakit Dalam', noSEP: '0014R00108260520002', noSKD: '-', tujuanKunjungan: 'Kontrol', userPendaftaran: 'ADM_SITI', statusDaftar: 'Terdaftar' },
    { id: generateId(), nomorPendaftaran: 'RJ2026E008090', tanggalDatang: '2026-05-20T14:06:00', jenisDaftar: 'BPJS', jenisPeserta: 'PEKERJA MANDIRI', statusKecelakaan: 'BUKAN KECELAKAAN', tindakLanjut: '-', datangVia: 'LANGSUNG', l6: '-', rekamMedis: '000269571', tampilanNama: 'IIS YUNINGSIH', dokter: 'dr. Sari Sp.OG', tujuan: 'Kandungan', poliRuangan: 'Poli Kandungan', noSEP: '0014R00108260520003', noSKD: '-', tujuanKunjungan: 'Kontrol', userPendaftaran: 'ADM_RINA', statusDaftar: 'Terdaftar' },
    { id: generateId(), nomorPendaftaran: 'RJ2026E008087', tanggalDatang: '2026-05-20T14:05:00', jenisDaftar: 'BPJS', jenisPeserta: 'PEKERJA MANDIRI', statusKecelakaan: 'BUKAN KECELAKAAN', tindakLanjut: '-', datangVia: 'LANGSUNG', l6: '-', rekamMedis: '000241813', tampilanNama: 'DENNY MULYANA', dokter: 'dr. Ahmad Sp.A', tujuan: 'Anak', poliRuangan: 'Poli Anak', noSEP: '0014R00108260520004', noSKD: '-', tujuanKunjungan: 'Konsultasi', userPendaftaran: 'ADM_SITI', statusDaftar: 'Terdaftar' },
    { id: generateId(), nomorPendaftaran: 'RJ2026E008085', tanggalDatang: '2026-05-20T14:03:00', jenisDaftar: 'BPJS', jenisPeserta: 'PBI (APBN)', statusKecelakaan: 'BUKAN KECELAKAAN', tindakLanjut: '-', datangVia: 'LANGSUNG', l6: '-', rekamMedis: '000271687', tampilanNama: 'ENAN', dokter: 'dr. Budi Sp.JP', tujuan: 'Jantung', poliRuangan: 'Poli Jantung', noSEP: '0014R00108260520005', noSKD: '-', tujuanKunjungan: 'Konsultasi', userPendaftaran: 'ADM_RINA', statusDaftar: 'Terdaftar' },
    { id: generateId(), nomorPendaftaran: 'RJ2026E008084', tanggalDatang: '2026-05-20T14:03:00', jenisDaftar: 'BPJS', jenisPeserta: 'PEGAWAI PEMERINTAH DENGAN PERJANJIAN KERJA', statusKecelakaan: 'BUKAN KECELAKAAN', tindakLanjut: '-', datangVia: 'LANGSUNG', l6: '-', rekamMedis: '000023229', tampilanNama: 'HAFSAH YULIA', dokter: 'dr. Wati Sp.B', tujuan: 'Bedah', poliRuangan: 'Poli Bedah', noSEP: '0014R00108260520006', noSKD: '-', tujuanKunjungan: 'Kontrol', userPendaftaran: 'ADM_SITI', statusDaftar: 'Terdaftar' },
    { id: generateId(), nomorPendaftaran: 'RJ2026E008088', tanggalDatang: '2026-05-20T14:03:00', jenisDaftar: 'BPJS', jenisPeserta: 'PBI (APBD)', statusKecelakaan: 'BUKAN KECELAKAAN', tindakLanjut: '-', datangVia: 'LANGSUNG', l6: '-', rekamMedis: '000271688', tampilanNama: 'JUITA SARI', dokter: 'dr. Hendra Sp.PD', tujuan: 'Penyakit Dalam', poliRuangan: 'Poli Penyakit Dalam', noSEP: '0014R00108260520007', noSKD: '-', tujuanKunjungan: 'Konsultasi', userPendaftaran: 'ADM_RINA', statusDaftar: 'Terdaftar' },
    { id: generateId(), nomorPendaftaran: 'RJ2026E008030', tanggalDatang: '2026-05-20T13:14:00', jenisDaftar: 'UMUM', jenisPeserta: '-', statusKecelakaan: 'BUKAN KECELAKAAN', tindakLanjut: '-', datangVia: 'LANGSUNG', l6: '-', rekamMedis: '109338', tampilanNama: 'AHMAD FAUZI', dokter: 'dr. MOCHAMMAD ECKY PRATAMA, Sp.U', tujuan: 'Urologi', poliRuangan: 'Poli Urologi', noSEP: '-', noSKD: '-', tujuanKunjungan: 'Konsultasi', userPendaftaran: 'ADM_BUDI', statusDaftar: 'Terdaftar' },
    { id: generateId(), nomorPendaftaran: 'RJ2026E008027', tanggalDatang: '2026-05-20T13:12:00', jenisDaftar: 'BPJS', jenisPeserta: 'PEKERJA MANDIRI', statusKecelakaan: 'BUKAN KECELAKAAN', tindakLanjut: '-', datangVia: 'LANGSUNG', l6: '-', rekamMedis: '000268427', tampilanNama: 'SRI MULYANI', dokter: 'dr. Hendra Sp.PD', tujuan: 'Penyakit Dalam', poliRuangan: 'Poli Penyakit Dalam', noSEP: '0014R00108260520008', noSKD: '-', tujuanKunjungan: 'Kontrol', userPendaftaran: 'ADM_RINA', statusDaftar: 'Terdaftar' },
    { id: generateId(), nomorPendaftaran: 'RJ2026E008028', tanggalDatang: '2026-05-20T13:12:00', jenisDaftar: 'BPJS', jenisPeserta: 'PBI (APBD)', statusKecelakaan: 'BUKAN KECELAKAAN', tindakLanjut: '-', datangVia: 'LANGSUNG', l6: '-', rekamMedis: '000257898', tampilanNama: 'NINING SUHARTI', dokter: 'dr. Sari Sp.OG', tujuan: 'Kandungan', poliRuangan: 'Poli Kandungan', noSEP: '0014R00108260520009', noSKD: '-', tujuanKunjungan: 'Konsultasi', userPendaftaran: 'ADM_SITI', statusDaftar: 'Terdaftar' },
    { id: generateId(), nomorPendaftaran: 'RJ2026E008026', tanggalDatang: '2026-05-20T13:11:00', jenisDaftar: 'BPJS', jenisPeserta: 'PEKERJA MANDIRI', statusKecelakaan: 'BUKAN KECELAKAAN', tindakLanjut: '-', datangVia: 'LANGSUNG', l6: '-', rekamMedis: '000270517', tampilanNama: 'BAMBANG SUGIARTO', dokter: 'dr. Budi Sp.JP', tujuan: 'Jantung', poliRuangan: 'Poli Jantung', noSEP: '0014R00108260520010', noSKD: '-', tujuanKunjungan: 'Kontrol', userPendaftaran: 'ADM_BUDI', statusDaftar: 'Terdaftar' },
    { id: generateId(), nomorPendaftaran: 'RJ2026E008029', tanggalDatang: '2026-05-20T13:11:00', jenisDaftar: 'BPJS', jenisPeserta: 'PNS PUSAT', statusKecelakaan: 'BUKAN KECELAKAAN', tindakLanjut: '-', datangVia: 'LANGSUNG', l6: '-', rekamMedis: '000271673', tampilanNama: 'SOPIAN HADI', dokter: 'dr. Ahmad Sp.A', tujuan: 'Anak', poliRuangan: 'Poli Anak', noSEP: '0014R00108260520011', noSKD: '-', tujuanKunjungan: 'Konsultasi', userPendaftaran: 'ADM_RINA', statusDaftar: 'Terdaftar' },
    { id: generateId(), nomorPendaftaran: 'RJ2026E008025', tanggalDatang: '2026-05-20T13:10:00', jenisDaftar: 'BPJS', jenisPeserta: 'PBI (APBN)', statusKecelakaan: 'BUKAN KECELAKAAN', tindakLanjut: '-', datangVia: 'LANGSUNG', l6: '-', rekamMedis: '000208474', tampilanNama: 'CUCU RAHAYU', dokter: 'dr. Wati Sp.B', tujuan: 'Bedah', poliRuangan: 'Poli Bedah', noSEP: '0014R00108260520012', noSKD: '-', tujuanKunjungan: 'Kontrol', userPendaftaran: 'ADM_SITI', statusDaftar: 'Terdaftar' },
    { id: generateId(), nomorPendaftaran: 'RJ2026E008023', tanggalDatang: '2026-05-20T13:09:00', jenisDaftar: 'BPJS', jenisPeserta: 'PEGAWAI SWASTA', statusKecelakaan: 'BUKAN KECELAKAAN', tindakLanjut: '-', datangVia: 'LANGSUNG', l6: '-', rekamMedis: '000268063', tampilanNama: 'WAWAN SETIAWAN', dokter: 'dr. Hendra Sp.PD', tujuan: 'Penyakit Dalam', poliRuangan: 'Poli Penyakit Dalam', noSEP: '0014R00108260520013', noSKD: '-', tujuanKunjungan: 'Konsultasi', userPendaftaran: 'ADM_BUDI', statusDaftar: 'Terdaftar' },
  ];
}

function initializePendaftaran(): PendaftaranRecord[] {
  const existing = storageService.get<PendaftaranRecord[]>(STORAGE_KEY);
  if (existing && existing.length > 0) return existing;
  // Use today's date for seed data so it shows in the default date filter
  const today = new Date().toISOString().split('T')[0];
  const seed = getSeedData().map(r => ({
    ...r,
    tanggalDatang: r.tanggalDatang.replace('2026-05-20', today),
  }));
  storageService.set(STORAGE_KEY, seed);
  return seed;
}

// --- Format date for display ---
function formatTanggal(isoStr: string): string {
  const d = new Date(isoStr);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${mi}:${ss}`;
}

// --- Pendaftaran Content Component ---
function PendaftaranContent() {
  const [data, setData] = useState<PendaftaranRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PendaftaranRecord | null>(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Form state as single object
  const defaultFormData = {
    nama: '',
    rekamMedis: '',
    jenisDaftar: 'BPJS',
    jenisPeserta: 'PEKERJA PENERIMA UPAH',
    noSEP: '-',
    noSKD: '-',
    poliRuangan: 'Poli Penyakit Dalam',
    dokter: 'dr. Hendra Sp.PD',
    statusKecelakaan: 'BUKAN KECELAKAAN',
    tindakLanjut: '-',
    datangVia: 'LANGSUNG',
    l6: '-',
    tujuanKunjungan: 'Konsultasi',
    statusDaftar: 'Terdaftar',
    // new fields
    kodeBooking: '',
    jenisPelayanan: 'Rawat Jalan',
    offline: false,
    tanpaAntrian: false,
    noKartuBpjs: '',
    noNIK: '',
    diagnosa: '',
    nomerAntrianPoli: '',
    asalRujukan: 'Faskes 1',
    faskes: '',
    noRujukan: '',
    tglRujukan: '',
    noSuratKontrol: '',
    dpjpPemberiSurat: '',
    cob: '',
    cobChecked: false,
    noTelepon: '',
    kelasHakRawat: '',
    catatan: '',
    asesmenPelayanan: '',
    eksekutif: false,
    katarak: false,
    // Informasi Pasien
    alamatPasien: '',
    penjaminPasien: '',
    statusKeluargaPasien: '',
    kesatuanPasien: '',
    // Penanggung Jawab
    namaPJ: '',
    hubunganPJ: 'SUAMI/ISTRI',
    alamatPJ: '',
    teleponPJ: '',
    // Potensi Suplesi
    penjaminKLL: false,
    jasaRaharja: false,
    bpjsKetenagakerjaan: false,
    taspen: false,
    asabri: false,
    tanggalKejadian: '',
    suplesi: false,
    noKartuPesertaSuplesi: '',
    noSEPSuplesi: '',
    provinsiSuplesi: '',
    kabupatenSuplesi: '',
    kecamatanSuplesi: '',
    // Naik Kelas
    naikKelasRawat: '',
    pembiayaan: 'Pribadi',
    penanggungJawabKelas: 'Pribadi',
    // SEP Internal
    noSEPInternal: '',
    nomorSurat: '',
    tglRujukanInternal: '',
    kodePoli: '',
  };
  const [formData, setFormData] = useState(defaultFormData);
  const [activeTab, setActiveTab] = useState('informasi_pasien');

  const updateForm = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const loadData = useCallback(() => {
    let all = storageService.get<PendaftaranRecord[]>(STORAGE_KEY) || [];
    if (all.length === 0) {
      all = initializePendaftaran();
    }
    let filtered = all;

    // Filter by date range (only if both dates are set and not empty)
    if (fromDate && toDate && fromDate.trim() !== '' && toDate.trim() !== '') {
      const from = new Date(fromDate + 'T00:00:00');
      const to = new Date(toDate + 'T23:59:59');
      if (!isNaN(from.getTime()) && !isNaN(to.getTime())) {
        filtered = filtered.filter(r => {
          const d = new Date(r.tanggalDatang);
          return d >= from && d <= to;
        });
      }
    }

    // Filter by search text
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(r =>
        r.nomorPendaftaran.toLowerCase().includes(q) ||
        r.tampilanNama.toLowerCase().includes(q) ||
        r.rekamMedis.includes(q)
      );
    }

    // Sort by tanggal descending (newest first)
    filtered.sort((a, b) => new Date(b.tanggalDatang).getTime() - new Date(a.tanggalDatang).getTime());

    setData(filtered);
  }, [search, fromDate, toDate]);

  useEffect(() => { loadData(); }, [loadData]);

  const selectedRecord = data.find(r => r.id === selectedId) || null;

  function resetForm() {
    setFormData({ ...defaultFormData });
    setActiveTab('informasi_pasien');
  }

  function handleAdd() {
    setEditingRecord(null);
    resetForm();
    setShowModal(true);
  }

  function handleEdit() {
    if (!selectedRecord) return;
    setEditingRecord(selectedRecord);
    setFormData({
      ...defaultFormData,
      nama: selectedRecord.tampilanNama,
      rekamMedis: selectedRecord.rekamMedis,
      jenisDaftar: selectedRecord.jenisDaftar,
      jenisPeserta: selectedRecord.jenisPeserta,
      noSEP: selectedRecord.noSEP,
      noSKD: selectedRecord.noSKD,
      poliRuangan: selectedRecord.poliRuangan,
      dokter: selectedRecord.dokter,
      statusKecelakaan: selectedRecord.statusKecelakaan,
      tindakLanjut: selectedRecord.tindakLanjut,
      datangVia: selectedRecord.datangVia,
      l6: selectedRecord.l6,
      tujuanKunjungan: selectedRecord.tujuanKunjungan,
      statusDaftar: selectedRecord.statusDaftar,
      kodeBooking: selectedRecord.kodeBooking || '',
      jenisPelayanan: selectedRecord.jenisPelayanan || 'Rawat Jalan',
      noKartuBpjs: selectedRecord.noKartuBpjs || '',
      noNIK: selectedRecord.noNIK || '',
      diagnosa: selectedRecord.diagnosa || '',
      nomerAntrianPoli: selectedRecord.nomerAntrianPoli || '',
      asalRujukan: selectedRecord.asalRujukan || 'Faskes 1',
      noRujukan: selectedRecord.noRujukan || '',
      tglRujukan: selectedRecord.tglRujukan || '',
      noSuratKontrol: selectedRecord.noSuratKontrol || '',
      dpjpPemberiSurat: selectedRecord.dpjpPemberiSurat || '',
      cob: selectedRecord.cob || '',
      noTelepon: selectedRecord.noTelepon || '',
      kelasHakRawat: selectedRecord.kelasHakRawat || '',
      catatan: selectedRecord.catatan || '',
      asesmenPelayanan: selectedRecord.asesmenPelayanan || '',
      alamatPasien: selectedRecord.alamatPasien || '',
      statusKeluargaPasien: selectedRecord.statusKeluargaPasien || '',
      kesatuanPasien: selectedRecord.kesatuanPasien || '',
      namaPJ: selectedRecord.namaPJ || '',
      hubunganPJ: selectedRecord.hubunganPJ || 'SUAMI/ISTRI',
      alamatPJ: selectedRecord.alamatPJ || '',
      teleponPJ: selectedRecord.teleponPJ || '',
      naikKelasRawat: selectedRecord.naikKelasRawat || '',
      pembiayaan: selectedRecord.pembiayaan || 'Pribadi',
      penanggungJawabKelas: selectedRecord.penanggungJawabKelas || 'Pribadi',
      noSEPInternal: selectedRecord.noSEPInternal || '',
      nomorSurat: selectedRecord.nomorSurat || '',
      tglRujukanInternal: selectedRecord.tglRujukanInternal || '',
      kodePoli: selectedRecord.kodePoli || '',
    });
    setActiveTab('informasi_pasien');
    setShowModal(true);
  }

  function handleSubmit() {
    if (!formData.nama.trim()) return;
    const all = storageService.get<PendaftaranRecord[]>(STORAGE_KEY) || [];

    const extraFields = {
      kodeBooking: formData.kodeBooking,
      jenisPelayanan: formData.jenisPelayanan,
      noKartuBpjs: formData.noKartuBpjs,
      noNIK: formData.noNIK,
      diagnosa: formData.diagnosa,
      nomerAntrianPoli: formData.nomerAntrianPoli,
      asalRujukan: formData.asalRujukan,
      noRujukan: formData.noRujukan,
      tglRujukan: formData.tglRujukan,
      noSuratKontrol: formData.noSuratKontrol,
      dpjpPemberiSurat: formData.dpjpPemberiSurat,
      cob: formData.cob,
      noTelepon: formData.noTelepon,
      kelasHakRawat: formData.kelasHakRawat,
      catatan: formData.catatan,
      asesmenPelayanan: formData.asesmenPelayanan,
      alamatPasien: formData.alamatPasien,
      statusKeluargaPasien: formData.statusKeluargaPasien,
      kesatuanPasien: formData.kesatuanPasien,
      namaPJ: formData.namaPJ,
      hubunganPJ: formData.hubunganPJ,
      alamatPJ: formData.alamatPJ,
      teleponPJ: formData.teleponPJ,
      naikKelasRawat: formData.naikKelasRawat,
      pembiayaan: formData.pembiayaan,
      penanggungJawabKelas: formData.penanggungJawabKelas,
      noSEPInternal: formData.noSEPInternal,
      nomorSurat: formData.nomorSurat,
      tglRujukanInternal: formData.tglRujukanInternal,
      kodePoli: formData.kodePoli,
    };

    if (editingRecord) {
      const idx = all.findIndex(r => r.id === editingRecord.id);
      if (idx !== -1) {
        all[idx] = {
          ...all[idx],
          tampilanNama: formData.nama.toUpperCase(),
          rekamMedis: formData.rekamMedis || all[idx].rekamMedis,
          jenisDaftar: formData.jenisDaftar,
          jenisPeserta: formData.jenisPeserta,
          noSEP: formData.noSEP,
          noSKD: formData.noSKD,
          poliRuangan: formData.poliRuangan,
          dokter: formData.dokter,
          statusKecelakaan: formData.statusKecelakaan,
          tindakLanjut: formData.tindakLanjut,
          datangVia: formData.datangVia,
          l6: formData.l6,
          tujuanKunjungan: formData.tujuanKunjungan,
          tujuan: formData.poliRuangan,
          statusDaftar: formData.statusDaftar,
          userPendaftaran: all[idx].userPendaftaran,
          ...extraFields,
        };
        storageService.set(STORAGE_KEY, all);
      }
    } else {
      const nextNum = all.length + 1;
      const now = new Date();
      const tanggal = now.toISOString();
      const newRecord: PendaftaranRecord = {
        id: generateId(),
        nomorPendaftaran: `RJ2026E${String(nextNum + 8082).padStart(6, '0')}`,
        tanggalDatang: tanggal,
        jenisDaftar: formData.jenisDaftar,
        jenisPeserta: formData.jenisPeserta,
        statusKecelakaan: formData.statusKecelakaan,
        tindakLanjut: formData.tindakLanjut,
        datangVia: formData.datangVia,
        l6: formData.l6,
        rekamMedis: formData.rekamMedis || String(271690 + nextNum).padStart(9, '0'),
        tampilanNama: formData.nama.toUpperCase(),
        dokter: formData.dokter,
        tujuan: formData.poliRuangan,
        poliRuangan: formData.poliRuangan,
        noSEP: formData.noSEP,
        noSKD: formData.noSKD,
        tujuanKunjungan: formData.tujuanKunjungan,
        userPendaftaran: 'ADM_USER',
        statusDaftar: formData.statusDaftar,
        ...extraFields,
      };
      all.unshift(newRecord);
      storageService.set(STORAGE_KEY, all);
    }

    setShowModal(false);
    setEditingRecord(null);
    // Clear date filter so new data always shows
    setFromDate('');
    setToDate('');
    // Small timeout to let state update before loading
    setTimeout(() => loadData(), 50);
  }

  function handleDelete() {
    if (!selectedId) return;
    setDeleteConfirmOpen(true);
  }

  function confirmDelete() {
    if (!selectedId) return;
    const all = storageService.get<PendaftaranRecord[]>(STORAGE_KEY) || [];
    const filtered = all.filter(r => r.id !== selectedId);
    storageService.set(STORAGE_KEY, filtered);
    setSelectedId(null);
    setDeleteConfirmOpen(false);
    loadData();
  }

  function handleRefresh() {
    loadData();
  }

  function handleOperasi() {
    if (!selectedRecord) return;
    alert(`Fitur operasi untuk pasien: ${selectedRecord.tampilanNama}`);
  }

  function handleCetak() {
    window.print();
  }

  function handleBatal() {
    if (showModal) {
      setShowModal(false);
      setEditingRecord(null);
    } else {
      setSelectedId(null);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="border-b border-gray-300 bg-gray-50 p-3">
        <div className="flex flex-wrap gap-4">
          {/* Transaksi section */}
          <div className="border border-gray-300 rounded p-3">
            <div className="text-[11px] font-semibold text-gray-500 mb-2">Transaksi</div>
            <div className="flex items-center gap-2">
              <button onClick={handleAdd} className="p-2 hover:bg-blue-100 rounded text-blue-600 border border-transparent hover:border-blue-300" title="Tambah"><Plus size={20} /></button>
              <button onClick={handleEdit} className="p-2 hover:bg-yellow-100 rounded text-yellow-600 border border-transparent hover:border-yellow-300" title="Edit"><Pencil size={20} /></button>
              <button onClick={handleCetak} className="p-2 hover:bg-green-100 rounded text-green-600 border border-transparent hover:border-green-300" title="Cetak"><Printer size={20} /></button>
              <button onClick={handleRefresh} className="p-2 hover:bg-cyan-100 rounded text-cyan-600 border border-transparent hover:border-cyan-300" title="Refresh"><RefreshCw size={20} /></button>
              <button onClick={handleOperasi} className="p-2 hover:bg-purple-100 rounded text-purple-600 border border-transparent hover:border-purple-300" title="Operasi"><ClipboardList size={20} /></button>
              <button onClick={handleDelete} className="p-2 hover:bg-red-100 rounded text-red-600 border border-transparent hover:border-red-300" title="Hapus"><Trash2 size={20} /></button>
              <button onClick={handleBatal} className="p-2 hover:bg-gray-200 rounded text-gray-600 border border-transparent hover:border-gray-400" title="Batal"><XCircle size={20} /></button>
              <div className="ml-3 flex items-center gap-2 text-xs">
                <span className="text-gray-600 font-medium">Dari Tanggal:</span>
                <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-xs" />
                <span className="text-gray-600 font-medium">Sampai Tanggal:</span>
                <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-xs" />
              </div>
            </div>
          </div>
          {/* Panggil Antrian section */}
          <div className="border border-gray-300 rounded p-3">
            <div className="text-[11px] font-semibold text-gray-500 mb-2">Panggil Antrian</div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button className="px-2.5 py-1.5 text-[11px] bg-green-600 text-white rounded hover:bg-green-700"><Phone size={12} className="inline mr-1" />BPJS</button>
              <button className="px-2.5 py-1.5 text-[11px] bg-yellow-500 text-white rounded hover:bg-yellow-600"><RotateCcw size={12} className="inline mr-1" />Ulang</button>
              <button className="px-2.5 py-1.5 text-[11px] bg-red-500 text-white rounded hover:bg-red-600"><Monitor size={12} className="inline mr-1" />Reset</button>
              <div className="ml-2 flex items-center gap-1 text-[11px]">
                <span className="text-gray-500">Kode:</span>
                <input className="border border-gray-300 rounded px-1.5 py-0.5 w-14 text-[11px]" />
                <span className="text-gray-500">No:</span>
                <input className="border border-gray-300 rounded px-1.5 py-0.5 w-14 text-[11px]" />
              </div>
              <button className="px-2.5 py-1.5 text-[11px] bg-blue-500 text-white rounded hover:bg-blue-600">Umum-C</button>
              <button className="px-2.5 py-1.5 text-[11px] bg-blue-500 text-white rounded hover:bg-blue-600">Dinas-Z</button>
              <button className="px-2.5 py-1.5 text-[11px] bg-blue-500 text-white rounded hover:bg-blue-600">Online</button>
              <button className="px-2.5 py-1.5 text-[11px] bg-blue-500 text-white rounded hover:bg-blue-600">Manual</button>
              <div className="ml-2 flex items-center gap-1 text-[11px]">
                <span className="text-gray-500">Loket:</span>
                <select className="border border-gray-300 rounded px-1.5 py-0.5 text-[11px]">
                  <option>1</option><option>2</option><option>3</option>
                </select>
                <label className="flex items-center gap-0.5"><input type="checkbox" className="w-3.5 h-3.5" />Sisa?</label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div className="px-3 py-2 border-b border-gray-200 flex items-center gap-2 bg-white">
        <select className="border border-gray-300 rounded px-2 py-1.5 text-xs">
          <option>Semua</option>
          <option>No. Pendaftaran</option>
          <option>Nama Pasien</option>
          <option>No. RM</option>
        </select>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari..."
          className="border border-gray-300 rounded px-2 py-1.5 text-xs flex-1 max-w-sm"
        />
        <button onClick={() => setSearch('')} className="px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-100">Clear</button>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingRecord(null); }}
        title={editingRecord ? `Edit Pendaftaran - ${editingRecord.nomorPendaftaran}` : 'Tambah Pendaftaran'}
        size="full"
      >
        <div className="max-h-[80vh] overflow-y-auto text-[11px]">
          {/* Top two columns */}
          <div className="grid grid-cols-2 gap-3">
            {/* LEFT COLUMN */}
            <div className="space-y-1.5 border border-gray-200 rounded p-2">
              <div className="flex items-center gap-1">
                <label className="w-36 shrink-0 text-gray-600">Kode Booking</label>
                <input value={formData.kodeBooking} onChange={e => updateForm('kodeBooking', e.target.value)} className="border border-gray-300 rounded px-1.5 py-0.5 flex-1 text-[11px]" />
                <button className="px-2 py-0.5 bg-blue-500 text-white rounded text-[10px]">THS</button>
                <button className="px-2 py-0.5 bg-blue-500 text-white rounded text-[10px]">HDD</button>
              </div>
              <div className="flex items-center gap-1">
                <label className="w-36 shrink-0 text-gray-600">Nomor Pendaftaran *</label>
                <input value={editingRecord?.nomorPendaftaran || '(Auto)'} readOnly className="border border-gray-300 rounded px-1.5 py-0.5 flex-1 text-[11px] bg-gray-100" />
              </div>
              <div className="flex items-center gap-1">
                <label className="w-36 shrink-0 text-gray-600">Jenis Daftar</label>
                <select value={formData.jenisDaftar} onChange={e => updateForm('jenisDaftar', e.target.value)} className="border border-gray-300 rounded px-1.5 py-0.5 flex-1 text-[11px]">
                  <option>BPJS</option><option>UMUM</option><option>ASURANSI</option>
                </select>
              </div>
              <div className="flex items-center gap-1">
                <label className="w-36 shrink-0 text-gray-600">Jenis Pelayanan</label>
                <div className="flex items-center gap-2 flex-1">
                  <label className="flex items-center gap-0.5"><input type="radio" name="jenisPelayanan" checked={formData.jenisPelayanan === 'Rawat Jalan'} onChange={() => updateForm('jenisPelayanan', 'Rawat Jalan')} className="w-3 h-3" />Rawat Jalan</label>
                  <label className="flex items-center gap-0.5"><input type="radio" name="jenisPelayanan" checked={formData.jenisPelayanan === 'Rawat Inap'} onChange={() => updateForm('jenisPelayanan', 'Rawat Inap')} className="w-3 h-3" />Rawat Inap</label>
                  <label className="flex items-center gap-0.5 ml-2"><input type="checkbox" checked={formData.offline} onChange={e => updateForm('offline', e.target.checked)} className="w-3 h-3" />Offline?</label>
                </div>
              </div>
              {/* Pencarian section */}
              <div className="border border-gray-300 rounded p-1.5 space-y-1">
                <div className="font-semibold text-gray-500 text-[10px]">Pencarian</div>
                <div className="flex items-center gap-1">
                  <label className="w-16 shrink-0 text-gray-600">Cari</label>
                  <select className="border border-gray-300 rounded px-1 py-0.5 text-[11px] w-28">
                    <option>No.Rekam Medis</option><option>Nama</option><option>NIK</option>
                  </select>
                  <input className="border border-gray-300 rounded px-1.5 py-0.5 flex-1 text-[11px]" placeholder="Ketik untuk mencari..." />
                </div>
                <textarea className="w-full border border-gray-300 rounded px-1.5 py-0.5 text-[11px] h-12 resize-none bg-gray-50" readOnly placeholder="Hasil pencarian..." />
              </div>
              <div className="flex items-center gap-1">
                <label className="w-36 shrink-0 text-gray-600">Tanggal Datang</label>
                <input value={formatTanggal(new Date().toISOString())} readOnly className="border border-gray-300 rounded px-1.5 py-0.5 flex-1 text-[11px] bg-gray-100" />
              </div>
              <div className="flex items-center gap-1">
                <label className="w-36 shrink-0 text-gray-600">No. Rekam Medis *</label>
                <input value={formData.rekamMedis} onChange={e => updateForm('rekamMedis', e.target.value)} className="border border-gray-300 rounded px-1.5 py-0.5 flex-1 text-[11px]" />
              </div>
              <div className="flex items-center gap-1">
                <label className="w-36 shrink-0 text-gray-600">No. Kartu BPJS *</label>
                <input value={formData.noKartuBpjs} onChange={e => updateForm('noKartuBpjs', e.target.value)} className="border border-gray-300 rounded px-1.5 py-0.5 flex-1 text-[11px]" />
                <button className="px-2 py-0.5 bg-green-600 text-white rounded text-[10px] whitespace-nowrap">Cek Finger BPJS</button>
              </div>
              <div className="flex items-center gap-1">
                <label className="w-36 shrink-0 text-gray-600">No. NIK *</label>
                <input value={formData.noNIK} onChange={e => updateForm('noNIK', e.target.value)} className="border border-gray-300 rounded px-1.5 py-0.5 flex-1 text-[11px]" />
              </div>
              <div className="flex items-center gap-1">
                <label className="w-36 shrink-0 text-gray-600">Poli / Ruangan *</label>
                <select value={formData.poliRuangan} onChange={e => updateForm('poliRuangan', e.target.value)} className="border border-gray-300 rounded px-1.5 py-0.5 flex-1 text-[11px]">
                  <option>Poli Penyakit Dalam</option><option>Poli Kandungan</option><option>Poli Anak</option><option>Poli Jantung</option><option>Poli Bedah</option><option>Poli Orthopedi</option><option>Poli Urologi</option><option>IGD</option>
                </select>
                <label className="flex items-center gap-0.5 text-[10px]"><input type="checkbox" checked={formData.eksekutif} onChange={e => updateForm('eksekutif', e.target.checked)} className="w-3 h-3" />Eksekutif?</label>
                <label className="flex items-center gap-0.5 text-[10px]"><input type="checkbox" checked={formData.katarak} onChange={e => updateForm('katarak', e.target.checked)} className="w-3 h-3" />Katarak?</label>
              </div>
              <div className="flex items-center gap-1">
                <label className="w-36 shrink-0 text-gray-600">DPJP yg Melayani *</label>
                <select value={formData.dokter} onChange={e => updateForm('dokter', e.target.value)} className="border border-gray-300 rounded px-1.5 py-0.5 flex-1 text-[11px]">
                  <option>dr. Hendra Sp.PD</option><option>dr. Sari Sp.OG</option><option>dr. Ahmad Sp.A</option><option>dr. Budi Sp.JP</option><option>dr. Wati Sp.B</option><option>dr. ABDURRAHMAN, Sp.OT</option><option>dr. MOCHAMMAD ECKY PRATAMA, Sp.U</option>
                </select>
                <button className="px-2 py-0.5 bg-blue-500 text-white rounded text-[10px]">iCare</button>
              </div>
              <div className="flex items-center gap-1">
                <label className="w-36 shrink-0 text-gray-600">Diagnosa *</label>
                <input value={formData.diagnosa} onChange={e => updateForm('diagnosa', e.target.value)} className="border border-gray-300 rounded px-1.5 py-0.5 flex-1 text-[11px]" />
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-1.5 border border-gray-200 rounded p-2">
              <div className="flex items-center gap-1">
                <label className="w-40 shrink-0 text-gray-600">Nomer Antrian Poli</label>
                <input value={formData.nomerAntrianPoli || '(Auto)'} readOnly className="border border-gray-300 rounded px-1.5 py-0.5 flex-1 text-[11px] bg-gray-100" />
                <label className="flex items-center gap-0.5 text-[10px]"><input type="checkbox" checked={formData.tanpaAntrian} onChange={e => updateForm('tanpaAntrian', e.target.checked)} className="w-3 h-3" />Tanpa Antrian?</label>
              </div>
              <div className="flex items-center gap-1">
                <label className="w-40 shrink-0 text-gray-600">No. SEP *</label>
                <input value={formData.noSEP} readOnly className="border border-gray-300 rounded px-1.5 py-0.5 flex-1 text-[11px] bg-gray-100" />
              </div>
              <div className="flex items-center gap-1">
                <label className="w-40 shrink-0 text-gray-600">Asal Rujukan *</label>
                <select value={formData.asalRujukan} onChange={e => updateForm('asalRujukan', e.target.value)} className="border border-gray-300 rounded px-1.5 py-0.5 w-24 text-[11px]">
                  <option>Faskes 1</option><option>Faskes 2</option><option>Faskes 3</option>
                </select>
                <label className="text-gray-600 ml-1">Faskes *</label>
                <input value={formData.faskes} onChange={e => updateForm('faskes', e.target.value)} className="border border-gray-300 rounded px-1.5 py-0.5 flex-1 text-[11px]" />
              </div>
              <div className="flex items-center gap-1">
                <label className="w-40 shrink-0 text-gray-600">No. Rujukan</label>
                <input value={formData.noRujukan} onChange={e => updateForm('noRujukan', e.target.value)} className="border border-gray-300 rounded px-1.5 py-0.5 flex-1 text-[11px]" />
                <label className="text-gray-600 ml-1 whitespace-nowrap">Tgl. Rujukan</label>
                <input type="date" value={formData.tglRujukan} onChange={e => updateForm('tglRujukan', e.target.value)} className="border border-gray-300 rounded px-1.5 py-0.5 text-[11px]" />
              </div>
              <div className="flex items-center gap-1">
                <label className="w-40 shrink-0 text-gray-600">No. Surat Kontrol/SKDP</label>
                <input value={formData.noSuratKontrol} onChange={e => updateForm('noSuratKontrol', e.target.value)} className="border border-gray-300 rounded px-1.5 py-0.5 flex-1 text-[11px]" />
              </div>
              <div className="flex items-center gap-1">
                <label className="w-40 shrink-0 text-gray-600">DPJP Pemberi Surat</label>
                <input value={formData.dpjpPemberiSurat} onChange={e => updateForm('dpjpPemberiSurat', e.target.value)} className="border border-gray-300 rounded px-1.5 py-0.5 flex-1 text-[11px]" />
              </div>
              <div className="flex items-center gap-1">
                <label className="w-40 shrink-0 text-gray-600">COB *</label>
                <input value={formData.cob} onChange={e => updateForm('cob', e.target.value)} className="border border-gray-300 rounded px-1.5 py-0.5 flex-1 text-[11px]" />
                <label className="flex items-center gap-0.5 text-[10px]"><input type="checkbox" checked={formData.cobChecked} onChange={e => updateForm('cobChecked', e.target.checked)} className="w-3 h-3" />COB?</label>
              </div>
              <div className="flex items-center gap-1">
                <label className="w-40 shrink-0 text-gray-600">No. Telepon *</label>
                <input value={formData.noTelepon} onChange={e => updateForm('noTelepon', e.target.value)} className="border border-gray-300 rounded px-1.5 py-0.5 flex-1 text-[11px]" />
              </div>
              <div className="flex items-center gap-1">
                <label className="w-40 shrink-0 text-gray-600">Kelas Hak Rawat *</label>
                <input value={formData.kelasHakRawat} onChange={e => updateForm('kelasHakRawat', e.target.value)} className="border border-gray-300 rounded px-1.5 py-0.5 flex-1 text-[11px]" />
              </div>
              <div className="flex items-center gap-1">
                <label className="w-40 shrink-0 text-gray-600">Jenis Peserta *</label>
                <select value={formData.jenisPeserta} onChange={e => updateForm('jenisPeserta', e.target.value)} className="border border-gray-300 rounded px-1.5 py-0.5 flex-1 text-[11px]">
                  <option>PEKERJA PENERIMA UPAH</option><option>PEGAWAI PEMERINTAH DENGAN PERJANJIAN KERJA</option><option>PEKERJA MANDIRI</option><option>PBI (APBN)</option><option>PBI (APBD)</option><option>VETERAN</option><option>PNS PUSAT</option><option>PEGAWAI SWASTA</option><option>-</option>
                </select>
                <label className="text-gray-600 ml-1 whitespace-nowrap">Datang VIA</label>
                <select value={formData.datangVia} onChange={e => updateForm('datangVia', e.target.value)} className="border border-gray-300 rounded px-1.5 py-0.5 w-24 text-[11px]">
                  <option>LANGSUNG</option><option>RUJUKAN</option><option>ONLINE</option><option>IGD</option>
                </select>
              </div>
              <div className="flex items-center gap-1">
                <label className="w-40 shrink-0 text-gray-600">Status Kecelakaan</label>
                <select value={formData.statusKecelakaan} onChange={e => updateForm('statusKecelakaan', e.target.value)} className="border border-gray-300 rounded px-1.5 py-0.5 flex-1 text-[11px]">
                  <option>BUKAN KECELAKAAN</option><option>KECELAKAAN KERJA</option><option>KECELAKAAN LALU LINTAS</option><option>KECELAKAAN LAINNYA</option>
                </select>
                <label className="text-gray-600 ml-1 whitespace-nowrap">Tindak Lanjut</label>
                <select value={formData.tindakLanjut} onChange={e => updateForm('tindakLanjut', e.target.value)} className="border border-gray-300 rounded px-1.5 py-0.5 w-24 text-[11px]">
                  <option>-</option><option>Rawat Inap</option><option>Kontrol Ulang</option>
                </select>
              </div>
              <div className="flex items-center gap-1">
                <label className="w-40 shrink-0 text-gray-600">Catatan *</label>
                <input value={formData.catatan} onChange={e => updateForm('catatan', e.target.value)} className="border border-gray-300 rounded px-1.5 py-0.5 flex-1 text-[11px]" />
              </div>
              <div className="flex items-center gap-1">
                <label className="w-40 shrink-0 text-gray-600">Tujuan Kunjungan</label>
                <input value={formData.tujuanKunjungan} onChange={e => updateForm('tujuanKunjungan', e.target.value)} className="border border-gray-300 rounded px-1.5 py-0.5 flex-1 text-[11px]" />
              </div>
              <div className="flex items-center gap-1">
                <label className="w-40 shrink-0 text-gray-600">Asesmen Pelayanan</label>
                <input value={formData.asesmenPelayanan} onChange={e => updateForm('asesmenPelayanan', e.target.value)} className="border border-gray-300 rounded px-1.5 py-0.5 flex-1 text-[11px]" />
              </div>
            </div>
          </div>

          {/* Bottom Tabs */}
          <div className="mt-3 border border-gray-200 rounded">
            <div className="flex border-b border-gray-200 bg-gray-50">
              {[
                { key: 'informasi_pasien', label: 'Informasi Pasien' },
                { key: 'penanggung_jawab', label: 'Penanggung Jawab' },
                { key: 'suplesi', label: 'Potensi Suplesi Jasa Raharja' },
                { key: 'naik_kelas', label: 'Naik Kelas' },
                { key: 'sep_internal', label: 'SEP Internal' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-3 py-1.5 text-[11px] border-b-2 ${activeTab === tab.key ? 'border-blue-500 text-blue-700 font-medium bg-white' : 'border-transparent text-gray-600 hover:text-gray-800'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="p-2 min-h-[120px]">
              {/* Informasi Pasien */}
              {activeTab === 'informasi_pasien' && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1">
                    <label className="w-28 shrink-0 text-gray-600">Pasien</label>
                    <input value={formData.nama} readOnly className="border border-gray-300 rounded px-1.5 py-0.5 flex-1 text-[11px] bg-gray-100" />
                  </div>
                  <div className="flex items-start gap-1">
                    <label className="w-28 shrink-0 text-gray-600 pt-0.5">Alamat</label>
                    <div className="flex-1 flex gap-1">
                      <input value={formData.alamatPasien} onChange={e => updateForm('alamatPasien', e.target.value)} className="border border-gray-300 rounded px-1.5 py-0.5 flex-1 text-[11px]" />
                      <textarea value={formData.alamatPasien} onChange={e => updateForm('alamatPasien', e.target.value)} className="border border-gray-300 rounded px-1.5 py-0.5 flex-1 text-[11px] h-12 resize-none" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <label className="w-28 shrink-0 text-gray-600">Penjamin</label>
                    <input value={formData.penjaminPasien} onChange={e => updateForm('penjaminPasien', e.target.value)} className="border border-gray-300 rounded px-1.5 py-0.5 flex-1 text-[11px]" />
                  </div>
                  <div className="flex items-center gap-1">
                    <label className="w-28 shrink-0 text-gray-600">Status Keluarga</label>
                    <select value={formData.statusKeluargaPasien} onChange={e => updateForm('statusKeluargaPasien', e.target.value)} className="border border-gray-300 rounded px-1.5 py-0.5 flex-1 text-[11px]">
                      <option value="">- Pilih -</option><option>Kepala Keluarga</option><option>Istri</option><option>Anak</option><option>Lainnya</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-1">
                    <label className="w-28 shrink-0 text-gray-600">Kesatuan</label>
                    <input value={formData.kesatuanPasien} onChange={e => updateForm('kesatuanPasien', e.target.value)} className="border border-gray-300 rounded px-1.5 py-0.5 flex-1 text-[11px]" />
                  </div>
                </div>
              )}
              {/* Penanggung Jawab */}
              {activeTab === 'penanggung_jawab' && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1">
                    <label className="w-28 shrink-0 text-gray-600">Nama</label>
                    <input value={formData.namaPJ} onChange={e => updateForm('namaPJ', e.target.value)} className="border border-gray-300 rounded px-1.5 py-0.5 flex-1 text-[11px]" />
                  </div>
                  <div className="flex items-center gap-1">
                    <label className="w-28 shrink-0 text-gray-600">Hubungan</label>
                    <select value={formData.hubunganPJ} onChange={e => updateForm('hubunganPJ', e.target.value)} className="border border-gray-300 rounded px-1.5 py-0.5 flex-1 text-[11px]">
                      <option>SUAMI/ISTRI</option><option>ORANG TUA</option><option>ANAK</option><option>SAUDARA</option><option>LAINNYA</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-1">
                    <label className="w-28 shrink-0 text-gray-600">Alamat</label>
                    <input value={formData.alamatPJ} onChange={e => updateForm('alamatPJ', e.target.value)} className="border border-gray-300 rounded px-1.5 py-0.5 flex-1 text-[11px]" />
                  </div>
                  <div className="flex items-center gap-1">
                    <label className="w-28 shrink-0 text-gray-600">Nomor Telepon</label>
                    <input value={formData.teleponPJ} onChange={e => updateForm('teleponPJ', e.target.value)} className="border border-gray-300 rounded px-1.5 py-0.5 flex-1 text-[11px]" />
                  </div>
                </div>
              )}
              {/* Potensi Suplesi Jasa Raharja */}
              {activeTab === 'suplesi' && (
                <div className="space-y-1.5">
                  <div className="flex flex-wrap gap-3">
                    <label className="flex items-center gap-0.5"><input type="checkbox" checked={formData.penjaminKLL} onChange={e => updateForm('penjaminKLL', e.target.checked)} className="w-3 h-3" />Penjamin KLL?</label>
                    <label className="flex items-center gap-0.5"><input type="checkbox" checked={formData.jasaRaharja} onChange={e => updateForm('jasaRaharja', e.target.checked)} className="w-3 h-3" />Jasa Raharja PT</label>
                    <label className="flex items-center gap-0.5"><input type="checkbox" checked={formData.bpjsKetenagakerjaan} onChange={e => updateForm('bpjsKetenagakerjaan', e.target.checked)} className="w-3 h-3" />BPJS Ketenagakerjaan</label>
                    <label className="flex items-center gap-0.5"><input type="checkbox" checked={formData.taspen} onChange={e => updateForm('taspen', e.target.checked)} className="w-3 h-3" />TASPEN PT</label>
                    <label className="flex items-center gap-0.5"><input type="checkbox" checked={formData.asabri} onChange={e => updateForm('asabri', e.target.checked)} className="w-3 h-3" />ASABRI PT</label>
                  </div>
                  <div className="flex items-center gap-1">
                    <label className="w-36 shrink-0 text-gray-600">Tanggal Kejadian</label>
                    <input type="date" value={formData.tanggalKejadian} onChange={e => updateForm('tanggalKejadian', e.target.value)} className="border border-gray-300 rounded px-1.5 py-0.5 text-[11px]" />
                    <label className="flex items-center gap-0.5 ml-2"><input type="checkbox" checked={formData.suplesi} onChange={e => updateForm('suplesi', e.target.checked)} className="w-3 h-3" />Suplesi?</label>
                  </div>
                  <div className="flex items-center gap-1">
                    <label className="w-36 shrink-0 text-gray-600">Cari No Kartu Peserta</label>
                    <input value={formData.noKartuPesertaSuplesi} onChange={e => updateForm('noKartuPesertaSuplesi', e.target.value)} className="border border-gray-300 rounded px-1.5 py-0.5 flex-1 text-[11px]" />
                  </div>
                  <div className="flex items-center gap-1">
                    <label className="w-36 shrink-0 text-gray-600">No SEP Suplesi</label>
                    <input value={formData.noSEPSuplesi} onChange={e => updateForm('noSEPSuplesi', e.target.value)} className="border border-gray-300 rounded px-1.5 py-0.5 flex-1 text-[11px]" />
                  </div>
                  <div className="flex items-center gap-1">
                    <label className="w-36 shrink-0 text-gray-600">Provinsi</label>
                    <input value={formData.provinsiSuplesi} onChange={e => updateForm('provinsiSuplesi', e.target.value)} className="border border-gray-300 rounded px-1.5 py-0.5 flex-1 text-[11px]" />
                  </div>
                  <div className="flex items-center gap-1">
                    <label className="w-36 shrink-0 text-gray-600">Kabupaten</label>
                    <input value={formData.kabupatenSuplesi} onChange={e => updateForm('kabupatenSuplesi', e.target.value)} className="border border-gray-300 rounded px-1.5 py-0.5 flex-1 text-[11px]" />
                  </div>
                  <div className="flex items-center gap-1">
                    <label className="w-36 shrink-0 text-gray-600">Kecamatan</label>
                    <input value={formData.kecamatanSuplesi} onChange={e => updateForm('kecamatanSuplesi', e.target.value)} className="border border-gray-300 rounded px-1.5 py-0.5 flex-1 text-[11px]" />
                  </div>
                </div>
              )}
              {/* Naik Kelas */}
              {activeTab === 'naik_kelas' && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1">
                    <label className="w-36 shrink-0 text-gray-600">Naik Kelas Rawat</label>
                    <input value={formData.naikKelasRawat} onChange={e => updateForm('naikKelasRawat', e.target.value)} className="border border-gray-300 rounded px-1.5 py-0.5 flex-1 text-[11px]" />
                  </div>
                  <div className="flex items-center gap-1">
                    <label className="w-36 shrink-0 text-gray-600">Pembiayaan</label>
                    <input value={formData.pembiayaan} onChange={e => updateForm('pembiayaan', e.target.value)} className="border border-gray-300 rounded px-1.5 py-0.5 flex-1 text-[11px]" />
                  </div>
                  <div className="flex items-center gap-1">
                    <label className="w-36 shrink-0 text-gray-600">Penanggung Jawab</label>
                    <input value={formData.penanggungJawabKelas} onChange={e => updateForm('penanggungJawabKelas', e.target.value)} className="border border-gray-300 rounded px-1.5 py-0.5 flex-1 text-[11px]" />
                  </div>
                </div>
              )}
              {/* SEP Internal */}
              {activeTab === 'sep_internal' && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1">
                    <label className="w-36 shrink-0 text-gray-600">No. SEP</label>
                    <input value={formData.noSEPInternal} onChange={e => updateForm('noSEPInternal', e.target.value)} className="border border-gray-300 rounded px-1.5 py-0.5 flex-1 text-[11px]" />
                    <button className="px-2 py-0.5 bg-blue-500 text-white rounded text-[10px] whitespace-nowrap">Data SEP Internal</button>
                  </div>
                  <div className="flex items-center gap-1">
                    <label className="w-36 shrink-0 text-gray-600">Nomor Surat</label>
                    <select value={formData.nomorSurat} onChange={e => updateForm('nomorSurat', e.target.value)} className="border border-gray-300 rounded px-1.5 py-0.5 flex-1 text-[11px]">
                      <option value="">- Pilih -</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-1">
                    <label className="w-36 shrink-0 text-gray-600">Tgl Rujukan Internal</label>
                    <input value={formData.tglRujukanInternal} onChange={e => updateForm('tglRujukanInternal', e.target.value)} className="border border-gray-300 rounded px-1.5 py-0.5 flex-1 text-[11px]" />
                  </div>
                  <div className="flex items-center gap-1">
                    <label className="w-36 shrink-0 text-gray-600">Kode Poli</label>
                    <input value={formData.kodePoli} onChange={e => updateForm('kodePoli', e.target.value)} className="border border-gray-300 rounded px-1.5 py-0.5 flex-1 text-[11px]" />
                  </div>
                  <button className="px-2 py-0.5 bg-red-500 text-white rounded text-[10px]">Hapus SEP Internal</button>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-3 mt-3 border-t border-gray-200">
            <Button variant="outline" onClick={() => { setShowModal(false); setEditingRecord(null); }}>Batal</Button>
            <Button onClick={handleSubmit}>{editingRecord ? 'Simpan' : 'Daftarkan'}</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} title="Konfirmasi Hapus" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Apakah Anda yakin ingin menghapus pendaftaran ini?</p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>Batal</Button>
            <Button variant="danger" onClick={confirmDelete}>Hapus</Button>
          </div>
        </div>
      </Modal>

      {/* Main data table - bigger rows, scrollable */}
      <div className="flex-1 overflow-auto min-h-0">
        <table className="w-full text-[12px] border-collapse">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              {['No. Pendaftaran', 'Tanggal Datang', 'Jenis Daftar', 'Jenis Peserta', 'Status Kecelakaan', 'Tindak Lanjut', 'Datang VIA', 'L6', 'No. Rekam Medis', 'Tampilan Nama', 'Poli/Ruangan', 'DPJP yang Melayani', 'No. SEP', 'No. SKD', 'Tujuan Kunjungan', 'User Pendaftaran', 'Status Daftar'].map(col => (
                <th key={col} className="px-2 py-2 text-left font-semibold text-gray-700 border-b-2 border-gray-300 whitespace-nowrap bg-gray-100">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map(row => (
              <tr
                key={row.id}
                onClick={() => setSelectedId(row.id)}
                className={`cursor-pointer border-b border-gray-200 ${selectedId === row.id ? 'bg-blue-100 font-medium' : 'hover:bg-gray-50'}`}
              >
                <td className="px-2 py-2.5 whitespace-nowrap">{row.nomorPendaftaran}</td>
                <td className="px-2 py-2.5 whitespace-nowrap">{formatTanggal(row.tanggalDatang)}</td>
                <td className="px-2 py-2.5">{row.jenisDaftar}</td>
                <td className="px-2 py-2.5">{row.jenisPeserta}</td>
                <td className="px-2 py-2.5">{row.statusKecelakaan}</td>
                <td className="px-2 py-2.5">{row.tindakLanjut}</td>
                <td className="px-2 py-2.5">{row.datangVia}</td>
                <td className="px-2 py-2.5">{row.l6}</td>
                <td className="px-2 py-2.5">{row.rekamMedis}</td>
                <td className="px-2 py-2.5 font-medium">{row.tampilanNama}</td>
                <td className="px-2 py-2.5">{row.poliRuangan}</td>
                <td className="px-2 py-2.5">{row.dokter}</td>
                <td className="px-2 py-2.5 whitespace-nowrap">{row.noSEP}</td>
                <td className="px-2 py-2.5">{row.noSKD}</td>
                <td className="px-2 py-2.5">{row.tujuanKunjungan}</td>
                <td className="px-2 py-2.5">{row.userPendaftaran}</td>
                <td className="px-2 py-2.5">{row.statusDaftar}</td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan={17} className="px-4 py-8 text-center text-gray-400">Tidak ada data untuk rentang tanggal yang dipilih</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Record count */}
      <div className="px-3 py-1 border-t border-gray-200 bg-white text-[11px] text-gray-500">
        Record 1 of {data.length}
      </div>

      {/* Bottom detail panel - History kunjungan berdasarkan No. RM yang sama */}
      {selectedRecord && (() => {
        const allRecords = storageService.get<PendaftaranRecord[]>(STORAGE_KEY) || [];
        const history = allRecords.filter(r => r.rekamMedis === selectedRecord.rekamMedis)
          .sort((a, b) => new Date(b.tanggalDatang).getTime() - new Date(a.tanggalDatang).getTime());
        return (
          <div className="border-t border-gray-300 bg-gray-50 p-2 max-h-40 overflow-auto">
            <div className="text-[11px] font-semibold text-gray-500 mb-1">
              Detail Kunjungan Pasien: {selectedRecord.tampilanNama} (No. RM: {selectedRecord.rekamMedis}) — {history.length} kunjungan
            </div>
            <table className="w-full text-[11px]">
              <thead>
                <tr className="bg-gray-200">
                  <th className="px-2 py-1 text-left">Nomor Pendaftaran</th>
                  <th className="px-2 py-1 text-left">Tanggal</th>
                  <th className="px-2 py-1 text-left">Tujuan</th>
                  <th className="px-2 py-1 text-left">Dokter</th>
                  <th className="px-2 py-1 text-left">Cek Pemetaan</th>
                </tr>
              </thead>
              <tbody>
                {history.map(h => (
                  <tr key={h.id} className={h.id === selectedRecord.id ? 'bg-blue-50' : ''}>
                    <td className="px-2 py-1">{h.nomorPendaftaran}</td>
                    <td className="px-2 py-1">{formatTanggal(h.tanggalDatang)}</td>
                    <td className="px-2 py-1">{h.tujuan}</td>
                    <td className="px-2 py-1">{h.dokter}</td>
                    <td className="px-2 py-1"><input type="checkbox" className="w-3.5 h-3.5" readOnly /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })()}

      {/* Status bar */}
      <div className="border-t border-gray-300 bg-gray-100 px-3 py-1 flex justify-between text-[11px] text-gray-600">
        <span>Bahasa: Indonesia</span>
        <span>User: SIMRS &nbsp; Shift: Pagi &nbsp; Versi 204</span>
      </div>
    </div>
  );
}

// --- Placeholder content for other menu items ---
function PlaceholderContent({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center h-full text-gray-400">
      <div className="text-center">
        <p className="text-lg font-medium">{label}</p>
        <p className="text-sm">Halaman ini belum tersedia</p>
      </div>
    </div>
  );
}

// --- Main Admission Page ---
export default function AdmissionPage(): React.ReactElement {
  const [activeKey, setActiveKey] = useState<string>('pendaftaran');
  const [activeLabel, setActiveLabel] = useState<string>('Pendaftaran');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({ antrian: false, pemetaan_ruangan: false, laporan: false });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  function toggleGroup(key: string) {
    setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }));
  }

  function handleMenuClick(key: string, label: string) {
    setActiveKey(key);
    setActiveLabel(label);
  }

  function renderMenuItem(entry: MenuEntry, idx: number) {
    if (entry.type === 'separator') {
      return <hr key={`sep-${idx}`} className="my-1 border-gray-300" />;
    }

    if (entry.type === 'group') {
      const isExpanded = expandedGroups[entry.key] || false;
      return (
        <div key={entry.key}>
          <button
            onClick={() => toggleGroup(entry.key)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded transition-colors"
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            {entry.label}
          </button>
          {isExpanded && entry.children.length > 0 && (
            <div className="ml-2">
              {entry.children.map((child, cIdx) => {
                if (child.type === 'separator') {
                  return <hr key={`${entry.key}-sep-${cIdx}`} className="my-1 border-gray-300 ml-3" />;
                }
                const isActive = activeKey === child.key;
                return (
                  <button
                    key={child.key}
                    onClick={() => handleMenuClick(child.key, child.label)}
                    className={`w-full text-left px-3 py-1.5 text-xs rounded transition-colors ${
                      isActive ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {child.label}
                  </button>
                );
              })}
            </div>
          )}
          {isExpanded && entry.children.length === 0 && (
            <div className="ml-5 px-3 py-1 text-xs text-gray-400 italic">Belum tersedia</div>
          )}
        </div>
      );
    }

    const isActive = activeKey === entry.key;
    return (
      <button
        key={entry.key}
        onClick={() => handleMenuClick(entry.key, entry.label)}
        className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
          isActive ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-200'
        }`}
      >
        {entry.label}
      </button>
    );
  }

  function renderContent() {
    if (activeKey === 'pendaftaran') {
      return <PendaftaranContent />;
    }
    return <PlaceholderContent label={activeLabel} />;
  }

  return (
    <div className="flex h-full gap-0">
      {/* Left Sidebar */}
      <div
        className={`shrink-0 bg-gray-50 border-r border-gray-200 overflow-y-auto transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'w-0 p-0 overflow-hidden' : 'w-[250px] p-2'
        }`}
      >
        <h2 className="px-3 py-2 text-xs font-semibold uppercase text-gray-500 tracking-wider">
          Menu Admission
        </h2>
        <nav className="flex flex-col gap-0.5">
          {ADMISSION_MENU.map((entry, idx) => renderMenuItem(entry, idx))}
        </nav>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="shrink-0 flex items-center justify-center w-5 bg-gray-100 hover:bg-gray-200 border-r border-gray-200 transition-colors cursor-pointer"
        title={sidebarCollapsed ? 'Tampilkan menu' : 'Sembunyikan menu'}
      >
        {sidebarCollapsed ? (
          <PanelLeftOpen size={14} className="text-gray-500" />
        ) : (
          <PanelLeftClose size={14} className="text-gray-500" />
        )}
      </button>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {renderContent()}
      </div>
    </div>
  );
}
