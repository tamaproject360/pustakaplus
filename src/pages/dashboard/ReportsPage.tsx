import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import api from '../../lib/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const COLORS = ['#1B3A5C', '#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#8B5CF6'];

interface ReportStats {
  totalBorrowings: number;
  activeBorrowings: number;
  overdueBorrowings: number;
  totalFine: number;
}

interface CollectionByFormat {
  name: string;
  value: number;
}

interface BorrowingByMonth {
  month: string;
  borrowings: number;
  returned: number;
}

interface KnowledgeByType {
  name: string;
  value: number;
}

interface TopCollection {
  title: string;
  count: number;
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [collectionByFormat, setCollectionByFormat] = useState<CollectionByFormat[]>([]);
  const [borrowingsByMonth, setBorrowingsByMonth] = useState<BorrowingByMonth[]>([]);
  const [knowledgeByType, setKnowledgeByType] = useState<KnowledgeByType[]>([]);
  const [topCollections, setTopCollections] = useState<TopCollection[]>([]);
  const [stats, setStats] = useState<ReportStats>({ totalBorrowings: 0, activeBorrowings: 0, overdueBorrowings: 0, totalFine: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [collectionsRes, borrowingsRes, knowledgesRes] = await Promise.all([
          api.get<{ byFormat: CollectionByFormat[] }>('/dashboard/reports/collections'),
          api.get<{ stats: ReportStats; byMonth: BorrowingByMonth[]; topCollections: TopCollection[] }>('/dashboard/reports/borrowings'),
          api.get<{ byType: KnowledgeByType[] }>('/dashboard/reports/knowledges'),
        ]);

        if (collectionsRes.data) {
          setCollectionByFormat(collectionsRes.data.byFormat || []);
        }

        if (borrowingsRes.data) {
          setStats(borrowingsRes.data.stats || { totalBorrowings: 0, activeBorrowings: 0, overdueBorrowings: 0, totalFine: 0 });
          setBorrowingsByMonth(borrowingsRes.data.byMonth || []);
          setTopCollections(borrowingsRes.data.topCollections || []);
        }

        if (knowledgesRes.data) {
          setKnowledgeByType(knowledgesRes.data.byType || []);
        }
      } catch {}
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner className="py-20" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laporan & Statistik</h1>
          <p className="text-gray-500 text-sm mt-0.5">Analisis data perpustakaan dan knowledge base</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
          <Download className="w-4 h-4" /> Export
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Peminjaman', value: stats.totalBorrowings, color: 'bg-blue-50 text-blue-700' },
          { label: 'Sedang Dipinjam', value: stats.activeBorrowings, color: 'bg-amber-50 text-amber-700' },
          { label: 'Terlambat', value: stats.overdueBorrowings, color: 'bg-red-50 text-red-700' },
          { label: 'Total Denda', value: `Rp ${stats.totalFine.toLocaleString()}`, color: 'bg-green-50 text-green-700' },
        ].map((s, i) => (
          <div key={i} className={`p-5 rounded-xl ${s.color.split(' ')[0]}`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className={`text-sm mt-1 ${s.color.split(' ')[1]}`}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Borrowings Trend */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Tren Peminjaman Bulanan</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={borrowingsByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8 }} />
              <Legend />
              <Line type="monotone" dataKey="borrowings" stroke="#1B3A5C" strokeWidth={2} dot={{ fill: '#1B3A5C', r: 4 }} name="Dipinjam" />
              <Line type="monotone" dataKey="returned" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981', r: 4 }} name="Dikembalikan" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Collection by Format */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Koleksi Berdasarkan Format</h3>
          {collectionByFormat.length > 0 ? (
            <div className="flex items-center justify-center gap-8">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie data={collectionByFormat} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                    {collectionByFormat.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {collectionByFormat.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-sm text-gray-600">{item.name}</span>
                    <span className="ml-auto font-semibold text-gray-900 text-sm">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <p className="text-gray-400 text-sm text-center py-8">Belum ada data koleksi</p>}
        </div>

        {/* Knowledge by Type */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Knowledge Berdasarkan Jenis</h3>
          {knowledgeByType.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={knowledgeByType} layout="vertical" barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} width={100} />
                <Tooltip />
                <Bar dataKey="value" fill="#F59E0B" radius={[0, 4, 4, 0]} name="Jumlah" />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-400 text-sm text-center py-8">Belum ada knowledge yang dipublish</p>}
        </div>

        {/* Top Collections */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Buku Paling Sering Dipinjam</h3>
          {topCollections.length > 0 ? (
            <div className="space-y-3">
              {topCollections.map((c, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{c.title}</p>
                    <div className="mt-1 bg-gray-100 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full" style={{ width: `${(c.count / topCollections[0].count) * 100}%`, backgroundColor: '#1B3A5C' }} />
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-700 flex-shrink-0">{c.count}x</span>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-400 text-sm text-center py-8">Belum ada data peminjaman</p>}
        </div>
      </div>
    </div>
  );
}
