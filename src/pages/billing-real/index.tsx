import React, { useState, useEffect, useRef, useCallback } from 'react';
import { billingRealService } from '@/services/modules/billingRealService';
import type { InpatientBilling } from '@/services/modules/billingRealService';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Pagination } from '@/components/ui/Pagination';
import { Table } from '@/components/ui/Table';

const PAGE_SIZE = 50;

function getGuarantorLabel(type: string): string {
  const labels: Record<string, string> = { umum: 'Umum', bpjs: 'BPJS', asuransi: 'Asuransi' };
  return labels[type] || type;
}

function getGuarantorBadge(type: string): 'info' | 'success' | 'neutral' {
  const map: Record<string, 'info' | 'success' | 'neutral'> = { bpjs: 'info', asuransi: 'success', umum: 'neutral' };
  return map[type] || 'neutral';
}

export function BillingReal(): React.ReactElement {
  const [data, setData] = useState<InpatientBilling[]>([]);
  const [lastSuccessData, setLastSuccessData] = useState<InpatientBilling[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Filters
  const [filterRoom, setFilterRoom] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterGuarantor, setFilterGuarantor] = useState('');

  const [alertMessage, setAlertMessage] = useState<{ type: 'info' | 'warning'; message: string } | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadData = useCallback(() => {
    try {
      // Refresh costs in localStorage (simulate real-time updates)
      billingRealService.refreshCosts();

      const filters: { room?: string; startDate?: string; endDate?: string; guarantorType?: string } = {};
      if (filterRoom) filters.room = filterRoom;
      if (filterStartDate) filters.startDate = filterStartDate;
      if (filterEndDate) filters.endDate = filterEndDate;
      if (filterGuarantor) filters.guarantorType = filterGuarantor;

      const result = billingRealService.getInpatients(
        Object.keys(filters).length > 0 ? filters : undefined
      );

      setData(result);
      setLastSuccessData(result);
      setLastUpdated(new Date().toISOString());

      if (result.length === 0 && Object.keys(filters).length > 0) {
        setAlertMessage({ type: 'info', message: 'Tidak ada pasien rawat inap yang sesuai dengan filter' });
      } else {
        setAlertMessage(null);
      }
    } catch {
      // Keep last successful display if fetch fails
      setData(lastSuccessData);
      setAlertMessage({ type: 'warning', message: 'Gagal memperbarui data. Menampilkan data terakhir.' });
    }
  }, [filterRoom, filterStartDate, filterEndDate, filterGuarantor, lastSuccessData]);

  // Initial load
  useEffect(() => {
    loadData();
  }, [filterRoom, filterStartDate, filterEndDate, filterGuarantor]); // eslint-disable-line react-hooks/exhaustive-deps

  // Polling every 5 seconds
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      loadData();
    }, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [loadData]);

  const handleClearFilters = () => {
    setFilterRoom('');
    setFilterStartDate('');
    setFilterEndDate('');
    setFilterGuarantor('');
    setCurrentPage(1);
  };

  // Pagination
  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedData = data.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const roomClasses = billingRealService.getRoomList();

  const columns = [
    { key: 'patientName', label: 'Nama Pasien' },
    { key: 'medicalRecordNumber', label: 'No. RM' },
    { key: 'roomName', label: 'Kamar' },
    {
      key: 'admissionDate',
      label: 'Tanggal Masuk',
      render: (row: Record<string, unknown>) => formatDateTime(row.admissionDate as string),
    },
    {
      key: 'guarantorType',
      label: 'Penjamin',
      render: (row: Record<string, unknown>) => (
        <Badge variant={getGuarantorBadge(row.guarantorType as string)}>
          {getGuarantorLabel(row.guarantorType as string)}
        </Badge>
      ),
    },
    {
      key: 'totalCost',
      label: 'Total Biaya',
      render: (row: Record<string, unknown>) => (
        <span className="font-medium text-gray-900">{formatCurrency(row.totalCost as number)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Billing Real-Time</h1>
          {lastUpdated && (
            <p className="text-xs text-gray-500 mt-1">
              Terakhir diperbarui: {formatDateTime(lastUpdated)} • Auto-refresh setiap 5 detik
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-sm text-green-600 font-medium">Live</span>
        </div>
      </div>

      {alertMessage && (
        <Alert type={alertMessage.type} message={alertMessage.message} onClose={() => setAlertMessage(null)} />
      )}

      {/* Filters */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
          <div className="flex flex-col gap-1">
            <label htmlFor="filterRoom" className="text-xs font-medium text-gray-600">Kelas Kamar</label>
            <select
              id="filterRoom"
              value={filterRoom}
              onChange={(e) => { setFilterRoom(e.target.value); setCurrentPage(1); }}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
            >
              <option value="">Semua Kamar</option>
              {roomClasses.map(room => (
                <option key={room} value={room}>{room}</option>
              ))}
            </select>
          </div>

          <Input
            label="Dari Tanggal"
            name="filterStartDate"
            type="date"
            value={filterStartDate}
            onChange={(e) => { setFilterStartDate(e.target.value); setCurrentPage(1); }}
          />

          <Input
            label="Sampai Tanggal"
            name="filterEndDate"
            type="date"
            value={filterEndDate}
            onChange={(e) => { setFilterEndDate(e.target.value); setCurrentPage(1); }}
          />

          <div className="flex flex-col gap-1">
            <label htmlFor="filterGuarantor" className="text-xs font-medium text-gray-600">Penjamin</label>
            <select
              id="filterGuarantor"
              value={filterGuarantor}
              onChange={(e) => { setFilterGuarantor(e.target.value); setCurrentPage(1); }}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
            >
              <option value="">Semua</option>
              <option value="umum">Umum</option>
              <option value="bpjs">BPJS</option>
              <option value="asuransi">Asuransi</option>
            </select>
          </div>

          <Button variant="outline" onClick={handleClearFilters}>Reset Filter</Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Jumlah Pasien</p>
          <p className="text-2xl font-bold text-gray-900">{data.length}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Total Biaya Akumulasi</p>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(data.reduce((s, d) => s + d.totalCost, 0))}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Rata-rata per Pasien</p>
          <p className="text-2xl font-bold text-gray-700">
            {data.length > 0 ? formatCurrency(data.reduce((s, d) => s + d.totalCost, 0) / data.length) : formatCurrency(0)}
          </p>
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={paginatedData as unknown as Record<string, unknown>[]}
        emptyMessage="Tidak ada pasien rawat inap"
      />

      {totalPages > 1 && (
        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          pageSize={PAGE_SIZE}
          totalItems={data.length}
        />
      )}
    </div>
  );
}

export default BillingReal;
