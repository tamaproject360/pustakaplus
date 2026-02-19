import { Link } from 'react-router-dom';
import { Eye, Star, Calendar, User, FileText } from 'lucide-react';
import { Knowledge } from '../../lib/types';
import { formatDate, truncate, knowledgeTypeColors, knowledgeTypeLabels } from '../../lib/utils';
import Badge from '../ui/Badge';

interface KnowledgeCardProps {
  knowledge: Knowledge;
}

export default function KnowledgeCard({ knowledge }: KnowledgeCardProps) {
  return (
    <Link
      to={`/knowledge/${knowledge.id}`}
      className="group bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col"
    >
      <div className="h-3 w-full" style={{ background: '#1B3A5C' }} />

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3 mb-3">
          <Badge className={knowledgeTypeColors[knowledge.type]}>
            {knowledgeTypeLabels[knowledge.type]}
          </Badge>
          {knowledge.category && (
            <span className="text-xs text-gray-400 truncate">{knowledge.category.name}</span>
          )}
        </div>

        <h3 className="font-semibold text-gray-900 text-base leading-snug group-hover:text-blue-900 transition-colors mb-2"
          style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {knowledge.title}
        </h3>

        {knowledge.summary && (
          <p className="text-sm text-gray-500 leading-relaxed mb-3 flex-1"
            style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {truncate(knowledge.summary, 150)}
          </p>
        )}

        {knowledge.tags && knowledge.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {knowledge.tags.slice(0, 3).map(t => (
              <span key={t.id} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">{t.tag}</span>
            ))}
            {knowledge.tags.length > 3 && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-400 rounded-full text-xs">+{knowledge.tags.length - 3}</span>
            )}
          </div>
        )}

        <div className="border-t border-gray-50 pt-3 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {knowledge.views_count}
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              {knowledge.average_rating ? knowledge.average_rating.toFixed(1) : '—'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {knowledge.submitter && (
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {knowledge.submitter.name}
              </span>
            )}
            {knowledge.published_at && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(knowledge.published_at, 'd MMM yyyy')}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
