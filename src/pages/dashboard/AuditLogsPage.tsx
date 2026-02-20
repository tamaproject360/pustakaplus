import { useState, useEffect, useCallback } from 'react';
import { Search, ClipboardList, RefreshCw } from 'lucide-react';
import api from '../../lib/api';
import { AuditLog } from '../../lib/types';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import { formatDateTime } from '../../lib/utils';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (entityFilter) params.set('entityType', entityFilter);
      if (search) params.set('search', search);
      const query = params.toString() ? `?${params.toString()}` : '';
      const res = await api.get<AuditLog[]>(`/audit-logs${query}`);
      if (res.data) setLogs(res.data);
    } catch {}
    setLoading(false);
  }, [search, entityFilter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const actionColors: Record<string, string> = {
    CREATE: 'bg-green-100 text-green-700',
    UPDATE: 'bg-blue-100 text-blue-700',
    DELETE: 'bg-red-100 text-red-700',
    LOGIN: 'bg-amber-100 text-amber-700',
    BORROW: 'bg-teal-100 text-teal-700',
    RETURN: 'bg-emerald-100 text-emerald-700',
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
          <p className="text-gray-500 text-sm mt-0.5">Riwayat semua aktivitas sistem</p>
        </div>
        <button onClick={fetchLogs} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari aktivitas..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none bg-white" />
        </div>
        <select value={entityFilter} onChange={e => setEntityFilter(e.target.value)} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none bg-white">
          <option value="">Semua Entitas</option>
          <option value="collection">Koleksi</option>
          <option value="borrowing">Peminjaman</option>
          <option value="knowledge">Knowledge</option>
          <option value="user">Pengguna</option>
          <option value="auth">Autentikasi</option>
        </select>
      </div>

      {loading ? <LoadingSpinner className="py-16" /> : logs.length === 0 ? (
        <EmptyState icon={ClipboardList} title="Belum Ada Log" description="Belum ada aktivitas yang tercatat." />
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Waktu</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Pengguna</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Aksi</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Entitas</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDateTime(log.created_at)}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800 text-sm">{log.user?.name || 'Sistem'}</p>
                      <p className="text-xs text-gray-400">{log.user?.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${actionColors[log.action] || 'bg-gray-100 text-gray-700'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-gray-600 text-xs">{log.entity_type}</p>
                      {log.entity_id && <p className="text-gray-400 text-xs font-mono truncate max-w-xs">{log.entity_id.slice(0, 8)}...</p>}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {log.details && (
                        <p className="text-xs text-gray-500 max-w-xs truncate">
                          {JSON.stringify(log.details)}
                        </p>
                      )}
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
