import Dexie, { Table } from 'dexie';
import { Book, Segment, Transaction, Category, Settings } from '../types';

export class CashLiteDB extends Dexie {
  books!: Table<Book>;
  segments!: Table<Segment>;
  transactions!: Table<Transaction>;
  categories!: Table<Category>;
  settings!: Table<Settings>;

  constructor() {
    super('CashLiteDB');
    
    // Version 1: Initial schema
    this.version(1).stores({
      books: '++id, name, segmentId, currency, isActive, createdAt, updatedAt',
      segments: '++id, name, isActive, createdAt, updatedAt',
      transactions: '++id, bookId, type, amount, date, categoryId, createdAt, updatedAt, isRecurring, recurringId, tags, isReversed',
      categories: '++id, name, type, isDefault, isActive, createdAt, updatedAt',
      settings: '++id, key, updatedAt'
    });
    
    // Future versions can be added here for migrations
    // Example for future version 2:
    // this.version(2).stores({
    //   books: '++id, name, segmentId, currency, isActive, createdAt, updatedAt, archivedAt',
    //   segments: '++id, name, isActive, createdAt, updatedAt',
    //   transactions: '++id, bookId, type, amount, date, categoryId, createdAt, updatedAt, isRecurring, recurringId, tags, isReversed, originalTransactionId',
    //   categories: '++id, name, type, isDefault, isActive, createdAt, updatedAt, parentId',
    //   settings: '++id, key, updatedAt'
    // }).upgrade(tx => {
    //   // Migration logic here
    //   return tx.books.toCollection().modify(book => {
    //     book.archivedAt = null;
    //   });
    // });
    
    this.on('ready', this.initializeDefaults);
  }

  private initializeDefaults = async () => {
    const categoryCount = await this.categories.count();
    
    if (categoryCount === 0) {
      await this.categories.bulkAdd([
        {
          id: 'cat-food',
          name: 'Food & Dining',
          type: 'expense',
          color: '#ef4444',
          icon: 'utensils',
          isDefault: true,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'cat-transport',
          name: 'Transportation',
          type: 'expense',
          color: '#f59e0b',
          icon: 'car',
          isDefault: true,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'cat-shopping',
          name: 'Shopping',
          type: 'expense',
          color: '#8b5cf6',
          icon: 'shopping-bag',
          isDefault: true,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'cat-entertainment',
          name: 'Entertainment',
          type: 'expense',
          color: '#06b6d4',
          icon: 'film',
          isDefault: true,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'cat-salary',
          name: 'Salary',
          type: 'income',
          color: '#10b981',
          icon: 'briefcase',
          isDefault: true,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'cat-freelance',
          name: 'Freelance',
          type: 'income',
          color: '#84cc16',
          icon: 'laptop',
          isDefault: true,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'cat-investment',
          name: 'Investment',
          type: 'both',
          color: '#3b82f6',
          icon: 'trending-up',
          isDefault: true,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);
    }
  };
}

export const db = new CashLiteDB();
