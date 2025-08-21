export interface Book {
  id: string;
  name: string;
  description?: string;
  segmentId?: string;
  currency: string;
  color: string;
  icon: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  balance: number;
}

export interface Segment {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  totalBalance: number;
}

export interface Transaction {
  id: string;
  bookId: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  notes?: string;
  categoryId?: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
  isRecurring: boolean;
  recurringId?: string;
  tags: string[];
  originalTransactionId?: string;
  isReversed: boolean;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense' | 'both';
  color: string;
  icon: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Settings {
  id: string;
  key: string;
  value: any;
  updatedAt: Date;
}

export interface FilterOptions {
  bookIds?: string[];
  segmentIds?: string[];
  type?: 'income' | 'expense';
  dateFrom?: Date;
  dateTo?: Date;
  amountMin?: number;
  amountMax?: number;
  categoryIds?: string[];
  searchText?: string;
  tags?: string[];
}

export interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  errors: string[];
  transactions: Transaction[];
}

export interface ExportOptions {
  dateFrom?: Date;
  dateTo?: Date;
  format?: 'csv' | 'json';
  includeBalance?: boolean;
}

export interface CSVRow {
  Date: string;
  Time: string;
  Remark: string;
  Party: string;
  Category: string;
  Mode: string;
  'Cash In': string;
  'Cash Out': string;
  Balance: string;
}

// Data Aggregation Types
export interface CategoryAggregation {
  categoryId: string;
  categoryName: string;
  totalAmount: number;
  transactionCount: number;
  averageAmount: number;
  minAmount: number;
  maxAmount: number;
  type: 'income' | 'expense' | 'both';
  percentage: number;
}

export interface DailySummary {
  date: string; // YYYY-MM-DD format
  totalIncome: number;
  totalExpense: number;
  netAmount: number;
  transactionCount: number;
  incomeTransactions: number;
  expenseTransactions: number;
  topCategories: CategoryAggregation[];
}

export interface MonthlySummary {
  year: number;
  month: number;
  totalIncome: number;
  totalExpense: number;
  netAmount: number;
  transactionCount: number;
  incomeTransactions: number;
  expenseTransactions: number;
  avgDailyIncome: number;
  avgDailyExpense: number;
  categoryBreakdown: CategoryAggregation[];
  dailySummaries: DailySummary[];
  biggestIncomeDay: string;
  biggestExpenseDay: string;
  daysWithTransactions: number;
}

export interface AggregationOptions {
  bookIds?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  groupBy?: 'category' | 'day' | 'month' | 'year';
  includeInactive?: boolean;
}

export interface CacheEntry<T> {
  key: string;
  data: T;
  timestamp: number;
  ttl: number; // time to live in milliseconds
}

export interface CacheOptions {
  ttl?: number; // default time to live in milliseconds
  maxSize?: number; // maximum number of entries to cache
}
