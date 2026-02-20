import { useState, useEffect } from 'react';
import { Save, RefreshCw } from 'lucide-react';
import api from '../../lib/api';
import { SystemConfig } from '../../lib/types';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function SettingsPage() {
  const [, setConfigs] = useState<SystemConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    api.get<SystemConfig[]>('/settings')
      .then(res => {
        if (res.data) {
          setConfigs(res.data);
          const v: Record<string, string> = {};
          res.data.forEach(c => { v[c.key] = c.value; });
          setValues(v);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async (key: string) => {
    setSaving(key);
    try {
      await api.put(`/settings/${key}`, { value: values[key] });
      setSaved(key);
      setTimeout(() => setSaved(null), 2000);
    } catch {}
    setSaving(null);
  };

  if (loading) return <LoadingSpinner className="py-20" />;

  const configGroups = [
    { title: 'Konfigurasi Peminjaman', keys: ['max_borrow_limit', 'borrow_duration_days', 'fine_per_day'] },
    { title: 'Informasi Aplikasi', keys: ['app_name', 'app_description', 'institution_name'] },
  ];

  const configMeta: Record<string, { label: string; desc: string; type: string }> = {
    max_borrow_limit: { label: 'Batas Maksimal Peminjaman', desc: 'Jumlah buku yang dapat dipinjam per pengguna sekaligus', type: 'number' },
    borrow_duration_days: { label: 'Durasi Peminjaman Default (hari)', desc: 'Lama waktu peminjaman standar sebelum jatuh tempo', type: 'number' },
    fine_per_day: { label: 'Denda per Hari (Rupiah)', desc: 'Besaran denda keterlambatan per hari', type: 'number' },
    app_name: { label: 'Nama Aplikasi', desc: 'Nama yang ditampilkan di header aplikasi', type: 'text' },
    app_description: { label: 'Deskripsi Aplikasi', desc: 'Deskripsi singkat aplikasi', type: 'text' },
    institution_name: { label: 'Nama Instansi', desc: 'Nama instansi/lembaga yang mengoperasikan sistem', type: 'text' },
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan Sistem</h1>
        <p className="text-gray-500 text-sm mt-0.5">Konfigurasi parameter sistem perpustakaan</p>
      </div>

      {configGroups.map(group => (
        <div key={group.title} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-semibold text-gray-800">{group.title}</h3>
          </div>
          <div className="p-6 space-y-5">
            {group.keys.map(key => {
              const meta = configMeta[key] || { label: key, desc: '', type: 'text' };
              return (
                <div key={key}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-800 mb-0.5">{meta.label}</label>
                      {meta.desc && <p className="text-xs text-gray-500 mb-2">{meta.desc}</p>}
                      <input
                        type={meta.type}
                        value={values[key] || ''}
                        onChange={e => setValues(v => ({ ...v, [key]: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2"
                        style={{ '--tw-ring-color': '#1B3A5C' } as React.CSSProperties}
                      />
                    </div>
                    <button
                      onClick={() => handleSave(key)}
                      disabled={saving === key}
                      className={`mt-7 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${saved === key ? 'bg-green-600 text-white' : 'text-white hover:opacity-90'}`}
                      style={saved === key ? {} : { backgroundColor: '#1B3A5C' }}
                    >
                      {saving === key ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {saved === key ? 'Tersimpan!' : 'Simpan'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
