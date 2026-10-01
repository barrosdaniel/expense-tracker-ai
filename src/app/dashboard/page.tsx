'use client';

import { useMemo } from 'react';
import { useExpenses } from '@/hooks/useExpenses';
import { computeStats, computeCategoryTotals, computeMonthlyTotals, formatCurrency, exportToCSV } from '@/utils';
import SummaryCards from '@/components/SummaryCards';
import { MonthlyBarChart, CategoryPieChart, CategoryBreakdown } from '@/components/SpendingCharts';
import { CATEGORY_ICONS } from '@/types';

export default function DashboardPage() {
  const { expenses, isLoaded } = useExpenses();

  const stats = useMemo(() => computeStats(expenses), [expenses]);
  const categoryTotals = useMemo(() => computeCategoryTotals(expenses), [expenses]);
  const monthlyTotals = useMemo(() => computeMonthlyTotals(expenses), [expenses]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Overview of your spending patterns</p>
        </div>
        <button
          onClick={() => exportToCSV(expenses)}
          disabled={expenses.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ⬇ Export CSV
        </button>
      </div>

      {/* Summary cards */}
      <SummaryCards stats={stats} />

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly spending */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-1">
            Monthly Spending
          </h2>
          <p className="text-xs text-gray-400 mb-4">Last 6 months</p>
          <MonthlyBarChart data={monthlyTotals} />
        </div>

        {/* Category breakdown pie */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-1">
            Spending by Category
          </h2>
          <p className="text-xs text-gray-400 mb-4">Distribution of all expenses</p>
          <CategoryPieChart data={categoryTotals} />
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category breakdown bars */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">
            Category Breakdown
          </h2>
          <CategoryBreakdown data={categoryTotals} />
        </div>

        {/* Quick stats */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-800">Quick Stats</h2>

          <QuickStat
            label="Total Expenses"
            value={stats.expenseCount.toString()}
            suffix="recorded"
          />
          <QuickStat
            label="Average Expense"
            value={formatCurrency(stats.avgExpense)}
          />
          <QuickStat
            label="This Month"
            value={formatCurrency(stats.totalThisMonth)}
          />
          <QuickStat
            label="This Week"
            value={formatCurrency(stats.totalThisWeek)}
          />

          {stats.topCategory && (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Top Category</p>
              <p className="text-2xl mb-0.5">{CATEGORY_ICONS[stats.topCategory]}</p>
              <p className="text-sm font-semibold text-gray-800">{stats.topCategory}</p>
              <p className="text-xs text-gray-400">{formatCurrency(stats.topCategoryAmount)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Empty state */}
      {expenses.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-5xl mb-4">📊</p>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No data yet</h3>
          <p className="text-sm text-gray-400">
            Add some expenses on the{' '}
            <a href="/" className="text-blue-600 hover:underline">
              Expenses page
            </a>{' '}
            to see your dashboard.
          </p>
        </div>
      )}
    </div>
  );
}

function QuickStat({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className="text-lg font-bold text-gray-800">
        {value}
        {suffix && <span className="text-sm font-normal text-gray-500 ml-1">{suffix}</span>}
      </p>
    </div>
  );
}
