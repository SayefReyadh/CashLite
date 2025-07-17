import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';
import { useStore } from '../store';
import { CategoryService } from '../lib/services';
import { Category } from '../types';
import toast from 'react-hot-toast';

const categoryService = new CategoryService();

interface CategoryFormProps {
  category?: Category;
  onClose: () => void;
  onSave: (category: Category) => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ category, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    type: category?.type || 'both' as 'income' | 'expense' | 'both',
    color: category?.color || '#3B82F6',
    icon: category?.icon || 'tag'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const categoryData = {
        name: formData.name.trim(),
        type: formData.type,
        color: formData.color,
        icon: formData.icon,
        isDefault: false,
        isActive: true
      };

      let savedCategory: Category;
      
      if (category) {
        await categoryService.update(category.id, categoryData);
        savedCategory = { ...category, ...categoryData, updatedAt: new Date() };
        toast.success('Category updated successfully');
      } else {
        savedCategory = await categoryService.create(categoryData);
        toast.success('Category created successfully');
      }

      onSave(savedCategory);
      onClose();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const colorOptions = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
    '#F97316', '#6B7280', '#1F2937', '#7C3AED'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {category ? 'Edit Category' : 'Add Category'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter category name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense' | 'both' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="both">Both</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
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
                    className={`w-8 h-8 rounded-full border-2 ${
                      formData.color === color ? 'border-gray-900' : 'border-gray-300'
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

export const Categories: React.FC = () => {
  const { categories, setCategories } = useStore();
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();

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

    loadCategories();
  }, [setCategories]);

  const handleDelete = async (categoryId: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      await categoryService.delete(categoryId);
      setCategories(categories.filter(c => c.id !== categoryId));
      toast.success('Category deleted successfully');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleSave = (category: Category) => {
    if (editingCategory) {
      setCategories(categories.map(c => c.id === category.id ? category : c));
    } else {
      setCategories([...categories, category]);
    }
    setEditingCategory(undefined);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCategory(undefined);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'income': return 'text-green-600 bg-green-100';
      case 'expense': return 'text-red-600 bg-red-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'income': return 'Income';
      case 'expense': return 'Expense';
      default: return 'Both';
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-2 text-gray-500">Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No categories found</p>
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add your first category
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {categories.map((category) => (
              <div
                key={category.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: category.color }}
                    >
                      <Tag className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{category.name}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(category.type)}`}>
                        {getTypeLabel(category.type)}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  Created: {category.createdAt.toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Form Modal */}
      {showForm && (
        <CategoryForm
          category={editingCategory}
          onClose={handleCloseForm}
          onSave={handleSave}
        />
      )}
    </div>
  );
};
