import React, { useState, useEffect, useCallback } from 'react';
import { radiologiService } from '@/services/modules/radiologiService';
import { admissionService } from '@/services/modules/admissionService';
import { formatDateTime } from '@/utils/formatters';
import { useAuth } from '@/hooks/useAuth';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { Table } from '@/components/ui/Table';
import type { RadiologyRequest } from '@/types/modules';
import type { Patient } from '@/types/modules';

type ViewMode = 'list' | 'form';
type FilterStatus = 'all' | 'Menunggu' | 'Selesai';

interface RequestFormData {
  patientId: string;
  patientName: string;
  examType: string;
  bodyArea: string;
  clinicalNotes: string;
}

interface RequestFormErrors {
  patientId?: string;
  examType?: string;
  bodyArea?: string;
  clinicalNotes?: string;
}

interface ResultFormData {
  interpretation: string;
  conclusion: string;
}

interface ResultFormErrors {
  interpretation?: string;
  conclusion?: string;
}

const INITIAL_REQUEST_FORM: RequestFormData = {
  patientId: '',
  patientName: '',
  examType: '',
  bodyArea: '',
  clinicalNotes: '',
};

const INITIAL_RESULT_FORM: ResultFormData = {
  interpretation: '',
  conclusion: '',
};

const PAGE_SIZE = 10;

export default function RadiologiPage(): React.ReactElement {
  const { state: authState } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [requests, setRequests] = useState<RadiologyRequest[]>([]);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [patients, setPatients] = useState<Patient[]>([]);

  // Request form
  const [requestForm, setRequestForm] = useState<RequestFormData>(INITIAL_REQUEST_FORM);
  const [requestErrors, setRequestErrors] = useState<RequestFormErrors>({});

  // Result modal
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RadiologyRequest | null>(null);
  const [resultForm, setResultForm] = useState<ResultFormData>(INITIAL_RESULT_FORM);
  const [resultErrors, setResultErrors] = useState<ResultFormErrors>({});

  // Detail modal
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailRequest, setDetailRequest] = useState<RadiologyRequest | null>(null);

  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadRequests = useCallback(() => {
    const status = filterStatus === 'all' ? undefined : filterStatus;
    const data = radiologiService.getAll(status);
    // Sort: pending first (oldest first), then completed (newest first)
    data.sort((a, b) => {
      if (a.status === 'Menunggu' && b.status === 'Selesai') return -1;
      if (a.status === 'Selesai' && b.status === 'Menunggu') return 1;
      if (a.status === 'Menunggu' && b.status === 'Menunggu') {
        return new Date(a.requestDate).getTime() - new Date(b.requestDate).getTime();
      }
      return new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime();
    });
    setRequests(data);
  }, [filterStatus]);

  const loadPatients = useCallback(() => {
    admissionService.initializePatients();
    const result = admissionService.getAll(1, 1000);
    setPatients(result.data);
  }, []);

  useEffect(() => {
    loadRequests();
    loadPatients();
  }, [loadRequests, loadPatients]);

  // Pagination
  const totalItems = requests.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const paginatedData = requests.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleFilterChange = (status: FilterStatus) => {
    setFilterStatus(status);
    setCurrentPage(1);
  };

  const handleNewRequest = () => {
    setRequestForm(INITIAL_REQUEST_FORM);
    setRequestErrors({});
    setAlertMessage(null);
    setViewMode('form');
  };

  const handleCancel = () => {
    setViewMode('list');
    setAlertMessage(null);
  };

  const handleRequestFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'patientId') {
      const patient = patients.find((p) => p.id === value);
      setRequestForm((prev) => ({
        ...prev,
        patientId: value,
        patientName: patient?.fullName || '',
      }));
    } else {
      setRequestForm((prev) => ({ ...prev, [name]: value }));
    }
    if (requestErrors[name as keyof RequestFormErrors]) {
      setRequestErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateRequestForm = (): boolean => {
    const errors: RequestFormErrors = {};

    if (!requestForm.patientId) {
      errors.patientId = 'Pasien wajib dipilih';
    }
    if (!requestForm.examType.trim()) {
      errors.examType = 'Jenis pemeriksaan wajib diisi';
    } else if (requestForm.examType.trim().length > 100) {
      errors.examType = 'Jenis pemeriksaan maksimal 100 karakter';
    }
    if (!requestForm.bodyArea.trim()) {
      errors.bodyArea = 'Area tubuh wajib diisi';
    } else if (requestForm.bodyArea.trim().length > 100) {
      errors.bodyArea = 'Area tubuh maksimal 100 karakter';
    }
    if (requestForm.clinicalNotes.trim().length > 1000) {
      errors.clinicalNotes = 'Catatan klinis maksimal 1000 karakter';
    }

    setRequestErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateRequestForm()) return;

    try {
      radiologiService.createRequest({
        patientId: requestForm.patientId,
        patientName: requestForm.patientName,
        examType: requestForm.examType.trim(),
        bodyArea: requestForm.bodyArea.trim(),
        clinicalNotes: requestForm.clinicalNotes.trim(),
      });
      setAlertMessage({ type: 'success', message: 'Permintaan pemeriksaan radiologi berhasil dibuat.' });
      setViewMode('list');
      setRequestForm(INITIAL_REQUEST_FORM);
      loadRequests();
    } catch {
      setAlertMessage({ type: 'error', message: 'Gagal membuat permintaan pemeriksaan.' });
    }
  };

  // Result form
  const handleOpenResultModal = (request: RadiologyRequest) => {
    setSelectedRequest(request);
    setResultForm(INITIAL_RESULT_FORM);
    setResultErrors({});
    setResultModalOpen(true);
  };

  const handleResultFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setResultForm((prev) => ({ ...prev, [name]: value }));
    if (resultErrors[name as keyof ResultFormErrors]) {
      setResultErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateResultForm = (): boolean => {
    const errors: ResultFormErrors = {};

    if (!resultForm.interpretation.trim()) {
      errors.interpretation = 'Interpretasi/bacaan wajib diisi';
    } else if (resultForm.interpretation.trim().length > 5000) {
      errors.interpretation = 'Interpretasi maksimal 5000 karakter';
    }
    if (!resultForm.conclusion.trim()) {
      errors.conclusion = 'Kesimpulan wajib diisi';
    } else if (resultForm.conclusion.trim().length > 2000) {
      errors.conclusion = 'Kesimpulan maksimal 2000 karakter';
    }

    setResultErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitResult = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateResultForm() || !selectedRequest) return;

    try {
      radiologiService.addResult(selectedRequest.id, {
        interpretation: resultForm.interpretation.trim(),
        conclusion: resultForm.conclusion.trim(),
        completedBy: authState.user?.fullName || 'Unknown',
      });
      setAlertMessage({ type: 'success', message: 'Hasil pemeriksaan berhasil disimpan.' });
      setResultModalOpen(false);
      setSelectedRequest(null);
      loadRequests();
    } catch {
      setAlertMessage({ type: 'error', message: 'Gagal menyimpan hasil pemeriksaan.' });
    }
  };

  // Detail
  const handleViewDetail = (request: RadiologyRequest) => {
    setDetailRequest(request);
    setDetailModalOpen(true);
  };

  const columns = [
    {
      key: 'requestDate',
      label: 'Tanggal',
      render: (row: Record<string, unknown>) => formatDateTime(row.requestDate as string),
    },
    { key: 'patientName', label: 'Pasien' },
    { key: 'examType', label: 'Jenis Pemeriksaan' },
    { key: 'bodyArea', label: 'Area Tubuh' },
    {
      key: 'status',
      label: 'Status',
      render: (row: Record<string, unknown>) => (
        <Badge variant={row.status === 'Selesai' ? 'success' : 'warning'}>
          {row.status as string}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Aksi',
      render: (row: Record<string, unknown>) => {
        const request = row as unknown as RadiologyRequest;
        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleViewDetail(request);
              }}
            >
              Detail
            </Button>
            {request.status === 'Menunggu' && (
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenResultModal(request);
                }}
              >
                Input Hasil
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Radiologi</h1>
        {viewMode === 'list' && (
          <Button onClick={handleNewRequest}>Permintaan Baru</Button>
        )}
      </div>

      {alertMessage && (
        <Alert
          type={alertMessage.type}
          message={alertMessage.message}
          onClose={() => setAlertMessage(null)}
        />
      )}

      {viewMode === 'list' && (
        <div className="space-y-4">
          {/* Filter tabs */}
          <div className="flex gap-2">
            {(['all', 'Menunggu', 'Selesai'] as FilterStatus[]).map((status) => (
              <button
                key={status}
                onClick={() => handleFilterChange(status)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'Semua' : status}
              </button>
            ))}
          </div>

          <Table
            columns={columns}
            data={paginatedData as unknown as Record<string, unknown>[]}
            emptyMessage="Tidak ada data pemeriksaan radiologi"
          />

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              pageSize={PAGE_SIZE}
              totalItems={totalItems}
            />
          )}
        </div>
      )}

      {viewMode === 'form' && (
        <form onSubmit={handleSubmitRequest} className="max-w-2xl space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-700">
              Formulir Permintaan Pemeriksaan Radiologi
            </h2>

            {/* Patient select */}
            <div className="flex flex-col gap-1">
              <label htmlFor="patientId" className="text-sm font-medium text-gray-700">
                Pasien<span className="text-red-500 ml-0.5">*</span>
              </label>
              <select
                id="patientId"
                name="patientId"
                value={requestForm.patientId}
                onChange={handleRequestFormChange}
                className={`w-full rounded-lg border px-3 py-2 text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                  requestErrors.patientId
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                }`}
              >
                <option value="">Pilih pasien</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.fullName} ({patient.medicalRecordNumber})
                  </option>
                ))}
              </select>
              {requestErrors.patientId && (
                <p className="text-xs text-red-600" role="alert">{requestErrors.patientId}</p>
              )}
            </div>

            <Input
              label="Jenis Pemeriksaan"
              name="examType"
              type="text"
              value={requestForm.examType}
              onChange={handleRequestFormChange}
              error={requestErrors.examType}
              required
              maxLength={100}
              placeholder="Contoh: Rontgen, CT Scan, USG, MRI"
            />

            <Input
              label="Area Tubuh"
              name="bodyArea"
              type="text"
              value={requestForm.bodyArea}
              onChange={handleRequestFormChange}
              error={requestErrors.bodyArea}
              required
              maxLength={100}
              placeholder="Contoh: Thorax, Abdomen, Kepala"
            />

            <div className="flex flex-col gap-1">
              <label htmlFor="clinicalNotes" className="text-sm font-medium text-gray-700">
                Catatan Klinis
              </label>
              <textarea
                id="clinicalNotes"
                name="clinicalNotes"
                value={requestForm.clinicalNotes}
                onChange={handleRequestFormChange}
                maxLength={1000}
                rows={4}
                placeholder="Masukkan catatan klinis atau indikasi pemeriksaan"
                className={`w-full rounded-lg border px-3 py-2 text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                  requestErrors.clinicalNotes
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                }`}
              />
              <div className="flex justify-between">
                {requestErrors.clinicalNotes && (
                  <p className="text-xs text-red-600" role="alert">{requestErrors.clinicalNotes}</p>
                )}
                <p className="text-xs text-gray-400 ml-auto">{requestForm.clinicalNotes.length}/1000</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit">Buat Permintaan</Button>
            <Button variant="outline" onClick={handleCancel}>Batal</Button>
          </div>
        </form>
      )}

      {/* Result Modal */}
      <Modal
        isOpen={resultModalOpen}
        onClose={() => setResultModalOpen(false)}
        title="Input Hasil Pemeriksaan"
        size="lg"
      >
        {selectedRequest && (
          <form onSubmit={handleSubmitResult} className="space-y-4">
            <div className="rounded-lg bg-gray-50 p-3 space-y-1 text-sm">
              <p><span className="font-medium">Pasien:</span> {selectedRequest.patientName}</p>
              <p><span className="font-medium">Jenis:</span> {selectedRequest.examType}</p>
              <p><span className="font-medium">Area:</span> {selectedRequest.bodyArea}</p>
              {selectedRequest.clinicalNotes && (
                <p><span className="font-medium">Catatan:</span> {selectedRequest.clinicalNotes}</p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="interpretation" className="text-sm font-medium text-gray-700">
                Interpretasi / Bacaan<span className="text-red-500 ml-0.5">*</span>
              </label>
              <textarea
                id="interpretation"
                name="interpretation"
                value={resultForm.interpretation}
                onChange={handleResultFormChange}
                maxLength={5000}
                rows={5}
                placeholder="Masukkan interpretasi hasil pemeriksaan radiologi"
                className={`w-full rounded-lg border px-3 py-2 text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                  resultErrors.interpretation
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                }`}
              />
              <div className="flex justify-between">
                {resultErrors.interpretation && (
                  <p className="text-xs text-red-600" role="alert">{resultErrors.interpretation}</p>
                )}
                <p className="text-xs text-gray-400 ml-auto">{resultForm.interpretation.length}/5000</p>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="conclusion" className="text-sm font-medium text-gray-700">
                Kesimpulan<span className="text-red-500 ml-0.5">*</span>
              </label>
              <textarea
                id="conclusion"
                name="conclusion"
                value={resultForm.conclusion}
                onChange={handleResultFormChange}
                maxLength={2000}
                rows={3}
                placeholder="Masukkan kesimpulan hasil pemeriksaan"
                className={`w-full rounded-lg border px-3 py-2 text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                  resultErrors.conclusion
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                }`}
              />
              <div className="flex justify-between">
                {resultErrors.conclusion && (
                  <p className="text-xs text-red-600" role="alert">{resultErrors.conclusion}</p>
                )}
                <p className="text-xs text-gray-400 ml-auto">{resultForm.conclusion.length}/2000</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setResultModalOpen(false)}>Batal</Button>
              <Button type="submit">Simpan Hasil</Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="Detail Pemeriksaan Radiologi"
        size="lg"
      >
        {detailRequest && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="font-medium text-gray-500">Pasien</p>
                <p className="text-gray-900">{detailRequest.patientName}</p>
              </div>
              <div>
                <p className="font-medium text-gray-500">Tanggal Permintaan</p>
                <p className="text-gray-900">{formatDateTime(detailRequest.requestDate)}</p>
              </div>
              <div>
                <p className="font-medium text-gray-500">Jenis Pemeriksaan</p>
                <p className="text-gray-900">{detailRequest.examType}</p>
              </div>
              <div>
                <p className="font-medium text-gray-500">Area Tubuh</p>
                <p className="text-gray-900">{detailRequest.bodyArea}</p>
              </div>
              <div className="col-span-2">
                <p className="font-medium text-gray-500">Status</p>
                <Badge variant={detailRequest.status === 'Selesai' ? 'success' : 'warning'}>
                  {detailRequest.status}
                </Badge>
              </div>
              {detailRequest.clinicalNotes && (
                <div className="col-span-2">
                  <p className="font-medium text-gray-500">Catatan Klinis</p>
                  <p className="text-gray-900 whitespace-pre-wrap">{detailRequest.clinicalNotes}</p>
                </div>
              )}
            </div>

            {detailRequest.result && (
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <h3 className="font-semibold text-gray-800">Hasil Pemeriksaan</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="font-medium text-gray-500">Interpretasi / Bacaan</p>
                    <p className="text-gray-900 whitespace-pre-wrap">{detailRequest.result.interpretation}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-500">Kesimpulan</p>
                    <p className="text-gray-900 whitespace-pre-wrap">{detailRequest.result.conclusion}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="font-medium text-gray-500">Diselesaikan oleh</p>
                      <p className="text-gray-900">{detailRequest.result.completedBy}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-500">Waktu selesai</p>
                      <p className="text-gray-900">{formatDateTime(detailRequest.result.completedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setDetailModalOpen(false)}>Tutup</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}


