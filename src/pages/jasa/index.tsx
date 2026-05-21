import React, { useState, useCallback } from 'react';
import { jasaService } from '@/services/modules/jasaService';
import type { FeeRecapitulation, MedicalFee } from '@/types/modules';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Table } from '@/components/ui/Table';

export function Jasa(): React.ReactElement {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [recapData, setRecapData] = useState<FeeRecapitulation[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error' | 'warning' | 'info'; message: string } | null>(null);

  // Detail modal state
  const [showDetail, setShowDetail] = useState(false);
  const [detailData, setDetailData] = useState<MedicalFee[]>([]);
  const [detailDoctorName, setDetailDoctorName] = useState('');

  const handleSearch = useCallback(() => {
    setAlertMessage(null);

    if (!startDate || !endDate) {
      setAlertMessage({ type: 'error', message: 'Tanggal awal dan akhir wajib diisi' });
      return;
    }

    if (endDate < startDate) {
      setAlertMessage({ type: 'error', message: 'Tanggal akhir harus sama atau setelah tanggal awal' });
      return;
    }

    // Validate max 12 months
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    if (diffMonths > 12) {
      setAlertMessage({ type: 'error', message: 'Rentang tanggal maksimal 12 bulan' });
      return;
    }

    try {
      const data = jasaService.getRecapitulation(startDate, endDate);
      setRecapData(data);
      setHasSearched(true);

      if (data.length === 0) {
        setAlertMessage({ type: 'info', message: 'Tidak ada data jasa medis pada periode yang dipilih' });
      }
    } catch (err) {
      setAlertMessage({ type: 'error', message: err instanceof Error ? err.message : 'Gagal memuat data' });
    }
  }, [startDate, endDate]);

  const handleViewDetail = (providerId: string, providerName: string) => {
    const data = jasaService.getDetailByProvider(providerId, startDate, endDate);
    setDetailData(data);
    setDetailDoctorName(providerName);
    setShowDetail(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const grandTotal = recapData.reduce((sum, r) => sum + r.totalAmount, 0);
  const totalProcedures = recapData.reduce((sum, r) => sum + r.totalTreatments, 0);

  const columns = [
    {
      key: 'index',
      label: 'No',
      render: (_row: Record<string, unknown>, _idx?: number) => {
        const idx = recapData.findIndex(r => r.healthcareProviderId === (_row as unknown as FeeRecapitulation).healthcareProviderId);
        return idx + 1;
      },
    },
    { key: 'healthcareProviderName', label: 'Nama Tenaga Kesehatan' },
    { key: 'totalTreatments', label: 'Jumlah Tindakan' },
    {
      key: 'totalAmount',
      label: 'Total Jasa',
      render: (row: Record<string, unknown>) => (
        <span className="font-medium">{formatCurrency(row.totalAmount as number)}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Aksi',
      render: (row: Record<string, unknown>) => (
        <Button variant="outline" size="sm" onClick={() => handleViewDetail(
          (row as unknown as FeeRecapitulation).healthcareProviderId,
          (row as unknown as FeeRecapitulation).healthcareProviderName,
        )}>
          Detail
        </Button>
      ),
    },
  ];

  const detailColumns = [
    {
      key: 'date',
      label: 'Tanggal',
      render: (row: Record<string, unknown>) => formatDate(row.date as string),
    },
    { key: 'treatmentName', label: 'Nama Tindakan' },
    {
      key: 'amount',
      label: 'Jasa',
      render: (row: Record<string, unknown>) => formatCurrency(row.amount as number),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Jasa Medis</h1>
        {recapData.length > 0 && (
          <Button onClick={handlePrint}>Cetak / Export PDF</Button>
        )}
      </div>

      {alertMessage && (
        <Alert type={alertMessage.type} message={alertMessage.message} onClose={() => setAlertMessage(null)} />
      )}

      <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-700">Filter Periode</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <Input
            label="Tanggal Awal"
            name="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
          <Input
            label="Tanggal Akhir"
            name="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
          <Button onClick={handleSearch}>Tampilkan</Button>
        </div>
        <p className="text-xs text-gray-500">Maksimal rentang 12 bulan</p>
      </div>

      {hasSearched && recapData.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-sm text-gray-500">Periode</p>
              <p className="font-medium">{formatDate(startDate)} - {formatDate(endDate)}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-sm text-gray-500">Total Tindakan</p>
              <p className="text-xl font-bold text-gray-900">{totalProcedures}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <p className="text-sm text-gray-500">Total Jasa</p>
              <p className="text-xl font-bold text-blue-600">{formatCurrency(grandTotal)}</p>
            </div>
          </div>

          <Table
            columns={columns}
            data={recapData as unknown as Record<string, unknown>[]}
            emptyMessage="Tidak ada data"
          />
        </>
      )}

      {hasSearched && recapData.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Tidak ada data jasa medis pada periode yang dipilih.</p>
        </div>
      )}

      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title={`Detail Jasa - ${detailDoctorName}`} size="lg">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Badge variant="info">{detailData.length} tindakan</Badge>
            <span className="font-bold text-lg">{formatCurrency(detailData.reduce((s, d) => s + d.amount, 0))}</span>
          </div>
          <Table
            columns={detailColumns}
            data={detailData as unknown as Record<string, unknown>[]}
            emptyMessage="Tidak ada data"
          />
        </div>
      </Modal>
    </div>
  );
}

export default Jasa;
