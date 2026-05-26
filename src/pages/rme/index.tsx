import React, { useState, useEffect, useMemo } from 'react';
import {
  Printer,
  RefreshCw,
  Plus,
  Pencil,
  Trash2,
  FileText,
} from 'lucide-react';
import { storageService } from '@/services/storageService';
import { referensiService } from '@/services/modules/referensiService';
import { generateId, formatDate, formatDateTime } from '@/utils/formatters';

// ─── Types ───────────────────────────────────────────────────────────────────

type DocType =
  | 'cppt'
  | 'asesmen_awal_medis'
  | 'asesmen_awal_nakes'
  | 'resume'
  | 'hasil_lab'
  | 'hasil_expertise'
  | 'scan'
  | 'laporan_operasi'
  | 'case_manager'
  | 'formulir_konsul'
  | 'lembar_observasi'
  | 'transfer_internal'
  | 'surat_keterangan'
  | 'kartu_obat'
  | 'rencana_operasi'
  | 'laporan_tindakan'
  | 'tindakan_evaluasi'
  | 'inf_consent'
  | 'surat_kematian'
  | 'form_edukasi';

interface RMEDocument {
  id: string;
  patientRM: string;
  patientName: string;
  docType: DocType;
  tanggal: string;
  poli: string;
  dokter: string;
  user: string;
  content: string;
}

interface PatientRow {
  id: string;
  noRM: string;
  nama: string;
  penjamin: string;
  poli: string;
  tanggalDaftar: string;
  jenisKelamin?: string;
  agama?: string;
  tanggalLahir?: string;
  nik?: string;
  kelas?: string;
  jenisPeserta?: string;
}

type MainTab = 'list_pasien' | 'dokumen' | 'template';
type RightSubTab = 'dokumen_rme' | 'dokumen_lainnya';

const DOC_TYPE_LABELS: Record<DocType, string> = {
  cppt: 'CPPT',
  asesmen_awal_medis: 'Asesmen Awal Medis',
  asesmen_awal_nakes: 'Asesmen Awal Nakes',
  resume: 'Resume',
  hasil_lab: 'Hasil Laboratorium',
  hasil_expertise: 'Hasil Expertise',
  scan: 'Scan',
  laporan_operasi: 'Laporan Operasi',
  case_manager: 'Case Manager',
  formulir_konsul: 'Formulir Konsul Dokter',
  lembar_observasi: 'Lembar Observasi',
  transfer_internal: 'Transfer Internal',
  surat_keterangan: 'Surat Keterangan',
  kartu_obat: 'Kartu Obat Pasien',
  rencana_operasi: 'Rencana Operasi',
  laporan_tindakan: 'Laporan Tindakan',
  tindakan_evaluasi: 'Tindakan Evaluasi Keperawatan',
  inf_consent: 'Inf Consent',
  surat_kematian: 'Surat Kematian',
  form_edukasi: 'Form Edukasi Pasien',
};

const RIGHT_PANEL_DOCS: DocType[] = [
  'asesmen_awal_nakes',
  'asesmen_awal_medis',
  'hasil_lab',
  'hasil_expertise',
  'scan',
  'laporan_operasi',
  'case_manager',
  'formulir_konsul',
  'cppt',
  'resume',
];

const DOKUMEN_TAB_DOCS: DocType[] = [
  'asesmen_awal_medis',
  'resume',
  'lembar_observasi',
  'transfer_internal',
  'surat_keterangan',
  'kartu_obat',
  'rencana_operasi',
  'laporan_operasi',
  'laporan_tindakan',
  'tindakan_evaluasi',
  'scan',
  'inf_consent',
  'surat_kematian',
  'form_edukasi',
  'case_manager',
  'cppt',
  'asesmen_awal_nakes',
  'formulir_konsul',
];

const POLI_OPTIONS = ['Poli Umum', 'Poli Gigi', 'Poli Anak', 'Poli Dalam', 'Poli Bedah', 'IGD'];
const DOKTER_OPTIONS = ['dr. Ahmad Fauzi', 'dr. Siti Nurhaliza', 'dr. Budi Santoso', 'dr. Dewi Kartini', 'dr. Hasan Basri'];
const INSTALASI_OPTIONS = ['Instalasi Gawat Darurat', 'Rawat Jalan', 'Rawat Inap'];

const STORAGE_KEY_DOCS = 'rme_documents';
const STORAGE_KEY_PATIENT = 'rme_selected_patient';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getDocuments(): RMEDocument[] {
  return storageService.get<RMEDocument[]>(STORAGE_KEY_DOCS) || [];
}

function saveDocuments(docs: RMEDocument[]): void {
  storageService.set(STORAGE_KEY_DOCS, docs);
}

function getSelectedPatient(): PatientRow | null {
  return storageService.get<PatientRow>(STORAGE_KEY_PATIENT);
}

function saveSelectedPatient(p: PatientRow | null): void {
  if (p) storageService.set(STORAGE_KEY_PATIENT, p);
  else storageService.remove(STORAGE_KEY_PATIENT);
}

function initSeedDocuments(): void {
  const existing = getDocuments();
  if (existing.length > 0) return;

  const seeds: RMEDocument[] = [
    {
      id: generateId(),
      patientRM: '000272108',
      patientName: 'EGI GIFARI IRHAIS',
      docType: 'cppt',
      tanggal: '2024-03-15T08:30:00',
      poli: 'Poli Dalam',
      dokter: 'dr. Ahmad Fauzi',
      user: 'admin',
      content: JSON.stringify({
        subjective: 'Pasien mengeluh demam tinggi 3 hari, nyeri kepala, mual.',
        objective: 'TD 120/80, Suhu 38.5C, Nadi 92x/mnt, RR 20x/mnt. Petekie (+)',
        assessment: 'Dengue Fever (A90)',
        plan: 'Infus RL 20tpm, Paracetamol 3x500mg, Cek DL serial',
        instruksi: 'Observasi tanda perdarahan, cek trombosit tiap 12 jam',
      }),
    },
    {
      id: generateId(),
      patientRM: '000272108',
      patientName: 'EGI GIFARI IRHAIS',
      docType: 'cppt',
      tanggal: '2024-03-16T09:00:00',
      poli: 'Poli Dalam',
      dokter: 'dr. Ahmad Fauzi',
      user: 'admin',
      content: JSON.stringify({
        subjective: 'Demam sudah turun, masih lemas, nafsu makan mulai membaik.',
        objective: 'TD 110/70, Suhu 37.0C, Nadi 80x/mnt. Trombosit naik 85.000.',
        assessment: 'Dengue Fever dalam perbaikan',
        plan: 'Lanjut infus, diet lunak, multivitamin',
        instruksi: 'Boleh pulang jika trombosit >100.000 dan tidak demam 24 jam',
      }),
    },
    {
      id: generateId(),
      patientRM: '000272108',
      patientName: 'EGI GIFARI IRHAIS',
      docType: 'cppt',
      tanggal: '2024-03-17T10:00:00',
      poli: 'Poli Dalam',
      dokter: 'dr. Siti Nurhaliza',
      user: 'admin',
      content: JSON.stringify({
        subjective: 'Kondisi membaik, tidak demam, makan baik.',
        objective: 'TD 120/80, Suhu 36.5C. Trombosit 120.000.',
        assessment: 'Dengue Fever resolved',
        plan: 'Rawat jalan, kontrol 3 hari, multivitamin',
        instruksi: 'Edukasi tanda bahaya, banyak minum',
      }),
    },
    {
      id: generateId(),
      patientRM: '000272108',
      patientName: 'EGI GIFARI IRHAIS',
      docType: 'asesmen_awal_medis',
      tanggal: '2024-03-15T08:00:00',
      poli: 'Poli Dalam',
      dokter: 'dr. Ahmad Fauzi',
      user: 'admin',
      content: 'Asesmen awal medis: Pasien datang dengan keluhan demam tinggi 3 hari. Riwayat kontak dengan penderita DBD di lingkungan rumah.',
    },
    {
      id: generateId(),
      patientRM: '000272108',
      patientName: 'EGI GIFARI IRHAIS',
      docType: 'resume',
      tanggal: '2024-03-17T14:00:00',
      poli: 'Poli Dalam',
      dokter: 'dr. Ahmad Fauzi',
      user: 'admin',
      content: 'Resume rawat: Dengue Fever. Dirawat 3 hari, kondisi membaik, trombosit normal. Pulang dengan obat oral.',
    },
    {
      id: generateId(),
      patientRM: '000271690',
      patientName: 'EUIS KOMARIAH',
      docType: 'cppt',
      tanggal: '2024-04-01T09:00:00',
      poli: 'Poli Umum',
      dokter: 'dr. Budi Santoso',
      user: 'admin',
      content: JSON.stringify({
        subjective: 'Batuk berdahak 1 minggu, pilek.',
        objective: 'TD 120/80, Suhu 37.2C, Ronkhi (-), Wheezing (-)',
        assessment: 'ISPA (J06.9)',
        plan: 'Ambroxol 3x1, Cetirizine 1x1, Paracetamol k/p',
        instruksi: 'Istirahat, banyak minum hangat',
      }),
    },
    {
      id: generateId(),
      patientRM: '000271689',
      patientName: 'PENDI KUSNADI',
      docType: 'cppt',
      tanggal: '2024-04-02T10:30:00',
      poli: 'Poli Dalam',
      dokter: 'dr. Dewi Kartini',
      user: 'admin',
      content: JSON.stringify({
        subjective: 'Nyeri ulu hati sejak 2 hari, mual, kembung.',
        objective: 'TD 130/85, Nyeri tekan epigastrium (+)',
        assessment: 'Gastritis (K29.7)',
        plan: 'Omeprazole 2x20mg, Sucralfate 3xCI, diet lunak',
        instruksi: 'Hindari makanan pedas dan asam',
      }),
    },
  ];

  saveDocuments(seeds);
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function RMEPage(): React.ReactElement {
  const [mainTab, setMainTab] = useState<MainTab>('list_pasien');
  const [selectedPatient, setSelectedPatient] = useState<PatientRow | null>(getSelectedPatient);
  const [documents, setDocuments] = useState<RMEDocument[]>([]);
  const [selectedDocType, setSelectedDocType] = useState<DocType>('cppt');
  const [selectedDoc, setSelectedDoc] = useState<RMEDocument | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState<RMEDocument | null>(null);

  // List Pasien filters
  const [filterInstalasi, setFilterInstalasi] = useState('');
  const [filterDokter, setFilterDokter] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [searchPatient, setSearchPatient] = useState('');
  const [patientPage, setPatientPage] = useState(1);
  const [rightSubTab, setRightSubTab] = useState<RightSubTab>('dokumen_rme');

  // Dokumen tab
  const [docPage, setDocPage] = useState(1);

  useEffect(() => {
    initSeedDocuments();
    setDocuments(getDocuments());
  }, []);

  // Persist selected patient
  useEffect(() => {
    saveSelectedPatient(selectedPatient);
  }, [selectedPatient]);

  const refresh = () => {
    setDocuments(getDocuments());
  };

  // ─── Patient List ────────────────────────────────────────────────────────────

  const patients: PatientRow[] = useMemo(() => {
    const raw = referensiService.getAll('adm_pasien');
    // Add the special patient for seed
    const hasEgi = raw.some((r) => r.kode === '000272108');
    const list = hasEgi ? raw : [{ id: generateId(), kode: '000272108', nama: 'EGI GIFARI IRHAIS', isActive: true }, ...raw];

    return list.map((r, i) => ({
      id: r.id,
      noRM: r.kode,
      nama: r.nama,
      penjamin: i % 3 === 0 ? 'BPJS' : i % 3 === 1 ? 'Umum' : 'Asuransi',
      poli: POLI_OPTIONS[i % POLI_OPTIONS.length],
      tanggalDaftar: new Date(2024, 2, 10 + (i % 20)).toISOString(),
      jenisKelamin: i % 2 === 0 ? 'Laki-laki' : 'Perempuan',
      agama: 'Islam',
      tanggalLahir: `199${i % 10}-0${(i % 9) + 1}-1${i % 10}`,
      nik: `320401${String(i).padStart(10, '0')}`,
      kelas: i % 3 === 0 ? 'Kelas 1' : i % 3 === 1 ? 'Kelas 2' : 'Kelas 3',
      jenisPeserta: i % 2 === 0 ? 'Peserta' : 'Keluarga',
    }));
  }, []);

  const filteredPatients = useMemo(() => {
    let list = patients;
    if (searchPatient.trim()) {
      const q = searchPatient.toLowerCase();
      list = list.filter((p) => p.nama.toLowerCase().includes(q) || p.noRM.includes(q));
    }
    if (filterDokter) {
      // Filter by assigned dokter (simulate)
      list = list.filter((_, i) => DOKTER_OPTIONS[i % DOKTER_OPTIONS.length] === filterDokter);
    }
    return list;
  }, [patients, searchPatient, filterDokter]);

  const PAGE_SIZE_PATIENT = 15;
  const paginatedPatients = useMemo(() => {
    const start = (patientPage - 1) * PAGE_SIZE_PATIENT;
    return filteredPatients.slice(start, start + PAGE_SIZE_PATIENT);
  }, [filteredPatients, patientPage]);

  // ─── Documents for selected patient & type ───────────────────────────────────

  const patientDocs = useMemo(() => {
    if (!selectedPatient) return [];
    return documents.filter(
      (d) => d.patientRM === selectedPatient.noRM && d.docType === selectedDocType
    );
  }, [documents, selectedPatient, selectedDocType]);

  const PAGE_SIZE_DOC = 10;
  const paginatedDocs = useMemo(() => {
    const start = (docPage - 1) * PAGE_SIZE_DOC;
    return patientDocs.slice(start, start + PAGE_SIZE_DOC);
  }, [patientDocs, docPage]);

  // ─── CRUD ────────────────────────────────────────────────────────────────────

  const handleAdd = () => {
    if (!selectedPatient) return;
    setEditingDoc(null);
    setShowModal(true);
  };

  const handleEdit = () => {
    if (!selectedDoc) return;
    setEditingDoc(selectedDoc);
    setShowModal(true);
  };

  const handleDelete = () => {
    if (!selectedDoc) return;
    if (!confirm('Hapus dokumen ini?')) return;
    const docs = getDocuments().filter((d) => d.id !== selectedDoc.id);
    saveDocuments(docs);
    setDocuments(docs);
    setSelectedDoc(null);
  };

  const handleSaveDoc = (doc: RMEDocument) => {
    let docs = getDocuments();
    const idx = docs.findIndex((d) => d.id === doc.id);
    if (idx >= 0) {
      docs[idx] = doc;
    } else {
      docs.push(doc);
    }
    saveDocuments(docs);
    setDocuments(docs);
    setShowModal(false);
    setSelectedDoc(doc);
  };

  const handleSelectPatient = (p: PatientRow) => {
    setSelectedPatient(p);
    setSelectedDoc(null);
    setDocPage(1);
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full bg-gray-100 text-xs">
      {/* Tab bar */}
      <div className="flex items-center bg-white border-b px-2 py-1 gap-1">
        <TabBtn active={mainTab === 'list_pasien'} onClick={() => setMainTab('list_pasien')}>
          List Pasien
        </TabBtn>
        <TabBtn active={mainTab === 'dokumen'} onClick={() => setMainTab('dokumen')}>
          Dokumen
        </TabBtn>
        <TabBtn active={mainTab === 'template'} onClick={() => setMainTab('template')}>
          Template
        </TabBtn>
        <div className="ml-auto flex gap-1">
          <button className="p-1 hover:bg-gray-100 rounded" title="Print">
            <Printer size={14} />
          </button>
          <button className="p-1 hover:bg-gray-100 rounded" title="Refresh" onClick={refresh}>
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {mainTab === 'list_pasien' && (
          <ListPasienTab
            patients={paginatedPatients}
            totalPatients={filteredPatients.length}
            page={patientPage}
            setPage={setPatientPage}
            pageSize={PAGE_SIZE_PATIENT}
            selectedPatient={selectedPatient}
            onSelectPatient={handleSelectPatient}
            searchPatient={searchPatient}
            setSearchPatient={setSearchPatient}
            filterInstalasi={filterInstalasi}
            setFilterInstalasi={setFilterInstalasi}
            filterDokter={filterDokter}
            setFilterDokter={setFilterDokter}
            filterFrom={filterFrom}
            setFilterFrom={setFilterFrom}
            filterTo={filterTo}
            setFilterTo={setFilterTo}
            documents={documents}
            selectedDocType={selectedDocType}
            setSelectedDocType={setSelectedDocType}
            selectedDoc={selectedDoc}
            setSelectedDoc={setSelectedDoc}
            rightSubTab={rightSubTab}
            setRightSubTab={setRightSubTab}
            refresh={refresh}
          />
        )}
        {mainTab === 'dokumen' && (
          <DokumenTab
            selectedPatient={selectedPatient}
            documents={paginatedDocs}
            totalDocs={patientDocs.length}
            docPage={docPage}
            setDocPage={setDocPage}
            pageSize={PAGE_SIZE_DOC}
            selectedDocType={selectedDocType}
            setSelectedDocType={setSelectedDocType}
            selectedDoc={selectedDoc}
            setSelectedDoc={setSelectedDoc}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
            refresh={refresh}
          />
        )}
        {mainTab === 'template' && (
          <div className="flex items-center justify-center h-full text-gray-500">
            Template belum tersedia
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedPatient && (
        <DocFormModal
          docType={selectedDocType}
          patient={selectedPatient}
          editingDoc={editingDoc}
          onSave={handleSaveDoc}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

// ─── Tab Button ──────────────────────────────────────────────────────────────

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-medium rounded-t border-b-2 transition-colors ${
        active ? 'border-blue-600 text-blue-700 bg-blue-50' : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
      }`}
    >
      {children}
    </button>
  );
}

// ─── List Pasien Tab ─────────────────────────────────────────────────────────

interface ListPasienTabProps {
  patients: PatientRow[];
  totalPatients: number;
  page: number;
  setPage: (p: number) => void;
  pageSize: number;
  selectedPatient: PatientRow | null;
  onSelectPatient: (p: PatientRow) => void;
  searchPatient: string;
  setSearchPatient: (s: string) => void;
  filterInstalasi: string;
  setFilterInstalasi: (s: string) => void;
  filterDokter: string;
  setFilterDokter: (s: string) => void;
  filterFrom: string;
  setFilterFrom: (s: string) => void;
  filterTo: string;
  setFilterTo: (s: string) => void;
  documents: RMEDocument[];
  selectedDocType: DocType;
  setSelectedDocType: (t: DocType) => void;
  selectedDoc: RMEDocument | null;
  setSelectedDoc: (d: RMEDocument | null) => void;
  rightSubTab: RightSubTab;
  setRightSubTab: (t: RightSubTab) => void;
  refresh: () => void;
}

function ListPasienTab(props: ListPasienTabProps) {
  const {
    patients, totalPatients, page, setPage, pageSize,
    selectedPatient, onSelectPatient,
    searchPatient, setSearchPatient,
    filterInstalasi, setFilterInstalasi,
    filterDokter, setFilterDokter,
    filterFrom, setFilterFrom,
    filterTo, setFilterTo,
    documents, selectedDocType, setSelectedDocType,
    selectedDoc, setSelectedDoc,
    rightSubTab, setRightSubTab,
    refresh,
  } = props;

  const rightDocs = useMemo(() => {
    if (!selectedPatient) return [];
    return documents.filter((d) => d.patientRM === selectedPatient.noRM && d.docType === selectedDocType);
  }, [documents, selectedPatient, selectedDocType]);

  return (
    <div className="flex h-full">
      {/* Left Panel 70% */}
      <div className="w-[70%] flex flex-col border-r bg-white">
        {/* Filters */}
        <div className="p-2 border-b bg-gray-50 flex flex-wrap gap-2 items-end">
          <div className="flex flex-col">
            <label className="text-[10px] text-gray-500 mb-0.5">Type</label>
            <select
              className="border rounded px-2 py-1 text-xs w-44"
              value={filterInstalasi}
              onChange={(e) => setFilterInstalasi(e.target.value)}
            >
              <option value="">Semua Instalasi</option>
              {INSTALASI_OPTIONS.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-[10px] text-gray-500 mb-0.5">Dokter</label>
            <select
              className="border rounded px-2 py-1 text-xs w-40"
              value={filterDokter}
              onChange={(e) => setFilterDokter(e.target.value)}
            >
              <option value="">Semua Dokter</option>
              {DOKTER_OPTIONS.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-[10px] text-gray-500 mb-0.5">Dari Tanggal</label>
            <input
              type="date"
              className="border rounded px-2 py-1 text-xs"
              value={filterFrom}
              onChange={(e) => setFilterFrom(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-[10px] text-gray-500 mb-0.5">Sampai Tanggal</label>
            <input
              type="date"
              className="border rounded px-2 py-1 text-xs"
              value={filterTo}
              onChange={(e) => setFilterTo(e.target.value)}
            />
          </div>
          <button
            className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
            onClick={() => { setFilterInstalasi(''); setFilterDokter(''); setFilterFrom(''); setFilterTo(''); }}
          >
            Filter All
          </button>
        </div>

        {/* Search */}
        <div className="p-2 border-b">
          <input
            type="text"
            placeholder="Cari nama pasien atau no RM..."
            className="border rounded px-2 py-1 text-xs w-full"
            value={searchPatient}
            onChange={(e) => { setSearchPatient(e.target.value); setPage(1); }}
          />
        </div>

        {/* Patient Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="px-2 py-1.5 text-left font-medium text-gray-600">PENJAMIN</th>
                <th className="px-2 py-1.5 text-left font-medium text-gray-600">POLI</th>
                <th className="px-2 py-1.5 text-left font-medium text-gray-600">TANGGALDAFTAR</th>
                <th className="px-2 py-1.5 text-left font-medium text-gray-600">NO RM</th>
                <th className="px-2 py-1.5 text-left font-medium text-gray-600">NAMAPASIEN</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr
                  key={p.id}
                  className={`cursor-pointer border-b hover:bg-blue-50 ${
                    selectedPatient?.id === p.id ? 'bg-blue-100' : ''
                  }`}
                  onClick={() => onSelectPatient(p)}
                >
                  <td className="px-2 py-1">{p.penjamin}</td>
                  <td className="px-2 py-1">{p.poli}</td>
                  <td className="px-2 py-1">{formatDate(p.tanggalDaftar)}</td>
                  <td className="px-2 py-1 font-mono">{p.noRM}</td>
                  <td className="px-2 py-1 font-medium">{p.nama}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-2 py-1 border-t bg-gray-50 flex items-center justify-between">
          <span className="text-[10px] text-gray-500">
            Record {Math.min((page - 1) * pageSize + 1, totalPatients)} of {totalPatients}
          </span>
          <div className="flex gap-1">
            <button
              className="px-2 py-0.5 border rounded text-[10px] disabled:opacity-50"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Prev
            </button>
            <button
              className="px-2 py-0.5 border rounded text-[10px] disabled:opacity-50"
              disabled={page * pageSize >= totalPatients}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel 30% */}
      <div className="w-[30%] flex flex-col bg-white">
        {/* Header */}
        <div className="flex items-center px-2 py-1.5 border-b bg-gray-50 gap-2">
          <label className="flex items-center gap-1 text-[10px]">
            <input type="checkbox" className="rounded" />
            Lihat Rincian Kuitansi?
          </label>
          <button className="ml-auto p-1 hover:bg-gray-200 rounded" onClick={refresh}>
            <RefreshCw size={12} />
          </button>
        </div>

        {/* Sub tabs */}
        <div className="flex border-b">
          <button
            className={`flex-1 py-1.5 text-[10px] font-medium ${rightSubTab === 'dokumen_rme' ? 'border-b-2 border-blue-600 text-blue-700' : 'text-gray-500'}`}
            onClick={() => setRightSubTab('dokumen_rme')}
          >
            Dokumen RME
          </button>
          <button
            className={`flex-1 py-1.5 text-[10px] font-medium ${rightSubTab === 'dokumen_lainnya' ? 'border-b-2 border-blue-600 text-blue-700' : 'text-gray-500'}`}
            onClick={() => setRightSubTab('dokumen_lainnya')}
          >
            Dokumen Lainnya
          </button>
        </div>

        {/* Doc type grid */}
        <div className="p-2 grid grid-cols-2 gap-1">
          {RIGHT_PANEL_DOCS.map((dt) => (
            <button
              key={dt}
              onClick={() => { setSelectedDocType(dt); setSelectedDoc(null); }}
              className={`px-1.5 py-1.5 text-[10px] rounded border text-center truncate ${
                selectedDocType === dt ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
              }`}
              title={DOC_TYPE_LABELS[dt]}
            >
              {DOC_TYPE_LABELS[dt]}
            </button>
          ))}
        </div>

        {/* Preview area */}
        <div className="flex-1 border-t m-2 mt-0 rounded border overflow-auto bg-gray-50 p-2">
          {selectedDoc ? (
            <DocPreview doc={selectedDoc} />
          ) : (
            <div className="flex items-center justify-center h-full text-[10px] text-gray-400">
              The document does not contain any pages.
            </div>
          )}
        </div>

        {/* Doc list for right panel */}
        {rightDocs.length > 0 && (
          <div className="border-t max-h-32 overflow-auto">
            {rightDocs.map((d) => (
              <div
                key={d.id}
                onClick={() => setSelectedDoc(d)}
                className={`px-2 py-1 text-[10px] border-b cursor-pointer hover:bg-blue-50 ${selectedDoc?.id === d.id ? 'bg-blue-100' : ''}`}
              >
                <span className="font-medium">{formatDateTime(d.tanggal)}</span> — {d.dokter}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Dokumen Tab ─────────────────────────────────────────────────────────────

interface DokumenTabProps {
  selectedPatient: PatientRow | null;
  documents: RMEDocument[];
  totalDocs: number;
  docPage: number;
  setDocPage: (p: number) => void;
  pageSize: number;
  selectedDocType: DocType;
  setSelectedDocType: (t: DocType) => void;
  selectedDoc: RMEDocument | null;
  setSelectedDoc: (d: RMEDocument | null) => void;
  onAdd: () => void;
  onEdit: () => void;
  onDelete: () => void;
  refresh: () => void;
}

function DokumenTab(props: DokumenTabProps) {
  const {
    selectedPatient, documents, totalDocs, docPage, setDocPage, pageSize,
    selectedDocType, setSelectedDocType, selectedDoc, setSelectedDoc,
    onAdd, onEdit, onDelete, refresh,
  } = props;

  if (!selectedPatient) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 text-sm">
        Pilih pasien terlebih dahulu dari tab &quot;List Pasien&quot;
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Patient info header */}
      <div className="bg-white border-b p-2">
        <div className="grid grid-cols-3 gap-x-6 gap-y-1 text-xs">
          <div className="flex gap-2">
            <span className="text-gray-500 w-20">Nomor RM</span>
            <span className="font-medium">{selectedPatient.noRM}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-500 w-24">Jenis Kelamin</span>
            <span>{selectedPatient.jenisKelamin || '-'}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-500 w-20">Kelas</span>
            <span>{selectedPatient.kelas || '-'}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-500 w-20">Nomor NIK</span>
            <span>{selectedPatient.nik || '-'}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-500 w-24">Agama</span>
            <span>{selectedPatient.agama || '-'}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-500 w-20">Jenis Peserta</span>
            <span>{selectedPatient.jenisPeserta || '-'}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-500 w-20">Nama Pasien</span>
            <span className="font-semibold">{selectedPatient.nama}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-500 w-24">Tanggal Lahir</span>
            <span>{selectedPatient.tanggalLahir ? formatDate(selectedPatient.tanggalLahir) : '-'}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-500 w-20">Usia</span>
            <span>{selectedPatient.tanggalLahir ? calcAge(selectedPatient.tanggalLahir) : '-'}</span>
          </div>
        </div>
      </div>

      {/* Doc type grid */}
      <div className="bg-white border-b p-2">
        <div className="grid grid-cols-6 gap-1">
          {DOKUMEN_TAB_DOCS.map((dt) => (
            <button
              key={dt}
              onClick={() => { setSelectedDocType(dt); setSelectedDoc(null); setDocPage(1); }}
              className={`px-1 py-1.5 text-[10px] rounded border text-center truncate ${
                selectedDocType === dt ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
              }`}
              title={DOC_TYPE_LABELS[dt]}
            >
              {DOC_TYPE_LABELS[dt]}
            </button>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border-b px-2 py-1 flex gap-1 flex-wrap">
        <ToolbarBtn icon={<Plus size={12} />} label="Add" onClick={onAdd} />
        <ToolbarBtn icon={<Pencil size={12} />} label="Edit" onClick={onEdit} disabled={!selectedDoc} />
        <ToolbarBtn icon={<Trash2 size={12} />} label="Delete" onClick={onDelete} disabled={!selectedDoc} />
        <ToolbarBtn icon={<RefreshCw size={12} />} label="Refresh" onClick={refresh} />
        <ToolbarBtn icon={<FileText size={12} />} label="Cetak SKD/SPRI" onClick={() => {}} />
        <ToolbarBtn icon={<FileText size={12} />} label="Konsul Dokter" onClick={() => {}} />
        <ToolbarBtn icon={<FileText size={12} />} label="Rujuk Internal" onClick={() => {}} />
      </div>

      {/* Bottom: Table + Preview */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: table */}
        <div className="w-[55%] flex flex-col border-r">
          <div className="flex-1 overflow-auto">
            <table className="w-full text-[10px]">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="px-1.5 py-1 text-left font-medium text-gray-600">PENJAMIN</th>
                  <th className="px-1.5 py-1 text-left font-medium text-gray-600">TANGGAL</th>
                  <th className="px-1.5 py-1 text-left font-medium text-gray-600">POLI/RUANG</th>
                  <th className="px-1.5 py-1 text-left font-medium text-gray-600">DOKTER</th>
                  <th className="px-1.5 py-1 text-left font-medium text-gray-600">USER</th>
                </tr>
              </thead>
              <tbody>
                {documents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-gray-400">
                      Tidak ada dokumen {DOC_TYPE_LABELS[selectedDocType]}
                    </td>
                  </tr>
                ) : (
                  documents.map((d) => (
                    <tr
                      key={d.id}
                      className={`cursor-pointer border-b hover:bg-blue-50 ${selectedDoc?.id === d.id ? 'bg-blue-100' : ''}`}
                      onClick={() => setSelectedDoc(d)}
                    >
                      <td className="px-1.5 py-1">{selectedPatient.penjamin}</td>
                      <td className="px-1.5 py-1">{formatDateTime(d.tanggal)}</td>
                      <td className="px-1.5 py-1">{d.poli}</td>
                      <td className="px-1.5 py-1">{d.dokter}</td>
                      <td className="px-1.5 py-1">{d.user}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-2 py-1 border-t bg-gray-50 text-[10px] text-gray-500 flex justify-between">
            <span>Record {totalDocs > 0 ? (docPage - 1) * pageSize + 1 : 0} of {totalDocs}</span>
            <div className="flex gap-1">
              <button className="px-2 py-0.5 border rounded disabled:opacity-50" disabled={docPage <= 1} onClick={() => setDocPage(docPage - 1)}>Prev</button>
              <button className="px-2 py-0.5 border rounded disabled:opacity-50" disabled={docPage * pageSize >= totalDocs} onClick={() => setDocPage(docPage + 1)}>Next</button>
            </div>
          </div>
        </div>

        {/* Right: Preview */}
        <div className="w-[45%] overflow-auto bg-gray-50 p-2">
          {selectedDoc ? (
            <DocPreview doc={selectedDoc} />
          ) : (
            <div className="flex items-center justify-center h-full text-[10px] text-gray-400">
              The document does not contain any pages.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Toolbar Button ──────────────────────────────────────────────────────────

function ToolbarBtn({ icon, label, onClick, disabled }: { icon: React.ReactNode; label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-1 px-2 py-1 text-[10px] border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
    >
      {icon}
      {label}
    </button>
  );
}

// ─── Doc Preview ─────────────────────────────────────────────────────────────

function DocPreview({ doc }: { doc: RMEDocument }) {
  if (doc.docType === 'cppt') {
    try {
      const data = JSON.parse(doc.content);
      return (
        <div className="text-[11px] space-y-2">
          <div className="font-semibold text-blue-700 mb-1">CPPT — {formatDateTime(doc.tanggal)}</div>
          <div className="font-medium text-gray-600">Dokter: {doc.dokter}</div>
          <div className="border-t pt-1">
            <div className="font-semibold text-gray-700">S (Subjective):</div>
            <div className="text-gray-600 ml-2">{data.subjective}</div>
          </div>
          <div className="border-t pt-1">
            <div className="font-semibold text-gray-700">O (Objective):</div>
            <div className="text-gray-600 ml-2">{data.objective}</div>
          </div>
          <div className="border-t pt-1">
            <div className="font-semibold text-gray-700">A (Assessment):</div>
            <div className="text-gray-600 ml-2">{data.assessment}</div>
          </div>
          <div className="border-t pt-1">
            <div className="font-semibold text-gray-700">P (Plan):</div>
            <div className="text-gray-600 ml-2">{data.plan}</div>
          </div>
          {data.instruksi && (
            <div className="border-t pt-1">
              <div className="font-semibold text-gray-700">Instruksi:</div>
              <div className="text-gray-600 ml-2">{data.instruksi}</div>
            </div>
          )}
        </div>
      );
    } catch {
      // fallback
    }
  }

  return (
    <div className="text-[11px] space-y-1">
      <div className="font-semibold text-blue-700">{DOC_TYPE_LABELS[doc.docType]} — {formatDateTime(doc.tanggal)}</div>
      <div className="text-gray-600">Dokter: {doc.dokter}</div>
      <div className="border-t pt-1 mt-1 text-gray-700 whitespace-pre-wrap">{doc.content}</div>
    </div>
  );
}

// ─── Doc Form Modal ──────────────────────────────────────────────────────────

interface DocFormModalProps {
  docType: DocType;
  patient: PatientRow;
  editingDoc: RMEDocument | null;
  onSave: (doc: RMEDocument) => void;
  onClose: () => void;
}

function DocFormModal({ docType, patient, editingDoc, onSave, onClose }: DocFormModalProps) {
  const isCPPT = docType === 'cppt';
  const isEdit = !!editingDoc;

  // Parse existing CPPT content
  const existingCPPT = useMemo(() => {
    if (isCPPT && editingDoc) {
      try { return JSON.parse(editingDoc.content); } catch { return {}; }
    }
    return {};
  }, [isCPPT, editingDoc]);

  const [tanggal, setTanggal] = useState(editingDoc?.tanggal?.slice(0, 16) || new Date().toISOString().slice(0, 16));
  const [poli, setPoli] = useState(editingDoc?.poli || POLI_OPTIONS[0]);
  const [dokter, setDokter] = useState(editingDoc?.dokter || DOKTER_OPTIONS[0]);

  // CPPT fields
  const [subjective, setSubjective] = useState(existingCPPT.subjective || '');
  const [objective, setObjective] = useState(existingCPPT.objective || '');
  const [assessment, setAssessment] = useState(existingCPPT.assessment || '');
  const [plan, setPlan] = useState(existingCPPT.plan || '');
  const [instruksi, setInstruksi] = useState(existingCPPT.instruksi || '');

  // Generic fields
  const [content, setContent] = useState(editingDoc && !isCPPT ? editingDoc.content : '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let finalContent = content;
    if (isCPPT) {
      finalContent = JSON.stringify({ subjective, objective, assessment, plan, instruksi });
    }

    const doc: RMEDocument = {
      id: editingDoc?.id || generateId(),
      patientRM: patient.noRM,
      patientName: patient.nama,
      docType,
      tanggal,
      poli,
      dokter,
      user: 'admin',
      content: finalContent,
    };
    onSave(doc);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-auto">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h3 className="text-sm font-semibold">
            {isEdit ? 'Edit' : 'Tambah'} {DOC_TYPE_LABELS[docType]}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-gray-500">Tanggal</label>
              <input
                type="datetime-local"
                className="w-full border rounded px-2 py-1 text-xs"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-500">Poli</label>
              <select className="w-full border rounded px-2 py-1 text-xs" value={poli} onChange={(e) => setPoli(e.target.value)}>
                {POLI_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[10px] text-gray-500">Dokter</label>
            <select className="w-full border rounded px-2 py-1 text-xs" value={dokter} onChange={(e) => setDokter(e.target.value)}>
              {DOKTER_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          {isCPPT ? (
            <>
              <div>
                <label className="text-[10px] text-gray-500">Subjective (Keluhan Pasien)</label>
                <textarea
                  className="w-full border rounded px-2 py-1 text-xs h-16"
                  value={subjective}
                  onChange={(e) => setSubjective(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500">Objective (Pemeriksaan Fisik)</label>
                <textarea
                  className="w-full border rounded px-2 py-1 text-xs h-16"
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500">Assessment (Diagnosa)</label>
                <textarea
                  className="w-full border rounded px-2 py-1 text-xs h-12"
                  value={assessment}
                  onChange={(e) => setAssessment(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500">Plan (Rencana Tindakan)</label>
                <textarea
                  className="w-full border rounded px-2 py-1 text-xs h-12"
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-500">Instruksi</label>
                <textarea
                  className="w-full border rounded px-2 py-1 text-xs h-12"
                  value={instruksi}
                  onChange={(e) => setInstruksi(e.target.value)}
                />
              </div>
            </>
          ) : (
            <div>
              <label className="text-[10px] text-gray-500">Isi / Catatan</label>
              <textarea
                className="w-full border rounded px-2 py-1 text-xs h-32"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t">
            <button type="button" onClick={onClose} className="px-3 py-1.5 text-xs border rounded hover:bg-gray-50">
              Batal
            </button>
            <button type="submit" className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">
              {isEdit ? 'Simpan Perubahan' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Utils ───────────────────────────────────────────────────────────────────

function calcAge(dob: string): string {
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) {
    age--;
  }
  return `${age} tahun`;
}
