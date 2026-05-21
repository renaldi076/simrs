import { storageService } from '../storageService';
import { generateId } from '@/utils/formatters';
import type { RadiologyRequest, RadiologyResult } from '@/types/modules';

const STORAGE_KEY = 'radiology_requests';

function getAllRequests(): RadiologyRequest[] {
  return storageService.get<RadiologyRequest[]>(STORAGE_KEY) || [];
}

function saveRequests(requests: RadiologyRequest[]): void {
  storageService.set(STORAGE_KEY, requests);
}

function initializeSeedData(): void {
  const existing = getAllRequests();
  if (existing.length > 0) return;

  const seeds: RadiologyRequest[] = [
    {
      id: generateId(),
      patientId: 'patient-1',
      patientName: 'Ahmad Sudirman',
      examType: 'Rontgen',
      bodyArea: 'Thorax',
      clinicalNotes: 'Batuk berdahak lebih dari 2 minggu, demam ringan.',
      status: 'Selesai',
      requestDate: '2024-01-15T08:30:00.000Z',
      result: {
        interpretation: 'Tampak infiltrat pada lapangan paru kanan bawah. Tidak tampak efusi pleura.',
        conclusion: 'Bronkopneumonia dextra.',
        linkedToMedicalRecord: true,
        completedAt: '2024-01-15T10:00:00.000Z',
        completedBy: 'Dr. Radiologi',
      },
    },
    {
      id: generateId(),
      patientId: 'patient-2',
      patientName: 'Siti Rahayu',
      examType: 'CT Scan',
      bodyArea: 'Abdomen',
      clinicalNotes: 'Nyeri perut kanan bawah berulang, curiga appendicitis.',
      status: 'Menunggu',
      requestDate: '2024-03-10T09:00:00.000Z',
    },
    {
      id: generateId(),
      patientId: 'patient-3',
      patientName: 'Budi Santoso',
      examType: 'USG',
      bodyArea: 'Abdomen',
      clinicalNotes: 'Evaluasi post-operasi appendectomy, keluhan nyeri berulang.',
      status: 'Menunggu',
      requestDate: '2024-03-12T07:45:00.000Z',
    },
  ];

  saveRequests(seeds);
}

export function getAll(status?: 'Menunggu' | 'Selesai'): RadiologyRequest[] {
  initializeSeedData();
  let requests = getAllRequests();
  if (status) {
    requests = requests.filter((r) => r.status === status);
  }
  return requests;
}

export function getById(id: string): RadiologyRequest | null {
  initializeSeedData();
  return getAllRequests().find((r) => r.id === id) || null;
}

export function createRequest(data: {
  patientId: string;
  patientName: string;
  examType: string;
  bodyArea: string;
  clinicalNotes: string;
}): RadiologyRequest {
  initializeSeedData();
  const requests = getAllRequests();

  const newRequest: RadiologyRequest = {
    id: generateId(),
    patientId: data.patientId,
    patientName: data.patientName,
    examType: data.examType,
    bodyArea: data.bodyArea,
    clinicalNotes: data.clinicalNotes,
    status: 'Menunggu',
    requestDate: new Date().toISOString(),
  };

  requests.push(newRequest);
  saveRequests(requests);
  return newRequest;
}

export function addResult(id: string, result: Omit<RadiologyResult, 'linkedToMedicalRecord' | 'completedAt'>): RadiologyRequest {
  initializeSeedData();
  const requests = getAllRequests();
  const index = requests.findIndex((r) => r.id === id);

  if (index === -1) throw new Error(`Radiology request with id ${id} not found`);
  if (requests[index].status === 'Selesai') throw new Error('Request already has results');

  const updatedRequest: RadiologyRequest = {
    ...requests[index],
    status: 'Selesai',
    result: {
      interpretation: result.interpretation,
      conclusion: result.conclusion,
      completedBy: result.completedBy,
      linkedToMedicalRecord: true,
      completedAt: new Date().toISOString(),
    },
  };

  requests[index] = updatedRequest;
  saveRequests(requests);
  return updatedRequest;
}

export function getQueue(): RadiologyRequest[] {
  initializeSeedData();
  return getAllRequests()
    .filter((r) => r.status === 'Menunggu')
    .sort((a, b) => new Date(a.requestDate).getTime() - new Date(b.requestDate).getTime());
}

export const radiologiService = {
  getAll,
  getById,
  createRequest,
  addResult,
  getQueue,
};

export default radiologiService;
