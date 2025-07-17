import { db } from './database';
import { Book, Segment, Transaction, Category, FilterOptions, ImportResult, ExportOptions, CSVRow } from '../types';
import { generateId } from './utils';

export class BookService {
  async getAll(): Promise<Book[]> {
    return await db.books.orderBy('name').toArray();
  }

  async getById(id: string): Promise<Book | undefined> {
    return await db.books.get(id);
  }

  async create(book: Omit<Book, 'id' | 'createdAt' | 'updatedAt' | 'balance'>): Promise<Book> {
    const newBook: Book = {
      ...book,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      balance: 0
    };
    
    await db.books.add(newBook);
    return newBook;
  }

  async update(id: string, updates: Partial<Book>): Promise<void> {
    await db.books.update(id, { ...updates, updatedAt: new Date() });
  }

  async delete(id: string): Promise<void> {
    await db.books.delete(id);
  }

  async getBalance(bookId: string): Promise<number> {
    const transactions = await db.transactions
      .where('bookId')
      .equals(bookId)
      .toArray();
    
    return transactions.reduce((total, transaction) => {
      return transaction.type === 'income' 
        ? total + transaction.amount 
        : total - transaction.amount;
    }, 0);
  }

  async updateBalance(bookId: string): Promise<void> {
    const balance = await this.getBalance(bookId);
    await db.books.update(bookId, { balance });
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
        query = query.filter(t => t.categoryId && filter.categoryIds!.includes(t.categoryId));
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
          (t.notes && t.notes.toLowerCase().includes(searchLower))
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
    await db.categories.delete(id);
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

    const dateStr = row.Date;
    const timeStr = row.Time || '00:00';
    const date = new Date(`${dateStr} ${timeStr}`);

    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date format: ${dateStr} ${timeStr}`);
    }

    const cashIn = parseFloat(row['Cash In'] || '0');
    const cashOut = parseFloat(row['Cash Out'] || '0');

    if (cashIn === 0 && cashOut === 0) {
      return null;
    }

    const type: 'income' | 'expense' = cashIn > 0 ? 'income' : 'expense';
    const amount = type === 'income' ? cashIn : cashOut;

    return {
      bookId,
      type,
      amount,
      description: row.Remark || row.Party || 'Imported transaction',
      notes: [row.Remark, row.Party, row.Mode].filter(Boolean).join(' | '),
      date,
      isRecurring: false,
      tags: row.Category ? [row.Category] : [],
      isReversed: false
    };
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

    const csvHeader = 'Date,Time,Type,Amount,Description,Notes,Category,Balance\n';
    
    let runningBalance = 0;
    const csvRows = transactions.map(transaction => {
      const category = categories.find(c => c.id === transaction.categoryId);
      
      if (transaction.type === 'income') {
        runningBalance += transaction.amount;
      } else {
        runningBalance -= transaction.amount;
      }

      const date = transaction.date.toISOString().split('T')[0];
      const time = transaction.date.toTimeString().split(' ')[0];
      
      return [
        date,
        time,
        transaction.type,
        transaction.amount.toFixed(2),
        `"${transaction.description.replace(/"/g, '""')}"`,
        `"${(transaction.notes || '').replace(/"/g, '""')}"`,
        category?.name || '',
        runningBalance.toFixed(2)
      ].join(',');
    });

    return csvHeader + csvRows.join('\n');
  }
}
