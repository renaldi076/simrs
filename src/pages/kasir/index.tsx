import React, { useState, useEffect, useCallback } from 'react';
import { kasirService } from '@/services/modules/kasirService';
import { billingService } from '@/services/modules/billingService';
import type { PatientBillingSummary } from '@/services/modules/billingService';
import type { Payment, BillingItem } from '@/types/modules';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { useAuth } from '@/hooks/useAuth';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Pagination } from '@/components/ui/Pagination';
import { Table } from '@/components/ui/Table';
import type { PaginatedResult } from '@/types/common';

type ViewMode = 'list' | 'payment' | 'receipt';

const PAGE_SIZE = 20;

const METHOD_LABELS: Record<string, string> = {
  tunai: 'Tunai',
  kartu_debit: 'Kartu Debit',
  kartu_kredit: 'Kartu Kredit',
  transfer: 'Transfer Bank',
};

export function Kasir(): React.ReactElement {
  const { state } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [payments, setPayments] = useState<PaginatedResult<Payment>>({
    data: [], total: 0, page: 1, pageSize: PAGE_SIZE, totalPages: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Payment form state
  const [selectedPatient, setSelectedPatient] = useState<PatientBillingSummary | null>(null);
  const [patientItems, setPatientItems] = useState<BillingItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<Payment['paymentMethod']>('tunai');
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentError, setPaymentError] = useState('');

  // Receipt state
  const [lastPayment, setLastPayment] = useState<Payment | null>(null);

  const loadPayments = useCallback(() => {
    const result = kasirService.getAll(currentPage, PAGE_SIZE, searchQuery.length >= 2 ? searchQuery : undefined);
    setPayments(result);
  }, [currentPage, searchQuery]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleStartPayment = () => {
    // Get unpaid patients from billing
    const patientList = billingService.getPatientList(1, 100);
    if (patientList.data.length === 0) {
      setAlertMessage({ type: 'error', message: 'Tidak ada tagihan pasien yang tersedia' });
      return;
    }
    setSelectedPatient(null);
    setPaymentMethod('tunai');
    setAmountPaid('');
    setPaymentError('');
    setViewMode('payment');
  };

  const handleSelectPatientForPayment = (patient: PatientBillingSummary) => {
    setSelectedPatient(patient);
    const items = billingService.getByPatient(patient.patientId);
    setPatientItems(items);
    setAmountPaid('');
    setPaymentError('');
  };

  const calculateChange = (): number => {
    if (!selectedPatient) return 0;
    const paid = parseFloat(amountPaid) || 0;
    if (paymentMethod === 'tunai') {
      return Math.max(0, Math.round((paid - selectedPatient.totalAmount) * 100) / 100);
    }
    return 0;
  };

  const handleProcessPayment = () => {
    if (!selectedPatient) {
      setPaymentError('Pilih pasien terlebih dahulu');
      return;
    }

    const paid = parseFloat(amountPaid) || 0;

    if (paymentMethod === 'tunai') {
      if (!amountPaid || paid <= 0) {
        setPaymentError('Masukkan jumlah pembayaran');
        return;
      }
      if (paid < selectedPatient.totalAmount) {
        setPaymentError('Jumlah pembayaran kurang dari total tagihan');
        return;
      }
    }

    try {
      const payment = kasirService.processPayment({
        patientId: selectedPatient.patientId,
        patientName: selectedPatient.patientName,
        totalBill: selectedPatient.totalAmount,
        amountPaid: paymentMethod === 'tunai' ? paid : selectedPatient.totalAmount,
        paymentMethod,
        processedBy: state.user?.fullName || 'Kasir',
        items: patientItems.filter(i => i.tariffFound),
      });

      setLastPayment(payment);
      setAlertMessage({ type: 'success', message: `Pembayaran berhasil! No. Transaksi: ${payment.transactionNumber}` });
      setViewMode('receipt');
      loadPayments();
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : 'Gagal memproses pembayaran');
    }
  };

  const handlePrintReceipt = () => {
    if (!lastPayment) return;
    const receiptText = kasirService.generateReceipt(lastPayment);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`<pre style="font-family: monospace; font-size: 12px;">${receiptText}</pre>`);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedPatient(null);
    setLastPayment(null);
    loadPayments();
  };

  // Patient selection list for payment
  const patientList = billingService.getPatientList(1, 100);

  const paymentColumns = [
    { key: 'transactionNumber', label: 'No. Transaksi' },
    { key: 'patientName', label: 'Pasien' },
    {
      key: 'totalBill',
      label: 'Total',
      render: (row: Record<string, unknown>) => formatCurrency(row.totalBill as number),
    },
    {
      key: 'paymentMethod',
      label: 'Metode',
      render: (row: Record<string, unknown>) => (
        <Badge variant="info">{METHOD_LABELS[row.paymentMethod as string] || row.paymentMethod as string}</Badge>
      ),
    },
    {
      key: 'processedAt',
      label: 'Waktu',
      render: (row: Record<string, unknown>) => formatDateTime(row.processedAt as string),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row: Record<string, unknown>) => (
        <Badge variant={row.status === 'success' ? 'success' : 'danger'}>
          {row.status === 'success' ? 'Berhasil' : 'Gagal'}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Kasir</h1>
        {viewMode === 'list' && (
          <Button onClick={handleStartPayment}>Proses Pembayaran</Button>
        )}
        {viewMode !== 'list' && (
          <Button variant="outline" onClick={handleBackToList}>Kembali</Button>
        )}
      </div>

      {alertMessage && (
        <Alert type={alertMessage.type} message={alertMessage.message} onClose={() => setAlertMessage(null)} />
      )}

      {viewMode === 'list' && (
        <div className="space-y-4">
          <Input
            name="search"
            type="text"
            placeholder="Cari transaksi..."
            value={searchQuery}
            onChange={handleSearchChange}
          />

          <Table
            columns={paymentColumns}
            data={payments.data as unknown as Record<string, unknown>[]}
            emptyMessage="Belum ada transaksi pembayaran"
          />

          {payments.totalPages > 1 && (
            <Pagination
              currentPage={payments.page}
              totalPages={payments.totalPages}
              onPageChange={setCurrentPage}
              pageSize={PAGE_SIZE}
              totalItems={payments.total}
            />
          )}
        </div>
      )}

      {viewMode === 'payment' && (
        <div className="max-w-3xl space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-700">Pilih Pasien</h2>
            <div className="max-h-48 overflow-y-auto border rounded-lg divide-y">
              {patientList.data.map(patient => (
                <button
                  key={patient.patientId}
                  onClick={() => handleSelectPatientForPayment(patient)}
                  className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors ${
                    selectedPatient?.patientId === patient.patientId ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{patient.patientName}</span>
                    <span className="text-sm font-semibold text-gray-700">{formatCurrency(patient.totalAmount)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {selectedPatient && (
            <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-700">Detail Pembayaran</h2>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Total Tagihan</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(selectedPatient.totalAmount)}</p>
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="paymentMethod" className="text-sm font-medium text-gray-700">
                  Metode Pembayaran<span className="text-red-500 ml-0.5">*</span>
                </label>
                <select
                  id="paymentMethod"
                  value={paymentMethod}
                  onChange={(e) => {
                    setPaymentMethod(e.target.value as Payment['paymentMethod']);
                    setPaymentError('');
                  }}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                >
                  <option value="tunai">Tunai</option>
                  <option value="kartu_debit">Kartu Debit</option>
                  <option value="kartu_kredit">Kartu Kredit</option>
                  <option value="transfer">Transfer Bank</option>
                </select>
              </div>

              {paymentMethod === 'tunai' && (
                <>
                  <Input
                    label="Jumlah Dibayar"
                    name="amountPaid"
                    type="number"
                    value={amountPaid}
                    onChange={(e) => { setAmountPaid(e.target.value); setPaymentError(''); }}
                    placeholder="Masukkan jumlah pembayaran"
                    required
                  />

                  {parseFloat(amountPaid) >= selectedPatient.totalAmount && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-green-700">Kembalian: <span className="font-bold">{formatCurrency(calculateChange())}</span></p>
                    </div>
                  )}
                </>
              )}

              {paymentMethod !== 'tunai' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-700">Pembayaran akan diproses sebesar {formatCurrency(selectedPatient.totalAmount)}</p>
                </div>
              )}

              {paymentError && (
                <Alert type="error" message={paymentError} />
              )}

              <Button onClick={handleProcessPayment} className="w-full">
                Proses Pembayaran
              </Button>
            </div>
          )}
        </div>
      )}

      {viewMode === 'receipt' && lastPayment && (
        <div className="max-w-2xl mx-auto">
          <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
            <div className="text-center border-b pb-4">
              <h2 className="text-xl font-bold text-gray-900">Bukti Pembayaran</h2>
              <p className="text-sm text-gray-500">No. {lastPayment.transactionNumber}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Pasien</p>
                <p className="font-medium">{lastPayment.patientName}</p>
              </div>
              <div>
                <p className="text-gray-500">Waktu</p>
                <p className="font-medium">{formatDateTime(lastPayment.processedAt)}</p>
              </div>
              <div>
                <p className="text-gray-500">Metode</p>
                <p className="font-medium">{METHOD_LABELS[lastPayment.paymentMethod]}</p>
              </div>
              <div>
                <p className="text-gray-500">Kasir</p>
                <p className="font-medium">{lastPayment.processedBy}</p>
              </div>
            </div>

            <div className="border-t pt-4 space-y-2">
              {lastPayment.items.filter(i => i.tariffFound).map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>{item.itemName} ({item.quantity}x)</span>
                  <span>{formatCurrency(item.subtotal)}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-1">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatCurrency(lastPayment.totalBill)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Dibayar</span>
                <span>{formatCurrency(lastPayment.amountPaid)}</span>
              </div>
              {lastPayment.change > 0 && (
                <div className="flex justify-between text-sm text-green-600 font-medium">
                  <span>Kembalian</span>
                  <span>{formatCurrency(lastPayment.change)}</span>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handlePrintReceipt}>Cetak Struk</Button>
              <Button variant="outline" onClick={handleBackToList}>Selesai</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Kasir;
