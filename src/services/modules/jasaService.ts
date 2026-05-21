import { storageService } from '../storageService';
import { generateId } from '@/utils/formatters';
import type { MedicalFee, FeeRecapitulation } from '@/types/modules';

const STORAGE_KEY = 'medical_fees';

function getAllFees(): MedicalFee[] {
  return storageService.get<MedicalFee[]>(STORAGE_KEY) || [];
}

function saveFees(fees: MedicalFee[]): void {
  storageService.set(STORAGE_KEY, fees);
}

function initializeSeedData(): void {
  const existing = getAllFees();
  if (existing.length > 0) return;

  const seeds: MedicalFee[] = [];
  const doctors = [
    { id: 'dr-1', name: 'dr. Andi Wijaya, Sp.PD' },
    { id: 'dr-2', name: 'dr. Ratna Sari, Sp.A' },
    { id: 'dr-3', name: 'dr. Hendra Gunawan, Sp.B' },
    { id: 'dr-4', name: 'dr. Maya Kusuma, Sp.OG' },
  ];

  const procedures = [
    { name: 'Konsultasi Spesialis', amount: 150000 },
    { name: 'Visite Rawat Inap', amount: 100000 },
    { name: 'Tindakan Medis Kecil', amount: 250000 },
    { name: 'Tindakan Medis Sedang', amount: 500000 },
    { name: 'Operasi Minor', amount: 2000000 },
    { name: 'Operasi Mayor', amount: 5000000 },
    { name: 'USG', amount: 200000 },
    { name: 'Interpretasi Rontgen', amount: 75000 },
  ];

  // Generate data for last 3 months
  for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
    const baseDate = new Date();
    baseDate.setMonth(baseDate.getMonth() - monthOffset);

    for (const doctor of doctors) {
      const numProcedures = Math.floor(Math.random() * 8) + 3;
      for (let i = 0; i < numProcedures; i++) {
        const proc = procedures[Math.floor(Math.random() * procedures.length)];
        const day = Math.floor(Math.random() * 28) + 1;
        const date = new Date(baseDate.getFullYear(), baseDate.getMonth(), day);

        seeds.push({
          id: generateId(),
          healthcareProviderId: doctor.id,
          healthcareProviderName: doctor.name,
          treatmentId: generateId(),
          treatmentName: proc.name,
          amount: proc.amount,
          date: date.toISOString().split('T')[0],
        });
      }
    }
  }

  saveFees(seeds);
}

export function getRecapitulation(startDate: string, endDate: string): FeeRecapitulation[] {
  initializeSeedData();

  // Validate date range (max 12 months)
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end < start) {
    throw new Error('Tanggal akhir harus sama atau setelah tanggal awal');
  }

  const diffMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  if (diffMonths > 12) {
    throw new Error('Rentang tanggal maksimal 12 bulan');
  }

  const fees = getAllFees().filter(f => f.date >= startDate && f.date <= endDate);

  // Group by provider
  const providerMap = new Map<string, { name: string; treatments: number; amount: number }>();

  fees.forEach(fee => {
    const existing = providerMap.get(fee.healthcareProviderId);
    if (existing) {
      existing.treatments += 1;
      existing.amount += fee.amount;
    } else {
      providerMap.set(fee.healthcareProviderId, {
        name: fee.healthcareProviderName,
        treatments: 1,
        amount: fee.amount,
      });
    }
  });

  return Array.from(providerMap.entries()).map(([id, data]) => ({
    healthcareProviderId: id,
    healthcareProviderName: data.name,
    totalTreatments: data.treatments,
    totalAmount: data.amount,
    period: { startDate, endDate },
  })).sort((a, b) => b.totalAmount - a.totalAmount);
}

export function getDetailByProvider(providerId: string, startDate: string, endDate: string): MedicalFee[] {
  initializeSeedData();
  return getAllFees()
    .filter(f => f.healthcareProviderId === providerId && f.date >= startDate && f.date <= endDate)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function addFee(data: {
  healthcareProviderId: string;
  healthcareProviderName: string;
  treatmentName: string;
  amount: number;
  date: string;
}): MedicalFee {
  initializeSeedData();
  const fees = getAllFees();

  const newFee: MedicalFee = {
    id: generateId(),
    healthcareProviderId: data.healthcareProviderId,
    healthcareProviderName: data.healthcareProviderName,
    treatmentId: generateId(),
    treatmentName: data.treatmentName,
    amount: data.amount,
    date: data.date,
  };

  fees.push(newFee);
  saveFees(fees);
  return newFee;
}

export const jasaService = {
  getRecapitulation,
  getDetailByProvider,
  addFee,
  initializeSeedData,
};

export default jasaService;
