import { storageService } from '../storageService';
import { generateId } from '@/utils/formatters';
import type { LabRequest, LabResult } from '@/types/modules';

const STORAGE_KEY = 'lab_requests';

export const AVAILABLE_EXAM_TYPES = [
  'Darah Lengkap',
  'Gula Darah',
  'Fungsi Hati',
  'Fungsi Ginjal',
  'Profil Lipid',
  'Urinalisis',
  'Elektrolit',
] as const;

function getAllRequests(): LabRequest[] {
  return storageService.get<LabRequest[]>(STORAGE_KEY) || [];
}

function saveRequests(requests: LabRequest[]): void {
  storageService.set(STORAGE_KEY, requests);
}

function initializeSeedData(): void {
  const existing = getAllRequests();
  if (existing.length > 0) return;

  const seeds: LabRequest[] = [
    {
      id: generateId(),
      patientId: 'patient-1',
      patientName: 'Ahmad Sudirman',
      examType: 'Darah Lengkap',
      clinicalNotes: 'Demam tinggi 3 hari, cek trombosit.',
      status: 'Selesai',
      requestDate: '2024-01-10T08:00:00.000Z',
      results: [
        { parameterName: 'Hemoglobin', value: 14.5, unit: 'g/dL', normalRangeLow: 13, normalRangeHigh: 17, isAbnormal: false },
        { parameterName: 'Trombosit', value: 80000, unit: '/μL', normalRangeLow: 150000, normalRangeHigh: 400000, isAbnormal: true },
        { parameterName: 'Leukosit', value: 4500, unit: '/μL', normalRangeLow: 4000, normalRangeHigh: 11000, isAbnormal: false },
        { parameterName: 'Hematokrit', value: 42, unit: '%', normalRangeLow: 40, normalRangeHigh: 54, isAbnormal: false },
      ],
    },
    {
      id: generateId(),
      patientId: 'patient-2',
      patientName: 'Siti Rahayu',
      examType: 'Gula Darah',
      clinicalNotes: 'Screening diabetes, riwayat keluarga DM.',
      status: 'Menunggu',
      requestDate: '2024-03-10T09:30:00.000Z',
    },
    {
      id: generateId(),
      patientId: 'patient-3',
      patientName: 'Budi Santoso',
      examType: 'Fungsi Ginjal',
      clinicalNotes: 'Pre-operasi appendectomy, evaluasi fungsi ginjal.',
      status: 'Menunggu',
      requestDate: '2024-03-11T07:00:00.000Z',
    },
    {
      id: generateId(),
      patientId: 'patient-4',
      patientName: 'Dewi Kartika',
      examType: 'Profil Lipid',
      clinicalNotes: 'Kontrol kolesterol rutin, pasien hipertensi.',
      status: 'Selesai',
      requestDate: '2024-02-15T10:00:00.000Z',
      results: [
        { parameterName: 'Kolesterol Total', value: 260, unit: 'mg/dL', normalRangeLow: 0, normalRangeHigh: 200, isAbnormal: true },
        { parameterName: 'LDL', value: 170, unit: 'mg/dL', normalRangeLow: 0, normalRangeHigh: 130, isAbnormal: true },
        { parameterName: 'HDL', value: 45, unit: 'mg/dL', normalRangeLow: 40, normalRangeHigh: 60, isAbnormal: false },
        { parameterName: 'Trigliserida', value: 180, unit: 'mg/dL', normalRangeLow: 0, normalRangeHigh: 150, isAbnormal: true },
      ],
    },
    {
      id: generateId(),
      patientId: 'patient-5',
      patientName: 'Rudi Hermawan',
      examType: 'Elektrolit',
      clinicalNotes: 'Pasien diare kronis, cek keseimbangan elektrolit.',
      status: 'Menunggu',
      requestDate: '2024-03-12T08:15:00.000Z',
    },
  ];

  saveRequests(seeds);
}

export function getAll(status?: 'Menunggu' | 'Selesai'): LabRequest[] {
  initializeSeedData();
  let requests = getAllRequests();
  if (status) {
    requests = requests.filter((r) => r.status === status);
  }
  return requests.sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
}

export function getById(id: string): LabRequest | undefined {
  initializeSeedData();
  return getAllRequests().find((r) => r.id === id);
}

export function createRequest(data: {
  patientId: string;
  patientName: string;
  examType: string;
  clinicalNotes: string;
}): LabRequest {
  initializeSeedData();
  const requests = getAllRequests();

  const newRequest: LabRequest = {
    id: generateId(),
    patientId: data.patientId,
    patientName: data.patientName,
    examType: data.examType,
    clinicalNotes: data.clinicalNotes,
    status: 'Menunggu',
    requestDate: new Date().toISOString(),
  };

  requests.push(newRequest);
  saveRequests(requests);
  return newRequest;
}

export function addResults(id: string, results: Omit<LabResult, 'isAbnormal'>[]): LabRequest {
  initializeSeedData();
  const requests = getAllRequests();
  const index = requests.findIndex((r) => r.id === id);

  if (index === -1) throw new Error(`Lab request with id ${id} not found`);
  if (requests[index].status === 'Selesai') throw new Error('Request already has results');

  const processedResults: LabResult[] = results.map((r) => ({
    ...r,
    isAbnormal: r.value < r.normalRangeLow || r.value > r.normalRangeHigh,
  }));

  const updated: LabRequest = {
    ...requests[index],
    status: 'Selesai',
    results: processedResults,
  };

  requests[index] = updated;
  saveRequests(requests);
  return updated;
}

export function deleteRequest(id: string): void {
  initializeSeedData();
  const requests = getAllRequests();
  const filtered = requests.filter((r) => r.id !== id);
  saveRequests(filtered);
}

export function getQueue(): LabRequest[] {
  initializeSeedData();
  return getAllRequests()
    .filter((r) => r.status === 'Menunggu')
    .sort((a, b) => new Date(a.requestDate).getTime() - new Date(b.requestDate).getTime());
}

export const laboratoriumService = {
  getAll,
  getById,
  createRequest,
  addResults,
  deleteRequest,
  getQueue,
  AVAILABLE_EXAM_TYPES,
};

export default laboratoriumService;
