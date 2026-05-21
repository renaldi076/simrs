export type UserRole = 'admin' | 'dokter' | 'perawat' | 'kasir' | 'apoteker' | 'radiografer' | 'analis_lab';

export type ModuleId = 
  | 'referensi' | 'admission' | 'rme' | 'billing' 
  | 'radiologi' | 'laboratorium' | 'farmasi' | 'kasir' 
  | 'klaim' | 'jasa' | 'pengaturan' | 'billing-real';

export interface ModulePermission {
  moduleId: ModuleId;
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  permissions: ModulePermission[];
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  sessionStartedAt: number | null;
  lastActivityAt: number | null;
}

export interface LoginAttempt {
  username: string;
  failedCount: number;
  lockedUntil: number | null;
}

export interface Session {
  token: string;
  userId: string;
  startedAt: number;
  expiresAt: number;
  lastActivityAt: number;
}

export type LoginResult = 
  | { success: true; user: User }
  | { success: false; error: string; lockedUntil?: number };

export type AuthAction =
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; session: Session } }
  | { type: 'LOGOUT'; payload?: { reason: 'manual' | 'inactivity' | 'expired' } }
  | { type: 'UPDATE_ACTIVITY' }
  | { type: 'SESSION_CHECK' };
