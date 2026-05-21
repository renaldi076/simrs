import { storageService } from '../storageService';
import { generateId } from '@/utils/formatters';
import type { MedicalRecord, AuditEntry } from '@/types/modules';
import type { PaginatedResult } from '@/types/common';

const STORAGE_KEY = 'medical_records';

function getAllRecords(): MedicalRecord[] {
  return storageService.get<MedicalRecord[]>(STORAGE_KEY) || [];
}

function saveRecords(records: MedicalRecord[]): void {
  storageService.set(STORAGE_KEY, records);
}

function paginate<T>(items: T[], page: number, pageSize: number): PaginatedResult<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  const data = items.slice(start, start + pageSize);
  return { data, total, page: safePage, pageSize, totalPages };
}

function initializeSeedData(): void {
  const existing = getAllRecords();
  if (existing.length > 0) return;

  const seeds: MedicalRecord[] = [
    {
      id: generateId(),
      patientId: 'patient-1',
      visitDate: '2024-03-15',
      complaint: 'Demam tinggi selama 3 hari, disertai nyeri kepala dan mual.',
      diagnosisCode: 'A90',
      diagnosisName: 'Dengue Fever',
      treatment: 'Pemberian cairan infus RL, paracetamol 3x500mg, observasi trombosit.',
      prescriptions: [
        { medicationName: 'Paracetamol', dosage: '500mg', frequency: '3x sehari', duration: '5 hari', quantity: 15 },
        { medicationName: 'Domperidone', dosage: '10mg', frequency: '3x sehari', duration: '3 hari', quantity: 9 },
      ],
      status: 'final',
      signedBy: 'Dr. Andi',
      signedAt: '2024-03-15T14:00:00.000Z',
      createdBy: 'dr-andi',
      createdAt: '2024-03-15T10:00:00.000Z',
      updatedAt: '2024-03-15T14:00:00.000Z',
      auditTrail: [
        { timestamp: '2024-03-15T10:00:00.000Z', userId: 'dr-andi', userName: 'Dr. Andi', action: 'create' },
        { timestamp: '2024-03-15T14:00:00.000Z', userId: 'dr-andi', userName: 'Dr. Andi', action: 'sign' },
      ],
    },
    {
      id: generateId(),
      patientId: 'patient-2',
      visitDate: '2024-03-20',
      complaint: 'Batuk berdahak selama 1 minggu, sesak nafas ringan.',
      diagnosisCode: 'J06.9',
      diagnosisName: 'Acute Upper Respiratory Infection, Unspecified',
      treatment: 'Ambroxol 3x30mg, Cetirizine 1x10mg, istirahat cukup.',
      prescriptions: [
        { medicationName: 'Ambroxol', dosage: '30mg', frequency: '3x sehari', duration: '5 hari', quantity: 15 },
        { medicationName: 'Cetirizine', dosage: '10mg', frequency: '1x sehari', duration: '5 hari', quantity: 5 },
      ],
      status: 'draft',
      createdBy: 'dr-budi',
      createdAt: '2024-03-20T09:00:00.000Z',
      updatedAt: '2024-03-20T09:00:00.000Z',
      auditTrail: [
        { timestamp: '2024-03-20T09:00:00.000Z', userId: 'dr-budi', userName: 'Dr. Budi', action: 'create' },
      ],
    },
    {
      id: generateId(),
      patientId: 'patient-3',
      visitDate: '2024-03-22',
      complaint: 'Nyeri perut bagian bawah kanan, mual muntah, demam ringan.',
      diagnosisCode: 'K35.9',
      diagnosisName: 'Acute Appendicitis, Unspecified',
      treatment: 'Rujuk bedah, puasa, infus RL, antibiotik Ceftriaxone 1g IV.',
      status: 'final',
      signedBy: 'Dr. Andi',
      signedAt: '2024-03-22T16:00:00.000Z',
      createdBy: 'dr-andi',
      createdAt: '2024-03-22T11:00:00.000Z',
      updatedAt: '2024-03-22T16:00:00.000Z',
      auditTrail: [
        { timestamp: '2024-03-22T11:00:00.000Z', userId: 'dr-andi', userName: 'Dr. Andi', action: 'create' },
        { timestamp: '2024-03-22T16:00:00.000Z', userId: 'dr-andi', userName: 'Dr. Andi', action: 'sign' },
      ],
    },
    {
      id: generateId(),
      patientId: 'patient-1',
      visitDate: '2024-04-05',
      complaint: 'Kontrol pasca demam berdarah, lemas, nafsu makan menurun.',
      diagnosisCode: 'Z09',
      diagnosisName: 'Follow-up Examination After Treatment',
      treatment: 'Multivitamin, edukasi gizi, kontrol 1 minggu lagi.',
      prescriptions: [
        { medicationName: 'Multivitamin', dosage: '1 tablet', frequency: '1x sehari', duration: '14 hari', quantity: 14 },
      ],
      status: 'final',
      signedBy: 'Dr. Budi',
      signedAt: '2024-04-05T11:30:00.000Z',
      createdBy: 'dr-budi',
      createdAt: '2024-04-05T10:00:00.000Z',
      updatedAt: '2024-04-05T11:30:00.000Z',
      auditTrail: [
        { timestamp: '2024-04-05T10:00:00.000Z', userId: 'dr-budi', userName: 'Dr. Budi', action: 'create' },
        { timestamp: '2024-04-05T11:30:00.000Z', userId: 'dr-budi', userName: 'Dr. Budi', action: 'sign' },
      ],
    },
    {
      id: generateId(),
      patientId: 'patient-2',
      visitDate: '2024-04-10',
      complaint: 'Nyeri kepala berulang sejak 2 minggu, terutama sore hari.',
      diagnosisCode: 'G43.9',
      diagnosisName: 'Migraine, Unspecified',
      treatment: 'Paracetamol 500mg jika nyeri, hindari trigger, rujuk neurologi jika berulang.',
      prescriptions: [
        { medicationName: 'Paracetamol', dosage: '500mg', frequency: 'Jika nyeri (maks 3x/hari)', duration: '7 hari', quantity: 21 },
      ],
      status: 'draft',
      createdBy: 'dr-andi',
      createdAt: '2024-04-10T14:00:00.000Z',
      updatedAt: '2024-04-10T14:00:00.000Z',
      auditTrail: [
        { timestamp: '2024-04-10T14:00:00.000Z', userId: 'dr-andi', userName: 'Dr. Andi', action: 'create' },
      ],
    },
  ];

  saveRecords(seeds);
}

export function getAll(patientId?: string, page: number = 1, pageSize: number = 20): PaginatedResult<MedicalRecord> {
  initializeSeedData();
  let records = getAllRecords();
  if (patientId) {
    records = records.filter((r) => r.patientId === patientId);
  }
  // Sort by visitDate descending (newest first)
  records.sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());
  return paginate(records, page, pageSize);
}

export function getById(id: string): MedicalRecord | null {
  initializeSeedData();
  const records = getAllRecords();
  return records.find((r) => r.id === id) || null;
}

export function create(data: {
  patientId: string;
  visitDate: string;
  complaint: string;
  diagnosisCode: string;
  diagnosisName: string;
  treatment: string;
  prescriptions?: MedicalRecord['prescriptions'];
  createdBy: string;
  createdByName: string;
}): MedicalRecord {
  initializeSeedData();
  const records = getAllRecords();
  const now = new Date().toISOString();

  const auditEntry: AuditEntry = {
    timestamp: now,
    userId: data.createdBy,
    userName: data.createdByName,
    action: 'create',
  };

  const newRecord: MedicalRecord = {
    id: generateId(),
    patientId: data.patientId,
    visitDate: data.visitDate,
    complaint: data.complaint,
    diagnosisCode: data.diagnosisCode,
    diagnosisName: data.diagnosisName,
    treatment: data.treatment,
    prescriptions: data.prescriptions,
    status: 'draft',
    createdBy: data.createdBy,
    createdAt: now,
    updatedAt: now,
    auditTrail: [auditEntry],
  };

  records.push(newRecord);
  saveRecords(records);
  return newRecord;
}

export function update(id: string, data: {
  complaint?: string;
  diagnosisCode?: string;
  diagnosisName?: string;
  treatment?: string;
  prescriptions?: MedicalRecord['prescriptions'];
  updatedBy: string;
  updatedByName: string;
}): MedicalRecord {
  initializeSeedData();
  const records = getAllRecords();
  const index = records.findIndex((r) => r.id === id);

  if (index === -1) throw new Error(`Medical record with id ${id} not found`);
  if (records[index].status === 'final') throw new Error('Cannot edit a signed medical record');

  const existing = records[index];
  const now = new Date().toISOString();

  // Track changes for audit trail
  const changes: Record<string, { from: string; to: string }> = {};
  if (data.complaint !== undefined && data.complaint !== existing.complaint) {
    changes['complaint'] = { from: existing.complaint, to: data.complaint };
  }
  if (data.diagnosisCode !== undefined && data.diagnosisCode !== existing.diagnosisCode) {
    changes['diagnosisCode'] = { from: `${existing.diagnosisCode} - ${existing.diagnosisName}`, to: `${data.diagnosisCode} - ${data.diagnosisName || existing.diagnosisName}` };
  }
  if (data.treatment !== undefined && data.treatment !== existing.treatment) {
    changes['treatment'] = { from: existing.treatment, to: data.treatment };
  }

  const auditEntry: AuditEntry = {
    timestamp: now,
    userId: data.updatedBy,
    userName: data.updatedByName,
    action: 'update',
    changes: Object.keys(changes).length > 0 ? changes : undefined,
  };

  const updated: MedicalRecord = {
    ...existing,
    complaint: data.complaint ?? existing.complaint,
    diagnosisCode: data.diagnosisCode ?? existing.diagnosisCode,
    diagnosisName: data.diagnosisName ?? existing.diagnosisName,
    treatment: data.treatment ?? existing.treatment,
    prescriptions: data.prescriptions ?? existing.prescriptions,
    updatedAt: now,
    auditTrail: [...existing.auditTrail, auditEntry],
  };

  records[index] = updated;
  saveRecords(records);
  return updated;
}

export function sign(id: string, userId: string, userName: string): MedicalRecord {
  initializeSeedData();
  const records = getAllRecords();
  const index = records.findIndex((r) => r.id === id);

  if (index === -1) throw new Error(`Medical record with id ${id} not found`);
  if (records[index].status === 'final') throw new Error('Record is already signed');

  const now = new Date().toISOString();
  const auditEntry: AuditEntry = {
    timestamp: now,
    userId,
    userName,
    action: 'sign',
  };

  const signed: MedicalRecord = {
    ...records[index],
    status: 'final',
    signedBy: userName,
    signedAt: now,
    updatedAt: now,
    auditTrail: [...records[index].auditTrail, auditEntry],
  };

  records[index] = signed;
  saveRecords(records);
  return signed;
}

export function deleteRecord(id: string): void {
  initializeSeedData();
  const records = getAllRecords();
  const index = records.findIndex((r) => r.id === id);

  if (index === -1) throw new Error(`Medical record with id ${id} not found`);
  if (records[index].status === 'final') throw new Error('Cannot delete a signed medical record');

  records.splice(index, 1);
  saveRecords(records);
}

export const rmeService = {
  getAll,
  getById,
  create,
  update,
  sign,
  deleteRecord,
};

export default rmeService;
