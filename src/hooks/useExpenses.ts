'use client';

import { useState, useEffect, useCallback } from 'react';
import { Expense, ExpenseFormData } from '@/types';
import {
  loadExpenses,
  saveExpenses,
  createExpense,
  updateExpense,
} from '@/utils';

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount (client only)
  useEffect(() => {
    setExpenses(loadExpenses());
    setIsLoaded(true);
  }, []);

  // Persist on every change (after initial load)
  useEffect(() => {
    if (isLoaded) {
      saveExpenses(expenses);
    }
  }, [expenses, isLoaded]);

  const addExpense = useCallback((formData: ExpenseFormData) => {
    const expense = createExpense(formData);
    setExpenses((prev) => [expense, ...prev]);
    return expense;
  }, []);

  const editExpense = useCallback((id: string, formData: ExpenseFormData) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? updateExpense(e, formData) : e))
    );
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setExpenses([]);
  }, []);

  return { expenses, isLoaded, addExpense, editExpense, deleteExpense, clearAll };
}
