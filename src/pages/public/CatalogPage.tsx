import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, Grid3X3, List, X, ChevronDown } from 'lucide-react';
import api from '../../lib/api';
import { Collection, Category } from '../../lib/types';
import CollectionCard from '../../components/catalog/CollectionCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import { formatLabels } from '../../lib/utils';

type ViewMode = 'grid' | 'list';

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [collections, setCollections] = useState<Collection[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    format: searchParams.get('format') || '',
    categoryId: searchParams.get('category') || '',
    language: searchParams.get('lang') || '',
    available: searchParams.get('available') === 'true',
  });

  const page = parseInt(searchParams.get('page') || '1');
  const PAGE_SIZE = 20;

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set('search', query);
    if (filters.format) params.set('format', filters.format);
    if (filters.categoryId) params.set('categoryId', filters.categoryId);
    if (filters.language) params.set('language', filters.language);
    params.set('page', String(page));
    params.set('limit', String(PAGE_SIZE));

    const res = await api.get<Collection[]>(`/collections?${params.toString()}`);
    if (res.data) setCollections(res.data);
    if (res.meta) setTotal(res.meta.total);
    setLoading(false);
  }, [query, filters, page]);

  useEffect(() => {
    api.get<Category[]>('/dashboard/categories?type=perpustakaan').then(res => {
      if (res.data) setCategories(res.data);
    });
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const p = new URLSearchParams(searchParams);
    if (query) p.set('q', query); else p.delete('q');
    p.set('page', '1');
    setSearchParams(p);
  };

  const updateFilter = (key: string, value: string | boolean) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key === 'categoryId' ? 'category' : key === 'available' ? 'available' : key, String(value));
    else {
      p.delete(key === 'categoryId' ? 'category' : key === 'available' ? 'available' : key);
    }
    p.set('page', '1');
    setSearchParams(p);
  };

  const clearFilters = () => {
    setFilters({ format: '', categoryId: '', language: '', available: false });
    setQuery('');
    setSearchParams({});
  };

  const hasActiveFilters = filters.format || filters.categoryId || filters.language || filters.available;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl font-bold mb-1" style={{ color: '#1B3A5C' }}>Katalog OPAC</h1>
          <p className="text-gray-500 text-sm mb-6">Online Public Access Catalog — Temukan koleksi perpustakaan</p>

          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:border-transparent" style={{ '--tw-ring-color': '#1B3A5C' } as React.CSSProperties}>
              <Search className="w-5 h-5 text-gray-400 ml-4 flex-shrink-0" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Cari judul, pengarang, ISBN, subjek..."
                className="flex-1 px-4 py-3 bg-transparent outline-none text-gray-800"
              />
              {query && (
                <button type="button" onClick={() => { setQuery(''); clearFilters(); }} className="mr-3 p-1 hover:bg-gray-200 rounded-full">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
            <button type="submit" className="px-6 py-3 text-white rounded-xl font-medium hover:opacity-90 transition-opacity" style={{ backgroundColor: '#1B3A5C' }}>
              Cari
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-medium text-sm transition-colors ${showFilters || hasActiveFilters ? 'border-blue-600 text-blue-700 bg-blue-50' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filter
              {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-blue-600" />}
            </button>
          </form>

          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Format</label>
                <select
                  value={filters.format}
                  onChange={e => updateFilter('format', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2"
                >
                  <option value="">Semua Format</option>
                  {Object.entries(formatLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Kategori</label>
                <select
                  value={filters.categoryId}
                  onChange={e => updateFilter('categoryId', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none"
                >
                  <option value="">Semua Kategori</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Bahasa</label>
                <select
                  value={filters.language}
                  onChange={e => updateFilter('language', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none"
                >
                  <option value="">Semua Bahasa</option>
                  <option value="id">Indonesia</option>
                  <option value="en">Inggris</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Ketersediaan</label>
                <label className="flex items-center gap-2 cursor-pointer py-2">
                  <input type="checkbox" checked={filters.available} onChange={e => updateFilter('available', e.target.checked)} className="w-4 h-4 rounded" />
                  <span className="text-sm text-gray-700">Hanya yang Tersedia</span>
                </label>
              </div>
              {hasActiveFilters && (
                <div className="col-span-2 md:col-span-4">
                  <button onClick={clearFilters} className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1">
                    <X className="w-3.5 h-3.5" /> Hapus Semua Filter
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-gray-600">
            {loading ? 'Mencari...' : `${total.toLocaleString()} koleksi ditemukan`}
            {query && <span className="font-medium"> untuk "{query}"</span>}
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-gray-200 text-gray-800' : 'text-gray-400 hover:bg-gray-100'}`}>
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-gray-200 text-gray-800' : 'text-gray-400 hover:bg-gray-100'}`}>
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner className="py-20" />
        ) : collections.length === 0 ? (
          <EmptyState
            icon={Search}
            title="Koleksi Tidak Ditemukan"
            description="Coba ubah kata kunci pencarian atau hapus filter yang diterapkan."
            action={<button onClick={clearFilters} className="mt-4 px-4 py-2 text-sm font-medium text-white rounded-lg" style={{ backgroundColor: '#1B3A5C' }}>Hapus Filter</button>}
          />
        ) : (
          <>
            <div className={`grid gap-5 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5' : 'grid-cols-1'}`}>
              {collections.map(c => <CollectionCard key={c.id} collection={c} compact={viewMode === 'list'} />)}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setSearchParams(p => { p.set('page', String(page - 1)); return p; })}
                  disabled={page <= 1}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 disabled:opacity-50 hover:bg-gray-50 disabled:cursor-not-allowed"
                >
                  Sebelumnya
                </button>
                <span className="text-sm text-gray-600">
                  Halaman {page} dari {totalPages}
                </span>
                <button
                  onClick={() => setSearchParams(p => { p.set('page', String(page + 1)); return p; })}
                  disabled={page >= totalPages}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 disabled:opacity-50 hover:bg-gray-50 disabled:cursor-not-allowed"
                >
                  Selanjutnya
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
