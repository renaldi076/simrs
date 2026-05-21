import React, { useState, useEffect, useCallback } from 'react';
import {
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Pencil,
  Trash2,
  Printer,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { referensiService, type ReferensiItem } from '@/services/modules/referensiService';

// --- Menu Structure Types ---
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
const ADMISSION_CHILDREN: (MenuItem | MenuSeparator)[] = [
  { type: 'item', key: 'adm_pasien', label: 'Pasien' },
  { type: 'item', key: 'adm_unit', label: 'Unit' },
  { type: 'item', key: 'adm_spesialistik', label: 'Spesialistik' },
  { type: 'item', key: 'adm_dokter', label: 'Dokter' },
  { type: 'item', key: 'adm_kelas_rawat', label: 'Kelas Rawat' },
  { type: 'item', key: 'adm_diagnosa', label: 'Diagnosa' },
  { type: 'item', key: 'adm_diagnosa_prb', label: 'Diagnosa PRB' },
  { type: 'item', key: 'adm_prosedur', label: 'Prosedur' },
  { type: 'item', key: 'adm_cara_keluar', label: 'Cara Keluar' },
  { type: 'item', key: 'adm_pasca_pulang', label: 'Pasca Pulang' },
  { type: 'item', key: 'adm_cob', label: 'COB' },
  { type: 'item', key: 'adm_faskes', label: 'Faskes' },
  { type: 'item', key: 'adm_kelas_aplicare', label: 'Kelas Aplicare' },
  { type: 'separator' },
  { type: 'item', key: 'adm_jenis_daftar', label: 'Jenis Daftar' },
  { type: 'item', key: 'adm_jenis_peserta', label: 'Jenis Peserta' },
  { type: 'item', key: 'adm_status_kecelakaan', label: 'Status Kecelakaan' },
  { type: 'item', key: 'adm_tindak_lanjut', label: 'Tindak Lanjut' },
  { type: 'item', key: 'adm_datang_via', label: 'Datang VIA' },
  { type: 'item', key: 'adm_l6', label: 'L6' },
  { type: 'separator' },
  { type: 'item', key: 'adm_diagnosa_harga', label: 'Diagnosa Harga' },
  { type: 'separator' },
  { type: 'item', key: 'adm_jadwal_dokter', label: 'Jadwal Dokter' },
];

const MENU_ITEMS: MenuEntry[] = [
  { type: 'group', key: 'admission', label: 'Admission', children: ADMISSION_CHILDREN },
  { type: 'separator' },
  { type: 'item', key: 'tarif', label: 'Tarif' },
  { type: 'item', key: 'obat', label: 'Obat' },
  { type: 'item', key: 'tindakan', label: 'Tindakan' },
  { type: 'item', key: 'group_tarif', label: 'Group Tarif' },
  { type: 'item', key: 'kelompok_cbg', label: 'Kelompok CBG' },
  { type: 'item', key: 'validasi_rj', label: 'Validasi RJ' },
  { type: 'item', key: 'item_5', label: 'ITEM_5' },
  { type: 'item', key: 'item_6', label: 'ITEM_6' },
  { type: 'item', key: 'signa', label: 'Signa' },
  { type: 'item', key: 'cara_pakai', label: 'Cara Pakai' },
  { type: 'separator' },
  { type: 'item', key: 'supplier', label: 'Supplier' },
  { type: 'item', key: 'gudang', label: 'Gudang' },
  { type: 'item', key: 'satuan', label: 'Satuan' },
  { type: 'separator' },
  { type: 'item', key: 'kesatuan', label: 'Kesatuan' },
  { type: 'item', key: 'pangkat', label: 'Pangkat' },
  { type: 'item', key: 'golongan', label: 'Golongan' },
  { type: 'item', key: 'pendidikan', label: 'Pendidikan' },
  { type: 'item', key: 'pekerjaan', label: 'Pekerjaan' },
  { type: 'item', key: 'agama', label: 'Agama' },
  { type: 'item', key: 'suku', label: 'Suku' },
  { type: 'item', key: 'status_keluarga', label: 'Status Keluarga' },
  { type: 'separator' },
  { type: 'item', key: 'perusahaan', label: 'Perusahaan' },
  { type: 'item', key: 'penjamin', label: 'Penjamin' },
  { type: 'item', key: 'type_pembayaran', label: 'Type Pembayaran' },
  { type: 'item', key: 'provinsi', label: 'Provinsi' },
  { type: 'item', key: 'kabupaten_kota', label: 'Kabupaten/Kota' },
  { type: 'item', key: 'kecamatan', label: 'Kecamatan' },
  { type: 'item', key: 'kelurahan', label: 'Kelurahan' },
  { type: 'item', key: 'bagian', label: 'Bagian' },
  { type: 'item', key: 'pangkat_2', label: 'Pangkat' },
];

// --- Alert State ---
interface AlertState {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>;

// --- Patient Form Interface ---
interface PatientFormData {
  noRM: string;
  tampilanNama: string;
  jenisPeserta: string;
  penjamin: string;
  kesatuan: string;
  pangkat: string;
  pekerjaan: string;
  perusahaan: string;
  suku: string;
  pemegangAsuransi: string;
  pemegangAsuransiText: string;
  pendidikan: string;
  noKTP: string;
  aktif: boolean;
  nrpNip: string;
  meninggal: boolean;
  noKartuBPJS: string;
  tempatLahir: string;
  tanggalLahir: string;
  wni: string;
  jenisKelamin: string;
  golonganDarah: string;
  statusKawin: string;
  golongan: string;
  agama: string;
  telepon: string;
  fax: string;
  handphone: string;
  email: string;
  lainLain: string;
  website: string;
}

const INITIAL_PATIENT_FORM: PatientFormData = {
  noRM: '',
  tampilanNama: '',
  jenisPeserta: '',
  penjamin: '',
  kesatuan: '',
  pangkat: '',
  pekerjaan: 'LAINNYA',
  perusahaan: '',
  suku: 'SUNDA',
  pemegangAsuransi: 'SENDIRI',
  pemegangAsuransiText: '',
  pendidikan: 'BELUM SEKOLAH',
  noKTP: '',
  aktif: true,
  nrpNip: '',
  meninggal: false,
  noKartuBPJS: '',
  tempatLahir: '',
  tanggalLahir: '',
  wni: 'Ya',
  jenisKelamin: '',
  golonganDarah: '',
  statusKawin: 'BELUM MENIKAH',
  golongan: '',
  agama: 'ISLAM',
  telepon: '',
  fax: '',
  handphone: '',
  email: '',
  lainLain: '',
  website: '',
};

// --- Pasien View Component ---
function PasienView() {
  const [data, setData] = useState<ReferensiItem[]>([]);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [patientForm, setPatientForm] = useState<PatientFormData>(INITIAL_PATIENT_FORM);
  const [contactTab, setContactTab] = useState<'kontak' | 'alamat' | 'lainlain'>('kontak');
  const [alert, setAlert] = useState<AlertState | null>(null);
  const [currentRecord, setCurrentRecord] = useState(1);

  const loadData = useCallback(() => {
    const items = referensiService.getAll('adm_pasien', search);
    setData(items);
  }, [search]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  function openAddModal() {
    const nextRM = referensiService.getNextRMNumber();
    setPatientForm({ ...INITIAL_PATIENT_FORM, noRM: nextRM });
    setContactTab('kontak');
    setShowAddModal(true);
  }

  function handleFormChange(field: keyof PatientFormData, value: string | boolean) {
    setPatientForm(prev => ({ ...prev, [field]: value }));
  }

  function handleSubmitPatient() {
    if (!patientForm.tampilanNama.trim()) {
      setAlert({ type: 'error', message: 'Tampilan Nama wajib diisi.' });
      return;
    }
    referensiService.create('adm_pasien', {
      kode: patientForm.noRM,
      nama: patientForm.tampilanNama.toUpperCase(),
      isActive: patientForm.aktif,
    });
    setAlert({ type: 'success', message: 'Data pasien berhasil ditambahkan.' });
    setShowAddModal(false);
    loadData();
  }

  function handleDelete() {
    if (data.length === 0) return;
    const item = data[0];
    referensiService.remove('adm_pasien', item.id);
    setAlert({ type: 'success', message: 'Data berhasil dihapus.' });
    loadData();
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button onClick={openAddModal} className="p-1.5 hover:bg-blue-100 rounded text-blue-600" title="Tambah"><Plus size={18} /></button>
          <button className="p-1.5 hover:bg-yellow-100 rounded text-yellow-600" title="Edit"><Pencil size={18} /></button>
          <button onClick={handleDelete} className="p-1.5 hover:bg-red-100 rounded text-red-600" title="Hapus"><Trash2 size={18} /></button>
          <button className="p-1.5 hover:bg-green-100 rounded text-green-600" title="Cetak"><Printer size={18} /></button>
          <button onClick={loadData} className="p-1.5 hover:bg-cyan-100 rounded text-cyan-600" title="Refresh"><RefreshCw size={18} /></button>
          <label className="ml-3 flex items-center gap-1 text-xs text-gray-600">
            <input type="checkbox" defaultChecked className="w-3 h-3" />
            Top 1000?
          </label>
        </div>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Search */}
      <div className="flex items-center gap-2">
        <select className="border border-gray-300 rounded px-2 py-1.5 text-sm">
          <option>Semua</option>
          <option>No. RM</option>
          <option>Nama</option>
        </select>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari..."
          className="border border-gray-300 rounded px-2 py-1.5 text-sm flex-1 max-w-xs"
        />
        <button onClick={() => setSearch('')} className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-100">Clear</button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">No. RM</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Tampilan Nama</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {data.length === 0 ? (
              <tr><td colSpan={2} className="px-4 py-8 text-center text-sm text-gray-500">Tidak ada data</td></tr>
            ) : (
              data.map((item, idx) => (
                <tr key={item.id} className={idx % 2 === 1 ? 'bg-gray-50' : ''}>
                  <td className="px-4 py-2 text-sm text-gray-700">{item.kode}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{item.nama}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center gap-2 text-xs text-gray-600">
        <span>Record {currentRecord} of {data.length}</span>
        <button onClick={() => setCurrentRecord(Math.min(currentRecord + 1, data.length))} className="px-1 hover:text-blue-600">▶</button>
        <button onClick={() => setCurrentRecord(Math.min(currentRecord + 10, data.length))} className="px-1 hover:text-blue-600">▶▶</button>
        <button onClick={() => setCurrentRecord(data.length)} className="px-1 hover:text-blue-600">▶▶▶</button>
      </div>

      {/* Add Patient Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Tambah Pasien"
        size="full"
      >
        <div className="max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
            {/* Left Column */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-700 w-32 shrink-0">No. RM *</label>
                <input value={patientForm.noRM} readOnly className="border border-gray-300 rounded px-2 py-1 text-xs bg-gray-100 flex-1" />
                <span className="text-[10px] text-gray-400">&lt;-- AUTO --&gt;</span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-700 w-32 shrink-0">Tampilan Nama *</label>
                <input value={patientForm.tampilanNama} onChange={e => handleFormChange('tampilanNama', e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-xs flex-1" />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-700 w-32 shrink-0">Jenis Peserta</label>
                <select value={patientForm.jenisPeserta} onChange={e => handleFormChange('jenisPeserta', e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-xs flex-1">
                  <option value="">-- Pilih --</option>
                  <option>PEKERJA PENERIMA UPAH</option>
                  <option>PEGAWAI PEMERINTAH</option>
                  <option>VETERAN</option>
                  <option>PEKERJA BUKAN PENERIMA UPAH</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-700 w-32 shrink-0">Penjamin *</label>
                <select value={patientForm.penjamin} onChange={e => handleFormChange('penjamin', e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-xs flex-1">
                  <option value="">-- Pilih --</option>
                  <option>BPJS</option>
                  <option>UMUM</option>
                  <option>ASURANSI</option>
                </select>
                <button type="button" className="text-blue-600 text-xs font-bold">+</button>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-700 w-32 shrink-0">Kesatuan *</label>
                <select value={patientForm.kesatuan} onChange={e => handleFormChange('kesatuan', e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-xs flex-1">
                  <option value="">-- Pilih --</option>
                  <option>TNI AD</option>
                  <option>TNI AL</option>
                  <option>TNI AU</option>
                  <option>POLRI</option>
                  <option>UMUM</option>
                </select>
                <button type="button" className="text-blue-600 text-xs font-bold">+</button>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-700 w-32 shrink-0">Pangkat *</label>
                <select value={patientForm.pangkat} onChange={e => handleFormChange('pangkat', e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-xs flex-1">
                  <option value="">-- Pilih --</option>
                  <option>PRAJURIT</option>
                  <option>BINTARA</option>
                  <option>PERWIRA</option>
                  <option>PNS</option>
                </select>
                <button type="button" className="text-blue-600 text-xs font-bold">+</button>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-700 w-32 shrink-0">Pekerjaan *</label>
                <select value={patientForm.pekerjaan} onChange={e => handleFormChange('pekerjaan', e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-xs flex-1">
                  <option>LAINNYA</option>
                  <option>PNS</option>
                  <option>TNI/POLRI</option>
                  <option>SWASTA</option>
                  <option>WIRASWASTA</option>
                  <option>PETANI</option>
                  <option>BURUH</option>
                  <option>PEDAGANG</option>
                  <option>PELAJAR/MAHASISWA</option>
                  <option>IRT</option>
                </select>
                <button type="button" className="text-blue-600 text-xs font-bold">+</button>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-700 w-32 shrink-0">Perusahaan *</label>
                <select value={patientForm.perusahaan} onChange={e => handleFormChange('perusahaan', e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-xs flex-1">
                  <option value="">-- Pilih --</option>
                  <option>PT. TELKOM</option>
                  <option>PT. PLN</option>
                  <option>PEMERINTAH</option>
                  <option>WIRASWASTA</option>
                </select>
                <button type="button" className="text-blue-600 text-xs font-bold">+</button>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-700 w-32 shrink-0">Suku *</label>
                <select value={patientForm.suku} onChange={e => handleFormChange('suku', e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-xs flex-1">
                  <option>SUNDA</option>
                  <option>JAWA</option>
                  <option>BATAK</option>
                  <option>MINANG</option>
                  <option>BETAWI</option>
                  <option>MELAYU</option>
                  <option>LAINNYA</option>
                </select>
                <button type="button" className="text-blue-600 text-xs font-bold">+</button>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-700 w-32 shrink-0">Pemegang Asuransi *</label>
                <select value={patientForm.pemegangAsuransi} onChange={e => handleFormChange('pemegangAsuransi', e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-xs flex-1">
                  <option>SENDIRI</option>
                  <option>SUAMI</option>
                  <option>ISTRI</option>
                  <option>ANAK</option>
                  <option>ORANG TUA</option>
                </select>
                <button type="button" className="text-blue-600 text-xs font-bold">+</button>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-700 w-32 shrink-0">Pemegang Asuransi</label>
                <input value={patientForm.pemegangAsuransiText} onChange={e => handleFormChange('pemegangAsuransiText', e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-xs flex-1" />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-700 w-32 shrink-0">Pendidikan *</label>
                <select value={patientForm.pendidikan} onChange={e => handleFormChange('pendidikan', e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-xs flex-1">
                  <option>BELUM SEKOLAH</option>
                  <option>SD</option>
                  <option>SMP</option>
                  <option>SMA</option>
                  <option>D3</option>
                  <option>S1</option>
                  <option>S2</option>
                  <option>S3</option>
                </select>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-700 w-32 shrink-0">No KTP *</label>
                <input value={patientForm.noKTP} onChange={e => handleFormChange('noKTP', e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-xs flex-1" />
                <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={patientForm.aktif} onChange={e => handleFormChange('aktif', e.target.checked)} className="w-3 h-3" />Aktif?</label>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-700 w-32 shrink-0">NRP/NIP</label>
                <input value={patientForm.nrpNip} onChange={e => handleFormChange('nrpNip', e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-xs flex-1" />
                <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={patientForm.meninggal} onChange={e => handleFormChange('meninggal', e.target.checked)} className="w-3 h-3" />Meninggal?</label>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-700 w-32 shrink-0">No Kartu BPJS</label>
                <input value={patientForm.noKartuBPJS} onChange={e => handleFormChange('noKartuBPJS', e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-xs flex-1" />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-700 w-32 shrink-0">Tempat Lahir *</label>
                <input value={patientForm.tempatLahir} onChange={e => handleFormChange('tempatLahir', e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-xs flex-1" />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-700 w-32 shrink-0">Tanggal Lahir *</label>
                <input type="datetime-local" value={patientForm.tanggalLahir} onChange={e => handleFormChange('tanggalLahir', e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-xs flex-1" />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-700 w-32 shrink-0">WNI?</label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-1 text-xs"><input type="radio" name="wni" value="Ya" checked={patientForm.wni === 'Ya'} onChange={e => handleFormChange('wni', e.target.value)} />Ya</label>
                  <label className="flex items-center gap-1 text-xs"><input type="radio" name="wni" value="Bukan" checked={patientForm.wni === 'Bukan'} onChange={e => handleFormChange('wni', e.target.value)} />Bukan</label>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-700 w-32 shrink-0">Jenis Kelamin *</label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-1 text-xs"><input type="radio" name="jk" value="Perempuan" checked={patientForm.jenisKelamin === 'Perempuan'} onChange={e => handleFormChange('jenisKelamin', e.target.value)} />Perempuan</label>
                  <label className="flex items-center gap-1 text-xs"><input type="radio" name="jk" value="Laki-laki" checked={patientForm.jenisKelamin === 'Laki-laki'} onChange={e => handleFormChange('jenisKelamin', e.target.value)} />Laki-laki</label>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-700 w-32 shrink-0">Golongan Darah *</label>
                <select value={patientForm.golonganDarah} onChange={e => handleFormChange('golonganDarah', e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-xs flex-1">
                  <option value="">-- Pilih --</option>
                  <option>A</option>
                  <option>B</option>
                  <option>AB</option>
                  <option>O</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-700 w-32 shrink-0">Status Kawin *</label>
                <select value={patientForm.statusKawin} onChange={e => handleFormChange('statusKawin', e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-xs flex-1">
                  <option>BELUM MENIKAH</option>
                  <option>MENIKAH</option>
                  <option>CERAI</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-700 w-32 shrink-0">Golongan *</label>
                <select value={patientForm.golongan} onChange={e => handleFormChange('golongan', e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-xs flex-1">
                  <option value="">-- Pilih --</option>
                  <option>I</option>
                  <option>II</option>
                  <option>III</option>
                  <option>IV</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-700 w-32 shrink-0">Agama *</label>
                <select value={patientForm.agama} onChange={e => handleFormChange('agama', e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-xs flex-1">
                  <option>ISLAM</option>
                  <option>KRISTEN</option>
                  <option>KATOLIK</option>
                  <option>HINDU</option>
                  <option>BUDDHA</option>
                  <option>KONGHUCU</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bottom Tabs */}
          <div className="mt-6 border-t border-gray-200 pt-4">
            <div className="flex gap-0 border-b border-gray-200">
              <button
                onClick={() => setContactTab('kontak')}
                className={`px-4 py-2 text-xs font-medium border-b-2 ${contactTab === 'kontak' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >Kontak</button>
              <button
                onClick={() => setContactTab('alamat')}
                className={`px-4 py-2 text-xs font-medium border-b-2 ${contactTab === 'alamat' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >Alamat</button>
              <button
                onClick={() => setContactTab('lainlain')}
                className={`px-4 py-2 text-xs font-medium border-b-2 ${contactTab === 'lainlain' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >Lain-lain</button>
            </div>

            {contactTab === 'kontak' && (
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 pt-4">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-gray-700 w-24 shrink-0">Telepon</label>
                  <input value={patientForm.telepon} onChange={e => handleFormChange('telepon', e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-xs flex-1" />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-gray-700 w-24 shrink-0">Fax</label>
                  <input value={patientForm.fax} onChange={e => handleFormChange('fax', e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-xs flex-1" />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-gray-700 w-24 shrink-0">Handphone</label>
                  <input value={patientForm.handphone} onChange={e => handleFormChange('handphone', e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-xs flex-1" />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-gray-700 w-24 shrink-0">Email</label>
                  <input value={patientForm.email} onChange={e => handleFormChange('email', e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-xs flex-1" />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-gray-700 w-24 shrink-0">Lain-lain</label>
                  <input value={patientForm.lainLain} onChange={e => handleFormChange('lainLain', e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-xs flex-1" />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-gray-700 w-24 shrink-0">Website</label>
                  <input value={patientForm.website} onChange={e => handleFormChange('website', e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-xs flex-1" />
                </div>
              </div>
            )}

            {contactTab === 'alamat' && (
              <div className="pt-4 text-xs text-gray-400 italic">Tab Alamat - Belum diimplementasi</div>
            )}

            {contactTab === 'lainlain' && (
              <div className="pt-4 text-xs text-gray-400 italic">Tab Lain-lain - Belum diimplementasi</div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-4">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>Batal</Button>
            <Button onClick={handleSubmitPatient}>Simpan</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function ReferensiPage(): React.ReactElement {
  const [activeKey, setActiveKey] = useState<string>('tarif');
  const [activeLabel, setActiveLabel] = useState<string>('Tarif');
  const [admissionExpanded, setAdmissionExpanded] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Data state
  const [data, setData] = useState<ReferensiItem[]>([]);
  const [search, setSearch] = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ReferensiItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form state
  const [formKode, setFormKode] = useState('');
  const [formNama, setFormNama] = useState('');
  const [formActive, setFormActive] = useState(true);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Alert state
  const [alert, setAlert] = useState<AlertState | null>(null);

  const loadData = useCallback(() => {
    const items = referensiService.getAll(activeKey, search);
    setData(items);
  }, [activeKey, search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    setSearch('');
  }, [activeKey]);

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  function handleMenuClick(key: string, label: string) {
    setActiveKey(key);
    setActiveLabel(label);
  }

  function openCreateModal() {
    setEditingItem(null);
    setFormKode('');
    setFormNama('');
    setFormActive(true);
    setFormErrors({});
    setModalOpen(true);
  }

  function openEditModal(item: ReferensiItem) {
    setEditingItem(item);
    setFormKode(item.kode);
    setFormNama(item.nama);
    setFormActive(item.isActive);
    setFormErrors({});
    setModalOpen(true);
  }

  function validateForm(): boolean {
    const errors: Record<string, string> = {};
    if (!formKode.trim()) errors.kode = 'Kode wajib diisi';
    if (!formNama.trim()) errors.nama = 'Nama wajib diisi';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleSubmit() {
    if (!validateForm()) return;

    if (editingItem) {
      referensiService.update(activeKey, editingItem.id, {
        kode: formKode.trim(),
        nama: formNama.trim(),
        isActive: formActive,
      });
      setAlert({ type: 'success', message: 'Data berhasil diperbarui.' });
    } else {
      referensiService.create(activeKey, {
        kode: formKode.trim(),
        nama: formNama.trim(),
        isActive: formActive,
      });
      setAlert({ type: 'success', message: 'Data berhasil ditambahkan.' });
    }

    setModalOpen(false);
    loadData();
  }

  function handleDelete(id: string) {
    const success = referensiService.remove(activeKey, id);
    if (success) {
      setAlert({ type: 'success', message: 'Data berhasil dihapus.' });
    } else {
      setAlert({ type: 'error', message: 'Gagal menghapus data.' });
    }
    setDeleteConfirmId(null);
    loadData();
  }

  // --- Table columns ---
  const columns = [
    { key: 'kode', label: 'Kode' },
    { key: 'nama', label: 'Nama' },
    {
      key: 'isActive',
      label: 'Status',
      render: (item: AnyRecord) => (
        <Badge variant={item.isActive ? 'success' : 'danger'} size="sm">
          {item.isActive ? 'Aktif' : 'Nonaktif'}
        </Badge>
      ),
    },
    {
      key: 'aksi',
      label: 'Aksi',
      render: (item: AnyRecord) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => openEditModal(item as ReferensiItem)}>
            Edit
          </Button>
          <Button size="sm" variant="danger" onClick={() => setDeleteConfirmId(item.id as string)}>
            Hapus
          </Button>
        </div>
      ),
    },
  ];

  // --- Sidebar rendering ---
  function renderMenuItem(entry: MenuEntry, idx: number) {
    if (entry.type === 'separator') {
      return <hr key={`sep-${idx}`} className="my-1 border-gray-300" />;
    }

    if (entry.type === 'group') {
      return (
        <div key={entry.key}>
          <button
            onClick={() => setAdmissionExpanded(!admissionExpanded)}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded transition-colors`}
          >
            {admissionExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            {entry.label}
          </button>
          {admissionExpanded && (
            <div className="ml-2">
              {entry.children.map((child, cIdx) => {
                if (child.type === 'separator') {
                  return <hr key={`adm-sep-${cIdx}`} className="my-1 border-gray-300 ml-3" />;
                }
                const isActive = activeKey === child.key;
                return (
                  <button
                    key={child.key}
                    onClick={() => handleMenuClick(child.key, child.label)}
                    className={`w-full text-left px-3 py-1.5 text-xs rounded transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {child.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    // Regular item
    const isActive = activeKey === entry.key;
    return (
      <button
        key={entry.key}
        onClick={() => handleMenuClick(entry.key, entry.label)}
        className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
          isActive
            ? 'bg-blue-100 text-blue-700 font-medium'
            : 'text-gray-700 hover:bg-gray-200'
        }`}
      >
        {entry.label}
      </button>
    );
  }

  // --- Render content based on activeKey ---
  function renderContent() {
    // Special case: adm_pasien gets its own view
    if (activeKey === 'adm_pasien') {
      return (
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-4">
            <h1 className="text-xl font-bold text-gray-900">Pasien</h1>
            <PasienView />
          </div>
        </div>
      );
    }

    // Generic CRUD view
    return (
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">{activeLabel}</h1>
            <Button onClick={openCreateModal}>Tambah</Button>
          </div>

          {alert && (
            <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
          )}

          {/* Search */}
          <div className="w-72">
            <Input
              name="search"
              placeholder="Cari kode atau nama..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Data Table */}
          <Table
            columns={columns}
            data={data as unknown as AnyRecord[]}
            emptyMessage="Tidak ada data"
          />
        </div>

        {/* Create/Edit Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingItem ? `Edit ${activeLabel}` : `Tambah ${activeLabel}`}
          size="md"
        >
          <div className="space-y-4">
            <Input
              name="kode"
              label="Kode"
              required
              value={formKode}
              onChange={(e) => {
                setFormKode(e.target.value);
                if (formErrors.kode) setFormErrors((p) => { const n = { ...p }; delete n.kode; return n; });
              }}
              error={formErrors.kode}
            />
            <Input
              name="nama"
              label="Nama"
              required
              value={formNama}
              onChange={(e) => {
                setFormNama(e.target.value);
                if (formErrors.nama) setFormErrors((p) => { const n = { ...p }; delete n.nama; return n; });
              }}
              error={formErrors.nama}
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formActive}
                onChange={(e) => setFormActive(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700">Aktif</label>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleSubmit}>
                {editingItem ? 'Simpan' : 'Tambah'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={!!deleteConfirmId}
          onClose={() => setDeleteConfirmId(null)}
          title="Konfirmasi Hapus"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
                Batal
              </Button>
              <Button variant="danger" onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}>
                Hapus
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  return (
    <div className="flex h-full gap-0">
      {/* Left Sidebar Menu */}
      <div
        className={`shrink-0 bg-gray-50 border-r border-gray-200 overflow-y-auto transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'w-0 p-0 overflow-hidden' : 'w-[250px] p-2'
        }`}
      >
        <h2 className="px-3 py-2 text-xs font-semibold uppercase text-gray-500 tracking-wider">
          Menu Referensi
        </h2>
        <nav className="flex flex-col gap-0.5">
          {MENU_ITEMS.map((entry, idx) => renderMenuItem(entry, idx))}
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

      {/* Right Content Panel */}
      {renderContent()}
    </div>
  );
}
