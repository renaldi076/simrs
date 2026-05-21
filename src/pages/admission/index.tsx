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
  const seed = getSeedData();
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
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PendaftaranRecord | null>(null);
  const [fromDate, setFromDate] = useState('2026-05-20');
  const [toDate, setToDate] = useState('2026-05-20');

  // Form state
  const [formNama, setFormNama] = useState('');
  const [formJenisDaftar, setFormJenisDaftar] = useState('BPJS');
  const [formJenisPeserta, setFormJenisPeserta] = useState('PEKERJA PENERIMA UPAH');
  const [formDokter, setFormDokter] = useState('dr. Hendra Sp.PD');
  const [formTujuan, setFormTujuan] = useState('Poli Penyakit Dalam');

  const loadData = useCallback(() => {
    const all = initializePendaftaran();
    let filtered = all;

    // Filter by date range
    if (fromDate && toDate) {
      const from = new Date(fromDate);
      from.setHours(0, 0, 0, 0);
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      filtered = filtered.filter(r => {
        const d = new Date(r.tanggalDatang);
        return d >= from && d <= to;
      });
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

    setData(filtered);
  }, [search, fromDate, toDate]);

  useEffect(() => { loadData(); }, [loadData]);

  const selectedRecord = data.find(r => r.id === selectedId) || null;

  function handleAdd() {
    setEditingRecord(null);
    setFormNama('');
    setFormJenisDaftar('BPJS');
    setFormJenisPeserta('PEKERJA PENERIMA UPAH');
    setFormDokter('dr. Hendra Sp.PD');
    setFormTujuan('Poli Penyakit Dalam');
    setShowAddForm(true);
  }

  function handleEdit() {
    if (!selectedRecord) return;
    setEditingRecord(selectedRecord);
    setFormNama(selectedRecord.tampilanNama);
    setFormJenisDaftar(selectedRecord.jenisDaftar);
    setFormJenisPeserta(selectedRecord.jenisPeserta);
    setFormDokter(selectedRecord.dokter);
    setFormTujuan(selectedRecord.tujuan);
    setShowAddForm(true);
  }

  function handleSubmitAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!formNama.trim()) return;
    const all = storageService.get<PendaftaranRecord[]>(STORAGE_KEY) || [];

    if (editingRecord) {
      // Edit mode
      const idx = all.findIndex(r => r.id === editingRecord.id);
      if (idx !== -1) {
        all[idx] = { ...all[idx], tampilanNama: formNama.toUpperCase(), jenisDaftar: formJenisDaftar, jenisPeserta: formJenisPeserta, dokter: formDokter, tujuan: formTujuan, poliRuangan: formTujuan };
        storageService.set(STORAGE_KEY, all);
      }
    } else {
      // Add mode
      const nextNum = all.length + 1;
      const newRecord: PendaftaranRecord = {
        id: generateId(),
        nomorPendaftaran: `RJ2026E${String(nextNum + 8082).padStart(6, '0')}`,
        tanggalDatang: new Date().toISOString(),
        jenisDaftar: formJenisDaftar,
        jenisPeserta: formJenisPeserta,
        statusKecelakaan: 'BUKAN KECELAKAAN',
        tindakLanjut: '-',
        datangVia: 'LANGSUNG',
        l6: '-',
        rekamMedis: String(271690 + nextNum).padStart(9, '0'),
        tampilanNama: formNama.toUpperCase(),
        dokter: formDokter,
        tujuan: formTujuan,
        poliRuangan: formTujuan,
        noSEP: '-',
        noSKD: '-',
        tujuanKunjungan: 'Konsultasi',
        userPendaftaran: 'ADM_USER',
        statusDaftar: 'Terdaftar',
      };
      all.unshift(newRecord);
      storageService.set(STORAGE_KEY, all);
    }

    setShowAddForm(false);
    setEditingRecord(null);
    setFormNama('');
    loadData();
  }

  function handleDelete() {
    if (!selectedId) return;
    const all = storageService.get<PendaftaranRecord[]>(STORAGE_KEY) || [];
    const filtered = all.filter(r => r.id !== selectedId);
    storageService.set(STORAGE_KEY, filtered);
    setSelectedId(null);
    loadData();
  }

  function handleRefresh() {
    loadData();
  }

  function handleOperasi() {
    if (!selectedRecord) return;
    alert(`Operasi untuk pasien: ${selectedRecord.tampilanNama}\nNo. Pendaftaran: ${selectedRecord.nomorPendaftaran}`);
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
              <button className="p-2 hover:bg-green-100 rounded text-green-600 border border-transparent hover:border-green-300" title="Cetak"><Printer size={20} /></button>
              <button onClick={handleRefresh} className="p-2 hover:bg-cyan-100 rounded text-cyan-600 border border-transparent hover:border-cyan-300" title="Refresh"><RefreshCw size={20} /></button>
              <button onClick={handleOperasi} className="p-2 hover:bg-purple-100 rounded text-purple-600 border border-transparent hover:border-purple-300" title="Operasi"><ClipboardList size={20} /></button>
              <button onClick={handleDelete} className="p-2 hover:bg-red-100 rounded text-red-600 border border-transparent hover:border-red-300" title="Hapus"><Trash2 size={20} /></button>
              <button className="p-2 hover:bg-gray-200 rounded text-gray-600 border border-transparent hover:border-gray-400" title="Batal"><XCircle size={20} /></button>
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

      {/* Add/Edit form overlay */}
      {showAddForm && (
        <div className="px-3 py-3 bg-blue-50 border-b border-blue-200">
          <form onSubmit={handleSubmitAdd} className="flex flex-wrap items-end gap-3">
            <div>
              <label className="text-xs text-gray-600 block mb-1">{editingRecord ? 'Edit' : 'Tambah'} - Nama Pasien *</label>
              <input value={formNama} onChange={e => setFormNama(e.target.value)} className="border border-gray-300 rounded px-2 py-1.5 text-xs w-44" required />
            </div>
            <div>
              <label className="text-xs text-gray-600 block mb-1">Jenis Daftar</label>
              <select value={formJenisDaftar} onChange={e => setFormJenisDaftar(e.target.value)} className="border border-gray-300 rounded px-2 py-1.5 text-xs">
                <option>BPJS</option><option>UMUM</option><option>ASURANSI</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-600 block mb-1">Jenis Peserta</label>
              <select value={formJenisPeserta} onChange={e => setFormJenisPeserta(e.target.value)} className="border border-gray-300 rounded px-2 py-1.5 text-xs">
                <option>PEKERJA PENERIMA UPAH</option><option>PEGAWAI PEMERINTAH DENGAN PERJANJIAN KERJA</option><option>PEKERJA MANDIRI</option><option>PBI (APBN)</option><option>PBI (APBD)</option><option>VETERAN</option><option>PNS PUSAT</option><option>PEGAWAI SWASTA</option><option>-</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-600 block mb-1">DPJP / Dokter</label>
              <select value={formDokter} onChange={e => setFormDokter(e.target.value)} className="border border-gray-300 rounded px-2 py-1.5 text-xs">
                <option>dr. Hendra Sp.PD</option><option>dr. Sari Sp.OG</option><option>dr. Ahmad Sp.A</option><option>dr. Budi Sp.JP</option><option>dr. Wati Sp.B</option><option>dr. ABDURRAHMAN, Sp.OT</option><option>dr. MOCHAMMAD ECKY PRATAMA, Sp.U</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-600 block mb-1">Poli/Tujuan</label>
              <select value={formTujuan} onChange={e => setFormTujuan(e.target.value)} className="border border-gray-300 rounded px-2 py-1.5 text-xs">
                <option>Poli Penyakit Dalam</option><option>Poli Kandungan</option><option>Poli Anak</option><option>Poli Jantung</option><option>Poli Bedah</option><option>Poli Orthopedi</option><option>Poli Urologi</option>
              </select>
            </div>
            <Button type="submit" size="sm">{editingRecord ? 'Simpan' : 'Daftarkan'}</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => { setShowAddForm(false); setEditingRecord(null); }}>Batal</Button>
          </form>
        </div>
      )}

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

      {/* Bottom detail panel */}
      {selectedRecord && (
        <div className="border-t border-gray-300 bg-gray-50 p-2 max-h-36 overflow-auto">
          <div className="text-[11px] font-semibold text-gray-500 mb-1">Detail Kunjungan Pasien: {selectedRecord.tampilanNama}</div>
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
              <tr>
                <td className="px-2 py-1">{selectedRecord.nomorPendaftaran}</td>
                <td className="px-2 py-1">{formatTanggal(selectedRecord.tanggalDatang)}</td>
                <td className="px-2 py-1">{selectedRecord.tujuan}</td>
                <td className="px-2 py-1">{selectedRecord.dokter}</td>
                <td className="px-2 py-1"><input type="checkbox" className="w-3.5 h-3.5" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

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
