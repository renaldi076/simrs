import { storageService } from '../storageService';
import { generateId } from '@/utils/formatters';
import type { Patient } from '@/types/modules';
import type { PaginatedResult } from '@/types/common';

const STORAGE_KEY = 'patients';

const SEED_PATIENTS: Omit<Patient, 'id' | 'medicalRecordNumber' | 'createdAt' | 'updatedAt'>[] = [
  { fullName: 'Ahmad Sudirman', dateOfBirth: '1985-03-15', gender: 'Laki-laki', address: 'Jl. Merdeka No. 10, Jakarta', phoneNumber: '081234567890', guarantorType: 'bpjs' },
  { fullName: 'Siti Rahayu', dateOfBirth: '1990-07-22', gender: 'Perempuan', address: 'Jl. Pahlawan No. 5, Bandung', phoneNumber: '082345678901', guarantorType: 'umum' },
  { fullName: 'Budi Santoso', dateOfBirth: '1978-11-03', gender: 'Laki-laki', address: 'Jl. Sudirman No. 20, Surabaya', phoneNumber: '083456789012', guarantorType: 'asuransi' },
  { fullName: 'Dewi Lestari', dateOfBirth: '1995-01-30', gender: 'Perempuan', address: 'Jl. Gatot Subroto No. 8, Yogyakarta', phoneNumber: '084567890123', guarantorType: 'bpjs' },
  { fullName: 'Eko Prasetyo', dateOfBirth: '1982-09-12', gender: 'Laki-laki', address: 'Jl. Diponegoro No. 15, Semarang', phoneNumber: '085678901234', guarantorType: 'umum' },
];

function getAllPatients(): Patient[] {
  return storageService.get<Patient[]>(STORAGE_KEY) || [];
}

function savePatients(patients: Patient[]): void {
  storageService.set(STORAGE_KEY, patients);
}

function paginate<T>(items: T[], page: number, pageSize: number): PaginatedResult<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  const data = items.slice(start, start + pageSize);

  return { data, total, page: safePage, pageSize, totalPages };
}

export function initializePatients(): void {
  const existing = getAllPatients();
  if (existing.length > 0) return;

  const now = new Date().toISOString();
  const patients: Patient[] = SEED_PATIENTS.map((seed, index) => ({
    ...seed,
    id: generateId(),
    medicalRecordNumber: `RM${String(index + 1).padStart(6, '0')}`,
    createdAt: now,
    updatedAt: now,
  }));

  savePatients(patients);
}

export function getAll(page: number = 1, pageSize: number = 50, searchQuery?: string): PaginatedResult<Patient> {
  let patients = getAllPatients();

  if (searchQuery && searchQuery.trim().length >= 3) {
    const query = searchQuery.trim().toLowerCase();
    patients = patients.filter(
      (p) =>
        p.fullName.toLowerCase().includes(query) ||
        p.medicalRecordNumber.toLowerCase().includes(query)
    );
  }

  return paginate(patients, page, pageSize);
}

export function getById(id: string): Patient | null {
  const patients = getAllPatients();
  return patients.find((p) => p.id === id) || null;
}

export function search(query: string, page: number = 1, pageSize: number = 50): PaginatedResult<Patient> {
  if (query.trim().length < 3) {
    return { data: [], total: 0, page: 1, pageSize, totalPages: 0 };
  }

  const lowerQuery = query.trim().toLowerCase();
  const patients = getAllPatients().filter(
    (p) =>
      p.fullName.toLowerCase().includes(lowerQuery) ||
      p.medicalRecordNumber.toLowerCase().includes(lowerQuery)
  );

  return paginate(patients, page, pageSize);
}

export function getNextMedicalRecordNumber(): string {
  const patients = getAllPatients();
  const maxNum = patients.reduce((max, p) => {
    const num = parseInt(p.medicalRecordNumber.replace('RM', ''), 10);
    return isNaN(num) ? max : Math.max(max, num);
  }, 0);
  return `RM${String(maxNum + 1).padStart(6, '0')}`;
}

export function create(data: Omit<Patient, 'id' | 'medicalRecordNumber' | 'createdAt' | 'updatedAt'>): Patient {
  const patients = getAllPatients();
  const now = new Date().toISOString();

  const newPatient: Patient = {
    ...data,
    id: generateId(),
    medicalRecordNumber: getNextMedicalRecordNumber(),
    createdAt: now,
    updatedAt: now,
  };

  patients.push(newPatient);
  savePatients(patients);
  return newPatient;
}

export function update(id: string, data: Partial<Omit<Patient, 'id' | 'medicalRecordNumber' | 'createdAt'>>): Patient {
  const patients = getAllPatients();
  const index = patients.findIndex((p) => p.id === id);

  if (index === -1) {
    throw new Error(`Patient with id ${id} not found`);
  }

  const updatedPatient: Patient = {
    ...patients[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };

  patients[index] = updatedPatient;
  savePatients(patients);
  return updatedPatient;
}

export const admissionService = {
  initializePatients,
  getAll,
  getById,
  search,
  create,
  update,
  getNextMedicalRecordNumber,
};

export default admissionService;
