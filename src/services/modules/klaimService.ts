import { storageService } from '../storageService';
import { generateId } from '@/utils/formatters';
import type { Claim } from '@/types/modules';
import type { PaginatedResult } from '@/types/common';

const STORAGE_KEY = 'claims';

export interface ClaimStatusHistory {
  claimId: string;
  status: Claim['status'];
  changedAt: string;
  changedBy: string;
  notes?: string;
}

const HISTORY_KEY = 'claim_status_history';

function getAllClaims(): Claim[] {
  return storageService.get<Claim[]>(STORAGE_KEY) || [];
}

function saveClaims(claims: Claim[]): void {
  storageService.set(STORAGE_KEY, claims);
}

function getAllHistory(): ClaimStatusHistory[] {
  return storageService.get<ClaimStatusHistory[]>(HISTORY_KEY) || [];
}

function saveHistory(history: ClaimStatusHistory[]): void {
  storageService.set(HISTORY_KEY, history);
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
  const existing = getAllClaims();
  if (existing.length > 0) return;

  const now = new Date().toISOString();
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();

  const seeds: Claim[] = [
    {
      id: generateId(),
      patientId: 'patient-1',
      patientName: 'Ahmad Sudirman',
      memberNumber: 'BPJS001234567',
      diagnosis: 'Demam Berdarah Dengue',
      treatment: 'Rawat Inap 5 hari, infus, pemeriksaan darah',
      documents: [
        { id: generateId(), fileName: 'surat_rujukan.pdf', fileSize: 1200000, fileType: 'application/pdf', uploadedAt: oneWeekAgo },
        { id: generateId(), fileName: 'hasil_lab.pdf', fileSize: 800000, fileType: 'application/pdf', uploadedAt: oneWeekAgo },
      ],
      status: 'disetujui',
      submittedAt: oneWeekAgo,
      updatedAt: twoDaysAgo,
    },
    {
      id: generateId(),
      patientId: 'patient-2',
      patientName: 'Siti Rahayu',
      memberNumber: 'BPJS009876543',
      diagnosis: 'Appendisitis Akut',
      treatment: 'Operasi Appendectomy',
      documents: [
        { id: generateId(), fileName: 'resume_medis.pdf', fileSize: 2500000, fileType: 'application/pdf', uploadedAt: twoDaysAgo },
      ],
      status: 'diproses',
      submittedAt: twoDaysAgo,
      updatedAt: twoDaysAgo,
    },
    {
      id: generateId(),
      patientId: 'patient-4',
      patientName: 'Dewi Lestari',
      memberNumber: 'BPJS005551234',
      diagnosis: 'Bronkopneumonia',
      treatment: 'Rawat Inap, Antibiotik IV, Nebulizer',
      documents: [
        { id: generateId(), fileName: 'surat_rujukan.pdf', fileSize: 1000000, fileType: 'application/pdf', uploadedAt: now },
        { id: generateId(), fileName: 'foto_rontgen.jpg', fileSize: 3500000, fileType: 'image/jpeg', uploadedAt: now },
        { id: generateId(), fileName: 'hasil_lab.pdf', fileSize: 900000, fileType: 'application/pdf', uploadedAt: now },
      ],
      status: 'diajukan',
      submittedAt: now,
      updatedAt: now,
    },
  ];

  saveClaims(seeds);

  // Seed history
  const history: ClaimStatusHistory[] = [
    { claimId: seeds[0].id, status: 'diajukan', changedAt: oneWeekAgo, changedBy: 'System' },
    { claimId: seeds[0].id, status: 'diproses', changedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), changedBy: 'Admin Klaim' },
    { claimId: seeds[0].id, status: 'disetujui', changedAt: twoDaysAgo, changedBy: 'Admin Klaim' },
    { claimId: seeds[1].id, status: 'diajukan', changedAt: twoDaysAgo, changedBy: 'System' },
    { claimId: seeds[1].id, status: 'diproses', changedAt: twoDaysAgo, changedBy: 'Admin Klaim' },
    { claimId: seeds[2].id, status: 'diajukan', changedAt: now, changedBy: 'System' },
  ];
  saveHistory(history);
}

export function getAll(
  page: number = 1,
  pageSize: number = 20,
  filters?: { status?: Claim['status']; startDate?: string; endDate?: string; search?: string }
): PaginatedResult<Claim> {
  initializeSeedData();
  let claims = getAllClaims();

  if (filters) {
    if (filters.status) {
      claims = claims.filter(c => c.status === filters.status);
    }
    if (filters.startDate) {
      claims = claims.filter(c => c.submittedAt >= filters.startDate!);
    }
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      claims = claims.filter(c => new Date(c.submittedAt) <= endDate);
    }
    if (filters.search && filters.search.trim().length >= 2) {
      const q = filters.search.trim().toLowerCase();
      claims = claims.filter(c =>
        c.patientName.toLowerCase().includes(q) ||
        c.memberNumber.toLowerCase().includes(q)
      );
    }
  }

  claims.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  return paginate(claims, page, pageSize);
}

export function getById(id: string): Claim | null {
  initializeSeedData();
  const claims = getAllClaims();
  return claims.find(c => c.id === id) || null;
}

export function getStatusHistory(claimId: string): ClaimStatusHistory[] {
  initializeSeedData();
  return getAllHistory().filter(h => h.claimId === claimId).sort((a, b) => new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime());
}

export function create(data: {
  patientId: string;
  patientName: string;
  memberNumber: string;
  diagnosis: string;
  treatment: string;
  documents: { fileName: string; fileSize: number; fileType: string }[];
  submittedBy: string;
}): Claim {
  initializeSeedData();

  if (data.documents.length < 1 || data.documents.length > 10) {
    throw new Error('Jumlah dokumen harus antara 1-10 file');
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  for (const doc of data.documents) {
    if (doc.fileSize > maxSize) {
      throw new Error(`File ${doc.fileName} melebihi batas ukuran 5MB`);
    }
  }

  const now = new Date().toISOString();
  const claims = getAllClaims();

  const newClaim: Claim = {
    id: generateId(),
    patientId: data.patientId,
    patientName: data.patientName,
    memberNumber: data.memberNumber,
    diagnosis: data.diagnosis,
    treatment: data.treatment,
    documents: data.documents.map(d => ({
      id: generateId(),
      fileName: d.fileName,
      fileSize: d.fileSize,
      fileType: d.fileType,
      uploadedAt: now,
    })),
    status: 'diajukan',
    submittedAt: now,
    updatedAt: now,
  };

  claims.push(newClaim);
  saveClaims(claims);

  // Add history entry
  const history = getAllHistory();
  history.push({
    claimId: newClaim.id,
    status: 'diajukan',
    changedAt: now,
    changedBy: data.submittedBy,
  });
  saveHistory(history);

  return newClaim;
}

export function updateStatus(id: string, newStatus: Claim['status'], changedBy: string, notes?: string): Claim {
  initializeSeedData();
  const claims = getAllClaims();
  const index = claims.findIndex(c => c.id === id);

  if (index === -1) throw new Error('Klaim tidak ditemukan');

  const claim = claims[index];

  // Validate status transitions
  const validTransitions: Record<string, string[]> = {
    diajukan: ['diproses'],
    diproses: ['disetujui', 'ditolak'],
    disetujui: [],
    ditolak: [],
  };

  if (!validTransitions[claim.status]?.includes(newStatus)) {
    throw new Error(`Tidak dapat mengubah status dari "${claim.status}" ke "${newStatus}"`);
  }

  const now = new Date().toISOString();
  claims[index] = { ...claim, status: newStatus, updatedAt: now };
  saveClaims(claims);

  // Add history
  const history = getAllHistory();
  history.push({ claimId: id, status: newStatus, changedAt: now, changedBy, notes });
  saveHistory(history);

  return claims[index];
}

export const klaimService = {
  getAll,
  getById,
  getStatusHistory,
  create,
  updateStatus,
  initializeSeedData,
};

export default klaimService;
