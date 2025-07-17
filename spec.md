# � CashLite - Technical Specification

## 🎯 Project Overview

**CashLite** is a lightweight, offline-first Progressive Web App (PWA) for personal finance tracking. Built with React, TypeScript, and Vite, it provides a simple yet powerful interface for managing multiple cashbooks with advanced filtering and search capabilities.

### 🔑 Key Principles
- **Offline-first**: Full functionality without internet connection
- **Privacy-focused**: All data stored locally on user's device
- **Lightweight**: Fast loading and minimal resource usage
- **Cross-platform**: Works on mobile, desktop, and web
- **No-signup**: Instant access without registration

---

## 🏗️ System Architecture

### Frontend Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                         React App                           │
├─────────────────────────────────────────────────────────────┤
│  Pages  │  Components  │  Hooks  │  Store  │  Utils  │ Types │
├─────────────────────────────────────────────────────────────┤
│                    React Router                             │
├─────────────────────────────────────────────────────────────┤
│           Zustand State Management                          │
├─────────────────────────────────────────────────────────────┤
│                  IndexedDB (Dexie.js)                       │
├─────────────────────────────────────────────────────────────┤
│              Service Worker (PWA)                           │
└─────────────────────────────────────────────────────────────┘
```

### PWA Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    Browser / App Shell                      │
├─────────────────────────────────────────────────────────────┤
│                   Service Worker                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Caching   │  │ Background  │  │   Update Manager    │  │
│  │  Strategy   │  │    Sync     │  │                     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                   IndexedDB Storage                         │
└─────────────────────────────────────────────────────────────┘
```

### Tech Stack
- **Framework**: React 18 with Vite
- **Language**: TypeScript
- **PWA**: Vite PWA Plugin
- **Routing**: React Router 6
- **State Management**: Zustand
- **Database**: IndexedDB (via Dexie.js)
- **UI Components**: Shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Testing**: Vitest + React Testing Library

### Architecture Pattern
- **Component-based architecture**
- **Unidirectional data flow**
- **Local-first data storage**
- **PWA-first design**

---

## �️ Database Schema (IndexedDB)

### Tables Structure

#### 1. Books Table
```typescript
interface Book {
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
  balance: number; // Calculated field
}
```

#### 2. Segments Table
```typescript
interface Segment {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  totalBalance: number; // Calculated field
}
```

#### 3. Transactions Table
```typescript
interface Transaction {
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
  originalTransactionId?: string; // For duplicated transactions
  isReversed: boolean; // For reversed transactions
}
```

#### 4. Categories Table
```typescript
interface Category {
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
```

#### 5. Settings Table
```typescript
interface Settings {
  id: string;
  key: string;
  value: any;
  updatedAt: Date;
}
```

#### 6. Import/Export Types
```typescript
interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  errors: string[];
  transactions: Transaction[];
}

interface ExportOptions {
  dateFrom?: Date;
  dateTo?: Date;
  format?: 'csv' | 'json';
  includeBalance?: boolean;
}

interface CSVRow {
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
```

### Database Operations

#### Dexie.js Setup
```typescript
// lib/db/database.ts
import Dexie, { Table } from 'dexie';

export class CashLiteDB extends Dexie {
  books!: Table<Book>;
  segments!: Table<Segment>;
  transactions!: Table<Transaction>;
  categories!: Table<Category>;
  settings!: Table<Settings>;

  constructor() {
    super('CashLiteDB');
    this.version(1).stores({
      books: '++id, name, segmentId, isActive, createdAt',
      segments: '++id, name, isActive, createdAt',
      transactions: '++id, bookId, type, amount, date, createdAt, categoryId',
      categories: '++id, name, type, isActive',
      settings: '++id, key'
    });
  }
}

export const db = new CashLiteDB();
```

---

## 🔧 Core Features Specification

### 1. Multi-Book Management

#### Book Creation
```typescript
// Create new book
const createBook = async (bookData: Partial<Book>) => {
  const book: Book = {
    id: generateId(),
    name: bookData.name!,
    description: bookData.description,
    segmentId: bookData.segmentId,
    currency: bookData.currency || 'BDT',
    color: bookData.color || '#3b82f6',
    icon: bookData.icon || 'wallet',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    balance: 0
  };
  
  await db.books.add(book);
  return book;
};
```

#### Book Segments
```typescript
// Group books into segments
const createSegment = async (segmentData: Partial<Segment>) => {
  const segment: Segment = {
    id: generateId(),
    name: segmentData.name!,
    description: segmentData.description,
    color: segmentData.color || '#6b7280',
    icon: segmentData.icon || 'folder',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    totalBalance: 0
  };
  
  await db.segments.add(segment);
  return segment;
};
```

### 2. Transaction Management

#### Transaction Operations
```typescript
// Add transaction
const addTransaction = async (transactionData: Partial<Transaction>) => {
  const transaction: Transaction = {
    id: generateId(),
    bookId: transactionData.bookId!,
    type: transactionData.type!,
    amount: transactionData.amount!,
    description: transactionData.description!,
    notes: transactionData.notes,
    categoryId: transactionData.categoryId,
    date: transactionData.date || new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    isRecurring: false,
    tags: transactionData.tags || [],
    isReversed: false
  };
  
  await db.transactions.add(transaction);
  await updateBookBalance(transaction.bookId);
  return transaction;
};

// Duplicate transaction to another book
const duplicateTransaction = async (transactionId: string, targetBookId: string) => {
  const original = await db.transactions.get(transactionId);
  if (!original) throw new Error('Transaction not found');
  
  const duplicate: Transaction = {
    ...original,
    id: generateId(),
    bookId: targetBookId,
    originalTransactionId: transactionId,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  await db.transactions.add(duplicate);
  await updateBookBalance(targetBookId);
  return duplicate;
};

// Reverse transaction (income <-> expense)
const reverseTransaction = async (transactionId: string, targetBookId: string) => {
  const original = await db.transactions.get(transactionId);
  if (!original) throw new Error('Transaction not found');
  
  const reversed: Transaction = {
    ...original,
    id: generateId(),
    bookId: targetBookId,
    type: original.type === 'income' ? 'expense' : 'income',
    originalTransactionId: transactionId,
    isReversed: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  await db.transactions.add(reversed);
  await updateBookBalance(targetBookId);
  return reversed;
};
```

### 4. Data Import/Export System

#### CSV Import Implementation
```typescript
// lib/import/csv-parser.ts
interface CSVRow {
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

interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  errors: string[];
  transactions: Transaction[];
}

export class CSVImporter {
  private bookId: string;
  
  constructor(bookId: string) {
    this.bookId = bookId;
  }
  
  async importFromCSV(csvContent: string): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      imported: 0,
      skipped: 0,
      errors: [],
      transactions: []
    };
    
    try {
      const rows = this.parseCSV(csvContent);
      
      for (const [index, row] of rows.entries()) {
        try {
          const transaction = await this.convertRowToTransaction(row);
          if (transaction) {
            await db.transactions.add(transaction);
            result.transactions.push(transaction);
            result.imported++;
          } else {
            result.skipped++;
          }
        } catch (error) {
          result.errors.push(`Row ${index + 1}: ${error.message}`);
          result.skipped++;
        }
      }
      
      // Update book balance after import
      await this.updateBookBalance();
      
      result.success = result.errors.length === 0;
      return result;
      
    } catch (error) {
      result.errors.push(`Import failed: ${error.message}`);
      return result;
    }
  }
  
  private parseCSV(csvContent: string): CSVRow[] {
    const lines = csvContent.trim().split('\n');
    const headers = this.parseCSVRow(lines[0]);
    const rows: CSVRow[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVRow(lines[i]);
      const row: any = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      rows.push(row as CSVRow);
    }
    
    return rows;
  }
  
  private parseCSVRow(row: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      
      if (char === '"' && !inQuotes) {
        inQuotes = true;
      } else if (char === '"' && inQuotes) {
        inQuotes = false;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }
  
  private async convertRowToTransaction(row: CSVRow): Promise<Transaction | null> {
    // Skip empty rows
    if (!row.Date || (!row['Cash In'] && !row['Cash Out'])) {
      return null;
    }
    
    // Parse date and time
    const dateTime = this.parseDateTime(row.Date, row.Time);
    
    // Determine transaction type and amount
    const cashIn = this.parseAmount(row['Cash In']);
    const cashOut = this.parseAmount(row['Cash Out']);
    
    let type: 'income' | 'expense';
    let amount: number;
    
    if (cashIn > 0) {
      type = 'income';
      amount = cashIn;
    } else if (cashOut > 0) {
      type = 'expense';
      amount = cashOut;
    } else {
      return null; // Skip if no valid amount
    }
    
    // Create transaction
    const transaction: Transaction = {
      id: generateId(),
      bookId: this.bookId,
      type,
      amount,
      description: row.Remark || 'Imported transaction',
      notes: this.buildNotes(row),
      categoryId: await this.findOrCreateCategory(row.Category, type),
      date: dateTime,
      createdAt: new Date(),
      updatedAt: new Date(),
      isRecurring: false,
      tags: this.extractTags(row),
      isReversed: false
    };
    
    return transaction;
  }
  
  private parseDateTime(dateStr: string, timeStr: string): Date {
    // Parse "26 Mar 2025" and "11:06 AM" format
    const dateParts = dateStr.split(' ');
    const day = parseInt(dateParts[0]);
    const month = this.parseMonth(dateParts[1]);
    const year = parseInt(dateParts[2]);
    
    const timeParts = timeStr.split(':');
    let hours = parseInt(timeParts[0]);
    const minutes = parseInt(timeParts[1].split(' ')[0]);
    const ampm = timeParts[1].split(' ')[1];
    
    if (ampm === 'PM' && hours !== 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    
    return new Date(year, month, day, hours, minutes);
  }
  
  private parseMonth(monthStr: string): number {
    const months = {
      'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
      'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };
    return months[monthStr] || 0;
  }
  
  private parseAmount(amountStr: string): number {
    if (!amountStr) return 0;
    return parseFloat(amountStr.replace(/[^\d.-]/g, '')) || 0;
  }
  
  private buildNotes(row: CSVRow): string {
    const notes: string[] = [];
    
    if (row.Party) notes.push(`Party: ${row.Party}`);
    if (row.Mode) notes.push(`Mode: ${row.Mode}`);
    if (row.Balance) notes.push(`Balance: ${row.Balance}`);
    
    return notes.join('\n');
  }
  
  private async findOrCreateCategory(categoryName: string, type: 'income' | 'expense'): Promise<string> {
    if (!categoryName) return null;
    
    // Try to find existing category
    const existing = await db.categories
      .where('name')
      .equalsIgnoreCase(categoryName)
      .and(cat => cat.type === type || cat.type === 'both')
      .first();
    
    if (existing) return existing.id;
    
    // Create new category
    const newCategory: Category = {
      id: generateId(),
      name: categoryName,
      type,
      color: this.getDefaultCategoryColor(type),
      icon: this.getDefaultCategoryIcon(categoryName),
      isDefault: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await db.categories.add(newCategory);
    return newCategory.id;
  }
  
  private extractTags(row: CSVRow): string[] {
    const tags: string[] = [];
    
    // Extract tags from description
    if (row.Remark) {
      const words = row.Remark.toLowerCase().split(/\s+/);
      if (words.includes('recharge')) tags.push('recharge');
      if (words.includes('bill')) tags.push('bill');
      if (words.includes('payment')) tags.push('payment');
      if (words.includes('cashback')) tags.push('cashback');
    }
    
    return tags;
  }
  
  private getDefaultCategoryColor(type: 'income' | 'expense'): string {
    return type === 'income' ? '#059669' : '#dc2626';
  }
  
  private getDefaultCategoryIcon(categoryName: string): string {
    const name = categoryName.toLowerCase();
    
    if (name.includes('food') || name.includes('meena')) return 'utensils';
    if (name.includes('transport')) return 'car';
    if (name.includes('recharge')) return 'smartphone';
    if (name.includes('bill')) return 'receipt';
    if (name.includes('cashback')) return 'gift';
    if (name.includes('salary')) return 'briefcase';
    
    return 'circle';
  }
  
  private async updateBookBalance(): Promise<void> {
    const transactions = await db.transactions.where('bookId').equals(this.bookId).toArray();
    
    const balance = transactions.reduce((sum, transaction) => {
      return sum + (transaction.type === 'income' ? transaction.amount : -transaction.amount);
    }, 0);
    
    await db.books.update(this.bookId, { balance });
  }
}
```

#### CSV Export Implementation
```typescript
// lib/export/csv-exporter.ts
export class CSVExporter {
  async exportToCSV(bookId: string, options?: {
    dateFrom?: Date;
    dateTo?: Date;
    includeBalance?: boolean;
  }): Promise<string> {
    const transactions = await this.getTransactions(bookId, options);
    
    const headers = [
      'Date',
      'Time',
      'Remark',
      'Party',
      'Category',
      'Mode',
      'Cash In',
      'Cash Out',
      'Balance'
    ];
    
    let csvContent = headers.map(h => `"${h}"`).join(',') + '\n';
    let runningBalance = 0;
    
    // Sort transactions by date
    transactions.sort((a, b) => a.date.getTime() - b.date.getTime());
    
    for (const transaction of transactions) {
      const row = await this.formatTransactionRow(transaction, runningBalance);
      csvContent += row + '\n';
      
      // Update running balance
      runningBalance += transaction.type === 'income' ? transaction.amount : -transaction.amount;
    }
    
    return csvContent;
  }
  
  private async getTransactions(bookId: string, options?: {
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<Transaction[]> {
    let query = db.transactions.where('bookId').equals(bookId);
    
    if (options?.dateFrom) {
      query = query.and(t => t.date >= options.dateFrom);
    }
    
    if (options?.dateTo) {
      query = query.and(t => t.date <= options.dateTo);
    }
    
    return await query.toArray();
  }
  
  private async formatTransactionRow(transaction: Transaction, currentBalance: number): Promise<string> {
    const category = await db.categories.get(transaction.categoryId);
    
    const date = transaction.date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    
    const time = transaction.date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    const cashIn = transaction.type === 'income' ? transaction.amount.toString() : '';
    const cashOut = transaction.type === 'expense' ? transaction.amount.toString() : '';
    
    const newBalance = currentBalance + (transaction.type === 'income' ? transaction.amount : -transaction.amount);
    
    const row = [
      date,
      time,
      transaction.description,
      '', // Party - not in our current schema
      category?.name || '',
      'Cash', // Mode - default to Cash
      cashIn,
      cashOut,
      newBalance.toString()
    ];
    
    return row.map(field => `"${field}"`).join(',');
  }
}
```

#### Import UI Component
```typescript
// components/ImportDialog.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, CheckCircle, XCircle } from 'lucide-react';

interface ImportDialogProps {
  bookId: string;
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (result: ImportResult) => void;
}

export const ImportDialog: React.FC<ImportDialogProps> = ({
  bookId,
  isOpen,
  onClose,
  onImportComplete
}) => {
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
      setImportResult(null);
    }
  };
  
  const handleImport = async () => {
    if (!selectedFile) return;
    
    setIsImporting(true);
    
    try {
      const csvContent = await selectedFile.text();
      const importer = new CSVImporter(bookId);
      const result = await importer.importFromCSV(csvContent);
      
      setImportResult(result);
      onImportComplete(result);
    } catch (error) {
      setImportResult({
        success: false,
        imported: 0,
        skipped: 0,
        errors: [error.message],
        transactions: []
      });
    } finally {
      setIsImporting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import CSV Data</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {!importResult && (
            <>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label htmlFor="csv-upload" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Select CSV file to import
                    </span>
                    <input
                      id="csv-upload"
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </label>
                </div>
              </div>
              
              {selectedFile && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Selected: {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    Size: {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              )}
              
              <Alert>
                <AlertDescription>
                  Supported format: Date, Time, Remark, Party, Category, Mode, Cash In, Cash Out, Balance
                </AlertDescription>
              </Alert>
            </>
          )}
          
          {isImporting && (
            <div className="space-y-2">
              <Progress value={50} />
              <p className="text-sm text-gray-600">Importing transactions...</p>
            </div>
          )}
          
          {importResult && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {importResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span className="font-medium">
                  {importResult.success ? 'Import completed' : 'Import completed with errors'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Imported:</span>
                  <span className="ml-2 font-medium text-green-600">{importResult.imported}</span>
                </div>
                <div>
                  <span className="text-gray-600">Skipped:</span>
                  <span className="ml-2 font-medium text-yellow-600">{importResult.skipped}</span>
                </div>
              </div>
              
              {importResult.errors.length > 0 && (
                <Alert>
                  <AlertDescription>
                    <div className="font-medium">Errors:</div>
                    <ul className="mt-1 text-sm list-disc list-inside">
                      {importResult.errors.slice(0, 5).map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                      {importResult.errors.length > 5 && (
                        <li>... and {importResult.errors.length - 5} more</li>
                      )}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              {importResult ? 'Close' : 'Cancel'}
            </Button>
            {!importResult && (
              <Button 
                onClick={handleImport} 
                disabled={!selectedFile || isImporting}
              >
                {isImporting ? 'Importing...' : 'Import'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
```
```typescript
interface FilterOptions {
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

const filterTransactions = async (filters: FilterOptions) => {
  let query = db.transactions.orderBy('date').reverse();
  
  // Apply filters
  if (filters.bookIds?.length) {
    query = query.filter(t => filters.bookIds!.includes(t.bookId));
  }
  
  if (filters.type) {
    query = query.filter(t => t.type === filters.type);
  }
  
  if (filters.dateFrom) {
    query = query.filter(t => t.date >= filters.dateFrom!);
  }
  
  if (filters.dateTo) {
    query = query.filter(t => t.date <= filters.dateTo!);
  }
  
  if (filters.amountMin !== undefined) {
    query = query.filter(t => t.amount >= filters.amountMin!);
  }
  
  if (filters.amountMax !== undefined) {
    query = query.filter(t => t.amount <= filters.amountMax!);
  }
  
  if (filters.searchText) {
    const searchLower = filters.searchText.toLowerCase();
    query = query.filter(t => 
      t.description.toLowerCase().includes(searchLower) ||
      t.notes?.toLowerCase().includes(searchLower)
    );
  }
  
  return await query.toArray();
};
```

#### Search Implementation
```typescript
const searchTransactions = async (query: string, options?: {
  bookIds?: string[];
  limit?: number;
}) => {
  const searchLower = query.toLowerCase();
  
  let dbQuery = db.transactions
    .orderBy('date')
    .reverse();
  
  if (options?.bookIds?.length) {
    dbQuery = dbQuery.filter(t => options.bookIds!.includes(t.bookId));
  }
  
  const results = await dbQuery
    .filter(t => 
      t.description.toLowerCase().includes(searchLower) ||
      t.notes?.toLowerCase().includes(searchLower) ||
      t.tags.some(tag => tag.toLowerCase().includes(searchLower))
    )
    .limit(options?.limit || 50)
    .toArray();
  
  return results;
};
```

---

## 🎨 UI/UX Specifications

### Design System

#### Color Palette
```typescript
// Primary Colors
const colors = {
  primary: {
    50: '#f0f9ff',
    500: '#3b82f6',
    600: '#2563eb',
    900: '#1e3a8a'
  },
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  income: '#059669',
  expense: '#dc2626'
};
```

#### Typography
```typescript
// Font System
const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'monospace']
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem'
  }
};
```

#### Component Library
- **Base**: Shadcn/ui + Radix UI
- **Icons**: Lucide React
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion (if needed)

### Responsive Design

#### Breakpoints
```typescript
const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};
```

#### Layout Strategy
- **Mobile First**: Optimized for mobile usage
- **Progressive Enhancement**: Enhanced features for larger screens
- **Touch-friendly**: Minimum 44px touch targets
- **Keyboard Navigation**: Full keyboard accessibility

### Page Specifications

#### Dashboard Page
- **Header**: App logo, total balance, filter button
- **Segments**: Horizontal scrollable segment cards
- **Books**: Grid layout of book cards with summary
- **FAB**: Floating action button for quick transaction

#### Book Detail Page
- **Header**: Book name, balance, period selector
- **Summary**: Income/expense cards for selected period
- **Transactions**: Virtual scrolling list with infinite loading
- **Actions**: Add transaction, filter, search

#### Transaction Form Page
- **Type Toggle**: Income/Expense toggle
- **Amount Input**: Numeric input with decimal support
- **Description**: Text input with autocomplete suggestions
- **Category**: Select dropdown with custom category option
- **Date**: Date picker with today as default
- **Notes**: Optional textarea

#### Settings Page
- **Books Management**: CRUD operations for books
- **Segments Management**: CRUD operations for segments
- **Categories**: Manage transaction categories
- **Appearance**: Theme selection (light/dark/system)
- **Data**: Export, import, backup options

### Navigation Structure

#### Router Setup
```typescript
// src/router/index.tsx
import { createBrowserRouter } from 'react-router-dom';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'books', element: <Books /> },
      { path: 'books/:id', element: <BookDetail /> },
      { path: 'transactions/new', element: <TransactionForm /> },
      { path: 'transactions/:id/edit', element: <TransactionForm /> },
      { path: 'analytics', element: <Analytics /> },
      { path: 'settings', element: <Settings /> }
    ]
  }
]);
```

---

## 🔄 PWA Features

### Service Worker Configuration
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'CashLite - Finance Tracker',
        short_name: 'CashLite',
        description: 'Lightweight finance tracker PWA',
        theme_color: '#3b82f6',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          }
        ]
      }
    })
  ]
});
```

### Offline Support
```typescript
// lib/offline-manager.ts
class OfflineManager {
  private isOnline = navigator.onLine;
  private eventListeners: ((online: boolean) => void)[] = [];
  
  constructor() {
    window.addEventListener('online', () => this.setOnlineStatus(true));
    window.addEventListener('offline', () => this.setOnlineStatus(false));
  }
  
  private setOnlineStatus(online: boolean) {
    this.isOnline = online;
    this.eventListeners.forEach(listener => listener(online));
  }
  
  public getOnlineStatus(): boolean {
    return this.isOnline;
  }
  
  public onStatusChange(callback: (online: boolean) => void) {
    this.eventListeners.push(callback);
  }
}

export const offlineManager = new OfflineManager();
```

### Installation Prompt
```typescript
// hooks/useInstallPrompt.ts
import { useState, useEffect } from 'react';

export const useInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    
    setDeferredPrompt(null);
  };

  return { isInstallable, installApp };
};
```

---

## 🔄 Data Flow & State Management

### State Structure

#### Global State (Zustand)
```typescript
interface AppState {
  // Books & Segments
  books: Book[];
  segments: Segment[];
  selectedBook: Book | null;
  
  // Transactions
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  filters: FilterState;
  
  // Categories
  categories: Category[];
  
  // UI State
  theme: 'light' | 'dark' | 'system';
  isLoading: boolean;
  isOffline: boolean;
  
  // Actions
  addBook: (book: Partial<Book>) => Promise<Book>;
  updateBook: (id: string, updates: Partial<Book>) => Promise<void>;
  deleteBook: (id: string) => Promise<void>;
  
  addTransaction: (transaction: Partial<Transaction>) => Promise<Transaction>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  duplicateTransaction: (id: string, targetBookId: string) => Promise<Transaction>;
  reverseTransaction: (id: string, targetBookId: string) => Promise<Transaction>;
  
  setFilters: (filters: FilterState) => void;
  applyFilters: () => void;
  setSelectedBook: (book: Book | null) => void;
  
  // Data management
  exportData: () => Promise<string>;
  importData: (data: string) => Promise<void>;
  importCSV: (bookId: string, csvContent: string) => Promise<ImportResult>;
  exportCSV: (bookId: string, options?: ExportOptions) => Promise<string>;
  clearAllData: () => Promise<void>;
}
```

#### Local State Management
- **Form State**: React Hook Form for complex forms
- **UI State**: useState for component-specific state
- **Cache**: React Query for API-like data fetching (if needed)

### Data Persistence

#### IndexedDB Operations
```typescript
// lib/db/operations.ts
export class DatabaseOperations {
  private db = new CashLiteDB();
  
  // Books
  async createBook(book: Partial<Book>): Promise<Book> {
    const newBook = { ...book, id: generateId(), createdAt: new Date(), updatedAt: new Date() };
    await this.db.books.add(newBook as Book);
    return newBook as Book;
  }
  
  async getBooks(): Promise<Book[]> {
    return await this.db.books.where('isActive').equals(true).toArray();
  }
  
  async updateBook(id: string, updates: Partial<Book>): Promise<void> {
    await this.db.books.update(id, { ...updates, updatedAt: new Date() });
  }
  
  async deleteBook(id: string): Promise<void> {
    await this.db.transaction('rw', this.db.books, this.db.transactions, async () => {
      await this.db.books.delete(id);
      await this.db.transactions.where('bookId').equals(id).delete();
    });
  }
  
  // Transactions
  async createTransaction(transaction: Partial<Transaction>): Promise<Transaction> {
    const newTransaction = { 
      ...transaction, 
      id: generateId(), 
      createdAt: new Date(), 
      updatedAt: new Date() 
    };
    await this.db.transactions.add(newTransaction as Transaction);
    return newTransaction as Transaction;
  }
  
  async getTransactions(bookId?: string): Promise<Transaction[]> {
    if (bookId) {
      return await this.db.transactions.where('bookId').equals(bookId).reverse().sortBy('date');
    }
    return await this.db.transactions.orderBy('date').reverse().toArray();
  }
  
  // Search and Filter
  async searchTransactions(query: string, options?: FilterOptions): Promise<Transaction[]> {
    let collection = this.db.transactions.orderBy('date').reverse();
    
    if (options?.bookIds?.length) {
      collection = collection.filter(t => options.bookIds!.includes(t.bookId));
    }
    
    const results = await collection.filter(t => 
      t.description.toLowerCase().includes(query.toLowerCase()) ||
      t.notes?.toLowerCase().includes(query.toLowerCase())
    ).toArray();
    
    return results;
  }
}
```

---

## 🚀 Performance Specifications

### Performance Targets
- **Initial Load**: < 3 seconds on 3G
- **Time to Interactive**: < 5 seconds
- **Bundle Size**: < 500KB (gzipped)
- **Database Operations**: < 100ms for basic CRUD
- **Search Response**: < 200ms for up to 10k transactions

### Optimization Strategies

#### Code Splitting
```typescript
// Router with lazy loading
import { lazy } from 'react';

const Dashboard = lazy(() => import('../pages/Dashboard'));
const Books = lazy(() => import('../pages/Books'));
const Analytics = lazy(() => import('../pages/Analytics'));
const Settings = lazy(() => import('../pages/Settings'));
```

#### Virtual Scrolling
```typescript
// For large transaction lists
import { FixedSizeList as List } from 'react-window';

const TransactionList = ({ transactions }: { transactions: Transaction[] }) => {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <TransactionItem transaction={transactions[index]} />
    </div>
  );

  return (
    <List
      height={600}
      itemCount={transactions.length}
      itemSize={80}
      width="100%"
    >
      {Row}
    </List>
  );
};
```

#### Bundle Optimization
```typescript
// vite.config.ts optimization
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          utils: ['date-fns', 'clsx', 'tailwind-merge']
        }
      }
    }
  }
});
```

### Database Performance
- **Indexing**: Proper IndexedDB indexes for common queries
- **Pagination**: Implement cursor-based pagination
- **Caching**: In-memory caching for frequently accessed data
- **Debouncing**: Debounced search to prevent excessive queries

---

## �️ Security & Privacy

### Data Security
- **Local Storage Only**: No data transmitted to servers
- **Encryption**: Optional local encryption for sensitive data
- **Secure Defaults**: Safe configuration out of the box
- **Data Validation**: Input sanitization and validation

### Privacy Features
- **No Tracking**: No analytics or tracking scripts
- **No Registration**: No personal information required
- **Data Portability**: Export/import functionality
- **Data Deletion**: Clear data functionality

### Security Implementation
```typescript
// lib/security/encryption.ts
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

export class DataEncryption {
  private algorithm = 'aes-256-gcm';
  
  async encrypt(data: string, password: string): Promise<string> {
    const key = await this.deriveKey(password);
    const iv = randomBytes(16);
    const cipher = createCipheriv(this.algorithm, key, iv);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return JSON.stringify({
      iv: iv.toString('hex'),
      data: encrypted,
      tag: authTag.toString('hex')
    });
  }
  
  async decrypt(encryptedData: string, password: string): Promise<string> {
    const { iv, data, tag } = JSON.parse(encryptedData);
    const key = await this.deriveKey(password);
    
    const decipher = createDecipheriv(this.algorithm, key, Buffer.from(iv, 'hex'));
    decipher.setAuthTag(Buffer.from(tag, 'hex'));
    
    let decrypted = decipher.update(data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
  
  private async deriveKey(password: string): Promise<Buffer> {
    // Implement PBKDF2 or similar key derivation
    return Buffer.from(password.padEnd(32, '0').slice(0, 32));
  }
}
```

---

## 🧪 Testing Strategy

### Testing Pyramid
```
┌─────────────────────────────────────────────────────────────┐
│                        E2E Tests                            │
│                    (Playwright/Cypress)                     │
├─────────────────────────────────────────────────────────────┤
│                  Integration Tests                          │
│                (React Testing Library)                      │
├─────────────────────────────────────────────────────────────┤
│                     Unit Tests                              │
│                      (Vitest)                               │
└─────────────────────────────────────────────────────────────┘
```

### Test Coverage Targets
- **Unit Tests**: 80% coverage
- **Integration Tests**: Critical user flows
- **E2E Tests**: Main application workflows
- **PWA Tests**: Offline functionality, installation

### Testing Tools
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      threshold: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  }
});
```

### Test Examples
```typescript
// tests/components/TransactionForm.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { TransactionForm } from '../components/TransactionForm';

describe('TransactionForm', () => {
  test('should create income transaction', async () => {
    const mockOnSubmit = vi.fn();
    render(<TransactionForm onSubmit={mockOnSubmit} />);
    
    fireEvent.click(screen.getByText('Income'));
    fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Salary' } });
    fireEvent.click(screen.getByText('Save'));
    
    expect(mockOnSubmit).toHaveBeenCalledWith({
      type: 'income',
      amount: 100,
      description: 'Salary'
    });
  });
});
```

---

## 📱 Platform Considerations

### Mobile Optimization
- **Touch Gestures**: Swipe actions for common operations
- **Responsive Design**: Optimized for small screens
- **Performance**: Smooth scrolling and interactions
- **Battery**: Efficient resource usage

### Desktop Features
- **Keyboard Shortcuts**: Power user features
- **Multi-column Layout**: Utilize larger screens
- **Drag & Drop**: Enhanced interaction methods
- **Context Menus**: Right-click functionality

### Web Compatibility
- **Cross-browser**: Chrome, Firefox, Safari, Edge
- **Progressive Enhancement**: Graceful degradation
- **Accessibility**: WCAG 2.1 AA compliance
- **SEO**: Basic meta tags and structured data

---

## 🚢 Deployment Strategy

### Build Process
```bash
# Production build
npm run build

# Build outputs
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── vendor-[hash].js
├── manifest.json
├── sw.js
└── icons/
```

### Hosting Options
1. **Netlify** (Recommended)
   - Automatic deployments
   - Form handling
   - Edge functions

2. **Vercel**
   - Instant deployments
   - Global CDN
   - Analytics

3. **GitHub Pages**
   - Free hosting
   - Custom domains
   - CI/CD integration

### CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run build
      - run: npm run type-check
      - uses: netlify/actions/cli@master
        with:
          args: deploy --prod --dir=dist
```

---

## 🔮 Future Enhancements

### Phase 5: Advanced Analytics
- **Charts & Graphs**: Visual spending patterns
- **Budgeting**: Set and track budgets
- **Forecasting**: Predict future expenses
- **Reports**: Generate detailed financial reports

### Phase 6: Collaboration
- **Shared Books**: Multiple users per book
- **Real-time Sync**: Live updates across devices
- **Comments**: Add notes to transactions
- **Approval Workflows**: Multi-user approval process

### Phase 7: Integrations
- **Bank Import**: Connect to bank accounts
- **Receipt Scanning**: OCR for receipt processing
- **API**: Open API for third-party integrations
- **Webhooks**: Real-time event notifications

### Phase 8: Advanced Features
- **Machine Learning**: Automatic categorization
- **Voice Input**: Add transactions via voice
- **Geolocation**: Location-based expense tracking
- **Recurring Transactions**: Automated recurring entries

---

## 📊 Success Metrics

### Performance Metrics
- **Lighthouse Score**: > 90 across all categories
- **Core Web Vitals**: Green scores
- **Time to Interactive**: < 3 seconds
- **Bundle Size**: < 500KB

### User Experience Metrics
- **Task Completion Rate**: > 95%
- **Error Rate**: < 1%
- **User Satisfaction**: > 4.5/5
- **Retention Rate**: > 80% after 30 days

### Technical Metrics
- **Test Coverage**: > 80%
- **TypeScript Coverage**: 100%
- **Accessibility Score**: WCAG 2.1 AA
- **Security Score**: A+ rating

---

## 📚 Development Resources

### Documentation
- **README**: Project overview and setup
- **Component Docs**: Storybook documentation
- **API Docs**: TypeScript definitions
- **User Guide**: End-user documentation

### Development Tools
- **IDE**: VS Code with React extensions
- **Debugging**: React DevTools, Vite debugging
- **Design**: Figma for UI/UX design
- **Testing**: Vitest, React Testing Library

### External Resources
- **React Docs**: Official documentation
- **Vite Docs**: Build tool documentation
- **TypeScript**: Language documentation
- **PWA**: Progressive Web App guides

---

**This specification serves as the complete technical blueprint for the CashLite PWA development.**
