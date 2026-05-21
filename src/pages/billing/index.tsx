import React, { useState, useEffect, useCallback } from 'react';
import { billingService } from '@/services/modules/billingService';
import type { PatientBillingSummary } from '@/services/modules/billingService';
import type { BillingItem } from '@/types/modules';
import { formatCurrency } from '@/utils/formatters';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { Table } from '@/components/ui/Table';
import type { PaginatedResult } from '@/types/common';

const PAGE_SIZE = 20;

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    tindakan: 'Tindakan',
    obat: 'Obat',
    kamar: 'Kamar',
    layanan: 'Layanan',
  };
  return labels[category] || category;
}

function getCategoryBadge(category: string): 'info' | 'success' | 'warning' | 'neutral' {
  const map: Record<string, 'info' | 'success' | 'warning' | 'neutral'> = {
    tindakan: 'info',
    obat: 'success',
    kamar: 'warning',
    layanan: 'neutral',
  };
  return map[category] || 'neutral';
}

export function Billing(): React.ReactElement {
  const [patients, setPatients] = useState<PaginatedResult<PatientBillingSummary>>({
    data: [], total: 0, page: 1, pageSize: PAGE_SIZE, totalPages: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [patientItems, setPatientItems] = useState<BillingItem[]>([]);
  const [showDetail, setShowDetail] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);

  const loadPatients = useCallback(() => {
    const result = billingService.getPatientList(currentPage, PAGE_SIZE, searchQuery.length >= 2 ? searchQuery : undefined);
    setPatients(result);
  }, [currentPage, searchQuery]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleViewDetail = (patientId: string) => {
    const items = billingService.getByPatient(patientId);
    setPatientItems(items);
    setSelectedPatient(patientId);
    setShowDetail(true);
  };

  const patientNames = billingService.getPatientNames();
  const total = billingService.calculateTotal(patientItems);
  const hasWarnings = patientItems.some(i => !i.tariffFound);

  const columns = [
    { key: 'patientName', label: 'Nama Pasien' },
    { key: 'totalItems', label: 'Jumlah Item' },
    {
      key: 'totalAmount',
      label: 'Total Tagihan',
      render: (row: Record<string, unknown>) => formatCurrency(row.totalAmount as number),
    },
    {
      key: 'hasWarnings',
      label: 'Status',
      render: (row: Record<string, unknown>) => (
        row.hasWarnings
          ? <Badge variant="warning">Ada item tanpa tarif</Badge>
          : <Badge variant="success">Lengkap</Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Aksi',
      render: (row: Record<string, unknown>) => (
        <Button variant="outline" size="sm" onClick={() => handleViewDetail(row.patientId as string)}>
          Detail
        </Button>
      ),
    },
  ];

  const detailColumns = [
    { key: 'itemName', label: 'Nama Item' },
    {
      key: 'category',
      label: 'Kategori',
      render: (row: Record<string, unknown>) => (
        <Badge variant={getCategoryBadge(row.category as string)}>
          {getCategoryLabel(row.category as string)}
        </Badge>
      ),
    },
    { key: 'quantity', label: 'Qty' },
    {
      key: 'unitPrice',
      label: 'Harga Satuan',
      render: (row: Record<string, unknown>) => formatCurrency(row.unitPrice as number),
    },
    {
      key: 'subtotal',
      label: 'Subtotal',
      render: (row: Record<string, unknown>) => {
        const item = row as unknown as BillingItem;
        if (!item.tariffFound) {
          return <span className="text-amber-600 text-xs italic">Tarif tidak ditemukan</span>;
        }
        return formatCurrency(item.quantity * item.unitPrice);
      },
    },
    {
      key: 'tariffFound',
      label: 'Status',
      render: (row: Record<string, unknown>) => (
        (row.tariffFound as boolean)
          ? <Badge variant="success">OK</Badge>
          : <Badge variant="warning">⚠️ Tanpa Tarif</Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Billing Pasien</h1>
      </div>

      {alertMessage && (
        <Alert type={alertMessage.type} message={alertMessage.message} onClose={() => setAlertMessage(null)} />
      )}

      <div className="space-y-4">
        <Input
          name="search"
          type="text"
          placeholder="Cari berdasarkan nama pasien..."
          value={searchQuery}
          onChange={handleSearchChange}
        />

        <Table
          columns={columns}
          data={patients.data as unknown as Record<string, unknown>[]}
          emptyMessage="Tidak ada data billing"
        />

        {patients.totalPages > 1 && (
          <Pagination
            currentPage={patients.page}
            totalPages={patients.totalPages}
            onPageChange={setCurrentPage}
            pageSize={PAGE_SIZE}
            totalItems={patients.total}
          />
        )}
      </div>

      <Modal
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        title={`Detail Tagihan - ${selectedPatient ? (patientNames[selectedPatient] || selectedPatient) : ''}`}
        size="xl"
      >
        <div className="space-y-4">
          {hasWarnings && (
            <Alert
              type="warning"
              message="Beberapa item tidak memiliki tarif dan tidak termasuk dalam perhitungan total."
            />
          )}

          <Table
            columns={detailColumns}
            data={patientItems as unknown as Record<string, unknown>[]}
            emptyMessage="Tidak ada item billing"
          />

          <div className="flex justify-end border-t pt-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Tagihan (item dengan tarif)</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(total)}</p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Billing;
