'use client';

import { useState, useMemo } from 'react';
import { Expense, ExpenseFormData } from '@/types';
import { useExpenses } from '@/hooks/useExpenses';
import { useFilters } from '@/hooks/useFilters';
import { computeStats } from '@/utils';
import SummaryCards from '@/components/SummaryCards';
import ExpenseForm from '@/components/ExpenseForm';
import ExpenseList from '@/components/ExpenseList';

export default function ExpensesPage() {
  const { expenses, isLoaded, addExpense, editExpense, deleteExpense } = useExpenses();
  const {
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
  } = useFilters(expenses);

  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const stats = useMemo(() => computeStats(expenses), [expenses]);

  function handleFormSubmit(data: ExpenseFormData) {
    if (editingExpense) {
      editExpense(editingExpense.id, data);
      setEditingExpense(null);
    } else {
      addExpense(data);
    }
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading expenses…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Expenses</h1>
        <p className="text-gray-500 text-sm mt-1">Add and manage your spending</p>
      </div>

      {/* Summary cards */}
      <SummaryCards stats={stats} />

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar: form */}
        <div className="lg:col-span-1">
          <ExpenseForm
            editingExpense={editingExpense}
            onSubmit={handleFormSubmit}
            onCancel={() => setEditingExpense(null)}
          />
        </div>

        {/* Main: list */}
        <div className="lg:col-span-2">
          <ExpenseList
            expenses={expenses}
            filters={filters}
            filtered={filtered}
            hasActiveFilters={hasActiveFilters}
            onEdit={setEditingExpense}
            onDelete={deleteExpense}
            onSetSearch={setSearch}
            onSetCategory={setCategory}
            onSetDateFrom={setDateFrom}
            onSetDateTo={setDateTo}
            onSetSortBy={setSortBy}
            onToggleSortOrder={toggleSortOrder}
            onResetFilters={resetFilters}
          />
        </div>
      </div>
    </div>
  );
}
