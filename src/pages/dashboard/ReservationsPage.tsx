import { useState, useEffect, useCallback } from 'react';
import { Calendar, X, Clock, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Reservation } from '../../lib/types';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';
import { formatDate, statusColors, statusLabels } from '../../lib/utils';

export default function ReservationsPage() {
  const { profile } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  const isStaff = profile?.role === 'pustakawan' || profile?.role === 'super_admin';

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    let q = supabase
      .from('reservations')
      .select('*, collection:collections(id, title, cover_url, available_copies), user:profiles!user_id(id, name, email)')
      .order('reservation_date', { ascending: false });

    if (!isStaff) q = q.eq('user_id', profile?.id || '');
    const { data } = await q;
    if (data) setReservations(data as Reservation[]);
    setLoading(false);
  }, [isStaff, profile?.id]);

  useEffect(() => { fetchReservations(); }, [fetchReservations]);

  const handleCancel = async (id: string) => {
    await supabase.from('reservations').update({ status: 'dibatalkan' }).eq('id', id);
    fetchReservations();
  };

  const handleNotify = async (id: string) => {
    await supabase.from('reservations').update({ status: 'tersedia', notified_at: new Date().toISOString() }).eq('id', id);
    fetchReservations();
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reservasi Buku</h1>
        <p className="text-gray-500 text-sm mt-0.5">{isStaff ? 'Kelola antrian reservasi' : 'Reservasi buku Anda'}</p>
      </div>

      {loading ? <LoadingSpinner className="py-16" /> : reservations.length === 0 ? (
        <EmptyState icon={Calendar} title="Belum Ada Reservasi" description="Belum ada reservasi buku." />
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Koleksi</th>
                  {isStaff && <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Pemesanan</th>}
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Tanggal Reservasi</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Antrian</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {reservations.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{r.collection?.title || 'Buku'}</p>
                      <p className="text-xs text-gray-500">
                        {r.collection?.available_copies ? <span className="text-green-600">Tersedia</span> : <span className="text-amber-600">Habis dipinjam</span>}
                      </p>
                    </td>
                    {isStaff && (
                      <td className="px-4 py-3 hidden md:table-cell">
                        <p className="text-gray-700">{r.user?.name}</p>
                        <p className="text-xs text-gray-400">{r.user?.email}</p>
                      </td>
                    )}
                    <td className="px-4 py-3 hidden sm:table-cell text-gray-600">{formatDate(r.reservation_date)}</td>
                    <td className="px-4 py-3">
                      {r.queue_position ? (
                        <span className="font-medium text-gray-700">#{r.queue_position}</span>
                      ) : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={statusColors[r.status]}>{statusLabels[r.status]}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isStaff && r.status === 'menunggu' && (
                          <button onClick={() => handleNotify(r.id)} className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700">
                            Tersedia
                          </button>
                        )}
                        {r.status === 'menunggu' && (
                          <button onClick={() => handleCancel(r.id)} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200">
                            Batalkan
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
