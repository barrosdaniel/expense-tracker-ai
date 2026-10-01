'use client';

import { useState, useCallback, useMemo } from 'react';
import { Expense, ExpenseFilters } from '@/types';
import { filterExpenses } from '@/utils';

const DEFAULT_FILTERS: ExpenseFilters = {
  search: '',
  category: 'All',
  dateFrom: '',
  dateTo: '',
  sortBy: 'date',
  sortOrder: 'desc',
};

export function useFilters(expenses: Expense[]) {
  const [filters, setFilters] = useState<ExpenseFilters>(DEFAULT_FILTERS);

  const filtered = useMemo(
    () => filterExpenses(expenses, filters),
    [expenses, filters]
  );

  const setSearch = useCallback((search: string) => {
    setFilters((f) => ({ ...f, search }));
  }, []);

  const setCategory = useCallback((category: ExpenseFilters['category']) => {
    setFilters((f) => ({ ...f, category }));
  }, []);

  const setDateFrom = useCallback((dateFrom: string) => {
    setFilters((f) => ({ ...f, dateFrom }));
  }, []);

  const setDateTo = useCallback((dateTo: string) => {
    setFilters((f) => ({ ...f, dateTo }));
  }, []);

  const setSortBy = useCallback((sortBy: ExpenseFilters['sortBy']) => {
    setFilters((f) => ({ ...f, sortBy }));
  }, []);

  const toggleSortOrder = useCallback(() => {
    setFilters((f) => ({
      ...f,
      sortOrder: f.sortOrder === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const hasActiveFilters =
    filters.search !== '' ||
    filters.category !== 'All' ||
    filters.dateFrom !== '' ||
    filters.dateTo !== '';

  return {
    filters,
    filtered,
    hasActiveFilters,
    setSearch,
    setCategory,
    setDateFrom,
    setDateTo,
    setSortBy,
    toggleSortOrder,
    resetFilters,
  };
}
