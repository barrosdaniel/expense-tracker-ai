'use client';

import { useState, useEffect } from 'react';
import { Expense, ExpenseFormData, CATEGORIES, Category } from '@/types';
import { todayString, validateExpenseForm } from '@/utils';
import { FormErrors } from '@/utils';

interface Props {
  editingExpense?: Expense | null;
  onSubmit: (data: ExpenseFormData) => void;
  onCancel?: () => void;
}

const EMPTY_FORM: ExpenseFormData = {
  date: todayString(),
  amount: '',
  category: 'Food',
  description: '',
};

export default function ExpenseForm({ editingExpense, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<ExpenseFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (editingExpense) {
      setForm({
        date: editingExpense.date,
        amount: editingExpense.amount.toFixed(2),
        category: editingExpense.category,
        description: editingExpense.description,
      });
      setErrors({});
      setTouched({});
    } else {
      setForm({ ...EMPTY_FORM, date: todayString() });
      setErrors({});
      setTouched({});
    }
  }, [editingExpense]);

  function handleChange(field: keyof ExpenseFormData, value: string) {
    const updated = { ...form, [field]: value };
    setForm(updated);
    if (touched[field]) {
      setErrors(validateExpenseForm(updated));
    }
  }

  function handleBlur(field: keyof ExpenseFormData) {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors(validateExpenseForm(form));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const allTouched: Record<string, boolean> = {};
    (Object.keys(form) as (keyof ExpenseFormData)[]).forEach((k) => (allTouched[k] = true));
    setTouched(allTouched);

    const errs = validateExpenseForm(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 200)); // brief visual feedback
    onSubmit(form);
    setSubmitting(false);

    if (!editingExpense) {
      setSuccess(true);
      setForm({ ...EMPTY_FORM, date: todayString() });
      setTouched({});
      setErrors({});
      setTimeout(() => setSuccess(false), 2000);
    }
  }

  const isEditing = !!editingExpense;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-800">
          {isEditing ? '✏️ Edit Expense' : '➕ Add Expense'}
        </h2>
        {success && (
          <span className="text-sm text-emerald-600 font-medium flex items-center gap-1">
            ✅ Added!
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Date & Amount row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Date */}
          <div>
            <label htmlFor="exp-date" className="block text-sm font-medium text-gray-700 mb-1">
              Date <span className="text-red-400">*</span>
            </label>
            <input
              id="exp-date"
              type="date"
              value={form.date}
              onChange={(e) => handleChange('date', e.target.value)}
              onBlur={() => handleBlur('date')}
              max={todayString()}
              className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                errors.date && touched.date
                  ? 'border-red-400 bg-red-50'
                  : 'border-gray-300 bg-white'
              }`}
            />
            {errors.date && touched.date && (
              <p className="mt-1 text-xs text-red-500">{errors.date}</p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="exp-amount" className="block text-sm font-medium text-gray-700 mb-1">
              Amount ($) <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input
                id="exp-amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                onBlur={() => handleBlur('amount')}
                className={`w-full rounded-lg border pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                  errors.amount && touched.amount
                    ? 'border-red-400 bg-red-50'
                    : 'border-gray-300 bg-white'
                }`}
              />
            </div>
            {errors.amount && touched.amount && (
              <p className="mt-1 text-xs text-red-500">{errors.amount}</p>
            )}
          </div>
        </div>

        {/* Category */}
        <div>
          <label htmlFor="exp-category" className="block text-sm font-medium text-gray-700 mb-1">
            Category <span className="text-red-400">*</span>
          </label>
          <select
            id="exp-category"
            value={form.category}
            onChange={(e) => handleChange('category', e.target.value as Category)}
            onBlur={() => handleBlur('category')}
            className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition ${
              errors.category && touched.category ? 'border-red-400' : 'border-gray-300'
            }`}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && touched.category && (
            <p className="mt-1 text-xs text-red-500">{errors.category}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="exp-desc" className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-red-400">*</span>
          </label>
          <input
            id="exp-desc"
            type="text"
            placeholder="What did you spend on?"
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            onBlur={() => handleBlur('description')}
            maxLength={200}
            className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
              errors.description && touched.description
                ? 'border-red-400 bg-red-50'
                : 'border-gray-300 bg-white'
            }`}
          />
          <div className="flex justify-between mt-1">
            {errors.description && touched.description ? (
              <p className="text-xs text-red-500">{errors.description}</p>
            ) : (
              <span />
            )}
            <span className="text-xs text-gray-400">{form.description.length}/200</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium py-2.5 px-4 rounded-lg transition flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Saving…
              </>
            ) : isEditing ? (
              'Save Changes'
            ) : (
              '+ Add Expense'
            )}
          </button>
          {isEditing && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2.5 px-4 rounded-lg transition"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
