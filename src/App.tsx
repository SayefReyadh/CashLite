import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useStore } from './store';
import { BookService, SegmentService, TransactionService, CategoryService } from './lib/services';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Books } from './pages/Books';
import { 
  TransactionList, 
  TransactionForm, 
  BookForm, 
  Segments, 
  SegmentForm, 
  Categories, 
  CategoryForm, 
  Import, 
  Export, 
  Settings 
} from './pages/index';

const bookService = new BookService();
const segmentService = new SegmentService();
const transactionService = new TransactionService();
const categoryService = new CategoryService();

function App() {
  const {
    setBooks,
    setSegments,
    setTransactions,
    setCategories,
    setCurrentBook,
    currentBook,
    setLoading,
    setError
  } = useStore();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load all data
        const [books, segments, transactions, categories] = await Promise.all([
          bookService.getAll(),
          segmentService.getAll(),
          transactionService.getAll(),
          categoryService.getAll()
        ]);

        setBooks(books);
        setSegments(segments);
        setTransactions(transactions);
        setCategories(categories);

        // Set current book if none selected
        if (!currentBook && books.length > 0) {
          setCurrentBook(books[0]);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/transactions" element={<TransactionList />} />
            <Route path="/transactions/new" element={<TransactionForm />} />
            <Route path="/transactions/:id/edit" element={<TransactionForm />} />
            <Route path="/books" element={<Books />} />
            <Route path="/books/new" element={<BookForm />} />
            <Route path="/books/:id/edit" element={<BookForm />} />
            <Route path="/segments" element={<Segments />} />
            <Route path="/segments/new" element={<SegmentForm />} />
            <Route path="/segments/:id/edit" element={<SegmentForm />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/categories/new" element={<CategoryForm />} />
            <Route path="/categories/:id/edit" element={<CategoryForm />} />
            <Route path="/import" element={<Import />} />
            <Route path="/export" element={<Export />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;
