import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import AppLayout from '@/layouts/AppLayout';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import EnquiriesPage from '@/pages/EnquiriesPage';
import QuotesPage from '@/pages/QuotesPage';
import JobsPage from '@/pages/JobsPage';
import ImportPage from '@/pages/ImportPage';
import DataViewerPage from '@/pages/DataViewerPage';
import UsersPage from '@/pages/UsersPage';
import Spinner from '@/components/ui/Spinner';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center"><Spinner size="lg" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center"><Spinner size="lg" /></div>;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="enquiries" element={<EnquiriesPage />} />
        <Route path="quotes" element={<ProtectedRoute roles={['admin', 'manager']}><QuotesPage /></ProtectedRoute>} />
        <Route path="jobs" element={<JobsPage />} />
        <Route path="import" element={<ProtectedRoute roles={['admin', 'manager']}><ImportPage /></ProtectedRoute>} />
        <Route path="data" element={<ProtectedRoute roles={['admin']}><DataViewerPage /></ProtectedRoute>} />
        <Route path="users" element={<ProtectedRoute roles={['admin']}><UsersPage /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
