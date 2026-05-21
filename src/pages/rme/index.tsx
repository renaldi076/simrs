import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, FileText, Plus, Trash2, Clock, User, PenLine } from 'lucide-react';
import { rmeService } from '@/services/modules/rmeService';
import { useAuth } from '@/hooks/useAuth';
import { formatDate, formatDateTime } from '@/utils/formatters';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { Table } from '@/components/ui/Table';
import type { MedicalRecord, Prescription, AuditEntry } from '@/types/modules';
import type { PaginatedResult } from '@/types/common';

type ViewMode = 'list' | 'form' | 'detail';

// Sample ICD-10 codes commonly used in Indonesian hospitals
const ICD10_CODES = [
  { code: 'A09', name: 'Infectious Gastroenteritis and Colitis' },
  { code: 'A90', name: 'Dengue Fever' },
  { code: 'A91', name: 'Dengue Haemorrhagic Fever' },
  { code: 'B34.9', name: 'Viral Infection, Unspecified' },
  { code: 'E11.9', name: 'Type 2 Diabetes Mellitus Without Complications' },
  { code: 'G43.9', name: 'Migraine, Unspecified' },
  { code: 'I10', name: 'Essential (Primary) Hypertension' },
  { code: 'I25.9', name: 'Chronic Ischaemic Heart Disease' },
  { code: 'J06.9', name: 'Acute Upper Respiratory Infection, Unspecified' },
  { code: 'J18.9', name: 'Pneumonia, Unspecified Organism' },
  { code: 'J45.9', name: 'Asthma, Unspecified' },
  { code: 'K21.0', name: 'Gastro-oesophageal Reflux Disease with Oesophagitis' },
  { code: 'K29.7', name: 'Gastritis, Unspecified' },
  { code: 'K35.9', name: 'Acute Appendicitis, Unspecified' },
  { code: 'M54.5', name: 'Low Back Pain' },
  { code: 'N39.0', name: 'Urinary Tract Infection, Site Not Specified' },
  { code: 'R50.9', name: 'Fever, Unspecified' },
  { code: 'R51', name: 'Headache' },
  { code: 'Z09', name: 'Follow-up Examination After Treatment' },
  { code: 'Z00.0', name: 'General Medical Examination' },
];

interface FormData {
  patientId: string;
  visitDate: string;
  complaint: string;
  diagnosisCode: string;
  treatment: string;
  prescriptions: Prescription[];
}

interface FormErrors {
  patientId?: string;
  visitDate?: string;
  complaint?: string;
  diagnosisCode?: string;
  treatment?: string;
}

const EMPTY_PRESCRIPTION: Prescription = {
  medicationName: '',
  dosage: '',
  frequency: '',
  duration: '',
  quantity: 0,
};

const INITIAL_FORM: FormData = {
  patientId: '',
  visitDate: new Date().toISOString().split('T')[0],
  complaint: '',
  diagnosisCode: '',
  treatment: '',
  prescriptions: [],
};

const PAGE_SIZE = 20;

export default function RMEPage(): React.ReactElement {
  const { state: authState } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [records, setRecords] = useState<PaginatedResult<MedicalRecord>>({
    data: [],
    total: 0,
    page: 1,
    pageSize: PAGE_SIZE,
    totalPages: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showSignModal, setShowSignModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recordToSign, setRecordToSign] = useState<string | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditTrailData, setAuditTrailData] = useState<AuditEntry[]>([]);
  const [filterPatientId, setFilterPatientId] = useState('');

  const loadRecords = useCallback(() => {
    const result = rmeService.getAll(
      filterPatientId.trim() || undefined,
      currentPage,
      PAGE_SIZE
    );
    setRecords(result);
  }, [currentPage, filterPatientId]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleNewRecord = () => {
    setFormData(INITIAL_FORM);
    setFormErrors({});
    setEditingRecordId(null);
    setAlertMessage(null);
    setViewMode('form');
  };

  const handleEditRecord = (record: MedicalRecord) => {
    if (record.status === 'final') return;
    setFormData({
      patientId: record.patientId,
      visitDate: record.visitDate,
      complaint: record.complaint,
      diagnosisCode: record.diagnosisCode,
      treatment: record.treatment,
      prescriptions: record.prescriptions || [],
    });
    setFormErrors({});
    setEditingRecordId(record.id);
    setAlertMessage(null);
    setViewMode('form');
  };

  const handleViewDetail = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setViewMode('detail');
  };

  const handleViewAuditTrail = (record: MedicalRecord) => {
    setAuditTrailData(record.auditTrail);
    setShowAuditModal(true);
  };

  const handleCancel = () => {
    setViewMode('list');
    setSelectedRecord(null);
    setAlertMessage(null);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handlePrescriptionChange = (
    index: number,
    field: keyof Prescription,
    value: string | number
  ) => {
    setFormData((prev) => {
      const updated = [...prev.prescriptions];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, prescriptions: updated };
    });
  };

  const addPrescription = () => {
    setFormData((prev) => ({
      ...prev,
      prescriptions: [...prev.prescriptions, { ...EMPTY_PRESCRIPTION }],
    }));
  };

  const removePrescription = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      prescriptions: prev.prescriptions.filter((_, i) => i !== index),
    }));
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.patientId.trim()) {
      errors.patientId = 'ID Pasien wajib diisi';
    }
    if (!formData.visitDate) {
      errors.visitDate = 'Tanggal kunjungan wajib diisi';
    }
    if (!formData.complaint.trim()) {
      errors.complaint = 'Keluhan wajib diisi';
    } else if (formData.complaint.length > 2000) {
      errors.complaint = 'Keluhan maksimal 2000 karakter';
    }
    if (!formData.diagnosisCode) {
      errors.diagnosisCode = 'Diagnosis wajib dipilih';
    }
    if (!formData.treatment.trim()) {
      errors.treatment = 'Tindakan wajib diisi';
    } else if (formData.treatment.length > 2000) {
      errors.treatment = 'Tindakan maksimal 2000 karakter';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const selectedDiagnosis = ICD10_CODES.find((d) => d.code === formData.diagnosisCode);
    const userName = authState.user?.fullName || 'Unknown';
    const userId = authState.user?.id || 'unknown';

    // Filter out empty prescriptions
    const validPrescriptions = formData.prescriptions.filter(
      (p) => p.medicationName.trim() !== ''
    );

    try {
      if (editingRecordId) {
        rmeService.update(editingRecordId, {
          complaint: formData.complaint.trim(),
          diagnosisCode: formData.diagnosisCode,
          diagnosisName: selectedDiagnosis?.name || '',
          treatment: formData.treatment.trim(),
          prescriptions: validPrescriptions.length > 0 ? validPrescriptions : undefined,
          updatedBy: userId,
          updatedByName: userName,
        });
        setAlertMessage({ type: 'success', message: 'Rekam medis berhasil diperbarui.' });
      } else {
        rmeService.create({
          patientId: formData.patientId.trim(),
          visitDate: formData.visitDate,
          complaint: formData.complaint.trim(),
          diagnosisCode: formData.diagnosisCode,
          diagnosisName: selectedDiagnosis?.name || '',
          treatment: formData.treatment.trim(),
          prescriptions: validPrescriptions.length > 0 ? validPrescriptions : undefined,
          createdBy: userId,
          createdByName: userName,
        });
        setAlertMessage({ type: 'success', message: 'Rekam medis baru berhasil disimpan.' });
      }

      loadRecords();
      setViewMode('list');
      setFormData(INITIAL_FORM);
      setEditingRecordId(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan.';
      setAlertMessage({ type: 'error', message });
    }
  };

  const handleSignRecord = () => {
    if (!recordToSign) return;
    const userName = authState.user?.fullName || 'Unknown';
    const userId = authState.user?.id || 'unknown';

    try {
      rmeService.sign(recordToSign, userId, userName);
      setAlertMessage({ type: 'success', message: 'Rekam medis berhasil ditandatangani dan dikunci.' });
      loadRecords();
      if (selectedRecord?.id === recordToSign) {
        setSelectedRecord(rmeService.getById(recordToSign));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal menandatangani rekam medis.';
      setAlertMessage({ type: 'error', message });
    } finally {
      setShowSignModal(false);
      setRecordToSign(null);
    }
  };

  const handleDeleteRecord = () => {
    if (!recordToDelete) return;

    try {
      rmeService.deleteRecord(recordToDelete);
      setAlertMessage({ type: 'success', message: 'Rekam medis berhasil dihapus.' });
      loadRecords();
      if (viewMode === 'detail') {
        setViewMode('list');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal menghapus rekam medis.';
      setAlertMessage({ type: 'error', message });
    } finally {
      setShowDeleteModal(false);
      setRecordToDelete(null);
    }
  };

  const columns = [
    {
      key: 'visitDate',
      label: 'Tanggal',
      render: (row: Record<string, unknown>) => formatDate(row.visitDate as string),
    },
    { key: 'patientId', label: 'ID Pasien' },
    {
      key: 'diagnosisCode',
      label: 'Diagnosis',
      render: (row: Record<string, unknown>) => (
        <span className="font-mono text-xs">
          {row.diagnosisCode as string} - {row.diagnosisName as string}
        </span>
      ),
    },
    {
      key: 'complaint',
      label: 'Keluhan',
      render: (row: Record<string, unknown>) => {
        const complaint = row.complaint as string;
        return (
          <span className="line-clamp-1 max-w-[200px] block" title={complaint}>
            {complaint}
          </span>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (row: Record<string, unknown>) => {
        const status = row.status as string;
        if (status === 'final') {
          return (
            <Badge variant="success" size="sm">
              <Lock size={12} className="mr-1" />
              Final
            </Badge>
          );
        }
        return (
          <Badge variant="warning" size="sm">
            <PenLine size={12} className="mr-1" />
            Draft
          </Badge>
        );
      },
    },
    {
      key: 'actions',
      label: 'Aksi',
      render: (row: Record<string, unknown>) => {
        const record = row as unknown as MedicalRecord;
        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleViewDetail(record);
              }}
            >
              <FileText size={14} />
            </Button>
            {record.status === 'draft' && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditRecord(record);
                  }}
                >
                  <PenLine size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setRecordToSign(record.id);
                    setShowSignModal(true);
                  }}
                >
                  <Lock size={14} />
                </Button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Rekam Medis Elektronik</h1>
        {viewMode === 'list' && (
          <Button onClick={handleNewRecord}>
            <Plus size={16} className="mr-1" />
            Tambah Rekam Medis
          </Button>
        )}
      </div>

      {alertMessage && (
        <Alert
          type={alertMessage.type}
          message={alertMessage.message}
          onClose={() => setAlertMessage(null)}
        />
      )}

      <AnimatePresence mode="wait">
        {viewMode === 'list' && (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <Input
              name="filterPatientId"
              type="text"
              placeholder="Filter berdasarkan ID Pasien..."
              value={filterPatientId}
              onChange={(e) => {
                setFilterPatientId(e.target.value);
                setCurrentPage(1);
              }}
            />

            <Table
              columns={columns}
              data={records.data as unknown as Record<string, unknown>[]}
              emptyMessage="Tidak ada data rekam medis"
            />

            {records.totalPages > 1 && (
              <Pagination
                currentPage={records.page}
                totalPages={records.totalPages}
                onPageChange={handlePageChange}
                pageSize={PAGE_SIZE}
                totalItems={records.total}
              />
            )}
          </motion.div>
        )}

        {viewMode === 'form' && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <form onSubmit={handleSubmit} className="max-w-3xl space-y-4">
              <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
                <h2 className="text-lg font-semibold text-gray-700">
                  {editingRecordId ? 'Edit Rekam Medis' : 'Formulir Rekam Medis Baru'}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="ID Pasien"
                    name="patientId"
                    type="text"
                    value={formData.patientId}
                    onChange={handleFormChange}
                    error={formErrors.patientId}
                    required
                    disabled={!!editingRecordId}
                    placeholder="Contoh: patient-1"
                  />

                  <Input
                    label="Tanggal Kunjungan"
                    name="visitDate"
                    type="date"
                    value={formData.visitDate}
                    onChange={handleFormChange}
                    error={formErrors.visitDate}
                    required
                  />
                </div>

                {/* Keluhan */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="complaint" className="text-sm font-medium text-gray-700">
                    Keluhan<span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <textarea
                    id="complaint"
                    name="complaint"
                    value={formData.complaint}
                    onChange={handleFormChange}
                    maxLength={2000}
                    rows={4}
                    placeholder="Deskripsikan keluhan pasien..."
                    className={`w-full rounded-lg border px-3 py-2 text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                      formErrors.complaint
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                    }`}
                  />
                  <div className="flex justify-between">
                    {formErrors.complaint && (
                      <p className="text-xs text-red-600" role="alert">{formErrors.complaint}</p>
                    )}
                    <p className="text-xs text-gray-400 ml-auto">{formData.complaint.length}/2000</p>
                  </div>
                </div>

                {/* Diagnosis ICD-10 */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="diagnosisCode" className="text-sm font-medium text-gray-700">
                    Diagnosis ICD-10<span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <select
                    id="diagnosisCode"
                    name="diagnosisCode"
                    value={formData.diagnosisCode}
                    onChange={handleFormChange}
                    className={`w-full rounded-lg border px-3 py-2 text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                      formErrors.diagnosisCode
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                    }`}
                  >
                    <option value="">Pilih diagnosis...</option>
                    {ICD10_CODES.map((d) => (
                      <option key={d.code} value={d.code}>
                        {d.code} - {d.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.diagnosisCode && (
                    <p className="text-xs text-red-600" role="alert">{formErrors.diagnosisCode}</p>
                  )}
                </div>

                {/* Tindakan */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="treatment" className="text-sm font-medium text-gray-700">
                    Tindakan<span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <textarea
                    id="treatment"
                    name="treatment"
                    value={formData.treatment}
                    onChange={handleFormChange}
                    maxLength={2000}
                    rows={4}
                    placeholder="Deskripsikan tindakan yang dilakukan..."
                    className={`w-full rounded-lg border px-3 py-2 text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                      formErrors.treatment
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                    }`}
                  />
                  <div className="flex justify-between">
                    {formErrors.treatment && (
                      <p className="text-xs text-red-600" role="alert">{formErrors.treatment}</p>
                    )}
                    <p className="text-xs text-gray-400 ml-auto">{formData.treatment.length}/2000</p>
                  </div>
                </div>
              </div>

              {/* Prescriptions Section */}
              <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-md font-semibold text-gray-700">Resep Obat (Opsional)</h3>
                  <Button variant="outline" size="sm" onClick={addPrescription}>
                    <Plus size={14} className="mr-1" />
                    Tambah Obat
                  </Button>
                </div>

                {formData.prescriptions.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">
                    Belum ada resep obat. Klik tombol di atas untuk menambah.
                  </p>
                )}

                {formData.prescriptions.map((rx, idx) => (
                  <div key={idx} className="border border-gray-100 rounded-lg p-4 space-y-3 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Obat #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => removePrescription(idx)}
                        className="text-red-500 hover:text-red-700 p-1"
                        aria-label="Hapus obat"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-gray-600">Nama Obat</label>
                        <input
                          type="text"
                          value={rx.medicationName}
                          onChange={(e) => handlePrescriptionChange(idx, 'medicationName', e.target.value)}
                          placeholder="Nama obat"
                          className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-gray-600">Dosis</label>
                        <input
                          type="text"
                          value={rx.dosage}
                          onChange={(e) => handlePrescriptionChange(idx, 'dosage', e.target.value)}
                          placeholder="Contoh: 500mg"
                          className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-gray-600">Frekuensi</label>
                        <input
                          type="text"
                          value={rx.frequency}
                          onChange={(e) => handlePrescriptionChange(idx, 'frequency', e.target.value)}
                          placeholder="Contoh: 3x sehari"
                          className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-gray-600">Durasi</label>
                        <input
                          type="text"
                          value={rx.duration}
                          onChange={(e) => handlePrescriptionChange(idx, 'duration', e.target.value)}
                          placeholder="Contoh: 5 hari"
                          className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-gray-600">Jumlah</label>
                        <input
                          type="number"
                          min={0}
                          value={rx.quantity}
                          onChange={(e) => handlePrescriptionChange(idx, 'quantity', parseInt(e.target.value) || 0)}
                          placeholder="Jumlah"
                          className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Button type="submit">
                  {editingRecordId ? 'Simpan Perubahan' : 'Simpan Rekam Medis'}
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  Batal
                </Button>
              </div>
            </form>
          </motion.div>
        )}

        {viewMode === 'detail' && selectedRecord && (
          <motion.div
            key="detail"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="max-w-3xl space-y-4"
          >
            {/* Header */}
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    Detail Rekam Medis
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    ID: {selectedRecord.id}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {selectedRecord.status === 'final' ? (
                    <Badge variant="success">
                      <Lock size={12} className="mr-1" />
                      Final - Ditandatangani
                    </Badge>
                  ) : (
                    <Badge variant="warning">
                      <PenLine size={12} className="mr-1" />
                      Draft
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">ID Pasien:</span>
                  <p className="font-medium text-gray-800">{selectedRecord.patientId}</p>
                </div>
                <div>
                  <span className="text-gray-500">Tanggal Kunjungan:</span>
                  <p className="font-medium text-gray-800">{formatDate(selectedRecord.visitDate)}</p>
                </div>
                {selectedRecord.signedBy && (
                  <>
                    <div>
                      <span className="text-gray-500">Ditandatangani oleh:</span>
                      <p className="font-medium text-gray-800">{selectedRecord.signedBy}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Waktu tanda tangan:</span>
                      <p className="font-medium text-gray-800">
                        {selectedRecord.signedAt ? formatDateTime(selectedRecord.signedAt) : '-'}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Clinical Data */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
              <h3 className="font-semibold text-gray-700">Data Klinis</h3>

              <div>
                <span className="text-sm text-gray-500">Keluhan:</span>
                <p className="mt-1 text-sm text-gray-800 whitespace-pre-wrap">{selectedRecord.complaint}</p>
              </div>

              <div>
                <span className="text-sm text-gray-500">Diagnosis (ICD-10):</span>
                <p className="mt-1 text-sm text-gray-800 font-mono">
                  {selectedRecord.diagnosisCode} - {selectedRecord.diagnosisName}
                </p>
              </div>

              <div>
                <span className="text-sm text-gray-500">Tindakan:</span>
                <p className="mt-1 text-sm text-gray-800 whitespace-pre-wrap">{selectedRecord.treatment}</p>
              </div>
            </div>

            {/* Prescriptions */}
            {selectedRecord.prescriptions && selectedRecord.prescriptions.length > 0 && (
              <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-3">
                <h3 className="font-semibold text-gray-700">Resep Obat</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-2 text-gray-500 font-medium">Nama Obat</th>
                        <th className="text-left py-2 px-2 text-gray-500 font-medium">Dosis</th>
                        <th className="text-left py-2 px-2 text-gray-500 font-medium">Frekuensi</th>
                        <th className="text-left py-2 px-2 text-gray-500 font-medium">Durasi</th>
                        <th className="text-right py-2 px-2 text-gray-500 font-medium">Jumlah</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedRecord.prescriptions.map((rx, idx) => (
                        <tr key={idx} className="border-b border-gray-100">
                          <td className="py-2 px-2 text-gray-800">{rx.medicationName}</td>
                          <td className="py-2 px-2 text-gray-800">{rx.dosage}</td>
                          <td className="py-2 px-2 text-gray-800">{rx.frequency}</td>
                          <td className="py-2 px-2 text-gray-800">{rx.duration}</td>
                          <td className="py-2 px-2 text-gray-800 text-right">{rx.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 flex-wrap">
              <Button variant="outline" onClick={handleCancel}>
                Kembali
              </Button>
              {selectedRecord.status === 'draft' && (
                <>
                  <Button
                    variant="primary"
                    onClick={() => handleEditRecord(selectedRecord)}
                  >
                    <PenLine size={14} className="mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setRecordToSign(selectedRecord.id);
                      setShowSignModal(true);
                    }}
                  >
                    <Lock size={14} className="mr-1" />
                    Tanda Tangan Digital
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      setRecordToDelete(selectedRecord.id);
                      setShowDeleteModal(true);
                    }}
                  >
                    <Trash2 size={14} className="mr-1" />
                    Hapus
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                onClick={() => handleViewAuditTrail(selectedRecord)}
              >
                <Clock size={14} className="mr-1" />
                Audit Trail
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sign Confirmation Modal */}
      <Modal
        isOpen={showSignModal}
        onClose={() => {
          setShowSignModal(false);
          setRecordToSign(null);
        }}
        title="Konfirmasi Tanda Tangan Digital"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Apakah Anda yakin ingin menandatangani rekam medis ini? Setelah ditandatangani,
            rekam medis <strong>tidak dapat diedit</strong> lagi.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowSignModal(false);
                setRecordToSign(null);
              }}
            >
              Batal
            </Button>
            <Button size="sm" onClick={handleSignRecord}>
              <Lock size={14} className="mr-1" />
              Tanda Tangani
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setRecordToDelete(null);
        }}
        title="Konfirmasi Hapus"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Apakah Anda yakin ingin menghapus rekam medis ini? Tindakan ini tidak dapat dibatalkan.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowDeleteModal(false);
                setRecordToDelete(null);
              }}
            >
              Batal
            </Button>
            <Button variant="danger" size="sm" onClick={handleDeleteRecord}>
              <Trash2 size={14} className="mr-1" />
              Hapus
            </Button>
          </div>
        </div>
      </Modal>

      {/* Audit Trail Modal */}
      <Modal
        isOpen={showAuditModal}
        onClose={() => setShowAuditModal(false)}
        title="Audit Trail"
        size="lg"
      >
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {auditTrailData.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">Tidak ada data audit trail.</p>
          )}
          {auditTrailData.map((entry, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 border-b border-gray-100 pb-3 last:border-0"
            >
              <div className="shrink-0 mt-0.5">
                {entry.action === 'create' && (
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <Plus size={14} className="text-green-600" />
                  </div>
                )}
                {entry.action === 'update' && (
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <PenLine size={14} className="text-blue-600" />
                  </div>
                )}
                {entry.action === 'sign' && (
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <Lock size={14} className="text-purple-600" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-800">
                    {entry.action === 'create' && 'Dibuat'}
                    {entry.action === 'update' && 'Diperbarui'}
                    {entry.action === 'sign' && 'Ditandatangani'}
                  </span>
                  <Badge variant="neutral" size="sm">
                    {entry.action}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                  <User size={12} />
                  <span>{entry.userName}</span>
                  <span>•</span>
                  <Clock size={12} />
                  <span>{formatDateTime(entry.timestamp)}</span>
                </div>
                {entry.changes && Object.keys(entry.changes).length > 0 && (
                  <div className="mt-2 space-y-1">
                    {Object.entries(entry.changes).map(([field, change]) => (
                      <div key={field} className="text-xs bg-gray-50 rounded p-2">
                        <span className="font-medium text-gray-600">{field}:</span>
                        <div className="mt-0.5">
                          <span className="text-red-600 line-through">{change.from.substring(0, 100)}</span>
                          <span className="mx-1">→</span>
                          <span className="text-green-600">{change.to.substring(0, 100)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}

export { RMEPage as RME };
