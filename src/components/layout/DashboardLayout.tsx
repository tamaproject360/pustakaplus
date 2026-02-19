import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, Bell } from 'lucide-react';
import Sidebar from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';

export default function DashboardLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { profile } = useAuth();
  const location = useLocation();

  const getBreadcrumb = () => {
    const parts = location.pathname.split('/').filter(Boolean);
    const labels: Record<string, string> = {
      dashboard: 'Dashboard',
      collections: 'Koleksi',
      borrowings: 'Peminjaman',
      reservations: 'Reservasi',
      knowledges: 'Knowledge',
      'guest-book': 'Buku Tamu',
      users: 'Pengguna',
      reports: 'Laporan',
      'audit-logs': 'Audit Log',
      notifications: 'Notifikasi',
      settings: 'Pengaturan',
      profile: 'Profil',
      new: 'Tambah Baru',
      edit: 'Edit',
    };
    return parts.map(p => labels[p] || p);
  };

  const breadcrumbs = getBreadcrumb();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileSidebarOpen(false)} />
          <div className="absolute inset-y-0 left-0 z-50">
            <Sidebar />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 h-16 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-500"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>

            <nav className="hidden sm:flex items-center gap-1.5 text-sm">
              <Link to="/" className="text-gray-400 hover:text-gray-600 transition-colors">
                <Home className="w-4 h-4" />
              </Link>
              {breadcrumbs.map((crumb, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <span className="text-gray-300">/</span>
                  <span className={i === breadcrumbs.length - 1 ? 'font-medium text-gray-900' : 'text-gray-500'}>{crumb}</span>
                </span>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/dashboard/notifications" className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg relative">
              <Bell className="w-5 h-5" />
            </Link>
            {profile && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white" style={{ background: '#1B3A5C' }}>
                  {profile.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-700">{profile.name}</span>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
