'use client';

import { useState } from 'react';
import { Expense, CATEGORIES, ExpenseFilters } from '@/types';
import { formatCurrency, formatDate } from '@/utils';
import CategoryBadge from './CategoryBadge';
import ExportModal from './ExportModal';

interface Props {
  expenses: Expense[];
  filters: ExpenseFilters;
  filtered: Expense[];
  hasActiveFilters: boolean;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  onSetSearch: (v: string) => void;
  onSetCategory: (v: ExpenseFilters['category']) => void;
  onSetDateFrom: (v: string) => void;
  onSetDateTo: (v: string) => void;
  onSetSortBy: (v: ExpenseFilters['sortBy']) => void;
  onToggleSortOrder: () => void;
  onResetFilters: () => void;
}

export default function ExpenseList({
  expenses,
  filters,
  filtered,
  hasActiveFilters,
  onEdit,
  onDelete,
  onSetSearch,
  onSetCategory,
  onSetDateFrom,
  onSetDateTo,
  onSetSortBy,
  onToggleSortOrder,
  onResetFilters,
}: Props) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  function handleDelete(id: string) {
    if (confirmDeleteId === id) {
      onDelete(id);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      {/* Header */}
      <div className="p-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Expenses</h2>
          <p className="text-sm text-gray-500">
            {filtered.length} of {expenses.length} shown
            {hasActiveFilters && (
              <button
                onClick={onResetFilters}
                className="ml-2 text-blue-500 hover:text-blue-700 text-xs underline"
              >
                Clear filters
              </button>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border transition ${
              showFilters || hasActiveFilters
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <FilterIcon />
            Filters
            {hasActiveFilters && (
              <span className="bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                !
              </span>
            )}
          </button>
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition font-medium"
          >
            <DownloadIcon />
            Export Data
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="px-5 pt-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Search by description or category…"
            value={filters.search}
            onChange={(e) => onSetSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          {filters.search && (
            <button
              onClick={() => onSetSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="px-5 pt-3 pb-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Category filter */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
            <select
              value={filters.category}
              onChange={(e) => onSetCategory(e.target.value as ExpenseFilters['category'])}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Date from */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">From</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => onSetDateFrom(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Date to */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">To</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => onSetDateTo(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Sort */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Sort by</label>
            <div className="flex gap-2">
              <select
                value={filters.sortBy}
                onChange={(e) => onSetSortBy(e.target.value as ExpenseFilters['sortBy'])}
                className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
                <option value="category">Category</option>
              </select>
              <button
                onClick={onToggleSortOrder}
                title={filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                className="px-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm transition"
              >
                {filters.sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expense rows */}
      <div className="p-4 space-y-1">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-2">🔍</p>
            <p className="text-sm">No expenses found</p>
            {hasActiveFilters && (
              <button
                onClick={onResetFilters}
                className="mt-2 text-blue-500 text-sm hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          filtered.map((expense) => (
            <ExpenseRow
              key={expense.id}
              expense={expense}
              confirmingDelete={confirmDeleteId === expense.id}
              onEdit={() => {
                setConfirmDeleteId(null);
                onEdit(expense);
              }}
              onDeleteClick={() => handleDelete(expense.id)}
              onCancelDelete={() => setConfirmDeleteId(null)}
            />
          ))
        )}
      </div>

      {/* Footer summary */}
      {filtered.length > 0 && (
        <div className="px-5 py-3 border-t border-gray-100 flex justify-between items-center">
          <span className="text-sm text-gray-500">{filtered.length} expense{filtered.length !== 1 ? 's' : ''}</span>
          <span className="text-sm font-semibold text-gray-800">
            Total: {formatCurrency(filtered.reduce((s, e) => s + e.amount, 0))}
          </span>
        </div>
      )}

      {/* Export Modal */}
      <ExportModal
        expenses={expenses}
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface RowProps {
  expense: Expense;
  confirmingDelete: boolean;
  onEdit: () => void;
  onDeleteClick: () => void;
  onCancelDelete: () => void;
}

function ExpenseRow({ expense, confirmingDelete, onEdit, onDeleteClick, onCancelDelete }: RowProps) {
  return (
    <div className="group flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition">
      {/* Date */}
      <div className="hidden sm:block w-24 text-xs text-gray-500 flex-shrink-0">
        {formatDate(expense.date)}
      </div>

      {/* Category badge */}
      <div className="flex-shrink-0">
        <CategoryBadge category={expense.category} size="sm" />
      </div>

      {/* Description */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-700 truncate">{expense.description}</p>
        <p className="text-xs text-gray-400 sm:hidden">{formatDate(expense.date)}</p>
      </div>

      {/* Amount */}
      <div className="text-sm font-semibold text-gray-800 flex-shrink-0 tabular-nums">
        {formatCurrency(expense.amount)}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {confirmingDelete ? (
          <>
            <span className="text-xs text-red-600 font-medium mr-1">Delete?</span>
            <button
              onClick={onDeleteClick}
              className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition"
            >
              Yes
            </button>
            <button
              onClick={onCancelDelete}
              className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300 transition"
            >
              No
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onEdit}
              className="text-gray-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-blue-50 transition opacity-0 group-hover:opacity-100"
              title="Edit"
            >
              <EditIcon />
            </button>
            <button
              onClick={onDeleteClick}
              className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition opacity-0 group-hover:opacity-100"
              title="Delete"
            >
              <TrashIcon />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function FilterIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M7 8h10M11 12h2M9 16h6" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 10l5 5 5-5M12 3v12" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3M4 7h16" />
    </svg>
  );
}
