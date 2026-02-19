import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  BookOpen, User, Building, Calendar, Hash, MapPin,
  Tag, Globe, ArrowLeft, BookMarked, AlertCircle, CheckCircle,
  Download, Eye
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Collection } from '../../lib/types';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Badge from '../../components/ui/Badge';
import { formatLabels, statusLabels, formatDate } from '../../lib/utils';
import Modal from '../../components/ui/Modal';

export default function CollectionDetailPage() {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [borrowLoading, setBorrowLoading] = useState(false);
  const [reserveLoading, setReserveLoading] = useState(false);
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!id) return;
    supabase
      .from('collections')
      .select('*, category:categories(*), tags:collection_tags(*), profiles!created_by(id, name)')
      .eq('id', id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setCollection(data as Collection);
        else navigate('/catalog');
        setLoading(false);
      });
  }, [id, navigate]);

  const handleBorrow = async () => {
    if (!user || !collection) return;
    setBorrowLoading(true);
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    const { error } = await supabase.from('borrowings').insert({
      user_id: user.id,
      collection_id: collection.id,
      due_date: dueDate.toISOString(),
    });

    if (!error) {
      await supabase.from('collections').update({ available_copies: collection.available_copies - 1 }).eq('id', collection.id);
      setCollection(prev => prev ? { ...prev, available_copies: prev.available_copies - 1 } : prev);
      setMessage(`Buku berhasil dipinjam! Jatuh tempo: ${formatDate(dueDate.toISOString())}`);
      setShowBorrowModal(false);
      setShowSuccessModal(true);
    } else {
      setMessage('Gagal meminjam. ' + error.message);
    }
    setBorrowLoading(false);
  };

  const handleReserve = async () => {
    if (!user || !collection) return;
    setReserveLoading(true);

    const { error } = await supabase.from('reservations').insert({
      user_id: user.id,
      collection_id: collection.id,
    });

    if (!error) {
      setMessage('Reservasi berhasil! Anda akan diberitahu saat buku tersedia.');
      setShowSuccessModal(true);
    } else {
      setMessage('Gagal membuat reservasi. ' + error.message);
    }
    setReserveLoading(false);
  };

  if (loading) return <LoadingSpinner className="py-32" />;
  if (!collection) return null;

  const formatColor: Record<string, string> = {
    buku: 'bg-blue-100 text-blue-700',
    jurnal: 'bg-green-100 text-green-700',
    ebook: 'bg-amber-100 text-amber-700',
    multimedia: 'bg-teal-100 text-teal-700',
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Link to="/catalog" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Kembali ke Katalog
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
            {/* Cover & Actions */}
            <div className="lg:col-span-1 p-8 border-b lg:border-b-0 lg:border-r border-gray-100 flex flex-col items-center">
              <div className="w-48 h-64 rounded-xl overflow-hidden shadow-lg mb-6 bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                {collection.cover_url ? (
                  <img src={collection.cover_url} alt={collection.title} className="w-full h-full object-cover" />
                ) : (
                  <BookOpen className="w-16 h-16 text-gray-300" />
                )}
              </div>

              <div className="w-full space-y-3">
                <div className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm ${collection.available_copies > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                  {collection.available_copies > 0 ? (
                    <><CheckCircle className="w-4 h-4" /> {collection.available_copies} tersedia dari {collection.total_copies}</>
                  ) : (
                    <><AlertCircle className="w-4 h-4" /> Habis Dipinjam</>
                  )}
                </div>

                {user ? (
                  <>
                    {collection.available_copies > 0 && (collection.format === 'buku' || collection.format === 'jurnal') && (
                      <button
                        onClick={() => setShowBorrowModal(true)}
                        className="w-full flex items-center justify-center gap-2 py-3 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: '#1B3A5C' }}
                      >
                        <BookMarked className="w-4 h-4" />
                        Pinjam Sekarang
                      </button>
                    )}
                    {collection.available_copies === 0 && (
                      <button
                        onClick={handleReserve}
                        disabled={reserveLoading}
                        className="w-full flex items-center justify-center gap-2 py-3 border-2 rounded-xl font-medium hover:bg-amber-50 transition-colors disabled:opacity-50"
                        style={{ borderColor: '#F59E0B', color: '#F59E0B' }}
                      >
                        <Calendar className="w-4 h-4" />
                        {reserveLoading ? 'Memproses...' : 'Reservasi'}
                      </button>
                    )}
                    {(collection.format === 'ebook' || collection.format === 'multimedia') && collection.file_url && (
                      <a
                        href={collection.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-blue-200 text-blue-700 rounded-xl font-medium hover:bg-blue-50 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Unduh / Baca Online
                      </a>
                    )}
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="w-full flex items-center justify-center gap-2 py-3 text-white rounded-xl font-medium hover:opacity-90"
                    style={{ backgroundColor: '#1B3A5C' }}
                  >
                    Masuk untuk Meminjam
                  </Link>
                )}
              </div>

              {collection.barcode && (
                <div className="mt-6 text-center w-full">
                  <p className="text-xs text-gray-400 mb-1">Barcode Koleksi</p>
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <p className="font-mono text-sm font-bold tracking-widest text-gray-700">{collection.barcode}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="lg:col-span-2 p-8">
              <div className="flex items-start gap-3 mb-3">
                <Badge className={formatColor[collection.format]}>{formatLabels[collection.format]}</Badge>
                {collection.is_featured && <Badge className="bg-amber-100 text-amber-700">Unggulan</Badge>}
                {collection.language && <Badge className="bg-gray-100 text-gray-600">{collection.language === 'id' ? 'Indonesia' : 'English'}</Badge>}
              </div>

              <h1 className="text-2xl md:text-3xl font-bold mb-3 leading-tight" style={{ color: '#1B3A5C' }}>{collection.title}</h1>

              {collection.author && (
                <p className="text-lg text-gray-600 mb-6 flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  {collection.author}
                </p>
              )}

              {collection.description && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Deskripsi</h3>
                  <p className="text-gray-700 leading-relaxed">{collection.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-6">
                {collection.publisher && (
                  <div className="flex items-start gap-2">
                    <Building className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400">Penerbit</p>
                      <p className="text-sm font-medium text-gray-800">{collection.publisher}</p>
                    </div>
                  </div>
                )}
                {collection.publish_year && (
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400">Tahun Terbit</p>
                      <p className="text-sm font-medium text-gray-800">{collection.publish_year}</p>
                    </div>
                  </div>
                )}
                {collection.isbn && (
                  <div className="flex items-start gap-2">
                    <Hash className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400">ISBN</p>
                      <p className="text-sm font-mono font-medium text-gray-800">{collection.isbn}</p>
                    </div>
                  </div>
                )}
                {collection.issn && (
                  <div className="flex items-start gap-2">
                    <Hash className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400">ISSN</p>
                      <p className="text-sm font-mono font-medium text-gray-800">{collection.issn}</p>
                    </div>
                  </div>
                )}
                {collection.shelf_location && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400">Lokasi Rak</p>
                      <p className="text-sm font-medium text-gray-800">{collection.shelf_location}</p>
                    </div>
                  </div>
                )}
                {collection.subject && (
                  <div className="flex items-start gap-2 col-span-2">
                    <Tag className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400">Subjek</p>
                      <p className="text-sm font-medium text-gray-800">{collection.subject}</p>
                    </div>
                  </div>
                )}
                {collection.category && (
                  <div className="flex items-start gap-2">
                    <Globe className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400">Kategori</p>
                      <p className="text-sm font-medium text-gray-800">{collection.category.name}</p>
                    </div>
                  </div>
                )}
              </div>

              {collection.tags && collection.tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Tag</h3>
                  <div className="flex flex-wrap gap-2">
                    {collection.tags.map(t => (
                      <Link key={t.id} to={`/catalog?q=${t.tag}`} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition-colors">
                        {t.tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-gray-100">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Informasi Bibliografi (AACR2/MARC21)</h3>
                <div className="bg-gray-50 rounded-xl p-4 font-mono text-xs text-gray-600 space-y-1">
                  <p><span className="text-gray-400">245 10 $a</span> {collection.title} /</p>
                  {collection.author && <p><span className="text-gray-400">100 1_ $a</span> {collection.author}.</p>}
                  {collection.publisher && collection.publish_year && <p><span className="text-gray-400">264 _1 $b</span> {collection.publisher}, <span className="text-gray-400">$c</span> {collection.publish_year}.</p>}
                  {collection.isbn && <p><span className="text-gray-400">020 __ $a</span> {collection.isbn}</p>}
                  {collection.language && <p><span className="text-gray-400">041 0_ $a</span> {collection.language}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={showBorrowModal} onClose={() => setShowBorrowModal(false)} title="Konfirmasi Peminjaman">
        <div className="text-center py-4">
          <BookMarked className="w-12 h-12 mx-auto mb-4" style={{ color: '#1B3A5C' }} />
          <h3 className="font-semibold text-gray-900 mb-2">{collection.title}</h3>
          <p className="text-gray-500 text-sm mb-6">
            Durasi peminjaman standar adalah 14 hari. Jatuh tempo:{' '}
            <strong>{formatDate(new Date(Date.now() + 14 * 86400000).toISOString())}</strong>
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => setShowBorrowModal(false)} className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
              Batal
            </button>
            <button
              onClick={handleBorrow}
              disabled={borrowLoading}
              className="px-6 py-2.5 text-white rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: '#1B3A5C' }}
            >
              {borrowLoading ? 'Memproses...' : 'Ya, Pinjam'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} title="Berhasil!">
        <div className="text-center py-4">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <p className="text-gray-700">{message}</p>
          <Link to="/dashboard/borrowings" className="mt-6 inline-block px-6 py-2.5 text-white rounded-xl text-sm font-medium" style={{ backgroundColor: '#1B3A5C' }}>
            Lihat Peminjaman Saya
          </Link>
        </div>
      </Modal>
    </div>
  );
}
