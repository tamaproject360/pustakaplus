import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, BookMarked, Brain, Users, AlertCircle, Clock, TrendingUp, CheckCircle, ArrowRight, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Borrowing, Knowledge } from '../../lib/types';
import StatsCard from '../../components/ui/StatsCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Badge from '../../components/ui/Badge';
import { formatDate, statusColors, statusLabels, knowledgeTypeColors, knowledgeTypeLabels } from '../../lib/utils';

export default function DashboardPage() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ collections: 0, borrowings: 0, activeBorrowings: 0, knowledge: 0, users: 0, overdue: 0, visits: 0, pendingReview: 0 });
  const [recentBorrowings, setRecentBorrowings] = useState<Borrowing[]>([]);
  const [recentKnowledge, setRecentKnowledge] = useState<Knowledge[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<{ month: string; borrowings: number }[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      const queries = [
        supabase.from('collections').select('id', { count: 'exact', head: true }),
        supabase.from('borrowings').select('id', { count: 'exact', head: true }),
        supabase.from('borrowings').select('id', { count: 'exact', head: true }).eq('status', 'dipinjam'),
        supabase.from('knowledges').select('id', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('borrowings').select('id', { count: 'exact', head: true }).eq('status', 'terlambat'),
        supabase.from('guest_book').select('id', { count: 'exact', head: true }),
        supabase.from('knowledges').select('id', { count: 'exact', head: true }).eq('status', 'submitted'),
      ];

      const results = await Promise.all(queries);
      setStats({
        collections: results[0].count || 0,
        borrowings: results[1].count || 0,
        activeBorrowings: results[2].count || 0,
        knowledge: results[3].count || 0,
        users: results[4].count || 0,
        overdue: results[5].count || 0,
        visits: results[6].count || 0,
        pendingReview: results[7].count || 0,
      });

      const [borrowingsRes, knowledgeRes] = await Promise.all([
        supabase.from('borrowings').select('*, collection:collections(title, cover_url), user:profiles!user_id(name)').order('created_at', { ascending: false }).limit(5),
        supabase.from('knowledges').select('*, submitter:profiles!submitted_by(name)').eq('status', 'published').order('published_at', { ascending: false }).limit(5),
      ]);
      if (borrowingsRes.data) setRecentBorrowings(borrowingsRes.data as Borrowing[]);
      if (knowledgeRes.data) setRecentKnowledge(knowledgeRes.data as Knowledge[]);

      const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'];
      const currentMonth = new Date().getMonth();
      const mockStats = Array.from({ length: 6 }, (_, i) => ({
        month: months[(currentMonth - 5 + i + 12) % 12],
        borrowings: Math.floor(Math.random() * 40) + 10,
      }));
      setMonthlyStats(mockStats);

      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner className="py-20" />;

  const roleSpecificStats = () => {
    if (profile?.role === 'super_admin') {
      return [
        { title: 'Total Koleksi', value: stats.collections, icon: BookOpen, color: 'blue' as const },
        { title: 'Total Pengguna', value: stats.users, icon: Users, color: 'green' as const },
        { title: 'Peminjaman Aktif', value: stats.activeBorrowings, icon: BookMarked, color: 'amber' as const },
        { title: 'Knowledge Tersedia', value: stats.knowledge, icon: Brain, color: 'teal' as const },
      ];
    }
    if (profile?.role === 'pustakawan') {
      return [
        { title: 'Total Koleksi', value: stats.collections, icon: BookOpen, color: 'blue' as const },
        { title: 'Dipinjam Hari Ini', value: stats.activeBorrowings, icon: BookMarked, color: 'amber' as const },
        { title: 'Terlambat', value: stats.overdue, icon: AlertCircle, color: 'red' as const },
        { title: 'Review Pending', value: stats.pendingReview, icon: Clock, color: 'teal' as const },
      ];
    }
    if (profile?.role === 'kontributor') {
      return [
        { title: 'Knowledge Saya', value: recentKnowledge.length, icon: Brain, color: 'blue' as const },
        { title: 'Telah Dipublish', value: stats.knowledge, icon: CheckCircle, color: 'green' as const },
        { title: 'Kunjungan', value: stats.visits, icon: TrendingUp, color: 'amber' as const },
        { title: 'Total Koleksi', value: stats.collections, icon: BookOpen, color: 'teal' as const },
      ];
    }
    return [
      { title: 'Total Koleksi', value: stats.collections, icon: BookOpen, color: 'blue' as const },
      { title: 'Sedang Dipinjam', value: stats.activeBorrowings, icon: BookMarked, color: 'amber' as const },
      { title: 'Knowledge Tersedia', value: stats.knowledge, icon: Brain, color: 'green' as const },
      { title: 'Total Kunjungan', value: stats.visits, icon: Calendar, color: 'teal' as const },
    ];
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Selamat datang, {profile?.name?.split(' ')[0] || 'Pengguna'}!
        </h1>
        <p className="text-gray-500 text-sm mt-1">Berikut ringkasan aktivitas perpustakaan hari ini.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {roleSpecificStats().map((stat, i) => (
          <StatsCard key={i} {...stat} />
        ))}
      </div>

      {stats.overdue > 0 && (profile?.role === 'pustakawan' || profile?.role === 'super_admin') && (
        <div className="flex items-center justify-between p-4 bg-red-50 border border-red-100 rounded-xl">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div>
              <p className="font-semibold text-red-800 text-sm">{stats.overdue} peminjaman terlambat</p>
              <p className="text-red-600 text-xs">Perlu segera diproses</p>
            </div>
          </div>
          <Link to="/dashboard/borrowings?status=terlambat" className="text-sm font-medium text-red-700 hover:text-red-900 flex items-center gap-1">
            Lihat <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Borrowings Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Tren Peminjaman (6 Bulan)</h3>
            <Link to="/dashboard/reports" className="text-sm text-blue-600 hover:text-blue-800">Lihat Laporan</Link>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyStats} barSize={30}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="borrowings" fill="#1B3A5C" radius={[6, 6, 0, 0]} name="Peminjaman" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Ringkasan Cepat</h3>
          <div className="space-y-4">
            {[
              { label: 'Total Peminjaman', value: stats.borrowings, color: '#1B3A5C' },
              { label: 'Sedang Dipinjam', value: stats.activeBorrowings, color: '#F59E0B' },
              { label: 'Terlambat', value: stats.overdue, color: '#EF4444' },
              { label: 'Kunjungan Buku Tamu', value: stats.visits, color: '#10B981' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-gray-600">{item.label}</span>
                </div>
                <span className="font-semibold text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 space-y-2">
            <Link to="/dashboard/borrowings" className="flex items-center justify-between p-2.5 hover:bg-gray-50 rounded-lg text-sm text-gray-700 transition-colors">
              <span>Kelola Peminjaman</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>
            <Link to="/catalog" className="flex items-center justify-between p-2.5 hover:bg-gray-50 rounded-lg text-sm text-gray-700 transition-colors">
              <span>Jelajahi Katalog</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>
            <Link to="/knowledge" className="flex items-center justify-between p-2.5 hover:bg-gray-50 rounded-lg text-sm text-gray-700 transition-colors">
              <span>Knowledge Base</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Borrowings */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Peminjaman Terbaru</h3>
            <Link to="/dashboard/borrowings" className="text-sm text-blue-600 hover:text-blue-800">Lihat Semua</Link>
          </div>
          {recentBorrowings.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">Belum ada peminjaman</p>
          ) : (
            <div className="space-y-3">
              {recentBorrowings.map(b => (
                <div key={b.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{b.collection?.title || 'Buku'}</p>
                    <p className="text-xs text-gray-500">{b.user?.name} · {formatDate(b.borrow_date, 'd MMM')}</p>
                  </div>
                  <Badge className={statusColors[b.status]}>{statusLabels[b.status]}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Knowledge */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Knowledge Terbaru</h3>
            <Link to="/knowledge" className="text-sm text-blue-600 hover:text-blue-800">Lihat Semua</Link>
          </div>
          {recentKnowledge.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">Belum ada knowledge</p>
          ) : (
            <div className="space-y-3">
              {recentKnowledge.map(k => (
                <div key={k.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Brain className="w-5 h-5 text-teal-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{k.title}</p>
                    <p className="text-xs text-gray-500">{k.submitter?.name} · {k.views_count} views</p>
                  </div>
                  <Badge className={knowledgeTypeColors[k.type]}>{knowledgeTypeLabels[k.type]}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
