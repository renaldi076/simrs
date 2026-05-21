import React, { useState, useEffect, useCallback } from 'react';
import { pengaturanService } from '@/services/modules/pengaturanService';
import type { SystemUser, RolePermission } from '@/services/modules/pengaturanService';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Table } from '@/components/ui/Table';

type TabMode = 'users' | 'roles';

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Administrator' },
  { value: 'dokter', label: 'Dokter' },
  { value: 'perawat', label: 'Perawat' },
  { value: 'farmasi', label: 'Farmasi' },
  { value: 'kasir', label: 'Kasir' },
  { value: 'admin_klaim', label: 'Admin Klaim' },
];

export function Pengaturan(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<TabMode>('users');
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // User form modal
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [formData, setFormData] = useState({ username: '', fullName: '', role: 'dokter' as SystemUser['role'] });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Role permissions
  const [permissions, setPermissions] = useState<RolePermission[]>([]);
  const [selectedRole, setSelectedRole] = useState('admin');

  const loadUsers = useCallback(() => {
    const data = pengaturanService.getUsers(searchQuery.length >= 2 ? searchQuery : undefined);
    setUsers(data);
  }, [searchQuery]);

  const loadPermissions = useCallback(() => {
    const data = pengaturanService.getRolePermissions();
    setPermissions(data);
  }, []);

  useEffect(() => {
    loadUsers();
    loadPermissions();
  }, [loadUsers, loadPermissions]);

  // Auto-dismiss alert after 3 seconds
  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => setAlertMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  const handleOpenAddUser = () => {
    setEditingUser(null);
    setFormData({ username: '', fullName: '', role: 'dokter' });
    setFormErrors({});
    setShowUserModal(true);
  };

  const handleOpenEditUser = (user: SystemUser) => {
    setEditingUser(user);
    setFormData({ username: user.username, fullName: user.fullName, role: user.role });
    setFormErrors({});
    setShowUserModal(true);
  };

  const validateUserForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.username.trim()) errors.username = 'Username wajib diisi';
    else if (formData.username.length > 50) errors.username = 'Username maksimal 50 karakter';
    if (!formData.fullName.trim()) errors.fullName = 'Nama lengkap wajib diisi';
    if (!formData.role) errors.role = 'Role wajib dipilih';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveUser = () => {
    if (!validateUserForm()) return;

    try {
      if (editingUser) {
        pengaturanService.updateUser(editingUser.id, {
          fullName: formData.fullName.trim(),
          role: formData.role,
        });
        setAlertMessage({ type: 'success', message: 'User berhasil diperbarui' });
      } else {
        pengaturanService.createUser({
          username: formData.username.trim(),
          fullName: formData.fullName.trim(),
          role: formData.role,
        });
        setAlertMessage({ type: 'success', message: 'User berhasil ditambahkan' });
      }
      setShowUserModal(false);
      loadUsers();
    } catch (err) {
      setFormErrors({ username: err instanceof Error ? err.message : 'Gagal menyimpan user' });
    }
  };

  const handleToggleUserStatus = (user: SystemUser) => {
    try {
      if (user.isActive) {
        pengaturanService.deactivateUser(user.id);
        setAlertMessage({ type: 'success', message: `User "${user.fullName}" berhasil dinonaktifkan` });
      } else {
        pengaturanService.updateUser(user.id, { isActive: true });
        setAlertMessage({ type: 'success', message: `User "${user.fullName}" berhasil diaktifkan` });
      }
      loadUsers();
    } catch (err) {
      setAlertMessage({ type: 'error', message: err instanceof Error ? err.message : 'Gagal mengubah status user' });
    }
  };

  const handlePermissionChange = (moduleId: string, permission: 'read' | 'write' | 'delete', value: boolean) => {
    try {
      pengaturanService.updateRolePermission(selectedRole, moduleId, { [permission]: value });
      loadPermissions();
      setAlertMessage({ type: 'success', message: 'Hak akses berhasil diperbarui. Perubahan berlaku pada sesi berikutnya.' });
    } catch (err) {
      setAlertMessage({ type: 'error', message: err instanceof Error ? err.message : 'Gagal mengubah hak akses' });
    }
  };

  const currentRolePermission = permissions.find(p => p.roleId === selectedRole);

  const userColumns = [
    { key: 'username', label: 'Username' },
    { key: 'fullName', label: 'Nama Lengkap' },
    {
      key: 'role',
      label: 'Role',
      render: (row: Record<string, unknown>) => (
        <Badge variant="info">{pengaturanService.getRoleLabel(row.role as string)}</Badge>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (row: Record<string, unknown>) => (
        <Badge variant={(row.isActive as boolean) ? 'success' : 'neutral'}>
          {(row.isActive as boolean) ? 'Aktif' : 'Nonaktif'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Aksi',
      render: (row: Record<string, unknown>) => {
        const user = row as unknown as SystemUser;
        return (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleOpenEditUser(user)}>Edit</Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleToggleUserStatus(user)}
            >
              {user.isActive ? 'Nonaktifkan' : 'Aktifkan'}
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Pengaturan</h1>
      </div>

      {alertMessage && (
        <Alert type={alertMessage.type} message={alertMessage.message} onClose={() => setAlertMessage(null)} />
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'users'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Manajemen User
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'roles'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Konfigurasi Hak Akses
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                name="search"
                type="text"
                placeholder="Cari user..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={handleOpenAddUser}>Tambah User</Button>
          </div>

          <Table
            columns={userColumns}
            data={users as unknown as Record<string, unknown>[]}
            emptyMessage="Tidak ada user"
          />
        </div>
      )}

      {activeTab === 'roles' && (
        <div className="space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
            <div className="flex items-center gap-4">
              <label htmlFor="roleSelect" className="text-sm font-medium text-gray-700">Pilih Role:</label>
              <select
                id="roleSelect"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
              >
                {ROLE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <p className="text-xs text-gray-500">Perubahan hak akses akan berlaku pada sesi login berikutnya.</p>

            {currentRolePermission && (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Modul</th>
                      <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Baca</th>
                      <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Tulis</th>
                      <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Hapus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {currentRolePermission.modules.map((mod) => (
                      <tr key={mod.moduleId}>
                        <td className="px-4 py-3 text-sm text-gray-700">{mod.moduleName}</td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={mod.read}
                            onChange={(e) => handlePermissionChange(mod.moduleId, 'read', e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            disabled={selectedRole === 'admin'}
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={mod.write}
                            onChange={(e) => handlePermissionChange(mod.moduleId, 'write', e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            disabled={selectedRole === 'admin'}
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={mod.delete}
                            onChange={(e) => handlePermissionChange(mod.moduleId, 'delete', e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            disabled={selectedRole === 'admin'}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {selectedRole === 'admin' && (
              <Alert type="info" message="Hak akses Administrator tidak dapat diubah (memiliki akses penuh ke semua modul)." />
            )}
          </div>
        </div>
      )}

      {/* User Form Modal */}
      <Modal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        title={editingUser ? 'Edit User' : 'Tambah User Baru'}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Username"
            name="username"
            type="text"
            value={formData.username}
            onChange={(e) => { setFormData(prev => ({ ...prev, username: e.target.value })); setFormErrors(prev => ({ ...prev, username: '' })); }}
            error={formErrors.username}
            required
            maxLength={50}
            placeholder="Masukkan username"
            disabled={!!editingUser}
          />

          <Input
            label="Nama Lengkap"
            name="fullName"
            type="text"
            value={formData.fullName}
            onChange={(e) => { setFormData(prev => ({ ...prev, fullName: e.target.value })); setFormErrors(prev => ({ ...prev, fullName: '' })); }}
            error={formErrors.fullName}
            required
            placeholder="Masukkan nama lengkap"
          />

          <div className="flex flex-col gap-1">
            <label htmlFor="role" className="text-sm font-medium text-gray-700">Role<span className="text-red-500 ml-0.5">*</span></label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as SystemUser['role'] }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
            >
              {ROLE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {formErrors.role && <p className="text-xs text-red-600">{formErrors.role}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={handleSaveUser}>{editingUser ? 'Simpan' : 'Tambah'}</Button>
            <Button variant="outline" onClick={() => setShowUserModal(false)}>Batal</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Pengaturan;
