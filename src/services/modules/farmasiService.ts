import { storageService } from '../storageService';
import { generateId } from '@/utils/formatters';
import type { Medication, DispenseItem } from '@/types/modules';
import type { PaginatedResult } from '@/types/common';

const STORAGE_KEY = 'medicines';
const DISPENSE_KEY = 'dispense_records';

export interface PrescriptionDispense {
  id: string;
  patientId: string;
  patientName: string;
  prescriptionId: string;
  items: DispenseItem[];
  dispensedAt: string;
  dispensedBy: string;
  status: 'pending' | 'dispensed' | 'partial';
}

function getAllMedicines(): Medication[] {
  return storageService.get<Medication[]>(STORAGE_KEY) || [];
}

function saveMedicines(medicines: Medication[]): void {
  storageService.set(STORAGE_KEY, medicines);
}

function getAllDispenseRecords(): PrescriptionDispense[] {
  return storageService.get<PrescriptionDispense[]>(DISPENSE_KEY) || [];
}

function saveDispenseRecords(records: PrescriptionDispense[]): void {
  storageService.set(DISPENSE_KEY, records);
}

function initializeSeedData(): void {
  const existing = getAllMedicines();
  if (existing.length > 0) return;

  const seeds: Medication[] = [
    { id: generateId(), name: 'Paracetamol 500mg', stock: 250, unit: 'Tablet', price: 2500, expiryDate: '2025-12-31', minimumStock: 50, isActive: true },
    { id: generateId(), name: 'Amoxicillin 500mg', stock: 120, unit: 'Kapsul', price: 5000, expiryDate: '2025-06-30', minimumStock: 30, isActive: true },
    { id: generateId(), name: 'Omeprazole 20mg', stock: 80, unit: 'Kapsul', price: 8000, expiryDate: '2025-09-15', minimumStock: 20, isActive: true },
    { id: generateId(), name: 'Cetirizine 10mg', stock: 5, unit: 'Tablet', price: 3500, expiryDate: '2025-08-20', minimumStock: 20, isActive: true },
    { id: generateId(), name: 'Metformin 500mg', stock: 45, unit: 'Tablet', price: 4000, expiryDate: '2025-11-30', minimumStock: 30, isActive: true },
    { id: generateId(), name: 'Amlodipine 5mg', stock: 8, unit: 'Tablet', price: 6000, expiryDate: '2025-10-15', minimumStock: 20, isActive: true },
    { id: generateId(), name: 'Captopril 25mg', stock: 0, unit: 'Tablet', price: 3000, expiryDate: '2025-07-20', minimumStock: 30, isActive: true },
    { id: generateId(), name: 'Ranitidine 150mg', stock: 0, unit: 'Tablet', price: 4500, expiryDate: '2025-05-10', minimumStock: 25, isActive: true },
    { id: generateId(), name: 'Ibuprofen 400mg', stock: 3, unit: 'Tablet', price: 3500, expiryDate: '2025-12-01', minimumStock: 30, isActive: true },
    { id: generateId(), name: 'Salbutamol Inhaler', stock: 15, unit: 'Pcs', price: 75000, expiryDate: '2026-01-15', minimumStock: 5, isActive: true },
    { id: generateId(), name: 'Diazepam 5mg', stock: 25, unit: 'Tablet', price: 12000, expiryDate: '2026-03-20', minimumStock: 10, isActive: true },
    { id: generateId(), name: 'Ciprofloxacin 500mg', stock: 60, unit: 'Tablet', price: 7500, expiryDate: '2025-11-10', minimumStock: 20, isActive: true },
    { id: generateId(), name: 'Dexamethasone 0.5mg', stock: 9, unit: 'Tablet', price: 3000, expiryDate: '2026-02-28', minimumStock: 15, isActive: true },
    { id: generateId(), name: 'Lansoprazole 30mg', stock: 40, unit: 'Kapsul', price: 9000, expiryDate: '2025-10-05', minimumStock: 15, isActive: true },
    { id: generateId(), name: 'Vitamin B Complex', stock: 200, unit: 'Tablet', price: 1500, expiryDate: '2026-06-30', minimumStock: 50, isActive: true },
  ];

  saveMedicines(seeds);
}

function initializeSeedDispenses(): void {
  const existing = getAllDispenseRecords();
  if (existing.length > 0) return;

  const medicines = getAllMedicines();
  if (medicines.length === 0) return;

  const seeds: PrescriptionDispense[] = [
    {
      id: generateId(),
      patientId: 'patient-001',
      patientName: 'Ahmad Subagyo',
      prescriptionId: 'rx-001',
      items: [
        { medicationId: medicines[0].id, medicationName: medicines[0].name, requestedQuantity: 10, dispensedQuantity: 10, availability: 'tersedia' },
        { medicationId: medicines[1].id, medicationName: medicines[1].name, requestedQuantity: 15, dispensedQuantity: 15, availability: 'tersedia' },
      ],
      dispensedAt: '2025-01-15T10:30:00',
      dispensedBy: 'Apt. Sari',
      status: 'dispensed',
    },
    {
      id: generateId(),
      patientId: 'patient-002',
      patientName: 'Siti Rahayu',
      prescriptionId: 'rx-002',
      items: [
        { medicationId: medicines[2].id, medicationName: medicines[2].name, requestedQuantity: 14, dispensedQuantity: 14, availability: 'tersedia' },
        { medicationId: medicines[6].id, medicationName: medicines[6].name, requestedQuantity: 30, dispensedQuantity: 0, availability: 'tidak_tersedia' },
      ],
      dispensedAt: '2025-01-16T14:00:00',
      dispensedBy: 'Apt. Dewi',
      status: 'partial',
    },
    {
      id: generateId(),
      patientId: 'patient-003',
      patientName: 'Budi Santoso',
      prescriptionId: 'rx-003',
      items: [
        { medicationId: medicines[4].id, medicationName: medicines[4].name, requestedQuantity: 30, dispensedQuantity: 0, availability: 'tersedia' },
        { medicationId: medicines[5].id, medicationName: medicines[5].name, requestedQuantity: 10, dispensedQuantity: 0, availability: 'stok_rendah' },
      ],
      dispensedAt: '',
      dispensedBy: '',
      status: 'pending',
    },
  ];

  saveDispenseRecords(seeds);
}

function paginate<T>(items: T[], page: number, pageSize: number): PaginatedResult<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  const data = items.slice(start, start + pageSize);
  return { data, total, page: safePage, pageSize, totalPages };
}

export function getAvailabilityStatus(stock: number): 'tersedia' | 'stok_rendah' | 'tidak_tersedia' {
  if (stock > 10) return 'tersedia';
  if (stock >= 1) return 'stok_rendah';
  return 'tidak_tersedia';
}

export function getAll(page: number = 1, pageSize: number = 50, search?: string): PaginatedResult<Medication> {
  initializeSeedData();
  let medicines = getAllMedicines().filter((m) => m.isActive);
  if (search && search.length >= 2) {
    const q = search.toLowerCase();
    medicines = medicines.filter((m) => m.name.toLowerCase().includes(q));
  }
  return paginate(medicines, page, pageSize);
}

export function getById(id: string): Medication | null {
  initializeSeedData();
  return getAllMedicines().find((m) => m.id === id) || null;
}

export function create(data: Omit<Medication, 'id' | 'isActive'>): Medication {
  initializeSeedData();
  const medicines = getAllMedicines();
  const newMed: Medication = {
    id: generateId(),
    ...data,
    isActive: true,
  };
  medicines.push(newMed);
  saveMedicines(medicines);
  return newMed;
}

export function update(id: string, data: Partial<Omit<Medication, 'id'>>): Medication {
  initializeSeedData();
  const medicines = getAllMedicines();
  const index = medicines.findIndex((m) => m.id === id);
  if (index === -1) throw new Error(`Obat dengan id ${id} tidak ditemukan`);
  medicines[index] = { ...medicines[index], ...data };
  saveMedicines(medicines);
  return medicines[index];
}

export function remove(id: string): void {
  initializeSeedData();
  const medicines = getAllMedicines();
  const index = medicines.findIndex((m) => m.id === id);
  if (index === -1) throw new Error(`Obat dengan id ${id} tidak ditemukan`);
  medicines[index] = { ...medicines[index], isActive: false };
  saveMedicines(medicines);
}

export function updateStock(id: string, newStock: number): Medication {
  initializeSeedData();
  const medicines = getAllMedicines();
  const index = medicines.findIndex((m) => m.id === id);
  if (index === -1) throw new Error(`Obat dengan id ${id} tidak ditemukan`);
  if (newStock < 0) throw new Error('Stok tidak boleh negatif');
  medicines[index] = { ...medicines[index], stock: newStock };
  saveMedicines(medicines);
  return medicines[index];
}

export function dispense(medicineId: string, quantity: number): Medication {
  initializeSeedData();
  const medicines = getAllMedicines();
  const index = medicines.findIndex((m) => m.id === medicineId);
  if (index === -1) throw new Error(`Obat dengan id ${medicineId} tidak ditemukan`);
  if (medicines[index].stock === 0) throw new Error('Stok obat habis, tidak dapat melakukan dispensing');
  if (medicines[index].stock < quantity) throw new Error(`Stok tidak mencukupi. Tersedia: ${medicines[index].stock}`);
  medicines[index] = { ...medicines[index], stock: medicines[index].stock - quantity };
  saveMedicines(medicines);
  return medicines[index];
}

export function getDispenseRecords(page: number = 1, pageSize: number = 50): PaginatedResult<PrescriptionDispense> {
  initializeSeedData();
  initializeSeedDispenses();
  const records = getAllDispenseRecords().sort((a, b) => {
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (a.status !== 'pending' && b.status === 'pending') return 1;
    return 0;
  });
  return paginate(records, page, pageSize);
}

export function getDispenseById(id: string): PrescriptionDispense | null {
  initializeSeedData();
  initializeSeedDispenses();
  return getAllDispenseRecords().find((r) => r.id === id) || null;
}

export function dispensePrescription(id: string, dispensedBy: string): PrescriptionDispense {
  initializeSeedData();
  initializeSeedDispenses();
  const records = getAllDispenseRecords();
  const index = records.findIndex((r) => r.id === id);
  if (index === -1) throw new Error('Resep tidak ditemukan');

  const record = records[index];
  const medicines = getAllMedicines();
  let allDispensed = true;

  const updatedItems = record.items.map((item) => {
    const medIndex = medicines.findIndex((m) => m.id === item.medicationId);
    if (medIndex === -1) {
      allDispensed = false;
      return { ...item, dispensedQuantity: 0, availability: 'tidak_tersedia' as const };
    }

    const med = medicines[medIndex];
    const status = getAvailabilityStatus(med.stock);

    if (med.stock === 0) {
      allDispensed = false;
      return { ...item, dispensedQuantity: 0, availability: 'tidak_tersedia' as const };
    }

    const canDispense = Math.min(item.requestedQuantity, med.stock);
    medicines[medIndex] = { ...med, stock: med.stock - canDispense };

    if (canDispense < item.requestedQuantity) {
      allDispensed = false;
    }

    return { ...item, dispensedQuantity: canDispense, availability: status };
  });

  saveMedicines(medicines);

  records[index] = {
    ...record,
    items: updatedItems,
    dispensedAt: new Date().toISOString(),
    dispensedBy,
    status: allDispensed ? 'dispensed' : 'partial',
  };

  saveDispenseRecords(records);
  return records[index];
}

export function getLowStockMedicines(): Medication[] {
  initializeSeedData();
  return getAllMedicines().filter((m) => m.isActive && m.stock <= 10);
}

export const farmasiService = {
  getAll,
  getById,
  create,
  update,
  remove,
  updateStock,
  dispense,
  getAvailabilityStatus,
  getDispenseRecords,
  getDispenseById,
  dispensePrescription,
  getLowStockMedicines,
  initializeSeedData,
};

export default farmasiService;
