import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Brain, X, Filter } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Knowledge, Category } from '../../lib/types';
import KnowledgeCard from '../../components/knowledge/KnowledgeCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import { knowledgeTypeLabels } from '../../lib/utils';

type SortOption = 'newest' | 'oldest' | 'popular' | 'rating';

export default function KnowledgeBasePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [knowledge, setKnowledge] = useState<Knowledge[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [activeTab, setActiveTab] = useState<'all' | 'recent'>('all');
  const [sort, setSort] = useState<SortOption>('newest');

  const [filters, setFilters] = useState({
    type: searchParams.get('type') || '',
    categoryId: searchParams.get('category') || '',
  });

  const page = parseInt(searchParams.get('page') || '1');
  const PAGE_SIZE = 12;

  const fetchData = useCallback(async () => {
    setLoading(true);
    let q = supabase
      .from('knowledges')
      .select('*, category:categories(*), tags:knowledge_tags(*), submitter:profiles!submitted_by(id, name)', { count: 'exact' })
      .eq('status', 'published');

    if (query) q = q.or(`title.ilike.%${query}%,summary.ilike.%${query}%,content.ilike.%${query}%`);
    if (filters.type) q = q.eq('type', filters.type);
    if (filters.categoryId) q = q.eq('category_id', filters.categoryId);

    if (activeTab === 'recent') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 30);
      q = q.gte('published_at', weekAgo.toISOString());
    }

    if (sort === 'newest') q = q.order('published_at', { ascending: false });
    else if (sort === 'oldest') q = q.order('published_at', { ascending: true });
    else if (sort === 'popular') q = q.order('views_count', { ascending: false });
    else if (sort === 'rating') q = q.order('average_rating', { ascending: false });

    const from = (page - 1) * PAGE_SIZE;
    q = q.range(from, from + PAGE_SIZE - 1);

    const { data, count } = await q;
    if (data) setKnowledge(data as Knowledge[]);
    if (count !== null) setTotal(count);
    setLoading(false);
  }, [query, filters, page, sort, activeTab]);

  useEffect(() => {
    supabase.from('categories').select('*').eq('type', 'knowledge').then(({ data }) => {
      if (data) setCategories(data);
    });
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const p = new URLSearchParams();
    if (query) p.set('q', query);
    setSearchParams(p);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="py-10" style={{ background: 'linear-gradient(135deg, #1B3A5C 0%, #2d5a8e 100%)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 mb-4">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Knowledge Base</h1>
          <p className="text-blue-100 text-base mb-8 max-w-xl mx-auto">
            Repositori pengetahuan institusional — SOP, panduan, artikel, lesson learned, dan best practice
          </p>
          <form onSubmit={handleSearch} className="flex max-w-xl mx-auto">
            <div className="flex-1 flex items-center bg-white rounded-l-xl overflow-hidden">
              <Search className="w-5 h-5 text-gray-400 ml-4" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Cari pengetahuan, SOP, panduan..."
                className="flex-1 px-3 py-3.5 outline-none text-gray-800 text-sm"
              />
              {query && (
                <button type="button" onClick={() => { setQuery(''); setSearchParams({}); }} className="mr-3">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
            <button type="submit" className="px-6 py-3.5 text-white font-semibold rounded-r-xl text-sm" style={{ backgroundColor: '#F59E0B' }}>
              Cari
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters */}
          <aside className="lg:w-56 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-100 p-4 sticky top-20">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2 text-sm">
                <Filter className="w-4 h-4" /> Filter
              </h3>

              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Jenis</p>
                <div className="space-y-1">
                  <button
                    onClick={() => setFilters(f => ({ ...f, type: '' }))}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!filters.type ? 'text-white font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                    style={!filters.type ? { backgroundColor: '#1B3A5C' } : {}}
                  >
                    Semua Jenis
                  </button>
                  {Object.entries(knowledgeTypeLabels).map(([k, v]) => (
                    <button
                      key={k}
                      onClick={() => setFilters(f => ({ ...f, type: k }))}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${filters.type === k ? 'text-white font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                      style={filters.type === k ? { backgroundColor: '#1B3A5C' } : {}}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Kategori</p>
                <div className="space-y-1">
                  <button
                    onClick={() => setFilters(f => ({ ...f, categoryId: '' }))}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!filters.categoryId ? 'text-white font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                    style={!filters.categoryId ? { backgroundColor: '#1B3A5C' } : {}}
                  >
                    Semua Kategori
                  </button>
                  {categories.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setFilters(f => ({ ...f, categoryId: c.id }))}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${filters.categoryId === c.id ? 'text-white font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                      style={filters.categoryId === c.id ? { backgroundColor: '#1B3A5C' } : {}}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Tabs & Sort */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
              <div className="flex items-center bg-white rounded-xl border border-gray-100 p-1">
                {(['all', 'recent'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab ? 'text-white shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
                    style={activeTab === tab ? { backgroundColor: '#1B3A5C' } : {}}
                  >
                    {tab === 'all' ? 'Semua' : 'Terbaru (30 Hari)'}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{total.toLocaleString()} hasil</span>
                <select
                  value={sort}
                  onChange={e => setSort(e.target.value as SortOption)}
                  className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none"
                >
                  <option value="newest">Terbaru</option>
                  <option value="oldest">Terlama</option>
                  <option value="popular">Terpopuler</option>
                  <option value="rating">Rating Tertinggi</option>
                </select>
              </div>
            </div>

            {loading ? (
              <LoadingSpinner className="py-20" />
            ) : knowledge.length === 0 ? (
              <EmptyState
                icon={Brain}
                title="Belum Ada Knowledge"
                description="Tidak ada konten yang sesuai dengan filter yang dipilih."
              />
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {knowledge.map(k => <KnowledgeCard key={k.id} knowledge={k} />)}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      onClick={() => setSearchParams(p => { p.set('page', String(page - 1)); return p; })}
                      disabled={page <= 1}
                      className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 disabled:opacity-50 hover:bg-gray-50"
                    >
                      Sebelumnya
                    </button>
                    <span className="text-sm text-gray-600">Halaman {page} dari {totalPages}</span>
                    <button
                      onClick={() => setSearchParams(p => { p.set('page', String(page + 1)); return p; })}
                      disabled={page >= totalPages}
                      className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 disabled:opacity-50 hover:bg-gray-50"
                    >
                      Selanjutnya
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
