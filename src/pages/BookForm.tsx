import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, BookOpen } from 'lucide-react';
import { useStore } from '../store';
import { BookService, SegmentService } from '../lib/services';
import { Book, Segment } from '../types';
import toast from 'react-hot-toast';

const bookService = new BookService();
const segmentService = new SegmentService();

export const BookForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { segments, setSegments, addBook, updateBook } = useStore();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    segmentId: '',
    currency: 'BDT',
    color: '#3B82F6',
    icon: 'book'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load segments
        const segmentsData = await segmentService.getAll();
        setSegments(segmentsData);
        
        // Load book if editing
        if (id) {
          const book = await bookService.getById(id);
          if (book) {
            setFormData({
              name: book.name,
              description: book.description || '',
              segmentId: book.segmentId || '',
              currency: book.currency,
              color: book.color,
              icon: book.icon
            });
          } else {
            toast.error('Book not found');
            navigate('/books');
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, navigate, setSegments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Book name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const bookData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        segmentId: formData.segmentId || undefined,
        currency: formData.currency,
        color: formData.color,
        icon: formData.icon,
        isActive: true
      };

      if (id) {
        await bookService.update(id, bookData);
        updateBook(id, bookData);
        toast.success('Book updated successfully');
      } else {
        const newBook = await bookService.create(bookData);
        addBook(newBook);
        toast.success('Book created successfully');
      }

      navigate('/books');
    } catch (error) {
      console.error('Error saving book:', error);
      toast.error('Failed to save book');
    } finally {
      setIsSubmitting(false);
    }
  };

  const colorOptions = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
    '#F97316', '#6B7280', '#1F2937', '#7C3AED'
  ];

  const currencyOptions = [
    'BDT', 'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'BRL'
  ];

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-2 text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/books')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Books
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {id ? 'Edit Book' : 'Create New Book'}
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Book Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter book name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {currencyOptions.map(currency => (
                  <option key={currency} value={currency}>{currency}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
              placeholder="Optional description..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Segment
            </label>
            <select
              value={formData.segmentId}
              onChange={(e) => setFormData({ ...formData, segmentId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">No segment</option>
              {segments.map(segment => (
                <option key={segment.id} value={segment.id}>{segment.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${
                    formData.color === color ? 'border-gray-900' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                >
                  {formData.color === color && (
                    <BookOpen className="h-5 w-5 text-white" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/books')}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Saving...' : 'Save Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
