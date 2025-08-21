import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Calendar, ArrowUpDown } from 'lucide-react';
import { useStore } from '../store';
import { TransactionService } from '../lib/services';
import { formatCurrency, formatDate } from '../lib/utils';
import { Transaction } from '../types';

const transactionService = new TransactionService();

interface MonthlyStats {
  income: number;
  expense: number;
  net: number;
  transactionCount: number;
  avgDailyIncome: number;
  avgDailyExpense: number;
}

interface ComparisonData {
  current: MonthlyStats;
  previous: MonthlyStats;
  incomeChange: number;
  expenseChange: number;
  netChange: number;
}

export const MonthlySummary: React.FC = () => {
  const { currentBook, categories } = useStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats>({
    income: 0,
    expense: 0,
    net: 0,
    transactionCount: 0,
    avgDailyIncome: 0,
    avgDailyExpense: 0
  });
  const [previousMonthStats, setPreviousMonthStats] = useState<MonthlyStats>({
    income: 0,
    expense: 0,
    net: 0,
    transactionCount: 0,
    avgDailyIncome: 0,
    avgDailyExpense: 0
  });
  const [monthlyTransactions, setMonthlyTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Navigate to previous month
  const navigateToPreviousMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setSelectedDate(newDate);
  };

  // Navigate to next month
  const navigateToNextMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setSelectedDate(newDate);
  };

  // Calculate monthly statistics
  const calculateMonthlyStats = (transactions: Transaction[], year: number, month: number): MonthlyStats => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const daysInMonth = new Date(year, month, 0).getDate();
    
    return {
      income,
      expense,
      net: income - expense,
      transactionCount: transactions.length,
      avgDailyIncome: income / daysInMonth,
      avgDailyExpense: expense / daysInMonth
    };
  };

  // Load monthly data
  useEffect(() => {
    const loadMonthlyData = async () => {
      if (!currentBook) return;

      try {
        setIsLoading(true);
        
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth() + 1;
        
        // Get current month stats and transactions
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        
        const transactions = await transactionService.getAll({
          bookIds: [currentBook.id],
          dateFrom: startDate,
          dateTo: endDate
        });
        
        const currentStats = calculateMonthlyStats(transactions, year, month);
        
        // Get previous month for comparison
        const prevYear = month === 1 ? year - 1 : year;
        const prevMonth = month === 1 ? 12 : month - 1;
        const prevStartDate = new Date(prevYear, prevMonth - 1, 1);
        const prevEndDate = new Date(prevYear, prevMonth, 0);
        
        const prevTransactions = await transactionService.getAll({
          bookIds: [currentBook.id],
          dateFrom: prevStartDate,
          dateTo: prevEndDate
        });
        
        const prevStats = calculateMonthlyStats(prevTransactions, prevYear, prevMonth);
        
        setMonthlyStats(currentStats);
        setPreviousMonthStats(prevStats);
        setMonthlyTransactions(transactions);
        
      } catch (error) {
        console.error('Error loading monthly data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMonthlyData();
  }, [currentBook, selectedDate]);

  // Calculate percentage change
  const calculatePercentageChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const getCategoryName = (categoryId?: string): string => {
    if (!categoryId) return 'Uncategorized';
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Unknown';
  };

  if (!currentBook) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Monthly Summary</h2>
        <p className="text-gray-600">Please select a book to view monthly summary</p>
      </div>
    );
  }

  const incomeChange = calculatePercentageChange(monthlyStats.income, previousMonthStats.income);
  const expenseChange = calculatePercentageChange(monthlyStats.expense, previousMonthStats.expense);
  const netChange = calculatePercentageChange(monthlyStats.net, previousMonthStats.net);

  return (
    <div className="space-y-6">
      {/* Header with Month Navigation */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Monthly Summary</h1>
            <p className="text-gray-600">{currentBook.name}</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={navigateToPreviousMonth}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            <div className="text-center">
              <div className="text-xl font-semibold text-gray-900">
                {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
            </div>
            
            <button
              onClick={navigateToNextMonth}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Monthly Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Income Card */}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Monthly Income</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(monthlyStats.income, currentBook.currency)}
              </p>
              <div className="flex items-center mt-2">
                <ArrowUpDown className="h-4 w-4 text-gray-400 mr-1" />
                <span className={`text-sm ${incomeChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {incomeChange >= 0 ? '+' : ''}{incomeChange.toFixed(1)}% from last month
                </span>
              </div>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Expense Card */}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Monthly Expense</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(monthlyStats.expense, currentBook.currency)}
              </p>
              <div className="flex items-center mt-2">
                <ArrowUpDown className="h-4 w-4 text-gray-400 mr-1" />
                <span className={`text-sm ${expenseChange <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {expenseChange >= 0 ? '+' : ''}{expenseChange.toFixed(1)}% from last month
                </span>
              </div>
            </div>
            <div className="p-3 bg-red-50 rounded-full">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        {/* Net Income Card */}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Net Income</p>
              <p className={`text-2xl font-bold ${monthlyStats.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(monthlyStats.net, currentBook.currency)}
              </p>
              <div className="flex items-center mt-2">
                <ArrowUpDown className="h-4 w-4 text-gray-400 mr-1" />
                <span className={`text-sm ${netChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {netChange >= 0 ? '+' : ''}{netChange.toFixed(1)}% from last month
                </span>
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          <p className="text-sm text-gray-600">Total Transactions</p>
          <p className="text-xl font-bold text-gray-900">{monthlyStats.transactionCount}</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-sm text-gray-600">Avg Daily Income</p>
          <p className="text-xl font-bold text-green-600">
            {formatCurrency(monthlyStats.avgDailyIncome, currentBook.currency)}
          </p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-sm text-gray-600">Avg Daily Expense</p>
          <p className="text-xl font-bold text-red-600">
            {formatCurrency(monthlyStats.avgDailyExpense, currentBook.currency)}
          </p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-sm text-gray-600">Savings Rate</p>
          <p className={`text-xl font-bold ${monthlyStats.income > 0 ? (monthlyStats.net / monthlyStats.income * 100 >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-900'}`}>
            {monthlyStats.income > 0 ? `${(monthlyStats.net / monthlyStats.income * 100).toFixed(1)}%` : '0%'}
          </p>
        </div>
      </div>

      {/* Monthly Transactions List */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            Transactions for {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
        </div>
        
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-gray-500">Loading transactions...</p>
          </div>
        ) : monthlyTransactions.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No transactions found for this month</p>
          </div>
        ) : (
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {monthlyTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(transaction.date)}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        {transaction.notes && (
                          <p className="text-sm text-gray-500">{transaction.notes}</p>
                        )}
                        {transaction.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
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
                      <span className={`font-medium ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(transaction.amount, currentBook.currency)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};