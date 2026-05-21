import { ModuleId } from '../types/auth';
import { CardColorScheme } from '../types/common';

export interface ModuleConfig {
  id: ModuleId;
  label: string;
  icon: string;
  path: string;
  colorScheme: CardColorScheme;
  description: string;
}

export const MODULES: ModuleConfig[] = [
  { id: 'referensi', label: 'Referensi', icon: 'Database', path: '/dashboard/referensi', colorScheme: 'blue', description: 'Data master rumah sakit' },
  { id: 'admission', label: 'Admission', icon: 'UserPlus', path: '/dashboard/admission', colorScheme: 'green', description: 'Pendaftaran pasien' },
  { id: 'rme', label: 'RME', icon: 'FileText', path: '/dashboard/rme', colorScheme: 'purple', description: 'Rekam medis elektronik' },
  { id: 'billing', label: 'Billing', icon: 'Receipt', path: '/dashboard/billing', colorScheme: 'orange', description: 'Tagihan pasien' },
  { id: 'radiologi', label: 'Radiologi', icon: 'Scan', path: '/dashboard/radiologi', colorScheme: 'teal', description: 'Pemeriksaan radiologi' },
  { id: 'laboratorium', label: 'Laboratorium', icon: 'FlaskConical', path: '/dashboard/laboratorium', colorScheme: 'pink', description: 'Pemeriksaan laboratorium' },
  { id: 'farmasi', label: 'Instalasi Farmasi', icon: 'Pill', path: '/dashboard/farmasi', colorScheme: 'emerald', description: 'Pengelolaan obat & resep' },
  { id: 'kasir', label: 'Kasir', icon: 'Banknote', path: '/dashboard/kasir', colorScheme: 'amber', description: 'Pembayaran & transaksi' },
  { id: 'klaim', label: 'Klaim', icon: 'Shield', path: '/dashboard/klaim', colorScheme: 'indigo', description: 'Klaim asuransi & BPJS' },
  { id: 'jasa', label: 'Jasa', icon: 'Award', path: '/dashboard/jasa', colorScheme: 'cyan', description: 'Distribusi jasa medis' },
  { id: 'pengaturan', label: 'Pengaturan', icon: 'Settings', path: '/dashboard/pengaturan', colorScheme: 'rose', description: 'Konfigurasi sistem' },
  { id: 'billing-real', label: 'Billing Real', icon: 'Activity', path: '/dashboard/billing-real', colorScheme: 'red', description: 'Monitoring billing real-time' },
  { id: 'general-consent', label: 'General Consent', icon: 'ClipboardCheck', path: '/dashboard/general-consent', colorScheme: 'slate', description: 'Formulir persetujuan umum' },
];
