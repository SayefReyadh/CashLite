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

export interface Budget {
  id: string;
  name: string;
  description?: string;
  bookId: string;
  categoryId?: string;
  amount: number;
  period: 'monthly' | 'quarterly' | 'yearly';
  startDate: Date;
  endDate?: Date;
  alertThreshold?: number; // Percentage (0-100) to trigger alerts
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MonthlyOverview {
  id: string;
  bookId: string;
  year: number;
  month: number; // 1-12
  totalIncome: number;
  totalExpense: number;
  netIncome: number;
  openingBalance: number;
  closingBalance: number;
  categoryBreakdown: CategorySpending[];
  budgetComparison?: BudgetComparison[];
  transactionCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategorySpending {
  categoryId: string;
  categoryName: string;
  amount: number;
  transactionCount: number;
  percentage: number; // Percentage of total spending
}

export interface BudgetComparison {
  budgetId: string;
  budgetName: string;
  budgetAmount: number;
  actualAmount: number;
  percentage: number; // Actual vs Budget percentage
  isOverBudget: boolean;
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
