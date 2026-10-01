import { format, startOfMonth, startOfWeek, isWithinInterval, parseISO } from 'date-fns';
import {
  Expense,
  ExpenseFormData,
  ExpenseFilters,
  SummaryStats,
  CategoryTotal,
  MonthlyTotal,
  Category,
  CATEGORIES,
} from '@/types';

// ─── Currency ────────────────────────────────────────────────────────────────

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function parseCurrencyInput(value: string): number {
  const cleaned = value.replace(/[^0-9.]/g, '');
  return parseFloat(cleaned) || 0;
}

// ─── Dates ───────────────────────────────────────────────────────────────────

export function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'MMM d, yyyy');
  } catch {
    return dateStr;
  }
}

export function formatDateInput(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function todayString(): string {
  return formatDateInput(new Date());
}

export function monthLabel(monthStr: string): string {
  try {
    return format(parseISO(`${monthStr}-01`), 'MMM yyyy');
  } catch {
    return monthStr;
  }
}

// ─── localStorage ─────────────────────────────────────────────────────────────

const STORAGE_KEY = 'expense_tracker_expenses';

export function loadExpenses(): Expense[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultExpenses();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveExpenses(expenses: Expense[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  } catch {
    console.error('Failed to save expenses to localStorage');
  }
}

// ─── ID generation ────────────────────────────────────────────────────────────

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ─── Expense creation / update ───────────────────────────────────────────────

export function createExpense(formData: ExpenseFormData): Expense {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    date: formData.date,
    amount: parseCurrencyInput(formData.amount),
    category: formData.category,
    description: formData.description.trim(),
    createdAt: now,
    updatedAt: now,
  };
}

export function updateExpense(existing: Expense, formData: ExpenseFormData): Expense {
  return {
    ...existing,
    date: formData.date,
    amount: parseCurrencyInput(formData.amount),
    category: formData.category,
    description: formData.description.trim(),
    updatedAt: new Date().toISOString(),
  };
}

// ─── Filtering ────────────────────────────────────────────────────────────────

export function filterExpenses(expenses: Expense[], filters: ExpenseFilters): Expense[] {
  let result = [...expenses];

  // Search
  if (filters.search.trim()) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (e) =>
        e.description.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q)
    );
  }

  // Category
  if (filters.category !== 'All') {
    result = result.filter((e) => e.category === filters.category);
  }

  // Date range
  if (filters.dateFrom) {
    result = result.filter((e) => e.date >= filters.dateFrom);
  }
  if (filters.dateTo) {
    result = result.filter((e) => e.date <= filters.dateTo);
  }

  // Sort
  result.sort((a, b) => {
    let cmp = 0;
    if (filters.sortBy === 'date') {
      cmp = a.date.localeCompare(b.date);
    } else if (filters.sortBy === 'amount') {
      cmp = a.amount - b.amount;
    } else if (filters.sortBy === 'category') {
      cmp = a.category.localeCompare(b.category);
    }
    return filters.sortOrder === 'asc' ? cmp : -cmp;
  });

  return result;
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export function computeStats(expenses: Expense[]): SummaryStats {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });

  const totalAll = expenses.reduce((s, e) => s + e.amount, 0);

  const thisMonthExpenses = expenses.filter((e) => {
    try {
      return isWithinInterval(parseISO(e.date), { start: monthStart, end: now });
    } catch {
      return false;
    }
  });
  const totalThisMonth = thisMonthExpenses.reduce((s, e) => s + e.amount, 0);

  const thisWeekExpenses = expenses.filter((e) => {
    try {
      return isWithinInterval(parseISO(e.date), { start: weekStart, end: now });
    } catch {
      return false;
    }
  });
  const totalThisWeek = thisWeekExpenses.reduce((s, e) => s + e.amount, 0);

  // Top category
  const catTotals: Partial<Record<Category, number>> = {};
  for (const e of expenses) {
    catTotals[e.category] = (catTotals[e.category] ?? 0) + e.amount;
  }
  let topCategory: Category | null = null;
  let topCategoryAmount = 0;
  for (const [cat, total] of Object.entries(catTotals) as [Category, number][]) {
    if (total > topCategoryAmount) {
      topCategory = cat;
      topCategoryAmount = total;
    }
  }

  return {
    totalAll,
    totalThisMonth,
    totalThisWeek,
    topCategory,
    topCategoryAmount,
    expenseCount: expenses.length,
    avgExpense: expenses.length > 0 ? totalAll / expenses.length : 0,
  };
}

export function computeCategoryTotals(expenses: Expense[]): CategoryTotal[] {
  const totalAll = expenses.reduce((s, e) => s + e.amount, 0);
  const map: Partial<Record<Category, { total: number; count: number }>> = {};

  for (const e of expenses) {
    if (!map[e.category]) map[e.category] = { total: 0, count: 0 };
    map[e.category]!.total += e.amount;
    map[e.category]!.count += 1;
  }

  return CATEGORIES.map((cat) => ({
    category: cat,
    total: map[cat]?.total ?? 0,
    count: map[cat]?.count ?? 0,
    percentage: totalAll > 0 ? ((map[cat]?.total ?? 0) / totalAll) * 100 : 0,
  }))
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total);
}

export function computeMonthlyTotals(expenses: Expense[]): MonthlyTotal[] {
  const map: Record<string, number> = {};

  for (const e of expenses) {
    const month = e.date.slice(0, 7); // "YYYY-MM"
    map[month] = (map[month] ?? 0) + e.amount;
  }

  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6) // last 6 months
    .map(([month, total]) => ({
      month,
      label: monthLabel(month),
      total,
    }));
}

// ─── CSV Export ───────────────────────────────────────────────────────────────

export function exportToCSV(expenses: Expense[]): void {
  const headers = ['Date', 'Category', 'Amount', 'Description'];
  const rows = expenses.map((e) => [
    e.date,
    e.category,
    e.amount.toFixed(2),
    `"${e.description.replace(/"/g, '""')}"`,
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `expenses_${format(new Date(), 'yyyy-MM-dd')}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ─── Validation ───────────────────────────────────────────────────────────────

export interface FormErrors {
  date?: string;
  amount?: string;
  category?: string;
  description?: string;
}

export function validateExpenseForm(data: ExpenseFormData): FormErrors {
  const errors: FormErrors = {};

  if (!data.date) {
    errors.date = 'Date is required.';
  }

  const amount = parseCurrencyInput(data.amount);
  if (!data.amount) {
    errors.amount = 'Amount is required.';
  } else if (isNaN(amount) || amount <= 0) {
    errors.amount = 'Amount must be a positive number.';
  } else if (amount > 1_000_000) {
    errors.amount = 'Amount cannot exceed $1,000,000.';
  }

  if (!data.category) {
    errors.category = 'Category is required.';
  }

  if (!data.description.trim()) {
    errors.description = 'Description is required.';
  } else if (data.description.trim().length < 2) {
    errors.description = 'Description must be at least 2 characters.';
  } else if (data.description.trim().length > 200) {
    errors.description = 'Description cannot exceed 200 characters.';
  }

  return errors;
}

// ─── Seed data ────────────────────────────────────────────────────────────────

function getDefaultExpenses(): Expense[] {
  const today = new Date();
  const d = (daysAgo: number) => {
    const dt = new Date(today);
    dt.setDate(dt.getDate() - daysAgo);
    return formatDateInput(dt);
  };

  return [
    { id: generateId(), date: d(0), amount: 45.5, category: 'Food', description: 'Grocery shopping', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), date: d(1), amount: 12.0, category: 'Transportation', description: 'Uber ride to work', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), date: d(2), amount: 89.99, category: 'Shopping', description: 'New headphones', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), date: d(3), amount: 9.99, category: 'Entertainment', description: 'Netflix subscription', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), date: d(4), amount: 150.0, category: 'Bills', description: 'Electricity bill', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), date: d(5), amount: 23.75, category: 'Food', description: 'Restaurant dinner', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), date: d(7), amount: 55.0, category: 'Bills', description: 'Internet plan', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), date: d(10), amount: 18.5, category: 'Food', description: 'Lunch with colleagues', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), date: d(12), amount: 35.0, category: 'Entertainment', description: 'Cinema tickets', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), date: d(14), amount: 200.0, category: 'Shopping', description: 'Winter jacket', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), date: d(20), amount: 60.0, category: 'Transportation', description: 'Monthly bus pass', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), date: d(25), amount: 8.5, category: 'Food', description: 'Coffee and pastry', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), date: d(30), amount: 75.0, category: 'Bills', description: 'Phone bill', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), date: d(35), amount: 42.0, category: 'Food', description: 'Weekly groceries', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: generateId(), date: d(40), amount: 120.0, category: 'Entertainment', description: 'Concert tickets', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ];
}
