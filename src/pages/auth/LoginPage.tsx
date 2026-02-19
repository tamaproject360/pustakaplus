import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: signInError } = await signIn(email, password);
    if (signInError) {
      setError('Email atau kata sandi salah. Silakan coba lagi.');
      setLoading(false);
    } else {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#F3F4F6' }}>
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1B3A5C 0%, #2d5a8e 100%)' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-20 right-20 w-64 h-64 rounded-full bg-amber-400 blur-3xl" />
        </div>

        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-2xl text-white">PustakaPlus</span>
        </div>

        <div className="relative">
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            Selamat Datang di<br />
            <span style={{ color: '#F59E0B' }}>Portal Perpustakaan</span>
          </h2>
          <p className="text-blue-200 text-lg leading-relaxed mb-8">
            Akses ribuan koleksi buku, kelola peminjaman, dan bagikan pengetahuan dalam satu platform terintegrasi.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Standar OPAC', desc: 'Katalog publik terintegrasi' },
              { label: 'AACR2 & MARC21', desc: 'Katalogisasi profesional' },
              { label: 'Knowledge Base', desc: 'Repositori pengetahuan' },
              { label: 'ISO 30401', desc: 'Manajemen pengetahuan' },
            ].map((item, i) => (
              <div key={i} className="bg-white/10 rounded-xl p-3">
                <p className="text-white font-semibold text-sm">{item.label}</p>
                <p className="text-blue-200 text-xs mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-blue-300 text-sm">© 2026 PustakaPlus. All rights reserved.</p>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#1B3A5C' }}>
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl" style={{ color: '#1B3A5C' }}>PustakaPlus</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Masuk ke Akun</h1>
          <p className="text-gray-500 text-sm mb-8">Masukkan email dan kata sandi untuk melanjutkan</p>

          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700 mb-6">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 pointer-events-none" style={{ width: 17, height: 17 }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="nama@instansi.go.id"
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent bg-white"
                  style={{ '--tw-ring-color': '#1B3A5C' } as React.CSSProperties}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700">Kata Sandi</label>
                <a href="#" className="text-xs font-medium hover:underline" style={{ color: '#1B3A5C' }}>Lupa kata sandi?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 pointer-events-none" style={{ width: 17, height: 17 }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="Kata sandi"
                  className="w-full pl-11 pr-12 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent bg-white"
                  style={{ '--tw-ring-color': '#1B3A5C' } as React.CSSProperties}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 shadow-sm"
              style={{ backgroundColor: '#1B3A5C' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Masuk...
                </span>
              ) : 'Masuk'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Belum punya akun?{' '}
            <Link to="/register" className="font-semibold hover:underline" style={{ color: '#1B3A5C' }}>
              Daftar sekarang
            </Link>
          </p>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-center text-xs text-gray-400">
              Atau{' '}
              <Link to="/" className="hover:text-gray-600">Kembali ke beranda</Link>
              {' '}·{' '}
              <Link to="/catalog" className="hover:text-gray-600">Jelajahi katalog</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
