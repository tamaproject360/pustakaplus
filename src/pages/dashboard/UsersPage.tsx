import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit, Trash2, Users, Shield, BookOpen, Brain, User } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Profile, UserRole } from '../../lib/types';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { roleLabels, roleColors, formatDate } from '../../lib/utils';

export default function UsersPage() {
  const { profile: currentProfile } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<Profile | null>(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'pembaca' as UserRole, unit_kerja: '', is_active: true });
  const [saving, setSaving] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    let q = supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (roleFilter) q = q.eq('role', roleFilter);
    const { data } = await q;
    if (data) {
      const filtered = search
        ? (data as Profile[]).filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
        : (data as Profile[]);
      setUsers(filtered);
    }
    setLoading(false);
  }, [roleFilter, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const openEdit = (u: Profile) => {
    setEditUser(u);
    setForm({ name: u.name, email: u.email, role: u.role, unit_kerja: u.unit_kerja || '', is_active: u.is_active });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!editUser) return;
    setSaving(true);
    await supabase.from('profiles').update({ name: form.name, role: form.role, unit_kerja: form.unit_kerja, is_active: form.is_active }).eq('id', editUser.id);
    setSaving(false);
    setShowModal(false);
    fetchUsers();
  };

  const handleToggleActive = async (u: Profile) => {
    await supabase.from('profiles').update({ is_active: !u.is_active }).eq('id', u.id);
    fetchUsers();
  };

  const roleStats = {
    super_admin: users.filter(u => u.role === 'super_admin').length,
    pustakawan: users.filter(u => u.role === 'pustakawan').length,
    kontributor: users.filter(u => u.role === 'kontributor').length,
    pembaca: users.filter(u => u.role === 'pembaca').length,
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Pengguna</h1>
        <p className="text-gray-500 text-sm mt-0.5">Kelola akun dan hak akses pengguna sistem</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { role: 'super_admin', icon: Shield, label: 'Super Admin', count: roleStats.super_admin },
          { role: 'pustakawan', icon: BookOpen, label: 'Pustakawan', count: roleStats.pustakawan },
          { role: 'kontributor', icon: Brain, label: 'Kontributor', count: roleStats.kontributor },
          { role: 'pembaca', icon: User, label: 'Pembaca', count: roleStats.pembaca },
        ].map(s => (
          <div key={s.role} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <s.icon className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{s.count}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama atau email..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none bg-white" />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none bg-white">
          <option value="">Semua Role</option>
          {Object.entries(roleLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {loading ? <LoadingSpinner className="py-16" /> : users.length === 0 ? (
        <EmptyState icon={Users} title="Belum Ada Pengguna" description="Tidak ada pengguna yang terdaftar." />
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Pengguna</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Unit Kerja</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Role</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Bergabung</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map(u => (
                  <tr key={u.id} className={`hover:bg-gray-50 ${!u.is_active ? 'opacity-60' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white flex-shrink-0" style={{ background: '#1B3A5C' }}>
                          {u.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{u.name}</p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-600">{u.unit_kerja || '—'}</td>
                    <td className="px-4 py-3"><Badge className={roleColors[u.role]}>{roleLabels[u.role]}</Badge></td>
                    <td className="px-4 py-3 hidden sm:table-cell text-gray-500 text-xs">{formatDate(u.created_at)}</td>
                    <td className="px-4 py-3">
                      {u.is_active
                        ? <Badge className="bg-green-100 text-green-700">Aktif</Badge>
                        : <Badge className="bg-gray-100 text-gray-500">Nonaktif</Badge>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(u)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                          <Edit className="w-4 h-4" />
                        </button>
                        {u.id !== currentProfile?.id && (
                          <button onClick={() => handleToggleActive(u)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${u.is_active ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                            {u.is_active ? 'Nonaktifkan' : 'Aktifkan'}
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

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Edit Pengguna" size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Nama</label>
            <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Role</label>
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as UserRole }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none bg-white">
              {Object.entries(roleLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Unit Kerja</label>
            <input type="text" value={form.unit_kerja} onChange={e => setForm(f => ({ ...f, unit_kerja: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="active" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4 rounded" />
            <label htmlFor="active" className="text-sm text-gray-700 cursor-pointer">Akun Aktif</label>
          </div>
          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600">Batal</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 text-white rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-50" style={{ backgroundColor: '#1B3A5C' }}>
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
