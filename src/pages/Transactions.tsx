import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Filter,
  Search,
  Download,
  Upload
} from 'lucide-react';
import { useStore } from '../store';
import { TransactionService, CategoryService } from '../lib/services';
import { Transaction, FilterOptions } from '../types';
import { formatCurrency, formatDate } from '../lib/utils';
import { TransactionForm } from '../components/TransactionForm';
import toast from 'react-hot-toast';

const transactionService = new TransactionService();
const categoryService = new CategoryService();

export const Transactions: React.FC = () => {
  const { currentBook, categories, setCategories } = useStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<
    Transaction | undefined
  >();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<FilterOptions>({});
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!currentBook) return;

      try {
        setIsLoading(true);
        const [transactionsData, categoriesData] = await Promise.all([
          transactionService.getAll({ bookIds: [currentBook.id] }),
          categoryService.getAll()
        ]);

        setTransactions(transactionsData);
        setFilteredTransactions(transactionsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load transactions');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentBook, setCategories]);

  useEffect(() => {
    const applyFilters = () => {
      let filtered = [...transactions];

      // Apply search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        filtered = filtered.filter(
          t =>
            t.description.toLowerCase().includes(search) ||
            (t.notes && t.notes.toLowerCase().includes(search))
        );
      }

      // Apply additional filters
      if (filter.type) {
        filtered = filtered.filter(t => t.type === filter.type);
      }

      if (filter.categoryIds && filter.categoryIds.length > 0) {
        filtered = filtered.filter(
          t => t.categoryId && filter.categoryIds!.includes(t.categoryId)
        );
      }

      if (filter.dateFrom) {
        filtered = filtered.filter(t => t.date >= filter.dateFrom!);
      }

      if (filter.dateTo) {
        filtered = filtered.filter(t => t.date <= filter.dateTo!);
      }

      if (filter.amountMin !== undefined) {
        filtered = filtered.filter(t => t.amount >= filter.amountMin!);
      }

      if (filter.amountMax !== undefined) {
        filtered = filtered.filter(t => t.amount <= filter.amountMax!);
      }

      setFilteredTransactions(filtered);
    };

    applyFilters();
  }, [transactions, searchTerm, filter]);

  const handleDelete = async (transactionId: string) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    try {
      await transactionService.delete(transactionId);
      setTransactions(prev => prev.filter(t => t.id !== transactionId));
      toast.success('Transaction deleted successfully');
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Failed to delete transaction');
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleSave = (transaction: Transaction) => {
    if (editingTransaction) {
      setTransactions(prev =>
        prev.map(t => (t.id === transaction.id ? transaction : t))
      );
    } else {
      setTransactions(prev => [transaction, ...prev]);
    }
    setEditingTransaction(undefined);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTransaction(undefined);
  };

  const getCategoryName = (categoryId?: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Uncategorized';
  };

  const clearFilters = () => {
    setFilter({});
    setSearchTerm('');
    setShowFilter(false);
  };

  if (!currentBook) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">
          Please select a book to view transactions
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="btn btn-secondary"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </button>
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
          {(Object.keys(filter).length > 0 || searchTerm) && (
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Advanced Filters */}
        {showFilter && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={filter.type || ''}
                onChange={e =>
                  setFilter({
                    ...filter,
                    type: (e.target.value as 'income' | 'expense') || undefined
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={filter.categoryIds?.[0] || ''}
                onChange={e =>
                  setFilter({
                    ...filter,
                    categoryIds: e.target.value ? [e.target.value] : undefined
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={
                  filter.dateFrom
                    ? filter.dateFrom.toISOString().split('T')[0]
                    : ''
                }
                onChange={e =>
                  setFilter({
                    ...filter,
                    dateFrom: e.target.value
                      ? new Date(e.target.value)
                      : undefined
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={
                  filter.dateTo ? filter.dateTo.toISOString().split('T')[0] : ''
                }
                onChange={e =>
                  setFilter({
                    ...filter,
                    dateTo: e.target.value
                      ? new Date(e.target.value)
                      : undefined
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        )}
      </div>

      {/* Transactions List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-gray-500">Loading transactions...</p>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">
            {transactions.length === 0
              ? 'No transactions found'
              : 'No transactions match your filters'}
          </p>
          {transactions.length === 0 && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 btn btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add your first transaction
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map(transaction => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(transaction.date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div>
                        <div className="font-medium">
                          {transaction.description}
                        </div>
                        {transaction.notes && (
                          <div className="text-gray-500 text-xs mt-1">
                            {transaction.notes}
                          </div>
                        )}
                        {transaction.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {transaction.tags.map(tag => (
                              <span
                                key={tag}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getCategoryName(transaction.categoryId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`font-medium ${
                          transaction.type === 'income'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(
                          transaction.amount,
                          currentBook.currency
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(transaction)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(transaction.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transaction Form Modal */}
      {showForm && (
        <TransactionForm
          transaction={editingTransaction}
          onClose={handleCloseForm}
          onSave={handleSave}
        />
      )}
    </div>
  );
};
