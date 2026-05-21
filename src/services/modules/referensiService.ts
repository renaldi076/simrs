import { storageService } from '@/services/storageService';
import { generateId } from '@/utils/formatters';

export interface ReferensiItem {
  id: string;
  kode: string;
  nama: string;
  isActive: boolean;
}

const getStorageKey = (menuKey: string): string => `ref_${menuKey}`;

// --- Seed data for adm_pasien ---
const PASIEN_SEED: Omit<ReferensiItem, 'id'>[] = [
  { kode: '000271690', nama: 'EUIS KOMARIAH', isActive: true },
  { kode: '000271689', nama: 'PENDI KUSNADI', isActive: true },
  { kode: '000271688', nama: 'RATNA SARI DEWI', isActive: true },
  { kode: '000271687', nama: 'DADANG SUPRIATNA', isActive: true },
  { kode: '000271686', nama: 'SRI MULYANI', isActive: true },
  { kode: '000271685', nama: 'AGUS HERMAWAN', isActive: true },
  { kode: '000271684', nama: 'NINING SUHARTI', isActive: true },
  { kode: '000271683', nama: 'UJANG SURYANA', isActive: true },
  { kode: '000271682', nama: 'IIS SUSILAWATI', isActive: true },
  { kode: '000271681', nama: 'BAMBANG SUGIARTO', isActive: true },
  { kode: '000271680', nama: 'YANTI NURHAYATI', isActive: true },
  { kode: '000271679', nama: 'HASAN BASRI', isActive: true },
  { kode: '000271678', nama: 'DEWI KARTINI', isActive: true },
  { kode: '000271677', nama: 'ASEP SUNANDAR', isActive: true },
  { kode: '000271676', nama: 'NENENG HASANAH', isActive: true },
  { kode: '000271675', nama: 'DEDI MULYADI', isActive: true },
  { kode: '000271674', nama: 'TUTI ALAWIYAH', isActive: true },
  { kode: '000271673', nama: 'SOPIAN HADI', isActive: true },
  { kode: '000271672', nama: 'CUCU RAHAYU', isActive: true },
  { kode: '000271671', nama: 'WAWAN SETIAWAN', isActive: true },
];

function initializePasienSeed(): void {
  const key = getStorageKey('adm_pasien');
  const existing = storageService.get<ReferensiItem[]>(key);
  if (existing && existing.length > 0) return;
  const items: ReferensiItem[] = PASIEN_SEED.map(s => ({ ...s, id: generateId() }));
  storageService.set(key, items);
}

function getAllRaw(menuKey: string): ReferensiItem[] {
  if (menuKey === 'adm_pasien') {
    initializePasienSeed();
  }
  return storageService.get<ReferensiItem[]>(getStorageKey(menuKey)) || [];
}

function saveAll(menuKey: string, data: ReferensiItem[]): void {
  storageService.set(getStorageKey(menuKey), data);
}

export const referensiService = {
  getAll(menuKey: string, search = ''): ReferensiItem[] {
    let items = getAllRaw(menuKey);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (item) =>
          item.kode.toLowerCase().includes(q) ||
          item.nama.toLowerCase().includes(q)
      );
    }
    return items;
  },

  getById(menuKey: string, id: string): ReferensiItem | null {
    const items = getAllRaw(menuKey);
    return items.find((item) => item.id === id) || null;
  },

  create(menuKey: string, data: Omit<ReferensiItem, 'id'>): ReferensiItem {
    const items = getAllRaw(menuKey);
    const newItem: ReferensiItem = { ...data, id: generateId() };
    items.push(newItem);
    saveAll(menuKey, items);
    return newItem;
  },

  update(menuKey: string, id: string, data: Partial<ReferensiItem>): ReferensiItem | null {
    const items = getAllRaw(menuKey);
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return null;
    items[index] = { ...items[index], ...data };
    saveAll(menuKey, items);
    return items[index];
  },

  remove(menuKey: string, id: string): boolean {
    const items = getAllRaw(menuKey);
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return false;
    items.splice(index, 1);
    saveAll(menuKey, items);
    return true;
  },

  getNextRMNumber(): string {
    const items = getAllRaw('adm_pasien');
    if (items.length === 0) return '000271691';
    const maxNum = items.reduce((max, item) => {
      const num = parseInt(item.kode, 10);
      return isNaN(num) ? max : Math.max(max, num);
    }, 0);
    return String(maxNum + 1).padStart(9, '0');
  },
};
