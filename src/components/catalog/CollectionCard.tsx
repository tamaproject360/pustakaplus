import { Link } from 'react-router-dom';
import { BookOpen, Calendar, User, Tag, CheckCircle, XCircle } from 'lucide-react';
import { Collection } from '../../lib/types';
import { formatLabels } from '../../lib/utils';
import Badge from '../ui/Badge';

interface CollectionCardProps {
  collection: Collection;
  compact?: boolean;
}

const formatColors: Record<string, string> = {
  buku: 'bg-blue-100 text-blue-700',
  jurnal: 'bg-green-100 text-green-700',
  ebook: 'bg-amber-100 text-amber-700',
  multimedia: 'bg-teal-100 text-teal-700',
};

export default function CollectionCard({ collection, compact = false }: CollectionCardProps) {
  return (
    <Link to={`/catalog/${collection.id}`} className="group bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col">
      <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-50 relative overflow-hidden">
        {collection.cover_url ? (
          <img
            src={collection.cover_url}
            alt={collection.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-gray-300" />
          </div>
        )}
        <div className="absolute top-2 left-2">
          <Badge className={formatColors[collection.format]}>
            {formatLabels[collection.format]}
          </Badge>
        </div>
        {collection.is_featured && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-amber-400 text-white text-xs">Unggulan</Badge>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-blue-900 transition-colors mb-1"
          style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {collection.title}
        </h3>

        {collection.author && (
          <p className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
            <User className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{collection.author}</span>
          </p>
        )}

        {collection.publish_year && (
          <p className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
            <Calendar className="w-3 h-3 flex-shrink-0" />
            <span>{collection.publish_year}</span>
          </p>
        )}

        {!compact && collection.category && (
          <p className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
            <Tag className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{collection.category.name}</span>
          </p>
        )}

        <div className="mt-auto pt-2 border-t border-gray-50">
          <div className={`flex items-center gap-1.5 text-xs font-medium ${collection.available_copies > 0 ? 'text-green-600' : 'text-red-500'}`}>
            {collection.available_copies > 0
              ? <><CheckCircle className="w-3.5 h-3.5" /> Tersedia ({collection.available_copies})</>
              : <><XCircle className="w-3.5 h-3.5" /> Habis Dipinjam</>
            }
          </div>
        </div>
      </div>
    </Link>
  );
}
