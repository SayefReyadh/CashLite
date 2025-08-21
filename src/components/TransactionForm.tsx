import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Calendar,
  DollarSign,
  FileText,
  Tag,
  Hash
} from 'lucide-react';
import { useStore } from '../store';
import { TransactionService, CategoryService } from '../lib/services';
import { Transaction, Category } from '../types';
import toast from 'react-hot-toast';

interface TransactionFormProps {
  transaction?: Transaction;
  onClose: () => void;
  onSave: (transaction: Transaction) => void;
}

const transactionService = new TransactionService();
const categoryService = new CategoryService();

export const TransactionForm: React.FC<TransactionFormProps> = ({
  transaction,
  onClose,
  onSave
}) => {
  const { currentBook, categories, setCategories } = useStore();
  const [formData, setFormData] = useState({
    type: transaction?.type || ('expense' as 'income' | 'expense'),
    amount: transaction?.amount || 0,
    description: transaction?.description || '',
    notes: transaction?.notes || '',
    categoryId: transaction?.categoryId || '',
    date: transaction?.date
      ? transaction.date.toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    tags: transaction?.tags?.join(', ') || ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoading(true);
        const categoriesData = await categoryService.getAll();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error loading categories:', error);
        toast.error('Failed to load categories');
      } finally {
        setIsLoading(false);
      }
    };

    if (categories.length === 0) {
      loadCategories();
    }
  }, [categories.length, setCategories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentBook) {
      toast.error('Please select a book first');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Description is required');
      return;
    }

    if (formData.amount <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    try {
      setIsSubmitting(true);

      const transactionData = {
        bookId: currentBook.id,
        type: formData.type,
        amount: formData.amount,
        description: formData.description.trim(),
        notes: formData.notes.trim() || undefined,
        categoryId: formData.categoryId || undefined,
        date: new Date(formData.date),
        isRecurring: false,
        tags: formData.tags
          .split(',')
          .map(tag => tag.trim())
          .filter(Boolean),
        isReversed: false
      };

      let savedTransaction: Transaction;

      if (transaction) {
        await transactionService.update(transaction.id, transactionData);
        savedTransaction = {
          ...transaction,
          ...transactionData,
          updatedAt: new Date()
        };
        toast.success('Transaction updated successfully');
      } else {
        savedTransaction = await transactionService.create(transactionData);
        toast.success('Transaction created successfully');
      }

      onSave(savedTransaction);
      onClose();
    } catch (error) {
      console.error('Error saving transaction:', error);
      toast.error('Failed to save transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCategories = categories.filter(
    cat => cat.type === formData.type || cat.type === 'both'
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {transaction ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Type Selection */}
          <div>
            <label className="form-label">Type</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="income"
                  checked={formData.type === 'income'}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      type: e.target.value as 'income' | 'expense'
                    })
                  }
                  className="mr-2"
                />
                <span className="text-green-600">Income</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="expense"
                  checked={formData.type === 'expense'}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      type: e.target.value as 'income' | 'expense'
                    })
                  }
                  className="mr-2"
                />
                <span className="text-red-600">Expense</span>
              </label>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="form-label">
              <DollarSign className="h-4 w-4 inline mr-1" />
              Amount
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={e =>
                setFormData({
                  ...formData,
                  amount: parseFloat(e.target.value) || 0
                })
              }
              className="form-input"
              placeholder="0.00"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="form-label">
              <FileText className="h-4 w-4 inline mr-1" />
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={e =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="form-input"
              placeholder="Enter description..."
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="form-label">
              <Tag className="h-4 w-4 inline mr-1" />
              Category
            </label>
            <select
              value={formData.categoryId}
              onChange={e =>
                setFormData({ ...formData, categoryId: e.target.value })
              }
              className="form-input"
            >
              <option value="">Select category</option>
              {filteredCategories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="form-label">
              <Calendar className="h-4 w-4 inline mr-1" />
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
              className="form-input"
              required
            />
          </div>

          {/* Tags */}
          <div>
            <label className="form-label">
              <Hash className="h-4 w-4 inline mr-1" />
              Tags
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={e => setFormData({ ...formData, tags: e.target.value })}
              className="form-input"
              placeholder="tag1, tag2, tag3..."
            />
            <p className="text-sm text-gray-500 mt-1">
              Separate tags with commas
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="form-label">Notes</label>
            <textarea
              value={formData.notes}
              onChange={e =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="form-input"
              rows={3}
              placeholder="Additional notes..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
