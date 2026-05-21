import { storageService } from './storageService';
import type {
  User,
  LoginCredentials,
  LoginResult,
  LoginAttempt,
  Session,
} from '@/types/auth';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;

interface StoredUser {
  id: string;
  username: string;
  passwordHash: string;
  fullName: string;
  role: User['role'];
  isActive: boolean;
}

function hashPassword(password: string): string {
  // Mock hash using btoa — NOT for production use
  return btoa(password);
}

function verifyPassword(password: string, hash: string): boolean {
  return btoa(password) === hash;
}

function generateToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function initializeUsers(): void {
  const existing = storageService.get<StoredUser[]>('users');
  if (existing && existing.length > 0) return;

  const defaultUsers: StoredUser[] = [
    {
      id: 'usr_001',
      username: 'admin',
      passwordHash: hashPassword('admin123'),
      fullName: 'Administrator',
      role: 'admin',
      isActive: true,
    },
    {
      id: 'usr_002',
      username: 'dokter',
      passwordHash: hashPassword('dokter123'),
      fullName: 'Dr. Ahmad Fauzi',
      role: 'dokter',
      isActive: true,
    },
    {
      id: 'usr_003',
      username: 'perawat',
      passwordHash: hashPassword('perawat123'),
      fullName: 'Siti Nurhaliza',
      role: 'perawat',
      isActive: true,
    },
    {
      id: 'usr_004',
      username: 'kasir',
      passwordHash: hashPassword('kasir123'),
      fullName: 'Budi Santoso',
      role: 'kasir',
      isActive: true,
    },
    {
      id: 'usr_005',
      username: 'apoteker',
      passwordHash: hashPassword('apoteker123'),
      fullName: 'Dewi Farmasi',
      role: 'apoteker',
      isActive: true,
    },
  ];

  storageService.set('users', defaultUsers);
}

function getLoginAttempts(): LoginAttempt[] {
  return storageService.get<LoginAttempt[]>('login_attempts') ?? [];
}

function setLoginAttempts(attempts: LoginAttempt[]): void {
  storageService.set('login_attempts', attempts);
}

function getAttemptForUser(username: string): LoginAttempt | undefined {
  const attempts = getLoginAttempts();
  return attempts.find(a => a.username === username);
}

function updateAttemptForUser(username: string, updater: (attempt: LoginAttempt) => LoginAttempt): void {
  const attempts = getLoginAttempts();
  const index = attempts.findIndex(a => a.username === username);
  if (index >= 0) {
    attempts[index] = updater(attempts[index]);
  } else {
    attempts.push(updater({ username, failedCount: 0, lockedUntil: null }));
  }
  setLoginAttempts(attempts);
}

export function login(credentials: LoginCredentials): LoginResult {
  const { username, password } = credentials;

  // Check lockout
  const attempt = getAttemptForUser(username);
  if (attempt?.lockedUntil && Date.now() < attempt.lockedUntil) {
    return {
      success: false,
      error: 'Akun terkunci',
      lockedUntil: attempt.lockedUntil,
    };
  }

  // Clear lockout if expired
  if (attempt?.lockedUntil && Date.now() >= attempt.lockedUntil) {
    updateAttemptForUser(username, (a) => ({
      ...a,
      failedCount: 0,
      lockedUntil: null,
    }));
  }

  // Find user
  const users = storageService.get<StoredUser[]>('users') ?? [];
  const storedUser = users.find(u => u.username === username && u.isActive);

  if (!storedUser || !verifyPassword(password, storedUser.passwordHash)) {
    // Increment failed attempts
    updateAttemptForUser(username, (a) => {
      const newCount = a.failedCount + 1;
      return {
        ...a,
        failedCount: newCount,
        lockedUntil: newCount >= MAX_FAILED_ATTEMPTS ? Date.now() + LOCKOUT_DURATION_MS : null,
      };
    });

    const updatedAttempt = getAttemptForUser(username);
    if (updatedAttempt?.lockedUntil) {
      return {
        success: false,
        error: 'Akun terkunci',
        lockedUntil: updatedAttempt.lockedUntil,
      };
    }

    return { success: false, error: 'Username atau password tidak valid' };
  }

  // Successful login — reset attempts
  updateAttemptForUser(username, (a) => ({
    ...a,
    failedCount: 0,
    lockedUntil: null,
  }));

  const now = Date.now();
  const session: Session = {
    token: generateToken(),
    userId: storedUser.id,
    startedAt: now,
    expiresAt: now + SESSION_DURATION_MS,
    lastActivityAt: now,
  };

  storageService.set('session', session);

  const user: User = {
    id: storedUser.id,
    username: storedUser.username,
    fullName: storedUser.fullName,
    role: storedUser.role,
    isActive: storedUser.isActive,
    permissions: [],
  };

  return { success: true, user };
}

export function logout(): void {
  storageService.remove('session');
}

export function getSession(): Session | null {
  return storageService.get<Session>('session');
}

export function isSessionValid(session: Session): boolean {
  const now = Date.now();
  if (now >= session.expiresAt) return false;
  if (now - session.lastActivityAt > INACTIVITY_TIMEOUT_MS) return false;
  return true;
}

export function updateLastActivity(): void {
  const session = getSession();
  if (!session) return;
  session.lastActivityAt = Date.now();
  storageService.set('session', session);
}
