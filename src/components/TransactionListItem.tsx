import React, { useState, useRef, useEffect } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Transaction, Category } from '../types';
import { formatCurrency, formatDate } from '../lib/utils';

interface TransactionListItemProps {
  transaction: Transaction;
  category?: Category;
  currency: string;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transactionId: string) => void;
}

export const TransactionListItem: React.FC<TransactionListItemProps> = ({
  transaction,
  category,
  currency,
  onEdit,
  onDelete,
}) => {
  const [showActions, setShowActions] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const currentX = e.touches[0].clientX;
    const diff = startX - currentX;
    
    // Only allow left swipe (positive diff)
    if (diff > 0) {
      setTranslateX(Math.min(diff, 120)); // Max swipe distance of 120px
    } else {
      setTranslateX(0);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    
    if (translateX > 60) {
      setShowActions(true);
      setTranslateX(120);
    } else {
      setShowActions(false);
      setTranslateX(0);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setStartX(e.clientX);
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const currentX = e.clientX;
    const diff = startX - currentX;
    
    if (diff > 0) {
      setTranslateX(Math.min(diff, 120));
    } else {
      setTranslateX(0);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    
    if (translateX > 60) {
      setShowActions(true);
      setTranslateX(120);
    } else {
      setShowActions(false);
      setTranslateX(0);
    }
  };

  useEffect(() => {
    const handleMouseMoveGlobal = (e: MouseEvent) => {
      if (isDragging) {
        const currentX = e.clientX;
        const diff = startX - currentX;
        
        if (diff > 0) {
          setTranslateX(Math.min(diff, 120));
        } else {
          setTranslateX(0);
        }
      }
    };

    const handleMouseUpGlobal = () => {
      if (isDragging) {
        setIsDragging(false);
        
        if (translateX > 60) {
          setShowActions(true);
          setTranslateX(120);
        } else {
          setShowActions(false);
          setTranslateX(0);
        }
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMoveGlobal);
      document.addEventListener('mouseup', handleMouseUpGlobal);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMoveGlobal);
      document.removeEventListener('mouseup', handleMouseUpGlobal);
    };
  }, [isDragging, startX, translateX]);

  const handleEdit = () => {
    onEdit(transaction);
    setShowActions(false);
    setTranslateX(0);
  };

  const handleDelete = () => {
    onDelete(transaction.id);
    setShowActions(false);
    setTranslateX(0);
  };

  return (
    <div className="relative overflow-hidden bg-white">
      {/* Action buttons (revealed on swipe) */}
      <div className="absolute right-0 top-0 h-full flex items-center bg-gray-100">
        <button
          onClick={handleEdit}
          className="flex items-center justify-center w-12 h-full text-blue-600 hover:bg-blue-50"
          aria-label="Edit transaction"
        >
          <Edit className="h-5 w-5" />
        </button>
        <button
          onClick={handleDelete}
          className="flex items-center justify-center w-12 h-full text-red-600 hover:bg-red-50"
          aria-label="Delete transaction"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>

      {/* Main content */}
      <div
        ref={itemRef}
        className="relative bg-white transition-transform duration-200 ease-out cursor-grab active:cursor-grabbing"
        style={{
          transform: `translateX(-${translateX}px)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {transaction.description}
                </h3>
                <span className={`text-sm font-semibold ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(transaction.amount, currency)}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-2">
                  {category && (
                    <span className="px-2 py-1 bg-gray-100 rounded-full">
                      {category.name}
                    </span>
                  )}
                  <span>{formatDate(transaction.date)}</span>
                </div>
              </div>

              {transaction.notes && (
                <p className="text-xs text-gray-600 mt-1 truncate">
                  {transaction.notes}
                </p>
              )}

              {transaction.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {transaction.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop action buttons */}
            <div className="hidden md:flex ml-4 space-x-2">
              <button
                onClick={() => onEdit(transaction)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                aria-label="Edit transaction"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(transaction.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                aria-label="Delete transaction"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};