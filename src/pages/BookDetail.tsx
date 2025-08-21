import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Edit, ArrowLeft, Plus, Filter, Search, Calendar, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { useStore } from '../store';
import { BookService, TransactionService } from '../lib/services';
import { Book, Transaction } from '../types';
import { formatCurrency, formatDate } from '../lib/utils';
import toast from 'react-hot-toast';

const bookService = new BookService();
const transactionService = new TransactionService();

export const BookDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentBook, setCurrentBook } = useStore();
  const [book, setBook] = useState<Book | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadBookData = async () => {
      if (!id) {
        navigate('/books');
        return;
      }

      try {
        setIsLoading(true);
        const bookData = await bookService.getById(id);
        
        if (!bookData) {
          toast.error('Book not found');
          navigate('/books');
          return;
        }

        setBook(bookData);
        
        // Load transactions for this book
        const allTransactions = await transactionService.getAll();
        const bookTransactions = allTransactions.filter(t => t.bookId === id);
        setTransactions(bookTransactions);
        
        // Set as current book if not already set
        if (!currentBook || currentBook.id !== id) {
          setCurrentBook(bookData);
        }
      } catch (error) {
        console.error('Error loading book:', error);
        toast.error('Failed to load book data');
      } finally {
        setIsLoading(false);
      }
    };

    loadBookData();
  }, [id, navigate, currentBook, setCurrentBook]);

  const filteredTransactions = transactions.filter(transaction =>
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netIncome = totalIncome - totalExpenses;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Book not found</p>
        <Link to="/books" className="text-primary hover:underline mt-2 inline-block">
          Return to Books
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/books')}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{book.name}</h1>
            {book.description && (
              <p className="text-gray-600">{book.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to={`/books/${book.id}/edit`}
            className="btn btn-secondary btn-sm"
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Link>
          <Link
            to="/transactions/new"
            className="btn btn-primary btn-sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Transaction
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total Income</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(totalIncome, book.currency)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(totalExpenses, book.currency)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg ${netIncome >= 0 ? 'bg-blue-100' : 'bg-orange-100'}`}>
              <DollarSign className={`h-6 w-6 ${netIncome >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Net Balance</p>
              <p className={`text-2xl font-bold ${netIncome >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                {formatCurrency(netIncome, book.currency)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Recent Transactions</h2>
            <div className="flex items-center space-x-2">
              <button className="btn btn-secondary btn-sm">
                <Filter className="h-4 w-4 mr-1" />
                Filter
              </button>
              <button className="btn btn-secondary btn-sm">
                <Calendar className="h-4 w-4 mr-1" />
                Date Range
              </button>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="p-6">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">
                {transactions.length === 0 ? 'No transactions yet' : 'No transactions match your search'}
              </p>
              <Link
                to="/transactions/new"
                className="btn btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Transaction
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTransactions.slice(0, 10).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">{transaction.description}</h3>
                      <span className={`font-semibold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(transaction.amount, book.currency)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-gray-500">
                        {formatDate(transaction.date)}
                      </p>
                      {transaction.categoryId && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          Category
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredTransactions.length > 10 && (
                <div className="text-center pt-4">
                  <Link
                    to="/transactions"
                    className="text-primary hover:underline"
                  >
                    View all {filteredTransactions.length} transactions
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};