import { storageService } from '../storageService';
import { generateId } from '@/utils/formatters';

export interface SystemUser {
  id: string;
  username: string;
  fullName: string;
  role: 'admin' | 'dokter' | 'perawat' | 'farmasi' | 'kasir' | 'admin_klaim';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RolePermission {
  roleId: string;
  roleName: string;
  modules: ModulePermission[];
}

export interface ModulePermission {
  moduleId: string;
  moduleName: string;
  read: boolean;
  write: boolean;
  delete: boolean;
}

const USERS_KEY = 'system_users';
const PERMISSIONS_KEY = 'role_permissions';

function getAllUsers(): SystemUser[] {
  return storageService.get<SystemUser[]>(USERS_KEY) || [];
}

function saveUsers(users: SystemUser[]): void {
  storageService.set(USERS_KEY, users);
}

function getAllPermissions(): RolePermission[] {
  return storageService.get<RolePermission[]>(PERMISSIONS_KEY) || [];
}

function savePermissions(permissions: RolePermission[]): void {
  storageService.set(PERMISSIONS_KEY, permissions);
}

const MODULE_LIST = [
  { id: 'admission', name: 'Pendaftaran' },
  { id: 'rme', name: 'Rekam Medis' },
  { id: 'billing', name: 'Billing' },
  { id: 'kasir', name: 'Kasir' },
  { id: 'farmasi', name: 'Farmasi' },
  { id: 'laboratorium', name: 'Laboratorium' },
  { id: 'radiologi', name: 'Radiologi' },
  { id: 'klaim', name: 'Klaim' },
  { id: 'jasa', name: 'Jasa Medis' },
  { id: 'referensi', name: 'Referensi' },
  { id: 'pengaturan', name: 'Pengaturan' },
];

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrator',
  dokter: 'Dokter',
  perawat: 'Perawat',
  farmasi: 'Farmasi',
  kasir: 'Kasir',
  admin_klaim: 'Admin Klaim',
};

function initializeSeedData(): void {
  const existingUsers = getAllUsers();
  if (existingUsers.length > 0) return;

  const now = new Date().toISOString();
  const users: SystemUser[] = [
    { id: 'user-1', username: 'admin', fullName: 'Administrator Sistem', role: 'admin', isActive: true, createdAt: now, updatedAt: now },
    { id: 'user-2', username: 'dr.andi', fullName: 'dr. Andi Wijaya, Sp.PD', role: 'dokter', isActive: true, createdAt: now, updatedAt: now },
    { id: 'user-3', username: 'perawat.sari', fullName: 'Sari Wulandari', role: 'perawat', isActive: true, createdAt: now, updatedAt: now },
    { id: 'user-4', username: 'kasir.budi', fullName: 'Budi Hartono', role: 'kasir', isActive: true, createdAt: now, updatedAt: now },
    { id: 'user-5', username: 'farmasi.dewi', fullName: 'Dewi Anggraini', role: 'farmasi', isActive: true, createdAt: now, updatedAt: now },
    { id: 'user-6', username: 'klaim.rini', fullName: 'Rini Susanti', role: 'admin_klaim', isActive: true, createdAt: now, updatedAt: now },
  ];

  saveUsers(users);

  // Initialize default permissions
  const roles = ['admin', 'dokter', 'perawat', 'farmasi', 'kasir', 'admin_klaim'];
  const permissions: RolePermission[] = roles.map(role => ({
    roleId: role,
    roleName: ROLE_LABELS[role] || role,
    modules: MODULE_LIST.map(mod => ({
      moduleId: mod.id,
      moduleName: mod.name,
      read: role === 'admin' ? true : false,
      write: role === 'admin' ? true : false,
      delete: role === 'admin' ? true : false,
    })),
  }));

  // Set specific permissions for each role
  const roleModuleAccess: Record<string, string[]> = {
    dokter: ['admission', 'rme', 'radiologi', 'laboratorium', 'farmasi'],
    perawat: ['admission', 'rme', 'radiologi', 'laboratorium'],
    farmasi: ['farmasi', 'billing'],
    kasir: ['billing', 'kasir'],
    admin_klaim: ['klaim', 'billing'],
  };

  permissions.forEach(perm => {
    if (perm.roleId === 'admin') return;
    const accessModules = roleModuleAccess[perm.roleId] || [];
    perm.modules.forEach(mod => {
      if (accessModules.includes(mod.moduleId)) {
        mod.read = true;
        mod.write = true;
        mod.delete = false;
      }
    });
  });

  savePermissions(permissions);
}

export function getUsers(search?: string): SystemUser[] {
  initializeSeedData();
  let users = getAllUsers();

  if (search && search.trim().length >= 2) {
    const q = search.trim().toLowerCase();
    users = users.filter(u =>
      u.fullName.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q)
    );
  }

  return users.sort((a, b) => a.fullName.localeCompare(b.fullName));
}

export function getUserById(id: string): SystemUser | null {
  initializeSeedData();
  return getAllUsers().find(u => u.id === id) || null;
}

export function createUser(data: {
  username: string;
  fullName: string;
  role: SystemUser['role'];
}): SystemUser {
  initializeSeedData();

  if (data.username.length > 50) {
    throw new Error('Username maksimal 50 karakter');
  }

  const users = getAllUsers();
  const exists = users.find(u => u.username.toLowerCase() === data.username.toLowerCase());
  if (exists) {
    throw new Error('Username sudah digunakan');
  }

  const now = new Date().toISOString();
  const newUser: SystemUser = {
    id: generateId(),
    username: data.username,
    fullName: data.fullName,
    role: data.role,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  users.push(newUser);
  saveUsers(users);
  return newUser;
}

export function updateUser(id: string, data: {
  fullName?: string;
  role?: SystemUser['role'];
  isActive?: boolean;
}): SystemUser {
  initializeSeedData();
  const users = getAllUsers();
  const index = users.findIndex(u => u.id === id);

  if (index === -1) throw new Error('User tidak ditemukan');

  // Prevent deactivating last active admin
  if (data.isActive === false && users[index].role === 'admin') {
    const activeAdmins = users.filter(u => u.role === 'admin' && u.isActive && u.id !== id);
    if (activeAdmins.length === 0) {
      throw new Error('Tidak dapat menonaktifkan admin terakhir yang aktif');
    }
  }

  const now = new Date().toISOString();
  users[index] = {
    ...users[index],
    ...data,
    updatedAt: now,
  };

  saveUsers(users);
  return users[index];
}

export function deactivateUser(id: string): SystemUser {
  return updateUser(id, { isActive: false });
}

export function getRolePermissions(): RolePermission[] {
  initializeSeedData();
  return getAllPermissions();
}

export function updateRolePermission(roleId: string, moduleId: string, permission: { read?: boolean; write?: boolean; delete?: boolean }): void {
  initializeSeedData();
  const permissions = getAllPermissions();
  const roleIndex = permissions.findIndex(p => p.roleId === roleId);

  if (roleIndex === -1) throw new Error('Role tidak ditemukan');

  const modIndex = permissions[roleIndex].modules.findIndex(m => m.moduleId === moduleId);
  if (modIndex === -1) throw new Error('Module tidak ditemukan');

  permissions[roleIndex].modules[modIndex] = {
    ...permissions[roleIndex].modules[modIndex],
    ...permission,
  };

  savePermissions(permissions);
}

export function getRoleLabel(role: string): string {
  return ROLE_LABELS[role] || role;
}

export function getModuleList() {
  return MODULE_LIST;
}

export const pengaturanService = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deactivateUser,
  getRolePermissions,
  updateRolePermission,
  getRoleLabel,
  getModuleList,
  initializeSeedData,
};

export default pengaturanService;
