import { Link } from 'react-router-dom';
import { BookOpen, Mail, Phone, MapPin, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="text-gray-300" style={{ backgroundColor: '#1B3A5C' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-white">PustakaPlus</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Sistem Manajemen Perpustakaan & Knowledge Management berbasis standar internasional untuk instansi pemerintah.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wide">Layanan</h4>
            <ul className="space-y-2.5">
              {[
                { to: '/', label: 'Beranda' },
                { to: '/catalog', label: 'Katalog OPAC' },
                { to: '/knowledge', label: 'Knowledge Base' },
                { to: '/login', label: 'Portal Anggota' },
              ].map(item => (
                <li key={item.to}>
                  <Link to={item.to} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wide">Standar</h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li>OPAC (Online Public Access Catalog)</li>
              <li>AACR2 & MARC21</li>
              <li>Dublin Core Metadata</li>
              <li>ISO 30401:2018 KMS</li>
              <li>ISBN/ISSN Lookup</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wide">Kontak</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-400" />
                <span>Jl. Perpustakaan No. 1, Jakarta Pusat 10110</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <Phone className="w-4 h-4 flex-shrink-0 text-amber-400" />
                <span>(021) 1234-5678</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <Mail className="w-4 h-4 flex-shrink-0 text-amber-400" />
                <span>pustaka@instansi.go.id</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <Globe className="w-4 h-4 flex-shrink-0 text-amber-400" />
                <span>www.pustakaplus.go.id</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">© 2026 PustakaPlus. All rights reserved.</p>
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-white transition-colors">Kebijakan Privasi</a>
            <a href="#" className="hover:text-white transition-colors">Syarat & Ketentuan</a>
            <a href="#" className="hover:text-white transition-colors">Bantuan</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
