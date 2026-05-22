import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Printer, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Alert } from '@/components/ui/Alert';
import { referensiService, type ReferensiItem } from '@/services/modules/referensiService';

// --- Common Types ---
interface AlertState {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

// --- Common Toolbar ---
function Toolbar({ onAdd, onEdit, onDelete, onPrint, onRefresh, hasSelection }: {
  onAdd: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onPrint: () => void;
  onRefresh: () => void;
  hasSelection: boolean;
}) {
  return (
    <div className="flex items-center gap-1 mb-3">
      <button onClick={onAdd} className="p-2 rounded hover:bg-blue-100 text-blue-600" title="Tambah">
        <Plus size={18} />
      </button>
      <button onClick={onEdit} className={`p-2 rounded hover:bg-yellow-100 ${hasSelection ? 'text-yellow-600' : 'text-gray-300 cursor-not-allowed'}`} title="Edit" disabled={!hasSelection}>
        <Pencil size={18} />
      </button>
      <button onClick={onDelete} className={`p-2 rounded hover:bg-red-100 ${hasSelection ? 'text-red-600' : 'text-gray-300 cursor-not-allowed'}`} title="Hapus" disabled={!hasSelection}>
        <Trash2 size={18} />
      </button>
      <button onClick={onPrint} className="p-2 rounded hover:bg-gray-100 text-gray-600" title="Print">
        <Printer size={18} />
      </button>
      <button onClick={onRefresh} className="p-2 rounded hover:bg-green-100 text-green-600" title="Refresh">
        <RefreshCw size={18} />
      </button>
    </div>
  );
}

// --- Tab Component ---
function TabPanel({ tabs, activeTab, onTabChange, children }: {
  tabs: string[];
  activeTab: number;
  onTabChange: (i: number) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border rounded mt-4">
      <div className="flex border-b bg-gray-50">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            onClick={() => onTabChange(i)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === i
                ? 'border-blue-500 text-blue-600 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

// ===========================
// TARIF VIEW
// ===========================
const TARIF_TABS = ['Informasi Satuan', 'Informasi Item Jasa', 'Informasi Spesifikasi', 'Informasi Akun', 'Informasi Lampiran'];

interface TarifFormData {
  kodeItem: string;
  kelompokTarif: string;
  namaTarif: string;
  kode: string;
  active: boolean;
  // Satuan tab
  satuanBarang: string;
  hargaJual: string;
  // Item Jasa tab
  itemJasa: string;
  bag1Pct: string;
  bag2Pct: string;
  // Spesifikasi tab
  group1: string;
  group2: string;
  group3: string;
  group4: string;
  group5: string;
  group6: string;
  // Akun tab
  akunHpp: string;
  akunBarang: string;
  akunPenjualan: string;
}

const INITIAL_TARIF_FORM: TarifFormData = {
  kodeItem: '',
  kelompokTarif: '',
  namaTarif: '',
  kode: '',
  active: true,
  satuanBarang: 'NON KELAS',
  hargaJual: '0.00',
  itemJasa: '',
  bag1Pct: '0',
  bag2Pct: '0',
  group1: 'NON TINDAKAN',
  group2: 'ADMINISTRASI RAWAT INAP',
  group3: '',
  group4: '',
  group5: '',
  group6: '',
  akunHpp: 'GROSS SALES',
  akunBarang: 'PERSEDIAAN BARANG DAGANG GLOBAL',
  akunPenjualan: 'SALES INCOME',
};

export function TarifView() {
  const [data, setData] = useState<ReferensiItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ReferensiItem | null>(null);
  const [form, setForm] = useState<TarifFormData>(INITIAL_TARIF_FORM);
  const [activeTab, setActiveTab] = useState(0);
  const [alert, setAlert] = useState<AlertState | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const loadData = useCallback(() => {
    setData(referensiService.getAll('tarif'));
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => {
    if (alert) { const t = setTimeout(() => setAlert(null), 4000); return () => clearTimeout(t); }
  }, [alert]);

  function openAdd() {
    setEditingItem(null);
    const nextKode = `TRF${String(data.length + 1).padStart(3, '0')}`;
    setForm({ ...INITIAL_TARIF_FORM, kodeItem: nextKode });
    setActiveTab(0);
    setShowModal(true);
  }

  function openEdit() {
    const item = data.find(d => d.id === selectedId);
    if (!item) return;
    setEditingItem(item);
    setForm({
      kodeItem: item.kode,
      kelompokTarif: item.extra?.kelompokTarif || '',
      namaTarif: item.nama,
      kode: item.extra?.kodeCustom || '',
      active: item.isActive,
      satuanBarang: item.extra?.satuanBarang || 'NON KELAS',
      hargaJual: String(item.extra?.hargaJual || '0.00'),
      itemJasa: item.extra?.itemJasa || '',
      bag1Pct: String(item.extra?.bag1Pct || '0'),
      bag2Pct: String(item.extra?.bag2Pct || '0'),
      group1: item.extra?.group1 || 'NON TINDAKAN',
      group2: item.extra?.group2 || 'ADMINISTRASI RAWAT INAP',
      group3: item.extra?.group3 || '',
      group4: item.extra?.group4 || '',
      group5: item.extra?.group5 || '',
      group6: item.extra?.group6 || '',
      akunHpp: item.extra?.akunHpp || 'GROSS SALES',
      akunBarang: item.extra?.akunBarang || 'PERSEDIAAN BARANG DAGANG GLOBAL',
      akunPenjualan: item.extra?.akunPenjualan || 'SALES INCOME',
    });
    setActiveTab(0);
    setShowModal(true);
  }

  function handleSave(addAnother: boolean) {
    if (!form.namaTarif.trim()) {
      setAlert({ type: 'error', message: 'Nama Tarif wajib diisi' });
      return;
    }
    const extra = {
      kategori: form.kelompokTarif || 'layanan',
      jumlah: parseFloat(form.hargaJual) || 0,
      kelompokTarif: form.kelompokTarif,
      kodeCustom: form.kode,
      satuanBarang: form.satuanBarang,
      hargaJual: parseFloat(form.hargaJual) || 0,
      itemJasa: form.itemJasa,
      bag1Pct: parseFloat(form.bag1Pct) || 0,
      bag2Pct: parseFloat(form.bag2Pct) || 0,
      group1: form.group1,
      group2: form.group2,
      group3: form.group3,
      group4: form.group4,
      group5: form.group5,
      group6: form.group6,
      akunHpp: form.akunHpp,
      akunBarang: form.akunBarang,
      akunPenjualan: form.akunPenjualan,
    };

    if (editingItem) {
      referensiService.update('tarif', editingItem.id, {
        kode: form.kodeItem,
        nama: form.namaTarif,
        isActive: form.active,
        extra,
      });
      setAlert({ type: 'success', message: 'Tarif berhasil diperbarui' });
    } else {
      referensiService.create('tarif', {
        kode: form.kodeItem,
        nama: form.namaTarif,
        isActive: form.active,
        extra,
      });
      setAlert({ type: 'success', message: 'Tarif berhasil ditambahkan' });
    }

    loadData();
    if (addAnother) {
      const nextKode = `TRF${String(data.length + 2).padStart(3, '0')}`;
      setForm({ ...INITIAL_TARIF_FORM, kodeItem: nextKode });
      setEditingItem(null);
    } else {
      setShowModal(false);
    }
  }

  function handleDelete() {
    if (!selectedId) return;
    referensiService.remove('tarif', selectedId);
    setAlert({ type: 'success', message: 'Tarif berhasil dihapus' });
    setSelectedId(null);
    setDeleteConfirm(false);
    loadData();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Tarif</h1>
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <Toolbar
        onAdd={openAdd}
        onEdit={openEdit}
        onDelete={() => { if (selectedId) setDeleteConfirm(true); }}
        onPrint={() => window.print()}
        onRefresh={loadData}
        hasSelection={!!selectedId}
      />

      {/* Data Table */}
      <div className="border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-gray-600">Kode</th>
              <th className="px-4 py-2 text-left font-medium text-gray-600">Nama Tarif</th>
              <th className="px-4 py-2 text-left font-medium text-gray-600">Kategori</th>
              <th className="px-4 py-2 text-right font-medium text-gray-600">Harga</th>
              <th className="px-4 py-2 text-center font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map(item => (
              <tr
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                className={`cursor-pointer border-b hover:bg-blue-50 ${selectedId === item.id ? 'bg-blue-100' : ''}`}
              >
                <td className="px-4 py-2">{item.kode}</td>
                <td className="px-4 py-2">{item.nama}</td>
                <td className="px-4 py-2">{item.extra?.kategori || '-'}</td>
                <td className="px-4 py-2 text-right">{(item.extra?.jumlah || 0).toLocaleString('id-ID')}</td>
                <td className="px-4 py-2 text-center">
                  <span className={`px-2 py-0.5 rounded text-xs ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {item.isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Tidak ada data</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirm Modal */}
      <Modal isOpen={deleteConfirm} onClose={() => setDeleteConfirm(false)} title="Konfirmasi Hapus" size="sm">
        <p className="mb-4">Apakah Anda yakin ingin menghapus tarif ini?</p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteConfirm(false)}>Batal</Button>
          <Button variant="danger" onClick={handleDelete}>Hapus</Button>
        </div>
      </Modal>

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingItem ? 'Edit Tarif' : 'Tambah Tarif'} size="full">
        <div className="space-y-4">
          {/* Top Section */}
          <div className="grid grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kode Item</label>
              <input type="text" readOnly value={form.kodeItem} className="w-full px-3 py-2 border rounded bg-gray-100 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kelompok Tarif</label>
              <input type="text" value={form.kelompokTarif} onChange={e => setForm(f => ({ ...f, kelompokTarif: e.target.value }))} className="w-full px-3 py-2 border rounded text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Tarif *</label>
              <input type="text" value={form.namaTarif} onChange={e => setForm(f => ({ ...f, namaTarif: e.target.value }))} className="w-full px-3 py-2 border rounded text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kode</label>
              <input type="text" value={form.kode} onChange={e => setForm(f => ({ ...f, kode: e.target.value }))} className="w-full px-3 py-2 border rounded text-sm" />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} className="rounded" />
                Active?
              </label>
            </div>
          </div>

          {/* Tabs */}
          <TabPanel tabs={TARIF_TABS} activeTab={activeTab} onTabChange={setActiveTab}>
            {activeTab === 0 && (
              <div>
                <table className="w-full text-sm border">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left border">Satuan Barang</th>
                      <th className="px-3 py-2 text-left border">Harga Jual</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-3 py-1 border">
                        <select value={form.satuanBarang} onChange={e => setForm(f => ({ ...f, satuanBarang: e.target.value }))} className="w-full px-2 py-1 border rounded text-sm">
                          <option>NON KELAS</option>
                          <option>KELAS 1</option>
                          <option>KELAS 2</option>
                          <option>KELAS 3</option>
                          <option>VIP</option>
                        </select>
                      </td>
                      <td className="px-3 py-1 border">
                        <input type="text" value={form.hargaJual} onChange={e => setForm(f => ({ ...f, hargaJual: e.target.value }))} className="w-full px-2 py-1 border rounded text-sm text-right" />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
            {activeTab === 1 && (
              <div>
                <table className="w-full text-sm border">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left border">Item</th>
                      <th className="px-3 py-2 text-left border">Bag 1 (%)</th>
                      <th className="px-3 py-2 text-left border">Bag 2 (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-3 py-1 border">
                        <input type="text" value={form.itemJasa} onChange={e => setForm(f => ({ ...f, itemJasa: e.target.value }))} className="w-full px-2 py-1 border rounded text-sm" />
                      </td>
                      <td className="px-3 py-1 border">
                        <input type="text" value={form.bag1Pct} onChange={e => setForm(f => ({ ...f, bag1Pct: e.target.value }))} className="w-full px-2 py-1 border rounded text-sm text-right" />
                      </td>
                      <td className="px-3 py-1 border">
                        <input type="text" value={form.bag2Pct} onChange={e => setForm(f => ({ ...f, bag2Pct: e.target.value }))} className="w-full px-2 py-1 border rounded text-sm text-right" />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
            {activeTab === 2 && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Group #1 *</label>
                  <select value={form.group1} onChange={e => setForm(f => ({ ...f, group1: e.target.value }))} className="w-full px-3 py-2 border rounded text-sm">
                    <option>NON TINDAKAN</option>
                    <option>TINDAKAN MEDIS</option>
                    <option>TINDAKAN KEPERAWATAN</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Group #2 *</label>
                  <select value={form.group2} onChange={e => setForm(f => ({ ...f, group2: e.target.value }))} className="w-full px-3 py-2 border rounded text-sm">
                    <option>ADMINISTRASI RAWAT INAP</option>
                    <option>ADMINISTRASI RAWAT JALAN</option>
                    <option>TINDAKAN OPERASI</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Group #3</label>
                  <input type="text" value={form.group3} onChange={e => setForm(f => ({ ...f, group3: e.target.value }))} className="w-full px-3 py-2 border rounded text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Group #4</label>
                  <input type="text" value={form.group4} onChange={e => setForm(f => ({ ...f, group4: e.target.value }))} className="w-full px-3 py-2 border rounded text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Group #5</label>
                  <input type="text" value={form.group5} onChange={e => setForm(f => ({ ...f, group5: e.target.value }))} className="w-full px-3 py-2 border rounded text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Group #6</label>
                  <input type="text" value={form.group6} onChange={e => setForm(f => ({ ...f, group6: e.target.value }))} className="w-full px-3 py-2 border rounded text-sm" />
                </div>
              </div>
            )}
            {activeTab === 3 && (
              <div className="grid grid-cols-1 gap-4 max-w-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Akun HPP *</label>
                  <select value={form.akunHpp} onChange={e => setForm(f => ({ ...f, akunHpp: e.target.value }))} className="w-full px-3 py-2 border rounded text-sm">
                    <option>GROSS SALES</option>
                    <option>NET SALES</option>
                    <option>COST OF GOODS SOLD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Akun Barang *</label>
                  <select value={form.akunBarang} onChange={e => setForm(f => ({ ...f, akunBarang: e.target.value }))} className="w-full px-3 py-2 border rounded text-sm">
                    <option>PERSEDIAAN BARANG DAGANG GLOBAL</option>
                    <option>PERSEDIAAN BARANG FARMASI</option>
                    <option>PERSEDIAAN ALKES</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Akun Penjualan *</label>
                  <select value={form.akunPenjualan} onChange={e => setForm(f => ({ ...f, akunPenjualan: e.target.value }))} className="w-full px-3 py-2 border rounded text-sm">
                    <option>SALES INCOME</option>
                    <option>SERVICE INCOME</option>
                    <option>OTHER INCOME</option>
                  </select>
                </div>
              </div>
            )}
            {activeTab === 4 && (
              <div>
                <table className="w-full text-sm border">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left border">Pemutusan</th>
                      <th className="px-3 py-2 text-left border">Asal</th>
                      <th className="px-3 py-2 text-left border">Nas Rujukan</th>
                      <th className="px-3 py-2 text-left border">Nilai 1</th>
                      <th className="px-3 py-2 text-left border">Nilai 2</th>
                      <th className="px-3 py-2 text-left border">Satuan</th>
                      <th className="px-3 py-2 text-left border">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={7} className="px-3 py-4 text-center text-gray-400 border">Tidak ada data lampiran</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </TabPanel>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="primary" onClick={() => handleSave(true)}>F2 - Simpan &amp; Tambah</Button>
            <Button variant="primary" onClick={() => handleSave(false)}>F3 - Simpan &amp; Keluar</Button>
            <Button variant="secondary" onClick={() => setShowModal(false)}>F12 - Keluar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ===========================
// OBAT VIEW
// ===========================
const OBAT_TABS = ['Informasi Satuan', 'Informasi Item Jasa', 'Informasi Spesifikasi', 'Informasi Akun', 'Informasi Lampiran'];

interface ObatFormData {
  kodeItem: string;
  active: boolean;
  generic: string;
  dagang: string;
  satuan: string;
  // Satuan tab
  satuanBarang: string;
  hargaBeli: string;
  keuntungan: string;
  keuntunganBpjs: string;
  // Item Jasa tab
  itemJasa: string;
  bag1Pct: string;
  bag2Pct: string;
  // Spesifikasi tab
  group1: string;
  group2: string;
  group3: string;
  group4: string;
  group5: string;
  group6: string;
  // Akun tab
  akunHpp: string;
  akunBarang: string;
  akunPenjualan: string;
}

const INITIAL_OBAT_FORM: ObatFormData = {
  kodeItem: '',
  active: true,
  generic: '',
  dagang: '',
  satuan: '',
  satuanBarang: 'PCS',
  hargaBeli: '0.00',
  keuntungan: '0.00',
  keuntunganBpjs: '0.00',
  itemJasa: '',
  bag1Pct: '0',
  bag2Pct: '0',
  group1: 'NON TINDAKAN',
  group2: 'ADMINISTRASI RAWAT INAP',
  group3: '',
  group4: '',
  group5: '',
  group6: '',
  akunHpp: 'GROSS SALES',
  akunBarang: 'PERSEDIAAN BARANG DAGANG GLOBAL',
  akunPenjualan: 'SALES INCOME',
};

export function ObatView() {
  const [data, setData] = useState<ReferensiItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ReferensiItem | null>(null);
  const [form, setForm] = useState<ObatFormData>(INITIAL_OBAT_FORM);
  const [activeTab, setActiveTab] = useState(0);
  const [alert, setAlert] = useState<AlertState | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const loadData = useCallback(() => {
    setData(referensiService.getAll('obat'));
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => {
    if (alert) { const t = setTimeout(() => setAlert(null), 4000); return () => clearTimeout(t); }
  }, [alert]);

  function openAdd() {
    setEditingItem(null);
    const nextKode = `OBT${String(data.length + 1).padStart(3, '0')}`;
    setForm({ ...INITIAL_OBAT_FORM, kodeItem: nextKode });
    setActiveTab(0);
    setShowModal(true);
  }

  function openEdit() {
    const item = data.find(d => d.id === selectedId);
    if (!item) return;
    setEditingItem(item);
    setForm({
      kodeItem: item.kode,
      active: item.isActive,
      generic: item.extra?.generic || '',
      dagang: item.nama,
      satuan: item.extra?.satuan || '',
      satuanBarang: item.extra?.satuanBarang || 'PCS',
      hargaBeli: String(item.extra?.hargaBeli || item.extra?.harga || '0.00'),
      keuntungan: String(item.extra?.keuntungan || '0.00'),
      keuntunganBpjs: String(item.extra?.keuntunganBpjs || '0.00'),
      itemJasa: item.extra?.itemJasa || '',
      bag1Pct: String(item.extra?.bag1Pct || '0'),
      bag2Pct: String(item.extra?.bag2Pct || '0'),
      group1: item.extra?.group1 || 'NON TINDAKAN',
      group2: item.extra?.group2 || 'ADMINISTRASI RAWAT INAP',
      group3: item.extra?.group3 || '',
      group4: item.extra?.group4 || '',
      group5: item.extra?.group5 || '',
      group6: item.extra?.group6 || '',
      akunHpp: item.extra?.akunHpp || 'GROSS SALES',
      akunBarang: item.extra?.akunBarang || 'PERSEDIAAN BARANG DAGANG GLOBAL',
      akunPenjualan: item.extra?.akunPenjualan || 'SALES INCOME',
    });
    setActiveTab(0);
    setShowModal(true);
  }

  function handleSave(addAnother: boolean) {
    if (!form.dagang.trim()) {
      setAlert({ type: 'error', message: 'Nama Dagang wajib diisi' });
      return;
    }
    const extra = {
      generic: form.generic,
      satuan: form.satuan,
      harga: parseFloat(form.hargaBeli) || 0,
      stok: editingItem?.extra?.stok || 0,
      satuanBarang: form.satuanBarang,
      hargaBeli: parseFloat(form.hargaBeli) || 0,
      keuntungan: parseFloat(form.keuntungan) || 0,
      keuntunganBpjs: parseFloat(form.keuntunganBpjs) || 0,
      itemJasa: form.itemJasa,
      bag1Pct: parseFloat(form.bag1Pct) || 0,
      bag2Pct: parseFloat(form.bag2Pct) || 0,
      group1: form.group1,
      group2: form.group2,
      group3: form.group3,
      group4: form.group4,
      group5: form.group5,
      group6: form.group6,
      akunHpp: form.akunHpp,
      akunBarang: form.akunBarang,
      akunPenjualan: form.akunPenjualan,
    };

    if (editingItem) {
      referensiService.update('obat', editingItem.id, {
        kode: form.kodeItem,
        nama: form.dagang,
        isActive: form.active,
        extra,
      });
      setAlert({ type: 'success', message: 'Obat berhasil diperbarui' });
    } else {
      referensiService.create('obat', {
        kode: form.kodeItem,
        nama: form.dagang,
        isActive: form.active,
        extra,
      });
      setAlert({ type: 'success', message: 'Obat berhasil ditambahkan' });
    }

    loadData();
    if (addAnother) {
      const nextKode = `OBT${String(data.length + 2).padStart(3, '0')}`;
      setForm({ ...INITIAL_OBAT_FORM, kodeItem: nextKode });
      setEditingItem(null);
    } else {
      setShowModal(false);
    }
  }

  function handleDelete() {
    if (!selectedId) return;
    referensiService.remove('obat', selectedId);
    setAlert({ type: 'success', message: 'Obat berhasil dihapus' });
    setSelectedId(null);
    setDeleteConfirm(false);
    loadData();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Obat</h1>
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <Toolbar
        onAdd={openAdd}
        onEdit={openEdit}
        onDelete={() => { if (selectedId) setDeleteConfirm(true); }}
        onPrint={() => window.print()}
        onRefresh={loadData}
        hasSelection={!!selectedId}
      />

      {/* Data Table */}
      <div className="border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-gray-600">Dagang</th>
              <th className="px-4 py-2 text-left font-medium text-gray-600">Tindakan</th>
              <th className="px-4 py-2 text-left font-medium text-gray-600">Group Tarif</th>
              <th className="px-4 py-2 text-left font-medium text-gray-600">Kelompok CBG</th>
              <th className="px-4 py-2 text-left font-medium text-gray-600">ITEM_5</th>
              <th className="px-4 py-2 text-center font-medium text-gray-600">Aktif?</th>
            </tr>
          </thead>
          <tbody>
            {data.map(item => (
              <tr
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                className={`cursor-pointer border-b hover:bg-blue-50 ${selectedId === item.id ? 'bg-blue-100' : ''}`}
              >
                <td className="px-4 py-2">{item.nama}</td>
                <td className="px-4 py-2">{item.extra?.generic || '-'}</td>
                <td className="px-4 py-2">{item.extra?.group1 || '-'}</td>
                <td className="px-4 py-2">{item.extra?.group2 || '-'}</td>
                <td className="px-4 py-2">{item.extra?.satuan || '-'}</td>
                <td className="px-4 py-2 text-center">
                  <span className={`px-2 py-0.5 rounded text-xs ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {item.isActive ? 'Ya' : 'Tidak'}
                  </span>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Tidak ada data</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirm Modal */}
      <Modal isOpen={deleteConfirm} onClose={() => setDeleteConfirm(false)} title="Konfirmasi Hapus" size="sm">
        <p className="mb-4">Apakah Anda yakin ingin menghapus obat ini?</p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteConfirm(false)}>Batal</Button>
          <Button variant="danger" onClick={handleDelete}>Hapus</Button>
        </div>
      </Modal>

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingItem ? 'Edit Obat' : 'Tambah Obat'} size="full">
        <div className="space-y-4">
          {/* Top Section */}
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kode Item</label>
              <input type="text" readOnly value={form.kodeItem} className="w-full px-3 py-2 border rounded bg-gray-100 text-sm" />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} className="rounded" />
                Active?
              </label>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Generic *</label>
              <input type="text" value={form.generic} onChange={e => setForm(f => ({ ...f, generic: e.target.value }))} className="w-full px-3 py-2 border rounded text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dagang *</label>
              <input type="text" value={form.dagang} onChange={e => setForm(f => ({ ...f, dagang: e.target.value }))} className="w-full px-3 py-2 border rounded text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Satuan</label>
              <input type="text" value={form.satuan} onChange={e => setForm(f => ({ ...f, satuan: e.target.value }))} className="w-full px-3 py-2 border rounded text-sm" />
            </div>
          </div>

          {/* Tabs */}
          <TabPanel tabs={OBAT_TABS} activeTab={activeTab} onTabChange={setActiveTab}>
            {activeTab === 0 && (
              <div>
                <table className="w-full text-sm border">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left border">Satuan Barang</th>
                      <th className="px-3 py-2 text-left border">Harga Beli</th>
                      <th className="px-3 py-2 text-left border">Keuntungan</th>
                      <th className="px-3 py-2 text-left border">Keuntungan BPJS (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-3 py-1 border">
                        <select value={form.satuanBarang} onChange={e => setForm(f => ({ ...f, satuanBarang: e.target.value }))} className="w-full px-2 py-1 border rounded text-sm">
                          <option>PCS</option>
                          <option>TABLET</option>
                          <option>KAPSUL</option>
                          <option>BOTOL</option>
                          <option>AMPUL</option>
                          <option>TUBE</option>
                        </select>
                      </td>
                      <td className="px-3 py-1 border">
                        <input type="text" value={form.hargaBeli} onChange={e => setForm(f => ({ ...f, hargaBeli: e.target.value }))} className="w-full px-2 py-1 border rounded text-sm text-right" />
                      </td>
                      <td className="px-3 py-1 border">
                        <input type="text" value={form.keuntungan} onChange={e => setForm(f => ({ ...f, keuntungan: e.target.value }))} className="w-full px-2 py-1 border rounded text-sm text-right" />
                      </td>
                      <td className="px-3 py-1 border">
                        <input type="text" value={form.keuntunganBpjs} onChange={e => setForm(f => ({ ...f, keuntunganBpjs: e.target.value }))} className="w-full px-2 py-1 border rounded text-sm text-right" />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
            {activeTab === 1 && (
              <div>
                <table className="w-full text-sm border">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left border">Item</th>
                      <th className="px-3 py-2 text-left border">Bag 1 (%)</th>
                      <th className="px-3 py-2 text-left border">Bag 2 (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-3 py-1 border">
                        <input type="text" value={form.itemJasa} onChange={e => setForm(f => ({ ...f, itemJasa: e.target.value }))} className="w-full px-2 py-1 border rounded text-sm" />
                      </td>
                      <td className="px-3 py-1 border">
                        <input type="text" value={form.bag1Pct} onChange={e => setForm(f => ({ ...f, bag1Pct: e.target.value }))} className="w-full px-2 py-1 border rounded text-sm text-right" />
                      </td>
                      <td className="px-3 py-1 border">
                        <input type="text" value={form.bag2Pct} onChange={e => setForm(f => ({ ...f, bag2Pct: e.target.value }))} className="w-full px-2 py-1 border rounded text-sm text-right" />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
            {activeTab === 2 && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Group #1 *</label>
                  <select value={form.group1} onChange={e => setForm(f => ({ ...f, group1: e.target.value }))} className="w-full px-3 py-2 border rounded text-sm">
                    <option>NON TINDAKAN</option>
                    <option>TINDAKAN MEDIS</option>
                    <option>TINDAKAN KEPERAWATAN</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Group #2 *</label>
                  <select value={form.group2} onChange={e => setForm(f => ({ ...f, group2: e.target.value }))} className="w-full px-3 py-2 border rounded text-sm">
                    <option>ADMINISTRASI RAWAT INAP</option>
                    <option>ADMINISTRASI RAWAT JALAN</option>
                    <option>TINDAKAN OPERASI</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Group #3</label>
                  <input type="text" value={form.group3} onChange={e => setForm(f => ({ ...f, group3: e.target.value }))} className="w-full px-3 py-2 border rounded text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Group #4</label>
                  <input type="text" value={form.group4} onChange={e => setForm(f => ({ ...f, group4: e.target.value }))} className="w-full px-3 py-2 border rounded text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Group #5</label>
                  <input type="text" value={form.group5} onChange={e => setForm(f => ({ ...f, group5: e.target.value }))} className="w-full px-3 py-2 border rounded text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Group #6</label>
                  <input type="text" value={form.group6} onChange={e => setForm(f => ({ ...f, group6: e.target.value }))} className="w-full px-3 py-2 border rounded text-sm" />
                </div>
              </div>
            )}
            {activeTab === 3 && (
              <div className="grid grid-cols-1 gap-4 max-w-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Akun HPP *</label>
                  <select value={form.akunHpp} onChange={e => setForm(f => ({ ...f, akunHpp: e.target.value }))} className="w-full px-3 py-2 border rounded text-sm">
                    <option>GROSS SALES</option>
                    <option>NET SALES</option>
                    <option>COST OF GOODS SOLD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Akun Barang *</label>
                  <select value={form.akunBarang} onChange={e => setForm(f => ({ ...f, akunBarang: e.target.value }))} className="w-full px-3 py-2 border rounded text-sm">
                    <option>PERSEDIAAN BARANG DAGANG GLOBAL</option>
                    <option>PERSEDIAAN BARANG FARMASI</option>
                    <option>PERSEDIAAN ALKES</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Akun Penjualan *</label>
                  <select value={form.akunPenjualan} onChange={e => setForm(f => ({ ...f, akunPenjualan: e.target.value }))} className="w-full px-3 py-2 border rounded text-sm">
                    <option>SALES INCOME</option>
                    <option>SERVICE INCOME</option>
                    <option>OTHER INCOME</option>
                  </select>
                </div>
              </div>
            )}
            {activeTab === 4 && (
              <div>
                <table className="w-full text-sm border">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left border">Pemutusan</th>
                      <th className="px-3 py-2 text-left border">Asal</th>
                      <th className="px-3 py-2 text-left border">Nas Rujukan</th>
                      <th className="px-3 py-2 text-left border">Nilai 1</th>
                      <th className="px-3 py-2 text-left border">Nilai 2</th>
                      <th className="px-3 py-2 text-left border">Satuan</th>
                      <th className="px-3 py-2 text-left border">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={7} className="px-3 py-4 text-center text-gray-400 border">Tidak ada data lampiran</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </TabPanel>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="primary" onClick={() => handleSave(true)}>F2 - Simpan &amp; Tambah</Button>
            <Button variant="primary" onClick={() => handleSave(false)}>F3 - Simpan &amp; Keluar</Button>
            <Button variant="secondary" onClick={() => setShowModal(false)}>F12 - Keluar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ===========================
// TINDAKAN VIEW
// ===========================
export function TindakanView() {
  const [data, setData] = useState<ReferensiItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ReferensiItem | null>(null);
  const [namaTindakan, setNamaTindakan] = useState('');
  const [alert, setAlert] = useState<AlertState | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const loadData = useCallback(() => {
    setData(referensiService.getAll('tindakan'));
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => {
    if (alert) { const t = setTimeout(() => setAlert(null), 4000); return () => clearTimeout(t); }
  }, [alert]);

  function openAdd() {
    setEditingItem(null);
    setNamaTindakan('');
    setShowModal(true);
  }

  function openEdit() {
    const item = data.find(d => d.id === selectedId);
    if (!item) return;
    setEditingItem(item);
    setNamaTindakan(item.nama);
    setShowModal(true);
  }

  function handleSave() {
    if (!namaTindakan.trim()) {
      setAlert({ type: 'error', message: 'Nama Tindakan wajib diisi' });
      return;
    }

    if (editingItem) {
      referensiService.update('tindakan', editingItem.id, {
        nama: namaTindakan,
      });
      setAlert({ type: 'success', message: 'Tindakan berhasil diperbarui' });
    } else {
      const nextKode = `TDK${String(data.length + 1).padStart(3, '0')}`;
      referensiService.create('tindakan', {
        kode: nextKode,
        nama: namaTindakan,
        isActive: true,
      });
      setAlert({ type: 'success', message: 'Tindakan berhasil ditambahkan' });
    }

    setShowModal(false);
    loadData();
  }

  function handleDelete() {
    if (!selectedId) return;
    referensiService.remove('tindakan', selectedId);
    setAlert({ type: 'success', message: 'Tindakan berhasil dihapus' });
    setSelectedId(null);
    setDeleteConfirm(false);
    loadData();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Tindakan</h1>
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <Toolbar
        onAdd={openAdd}
        onEdit={openEdit}
        onDelete={() => { if (selectedId) setDeleteConfirm(true); }}
        onPrint={() => window.print()}
        onRefresh={loadData}
        hasSelection={!!selectedId}
      />

      {/* Data Table */}
      <div className="border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-gray-600">Kode</th>
              <th className="px-4 py-2 text-left font-medium text-gray-600">Nama Tindakan</th>
              <th className="px-4 py-2 text-center font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map(item => (
              <tr
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                className={`cursor-pointer border-b hover:bg-blue-50 ${selectedId === item.id ? 'bg-blue-100' : ''}`}
              >
                <td className="px-4 py-2">{item.kode}</td>
                <td className="px-4 py-2">{item.nama}</td>
                <td className="px-4 py-2 text-center">
                  <span className={`px-2 py-0.5 rounded text-xs ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {item.isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-400">Tidak ada data</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirm Modal */}
      <Modal isOpen={deleteConfirm} onClose={() => setDeleteConfirm(false)} title="Konfirmasi Hapus" size="sm">
        <p className="mb-4">Apakah Anda yakin ingin menghapus tindakan ini?</p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteConfirm(false)}>Batal</Button>
          <Button variant="danger" onClick={handleDelete}>Hapus</Button>
        </div>
      </Modal>

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingItem ? 'Edit Tindakan' : 'Tambah Tindakan'} size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Tindakan</label>
            <input
              type="text"
              value={namaTindakan}
              onChange={e => setNamaTindakan(e.target.value)}
              className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Masukkan nama tindakan"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Batal</Button>
            <Button variant="primary" onClick={handleSave}>Simpan</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
