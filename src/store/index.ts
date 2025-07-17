import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Book, Segment, Transaction, Category, FilterOptions } from '../types';

interface AppState {
  // Books
  books: Book[];
  currentBook: Book | null;
  
  // Segments
  segments: Segment[];
  currentSegment: Segment | null;
  
  // Transactions
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  transactionFilter: FilterOptions;
  
  // Categories
  categories: Category[];
  
  // UI State
  isLoading: boolean;
  error: string | null;
  sidebarOpen: boolean;
  
  // Actions
  setBooks: (books: Book[]) => void;
  setCurrentBook: (book: Book | null) => void;
  addBook: (book: Book) => void;
  updateBook: (id: string, updates: Partial<Book>) => void;
  removeBook: (id: string) => void;
  
  setSegments: (segments: Segment[]) => void;
  setCurrentSegment: (segment: Segment | null) => void;
  addSegment: (segment: Segment) => void;
  updateSegment: (id: string, updates: Partial<Segment>) => void;
  removeSegment: (id: string) => void;
  
  setTransactions: (transactions: Transaction[]) => void;
  setFilteredTransactions: (transactions: Transaction[]) => void;
  setTransactionFilter: (filter: FilterOptions) => void;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  removeTransaction: (id: string) => void;
  
  setCategories: (categories: Category[]) => void;
  addCategory: (category: Category) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  removeCategory: (id: string) => void;
  
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      books: [],
      currentBook: null,
      segments: [],
      currentSegment: null,
      transactions: [],
      filteredTransactions: [],
      transactionFilter: {},
      categories: [],
      isLoading: false,
      error: null,
      sidebarOpen: false,
      
      // Book actions
      setBooks: (books) => set({ books }),
      setCurrentBook: (book) => set({ currentBook: book }),
      addBook: (book) => set((state) => ({ books: [...state.books, book] })),
      updateBook: (id, updates) => set((state) => ({
        books: state.books.map(book => 
          book.id === id ? { ...book, ...updates } : book
        ),
        currentBook: state.currentBook?.id === id 
          ? { ...state.currentBook, ...updates }
          : state.currentBook
      })),
      removeBook: (id) => set((state) => ({
        books: state.books.filter(book => book.id !== id),
        currentBook: state.currentBook?.id === id ? null : state.currentBook
      })),
      
      // Segment actions
      setSegments: (segments) => set({ segments }),
      setCurrentSegment: (segment) => set({ currentSegment: segment }),
      addSegment: (segment) => set((state) => ({ segments: [...state.segments, segment] })),
      updateSegment: (id, updates) => set((state) => ({
        segments: state.segments.map(segment => 
          segment.id === id ? { ...segment, ...updates } : segment
        ),
        currentSegment: state.currentSegment?.id === id 
          ? { ...state.currentSegment, ...updates }
          : state.currentSegment
      })),
      removeSegment: (id) => set((state) => ({
        segments: state.segments.filter(segment => segment.id !== id),
        currentSegment: state.currentSegment?.id === id ? null : state.currentSegment
      })),
      
      // Transaction actions
      setTransactions: (transactions) => set({ transactions }),
      setFilteredTransactions: (filteredTransactions) => set({ filteredTransactions }),
      setTransactionFilter: (filter) => set({ transactionFilter: filter }),
      addTransaction: (transaction) => set((state) => ({
        transactions: [transaction, ...state.transactions]
      })),
      updateTransaction: (id, updates) => set((state) => ({
        transactions: state.transactions.map(transaction => 
          transaction.id === id ? { ...transaction, ...updates } : transaction
        )
      })),
      removeTransaction: (id) => set((state) => ({
        transactions: state.transactions.filter(transaction => transaction.id !== id)
      })),
      
      // Category actions
      setCategories: (categories) => set({ categories }),
      addCategory: (category) => set((state) => ({ categories: [...state.categories, category] })),
      updateCategory: (id, updates) => set((state) => ({
        categories: state.categories.map(category => 
          category.id === id ? { ...category, ...updates } : category
        )
      })),
      removeCategory: (id) => set((state) => ({
        categories: state.categories.filter(category => category.id !== id)
      })),
      
      // UI actions
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      setSidebarOpen: (open) => set({ sidebarOpen: open })
    }),
    {
      name: 'cashlite-store',
      partialize: (state) => ({
        currentBook: state.currentBook,
        currentSegment: state.currentSegment,
        transactionFilter: state.transactionFilter,
        sidebarOpen: state.sidebarOpen
      })
    }
  )
);
