import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AppLayout } from '../app/components/layout/AppLayout';
import { useAuthStore } from '../store/authStore';

const LoginPage = lazy(() => import('../pages/LoginPage'));
const OAuth2RedirectHandler = lazy(() => import('../pages/OAuth2RedirectHandler'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const UploadPage = lazy(() => import('../pages/UploadPage'));
const FileRecordsPage = lazy(() => import('../pages/FileRecordsPage'));
const ErrorRecordsPage = lazy(() => import('../pages/ErrorRecordsPage'));
const ErrorDetailsPage = lazy(() => import('../pages/ErrorDetailsPage'));
const SearchPage = lazy(() => import('../pages/SearchPage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage'));
const DownloadPage = lazy(() => import('../pages/DownloadPage'));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/oauth2/redirect"
            element={
              <PublicRoute>
                <OAuth2RedirectHandler />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={<Navigate to="/login" replace />}
          />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="upload" element={<UploadPage />} />
            <Route path="files" element={<FileRecordsPage />} />
            <Route path="errors" element={<ErrorRecordsPage />} />
            <Route path="errors/:errorId" element={<ErrorDetailsPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="download" element={<DownloadPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

