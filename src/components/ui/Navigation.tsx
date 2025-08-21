import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';

export interface NavigationItem {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
}

export interface NavigationProps {
  items: NavigationItem[];
  onItemClick?: (item: NavigationItem) => void;
  className?: string;
}

export const Navigation: React.FC<NavigationProps> = ({
  items,
  onItemClick,
  className,
}) => {
  const location = useLocation();

  return (
    <nav className={clsx('px-2', className)}>
      <div className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;

          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => onItemClick?.(item)}
              className={clsx(
                'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon
                className={clsx(
                  'mr-3 h-5 w-5 flex-shrink-0',
                  isActive
                    ? 'text-primary-foreground'
                    : 'text-muted-foreground group-hover:text-accent-foreground'
                )}
              />
              <span className="flex-1">{item.name}</span>
              {item.badge && (
                <span
                  className={clsx(
                    'ml-3 inline-block py-0.5 px-2 text-xs rounded-full',
                    isActive
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};