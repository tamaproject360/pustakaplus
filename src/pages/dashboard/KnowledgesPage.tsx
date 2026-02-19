import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit, Trash2, Brain, Eye, Star, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Knowledge, Category } from '../../lib/types';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { statusColors, statusLabels, knowledgeTypeColors, knowledgeTypeLabels, formatDateTime, truncate } from '../../lib/utils';

interface KnowledgeForm {
  title: string;
  summary: string;
  content: string;
  type: string;
  category_id: string;
  tags: string;
  file_url: string;
}

const emptyForm: KnowledgeForm = { title: '', summary: '', content: '', type: 'artikel', category_id: '', tags: '', file_url: '' };

export default function KnowledgesPage() {
  const { profile } = useAuth();
  const [items, setItems] = useState<Knowledge[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Knowledge | null>(null);
  const [form, setForm] = useState<KnowledgeForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [reviewModal, setReviewModal] = useState<Knowledge | null>(null);
  const [feedback, setFeedback] = useState('');

  const isStaff = profile?.role === 'pustakawan' || profile?.role === 'super_admin';
  const isContributor = profile?.role === 'kontributor';
  const canContribute = isStaff || isContributor;

  const fetchData = useCallback(async () => {
    setLoading(true);
    let q = supabase
      .from('knowledges')
      .select('*, category:categories(*), tags:knowledge_tags(*), submitter:profiles!submitted_by(id, name)')
      .order('created_at', { ascending: false });

    if (!isStaff) q = q.eq('submitted_by', profile?.id || '');
    if (statusFilter) q = q.eq('status', statusFilter);
    const { data } = await q;
    if (data) {
      const filtered = search
        ? (data as Knowledge[]).filter(k => k.title.toLowerCase().includes(search.toLowerCase()))
        : (data as Knowledge[]);
      setItems(filtered);
    }
    setLoading(false);
  }, [isStaff, profile?.id, statusFilter, search]);

  useEffect(() => {
    supabase.from('categories').select('*').eq('type', 'knowledge').then(({ data }) => { if (data) setCategories(data); });
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openAdd = () => { setEditItem(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (k: Knowledge) => {
    setEditItem(k);
    setForm({ title: k.title, summary: k.summary || '', content: k.content || '', type: k.type, category_id: k.category_id || '', tags: k.tags?.map(t => t.tag).join(', ') || '', file_url: k.file_url || '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title) return;
    setSaving(true);
    const payload = { title: form.title, summary: form.summary, content: form.content, type: form.type, category_id: form.category_id || null, file_url: form.file_url, submitted_by: profile?.id };

    let id = editItem?.id;
    if (editItem) {
      await supabase.from('knowledges').update(payload).eq('id', editItem.id);
    } else {
      const { data } = await supabase.from('knowledges').insert(payload).select().single();
      if (data) id = data.id;
    }

    if (id && form.tags) {
      await supabase.from('knowledge_tags').delete().eq('knowledge_id', id);
      const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
      if (tags.length > 0) {
        await supabase.from('knowledge_tags').insert(tags.map(tag => ({ knowledge_id: id, tag })));
      }
    }

    setSaving(false);
    setShowModal(false);
    fetchData();
  };

  const handleSubmit = async (id: string) => {
    await supabase.from('knowledges').update({ status: 'submitted' }).eq('id', id);
    fetchData();
  };

  const handleReview = async (approved: boolean) => {
    if (!reviewModal) return;
    const updateData = approved
      ? { status: 'published', reviewed_by: profile?.id, published_at: new Date().toISOString() }
      : { status: 'rejected', reviewed_by: profile?.id, rejection_feedback: feedback };
    await supabase.from('knowledges').update(updateData).eq('id', reviewModal.id);
    setReviewModal(null);
    setFeedback('');
    fetchData();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('knowledge_tags').delete().eq('knowledge_id', id);
    await supabase.from('knowledges').delete().eq('id', id);
    fetchData();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Knowledge Management</h1>
          <p className="text-gray-500 text-sm mt-0.5">{isStaff ? 'Review dan kelola knowledge base' : 'Konten yang Anda kontribusikan'}</p>
        </div>
        {canContribute && (
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 text-white rounded-xl text-sm font-medium hover:opacity-90" style={{ backgroundColor: '#1B3A5C' }}>
            <Plus className="w-4 h-4" /> Tambah Knowledge
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari knowledge..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none bg-white" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none bg-white">
          <option value="">Semua Status</option>
          <option value="draft">Draft</option>
          <option value="submitted">Menunggu Review</option>
          <option value="approved">Disetujui</option>
          <option value="rejected">Ditolak</option>
          <option value="published">Dipublish</option>
        </select>
      </div>

      {loading ? <LoadingSpinner className="py-16" /> : items.length === 0 ? (
        <EmptyState icon={Brain} title="Belum Ada Knowledge" description="Mulai kontribusi pengetahuan Anda." action={canContribute ? <button onClick={openAdd} className="mt-4 px-4 py-2 text-white rounded-lg text-sm" style={{ backgroundColor: '#1B3A5C' }}>Tambah Knowledge</button> : undefined} />
      ) : (
        <div className="space-y-3">
          {items.map(k => (
            <div key={k.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge className={knowledgeTypeColors[k.type]}>{knowledgeTypeLabels[k.type]}</Badge>
                    <Badge className={statusColors[k.status]}>{statusLabels[k.status]}</Badge>
                    {k.category && <span className="text-xs text-gray-400">{k.category.name}</span>}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{k.title}</h3>
                  {k.summary && <p className="text-sm text-gray-500 line-clamp-2">{truncate(k.summary, 200)}</p>}
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{k.views_count}</span>
                    <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400" />{k.average_rating ? k.average_rating.toFixed(1) : '—'}</span>
                    {k.submitter && <span>oleh {k.submitter.name}</span>}
                    <span>{formatDateTime(k.created_at)}</span>
                  </div>
                  {k.rejection_feedback && k.status === 'rejected' && (
                    <div className="mt-2 p-2 bg-red-50 rounded-lg text-xs text-red-600">
                      <span className="font-semibold">Alasan penolakan:</span> {k.rejection_feedback}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {k.status === 'draft' && canContribute && (
                    <button onClick={() => handleSubmit(k.id)} className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-medium hover:bg-amber-600">
                      Submit
                    </button>
                  )}
                  {isStaff && k.status === 'submitted' && (
                    <button onClick={() => { setReviewModal(k); setFeedback(''); }} className="px-3 py-1.5 text-white rounded-lg text-xs font-medium" style={{ backgroundColor: '#1B3A5C' }}>
                      Review
                    </button>
                  )}
                  {canContribute && (k.status === 'draft' || k.status === 'rejected') && (
                    <button onClick={() => openEdit(k)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                  {(isStaff || (canContribute && k.submitted_by === profile?.id && k.status === 'draft')) && (
                    <button onClick={() => handleDelete(k.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Knowledge' : 'Tambah Knowledge Baru'} size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Judul <span className="text-red-500">*</span></label>
            <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Jenis</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none bg-white">
                {Object.entries(knowledgeTypeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Kategori</label>
              <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none bg-white">
                <option value="">Pilih Kategori</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Ringkasan</label>
            <textarea rows={2} value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none resize-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Konten</label>
            <textarea rows={5} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none resize-none" placeholder="Isi artikel / panduan / SOP..." />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Tag <span className="text-gray-400 font-normal">(pisahkan dengan koma)</span></label>
            <input type="text" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="tag1, tag2, tag3" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">URL File Dokumen <span className="text-gray-400 font-normal">(opsional)</span></label>
            <input type="url" value={form.file_url} onChange={e => setForm(f => ({ ...f, file_url: e.target.value }))} placeholder="https://..." className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600">Batal</button>
            <button onClick={handleSave} disabled={saving || !form.title} className="px-5 py-2.5 text-white rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-50" style={{ backgroundColor: '#1B3A5C' }}>
              {saving ? 'Menyimpan...' : editItem ? 'Perbarui' : 'Simpan Draft'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Review Modal */}
      <Modal isOpen={!!reviewModal} onClose={() => setReviewModal(null)} title="Review Knowledge" size="md">
        {reviewModal && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <h3 className="font-semibold text-gray-900">{reviewModal.title}</h3>
              {reviewModal.summary && <p className="text-sm text-gray-500 mt-1">{reviewModal.summary}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Feedback (wajib jika ditolak)</label>
              <textarea rows={3} value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Berikan alasan penolakan atau saran perbaikan..." className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none resize-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setReviewModal(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600">Batal</button>
              <button onClick={() => handleReview(false)} disabled={!feedback} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 flex items-center justify-center gap-2 disabled:opacity-50">
                <XCircle className="w-4 h-4" /> Tolak
              </button>
              <button onClick={() => handleReview(true)} className="flex-1 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" /> Approve & Publish
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
