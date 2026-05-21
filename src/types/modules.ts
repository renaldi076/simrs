export interface Patient {
  id: string;
  medicalRecordNumber: string;
  fullName: string;
  dateOfBirth: string;
  gender: 'Laki-laki' | 'Perempuan';
  address: string;
  phoneNumber: string;
  guarantorType: 'umum' | 'bpjs' | 'asuransi';
  createdAt: string;
  updatedAt: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  visitDate: string;
  complaint: string;
  diagnosisCode: string;
  diagnosisName: string;
  treatment: string;
  prescriptions?: Prescription[];
  status: 'draft' | 'final';
  signedBy?: string;
  signedAt?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  auditTrail: AuditEntry[];
}

export interface Prescription {
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
}

export interface AuditEntry {
  timestamp: string;
  userId: string;
  userName: string;
  action: 'create' | 'update' | 'sign';
  changes?: Record<string, { from: string; to: string }>;
}

export interface BillingItem {
  id: string;
  patientId: string;
  visitId: string;
  itemName: string;
  category: 'tindakan' | 'obat' | 'kamar' | 'layanan';
  quantity: number;
  unitPrice: number;
  subtotal: number;
  tariffFound: boolean;
  createdAt: string;
}

export interface PatientBilling {
  patientId: string;
  patientName: string;
  visitId: string;
  items: BillingItem[];
  totalAmount: number;
  status: 'open' | 'paid' | 'partial';
}

export interface RadiologyRequest {
  id: string;
  patientId: string;
  patientName: string;
  examType: string;
  bodyArea: string;
  clinicalNotes: string;
  status: 'Menunggu' | 'Selesai';
  requestDate: string;
  result?: RadiologyResult;
}

export interface RadiologyResult {
  interpretation: string;
  conclusion: string;
  linkedToMedicalRecord: boolean;
  completedAt: string;
  completedBy: string;
}

export interface LabRequest {
  id: string;
  patientId: string;
  patientName: string;
  examType: string;
  clinicalNotes: string;
  status: 'Menunggu' | 'Selesai';
  requestDate: string;
  results?: LabResult[];
}

export interface LabResult {
  parameterName: string;
  value: number;
  unit: string;
  normalRangeLow: number;
  normalRangeHigh: number;
  isAbnormal: boolean;
}

export interface Medication {
  id: string;
  name: string;
  stock: number;
  unit: string;
  price: number;
  expiryDate: string;
  minimumStock: number;
  isActive: boolean;
}

export interface DispenseItem {
  medicationId: string;
  medicationName: string;
  requestedQuantity: number;
  dispensedQuantity: number;
  availability: 'tersedia' | 'tidak_tersedia' | 'stok_rendah';
}

export interface Payment {
  id: string;
  transactionNumber: string;
  patientId: string;
  patientName: string;
  totalBill: number;
  amountPaid: number;
  change: number;
  paymentMethod: 'tunai' | 'kartu_debit' | 'kartu_kredit' | 'transfer';
  processedBy: string;
  processedAt: string;
  status: 'success' | 'failed';
  items: BillingItem[];
}

export interface Claim {
  id: string;
  patientId: string;
  patientName: string;
  memberNumber: string;
  diagnosis: string;
  treatment: string;
  documents: ClaimDocument[];
  status: 'diajukan' | 'diproses' | 'disetujui' | 'ditolak';
  submittedAt: string;
  updatedAt: string;
}

export interface ClaimDocument {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
}

export interface MedicalFee {
  id: string;
  healthcareProviderId: string;
  healthcareProviderName: string;
  treatmentId: string;
  treatmentName: string;
  amount: number;
  date: string;
}

export interface FeeRecapitulation {
  healthcareProviderId: string;
  healthcareProviderName: string;
  totalTreatments: number;
  totalAmount: number;
  period: { startDate: string; endDate: string };
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  licenseNumber: string;
  isActive: boolean;
}

export interface Room {
  id: string;
  name: string;
  type: string;
  class: string;
  capacity: number;
  ratePerDay: number;
  isActive: boolean;
}

export interface Procedure {
  id: string;
  name: string;
  category: string;
  rate: number;
  isActive: boolean;
}

export interface Tariff {
  id: string;
  name: string;
  category: string;
  amount: number;
  isActive: boolean;
}
