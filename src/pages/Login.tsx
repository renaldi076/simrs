import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import type { LoginCredentials } from '@/types/auth';

export function Login(): React.ReactElement {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { state, login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [countdown, setCountdown] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (state.isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [state.isAuthenticated, navigate]);

  // Show reason-based messages from query params
  useEffect(() => {
    const reason = searchParams.get('reason');
    if (reason === 'expired') {
      setError('Sesi Anda telah berakhir');
    } else if (reason === 'inactivity') {
      setError('Sesi berakhir karena tidak aktif selama 30 menit');
    }
  }, [searchParams]);

  // Countdown timer for lockout
  useEffect(() => {
    if (!lockedUntil) {
      setCountdown('');
      return;
    }

    const updateCountdown = () => {
      const remaining = lockedUntil - Date.now();
      if (remaining <= 0) {
        setLockedUntil(null);
        setCountdown('');
        setError('');
        return;
      }
      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      setCountdown(`Akun terkunci. Coba lagi dalam ${minutes} menit ${seconds} detik`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setLoading(true);

      // Small delay to show loading state
      setTimeout(() => {
        const credentials: LoginCredentials = { username: username.trim(), password };
        const result = login(credentials);

        if (result.success) {
          navigate('/dashboard', { replace: true });
        } else {
          if (result.lockedUntil) {
            setLockedUntil(result.lockedUntil);
          } else {
            setError(result.error);
          }
        }
        setLoading(false);
      }, 300);
    },
    [username, password, login, navigate]
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-blue-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl"
      >
        {/* Logo & Title */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <Building2 className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">SIMRS</h1>
          <p className="mt-1 text-sm text-gray-500">
            Sistem Informasi Manajemen Rumah Sakit
          </p>
        </div>

        {/* Error / Lockout Messages */}
        {(error || countdown) && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-center text-sm text-red-700">
            {countdown || error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username */}
          <div>
            <label
              htmlFor="username"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              maxLength={50}
              required
              autoComplete="username"
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Masukkan username"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                minLength={8}
                maxLength={128}
                required
                autoComplete="current-password"
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Masukkan password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            disabled={!!lockedUntil}
          >
            Masuk
          </Button>
        </form>
      </motion.div>
    </div>
  );
}

export default Login;
