export function validateUsername(username: string): string | null {
  if (!username) return 'Username wajib diisi';
  if (username.length > 50) return 'Username maksimal 50 karakter';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Password wajib diisi';
  if (password.length < 8) return 'Password minimal 8 karakter';
  if (password.length > 128) return 'Password maksimal 128 karakter';
  return null;
}

export function validatePhoneNumber(phone: string): string | null {
  if (!phone) return 'Nomor telepon wajib diisi';
  const digitsOnly = phone.replace(/\D/g, '');
  if (digitsOnly.length < 8 || digitsOnly.length > 15) return 'Nomor telepon harus 8-15 digit';
  return null;
}

export function validateDateNotFuture(dateStr: string): string | null {
  if (!dateStr) return 'Tanggal wajib diisi';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Format tanggal tidak valid';
  if (date > new Date()) return 'Tanggal tidak boleh di masa depan';
  return null;
}

export function validateRequired(value: string, fieldName: string): string | null {
  if (!value || !value.trim()) return `${fieldName} wajib diisi`;
  return null;
}

export function validateMaxLength(value: string, max: number, fieldName: string): string | null {
  if (value && value.length > max) return `${fieldName} maksimal ${max} karakter`;
  return null;
}

export function validateDateRange(startDate: string, endDate: string): string | null {
  if (!startDate || !endDate) return null;
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (end < start) return 'Tanggal akhir harus setelah tanggal awal';
  return null;
}
