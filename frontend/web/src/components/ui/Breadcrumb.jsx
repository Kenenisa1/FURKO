import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function Breadcrumb({ items }) {
  // items: [{ label, to? }, ...]
  return (
    <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-4" aria-label="Breadcrumb">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
          {item.to ? (
            <Link to={item.to} className="hover:text-[#1a6b3c] transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-800 font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
