import { storageService } from '../storageService';
import { generateId } from '@/utils/formatters';
import type { BillingItem } from '@/types/modules';
import type { PaginatedResult } from '@/types/common';

const STORAGE_KEY = 'billing_items';

function getAllItems(): BillingItem[] {
  return storageService.get<BillingItem[]>(STORAGE_KEY) || [];
}

function saveItems(items: BillingItem[]): void {
  storageService.set(STORAGE_KEY, items);
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
  const existing = getAllItems();
  if (existing.length > 0) return;

  const now = new Date().toISOString();
  const seeds: BillingItem[] = [
    { id: generateId(), patientId: 'patient-1', visitId: 'visit-1', itemName: 'Konsultasi Dokter Umum', category: 'layanan', quantity: 1, unitPrice: 150000, subtotal: 150000, tariffFound: true, createdAt: now },
    { id: generateId(), patientId: 'patient-1', visitId: 'visit-1', itemName: 'Paracetamol 500mg', category: 'obat', quantity: 10, unitPrice: 2500, subtotal: 25000, tariffFound: true, createdAt: now },
    { id: generateId(), patientId: 'patient-1', visitId: 'visit-1', itemName: 'Infus RL', category: 'obat', quantity: 2, unitPrice: 35000, subtotal: 70000, tariffFound: true, createdAt: now },
    { id: generateId(), patientId: 'patient-2', visitId: 'visit-2', itemName: 'Konsultasi Dokter Spesialis', category: 'layanan', quantity: 1, unitPrice: 300000, subtotal: 300000, tariffFound: true, createdAt: now },
    { id: generateId(), patientId: 'patient-2', visitId: 'visit-2', itemName: 'Rontgen Thorax', category: 'tindakan', quantity: 1, unitPrice: 250000, subtotal: 250000, tariffFound: true, createdAt: now },
    { id: generateId(), patientId: 'patient-2', visitId: 'visit-2', itemName: 'Obat Racikan Khusus', category: 'obat', quantity: 1, unitPrice: 0, subtotal: 0, tariffFound: false, createdAt: now },
    { id: generateId(), patientId: 'patient-3', visitId: 'visit-3', itemName: 'Rawat Inap Kelas 2', category: 'kamar', quantity: 3, unitPrice: 500000, subtotal: 1500000, tariffFound: true, createdAt: now },
    { id: generateId(), patientId: 'patient-3', visitId: 'visit-3', itemName: 'Operasi Appendectomy', category: 'tindakan', quantity: 1, unitPrice: 8000000, subtotal: 8000000, tariffFound: true, createdAt: now },
    { id: generateId(), patientId: 'patient-3', visitId: 'visit-3', itemName: 'Terapi Oksigen', category: 'tindakan', quantity: 2, unitPrice: 0, subtotal: 0, tariffFound: false, createdAt: now },
    { id: generateId(), patientId: 'patient-4', visitId: 'visit-4', itemName: 'Konsultasi Dokter Anak', category: 'layanan', quantity: 1, unitPrice: 200000, subtotal: 200000, tariffFound: true, createdAt: now },
    { id: generateId(), patientId: 'patient-4', visitId: 'visit-4', itemName: 'Amoxicillin Sirup', category: 'obat', quantity: 1, unitPrice: 45000, subtotal: 45000, tariffFound: true, createdAt: now },
  ];

  // Also seed patient name mapping
  const patientNames: Record<string, string> = {
    'patient-1': 'Ahmad Sudirman',
    'patient-2': 'Siti Rahayu',
    'patient-3': 'Budi Santoso',
    'patient-4': 'Dewi Lestari',
  };
  storageService.set('billing_patient_names', patientNames);

  saveItems(seeds);
}

export function getPatientNames(): Record<string, string> {
  return storageService.get<Record<string, string>>('billing_patient_names') || {};
}

export function setPatientName(patientId: string, name: string): void {
  const names = getPatientNames();
  names[patientId] = name;
  storageService.set('billing_patient_names', names);
}

export interface PatientBillingSummary {
  patientId: string;
  patientName: string;
  totalItems: number;
  totalAmount: number;
  hasWarnings: boolean;
}

export function getAll(): BillingItem[] {
  initializeSeedData();
  return getAllItems();
}

export function getPatientList(page: number = 1, pageSize: number = 20, search?: string): PaginatedResult<PatientBillingSummary> {
  initializeSeedData();
  const items = getAllItems();
  const names = getPatientNames();

  // Group by patient
  const patientMap = new Map<string, BillingItem[]>();
  items.forEach(item => {
    const list = patientMap.get(item.patientId) || [];
    list.push(item);
    patientMap.set(item.patientId, list);
  });

  let summaries: PatientBillingSummary[] = Array.from(patientMap.entries()).map(([patientId, patientItems]) => ({
    patientId,
    patientName: names[patientId] || patientId,
    totalItems: patientItems.length,
    totalAmount: calculateTotal(patientItems),
    hasWarnings: patientItems.some(i => !i.tariffFound),
  }));

  if (search && search.trim().length >= 2) {
    const q = search.trim().toLowerCase();
    summaries = summaries.filter(s => s.patientName.toLowerCase().includes(q) || s.patientId.toLowerCase().includes(q));
  }

  return paginate(summaries, page, pageSize);
}

export function getByVisit(visitId: string): BillingItem[] {
  initializeSeedData();
  return getAllItems().filter((item) => item.visitId === visitId);
}

export function getByPatient(patientId: string): BillingItem[] {
  initializeSeedData();
  return getAllItems().filter((item) => item.patientId === patientId);
}

export function calculateTotal(items: BillingItem[]): number {
  return items
    .filter((item) => item.tariffFound)
    .reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}

export function addItem(data: {
  patientId: string;
  patientName?: string;
  visitId: string;
  itemName: string;
  category: BillingItem['category'];
  quantity: number;
  unitPrice: number;
  tariffFound?: boolean;
}): BillingItem {
  initializeSeedData();
  const items = getAllItems();
  const now = new Date().toISOString();

  if (data.patientName) {
    setPatientName(data.patientId, data.patientName);
  }

  const newItem: BillingItem = {
    id: generateId(),
    patientId: data.patientId,
    visitId: data.visitId,
    itemName: data.itemName,
    category: data.category,
    quantity: data.quantity,
    unitPrice: data.unitPrice,
    subtotal: data.quantity * data.unitPrice,
    tariffFound: data.tariffFound !== undefined ? data.tariffFound : data.unitPrice > 0,
    createdAt: now,
  };

  items.push(newItem);
  saveItems(items);
  return newItem;
}

export function removeItem(id: string): void {
  initializeSeedData();
  const items = getAllItems();
  const filtered = items.filter((item) => item.id !== id);
  if (filtered.length === items.length) throw new Error(`Billing item with id ${id} not found`);
  saveItems(filtered);
}

export const billingService = {
  getAll,
  getPatientList,
  getByVisit,
  getByPatient,
  calculateTotal,
  addItem,
  removeItem,
  getPatientNames,
  setPatientName,
  initializeSeedData,
};

export default billingService;
