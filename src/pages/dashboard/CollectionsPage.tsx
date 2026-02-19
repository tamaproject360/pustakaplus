import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit, Trash2, BookOpen, QrCode, Star, X, ChevronDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Collection, Category } from '../../lib/types';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { formatLabels, formatDate, generateBarcode } from '../../lib/utils';

interface CollectionForm {
  title: string;
  author: string;
  publisher: string;
  publish_year: string;
  isbn: string;
  issn: string;
  format: string;
  language: string;
  subject: string;
  description: string;
  cover_url: string;
  shelf_location: string;
  total_copies: string;
  category_id: string;
  is_featured: boolean;
}

const emptyForm: CollectionForm = {
  title: '', author: '', publisher: '', publish_year: '', isbn: '', issn: '',
  format: 'buku', language: 'id', subject: '', description: '', cover_url: '',
  shelf_location: '', total_copies: '1', category_id: '', is_featured: false,
};

export default function CollectionsPage() {
  const { profile } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [formatFilter, setFormatFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Collection | null>(null);
  const [form, setForm] = useState<CollectionForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isbnLoading, setIsbnLoading] = useState(false);

  const canEdit = profile?.role === 'pustakawan' || profile?.role === 'super_admin';

  const fetchCollections = useCallback(async () => {
    setLoading(true);
    let q = supabase.from('collections').select('*, category:categories(*), tags:collection_tags(*)').order('created_at', { ascending: false });
    if (search) q = q.or(`title.ilike.%${search}%,author.ilike.%${search}%,isbn.ilike.%${search}%`);
    if (formatFilter) q = q.eq('format', formatFilter);
    const { data } = await q;
    if (data) setCollections(data as Collection[]);
    setLoading(false);
  }, [search, formatFilter]);

  useEffect(() => {
    supabase.from('categories').select('*').eq('type', 'perpustakaan').then(({ data }) => { if (data) setCategories(data); });
  }, []);

  useEffect(() => { fetchCollections(); }, [fetchCollections]);

  const openAddModal = () => { setEditItem(null); setForm(emptyForm); setShowModal(true); };
  const openEditModal = (c: Collection) => {
    setEditItem(c);
    setForm({
      title: c.title || '', author: c.author || '', publisher: c.publisher || '',
      publish_year: String(c.publish_year || ''), isbn: c.isbn || '', issn: c.issn || '',
      format: c.format || 'buku', language: c.language || 'id', subject: c.subject || '',
      description: c.description || '', cover_url: c.cover_url || '',
      shelf_location: c.shelf_location || '', total_copies: String(c.total_copies || 1),
      category_id: c.category_id || '', is_featured: c.is_featured || false,
    });
    setShowModal(true);
  };

  const handleISBNLookup = async () => {
    if (!form.isbn) return;
    setIsbnLoading(true);
    try {
      const res = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${form.isbn}&format=json&jscmd=data`);
      const data = await res.json();
      const key = `ISBN:${form.isbn}`;
      if (data[key]) {
        const book = data[key];
        setForm(prev => ({
          ...prev,
          title: book.title || prev.title,
          author: book.authors?.[0]?.name || prev.author,
          publisher: book.publishers?.[0]?.name || prev.publisher,
          publish_year: book.publish_date?.match(/\d{4}/)?.[0] || prev.publish_year,
          cover_url: book.cover?.large || book.cover?.medium || prev.cover_url,
          subject: book.subjects?.map((s: { name: string }) => s.name).slice(0, 3).join(', ') || prev.subject,
        }));
      }
    } catch {}
    setIsbnLoading(false);
  };

  const handleSave = async () => {
    if (!form.title) return;
    setSaving(true);
    const payload = {
      title: form.title, author: form.author, publisher: form.publisher,
      publish_year: form.publish_year ? parseInt(form.publish_year) : null,
      isbn: form.isbn, issn: form.issn, format: form.format, language: form.language,
      subject: form.subject, description: form.description, cover_url: form.cover_url,
      shelf_location: form.shelf_location, total_copies: parseInt(form.total_copies) || 1,
      available_copies: parseInt(form.total_copies) || 1,
      category_id: form.category_id || null, is_featured: form.is_featured,
      created_by: profile?.id,
    };

    if (editItem) {
      const { error } = await supabase.from('collections').update(payload).eq('id', editItem.id);
      if (!error) { await fetchCollections(); setShowModal(false); }
    } else {
      const barcode = generateBarcode(crypto.randomUUID());
      const { error } = await supabase.from('collections').insert({ ...payload, barcode });
      if (!error) { await fetchCollections(); setShowModal(false); }
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('collections').delete().eq('id', id);
    setDeleteConfirm(null);
    await fetchCollections();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Koleksi</h1>
          <p className="text-gray-500 text-sm mt-0.5">Katalogisasi & pengelolaan koleksi perpustakaan</p>
        </div>
        {canEdit && (
          <button onClick={openAddModal} className="flex items-center gap-2 px-4 py-2.5 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity" style={{ backgroundColor: '#1B3A5C' }}>
            <Plus className="w-4 h-4" /> Tambah Koleksi
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Cari judul, pengarang, ISBN..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 bg-white"
            style={{ '--tw-ring-color': '#1B3A5C' } as React.CSSProperties}
          />
        </div>
        <select
          value={formatFilter} onChange={e => setFormatFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none bg-white"
        >
          <option value="">Semua Format</option>
          {Object.entries(formatLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {loading ? <LoadingSpinner className="py-16" /> : collections.length === 0 ? (
        <EmptyState icon={BookOpen} title="Belum Ada Koleksi" description="Tambahkan koleksi perpustakaan pertama Anda." action={canEdit ? <button onClick={openAddModal} className="mt-4 px-4 py-2 text-white rounded-lg text-sm" style={{ backgroundColor: '#1B3A5C' }}>Tambah Koleksi</button> : undefined} />
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 w-12">#</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Judul & Pengarang</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Format</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Kategori</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Stok</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">ISBN</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                  {canEdit && <th className="text-right px-4 py-3 font-semibold text-gray-600">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {collections.map((c, i) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {c.cover_url ? <img src={c.cover_url} alt="" className="w-full h-full object-cover" /> : <BookOpen className="w-4 h-4 text-gray-400" />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 leading-tight">{c.title}</p>
                          {c.author && <p className="text-xs text-gray-500 mt-0.5">{c.author}</p>}
                          {c.is_featured && <Badge className="bg-amber-100 text-amber-600 text-xs mt-1">Unggulan</Badge>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <Badge className={`${c.format === 'buku' ? 'bg-blue-100 text-blue-700' : c.format === 'jurnal' ? 'bg-green-100 text-green-700' : c.format === 'ebook' ? 'bg-amber-100 text-amber-700' : 'bg-teal-100 text-teal-700'}`}>
                        {formatLabels[c.format]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-gray-600 text-xs">{c.category?.name || '—'}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`text-sm font-medium ${c.available_copies > 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {c.available_copies}/{c.total_copies}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-gray-500 text-xs font-mono">{c.isbn || '—'}</td>
                    <td className="px-4 py-3">
                      {c.available_copies > 0
                        ? <Badge className="bg-green-100 text-green-700">Tersedia</Badge>
                        : <Badge className="bg-red-100 text-red-600">Habis</Badge>}
                    </td>
                    {canEdit && (
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEditModal(c)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeleteConfirm(c.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Koleksi' : 'Tambah Koleksi Baru'} size="xl">
        <div className="space-y-5">
          {/* ISBN Lookup */}
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-sm font-semibold text-blue-800 mb-2">ISBN Auto-Lookup (Open Library API)</p>
            <div className="flex gap-2">
              <input
                type="text" value={form.isbn} onChange={e => setForm(f => ({ ...f, isbn: e.target.value }))}
                placeholder="Masukkan ISBN, lalu klik Lookup"
                className="flex-1 px-3 py-2 border border-blue-200 rounded-lg text-sm focus:outline-none bg-white"
              />
              <button onClick={handleISBNLookup} disabled={isbnLoading} className="px-4 py-2 text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50" style={{ backgroundColor: '#1B3A5C' }}>
                {isbnLoading ? 'Mencari...' : 'Lookup'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Judul <span className="text-red-500">*</span></label>
              <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none bg-white" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Pengarang</label>
              <input type="text" value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none bg-white" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Penerbit</label>
              <input type="text" value={form.publisher} onChange={e => setForm(f => ({ ...f, publisher: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none bg-white" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Tahun Terbit</label>
              <input type="number" value={form.publish_year} onChange={e => setForm(f => ({ ...f, publish_year: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none bg-white" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">ISSN</label>
              <input type="text" value={form.issn} onChange={e => setForm(f => ({ ...f, issn: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none bg-white" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Format</label>
              <select value={form.format} onChange={e => setForm(f => ({ ...f, format: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none bg-white">
                {Object.entries(formatLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Bahasa</label>
              <select value={form.language} onChange={e => setForm(f => ({ ...f, language: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none bg-white">
                <option value="id">Indonesia</option>
                <option value="en">Inggris</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Kategori</label>
              <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none bg-white">
                <option value="">Pilih Kategori</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Jumlah Eksemplar</label>
              <input type="number" min="1" value={form.total_copies} onChange={e => setForm(f => ({ ...f, total_copies: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none bg-white" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Lokasi Rak</label>
              <input type="text" value={form.shelf_location} onChange={e => setForm(f => ({ ...f, shelf_location: e.target.value }))} placeholder="Contoh: A1.3" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none bg-white" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">URL Cover</label>
              <input type="url" value={form.cover_url} onChange={e => setForm(f => ({ ...f, cover_url: e.target.value }))} placeholder="https://..." className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none bg-white" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Subjek</label>
              <input type="text" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none bg-white" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Deskripsi</label>
              <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none bg-white resize-none" />
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <input type="checkbox" id="featured" checked={form.is_featured} onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))} className="w-4 h-4 rounded" />
              <label htmlFor="featured" className="text-sm text-gray-700 cursor-pointer">Tandai sebagai Koleksi Unggulan</label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Batal</button>
            <button onClick={handleSave} disabled={saving || !form.title} className="px-5 py-2.5 text-white rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-50" style={{ backgroundColor: '#1B3A5C' }}>
              {saving ? 'Menyimpan...' : editItem ? 'Perbarui' : 'Simpan'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Konfirmasi Hapus" size="sm">
        <div className="text-center py-2">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>
          <p className="text-gray-700 mb-6">Apakah Anda yakin ingin menghapus koleksi ini? Tindakan ini tidak dapat dibatalkan.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => setDeleteConfirm(null)} className="px-5 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600">Batal</button>
            <button onClick={() => deleteConfirm && handleDelete(deleteConfirm)} className="px-5 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700">Hapus</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
