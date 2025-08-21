import React, { useState, useRef, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { Transaction, Category } from '../types';
import { formatDate, groupBy } from '../lib/utils';
import { TransactionListItem } from './TransactionListItem';

interface GroupedTransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  currency: string;
  isLoading: boolean;
  hasMore: boolean;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transactionId: string) => void;
  onRefresh: () => Promise<void>;
  onLoadMore: () => Promise<void>;
}

export const GroupedTransactionList: React.FC<GroupedTransactionListProps> = ({
  transactions,
  categories,
  currency,
  isLoading,
  hasMore,
  onEdit,
  onDelete,
  onRefresh,
  onLoadMore,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [startY, setStartY] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const observer = useRef<IntersectionObserver>();

  // Group transactions by date
  const groupedTransactions = groupBy(transactions, (transaction) => {
    const date = new Date(transaction.date);
    return date.toDateString();
  });

  const sortedDateKeys = Object.keys(groupedTransactions).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  // Pull to refresh handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      setStartY(e.touches[0].clientY);
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling || containerRef.current?.scrollTop !== 0) return;

    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, (currentY - startY) / 2); // Damping effect
    setPullDistance(Math.min(distance, 80));
  };

  const handleTouchEnd = async () => {
    if (isPulling && pullDistance > 60) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    
    setIsPulling(false);
    setPullDistance(0);
  };

  // Infinite scroll
  const lastTransactionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !isLoading) {
          setLoadingMore(true);
          try {
            await onLoadMore();
          } finally {
            setLoadingMore(false);
          }
        }
      },
      { threshold: 0.1 }
    );

    if (lastTransactionRef.current) {
      observer.current.observe(lastTransactionRef.current);
    }

    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [hasMore, loadingMore, isLoading, onLoadMore]);

  const getCategoryForTransaction = (categoryId?: string) => {
    return categories.find(c => c.id === categoryId);
  };

  const calculateDayTotal = (dayTransactions: Transaction[]) => {
    return dayTransactions.reduce((total, transaction) => {
      return total + (transaction.type === 'income' ? transaction.amount : -transaction.amount);
    }, 0);
  };

  if (isLoading && transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-2 text-gray-500">Loading transactions...</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-500">No transactions found</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Pull to refresh indicator */}
      <div
        className={`absolute top-0 left-0 right-0 flex items-center justify-center bg-gray-50 transition-all duration-200 overflow-hidden ${
          isPulling ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ height: `${pullDistance}px` }}
      >
        <div className="flex items-center space-x-2 text-gray-600">
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="text-sm">
            {isRefreshing ? 'Refreshing...' : pullDistance > 60 ? 'Release to refresh' : 'Pull to refresh'}
          </span>
        </div>
      </div>

      <div
        ref={containerRef}
        className="bg-white rounded-lg shadow overflow-hidden"
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: isPulling ? 'none' : 'transform 0.2s ease-out',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {sortedDateKeys.map((dateKey, dateIndex) => {
          const dayTransactions = groupedTransactions[dateKey];
          const dayTotal = calculateDayTotal(dayTransactions);
          const isToday = new Date(dateKey).toDateString() === new Date().toDateString();
          const isYesterday = new Date(dateKey).toDateString() === new Date(Date.now() - 86400000).toDateString();

          let dateLabel = formatDate(new Date(dateKey));
          if (isToday) dateLabel = 'Today';
          else if (isYesterday) dateLabel = 'Yesterday';

          return (
            <div key={dateKey} className={dateIndex > 0 ? 'border-t-8 border-gray-100' : ''}>
              {/* Date header */}
              <div className="sticky top-0 bg-gray-50 px-4 py-3 border-b border-gray-200 z-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900">{dateLabel}</h3>
                  <span className={`text-sm font-semibold ${
                    dayTotal >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {dayTotal >= 0 ? '+' : ''}
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency,
                    }).format(dayTotal)}
                  </span>
                </div>
              </div>

              {/* Transactions for this date */}
              <div>
                {dayTransactions.map((transaction, transactionIndex) => {
                  const isLast = dateIndex === sortedDateKeys.length - 1 && 
                                transactionIndex === dayTransactions.length - 1;
                  
                  return (
                    <div
                      key={transaction.id}
                      ref={isLast ? lastTransactionRef : undefined}
                    >
                      <TransactionListItem
                        transaction={transaction}
                        category={getCategoryForTransaction(transaction.categoryId)}
                        currency={currency}
                        onEdit={onEdit}
                        onDelete={onDelete}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Loading more indicator */}
        {(loadingMore || hasMore) && (
          <div className="text-center py-4 border-t border-gray-100">
            {loadingMore ? (
              <div className="flex items-center justify-center space-x-2 text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-sm">Loading more...</span>
              </div>
            ) : hasMore ? (
              <button
                onClick={() => {
                  setLoadingMore(true);
                  onLoadMore().finally(() => setLoadingMore(false));
                }}
                className="text-sm text-primary hover:text-primary/80"
              >
                Load more transactions
              </button>
            ) : null}
          </div>
        )}

        {!hasMore && !loadingMore && transactions.length > 10 && (
          <div className="text-center py-4 border-t border-gray-100">
            <span className="text-sm text-gray-500">End of transactions</span>
          </div>
        )}
      </div>
    </div>
  );
};