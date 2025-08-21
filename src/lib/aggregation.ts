import { db } from './database';
import { globalCache, CacheService } from './cache';
import { 
  Transaction, 
  Category, 
  CategoryAggregation, 
  DailySummary, 
  MonthlySummary, 
  AggregationOptions 
} from '../types';
import { format, startOfDay, endOfDay, startOfMonth, endOfMonth, getDaysInMonth } from 'date-fns';

export class AggregationService {
  private cache = globalCache;

  /**
   * Aggregate transactions by category
   */
  async getTransactionsByCategory(options: AggregationOptions = {}): Promise<CategoryAggregation[]> {
    const cacheKey = CacheService.generateKey('category-aggregation', options);
    
    // Try to get from cache first
    const cached = this.cache.get<CategoryAggregation[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Get transactions based on filter options
    const transactions = await this.getFilteredTransactions(options);
    const categories = await db.categories.toArray();
    
    // Group transactions by category
    const categoryMap = new Map<string, Transaction[]>();
    const uncategorizedTransactions: Transaction[] = [];

    transactions.forEach(transaction => {
      if (transaction.categoryId) {
        if (!categoryMap.has(transaction.categoryId)) {
          categoryMap.set(transaction.categoryId, []);
        }
        categoryMap.get(transaction.categoryId)!.push(transaction);
      } else {
        uncategorizedTransactions.push(transaction);
      }
    });

    // Calculate total amount for percentage calculation
    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

    // Create aggregations for each category
    const aggregations: CategoryAggregation[] = [];

    for (const [categoryId, categoryTransactions] of categoryMap.entries()) {
      const category = categories.find(c => c.id === categoryId);
      if (!category) continue;

      const amounts = categoryTransactions.map(t => t.amount);
      const totalCategoryAmount = amounts.reduce((sum, amount) => sum + amount, 0);

      aggregations.push({
        categoryId,
        categoryName: category.name,
        totalAmount: totalCategoryAmount,
        transactionCount: categoryTransactions.length,
        averageAmount: totalCategoryAmount / categoryTransactions.length,
        minAmount: Math.min(...amounts),
        maxAmount: Math.max(...amounts),
        type: category.type,
        percentage: totalAmount > 0 ? (totalCategoryAmount / totalAmount) * 100 : 0
      });
    }

    // Add uncategorized transactions if any
    if (uncategorizedTransactions.length > 0) {
      const amounts = uncategorizedTransactions.map(t => t.amount);
      const totalUncategorized = amounts.reduce((sum, amount) => sum + amount, 0);

      aggregations.push({
        categoryId: 'uncategorized',
        categoryName: 'Uncategorized',
        totalAmount: totalUncategorized,
        transactionCount: uncategorizedTransactions.length,
        averageAmount: totalUncategorized / uncategorizedTransactions.length,
        minAmount: Math.min(...amounts),
        maxAmount: Math.max(...amounts),
        type: 'both',
        percentage: totalAmount > 0 ? (totalUncategorized / totalAmount) * 100 : 0
      });
    }

    // Sort by total amount descending
    aggregations.sort((a, b) => b.totalAmount - a.totalAmount);

    // Cache the result
    this.cache.set(cacheKey, aggregations);

    return aggregations;
  }

  /**
   * Get daily summaries for a date range
   */
  async getDailySummaries(options: AggregationOptions = {}): Promise<DailySummary[]> {
    const cacheKey = CacheService.generateKey('daily-summaries', options);
    
    // Try to get from cache first
    const cached = this.cache.get<DailySummary[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const transactions = await this.getFilteredTransactions(options);
    const categories = await db.categories.toArray();
    
    // Group transactions by date
    const dailyMap = new Map<string, Transaction[]>();

    transactions.forEach(transaction => {
      const dateKey = format(transaction.date, 'yyyy-MM-dd');
      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, []);
      }
      dailyMap.get(dateKey)!.push(transaction);
    });

    // Create daily summaries
    const summaries: DailySummary[] = [];

    for (const [dateKey, dayTransactions] of dailyMap.entries()) {
      const incomeTransactions = dayTransactions.filter(t => t.type === 'income');
      const expenseTransactions = dayTransactions.filter(t => t.type === 'expense');

      const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
      const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);

      // Get top categories for this day (top 3)
      const dayCategories = await this.getTransactionsByCategory({
        ...options,
        dateFrom: new Date(dateKey),
        dateTo: new Date(dateKey)
      });

      summaries.push({
        date: dateKey,
        totalIncome,
        totalExpense,
        netAmount: totalIncome - totalExpense,
        transactionCount: dayTransactions.length,
        incomeTransactions: incomeTransactions.length,
        expenseTransactions: expenseTransactions.length,
        topCategories: dayCategories.slice(0, 3)
      });
    }

    // Sort by date descending
    summaries.sort((a, b) => b.date.localeCompare(a.date));

    // Cache the result
    this.cache.set(cacheKey, summaries);

    return summaries;
  }

  /**
   * Get detailed monthly summary
   */
  async getMonthlySummary(year: number, month: number, options: AggregationOptions = {}): Promise<MonthlySummary> {
    const cacheKey = CacheService.generateKey('monthly-summary', { year, month, ...options });
    
    // Try to get from cache first
    const cached = this.cache.get<MonthlySummary>(cacheKey);
    if (cached) {
      return cached;
    }

    const startDate = startOfMonth(new Date(year, month - 1));
    const endDate = endOfMonth(new Date(year, month - 1));

    const monthOptions: AggregationOptions = {
      ...options,
      dateFrom: startDate,
      dateTo: endDate
    };

    // Get all data for the month
    const transactions = await this.getFilteredTransactions(monthOptions);
    const categoryBreakdown = await this.getTransactionsByCategory(monthOptions);
    const dailySummaries = await this.getDailySummaries(monthOptions);

    // Calculate basic stats
    const incomeTransactions = transactions.filter(t => t.type === 'income');
    const expenseTransactions = transactions.filter(t => t.type === 'expense');

    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);

    // Calculate daily averages
    const daysInMonth = getDaysInMonth(new Date(year, month - 1));
    const daysWithTransactions = dailySummaries.length;

    // Find biggest income and expense days
    const sortedByIncome = [...dailySummaries].sort((a, b) => b.totalIncome - a.totalIncome);
    const sortedByExpense = [...dailySummaries].sort((a, b) => b.totalExpense - a.totalExpense);

    const summary: MonthlySummary = {
      year,
      month,
      totalIncome,
      totalExpense,
      netAmount: totalIncome - totalExpense,
      transactionCount: transactions.length,
      incomeTransactions: incomeTransactions.length,
      expenseTransactions: expenseTransactions.length,
      avgDailyIncome: daysInMonth > 0 ? totalIncome / daysInMonth : 0,
      avgDailyExpense: daysInMonth > 0 ? totalExpense / daysInMonth : 0,
      categoryBreakdown,
      dailySummaries,
      biggestIncomeDay: sortedByIncome[0]?.date || '',
      biggestExpenseDay: sortedByExpense[0]?.date || '',
      daysWithTransactions
    };

    // Cache the result
    this.cache.set(cacheKey, summary);

    return summary;
  }

  /**
   * Get category-wise spending trends over time
   */
  async getCategoryTrends(categoryId: string, options: AggregationOptions = {}): Promise<DailySummary[]> {
    const cacheKey = CacheService.generateKey('category-trends', { categoryId, ...options });
    
    // Try to get from cache first
    const cached = this.cache.get<DailySummary[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // Filter transactions for specific category
    const transactions = await this.getFilteredTransactions(options);
    const categoryTransactions = transactions.filter(t => t.categoryId === categoryId);

    // Group by date
    const dailyMap = new Map<string, Transaction[]>();

    categoryTransactions.forEach(transaction => {
      const dateKey = format(transaction.date, 'yyyy-MM-dd');
      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, []);
      }
      dailyMap.get(dateKey)!.push(transaction);
    });

    // Create summaries for this category only
    const summaries: DailySummary[] = [];

    for (const [dateKey, dayTransactions] of dailyMap.entries()) {
      const incomeTransactions = dayTransactions.filter(t => t.type === 'income');
      const expenseTransactions = dayTransactions.filter(t => t.type === 'expense');

      const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
      const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);

      summaries.push({
        date: dateKey,
        totalIncome,
        totalExpense,
        netAmount: totalIncome - totalExpense,
        transactionCount: dayTransactions.length,
        incomeTransactions: incomeTransactions.length,
        expenseTransactions: expenseTransactions.length,
        topCategories: [] // Not needed for category-specific trends
      });
    }

    // Sort by date
    summaries.sort((a, b) => a.date.localeCompare(b.date));

    // Cache the result
    this.cache.set(cacheKey, summaries);

    return summaries;
  }

  /**
   * Clear all aggregation caches (useful when data changes)
   */
  clearCache(): void {
    this.cache.invalidatePattern('category-aggregation');
    this.cache.invalidatePattern('daily-summaries');
    this.cache.invalidatePattern('monthly-summary');
    this.cache.invalidatePattern('category-trends');
  }

  /**
   * Get filtered transactions based on options
   */
  private async getFilteredTransactions(options: AggregationOptions): Promise<Transaction[]> {
    let query = db.transactions.orderBy('date');

    // Apply filters
    let transactions = await query.toArray();

    if (options.bookIds && options.bookIds.length > 0) {
      transactions = transactions.filter(t => options.bookIds!.includes(t.bookId));
    }

    if (options.dateFrom) {
      transactions = transactions.filter(t => t.date >= options.dateFrom!);
    }

    if (options.dateTo) {
      transactions = transactions.filter(t => t.date <= options.dateTo!);
    }

    return transactions;
  }
}

// Global aggregation service instance
export const aggregationService = new AggregationService();