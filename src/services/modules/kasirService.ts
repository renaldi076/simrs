import { storageService } from '../storageService';
import { generateId } from '@/utils/formatters';
import type { Payment, BillingItem } from '@/types/modules';
import type { PaginatedResult } from '@/types/common';

const STORAGE_KEY = 'payments';

function getAllPayments(): Payment[] {
  return storageService.get<Payment[]>(STORAGE_KEY) || [];
}

function savePayments(payments: Payment[]): void {
  storageService.set(STORAGE_KEY, payments);
}

function paginate<T>(items: T[], page: number, pageSize: number): PaginatedResult<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  const data = items.slice(start, start + pageSize);
  return { data, total, page: safePage, pageSize, totalPages };
}

export function getAll(page: number = 1, pageSize: number = 20, search?: string): PaginatedResult<Payment> {
  let payments = getAllPayments();
  payments.sort((a, b) => new Date(b.processedAt).getTime() - new Date(a.processedAt).getTime());

  if (search && search.trim().length >= 2) {
    const q = search.trim().toLowerCase();
    payments = payments.filter(p =>
      p.patientName.toLowerCase().includes(q) ||
      p.transactionNumber.toLowerCase().includes(q)
    );
  }

  return paginate(payments, page, pageSize);
}

export function getById(id: string): Payment | null {
  const payments = getAllPayments();
  return payments.find(p => p.id === id) || null;
}

export function generateTransactionNumber(): string {
  const now = new Date();
  const dateStr = now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0');

  const payments = getAllPayments();
  const todayPayments = payments.filter((p) => p.transactionNumber.includes(dateStr));
  const seq = String(todayPayments.length + 1).padStart(3, '0');

  return `TRX${dateStr}${seq}`;
}

export function calculateChange(totalBill: number, amountPaid: number): number {
  if (amountPaid < totalBill) {
    throw new Error('Jumlah pembayaran kurang dari total tagihan');
  }
  return Math.round((amountPaid - totalBill) * 100) / 100;
}

export function processPayment(data: {
  patientId: string;
  patientName: string;
  totalBill: number;
  amountPaid: number;
  paymentMethod: Payment['paymentMethod'];
  processedBy: string;
  items: BillingItem[];
}): Payment {
  if (data.paymentMethod === 'tunai' && data.amountPaid < data.totalBill) {
    throw new Error('Pembayaran tunai tidak boleh kurang dari total tagihan');
  }

  const change = data.paymentMethod === 'tunai'
    ? Math.round((data.amountPaid - data.totalBill) * 100) / 100
    : 0;

  const amountPaid = data.paymentMethod === 'tunai' ? data.amountPaid : data.totalBill;

  const payments = getAllPayments();

  const newPayment: Payment = {
    id: generateId(),
    transactionNumber: generateTransactionNumber(),
    patientId: data.patientId,
    patientName: data.patientName,
    totalBill: data.totalBill,
    amountPaid,
    change,
    paymentMethod: data.paymentMethod,
    processedBy: data.processedBy,
    processedAt: new Date().toISOString(),
    status: 'success',
    items: data.items,
  };

  payments.push(newPayment);
  savePayments(payments);
  return newPayment;
}

export function generateReceipt(payment: Payment): string {
  const methodLabels: Record<string, string> = {
    tunai: 'Tunai',
    kartu_debit: 'Kartu Debit',
    kartu_kredit: 'Kartu Kredit',
    transfer: 'Transfer Bank',
  };

  const formatRp = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

  let receipt = `
========================================
         RUMAH SAKIT SIMRS
         BUKTI PEMBAYARAN
========================================
No. Transaksi : ${payment.transactionNumber}
Tanggal       : ${new Date(payment.processedAt).toLocaleString('id-ID')}
Kasir         : ${payment.processedBy}
----------------------------------------
Pasien        : ${payment.patientName}
----------------------------------------
RINCIAN TAGIHAN:
`;

  payment.items.forEach(item => {
    if (item.tariffFound) {
      receipt += `  ${item.itemName}\n`;
      receipt += `    ${item.quantity} x ${formatRp(item.unitPrice)} = ${formatRp(item.subtotal)}\n`;
    }
  });

  receipt += `----------------------------------------
TOTAL         : ${formatRp(payment.totalBill)}
Metode Bayar  : ${methodLabels[payment.paymentMethod] || payment.paymentMethod}
Dibayar       : ${formatRp(payment.amountPaid)}
Kembalian     : ${formatRp(payment.change)}
========================================
        Terima kasih atas
       kepercayaan Anda.
========================================
`;

  return receipt;
}

export const kasirService = {
  getAll,
  getById,
  processPayment,
  generateTransactionNumber,
  calculateChange,
  generateReceipt,
};

export default kasirService;
