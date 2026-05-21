import React, { useState, useEffect, useCallback } from 'react';
import { laboratoriumService, AVAILABLE_EXAM_TYPES } from '@/services/modules/laboratoriumService';
import { formatDateTime } from '@/utils/formatters';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { Table } from '@/components/ui/Table';
import type { LabRequest, LabResult } from '@/types/modules';

type ViewMode = 'list' | 'form';
type TabFilter = 'semua' | 'Menunggu' | 'Selesai';

interface RequestFormData {
  patientName: string;
  examType: string;
  clinicalNotes: string;
}

interface ResultFormRow {
  parameterName: string;
  value: string;
  unit: string;
  normalRangeLow: string;
  normalRangeHigh: string;
}

const INITIAL_REQUEST_FORM: RequestFormData = {
  patientName: '',
  examType: '',
  clinicalNotes: '',
};

const EMPTY_RESULT_ROW: ResultFormRow = {
  parameterName: '',
  value: '',
  unit: '',
  normalRangeLow: '',
  normalRangeHigh: '',
};

const PAGE_SIZE = 10;

export default function LaboratoriumPage(): React.ReactElement {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [tabFilter, setTabFilter] = useState<TabFilter>('semua');
  const [requests, setRequests] = useState<LabRequest[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState<RequestFormData>(INITIAL_REQUEST_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Result input modal
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LabRequest | null>(null);
  const [resultRows, setResultRows] = useState<ResultFormRow[]>([{ ...EMPTY_RESULT_ROW }]);
  const [resultErrors, setResultErrors] = useState<string>('');

  // Detail modal
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailRequest, setDetailRequest] = useState<LabRequest | null>(null);

  const loadRequests = useCallback(() => {
    const status = tabFilter === 'semua' ? undefined : tabFilter;
    const data = laboratoriumService.getAll(status);
    setRequests(data);
  }, [tabFilter]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  // Pagination
  const totalPages = Math.ceil(requests.length / PAGE_SIZE);
  const paginatedData = requests.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleTabChange = (tab: TabFilter) => {
    setTabFilter(tab);
    setCurrentPage(1);
  };

  const handleNewRequest = () => {
    setFormData(INITIAL_REQUEST_FORM);
    setFormErrors({});
    setAlertMessage(null);
    setViewMode('form');
  };

  const handleCancel = () => {
    setViewMode('list');
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateRequestForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.patientName.trim()) {
      errors.patientName = 'Nama pasien wajib diisi';
    }
    if (!formData.examType) {
      errors.examType = 'Jenis pemeriksaan wajib dipilih';
    }
    if (formData.clinicalNotes.length > 1000) {
      errors.clinicalNotes = 'Catatan klinis maksimal 1000 karakter';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateRequestForm()) return;

    try {
      laboratoriumService.createRequest({
        patientId: `patient-${Date.now()}`,
        patientName: formData.patientName.trim(),
        examType: formData.examType,
        clinicalNotes: formData.clinicalNotes.trim(),
      });
      setAlertMessage({ type: 'success', message: 'Permintaan pemeriksaan laboratorium berhasil dibuat.' });
      setViewMode('list');
      loadRequests();
    } catch {
      setAlertMessage({ type: 'error', message: 'Gagal membuat permintaan pemeriksaan.' });
    }
  };

  // Result input handlers
  const handleOpenResultModal = (request: LabRequest) => {
    setSelectedRequest(request);
    setResultRows([{ ...EMPTY_RESULT_ROW }]);
    setResultErrors('');
    setResultModalOpen(true);
  };

  const handleResultRowChange = (index: number, field: keyof ResultFormRow, value: string) => {
    setResultRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddResultRow = () => {
    setResultRows((prev) => [...prev, { ...EMPTY_RESULT_ROW }]);
  };

  const handleRemoveResultRow = (index: number) => {
    if (resultRows.length <= 1) return;
    setResultRows((prev) => prev.filter((_, i) => i !== index));
  };

  const validateResults = (): boolean => {
    for (let i = 0; i < resultRows.length; i++) {
      const row = resultRows[i];
      if (!row.parameterName.trim()) {
        setResultErrors(`Baris ${i + 1}: Nama parameter wajib diisi`);
        return false;
      }
      if (!row.value || isNaN(Number(row.value))) {
        setResultErrors(`Baris ${i + 1}: Nilai harus berupa angka`);
        return false;
      }
      if (!row.unit.trim()) {
        setResultErrors(`Baris ${i + 1}: Satuan wajib diisi`);
        return false;
      }
      if (!row.normalRangeLow || isNaN(Number(row.normalRangeLow))) {
        setResultErrors(`Baris ${i + 1}: Batas bawah harus berupa angka`);
        return false;
      }
      if (!row.normalRangeHigh || isNaN(Number(row.normalRangeHigh))) {
        setResultErrors(`Baris ${i + 1}: Batas atas harus berupa angka`);
        return false;
      }
      if (Number(row.normalRangeLow) > Number(row.normalRangeHigh)) {
        setResultErrors(`Baris ${i + 1}: Batas bawah tidak boleh lebih besar dari batas atas`);
        return false;
      }
    }
    setResultErrors('');
    return true;
  };

  const handleSubmitResults = () => {
    if (!selectedRequest) return;
    if (!validateResults()) return;

    try {
      const results: Omit<LabResult, 'isAbnormal'>[] = resultRows.map((row) => ({
        parameterName: row.parameterName.trim(),
        value: Number(row.value),
        unit: row.unit.trim(),
        normalRangeLow: Number(row.normalRangeLow),
        normalRangeHigh: Number(row.normalRangeHigh),
      }));

      laboratoriumService.addResults(selectedRequest.id, results);
      setAlertMessage({ type: 'success', message: `Hasil pemeriksaan untuk ${selectedRequest.patientName} berhasil disimpan.` });
      setResultModalOpen(false);
      setSelectedRequest(null);
      loadRequests();
    } catch {
      setResultErrors('Gagal menyimpan hasil pemeriksaan.');
    }
  };

  // Detail modal
  const handleViewDetail = (request: LabRequest) => {
    setDetailRequest(request);
    setDetailModalOpen(true);
  };

  const columns = [
    {
      key: 'requestDate',
      label: 'Tanggal',
      render: (row: Record<string, unknown>) => formatDateTime(row.requestDate as string),
    },
    { key: 'patientName', label: 'Nama Pasien' },
    { key: 'examType', label: 'Jenis Pemeriksaan' },
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
        const req = row as unknown as LabRequest;
        return (
          <div className="flex gap-2">
            {req.status === 'Menunggu' && (
              <Button
                variant="primary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenResultModal(req);
                }}
              >
                Input Hasil
              </Button>
            )}
            {req.status === 'Selesai' && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewDetail(req);
                }}
              >
                Lihat Hasil
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
        <h1 className="text-2xl font-bold text-gray-800">Laboratorium</h1>
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
          {/* Tab filters */}
          <div className="flex gap-2 border-b border-gray-200 pb-2">
            {(['semua', 'Menunggu', 'Selesai'] as TabFilter[]).map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                  tabFilter === tab
                    ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab === 'semua' ? 'Semua' : tab}
              </button>
            ))}
          </div>

          <Table
            columns={columns}
            data={paginatedData as unknown as Record<string, unknown>[]}
            emptyMessage="Tidak ada data pemeriksaan laboratorium"
          />

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              pageSize={PAGE_SIZE}
              totalItems={requests.length}
            />
          )}
        </div>
      )}

      {viewMode === 'form' && (
        <form onSubmit={handleSubmitRequest} className="max-w-2xl space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-700">Formulir Permintaan Pemeriksaan Lab</h2>

            <Input
              label="Nama Pasien"
              name="patientName"
              type="text"
              value={formData.patientName}
              onChange={handleFormChange}
              error={formErrors.patientName}
              required
              placeholder="Masukkan nama pasien"
            />

            <div className="flex flex-col gap-1">
              <label htmlFor="examType" className="text-sm font-medium text-gray-700">
                Jenis Pemeriksaan<span className="text-red-500 ml-0.5">*</span>
              </label>
              <select
                id="examType"
                name="examType"
                value={formData.examType}
                onChange={handleFormChange}
                className={`w-full rounded-lg border px-3 py-2 text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                  formErrors.examType
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                }`}
              >
                <option value="">Pilih jenis pemeriksaan</option>
                {AVAILABLE_EXAM_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {formErrors.examType && (
                <p className="text-xs text-red-600" role="alert">{formErrors.examType}</p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="clinicalNotes" className="text-sm font-medium text-gray-700">
                Catatan Klinis
              </label>
              <textarea
                id="clinicalNotes"
                name="clinicalNotes"
                value={formData.clinicalNotes}
                onChange={handleFormChange}
                maxLength={1000}
                rows={4}
                placeholder="Masukkan catatan klinis (opsional)"
                className={`w-full rounded-lg border px-3 py-2 text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                  formErrors.clinicalNotes
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                }`}
              />
              <div className="flex justify-between">
                {formErrors.clinicalNotes && (
                  <p className="text-xs text-red-600" role="alert">{formErrors.clinicalNotes}</p>
                )}
                <p className="text-xs text-gray-400 ml-auto">{formData.clinicalNotes.length}/1000</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit">Buat Permintaan</Button>
            <Button variant="outline" onClick={handleCancel}>Batal</Button>
          </div>
        </form>
      )}

      {/* Result Input Modal */}
      <Modal
        isOpen={resultModalOpen}
        onClose={() => setResultModalOpen(false)}
        title={`Input Hasil - ${selectedRequest?.patientName || ''}`}
        size="xl"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Pemeriksaan: <span className="font-medium">{selectedRequest?.examType}</span>
          </p>

          {resultErrors && (
            <Alert type="error" message={resultErrors} />
          )}

          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {resultRows.map((row, index) => (
              <div key={index} className="rounded-lg border border-gray-200 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500">Parameter {index + 1}</span>
                  {resultRows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveResultRow(index)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Hapus
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Nama Parameter"
                    value={row.parameterName}
                    onChange={(e) => handleResultRowChange(index, 'parameterName', e.target.value)}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Satuan"
                    value={row.unit}
                    onChange={(e) => handleResultRowChange(index, 'unit', e.target.value)}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    step="any"
                    placeholder="Nilai"
                    value={row.value}
                    onChange={(e) => handleResultRowChange(index, 'value', e.target.value)}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                  />
                  <input
                    type="number"
                    step="any"
                    placeholder="Batas Bawah"
                    value={row.normalRangeLow}
                    onChange={(e) => handleResultRowChange(index, 'normalRangeLow', e.target.value)}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                  />
                  <input
                    type="number"
                    step="any"
                    placeholder="Batas Atas"
                    value={row.normalRangeHigh}
                    onChange={(e) => handleResultRowChange(index, 'normalRangeHigh', e.target.value)}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                  />
                </div>
              </div>
            ))}
          </div>

          <Button variant="outline" size="sm" onClick={handleAddResultRow}>
            + Tambah Parameter
          </Button>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-200">
            <Button variant="outline" onClick={() => setResultModalOpen(false)}>Batal</Button>
            <Button onClick={handleSubmitResults}>Simpan Hasil</Button>
          </div>
        </div>
      </Modal>

      {/* Detail Result Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={`Hasil Pemeriksaan - ${detailRequest?.patientName || ''}`}
        size="xl"
      >
        {detailRequest && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Jenis Pemeriksaan:</span>
                <p className="font-medium">{detailRequest.examType}</p>
              </div>
              <div>
                <span className="text-gray-500">Tanggal:</span>
                <p className="font-medium">{formatDateTime(detailRequest.requestDate)}</p>
              </div>
              {detailRequest.clinicalNotes && (
                <div className="col-span-2">
                  <span className="text-gray-500">Catatan Klinis:</span>
                  <p className="font-medium">{detailRequest.clinicalNotes}</p>
                </div>
              )}
            </div>

            {detailRequest.results && detailRequest.results.length > 0 && (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Parameter</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Nilai</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Satuan</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Rentang Normal</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {detailRequest.results.map((result, idx) => (
                      <tr
                        key={idx}
                        className={result.isAbnormal ? 'bg-red-50' : 'bg-white'}
                      >
                        <td className="px-4 py-3 text-sm text-gray-700">{result.parameterName}</td>
                        <td className={`px-4 py-3 text-sm font-medium ${result.isAbnormal ? 'text-red-700' : 'text-gray-700'}`}>
                          {result.value}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{result.unit}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {result.normalRangeLow} - {result.normalRangeHigh}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <Badge variant={result.isAbnormal ? 'danger' : 'success'} size="sm">
                            {result.isAbnormal ? 'Abnormal' : 'Normal'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
