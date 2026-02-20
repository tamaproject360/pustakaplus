import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, Brain, Users, TrendingUp, ChevronRight, Star, ArrowRight, BookMarked } from 'lucide-react';
import api from '../../lib/api';
import { Collection, Knowledge } from '../../lib/types';
import CollectionCard from '../../components/catalog/CollectionCard';
import KnowledgeCard from '../../components/knowledge/KnowledgeCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [featuredCollections, setFeaturedCollections] = useState<Collection[]>([]);
  const [recentKnowledge, setRecentKnowledge] = useState<Knowledge[]>([]);
  const [stats, setStats] = useState({ collections: 0, knowledge: 0, users: 0, borrowings: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const [collectionsRes, knowledgeRes, statsRes] = await Promise.all([
        api.get<Collection[]>('/collections/featured'),
        api.get<Knowledge[]>('/knowledges?status=published&sort=newest&limit=6'),
        api.get<{
          totalCollections: number;
          publishedKnowledge: number;
          totalUsers: number;
          totalBorrowings: number;
        }>('/dashboard/stats'),
      ]);

      if (collectionsRes.data) setFeaturedCollections(collectionsRes.data);
      if (knowledgeRes.data) setRecentKnowledge(knowledgeRes.data);
      if (statsRes.data) {
        setStats({
          collections: statsRes.data.totalCollections,
          knowledge: statsRes.data.publishedKnowledge,
          users: statsRes.data.totalUsers,
          borrowings: statsRes.data.totalBorrowings,
        });
      }
      setLoading(false);
    };
    fetchData().catch(() => setLoading(false));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) navigate(`/catalog?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-28" style={{ background: 'linear-gradient(135deg, #1B3A5C 0%, #2d5a8e 100%)' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-amber-400 blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 text-white/80 rounded-full text-sm font-medium mb-6 backdrop-blur-sm border border-white/20">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            Standar OPAC · AACR2 · MARC21 · ISO 30401
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            Perpustakaan & Knowledge
            <span className="block mt-1" style={{ color: '#F59E0B' }}>Satu Platform Terpadu</span>
          </h1>

          <p className="text-lg text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Temukan ribuan koleksi buku, jurnal, dan pengetahuan institusional. Sistem manajemen perpustakaan modern untuk instansi pemerintah.
          </p>

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative">
            <div className="flex items-center bg-white rounded-2xl shadow-2xl overflow-hidden">
              <Search className="w-5 h-5 text-gray-400 ml-5 flex-shrink-0" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Cari buku, jurnal, pengarang, subjek, ISBN..."
                className="flex-1 px-4 py-4 text-gray-800 outline-none bg-transparent text-base"
              />
              <button
                type="submit"
                className="m-2 px-6 py-3 text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"
                style={{ backgroundColor: '#1B3A5C' }}
              >
                Cari
              </button>
            </div>
          </form>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-5 text-sm text-blue-200">
            <span>Populer:</span>
            {['Manajemen ASN', 'Kebijakan Publik', 'Pengadaan Barang', 'SOP Keuangan'].map(tag => (
              <Link
                key={tag}
                to={`/catalog?q=${encodeURIComponent(tag)}`}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white/80 hover:text-white"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: BookOpen, label: 'Total Koleksi', value: stats.collections.toLocaleString(), color: '#1B3A5C' },
              { icon: Brain, label: 'Knowledge Tersedia', value: stats.knowledge.toLocaleString(), color: '#F59E0B' },
              { icon: Users, label: 'Anggota Terdaftar', value: stats.users.toLocaleString(), color: '#10B981' },
              { icon: TrendingUp, label: 'Total Peminjaman', value: stats.borrowings.toLocaleString(), color: '#3B82F6' },
            ].map((stat, i) => (
              <div key={i} className="text-center py-4">
                <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: `${stat.color}15` }}>
                  <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
                </div>
                <p className="text-3xl font-bold text-gray-900">{loading ? '—' : stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Collections */}
      <section className="py-14 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-sm font-semibold text-amber-500 uppercase tracking-wide mb-1">Koleksi Unggulan</p>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Koleksi Terpilih & Terkini</h2>
            </div>
            <Link to="/catalog" className="flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-900 transition-colors group">
              Lihat Semua
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner className="py-16" />
          ) : featuredCollections.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-5">
              {featuredCollections.map(c => <CollectionCard key={c.id} collection={c} />)}
            </div>
          ) : (
            <div className="text-center py-16">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Belum ada koleksi unggulan. Tambahkan melalui dashboard admin.</p>
            </div>
          )}
        </div>
      </section>

      {/* Knowledge Base Preview */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-sm font-semibold text-amber-500 uppercase tracking-wide mb-1">Knowledge Base</p>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Pengetahuan Terbaru</h2>
            </div>
            <Link to="/knowledge" className="flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-900 transition-colors group">
              Lihat Semua
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner className="py-16" />
          ) : recentKnowledge.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {recentKnowledge.map(k => <KnowledgeCard key={k.id} knowledge={k} />)}
            </div>
          ) : (
            <div className="text-center py-16">
              <Brain className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Belum ada knowledge yang dipublish.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16" style={{ background: 'linear-gradient(135deg, #1B3A5C 0%, #2d5a8e 100%)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Bergabung dengan PustakaPlus</h2>
          <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
            Daftar sebagai anggota untuk meminjam buku, mengakses knowledge base eksklusif, dan berkontribusi dalam pengembangan pengetahuan institusi.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3.5 text-white font-semibold rounded-xl transition-colors text-base"
              style={{ backgroundColor: '#F59E0B' }}
            >
              Daftar Sekarang
            </Link>
            <Link
              to="/catalog"
              className="w-full sm:w-auto px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-colors text-base border border-white/20"
            >
              Jelajahi Katalog
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
