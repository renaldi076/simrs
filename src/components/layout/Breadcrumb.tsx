import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { MODULES } from '@/constants/modules';

export function Breadcrumb(): React.ReactElement {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  // Build breadcrumb items
  const items: { label: string; path: string }[] = [
    { label: 'Dashboard', path: '/dashboard' },
  ];

  if (pathSegments.length > 1) {
    const moduleSlug = pathSegments[1];
    const module = MODULES.find((m) => m.path === `/dashboard/${moduleSlug}`);
    if (module) {
      items.push({ label: module.label, path: module.path });
    }
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm">
      {items.map((item, index) => (
        <React.Fragment key={item.path}>
          {index > 0 && (
            <ChevronRight size={14} className="text-gray-400" />
          )}
          <Link
            to={item.path}
            className={`flex items-center gap-1 ${
              index === items.length - 1
                ? 'text-gray-800 font-medium'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {index === 0 && <Home size={14} />}
            <span>{item.label}</span>
          </Link>
        </React.Fragment>
      ))}
    </nav>
  );
}

export default Breadcrumb;
