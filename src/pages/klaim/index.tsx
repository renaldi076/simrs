import React, { useState, useEffect, useCallback } from 'react';
import { klaimService } from '@/services/modules/klaimService';
import type { ClaimStatusHistory } from '@/services/modules/klaimService';
import type { Claim } from '@/types/modules';
import { formatDate, formatDateTime } from '@/utils/formatters';
import { useAuth } from '@/hooks/useAuth';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { Table } from '@/components/ui/Table';
import type { PaginatedResult } from '@/types/common';

type ViewMode = 'list' | 'form' | 'detail';

const PAGE_SIZE = 20;

function getStatusBadge(status: Claim['status']): 'info' | 'warning' | 'success' | 'danger' {
  const map: Record<string, 'info' | 'warning' | 'success' | 'danger'> = {
    diajukan: 'info',
    diproses: 'warning',
    disetujui: 'success',
    ditolak: 'danger',
  };
  return map[status] || 'info';
}

function getStatusLabel(status: Claim['status']): string {
  const labels: Record<string, string> = {
    diajukan: 'Diajukan',
    diproses: 'Diproses',
    disetujui: 'Disetujui',
    ditolak: 'Ditolak',
  };
  return labels[status] || status;
}

interface FormData {
  patientName: string;
  memberNumber: string;
  diagnosis: string;
  treatment: string;
  documents: { fileName: string; fileSize: number; fileType: string }[];
}

const INITIAL_FORM: FormData = {
  patientName: '',
  memberNumber: '',
  diagnosis: '',
  treatment: '',
  documents: [],
};

export function Klaim(): React.ReactElement {
  const { state } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [claims, setClaims] = useState<PaginatedResult<Claim>>({
    data: [], total: 0, page: 1, pageSize: PAGE_SIZE, totalPages: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form state
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Detail state
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [statusHistory, setStatusHistory] = useState<ClaimStatusHistory[]>([]);

  // Status update modal
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<Claim['status']>('diproses');

  const loadClaims = useCallback(() => {
    const result = klaimService.getAll(currentPage, PAGE_SIZE, {
      status: filterStatus as Claim['status'] || undefined,
      startDate: filterStartDate || undefined,
      endDate: filterEndDate || undefined,
      search: searchQuery || undefined,
    });
    setClaims(result);
  }, [currentPage, filterStatus, filterStartDate, filterEndDate, searchQuery]);

  useEffect(() => {
    loadClaims();
  }, [loadClaims]);

  const handleViewDetail = (claim: Claim) => {
    setSelectedClaim(claim);
    const history = klaimService.getStatusHistory(claim.id);
    setStatusHistory(history);
    setViewMode('detail');
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleAddDocument = () => {
    if (formData.documents.length >= 10) {
      setFormErrors(prev => ({ ...prev, documents: 'Maksimal 10 dokumen' }));
      return;
    }
    // Mock file selection
    const mockFiles = [
      'surat_rujukan.pdf', 'resume_medis.pdf', 'hasil_lab.pdf',
      'foto_rontgen.jpg', 'resep_obat.pdf', 'surat_keterangan.pdf',
    ];
    const fileName = mockFiles[formData.documents.length % mockFiles.length];
    const fileSize = Math.floor(Math.random() * 4000000) + 500000; // 0.5MB - 4.5MB

    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, { fileName, fileSize, fileType: 'application/pdf' }],
    }));
    setFormErrors(prev => ({ ...prev, documents: '' }));
  };

  const handleRemoveDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.patientName.trim()) errors.patientName = 'Nama pasien wajib diisi';
    if (!formData.memberNumber.trim()) errors.memberNumber = 'Nomor peserta wajib diisi';
    if (!formData.diagnosis.trim()) errors.diagnosis = 'Diagnosis wajib diisi';
    if (!formData.treatment.trim()) errors.treatment = 'Tindakan wajib diisi';
    if (formData.documents.length < 1) errors.documents = 'Minimal 1 dokumen diperlukan';
    if (formData.documents.length > 10) errors.documents = 'Maksimal 10 dokumen';
    for (const doc of formData.documents) {
      if (doc.fileSize > 5 * 1024 * 1024) {
        errors.documents = 'Ukuran file maksimal 5MB per file';
        break;
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      klaimService.create({
        patientId: `patient-${Date.now()}`,
        patientName: formData.patientName.trim(),
        memberNumber: formData.memberNumber.trim(),
        diagnosis: formData.diagnosis.trim(),
        treatment: formData.treatment.trim(),
        documents: formData.documents,
        submittedBy: state.user?.fullName || 'System',
      });
      setAlertMessage({ type: 'success', message: 'Klaim berhasil diajukan' });
      setFormData(INITIAL_FORM);
      setViewMode('list');
      loadClaims();
    } catch (err) {
      setAlertMessage({ type: 'error', message: err instanceof Error ? err.message : 'Gagal mengajukan klaim' });
    }
  };

  const handleUpdateStatus = () => {
    if (!selectedClaim) return;
    try {
      const updated = klaimService.updateStatus(selectedClaim.id, newStatus, state.user?.fullName || 'Admin');
      setSelectedClaim(updated);
      setStatusHistory(klaimService.getStatusHistory(updated.id));
      setShowStatusModal(false);
      setAlertMessage({ type: 'success', message: `Status berhasil diubah ke "${getStatusLabel(newStatus)}"` });
      loadClaims();
    } catch (err) {
      setAlertMessage({ type: 'error', message: err instanceof Error ? err.message : 'Gagal mengubah status' });
    }
  };

  const columns = [
    { key: 'patientName', label: 'Pasien' },
    { key: 'memberNumber', label: 'No. Peserta' },
    { key: 'diagnosis', label: 'Diagnosis' },
    {
      key: 'status',
      label: 'Status',
      render: (row: Record<string, unknown>) => (
        <Badge variant={getStatusBadge(row.status as Claim['status'])}>
          {getStatusLabel(row.status as Claim['status'])}
        </Badge>
      ),
    },
    {
      key: 'submittedAt',
      label: 'Tanggal Ajuan',
      render: (row: Record<string, unknown>) => formatDate(row.submittedAt as string),
    },
    {
      key: 'actions',
      label: 'Aksi',
      render: (row: Record<string, unknown>) => (
        <Button variant="outline" size="sm" onClick={() => handleViewDetail(row as unknown as Claim)}>
          Detail
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Klaim BPJS / Asuransi</h1>
        {viewMode === 'list' && (
          <Button onClick={() => { setFormData(INITIAL_FORM); setFormErrors({}); setViewMode('form'); }}>
            Ajukan Klaim
          </Button>
        )}
        {viewMode !== 'list' && (
          <Button variant="outline" onClick={() => setViewMode('list')}>Kembali</Button>
        )}
      </div>

      {alertMessage && (
        <Alert type={alertMessage.type} message={alertMessage.message} onClose={() => setAlertMessage(null)} />
      )}

      {viewMode === 'list' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Input name="search" type="text" placeholder="Cari pasien/no. peserta..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} />
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
            >
              <option value="">Semua Status</option>
              <option value="diajukan">Diajukan</option>
              <option value="diproses">Diproses</option>
              <option value="disetujui">Disetujui</option>
              <option value="ditolak">Ditolak</option>
            </select>
            <Input name="startDate" type="date" value={filterStartDate} onChange={(e) => { setFilterStartDate(e.target.value); setCurrentPage(1); }} placeholder="Dari tanggal" />
            <Input name="endDate" type="date" value={filterEndDate} onChange={(e) => { setFilterEndDate(e.target.value); setCurrentPage(1); }} placeholder="Sampai tanggal" />
          </div>

          <Table
            columns={columns}
            data={claims.data as unknown as Record<string, unknown>[]}
            emptyMessage="Tidak ada data klaim"
          />

          {claims.totalPages > 1 && (
            <Pagination currentPage={claims.page} totalPages={claims.totalPages} onPageChange={setCurrentPage} pageSize={PAGE_SIZE} totalItems={claims.total} />
          )}
        </div>
      )}

      {viewMode === 'form' && (
        <form onSubmit={handleSubmitClaim} className="max-w-2xl space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-700">Formulir Pengajuan Klaim</h2>

            <Input label="Nama Pasien" name="patientName" type="text" value={formData.patientName} onChange={handleFormChange} error={formErrors.patientName} required placeholder="Masukkan nama pasien" />
            <Input label="Nomor Peserta" name="memberNumber" type="text" value={formData.memberNumber} onChange={handleFormChange} error={formErrors.memberNumber} required placeholder="Contoh: BPJS001234567" />

            <div className="flex flex-col gap-1">
              <label htmlFor="diagnosis" className="text-sm font-medium text-gray-700">Diagnosis<span className="text-red-500 ml-0.5">*</span></label>
              <textarea id="diagnosis" name="diagnosis" value={formData.diagnosis} onChange={handleFormChange} rows={3} placeholder="Masukkan diagnosis" className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-0 ${formErrors.diagnosis ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'}`} />
              {formErrors.diagnosis && <p className="text-xs text-red-600">{formErrors.diagnosis}</p>}
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="treatment" className="text-sm font-medium text-gray-700">Tindakan<span className="text-red-500 ml-0.5">*</span></label>
              <textarea id="treatment" name="treatment" value={formData.treatment} onChange={handleFormChange} rows={3} placeholder="Masukkan tindakan yang dilakukan" className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-0 ${formErrors.treatment ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'}`} />
              {formErrors.treatment && <p className="text-xs text-red-600">{formErrors.treatment}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Dokumen Pendukung<span className="text-red-500 ml-0.5">*</span></label>
              <p className="text-xs text-gray-500">Minimal 1, maksimal 10 file. Ukuran maks 5MB per file.</p>

              {formData.documents.map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm">
                  <span>{doc.fileName} ({(doc.fileSize / 1024 / 1024).toFixed(2)} MB)</span>
                  <button type="button" onClick={() => handleRemoveDocument(idx)} className="text-red-500 hover:text-red-700 text-xs">Hapus</button>
                </div>
              ))}

              {formData.documents.length < 10 && (
                <Button type="button" variant="outline" size="sm" onClick={handleAddDocument}>
                  + Tambah Dokumen (Mock)
                </Button>
              )}
              {formErrors.documents && <p className="text-xs text-red-600">{formErrors.documents}</p>}
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit">Ajukan Klaim</Button>
            <Button variant="outline" onClick={() => setViewMode('list')}>Batal</Button>
          </div>
        </form>
      )}

      {viewMode === 'detail' && selectedClaim && (
        <div className="max-w-3xl space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-700">Detail Klaim</h2>
              <Badge variant={getStatusBadge(selectedClaim.status)}>{getStatusLabel(selectedClaim.status)}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-gray-500">Pasien</p><p className="font-medium">{selectedClaim.patientName}</p></div>
              <div><p className="text-gray-500">No. Peserta</p><p className="font-medium">{selectedClaim.memberNumber}</p></div>
              <div><p className="text-gray-500">Tanggal Pengajuan</p><p className="font-medium">{formatDateTime(selectedClaim.submittedAt)}</p></div>
              <div><p className="text-gray-500">Terakhir Update</p><p className="font-medium">{formatDateTime(selectedClaim.updatedAt)}</p></div>
            </div>

            <div><p className="text-sm text-gray-500">Diagnosis</p><p className="text-sm mt-1">{selectedClaim.diagnosis}</p></div>
            <div><p className="text-sm text-gray-500">Tindakan</p><p className="text-sm mt-1">{selectedClaim.treatment}</p></div>

            <div>
              <p className="text-sm text-gray-500 mb-2">Dokumen ({selectedClaim.documents.length})</p>
              <div className="space-y-1">
                {selectedClaim.documents.map((doc, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-gray-50 rounded px-3 py-2 text-sm">
                    <span>📄</span>
                    <span>{doc.fileName}</span>
                    <span className="text-gray-400">({(doc.fileSize / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                ))}
              </div>
            </div>

            {(selectedClaim.status === 'diajukan' || selectedClaim.status === 'diproses') && (
              <Button onClick={() => setShowStatusModal(true)}>Ubah Status</Button>
            )}
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
            <h3 className="text-md font-semibold text-gray-700">Riwayat Status</h3>
            <div className="space-y-3">
              {statusHistory.map((entry, idx) => (
                <div key={idx} className="flex items-start gap-3 border-l-2 border-blue-200 pl-4 py-1">
                  <div>
                    <Badge variant={getStatusBadge(entry.status)}>{getStatusLabel(entry.status)}</Badge>
                    <p className="text-xs text-gray-500 mt-1">{formatDateTime(entry.changedAt)} — oleh {entry.changedBy}</p>
                    {entry.notes && <p className="text-xs text-gray-600 mt-0.5">{entry.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <Modal isOpen={showStatusModal} onClose={() => setShowStatusModal(false)} title="Ubah Status Klaim" size="sm">
        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="newStatus" className="text-sm font-medium text-gray-700">Status Baru</label>
            <select
              id="newStatus"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as Claim['status'])}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
            >
              {selectedClaim?.status === 'diajukan' && <option value="diproses">Diproses</option>}
              {selectedClaim?.status === 'diproses' && (
                <>
                  <option value="disetujui">Disetujui</option>
                  <option value="ditolak">Ditolak</option>
                </>
              )}
            </select>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleUpdateStatus}>Simpan</Button>
            <Button variant="outline" onClick={() => setShowStatusModal(false)}>Batal</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Klaim;
