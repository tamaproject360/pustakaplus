import { useState, useEffect, useCallback } from 'react';
import { BookUser, Clock, CheckCircle, Plus } from 'lucide-react';
import api from '../../lib/api';
import { GuestBook } from '../../lib/types';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import { formatDateTime, purposeLabels } from '../../lib/utils';

interface GuestBookStats {
  today: number;
  week: number;
  month: number;
}

export default function GuestBookPage() {
  const { profile } = useAuth();
  const [entries, setEntries] = useState<GuestBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [purpose, setPurpose] = useState('pinjam_buku');
  const [purposeNote, setPurposeNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<GuestBookStats>({ today: 0, week: 0, month: 0 });

  const isStaff = profile?.role === 'pustakawan' || profile?.role === 'super_admin';

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ entries: GuestBook[]; stats?: GuestBookStats }>('/guest-book');
      if (res.data) {
        setEntries(res.data.entries || (res.data as unknown as GuestBook[]));
        if (res.data.stats) setStats(res.data.stats);
      }
    } catch {}
    setLoading(false);
  }, [isStaff, profile?.id]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const handleCheckIn = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      await api.post('/guest-book/check-in', { purpose, purposeNote });
      setShowModal(false);
      setPurpose('pinjam_buku');
      setPurposeNote('');
      fetchEntries();
    } catch {}
    setSaving(false);
  };

  const handleCheckOut = async (id: string) => {
    try {
      await api.put(`/guest-book/${id}/check-out`);
      fetchEntries();
    } catch {}
  };

  const todayEntry = entries.find(e => e.user_id === profile?.id && !e.check_out_time && new Date(e.visit_date).toDateString() === new Date().toDateString());

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Buku Tamu</h1>
          <p className="text-gray-500 text-sm mt-0.5">Pencatatan kunjungan perpustakaan</p>
        </div>
        {!todayEntry && (
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 text-white rounded-xl text-sm font-medium hover:opacity-90" style={{ backgroundColor: '#1B3A5C' }}>
            <Plus className="w-4 h-4" /> Check-in
          </button>
        )}
        {todayEntry && (
          <button onClick={() => handleCheckOut(todayEntry.id)} className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700">
            <CheckCircle className="w-4 h-4" /> Check-out
          </button>
        )}
      </div>

      {todayEntry && (
        <div className="flex items-center justify-between p-4 bg-green-50 border border-green-100 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <BookUser className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-green-800 text-sm">Anda sedang check-in</p>
              <p className="text-green-600 text-xs">Tujuan: {purposeLabels[todayEntry.purpose]} · Masuk: {formatDateTime(todayEntry.visit_date)}</p>
            </div>
          </div>
          <button onClick={() => handleCheckOut(todayEntry.id)} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
            Check-out
          </button>
        </div>
      )}

      {isStaff && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Hari Ini', value: stats.today },
            { label: 'Minggu Ini', value: stats.week },
            { label: 'Bulan Ini', value: stats.month },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 text-center">
              <p className="text-3xl font-bold" style={{ color: '#1B3A5C' }}>{s.value}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {loading ? <LoadingSpinner className="py-16" /> : entries.length === 0 ? (
        <EmptyState icon={BookUser} title="Belum Ada Kunjungan" description="Belum ada catatan kunjungan perpustakaan." />
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Pengunjung</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Unit Kerja</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Tujuan</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Waktu Masuk</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Waktu Keluar</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {entries.map(e => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{e.user?.name || 'Pengunjung'}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-600">{e.user?.unit_kerja || '—'}</td>
                    <td className="px-4 py-3">
                      <p className="text-gray-700">{purposeLabels[e.purpose]}</p>
                      {e.purpose_note && <p className="text-xs text-gray-400">{e.purpose_note}</p>}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-gray-600 text-xs">{formatDateTime(e.visit_date)}</td>
                    <td className="px-4 py-3 hidden sm:table-cell text-gray-600 text-xs">{e.check_out_time ? formatDateTime(e.check_out_time) : '—'}</td>
                    <td className="px-4 py-3">
                      {e.check_out_time
                        ? <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full"><CheckCircle className="w-3 h-3" />Selesai</span>
                        : <span className="inline-flex items-center gap-1 text-xs text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full"><Clock className="w-3 h-3" />Aktif</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Check-in Buku Tamu" size="sm">
        <div className="space-y-4">
          {profile && (
            <div className="p-4 bg-gray-50 rounded-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white" style={{ background: '#1B3A5C' }}>
                {profile.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{profile.name}</p>
                <p className="text-sm text-gray-500">{profile.unit_kerja || profile.email}</p>
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tujuan Kunjungan</label>
            <select value={purpose} onChange={e => setPurpose(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none bg-white">
              {Object.entries(purposeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Keterangan <span className="text-gray-400 font-normal">(opsional)</span></label>
            <input type="text" value={purposeNote} onChange={e => setPurposeNote(e.target.value)} placeholder="Detail tujuan..." className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none" />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600">Batal</button>
            <button onClick={handleCheckIn} disabled={saving} className="flex-1 py-2.5 text-white rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-50" style={{ backgroundColor: '#1B3A5C' }}>
              {saving ? 'Menyimpan...' : 'Check-in'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
