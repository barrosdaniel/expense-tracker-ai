export type Category =
  | 'Food'
  | 'Transportation'
  | 'Entertainment'
  | 'Shopping'
  | 'Bills'
  | 'Other';

export const CATEGORIES: Category[] = [
  'Food',
  'Transportation',
  'Entertainment',
  'Shopping',
  'Bills',
  'Other',
];

export interface Expense {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  amount: number;
  category: Category;
  description: string;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

export interface ExpenseFormData {
  date: string;
  amount: string;
  category: Category;
  description: string;
}

export interface ExpenseFilters {
  search: string;
  category: Category | 'All';
  dateFrom: string;
  dateTo: string;
  sortBy: 'date' | 'amount' | 'category';
  sortOrder: 'asc' | 'desc';
}

export interface SummaryStats {
  totalAll: number;
  totalThisMonth: number;
  totalThisWeek: number;
  topCategory: Category | null;
  topCategoryAmount: number;
  expenseCount: number;
  avgExpense: number;
}

export interface CategoryTotal {
  category: Category;
  total: number;
  count: number;
  percentage: number;
}

export interface MonthlyTotal {
  month: string; // e.g. "2025-01"
  label: string; // e.g. "Jan 2025"
  total: number;
}

export const CATEGORY_COLORS: Record<Category, string> = {
  Food: '#f97316',
  Transportation: '#3b82f6',
  Entertainment: '#a855f7',
  Shopping: '#ec4899',
  Bills: '#ef4444',
  Other: '#6b7280',
};

export const CATEGORY_BG_COLORS: Record<Category, string> = {
  Food: 'bg-orange-100 text-orange-700',
  Transportation: 'bg-blue-100 text-blue-700',
  Entertainment: 'bg-purple-100 text-purple-700',
  Shopping: 'bg-pink-100 text-pink-700',
  Bills: 'bg-red-100 text-red-700',
  Other: 'bg-gray-100 text-gray-700',
};

export const CATEGORY_ICONS: Record<Category, string> = {
  Food: '🍔',
  Transportation: '🚗',
  Entertainment: '🎬',
  Shopping: '🛍️',
  Bills: '📄',
  Other: '📦',
};
