import { useState, useEffect, useCallback } from 'react';
import { Search, BookMarked, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../../lib/api';
import { Borrowing } from '../../lib/types';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { formatDate, formatCurrency, statusColors, statusLabels, isOverdue } from '../../lib/utils';

export default function BorrowingsPage() {
  const { profile } = useAuth();
  const [borrowings, setBorrowings] = useState<Borrowing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [returnModal, setReturnModal] = useState<Borrowing | null>(null);
  const [returning, setReturning] = useState(false);

  const isStaff = profile?.role === 'pustakawan' || profile?.role === 'super_admin';

  const fetchBorrowings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (search) params.set('search', search);
      const query = params.toString() ? `?${params.toString()}` : '';
      const res = await api.get<Borrowing[]>(`/borrowings${query}`);
      if (res.data) {
        const processed = res.data.map(b => ({
          ...b,
          status: b.return_date ? 'dikembalikan' : isOverdue(b.due_date) && b.status === 'dipinjam' ? 'terlambat' : b.status,
        }));
        setBorrowings(processed);
      }
    } catch {}
    setLoading(false);
  }, [isStaff, profile?.id, statusFilter, search]);

  useEffect(() => { fetchBorrowings(); }, [fetchBorrowings]);

  const handleReturn = async () => {
    if (!returnModal) return;
    setReturning(true);
    try {
      await api.put(`/borrowings/${returnModal.id}/return`);
      setReturnModal(null);
      fetchBorrowings();
    } catch {}
    setReturning(false);
  };

  const stats = {
    active: borrowings.filter(b => b.status === 'dipinjam').length,
    late: borrowings.filter(b => b.status === 'terlambat').length,
    returned: borrowings.filter(b => b.status === 'dikembalikan').length,
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Peminjaman</h1>
          <p className="text-gray-500 text-sm mt-0.5">{isStaff ? 'Kelola semua peminjaman' : 'Riwayat peminjaman Anda'}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Sedang Dipinjam', value: stats.active, icon: BookMarked, color: 'bg-blue-50 text-blue-700' },
          { label: 'Terlambat', value: stats.late, icon: AlertCircle, color: 'bg-red-50 text-red-700' },
          { label: 'Dikembalikan', value: stats.returned, icon: CheckCircle, color: 'bg-green-50 text-green-700' },
        ].map((s, i) => (
          <div key={i} className={`flex items-center gap-3 p-4 rounded-xl ${s.color.split(' ')[0]}`}>
            <s.icon className={`w-5 h-5 ${s.color.split(' ')[1]}`} />
            <div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs opacity-75">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari judul buku atau nama peminjam..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none bg-white" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none bg-white">
          <option value="">Semua Status</option>
          <option value="dipinjam">Dipinjam</option>
          <option value="terlambat">Terlambat</option>
          <option value="dikembalikan">Dikembalikan</option>
        </select>
      </div>

      {loading ? <LoadingSpinner className="py-16" /> : borrowings.length === 0 ? (
        <EmptyState icon={BookMarked} title="Belum Ada Peminjaman" description="Belum ada data peminjaman yang sesuai filter." />
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Koleksi</th>
                  {isStaff && <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Peminjam</th>}
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Tgl Pinjam</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Jatuh Tempo</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Denda</th>
                  {isStaff && <th className="text-right px-4 py-3 font-semibold text-gray-600">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {borrowings.map(b => (
                  <tr key={b.id} className={`hover:bg-gray-50 transition-colors ${b.status === 'terlambat' ? 'bg-red-50/30' : ''}`}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 line-clamp-1">{b.collection?.title || 'Buku'}</p>
                    </td>
                    {isStaff && (
                      <td className="px-4 py-3 hidden md:table-cell">
                        <p className="text-gray-700">{b.user?.name}</p>
                        <p className="text-xs text-gray-400">{b.user?.email}</p>
                      </td>
                    )}
                    <td className="px-4 py-3 hidden sm:table-cell text-gray-600">{formatDate(b.borrow_date, 'd MMM yyyy')}</td>
                    <td className="px-4 py-3">
                      <p className={`text-sm ${isOverdue(b.due_date) && b.status !== 'dikembalikan' ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                        {formatDate(b.due_date, 'd MMM yyyy')}
                      </p>
                      {b.return_date && <p className="text-xs text-green-600">Kembali: {formatDate(b.return_date, 'd MMM')}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={statusColors[b.status]}>{statusLabels[b.status]}</Badge>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {b.fine_amount > 0 ? (
                        <span className={`text-sm font-medium ${b.fine_paid ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(b.fine_amount)}
                          {b.fine_paid && <span className="text-xs text-gray-400 ml-1">(lunas)</span>}
                        </span>
                      ) : <span className="text-gray-400">—</span>}
                    </td>
                    {isStaff && (
                      <td className="px-4 py-3 text-right">
                        {b.status !== 'dikembalikan' && (
                          <button
                            onClick={() => setReturnModal(b)}
                            className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors"
                          >
                            Kembalikan
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={!!returnModal} onClose={() => setReturnModal(null)} title="Proses Pengembalian" size="sm">
        {returnModal && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="font-semibold text-gray-800">{returnModal.collection?.title}</p>
              <p className="text-sm text-gray-500 mt-1">Peminjam: {returnModal.user?.name}</p>
              <p className="text-sm text-gray-500">Jatuh tempo: {formatDate(returnModal.due_date)}</p>
            </div>

            {isOverdue(returnModal.due_date) && (
              <div className="flex items-start gap-2 p-3 bg-red-50 rounded-xl text-sm text-red-700">
                <AlertCircle className="w-4 h-4 mt-0.5" />
                <div>
                  <p className="font-semibold">Terlambat!</p>
                  <p>Denda: Rp 1.000/hari × {Math.ceil((Date.now() - new Date(returnModal.due_date).getTime()) / 86400000)} hari = {formatCurrency(Math.ceil((Date.now() - new Date(returnModal.due_date).getTime()) / 86400000) * 1000)}</p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setReturnModal(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium">Batal</button>
              <button onClick={handleReturn} disabled={returning} className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-50">
                {returning ? 'Memproses...' : 'Konfirmasi Kembali'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
