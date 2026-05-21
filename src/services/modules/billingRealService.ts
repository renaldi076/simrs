import { storageService } from '../storageService';
import { generateId } from '@/utils/formatters';

export interface InpatientBilling {
  id: string;
  patientId: string;
  patientName: string;
  medicalRecordNumber: string;
  roomName: string;
  roomClass: string;
  admissionDate: string;
  guarantorType: 'umum' | 'bpjs' | 'asuransi';
  totalCost: number;
  lastUpdated: string;
}

const STORAGE_KEY = 'billing_real_inpatients';

function getAllInpatients(): InpatientBilling[] {
  return storageService.get<InpatientBilling[]>(STORAGE_KEY) || [];
}

function saveInpatients(data: InpatientBilling[]): void {
  storageService.set(STORAGE_KEY, data);
}

function initializeSeedData(): void {
  const existing = getAllInpatients();
  if (existing.length > 0) return;

  const rooms = [
    { name: 'Melati 101', class: 'Kelas 1' },
    { name: 'Melati 102', class: 'Kelas 1' },
    { name: 'Anggrek 201', class: 'Kelas 2' },
    { name: 'Anggrek 202', class: 'Kelas 2' },
    { name: 'Dahlia 301', class: 'Kelas 3' },
    { name: 'Dahlia 302', class: 'Kelas 3' },
    { name: 'VIP 01', class: 'VIP' },
    { name: 'VIP 02', class: 'VIP' },
  ];

  const patients = [
    { name: 'Ahmad Sudirman', rm: 'RM000001', guarantor: 'bpjs' as const },
    { name: 'Siti Rahayu', rm: 'RM000002', guarantor: 'umum' as const },
    { name: 'Budi Santoso', rm: 'RM000003', guarantor: 'asuransi' as const },
    { name: 'Dewi Lestari', rm: 'RM000004', guarantor: 'bpjs' as const },
    { name: 'Eko Prasetyo', rm: 'RM000005', guarantor: 'umum' as const },
    { name: 'Fatimah Zahra', rm: 'RM000006', guarantor: 'bpjs' as const },
    { name: 'Gunawan Putra', rm: 'RM000007', guarantor: 'asuransi' as const },
    { name: 'Hani Rahmawati', rm: 'RM000008', guarantor: 'umum' as const },
  ];

  const now = new Date();
  const seeds: InpatientBilling[] = patients.map((patient, idx) => {
    const admitDaysAgo = Math.floor(Math.random() * 7) + 1;
    const admissionDate = new Date(now.getTime() - admitDaysAgo * 24 * 60 * 60 * 1000);
    const baseCost = (admitDaysAgo * 500000) + Math.floor(Math.random() * 5000000);

    return {
      id: generateId(),
      patientId: `patient-${idx + 1}`,
      patientName: patient.name,
      medicalRecordNumber: patient.rm,
      roomName: rooms[idx % rooms.length].name,
      roomClass: rooms[idx % rooms.length].class,
      admissionDate: admissionDate.toISOString(),
      guarantorType: patient.guarantor,
      totalCost: baseCost,
      lastUpdated: now.toISOString(),
    };
  });

  saveInpatients(seeds);
}

export function getInpatients(filters?: {
  room?: string;
  startDate?: string;
  endDate?: string;
  guarantorType?: string;
}): InpatientBilling[] {
  initializeSeedData();
  let data = getAllInpatients();

  if (filters) {
    if (filters.room) {
      data = data.filter(d => d.roomName.toLowerCase().includes(filters.room!.toLowerCase()) || d.roomClass.toLowerCase().includes(filters.room!.toLowerCase()));
    }
    if (filters.startDate) {
      data = data.filter(d => d.admissionDate >= filters.startDate!);
    }
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      data = data.filter(d => new Date(d.admissionDate) <= endDate);
    }
    if (filters.guarantorType) {
      data = data.filter(d => d.guarantorType === filters.guarantorType);
    }
  }

  // Sort by most recent admission
  data.sort((a, b) => new Date(b.admissionDate).getTime() - new Date(a.admissionDate).getTime());

  return data;
}

export function refreshCosts(): InpatientBilling[] {
  initializeSeedData();
  const inpatients = getAllInpatients();
  const now = new Date().toISOString();

  // Simulate cost increases
  const updated = inpatients.map(patient => {
    const increment = Math.floor(Math.random() * 100000) + 10000;
    return {
      ...patient,
      totalCost: patient.totalCost + increment,
      lastUpdated: now,
    };
  });

  saveInpatients(updated);
  return updated;
}

export function getRoomList(): string[] {
  initializeSeedData();
  const inpatients = getAllInpatients();
  const rooms = new Set(inpatients.map(p => p.roomClass));
  return Array.from(rooms).sort();
}

export const billingRealService = {
  getInpatients,
  refreshCosts,
  getRoomList,
  initializeSeedData,
};

export default billingRealService;
