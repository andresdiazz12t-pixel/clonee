import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  view?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onNavigate: (view: string) => void;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, onNavigate }) => {
  return (
    <nav className="flex items-center space-x-2 text-sm mb-6" aria-label="Breadcrumb">
      <button
        onClick={() => onNavigate('dashboard')}
        className="flex items-center text-neutral-500 hover:text-primary-600 transition-colors"
        aria-label="Ir al inicio"
      >
        <Home className="h-4 w-4" />
      </button>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <React.Fragment key={index}>
            <ChevronRight className="h-4 w-4 text-neutral-400" />
            {isLast || !item.view ? (
              <span className="text-neutral-900 font-medium" aria-current="page">
                {item.label}
              </span>
            ) : (
              <button
                onClick={() => item.view && onNavigate(item.view)}
                className="text-neutral-500 hover:text-primary-600 transition-colors"
              >
                {item.label}
              </button>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
