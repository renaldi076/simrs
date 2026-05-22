import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Alert } from '@/components/ui/Alert';
import { referensiService, type ReferensiItem } from '@/services/modules/referensiService';

// --- Common Alert State ---
interface AlertState {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

// --- Generic CRUD View with custom columns/form ---
interface ColumnDef {
  key: string;
  label: string;
  render?: (item: ReferensiItem) => React.ReactNode;
}

interface FieldDef {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'select' | 'time';
  options?: string[];
  required?: boolean;
  placeholder?: string;
}

interface GenericCrudViewProps {
  storageKey: string;
  title: string;
  columns: ColumnDef[];
  fields: FieldDef[];
  buildItem?: (form: Record<string, string>) => Omit<ReferensiItem, 'id'>;
  parseItem?: (item: ReferensiItem) => Record<string, string>;
}

function GenericCrudView({ storageKey, title, columns, fields, buildItem, parseItem }: GenericCrudViewProps) {
  const [data, setData] = useState<ReferensiItem[]>([]);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ReferensiItem | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [alert, setAlert] = useState<AlertState | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const loadData = useCallback(() => {
    const items = referensiService.getAll(storageKey, search);
    setData(items);
  }, [storageKey, search]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => {
    if (alert) { const t = setTimeout(() => setAlert(null), 4000); return () => clearTimeout(t); }
  }, [alert]);

  function initForm() {
    const f: Record<string, string> = {};
    fields.forEach(fd => { f[fd.key] = fd.type === 'number' ? '0' : ''; });
    return f;
  }

  function openAdd() {
    setEditingItem(null);
    setForm(initForm());
    setShowModal(true);
  }

  function openEdit() {
    const item = data.find(d => d.id === selectedId);
    if (!item) return;
    setEditingItem(item);
    if (parseItem) {
      setForm(parseItem(item));
    } else {
      const f: Record<string, string> = { kode: item.kode, nama: item.nama };
      if (item.extra) {
        Object.entries(item.extra).forEach(([k, v]) => { f[k] = String(v ?? ''); });
      }
      setForm(f);
    }
    setShowModal(true);
  }

  function handleSubmit() {
    // Basic validation on required fields
    for (const fd of fields) {
      if (fd.required && !form[fd.key]?.trim()) {
        setAlert({ type: 'error', message: `${fd.label} wajib diisi.` });
        return;
      }
    }

    if (buildItem) {
      const itemData = buildItem(form);
      if (editingItem) {
        referensiService.update(storageKey, editingItem.id, itemData);
        setAlert({ type: 'success', message: 'Data berhasil diperbarui.' });
      } else {
        referensiService.create(storageKey, itemData);
        setAlert({ type: 'success', message: 'Data berhasil ditambahkan.' });
      }
    } else {
      // Default: first field=kode, second=nama, rest=extra
      const extra: Record<string, any> = {};
      fields.forEach((fd, idx) => {
        if (idx >= 2) extra[fd.key] = form[fd.key] || '';
      });
      const itemData: Omit<ReferensiItem, 'id'> = {
        kode: form[fields[0]?.key] || '',
        nama: form[fields[1]?.key] || '',
        isActive: true,
        extra: Object.keys(extra).length > 0 ? extra : undefined,
      };
      if (editingItem) {
        referensiService.update(storageKey, editingItem.id, itemData);
        setAlert({ type: 'success', message: 'Data berhasil diperbarui.' });
      } else {
        referensiService.create(storageKey, itemData);
        setAlert({ type: 'success', message: 'Data berhasil ditambahkan.' });
      }
    }
    setShowModal(false);
    loadData();
  }

  function handleDelete(id: string) {
    referensiService.remove(storageKey, id);
    setAlert({ type: 'success', message: 'Data berhasil dihapus.' });
    setDeleteConfirmId(null);
    setSelectedId(null);
    loadData();
  }

  function confirmDelete() {
    if (!selectedId) return;
    setDeleteConfirmId(selectedId);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-1">
        <button onClick={openAdd} className="p-1.5 hover:bg-blue-100 rounded text-blue-600" title="Tambah"><Plus size={18} /></button>
        <button onClick={openEdit} className="p-1.5 hover:bg-yellow-100 rounded text-yellow-600" title="Edit" disabled={!selectedId}><Pencil size={18} /></button>
        <button onClick={confirmDelete} className="p-1.5 hover:bg-red-100 rounded text-red-600" title="Hapus" disabled={!selectedId}><Trash2 size={18} /></button>
        <button onClick={loadData} className="p-1.5 hover:bg-cyan-100 rounded text-cyan-600" title="Refresh"><RefreshCw size={18} /></button>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari..."
          className="ml-3 border border-gray-300 rounded px-2 py-1.5 text-sm max-w-xs"
        />
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map(col => (
                <th key={col.key} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {data.length === 0 ? (
              <tr><td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-gray-500">Tidak ada data</td></tr>
            ) : data.map((item, idx) => (
              <tr
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                className={`cursor-pointer ${selectedId === item.id ? 'bg-blue-100' : idx % 2 === 1 ? 'bg-gray-50' : ''} hover:bg-blue-50`}
              >
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-2 text-sm text-gray-700">
                    {col.render ? col.render(item) : col.key === 'kode' ? item.kode : col.key === 'nama' ? item.nama : (item.extra?.[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingItem ? `Edit ${title}` : `Tambah ${title}`} size="md">
        <div className="space-y-4">
          {fields.map(fd => (
            <div key={fd.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{fd.label}{fd.required && ' *'}</label>
              {fd.type === 'select' ? (
                <select
                  value={form[fd.key] || ''}
                  onChange={e => setForm(prev => ({ ...prev, [fd.key]: e.target.value }))}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                >
                  <option value="">-- Pilih --</option>
                  {fd.options?.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input
                  type={fd.type === 'number' ? 'number' : fd.type === 'time' ? 'time' : 'text'}
                  value={form[fd.key] || ''}
                  onChange={e => setForm(prev => ({ ...prev, [fd.key]: e.target.value }))}
                  placeholder={fd.placeholder}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
              )}
            </div>
          ))}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={() => setShowModal(false)}>Batal</Button>
            <Button onClick={handleSubmit}>{editingItem ? 'Simpan' : 'Tambah'}</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} title="Konfirmasi Hapus" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Apakah Anda yakin ingin menghapus data ini?</p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>Batal</Button>
            <Button variant="danger" onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}>Hapus</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// --- Simple Name-only view (for jenis_daftar, jenis_peserta, etc.) ---
function SimpleNameView({ storageKey, title }: { storageKey: string; title: string }) {
  return (
    <GenericCrudView
      storageKey={storageKey}
      title={title}
      columns={[
        { key: 'kode', label: 'Kode' },
        { key: 'nama', label: 'Nama' },
      ]}
      fields={[
        { key: 'nama', label: 'Nama', required: true },
      ]}
      buildItem={(form) => ({
        kode: Date.now().toString(36).toUpperCase(),
        nama: form.nama?.trim().toUpperCase() || '',
        isActive: true,
      })}
      parseItem={(item) => ({ nama: item.nama })}
    />
  );
}

// ==================== Exported Sub-Menu Views ====================

export function AdmUnitView() {
  return (
    <GenericCrudView
      storageKey="adm_unit"
      title="Unit / Ruangan"
      columns={[
        { key: 'kode', label: 'Kode Ruangan' },
        { key: 'nama', label: 'Nama Ruangan' },
        { key: 'kodeAntrian', label: 'Kode Antrian', render: i => i.extra?.kodeAntrian || '-' },
        { key: 'kapasitas', label: 'Kapasitas', render: i => i.extra?.kapasitas || '0' },
        { key: 'tipe', label: 'Tipe', render: i => i.extra?.tipe || '-' },
      ]}
      fields={[
        { key: 'kode', label: 'Kode Ruangan', required: true },
        { key: 'nama', label: 'Nama Ruangan', required: true },
        { key: 'kodeAntrian', label: 'Kode Antrian' },
        { key: 'kapasitas', label: 'Kapasitas', type: 'number' },
        { key: 'tipe', label: 'Tipe', type: 'select', options: ['rawat_jalan', 'rawat_inap', 'igd', 'penunjang'] },
      ]}
      buildItem={(form) => ({
        kode: form.kode?.trim() || '',
        nama: form.nama?.trim() || '',
        isActive: true,
        extra: { kodeAntrian: form.kodeAntrian, kapasitas: form.kapasitas, tipe: form.tipe },
      })}
      parseItem={(item) => ({
        kode: item.kode,
        nama: item.nama,
        kodeAntrian: item.extra?.kodeAntrian || '',
        kapasitas: item.extra?.kapasitas || '0',
        tipe: item.extra?.tipe || '',
      })}
    />
  );
}

export function AdmSpesialistikView() {
  return <SimpleNameView storageKey="adm_spesialistik" title="Spesialistik" />;
}

export function AdmDokterView() {
  return (
    <GenericCrudView
      storageKey="adm_dokter"
      title="Dokter"
      columns={[
        { key: 'kode', label: 'Kode' },
        { key: 'nama', label: 'Nama' },
        { key: 'spesialistik', label: 'Spesialistik', render: i => i.extra?.spesialistik || '-' },
        { key: 'noSIP', label: 'No. SIP', render: i => i.extra?.noSIP || '-' },
      ]}
      fields={[
        { key: 'kode', label: 'Kode Dokter', required: true },
        { key: 'nama', label: 'Nama', required: true },
        { key: 'gelarDepan', label: 'Gelar Depan' },
        { key: 'gelarBelakang', label: 'Gelar Belakang' },
        { key: 'spesialistik', label: 'Spesialistik', type: 'select', options: ['Umum', 'Spesialis Penyakit Dalam', 'Spesialis Bedah', 'Spesialis Anak', 'Spesialis Kandungan', 'Spesialis Jantung', 'Spesialis Orthopedi', 'Spesialis Urologi', 'Spesialis Mata', 'Spesialis THT', 'Spesialis Kulit'] },
        { key: 'noSIP', label: 'No. SIP' },
        { key: 'noSTR', label: 'No. STR' },
        { key: 'telepon', label: 'Telepon' },
        { key: 'email', label: 'Email' },
        { key: 'statusAktif', label: 'Status Aktif', type: 'select', options: ['Aktif', 'Nonaktif'] },
      ]}
      buildItem={(form) => ({
        kode: form.kode?.trim() || '',
        nama: form.nama?.trim() || '',
        isActive: form.statusAktif !== 'Nonaktif',
        extra: {
          gelarDepan: form.gelarDepan,
          gelarBelakang: form.gelarBelakang,
          spesialistik: form.spesialistik,
          noSIP: form.noSIP,
          noSTR: form.noSTR,
          telepon: form.telepon,
          email: form.email,
        },
      })}
      parseItem={(item) => ({
        kode: item.kode,
        nama: item.nama,
        gelarDepan: item.extra?.gelarDepan || '',
        gelarBelakang: item.extra?.gelarBelakang || '',
        spesialistik: item.extra?.spesialistik || '',
        noSIP: item.extra?.noSIP || '',
        noSTR: item.extra?.noSTR || '',
        telepon: item.extra?.telepon || '',
        email: item.extra?.email || '',
        statusAktif: item.isActive ? 'Aktif' : 'Nonaktif',
      })}
    />
  );
}

export function AdmKelasRawatView() {
  return (
    <GenericCrudView
      storageKey="adm_kelas_rawat"
      title="Kelas Rawat"
      columns={[
        { key: 'kode', label: 'Kode' },
        { key: 'nama', label: 'Nama Kelas' },
        { key: 'tarif', label: 'Tarif per Hari', render: i => i.extra?.tarif || '0' },
      ]}
      fields={[
        { key: 'kode', label: 'Kode', required: true },
        { key: 'nama', label: 'Nama Kelas', required: true },
        { key: 'tarif', label: 'Tarif per Hari', type: 'number' },
      ]}
      buildItem={(form) => ({
        kode: form.kode?.trim() || '',
        nama: form.nama?.trim() || '',
        isActive: true,
        extra: { tarif: form.tarif },
      })}
      parseItem={(item) => ({ kode: item.kode, nama: item.nama, tarif: item.extra?.tarif || '0' })}
    />
  );
}

export function AdmDiagnosaView() {
  return (
    <GenericCrudView
      storageKey="adm_diagnosa"
      title="Diagnosa"
      columns={[
        { key: 'kode', label: 'Kode ICD-10' },
        { key: 'nama', label: 'Nama Diagnosa' },
        { key: 'kategori', label: 'Kategori', render: i => i.extra?.kategori || '-' },
      ]}
      fields={[
        { key: 'kode', label: 'Kode ICD-10', required: true },
        { key: 'nama', label: 'Nama Diagnosa', required: true },
        { key: 'kategori', label: 'Kategori' },
        { key: 'catatan', label: 'Catatan' },
      ]}
      buildItem={(form) => ({
        kode: form.kode?.trim() || '',
        nama: form.nama?.trim() || '',
        isActive: true,
        extra: { kategori: form.kategori, catatan: form.catatan },
      })}
      parseItem={(item) => ({ kode: item.kode, nama: item.nama, kategori: item.extra?.kategori || '', catatan: item.extra?.catatan || '' })}
    />
  );
}

export function AdmDiagnosaPrbView() {
  return (
    <GenericCrudView
      storageKey="adm_diagnosa_prb"
      title="Diagnosa PRB"
      columns={[
        { key: 'kode', label: 'Kode ICD-10' },
        { key: 'nama', label: 'Nama Diagnosa PRB' },
      ]}
      fields={[
        { key: 'kode', label: 'Kode ICD-10', required: true },
        { key: 'nama', label: 'Nama Diagnosa PRB', required: true },
      ]}
      buildItem={(form) => ({ kode: form.kode?.trim() || '', nama: form.nama?.trim() || '', isActive: true })}
      parseItem={(item) => ({ kode: item.kode, nama: item.nama })}
    />
  );
}

export function AdmProsedurView() {
  return (
    <GenericCrudView
      storageKey="adm_prosedur"
      title="Prosedur"
      columns={[
        { key: 'kode', label: 'Kode ICD-9' },
        { key: 'nama', label: 'Nama Prosedur' },
      ]}
      fields={[
        { key: 'kode', label: 'Kode ICD-9', required: true },
        { key: 'nama', label: 'Nama Prosedur', required: true },
        { key: 'catatan', label: 'Catatan' },
      ]}
      buildItem={(form) => ({
        kode: form.kode?.trim() || '',
        nama: form.nama?.trim() || '',
        isActive: true,
        extra: { catatan: form.catatan },
      })}
      parseItem={(item) => ({ kode: item.kode, nama: item.nama, catatan: item.extra?.catatan || '' })}
    />
  );
}

export function AdmCaraKeluarView() {
  return (
    <GenericCrudView
      storageKey="adm_cara_keluar"
      title="Cara Keluar"
      columns={[
        { key: 'kode', label: 'Kode' },
        { key: 'nama', label: 'Nama' },
      ]}
      fields={[
        { key: 'nama', label: 'Nama Cara Keluar', required: true },
        { key: 'catatan', label: 'Catatan' },
      ]}
      buildItem={(form) => ({
        kode: Date.now().toString(36).toUpperCase(),
        nama: form.nama?.trim() || '',
        isActive: true,
        extra: { catatan: form.catatan },
      })}
      parseItem={(item) => ({ nama: item.nama, catatan: item.extra?.catatan || '' })}
    />
  );
}

export function AdmPascaPulangView() {
  return (
    <GenericCrudView
      storageKey="adm_pasca_pulang"
      title="Pasca Pulang"
      columns={[
        { key: 'kode', label: 'Kode' },
        { key: 'nama', label: 'Nama' },
      ]}
      fields={[
        { key: 'nama', label: 'Nama Pasca Pulang', required: true },
        { key: 'catatan', label: 'Catatan' },
      ]}
      buildItem={(form) => ({
        kode: Date.now().toString(36).toUpperCase(),
        nama: form.nama?.trim() || '',
        isActive: true,
        extra: { catatan: form.catatan },
      })}
      parseItem={(item) => ({ nama: item.nama, catatan: item.extra?.catatan || '' })}
    />
  );
}

export function AdmCobView() {
  return <SimpleNameView storageKey="adm_cob" title="COB" />;
}

export function AdmFaskesView() {
  return (
    <GenericCrudView
      storageKey="adm_faskes"
      title="Faskes"
      columns={[
        { key: 'kode', label: 'Kode' },
        { key: 'nama', label: 'Nama' },
        { key: 'jenis', label: 'Jenis', render: i => i.extra?.jenis || '-' },
      ]}
      fields={[
        { key: 'jenis', label: 'Jenis Faskes', type: 'select', options: ['Puskesmas', 'Klinik', 'Rumah Sakit', 'Apotek', 'Laboratorium'], required: true },
        { key: 'kode', label: 'Kode Faskes', required: true },
        { key: 'nama', label: 'Nama Faskes', required: true },
      ]}
      buildItem={(form) => ({
        kode: form.kode?.trim() || '',
        nama: form.nama?.trim() || '',
        isActive: true,
        extra: { jenis: form.jenis },
      })}
      parseItem={(item) => ({ kode: item.kode, nama: item.nama, jenis: item.extra?.jenis || '' })}
    />
  );
}

export function AdmKelasAplicareView() {
  return (
    <GenericCrudView
      storageKey="adm_kelas_aplicare"
      title="Kelas Aplicare"
      columns={[
        { key: 'kode', label: 'Kode' },
        { key: 'nama', label: 'Nama Kelas' },
      ]}
      fields={[
        { key: 'kode', label: 'Kode', required: true },
        { key: 'nama', label: 'Nama Kelas', required: true },
      ]}
      buildItem={(form) => ({ kode: form.kode?.trim() || '', nama: form.nama?.trim() || '', isActive: true })}
      parseItem={(item) => ({ kode: item.kode, nama: item.nama })}
    />
  );
}

export function AdmJenisDaftarView() {
  return <SimpleNameView storageKey="adm_jenis_daftar" title="Jenis Daftar" />;
}

export function AdmJenisPesertaView() {
  return <SimpleNameView storageKey="adm_jenis_peserta" title="Jenis Peserta" />;
}

export function AdmStatusKecelakaanView() {
  return <SimpleNameView storageKey="adm_status_kecelakaan" title="Status Kecelakaan" />;
}

export function AdmTindakLanjutView() {
  return <SimpleNameView storageKey="adm_tindak_lanjut" title="Tindak Lanjut" />;
}

export function AdmDatangViaView() {
  return <SimpleNameView storageKey="adm_datang_via" title="Datang VIA" />;
}

export function AdmJadwalDokterView() {
  return (
    <GenericCrudView
      storageKey="adm_jadwal_dokter"
      title="Jadwal Dokter"
      columns={[
        { key: 'nama', label: 'Dokter' },
        { key: 'unit', label: 'Unit', render: i => i.extra?.unit || '-' },
        { key: 'hari', label: 'Hari', render: i => i.extra?.hari || '-' },
        { key: 'jamMulai', label: 'Jam Mulai', render: i => i.extra?.jamMulai || '-' },
        { key: 'jamSelesai', label: 'Jam Selesai', render: i => i.extra?.jamSelesai || '-' },
        { key: 'kuota', label: 'Kuota', render: i => i.extra?.kuota || '0' },
      ]}
      fields={[
        { key: 'nama', label: 'Dokter', type: 'select', required: true, options: ['dr. Hendra Sp.PD', 'dr. Sari Sp.OG', 'dr. Ahmad Sp.A', 'dr. Budi Sp.JP', 'dr. Wati Sp.B', 'dr. ABDURRAHMAN, Sp.OT', 'dr. MOCHAMMAD ECKY PRATAMA, Sp.U'] },
        { key: 'unit', label: 'Unit', type: 'select', required: true, options: ['Poli Penyakit Dalam', 'Poli Kandungan', 'Poli Anak', 'Poli Jantung', 'Poli Bedah', 'Poli Orthopedi', 'Poli Urologi', 'IGD'] },
        { key: 'hari', label: 'Hari', type: 'select', required: true, options: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'] },
        { key: 'jamMulai', label: 'Jam Mulai', type: 'time', required: true },
        { key: 'jamSelesai', label: 'Jam Selesai', type: 'time', required: true },
        { key: 'kuota', label: 'Kuota', type: 'number' },
      ]}
      buildItem={(form) => ({
        kode: `${form.nama}-${form.hari}`.substring(0, 20),
        nama: form.nama || '',
        isActive: true,
        extra: { unit: form.unit, hari: form.hari, jamMulai: form.jamMulai, jamSelesai: form.jamSelesai, kuota: form.kuota },
      })}
      parseItem={(item) => ({
        nama: item.nama,
        unit: item.extra?.unit || '',
        hari: item.extra?.hari || '',
        jamMulai: item.extra?.jamMulai || '',
        jamSelesai: item.extra?.jamSelesai || '',
        kuota: item.extra?.kuota || '0',
      })}
    />
  );
}
