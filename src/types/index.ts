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
  limit?: number;
  offset?: number;
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
