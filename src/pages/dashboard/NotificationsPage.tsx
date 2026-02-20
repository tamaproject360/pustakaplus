import { useState, useEffect } from 'react';
import { Bell, CheckCheck, Info, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import api from '../../lib/api';
import { Notification } from '../../lib/types';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import { timeAgo } from '../../lib/utils';

const typeIcons = {
  info: Info,
  warning: AlertCircle,
  success: CheckCircle,
  error: XCircle,
};

const typeColors = {
  info: 'text-blue-600 bg-blue-50',
  warning: 'text-amber-600 bg-amber-50',
  success: 'text-green-600 bg-green-50',
  error: 'text-red-600 bg-red-50',
};

export default function NotificationsPage() {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    api.get<Notification[]>('/notifications')
      .then(res => {
        if (res.data) setNotifications(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [profile]);

  const markRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch {}
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifikasi</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {unreadCount > 0 ? `${unreadCount} notifikasi belum dibaca` : 'Semua notifikasi sudah dibaca'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">
            <CheckCheck className="w-4 h-4" /> Tandai Semua Dibaca
          </button>
        )}
      </div>

      {loading ? <LoadingSpinner className="py-16" /> : notifications.length === 0 ? (
        <EmptyState icon={Bell} title="Tidak Ada Notifikasi" description="Anda tidak memiliki notifikasi saat ini." />
      ) : (
        <div className="space-y-2">
          {notifications.map(n => {
            const Icon = typeIcons[n.type];
            const colors = typeColors[n.type];
            return (
              <div
                key={n.id}
                onClick={() => !n.is_read && markRead(n.id)}
                className={`bg-white rounded-xl border p-4 flex gap-4 cursor-pointer hover:shadow-sm transition-shadow ${n.is_read ? 'border-gray-100 opacity-75' : 'border-blue-100 shadow-sm'}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`font-semibold text-sm ${n.is_read ? 'text-gray-600' : 'text-gray-900'}`}>{n.title}</p>
                    <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(n.created_at)}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                </div>
                {!n.is_read && (
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
