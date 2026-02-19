import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, BookMarked, Calendar, Brain,
  Users, FileText, ScrollText, Bell, Settings, ChevronLeft,
  ChevronRight, BookUser, BarChart3, ClipboardList
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles?: string[];
  badge?: number;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/collections', label: 'Koleksi', icon: BookOpen, roles: ['pustakawan', 'super_admin'] },
  { href: '/dashboard/borrowings', label: 'Peminjaman', icon: BookMarked },
  { href: '/dashboard/reservations', label: 'Reservasi', icon: Calendar },
  { href: '/dashboard/knowledges', label: 'Knowledge', icon: Brain },
  { href: '/dashboard/guest-book', label: 'Buku Tamu', icon: BookUser, roles: ['pustakawan', 'super_admin', 'pembaca', 'kontributor'] },
  { href: '/dashboard/users', label: 'Pengguna', icon: Users, roles: ['super_admin'] },
  { href: '/dashboard/reports', label: 'Laporan', icon: BarChart3, roles: ['pustakawan', 'super_admin'] },
  { href: '/dashboard/audit-logs', label: 'Audit Log', icon: ClipboardList, roles: ['super_admin'] },
  { href: '/dashboard/notifications', label: 'Notifikasi', icon: Bell },
  { href: '/dashboard/settings', label: 'Pengaturan', icon: Settings, roles: ['super_admin'] },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { profile } = useAuth();
  const location = useLocation();

  const filteredItems = navItems.filter(item =>
    !item.roles || (profile && item.roles.includes(profile.role))
  );

  const isActive = (href: string) => {
    if (href === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(href);
  };

  return (
    <aside className={`flex flex-col bg-white border-r border-gray-100 shadow-sm transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'} min-h-screen`}>
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#1B3A5C' }}>
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm" style={{ color: '#1B3A5C' }}>PustakaPlus</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 ml-auto"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {filteredItems.map(item => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              to={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                active
                  ? 'text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
              style={active ? { backgroundColor: '#1B3A5C' } : {}}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
              {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
              {!collapsed && item.badge && (
                <span className="ml-auto text-xs font-bold bg-amber-400 text-white rounded-full w-5 h-5 flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {!collapsed && profile && (
        <div className="px-4 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white flex-shrink-0" style={{ background: '#1B3A5C' }}>
              {profile.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-gray-900 truncate">{profile.name}</p>
              <p className="text-xs text-gray-500 truncate">{profile.unit_kerja || profile.email}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
