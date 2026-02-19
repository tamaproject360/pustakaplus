import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';

import HomePage from './pages/public/HomePage';
import CatalogPage from './pages/public/CatalogPage';
import CollectionDetailPage from './pages/public/CollectionDetailPage';
import KnowledgeBasePage from './pages/public/KnowledgeBasePage';
import KnowledgeDetailPage from './pages/public/KnowledgeDetailPage';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

import DashboardPage from './pages/dashboard/DashboardPage';
import CollectionsPage from './pages/dashboard/CollectionsPage';
import BorrowingsPage from './pages/dashboard/BorrowingsPage';
import ReservationsPage from './pages/dashboard/ReservationsPage';
import KnowledgesPage from './pages/dashboard/KnowledgesPage';
import GuestBookPage from './pages/dashboard/GuestBookPage';
import UsersPage from './pages/dashboard/UsersPage';
import ReportsPage from './pages/dashboard/ReportsPage';
import AuditLogsPage from './pages/dashboard/AuditLogsPage';
import NotificationsPage from './pages/dashboard/NotificationsPage';
import SettingsPage from './pages/dashboard/SettingsPage';
import ProfilePage from './pages/dashboard/ProfilePage';

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
          <Route path="/catalog" element={<PublicLayout><CatalogPage /></PublicLayout>} />
          <Route path="/catalog/:id" element={<PublicLayout><CollectionDetailPage /></PublicLayout>} />
          <Route path="/knowledge" element={<PublicLayout><KnowledgeBasePage /></PublicLayout>} />
          <Route path="/knowledge/:id" element={<PublicLayout><KnowledgeDetailPage /></PublicLayout>} />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="collections" element={<CollectionsPage />} />
            <Route path="borrowings" element={<BorrowingsPage />} />
            <Route path="reservations" element={<ReservationsPage />} />
            <Route path="knowledges" element={<KnowledgesPage />} />
            <Route path="guest-book" element={<GuestBookPage />} />
            <Route path="users" element={<ProtectedRoute roles={['super_admin']}><UsersPage /></ProtectedRoute>} />
            <Route path="reports" element={<ProtectedRoute roles={['pustakawan', 'super_admin']}><ReportsPage /></ProtectedRoute>} />
            <Route path="audit-logs" element={<ProtectedRoute roles={['super_admin']}><AuditLogsPage /></ProtectedRoute>} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="settings" element={<ProtectedRoute roles={['super_admin']}><SettingsPage /></ProtectedRoute>} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
