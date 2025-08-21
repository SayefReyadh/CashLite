import { db } from './database';
import { Book, Segment, Transaction, Category, FilterOptions, ImportResult, ExportOptions, CSVRow } from '../types';
import { generateId, parseDateTime, isValidDate, parseCurrencyAmount, formatDateISO } from './utils';

// Service utilities for error handling and validation
class ServiceError extends Error {
  constructor(message: string, public code: string, public details?: any) {
    super(message);
    this.name = 'ServiceError';
  }
}

const validateId = (id: string, entityName: string): void => {
  if (!id || typeof id !== 'string') {
    throw new ServiceError(`Invalid ${entityName} ID`, 'INVALID_ID');
  }
};

const validateExists = <T>(entity: T | undefined, entityName: string, id: string): T => {
  if (!entity) {
    throw new ServiceError(`${entityName} not found`, 'NOT_FOUND', { id });
  }
  return entity;
};

export class BookService {
  async getAll(): Promise<Book[]> {
    try {
      return await db.books.orderBy('name').toArray();
    } catch (error) {
      throw new ServiceError('Failed to fetch books', 'FETCH_ERROR', { error });
    }
  }

  async getById(id: string): Promise<Book | undefined> {
    validateId(id, 'book');
    try {
      return await db.books.get(id);
    } catch (error) {
      throw new ServiceError('Failed to fetch book', 'FETCH_ERROR', { id, error });
    }
  }

  async create(book: Omit<Book, 'id' | 'createdAt' | 'updatedAt' | 'balance'>): Promise<Book> {
    if (!book.name || !book.currency) {
      throw new ServiceError('Book name and currency are required', 'VALIDATION_ERROR');
    }
    
    try {
      const newBook: Book = {
        ...book,
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
        balance: 0
      };
      
      await db.books.add(newBook);
      return newBook;
    } catch (error) {
      throw new ServiceError('Failed to create book', 'CREATE_ERROR', { error });
    }
  }

  async update(id: string, updates: Partial<Book>): Promise<void> {
    validateId(id, 'book');
    
    try {
      const book = await this.getById(id);
      validateExists(book, 'Book', id);
      
      await db.books.update(id, { ...updates, updatedAt: new Date() });
    } catch (error) {
      if (error instanceof ServiceError) throw error;
      throw new ServiceError('Failed to update book', 'UPDATE_ERROR', { id, error });
    }
  }

  async delete(id: string): Promise<void> {
    validateId(id, 'book');
    
    try {
      const book = await this.getById(id);
      validateExists(book, 'Book', id);
      
      // Check if book has transactions
      const transactionsCount = await db.transactions.where('bookId').equals(id).count();
      if (transactionsCount > 0) {
        throw new ServiceError('Cannot delete book with transactions', 'CONSTRAINT_ERROR', { 
          id, 
          transactionsCount 
        });
      }
      
      await db.books.delete(id);
    } catch (error) {
      if (error instanceof ServiceError) throw error;
      throw new ServiceError('Failed to delete book', 'DELETE_ERROR', { id, error });
    }
  }

  async getBalance(bookId: string): Promise<number> {
    validateId(bookId, 'book');
    
    try {
      const transactions = await db.transactions
        .where('bookId')
        .equals(bookId)
        .toArray();
      
      return transactions.reduce((total, transaction) => {
        return transaction.type === 'income' 
          ? total + transaction.amount 
          : total - transaction.amount;
      }, 0);
    } catch (error) {
      throw new ServiceError('Failed to calculate book balance', 'CALCULATION_ERROR', { bookId, error });
    }
  }

  async updateBalance(bookId: string): Promise<void> {
    validateId(bookId, 'book');
    
    try {
      const balance = await this.getBalance(bookId);
      await db.books.update(bookId, { balance });
    } catch (error) {
      if (error instanceof ServiceError) throw error;
      throw new ServiceError('Failed to update book balance', 'UPDATE_ERROR', { bookId, error });
    }
  }
}

export class SegmentService {
  async getAll(): Promise<Segment[]> {
    return await db.segments.orderBy('name').toArray();
  }

  async getById(id: string): Promise<Segment | undefined> {
    return await db.segments.get(id);
  }

  async create(segment: Omit<Segment, 'id' | 'createdAt' | 'updatedAt' | 'totalBalance'>): Promise<Segment> {
    const newSegment: Segment = {
      ...segment,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      totalBalance: 0
    };
    
    await db.segments.add(newSegment);
    return newSegment;
  }

  async update(id: string, updates: Partial<Segment>): Promise<void> {
    await db.segments.update(id, { ...updates, updatedAt: new Date() });
  }

  async delete(id: string): Promise<void> {
    await db.segments.delete(id);
  }

  async getTotalBalance(segmentId: string): Promise<number> {
    const books = await db.books.where('segmentId').equals(segmentId).toArray();
    let total = 0;
    
    for (const book of books) {
      const balance = await new BookService().getBalance(book.id);
      total += balance;
    }
    
    return total;
  }

  async updateTotalBalance(segmentId: string): Promise<void> {
    const totalBalance = await this.getTotalBalance(segmentId);
    await db.segments.update(segmentId, { totalBalance });
  }
}

export class TransactionService {
  async getAll(filter?: FilterOptions): Promise<Transaction[]> {
    let query = db.transactions.orderBy('date').reverse();
    
    if (filter) {
      if (filter.bookIds && filter.bookIds.length > 0) {
        query = query.filter(t => filter.bookIds!.includes(t.bookId));
      }
      
      if (filter.type) {
        query = query.filter(t => t.type === filter.type);
      }
      
      if (filter.dateFrom) {
        query = query.filter(t => t.date >= filter.dateFrom!);
      }
      
      if (filter.dateTo) {
        query = query.filter(t => t.date <= filter.dateTo!);
      }
      
      if (filter.categoryIds && filter.categoryIds.length > 0) {
        query = query.filter(t => !!t.categoryId && filter.categoryIds!.includes(t.categoryId));
      }
      
      if (filter.amountMin !== undefined) {
        query = query.filter(t => t.amount >= filter.amountMin!);
      }
      
      if (filter.amountMax !== undefined) {
        query = query.filter(t => t.amount <= filter.amountMax!);
      }
      
      if (filter.searchText) {
        const searchLower = filter.searchText.toLowerCase();
        query = query.filter(t => 
          t.description.toLowerCase().includes(searchLower) ||
          (t.notes ? t.notes.toLowerCase().includes(searchLower) : false)
        );
      }
      
      if (filter.tags && filter.tags.length > 0) {
        query = query.filter(t => 
          filter.tags!.some(tag => t.tags.includes(tag))
        );
      }
    }
    
    return await query.toArray();
  }

  async getById(id: string): Promise<Transaction | undefined> {
    return await db.transactions.get(id);
  }

  async create(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    const newTransaction: Transaction = {
      ...transaction,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await db.transactions.add(newTransaction);
    
    // Update book balance
    await new BookService().updateBalance(transaction.bookId);
    
    return newTransaction;
  }

  async update(id: string, updates: Partial<Transaction>): Promise<void> {
    const transaction = await db.transactions.get(id);
    if (!transaction) return;
    
    await db.transactions.update(id, { ...updates, updatedAt: new Date() });
    
    // Update book balance
    await new BookService().updateBalance(transaction.bookId);
  }

  async delete(id: string): Promise<void> {
    const transaction = await db.transactions.get(id);
    if (!transaction) return;
    
    await db.transactions.delete(id);
    
    // Update book balance
    await new BookService().updateBalance(transaction.bookId);
  }

  async getMonthlyStats(bookId: string, year: number, month: number): Promise<{ income: number; expense: number }> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const transactions = await db.transactions
      .where('bookId')
      .equals(bookId)
      .filter(t => t.date >= startDate && t.date <= endDate)
      .toArray();
    
    return transactions.reduce(
      (stats, transaction) => {
        if (transaction.type === 'income') {
          stats.income += transaction.amount;
        } else {
          stats.expense += transaction.amount;
        }
        return stats;
      },
      { income: 0, expense: 0 }
    );
  }

  async duplicate(transactionId: string, targetBookId?: string): Promise<Transaction> {
    const original = await db.transactions.get(transactionId);
    if (!original) {
      throw new Error('Transaction not found');
    }
    
    const duplicate: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> = {
      ...original,
      bookId: targetBookId || original.bookId,
      originalTransactionId: transactionId,
      description: `Copy of ${original.description}`
    };
    
    return await this.create(duplicate);
  }

  async reverse(transactionId: string, targetBookId?: string): Promise<Transaction> {
    const original = await db.transactions.get(transactionId);
    if (!original) {
      throw new Error('Transaction not found');
    }
    
    const reversed: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> = {
      ...original,
      bookId: targetBookId || original.bookId,
      type: original.type === 'income' ? 'expense' : 'income',
      originalTransactionId: transactionId,
      isReversed: true,
      description: `Reversal of ${original.description}`
    };
    
    return await this.create(reversed);
  }

  async getTransactionsByDateRange(bookId: string, startDate: Date, endDate: Date): Promise<Transaction[]> {
    return await db.transactions
      .where('bookId')
      .equals(bookId)
      .filter(t => t.date >= startDate && t.date <= endDate)
      .sortBy('date');
  }

  async searchTransactions(query: string, bookId?: string): Promise<Transaction[]> {
    const searchLower = query.toLowerCase();
    let collection = db.transactions.orderBy('date').reverse();
    
    if (bookId) {
      collection = db.transactions.where('bookId').equals(bookId).reverse();
    }
    
    return await collection.filter(t => 
      t.description.toLowerCase().includes(searchLower) ||
      (t.notes ? t.notes.toLowerCase().includes(searchLower) : false) ||
      t.tags.some(tag => tag.toLowerCase().includes(searchLower))
    ).toArray();
  }
}

export class CategoryService {
  async getAll(): Promise<Category[]> {
    return await db.categories.orderBy('name').toArray();
  }

  async getById(id: string): Promise<Category | undefined> {
    return await db.categories.get(id);
  }

  async create(category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
    const newCategory: Category = {
      ...category,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await db.categories.add(newCategory);
    return newCategory;
  }

  async update(id: string, updates: Partial<Category>): Promise<void> {
    await db.categories.update(id, { ...updates, updatedAt: new Date() });
  }

  async delete(id: string): Promise<void> {
    // Check if category is being used by any transactions
    const transactionsCount = await db.transactions.where('categoryId').equals(id).count();
    if (transactionsCount > 0) {
      throw new Error('Cannot delete category that is being used by transactions');
    }
    
    await db.categories.delete(id);
  }

  async getActiveCategories(): Promise<Category[]> {
    return await db.categories.where('isActive').equals(true).sortBy('name');
  }

  async getCategoriesByType(type: 'income' | 'expense' | 'both'): Promise<Category[]> {
    return await db.categories
      .where('type')
      .anyOf([type, 'both'])
      .and(category => category.isActive)
      .sortBy('name');
  }

  async getCategoryUsageStats(categoryId: string): Promise<{ transactionCount: number; totalAmount: number }> {
    const transactions = await db.transactions.where('categoryId').equals(categoryId).toArray();
    
    return {
      transactionCount: transactions.length,
      totalAmount: transactions.reduce((total, t) => total + t.amount, 0)
    };
  }

  async findOrCreateCategory(name: string, type: 'income' | 'expense'): Promise<string> {
    // Try to find existing category
    const existing = await db.categories
      .where('name')
      .equalsIgnoreCase(name)
      .and(cat => cat.type === type || cat.type === 'both')
      .first();
    
    if (existing) {
      return existing.id;
    }
    
    // Create new category
    const newCategory = await this.create({
      name,
      type,
      color: this.getDefaultCategoryColor(type),
      icon: this.getDefaultCategoryIcon(name),
      isDefault: false,
      isActive: true
    });
    
    return newCategory.id;
  }

  private getDefaultCategoryColor(type: 'income' | 'expense'): string {
    return type === 'income' ? '#059669' : '#dc2626';
  }

  private getDefaultCategoryIcon(categoryName: string): string {
    const name = categoryName.toLowerCase();
    
    if (name.includes('food') || name.includes('dining')) return 'utensils';
    if (name.includes('transport')) return 'car';
    if (name.includes('shopping')) return 'shopping-bag';
    if (name.includes('entertainment')) return 'film';
    if (name.includes('salary')) return 'briefcase';
    if (name.includes('freelance')) return 'laptop';
    if (name.includes('investment')) return 'trending-up';
    
    return 'circle';
  }
}

export class ImportService {
  async importCSV(csvData: string, bookId: string): Promise<ImportResult> {
    const lines = csvData.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    const result: ImportResult = {
      success: false,
      imported: 0,
      skipped: 0,
      errors: [],
      transactions: []
    };

    try {
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        
        if (values.length !== headers.length) {
          result.errors.push(`Line ${i + 1}: Invalid number of columns`);
          result.skipped++;
          continue;
        }

        const row: CSVRow = headers.reduce((obj, header, index) => {
          obj[header as keyof CSVRow] = values[index];
          return obj;
        }, {} as CSVRow);

        try {
          const transaction = await this.parseCSVRow(row, bookId);
          if (transaction) {
            const created = await new TransactionService().create(transaction);
            result.transactions.push(created);
            result.imported++;
          } else {
            result.skipped++;
          }
        } catch (error) {
          result.errors.push(`Line ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          result.skipped++;
        }
      }

      result.success = true;
    } catch (error) {
      result.errors.push(`General error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  private async parseCSVRow(row: CSVRow, bookId: string): Promise<Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> | null> {
    if (!row.Date || (!row['Cash In'] && !row['Cash Out'])) {
      return null;
    }

    const date = parseDateTime(row.Date, row.Time);

    if (!isValidDate(date)) {
      throw new Error(`Invalid date format: ${row.Date} ${row.Time}`);
    }

    const cashIn = parseCurrencyAmount(row['Cash In'] || '0');
    const cashOut = parseCurrencyAmount(row['Cash Out'] || '0');

    if (cashIn === 0 && cashOut === 0) {
      return null;
    }

    const type: 'income' | 'expense' = cashIn > 0 ? 'income' : 'expense';
    const amount = type === 'income' ? cashIn : cashOut;

    // Auto-find or create category
    let categoryId: string | undefined;
    if (row.Category) {
      const categoryService = new CategoryService();
      categoryId = await categoryService.findOrCreateCategory(row.Category, type);
    }

    return {
      bookId,
      type,
      amount,
      description: row.Remark || row.Party || 'Imported transaction',
      notes: this.buildNotes(row),
      categoryId,
      date,
      isRecurring: false,
      tags: this.extractTags(row),
      isReversed: false
    };
  }

  private buildNotes(row: CSVRow): string {
    const notes: string[] = [];
    
    if (row.Party) notes.push(`Party: ${row.Party}`);
    if (row.Mode) notes.push(`Mode: ${row.Mode}`);
    if (row.Balance) notes.push(`Balance: ${row.Balance}`);
    
    return notes.join('\n');
  }

  private extractTags(row: CSVRow): string[] {
    const tags: string[] = [];
    
    if (row.Category) tags.push(row.Category);
    if (row.Mode) tags.push(row.Mode);
    
    // Auto-tag based on description
    const description = (row.Remark || '').toLowerCase();
    if (description.includes('atm')) tags.push('ATM');
    if (description.includes('online')) tags.push('Online');
    if (description.includes('transfer')) tags.push('Transfer');
    
    return tags.filter((tag, index, self) => self.indexOf(tag) === index); // Remove duplicates
  }
}

export class ExportService {
  async exportToCSV(bookId: string, options: ExportOptions = {}): Promise<string> {
    const filter: FilterOptions = {
      bookIds: [bookId],
      dateFrom: options.dateFrom,
      dateTo: options.dateTo
    };

    const transactions = await new TransactionService().getAll(filter);
    const categories = await new CategoryService().getAll();
    const book = await new BookService().getById(bookId);

    if (!book) {
      throw new Error('Book not found');
    }

    const csvHeader = 'Date,Time,Type,Amount,Description,Notes,Category,Tags,Balance\n';
    
    let runningBalance = 0;
    const csvRows = transactions.reverse().map(transaction => { // Reverse to get chronological order
      const category = categories.find(c => c.id === transaction.categoryId);
      
      if (transaction.type === 'income') {
        runningBalance += transaction.amount;
      } else {
        runningBalance -= transaction.amount;
      }

      const date = formatDateISO(transaction.date);
      const time = transaction.date.toTimeString().split(' ')[0];
      
      return [
        date,
        time,
        transaction.type,
        transaction.amount.toFixed(2),
        `"${transaction.description.replace(/"/g, '""')}"`,
        `"${(transaction.notes || '').replace(/"/g, '""')}"`,
        category?.name || '',
        `"${transaction.tags.join(', ')}"`,
        runningBalance.toFixed(2)
      ].join(',');
    });

    return csvHeader + csvRows.join('\n');
  }

  async exportToJSON(bookId: string, options: ExportOptions = {}): Promise<string> {
    const filter: FilterOptions = {
      bookIds: [bookId],
      dateFrom: options.dateFrom,
      dateTo: options.dateTo
    };

    const transactions = await new TransactionService().getAll(filter);
    const categories = await new CategoryService().getAll();
    const book = await new BookService().getById(bookId);

    const exportData = {
      book,
      transactions,
      categories: categories.filter(c => 
        transactions.some(t => t.categoryId === c.id)
      ),
      exportedAt: new Date().toISOString(),
      summary: {
        totalTransactions: transactions.length,
        totalIncome: transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
        totalExpense: transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
      }
    };

    return JSON.stringify(exportData, null, 2);
  }
}
