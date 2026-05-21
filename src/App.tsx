import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { AuthGuard } from '@/components/guards/AuthGuard';
import { MainLayout } from '@/components/layout/MainLayout';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Login } from '@/pages/Login';

// Lazy load all module pages
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Referensi = lazy(() => import('@/pages/referensi/index'));
const Admission = lazy(() => import('@/pages/admission/index'));
const RME = lazy(() => import('@/pages/rme/index'));
const Billing = lazy(() => import('@/pages/billing/index'));
const Radiologi = lazy(() => import('@/pages/radiologi/index'));
const Laboratorium = lazy(() => import('@/pages/laboratorium/index'));
const Farmasi = lazy(() => import('@/pages/farmasi/index'));
const Kasir = lazy(() => import('@/pages/kasir/index'));
const Klaim = lazy(() => import('@/pages/klaim/index'));
const Jasa = lazy(() => import('@/pages/jasa/index'));
const Pengaturan = lazy(() => import('@/pages/pengaturan/index'));
const BillingReal = lazy(() => import('@/pages/billing-real/index'));
const GeneralConsent = lazy(() => import('@/pages/general-consent/index'));
const NotFound = lazy(() => import('@/pages/NotFound'));

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense
          fallback={
            <div className="flex h-screen items-center justify-center">
              <LoadingSpinner size="lg" />
            </div>
          }
        >
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={
                <AuthGuard>
                  <MainLayout />
                </AuthGuard>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="referensi" element={<Referensi />} />
              <Route path="admission" element={<Admission />} />
              <Route path="rme" element={<RME />} />
              <Route path="billing" element={<Billing />} />
              <Route path="radiologi" element={<Radiologi />} />
              <Route path="laboratorium" element={<Laboratorium />} />
              <Route path="farmasi" element={<Farmasi />} />
              <Route path="kasir" element={<Kasir />} />
              <Route path="klaim" element={<Klaim />} />
              <Route path="jasa" element={<Jasa />} />
              <Route path="pengaturan" element={<Pengaturan />} />
              <Route path="billing-real" element={<BillingReal />} />
              <Route path="general-consent" element={<GeneralConsent />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
