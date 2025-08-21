import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, BookOpen } from 'lucide-react';
import { useStore } from '../store';
import { BookService } from '../lib/services';
import { formatCurrency, formatDate } from '../lib/utils';

const bookService = new BookService();

export const Books: React.FC = () => {
  const { books, setBooks, removeBook, currentBook, setCurrentBook } =
    useStore();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (bookId: string) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this book? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      setIsDeleting(bookId);
      await bookService.delete(bookId);
      removeBook(bookId);

      // If we deleted the current book, set a new one
      if (currentBook?.id === bookId) {
        const remainingBooks = books.filter(b => b.id !== bookId);
        setCurrentBook(remainingBooks.length > 0 ? remainingBooks[0] : null);
      }
    } catch (error) {
      console.error('Error deleting book:', error);
      alert('Failed to delete book. Please try again.');
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Books</h1>
        <Link to="/books/new" className="btn btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          New Book
        </Link>
      </div>

      {books.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No books yet
          </h3>
          <p className="text-gray-500 mb-6">
            Create your first book to start tracking your finances
          </p>
          <Link to="/books/new" className="btn btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Create Book
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map(book => (
            <div
              key={book.id}
              className={`card p-6 ${
                currentBook?.id === book.id ? 'ring-2 ring-primary' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: book.color }}
                  />
                  <div>
                    <h3 className="font-medium text-gray-900">{book.name}</h3>
                    {book.description && (
                      <p className="text-sm text-gray-500">
                        {book.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Link
                    to={`/books/${book.id}/edit`}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(book.id)}
                    disabled={isDeleting === book.id}
                    className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Balance:</span>
                  <span
                    className={`font-medium ${
                      book.balance >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {formatCurrency(book.balance, book.currency)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Currency:</span>
                  <span className="text-gray-900">{book.currency}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Created:</span>
                  <span className="text-gray-900">
                    {formatDate(book.createdAt)}
                  </span>
                </div>
              </div>

              {currentBook?.id === book.id && (
                <div className="mt-4 flex items-center justify-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-white">
                    Current Book
                  </span>
                </div>
              )}

              {currentBook?.id !== book.id && (
                <div className="mt-4">
                  <button
                    onClick={() => setCurrentBook(book)}
                    className="w-full btn btn-secondary btn-sm"
                  >
                    Select Book
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
