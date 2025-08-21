import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useStore } from './store';
import { BookService, SegmentService, TransactionService, CategoryService } from './lib/services';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Books } from './pages/Books';
import { BookForm } from './pages/BookForm';
import { BookDetail } from './pages/BookDetail';
import { Transactions } from './pages/Transactions';
import { TransactionFormPage } from './pages/TransactionFormPage';
import { Categories } from './pages/Categories';
import { Segments } from './pages/Segments';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';

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
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/transactions/new" element={<TransactionFormPage />} />
            <Route path="/transactions/:id/edit" element={<TransactionFormPage />} />
            <Route path="/books" element={<Books />} />
            <Route path="/books/new" element={<BookForm />} />
            <Route path="/books/:id" element={<BookDetail />} />
            <Route path="/books/:id/edit" element={<BookForm />} />
            <Route path="/segments" element={<Segments />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;
