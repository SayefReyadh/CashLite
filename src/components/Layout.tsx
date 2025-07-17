import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  ArrowUpDown, 
  Book, 
  FolderOpen, 
  Tag, 
  Upload, 
  Download, 
  Settings, 
  Menu,
  X
} from 'lucide-react';
import { useStore } from '../store';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Transactions', href: '/transactions', icon: ArrowUpDown },
  { name: 'Books', href: '/books', icon: Book },
  { name: 'Segments', href: '/segments', icon: FolderOpen },
  { name: 'Categories', href: '/categories', icon: Tag },
  { name: 'Import', href: '/import', icon: Upload },
  { name: 'Export', href: '/export', icon: Download },
  { name: 'Settings', href: '/settings', icon: Settings },
];

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { sidebarOpen, setSidebarOpen } = useStore();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-xl font-bold text-primary">CashLite</span>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <nav className="mt-5 px-2">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon
                    className={`${
                      isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'
                    } mr-3 h-5 w-5`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <Menu className="h-6 w-6" />
              </button>
              <h1 className="ml-2 text-xl font-semibold text-gray-900">
                {navigation.find(item => item.href === location.pathname)?.name || 'CashLite'}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <BookSelector />
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-4 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

const BookSelector: React.FC = () => {
  const { books, currentBook, setCurrentBook } = useStore();

  if (books.length === 0) {
    return (
      <Link
        to="/books/new"
        className="btn btn-primary btn-sm"
      >
        Create Book
      </Link>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-600">Book:</span>
      <select
        value={currentBook?.id || ''}
        onChange={(e) => {
          const book = books.find(b => b.id === e.target.value);
          setCurrentBook(book || null);
        }}
        className="form-input py-1 px-2 text-sm min-w-0 w-32"
      >
        {books.map((book) => (
          <option key={book.id} value={book.id}>
            {book.name}
          </option>
        ))}
      </select>
    </div>
  );
};
