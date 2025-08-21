import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { useStore } from '../store';
import { BookService, TransactionService } from '../lib/services';
import { formatCurrency, formatDate } from '../lib/utils';
import { Transaction } from '../types';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

const bookService = new BookService();
const transactionService = new TransactionService();

export const Dashboard: React.FC = () => {
  const { currentBook, transactions, categories } = useStore();
  const [monthlyStats, setMonthlyStats] = useState({ income: 0, expense: 0 });
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!currentBook) return;

      try {
        setIsLoading(true);
        
        // Get current month stats
        const now = new Date();
        const stats = await transactionService.getMonthlyStats(
          currentBook.id,
          now.getFullYear(),
          now.getMonth() + 1
        );
        setMonthlyStats(stats);

        // Get recent transactions
        const recent = await transactionService.getAll({
          bookIds: [currentBook.id]
        });
        setRecentTransactions(recent.slice(0, 5));
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [currentBook]);

  if (!currentBook) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to CashLite</h2>
        <p className="text-gray-600 mb-8">Create your first book to get started</p>
        <Link
          to="/books/new"
          className="btn btn-primary btn-lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Book
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-6">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
        <div className="card p-6">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const balance = currentBook.balance;
  const netIncome = monthlyStats.income - monthlyStats.expense;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Current Balance</p>
              <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(balance, currentBook.currency)}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Monthly Income</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(monthlyStats.income, currentBook.currency)}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Monthly Expense</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(monthlyStats.expense, currentBook.currency)}
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded-full">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Net Income Card */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Net Income (This Month)</p>
            <p className={`text-xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(netIncome, currentBook.currency)}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-600">
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h3 className="card-title">Recent Transactions</h3>
            <Link
              to="/transactions"
              className="text-sm text-primary hover:text-primary/80"
            >
              View all
            </Link>
          </div>
        </div>
        <div className="card-content">
          {recentTransactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No transactions yet</p>
              <Link
                to="/transactions/new"
                className="btn btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Transaction
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentTransactions.map((transaction) => {
                const category = categories.find(c => c.id === transaction.categoryId);
                
                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <div>
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        <p className="text-sm text-gray-500">
                          {formatDate(transaction.date)}
                          {category && ` • ${category.name}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(transaction.amount, currentBook.currency)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/transactions/new"
          className="card p-6 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-50 rounded-full">
              <Plus className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Add Transaction</h4>
              <p className="text-sm text-gray-500">Record income or expense</p>
            </div>
          </div>
        </Link>

        <Link
          to="/import"
          className="card p-6 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-full">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Import Data</h4>
              <p className="text-sm text-gray-500">Import from CSV file</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};
