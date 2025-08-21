import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Button } from './Button';

export interface HeaderProps {
  title?: string;
  onMenuClick?: () => void;
  actions?: React.ReactNode;
  showMenuButton?: boolean;
}

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Transactions', href: '/transactions' },
  { name: 'Books', href: '/books' },
  { name: 'Segments', href: '/segments' },
  { name: 'Categories', href: '/categories' },
];

export const Header: React.FC<HeaderProps> = ({
  title,
  onMenuClick,
  actions,
  showMenuButton = true,
}) => {
  const location = useLocation();

  const currentPageTitle = title || 
    navigationItems.find(item => item.href === location.pathname)?.name || 
    'CashLite';

  return (
    <header className="bg-card shadow-sm border-b border-border">
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center space-x-3">
          {showMenuButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="lg:hidden p-2 h-auto"
            >
              <Menu className="h-6 w-6" />
            </Button>
          )}
          <h1 className="text-xl font-semibold text-foreground">
            {currentPageTitle}
          </h1>
        </div>
        
        {actions && (
          <div className="flex items-center space-x-4">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
};