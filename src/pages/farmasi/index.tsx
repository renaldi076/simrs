import React, { useState, useEffect, useCallback } from 'react';
import farmasiService, { type PrescriptionDispense } from '@/services/modules/farmasiService';
import { formatDate, formatDateTime } from '@/utils/formatters';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { Table } from '@/components/ui/Table';
import type { Medication } from '@/types/modules';
import type { PaginatedResult } from '@/types/common';

type TabMode = 'stok' | 'dispense';
type StockViewMode = 'list' | 'form';

interface MedicationForm {
  name: string;
  stock: string;
  unit: string;
  price: string;
  expiryDate: string;
  minimumStock: string;
}

interface FormErrors {
  name?: string;
  stock?: string;
  unit?: string;
  price?: string;
  expiryDate?: string;
  minimumStock?: string;
}

const INITIAL_FORM: MedicationForm = {
  name: '',
  stock: '',
  unit: '',
  price: '',
  expiryDate: '',
  minimumStock: '10',
};

const PAGE_SIZE = 50;

function getStatusBadge(stock: number): React.ReactElement {
  const status = farmasiService.getAvailabilityStatus(stock);
  switch (status) {
    case 'tersedia':
      return <Badge variant="success">Tersedia</Badge>;
    case 'stok_rendah':
      return <Badge variant="warning">Stok Rendah</Badge>;
    case 'tidak_tersedia':
      return <Badge variant="danger">Tidak Tersedia</Badge>;
  }
}

function getDispenseStatusBadge(status: string): React.ReactElement {
  switch (status) {
    case 'dispensed':
      return <Badge variant="success">Selesai</Badge>;
    case 'partial':
      return <Badge variant="warning">Sebagian</Badge>;
    case 'pending':
      return <Badge variant="info">Menunggu</Badge>;
    default:
      return <Badge variant="neutral">{status}</Badge>;
  }
}

export default function FarmasiPage(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<TabMode>('stok');
  const [stockViewMode, setStockViewMode] = useState<StockViewMode>('list');
  const [medications, setMedications] = useState<PaginatedResult<Medication>>({
    data: [], total: 0, page: 1, pageSize: PAGE_SIZE, totalPages: 0,
  });
  const [dispenseRecords, setDispenseRecords] = useState<PaginatedResult<PrescriptionDispense>>({
    data: [], total: 0, page: 1, pageSize: PAGE_SIZE, totalPages: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [dispensePage, setDispensePage] = useState(1);
  const [formData, setFormData] = useState<MedicationForm>(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);
  const [dispenseModalOpen, setDispenseModalOpen] = useState(false);
  const [selectedDispense, setSelectedDispense] = useState<PrescriptionDispense | null>(null);
  const [lowStockWarning, setLowStockWarning] = useState<number>(0);

  const loadMedications = useCallback(() => {
    const result = farmasiService.getAll(currentPage, PAGE_SIZE, searchQuery.length >= 2 ? searchQuery : undefined);
    setMedications(result);
    const lowStock = farmasiService.getLowStockMedicines();
    setLowStockWarning(lowStock.length);
  }, [currentPage, searchQuery]);

  const loadDispenseRecords = useCallback(() => {
    const result = farmasiService.getDispenseRecords(dispensePage, PAGE_SIZE);
    setDispenseRecords(result);
  }, [dispensePage]);

  useEffect(() => {
    farmasiService.initializeSeedData();
    loadMedications();
    loadDispenseRecords();
  }, [loadMedications, loadDispenseRecords]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleNewMedication = () => {
    setFormData(INITIAL_FORM);
    setFormErrors({});
    setEditingId(null);
    setStockViewMode('form');
  };

  const handleEditMedication = (med: Medication) => {
    setFormData({
      name: med.name,
      stock: med.stock.toString(),
      unit: med.unit,
      price: med.price.toString(),
      expiryDate: med.expiryDate,
      minimumStock: med.minimumStock.toString(),
    });
    setFormErrors({});
    setEditingId(med.id);
    setStockViewMode('form');
  };

  const handleDeleteMedication = (med: Medication) => {
    try {
      farmasiService.remove(med.id);
      setAlertMessage({ type: 'success', message: `Obat "${med.name}" berhasil dihapus.` });
      loadMedications();
    } catch {
      setAlertMessage({ type: 'error', message: 'Gagal menghapus obat.' });
    }
  };

  const handleCancel = () => {
    setStockViewMode('list');
    setFormErrors({});
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    if (!formData.name.trim()) errors.name = 'Nama obat wajib diisi';
    if (!formData.stock || Number(formData.stock) < 0) errors.stock = 'Stok harus >= 0';
    if (!formData.unit.trim()) errors.unit = 'Satuan wajib diisi';
    if (!formData.price || Number(formData.price) < 0) errors.price = 'Harga harus >= 0';
    if (!formData.expiryDate) errors.expiryDate = 'Tanggal kadaluarsa wajib diisi';
    if (!formData.minimumStock || Number(formData.minimumStock) < 0) errors.minimumStock = 'Stok minimum harus >= 0';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const medData = {
        name: formData.name.trim(),
        stock: Number(formData.stock),
        unit: formData.unit.trim(),
        price: Number(formData.price),
        expiryDate: formData.expiryDate,
        minimumStock: Number(formData.minimumStock),
      };

      if (editingId) {
        farmasiService.update(editingId, medData);
        setAlertMessage({ type: 'success', message: 'Data obat berhasil diperbarui.' });
      } else {
        farmasiService.create(medData);
        setAlertMessage({ type: 'success', message: `Obat "${medData.name}" berhasil ditambahkan.` });
      }

      loadMedications();
      setStockViewMode('list');
      setFormData(INITIAL_FORM);
      setEditingId(null);
    } catch {
      setAlertMessage({ type: 'error', message: 'Terjadi kesalahan saat menyimpan data obat.' });
    }
  };

  const handleOpenDispenseModal = (record: PrescriptionDispense) => {
    setSelectedDispense(record);
    setDispenseModalOpen(true);
  };

  const handleDispensePrescription = () => {
    if (!selectedDispense) return;

    try {
      farmasiService.dispensePrescription(selectedDispense.id, 'Apt. Farmasi');
      setAlertMessage({ type: 'success', message: `Resep untuk ${selectedDispense.patientName} berhasil diserahkan.` });
      setDispenseModalOpen(false);
      setSelectedDispense(null);
      loadDispenseRecords();
      loadMedications();
    } catch (err) {
      setAlertMessage({ type: 'error', message: err instanceof Error ? err.message : 'Gagal menyerahkan obat.' });
    }
  };

  const stockColumns = [
    { key: 'name', label: 'Nama Obat' },
    {
      key: 'stock',
      label: 'Jumlah/Stok',
      render: (row: Record<string, unknown>) => {
        const stock = row.stock as number;
        const minimumStock = row.minimumStock as number;
        return (
          <span className={stock <= minimumStock ? 'font-semibold text-amber-600' : ''}>
            {stock}
          </span>
        );
      },
    },
    { key: 'unit', label: 'Satuan' },
    {
      key: 'expiryDate',
      label: 'Tanggal Kadaluarsa',
      render: (row: Record<string, unknown>) => formatDate(row.expiryDate as string),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row: Record<string, unknown>) => getStatusBadge(row.stock as number),
    },
    {
      key: 'actions',
      label: 'Aksi',
      render: (row: Record<string, unknown>) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => { e.stopPropagation(); handleEditMedication(row as unknown as Medication); }}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={(e) => { e.stopPropagation(); handleDeleteMedication(row as unknown as Medication); }}
          >
            Hapus
          </Button>
        </div>
      ),
    },
  ];

  const dispenseColumns = [
    { key: 'patientName', label: 'Nama Pasien' },
    { key: 'prescriptionId', label: 'No. Resep' },
    {
      key: 'items',
      label: 'Jumlah Item',
      render: (row: Record<string, unknown>) => {
        const items = row.items as PrescriptionDispense['items'];
        return `${items.length} obat`;
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (row: Record<string, unknown>) => getDispenseStatusBadge(row.status as string),
    },
    {
      key: 'dispensedAt',
      label: 'Waktu Penyerahan',
      render: (row: Record<string, unknown>) => {
        const dispensedAt = row.dispensedAt as string;
        return dispensedAt ? formatDateTime(dispensedAt) : '-';
      },
    },
    {
      key: 'actions',
      label: 'Aksi',
      render: (row: Record<string, unknown>) => {
        const record = row as unknown as PrescriptionDispense;
        return (
          <Button
            variant={record.status === 'pending' ? 'primary' : 'outline'}
            size="sm"
            onClick={(e) => { e.stopPropagation(); handleOpenDispenseModal(record); }}
          >
            {record.status === 'pending' ? 'Serahkan' : 'Detail'}
          </Button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Instalasi Farmasi</h1>
      </div>

      {alertMessage && (
        <Alert
          type={alertMessage.type}
          message={alertMessage.message}
          onClose={() => setAlertMessage(null)}
        />
      )}

      {lowStockWarning > 0 && activeTab === 'stok' && stockViewMode === 'list' && (
        <Alert
          type="warning"
          message={`${lowStockWarning} obat memiliki stok rendah (≤10 unit). Segera lakukan pengadaan.`}
        />
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('stok')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'stok'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Stok Obat
          </button>
          <button
            onClick={() => setActiveTab('dispense')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'dispense'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Penyerahan Obat
          </button>
        </nav>
      </div>

      {/* Stok Obat Tab */}
      {activeTab === 'stok' && stockViewMode === 'list' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 max-w-md">
              <Input
                name="search"
                type="text"
                placeholder="Cari nama obat (min. 2 karakter)..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            <Button onClick={handleNewMedication}>Tambah Obat</Button>
          </div>

          <Table
            columns={stockColumns}
            data={medications.data as unknown as Record<string, unknown>[]}
            emptyMessage="Tidak ada data obat"
          />

          {medications.totalPages > 1 && (
            <Pagination
              currentPage={medications.page}
              totalPages={medications.totalPages}
              onPageChange={setCurrentPage}
              pageSize={PAGE_SIZE}
              totalItems={medications.total}
            />
          )}
        </div>
      )}

      {/* Form Tambah/Edit Obat */}
      {activeTab === 'stok' && stockViewMode === 'form' && (
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-700">
              {editingId ? 'Edit Data Obat' : 'Tambah Obat Baru'}
            </h2>

            <Input
              label="Nama Obat"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleFormChange}
              error={formErrors.name}
              required
              placeholder="Contoh: Paracetamol 500mg"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Stok"
                name="stock"
                type="number"
                value={formData.stock}
                onChange={handleFormChange}
                error={formErrors.stock}
                required
                placeholder="0"
              />
              <Input
                label="Satuan"
                name="unit"
                type="text"
                value={formData.unit}
                onChange={handleFormChange}
                error={formErrors.unit}
                required
                placeholder="Tablet, Kapsul, Pcs"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Harga (Rp)"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleFormChange}
                error={formErrors.price}
                required
                placeholder="0"
              />
              <Input
                label="Stok Minimum"
                name="minimumStock"
                type="number"
                value={formData.minimumStock}
                onChange={handleFormChange}
                error={formErrors.minimumStock}
                required
                placeholder="10"
              />
            </div>

            <Input
              label="Tanggal Kadaluarsa"
              name="expiryDate"
              type="date"
              value={formData.expiryDate}
              onChange={handleFormChange}
              error={formErrors.expiryDate}
              required
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit">
              {editingId ? 'Simpan Perubahan' : 'Tambah Obat'}
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              Batal
            </Button>
          </div>
        </form>
      )}

      {/* Penyerahan Obat Tab */}
      {activeTab === 'dispense' && (
        <div className="space-y-4">
          <Table
            columns={dispenseColumns}
            data={dispenseRecords.data as unknown as Record<string, unknown>[]}
            emptyMessage="Tidak ada data penyerahan obat"
          />

          {dispenseRecords.totalPages > 1 && (
            <Pagination
              currentPage={dispenseRecords.page}
              totalPages={dispenseRecords.totalPages}
              onPageChange={setDispensePage}
              pageSize={PAGE_SIZE}
              totalItems={dispenseRecords.total}
            />
          )}
        </div>
      )}

      {/* Dispense Detail Modal */}
      <Modal
        isOpen={dispenseModalOpen}
        onClose={() => { setDispenseModalOpen(false); setSelectedDispense(null); }}
        title={selectedDispense ? `Resep - ${selectedDispense.patientName}` : 'Detail Resep'}
        size="lg"
      >
        {selectedDispense && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <p className="text-gray-500">Pasien:</p>
              <p className="font-medium">{selectedDispense.patientName}</p>
              <p className="text-gray-500">No. Resep:</p>
              <p className="font-medium">{selectedDispense.prescriptionId}</p>
              <p className="text-gray-500">Status:</p>
              <div>{getDispenseStatusBadge(selectedDispense.status)}</div>
              {selectedDispense.dispensedAt && (
                <>
                  <p className="text-gray-500">Diserahkan:</p>
                  <p className="font-medium">{formatDateTime(selectedDispense.dispensedAt)}</p>
                </>
              )}
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Daftar Obat:</h3>
              <div className="space-y-2">
                {selectedDispense.items.map((item, idx) => {
                  const med = farmasiService.getById(item.medicationId);
                  const currentStock = med ? med.stock : 0;
                  const currentStatus = farmasiService.getAvailabilityStatus(currentStock);
                  const canDispense = currentStatus !== 'tidak_tersedia';

                  return (
                    <div
                      key={idx}
                      className={`flex items-center justify-between rounded-lg border p-3 ${
                        !canDispense && selectedDispense.status === 'pending'
                          ? 'border-red-200 bg-red-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <div>
                        <p className="text-sm font-medium">{item.medicationName}</p>
                        <p className="text-xs text-gray-500">
                          Diminta: {item.requestedQuantity} |
                          {selectedDispense.status !== 'pending'
                            ? ` Diserahkan: ${item.dispensedQuantity}`
                            : ` Stok: ${currentStock}`
                          }
                        </p>
                      </div>
                      <div>
                        {selectedDispense.status === 'pending' ? (
                          canDispense ? (
                            <Badge variant={currentStatus === 'stok_rendah' ? 'warning' : 'success'}>
                              {currentStatus === 'stok_rendah' ? 'Stok Rendah' : 'Tersedia'}
                            </Badge>
                          ) : (
                            <Badge variant="danger">Tidak Tersedia</Badge>
                          )
                        ) : (
                          item.dispensedQuantity > 0 ? (
                            <Badge variant="success">Diserahkan</Badge>
                          ) : (
                            <Badge variant="danger">Tidak Tersedia</Badge>
                          )
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {selectedDispense.status === 'pending' && (
              <div className="border-t pt-4 flex justify-end gap-3">
                <Button variant="outline" onClick={() => { setDispenseModalOpen(false); setSelectedDispense(null); }}>
                  Batal
                </Button>
                <Button onClick={handleDispensePrescription}>
                  Serahkan Obat
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}


