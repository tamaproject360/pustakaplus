import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Eye, Star, Calendar, User, Download, Tag, Send } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Knowledge, Rating } from '../../lib/types';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Badge from '../../components/ui/Badge';
import { formatDateTime, knowledgeTypeColors, knowledgeTypeLabels } from '../../lib/utils';

export default function KnowledgeDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [knowledge, setKnowledge] = useState<Knowledge | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [existingRating, setExistingRating] = useState<Rating | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchAll = async () => {
      const [kRes, rRes] = await Promise.all([
        supabase.from('knowledges').select('*, category:categories(*), tags:knowledge_tags(*), submitter:profiles!submitted_by(id, name)').eq('id', id).maybeSingle(),
        supabase.from('ratings').select('*, user:profiles!user_id(id, name)').eq('knowledge_id', id).order('created_at', { ascending: false }),
      ]);
      if (kRes.data) {
        setKnowledge(kRes.data as Knowledge);
        supabase.from('knowledges').update({ views_count: (kRes.data.views_count || 0) + 1 }).eq('id', id);
      } else navigate('/knowledge');
      if (rRes.data) setRatings(rRes.data as Rating[]);
      setLoading(false);
    };
    fetchAll();
  }, [id, navigate]);

  useEffect(() => {
    if (user && ratings.length > 0) {
      const existing = ratings.find(r => r.user_id === user.id);
      if (existing) {
        setExistingRating(existing);
        setUserRating(existing.rating);
        setUserReview(existing.review || '');
      }
    }
  }, [ratings, user]);

  const handleRating = async () => {
    if (!user || !knowledge || !userRating) return;
    setRatingLoading(true);

    if (existingRating) {
      const { error } = await supabase.from('ratings').update({ rating: userRating, review: userReview }).eq('id', existingRating.id);
      if (!error) {
        setRatings(prev => prev.map(r => r.id === existingRating.id ? { ...r, rating: userRating, review: userReview } : r));
      }
    } else {
      const { data, error } = await supabase.from('ratings').insert({ knowledge_id: knowledge.id, user_id: user.id, rating: userRating, review: userReview }).select('*, user:profiles!user_id(id, name)').single();
      if (!error && data) {
        setRatings(prev => [data as Rating, ...prev]);
        setExistingRating(data as Rating);
      }
    }
    setRatingLoading(false);
  };

  if (loading) return <LoadingSpinner className="py-32" />;
  if (!knowledge) return null;

  const avgRating = ratings.length > 0 ? ratings.reduce((s, r) => s + r.rating, 0) / ratings.length : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <Link to="/knowledge" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Kembali ke Knowledge Base
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="h-2 w-full" style={{ background: 'linear-gradient(90deg, #1B3A5C, #F59E0B)' }} />

          <div className="p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge className={knowledgeTypeColors[knowledge.type]}>{knowledgeTypeLabels[knowledge.type]}</Badge>
              {knowledge.category && <Badge className="bg-gray-100 text-gray-600">{knowledge.category.name}</Badge>}
            </div>

            <h1 className="text-2xl md:text-3xl font-bold mb-4 leading-tight" style={{ color: '#1B3A5C' }}>{knowledge.title}</h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-100">
              {knowledge.submitter && (
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  {knowledge.submitter.name}
                </span>
              )}
              {knowledge.published_at && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {formatDateTime(knowledge.published_at)}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                {knowledge.views_count} views
              </span>
              <span className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                {avgRating > 0 ? avgRating.toFixed(1) : '—'} ({ratings.length} ulasan)
              </span>
            </div>

            {knowledge.summary && (
              <div className="mb-6 p-4 bg-blue-50 rounded-xl border-l-4" style={{ borderLeftColor: '#1B3A5C' }}>
                <p className="text-gray-700 leading-relaxed italic">{knowledge.summary}</p>
              </div>
            )}

            {knowledge.content && (
              <div className="prose prose-gray max-w-none mb-6">
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">{knowledge.content}</div>
              </div>
            )}

            {knowledge.file_url && (
              <a
                href={knowledge.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity mb-6"
                style={{ backgroundColor: '#1B3A5C' }}
              >
                <Download className="w-4 h-4" />
                Unduh Dokumen
              </a>
            )}

            {knowledge.tags && knowledge.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                <Tag className="w-4 h-4 text-gray-400 mt-0.5" />
                {knowledge.tags.map(t => (
                  <Link key={t.id} to={`/knowledge?q=${t.tag}`} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full text-sm transition-colors">
                    {t.tag}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ratings Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Rating & Ulasan ({ratings.length})</h2>

          {avgRating > 0 && (
            <div className="flex items-center gap-6 mb-6 p-4 bg-gray-50 rounded-xl">
              <div className="text-center">
                <p className="text-5xl font-bold" style={{ color: '#1B3A5C' }}>{avgRating.toFixed(1)}</p>
                <div className="flex items-center gap-0.5 mt-1">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={`w-4 h-4 ${s <= Math.round(avgRating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`} />
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">{ratings.length} ulasan</p>
              </div>
              <div className="flex-1 space-y-1.5">
                {[5,4,3,2,1].map(star => {
                  const count = ratings.filter(r => r.rating === star).length;
                  const pct = ratings.length > 0 ? (count / ratings.length) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="w-3">{star}</span>
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-6 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {user ? (
            <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-sm font-semibold text-gray-700 mb-3">{existingRating ? 'Ubah Penilaian Anda' : 'Beri Penilaian'}</p>
              <div className="flex items-center gap-1 mb-3">
                {[1,2,3,4,5].map(s => (
                  <button
                    key={s}
                    onMouseEnter={() => setHoverRating(s)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setUserRating(s)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star className={`w-7 h-7 ${s <= (hoverRating || userRating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`} />
                  </button>
                ))}
                {userRating > 0 && <span className="ml-2 text-sm text-gray-600 font-medium">{userRating}/5</span>}
              </div>
              <textarea
                value={userReview}
                onChange={e => setUserReview(e.target.value)}
                placeholder="Tulis ulasan Anda (opsional)..."
                rows={3}
                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 resize-none"
                style={{ '--tw-ring-color': '#1B3A5C' } as React.CSSProperties}
              />
              <button
                onClick={handleRating}
                disabled={!userRating || ratingLoading}
                className="mt-3 flex items-center gap-2 px-5 py-2 text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
                style={{ backgroundColor: '#1B3A5C' }}
              >
                <Send className="w-4 h-4" />
                {ratingLoading ? 'Menyimpan...' : existingRating ? 'Perbarui' : 'Kirim Ulasan'}
              </button>
            </div>
          ) : (
            <div className="mb-6 p-4 bg-blue-50 rounded-xl text-sm text-blue-700 flex items-center gap-2">
              <Link to="/login" className="font-semibold underline">Masuk</Link> untuk memberikan rating dan ulasan.
            </div>
          )}

          <div className="space-y-4">
            {ratings.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-6">Belum ada ulasan. Jadilah yang pertama!</p>
            ) : ratings.map(r => (
              <div key={r.id} className="flex gap-4 p-4 rounded-xl bg-gray-50">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-white flex-shrink-0" style={{ background: '#1B3A5C' }}>
                  {r.user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-gray-800">{r.user?.name || 'Pengguna'}</p>
                    <p className="text-xs text-gray-400">{formatDateTime(r.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-0.5 mb-2">
                    {[1,2,3,4,5].map(s => <Star key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />)}
                  </div>
                  {r.review && <p className="text-sm text-gray-600">{r.review}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
