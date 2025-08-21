import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Folder, BookOpen } from 'lucide-react';
import { useStore } from '../store';
import { SegmentService, BookService } from '../lib/services';
import { Segment } from '../types';
import { formatCurrency } from '../lib/utils';
import toast from 'react-hot-toast';

const segmentService = new SegmentService();
const bookService = new BookService();

interface SegmentFormProps {
  segment?: Segment;
  onClose: () => void;
  onSave: (segment: Segment) => void;
}

const SegmentForm: React.FC<SegmentFormProps> = ({
  segment,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({
    name: segment?.name || '',
    description: segment?.description || '',
    color: segment?.color || '#3B82F6',
    icon: segment?.icon || 'folder'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Segment name is required');
      return;
    }

    try {
      setIsSubmitting(true);

      const segmentData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        color: formData.color,
        icon: formData.icon,
        isActive: true
      };

      let savedSegment: Segment;

      if (segment) {
        await segmentService.update(segment.id, segmentData);
        savedSegment = { ...segment, ...segmentData, updatedAt: new Date() };
        toast.success('Segment updated successfully');
      } else {
        savedSegment = await segmentService.create(segmentData);
        toast.success('Segment created successfully');
      }

      onSave(savedSegment);
      onClose();
    } catch (error) {
      console.error('Error saving segment:', error);
      toast.error('Failed to save segment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const colorOptions = [
    '#3B82F6',
    '#EF4444',
    '#10B981',
    '#F59E0B',
    '#8B5CF6',
    '#EC4899',
    '#06B6D4',
    '#84CC16',
    '#F97316',
    '#6B7280',
    '#1F2937',
    '#7C3AED'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {segment ? 'Edit Segment' : 'Add Segment'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter segment name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={e =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
                placeholder="Optional description..."
              />
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
                    className={`w-8 h-8 rounded-full border-2 ${
                      formData.color === color
                        ? 'border-gray-900'
                        : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export const Segments: React.FC = () => {
  const { segments, setSegments, books } = useStore();
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSegment, setEditingSegment] = useState<Segment | undefined>();

  useEffect(() => {
    const loadSegments = async () => {
      try {
        setIsLoading(true);
        const segmentsData = await segmentService.getAll();
        setSegments(segmentsData);

        // Update balances for all segments
        for (const segment of segmentsData) {
          await segmentService.updateTotalBalance(segment.id);
        }

        // Reload segments with updated balances
        const updatedSegments = await segmentService.getAll();
        setSegments(updatedSegments);
      } catch (error) {
        console.error('Error loading segments:', error);
        toast.error('Failed to load segments');
      } finally {
        setIsLoading(false);
      }
    };

    loadSegments();
  }, [setSegments]);

  const handleDelete = async (segmentId: string) => {
    const segmentBooks = books.filter(book => book.segmentId === segmentId);

    if (segmentBooks.length > 0) {
      toast.error(
        'Cannot delete segment with books. Please move or delete books first.'
      );
      return;
    }

    if (!window.confirm('Are you sure you want to delete this segment?')) {
      return;
    }

    try {
      await segmentService.delete(segmentId);
      setSegments(segments.filter(s => s.id !== segmentId));
      toast.success('Segment deleted successfully');
    } catch (error) {
      console.error('Error deleting segment:', error);
      toast.error('Failed to delete segment');
    }
  };

  const handleEdit = (segment: Segment) => {
    setEditingSegment(segment);
    setShowForm(true);
  };

  const handleSave = (segment: Segment) => {
    if (editingSegment) {
      setSegments(segments.map(s => (s.id === segment.id ? segment : s)));
    } else {
      setSegments([...segments, segment]);
    }
    setEditingSegment(undefined);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingSegment(undefined);
  };

  const getSegmentBooks = (segmentId: string) => {
    return books.filter(book => book.segmentId === segmentId);
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-2 text-gray-500">Loading segments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Segments</h1>
        <button onClick={() => setShowForm(true)} className="btn btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Add Segment
        </button>
      </div>

      {segments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No segments found</p>
          <p className="text-gray-400 text-sm mb-6">
            Segments help you organize your books into groups
          </p>
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Add your first segment
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {segments.map(segment => {
            const segmentBooks = getSegmentBooks(segment.id);
            return (
              <div
                key={segment.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: segment.color }}
                    >
                      <Folder className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {segment.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {segmentBooks.length} book
                        {segmentBooks.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(segment)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(segment.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {segment.description && (
                  <p className="text-sm text-gray-600 mb-4">
                    {segment.description}
                  </p>
                )}

                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-700 mb-1">
                    Total Balance
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(segment.totalBalance)}
                  </div>
                </div>

                {segmentBooks.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      Books
                    </div>
                    <div className="space-y-2">
                      {segmentBooks.map(book => (
                        <div
                          key={book.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <div className="flex items-center space-x-2">
                            <BookOpen className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-700">{book.name}</span>
                          </div>
                          <span className="font-medium text-gray-900">
                            {formatCurrency(book.balance, book.currency)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t text-xs text-gray-500">
                  Created: {segment.createdAt.toLocaleDateString()}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Segment Form Modal */}
      {showForm && (
        <SegmentForm
          segment={editingSegment}
          onClose={handleCloseForm}
          onSave={handleSave}
        />
      )}
    </div>
  );
};
