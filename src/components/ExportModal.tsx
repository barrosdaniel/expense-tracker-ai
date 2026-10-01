'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Expense, Category, CATEGORIES, CATEGORY_ICONS, CATEGORY_BG_COLORS } from '@/types';
import { formatCurrency, formatDate } from '@/utils';
import { exportAsCSV, exportAsJSON, exportAsPDF } from '@/utils/exportUtils';
import { format } from 'date-fns';

// ─── Types ────────────────────────────────────────────────────────────────────

type ExportFormat = 'csv' | 'json' | 'pdf';

interface ExportConfig {
  format: ExportFormat;
  filename: string;
  dateFrom: string;
  dateTo: string;
  categories: Set<Category>;
}

interface Props {
  expenses: Expense[];
  isOpen: boolean;
  onClose: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FORMAT_INFO: Record<
  ExportFormat,
  { label: string; description: string; icon: string; color: string }
> = {
  csv: {
    label: 'CSV',
    description: 'Spreadsheet-compatible. Opens in Excel, Google Sheets.',
    icon: '📊',
    color: 'border-emerald-400 bg-emerald-50 text-emerald-700',
  },
  json: {
    label: 'JSON',
    description: 'Machine-readable. Perfect for developers & APIs.',
    icon: '{ }',
    color: 'border-blue-400 bg-blue-50 text-blue-700',
  },
  pdf: {
    label: 'PDF',
    description: 'Print-ready report. Opens in browser print dialog.',
    icon: '📄',
    color: 'border-red-400 bg-red-50 text-red-700',
  },
};

// ─── Main component ───────────────────────────────────────────────────────────

export default function ExportModal({ expenses, isOpen, onClose }: Props) {
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const [step, setStep] = useState<'configure' | 'preview'>('configure');
  const [isExporting, setIsExporting] = useState(false);
  const [exportDone, setExportDone] = useState(false);

  const [config, setConfig] = useState<ExportConfig>({
    format: 'csv',
    filename: `expenses_${todayStr}`,
    dateFrom: '',
    dateTo: '',
    categories: new Set(CATEGORIES),
  });

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setStep('configure');
      setExportDone(false);
      setIsExporting(false);
      setConfig({
        format: 'csv',
        filename: `expenses_${todayStr}`,
        dateFrom: '',
        dateTo: '',
        categories: new Set(CATEGORIES),
      });
    }
  }, [isOpen, todayStr]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // ─── Derived: filtered preview data ────────────────────────────────────────

  const previewExpenses = useMemo(() => {
    let result = [...expenses];

    if (config.dateFrom) {
      result = result.filter((e) => e.date >= config.dateFrom);
    }
    if (config.dateTo) {
      result = result.filter((e) => e.date <= config.dateTo);
    }
    if (config.categories.size < CATEGORIES.length) {
      result = result.filter((e) => config.categories.has(e.category));
    }

    return result;
  }, [expenses, config.dateFrom, config.dateTo, config.categories]);

  const totalAmount = useMemo(
    () => previewExpenses.reduce((s, e) => s + e.amount, 0),
    [previewExpenses]
  );

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const toggleCategory = useCallback((cat: Category) => {
    setConfig((prev) => {
      const next = new Set(prev.categories);
      if (next.has(cat)) {
        next.delete(cat);
      } else {
        next.add(cat);
      }
      return { ...prev, categories: next };
    });
  }, []);

  const toggleAllCategories = useCallback(() => {
    setConfig((prev) => ({
      ...prev,
      categories:
        prev.categories.size === CATEGORIES.length ? new Set() : new Set(CATEGORIES),
    }));
  }, []);

  const handleExport = useCallback(async () => {
    if (previewExpenses.length === 0) return;

    setIsExporting(true);
    // Small artificial delay to show loading state (feels professional)
    await new Promise((r) => setTimeout(r, 600));

    try {
      const fn = config.filename.trim() || `expenses_${todayStr}`;
      if (config.format === 'csv') exportAsCSV(previewExpenses, fn);
      else if (config.format === 'json') exportAsJSON(previewExpenses, fn);
      else exportAsPDF(previewExpenses, fn);

      setExportDone(true);
    } finally {
      setIsExporting(false);
    }
  }, [previewExpenses, config, todayStr]);

  if (!isOpen) return null;

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Export expenses"
    >
      {/* Scrim */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog panel */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* ── Header ── */}
        <ModalHeader step={step} onClose={onClose} />

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto">
          {step === 'configure' ? (
            <ConfigurePanel
              config={config}
              setConfig={setConfig}
              toggleCategory={toggleCategory}
              toggleAllCategories={toggleAllCategories}
              previewCount={previewExpenses.length}
              totalAmount={totalAmount}
            />
          ) : (
            <PreviewPanel
              expenses={previewExpenses}
              totalAmount={totalAmount}
              format={config.format}
            />
          )}
        </div>

        {/* ── Footer ── */}
        <ModalFooter
          step={step}
          previewCount={previewExpenses.length}
          isExporting={isExporting}
          exportDone={exportDone}
          format={config.format}
          onBack={() => setStep('configure')}
          onPreview={() => setStep('preview')}
          onExport={handleExport}
          onClose={onClose}
        />
      </div>
    </div>
  );
}

// ─── ModalHeader ──────────────────────────────────────────────────────────────

function ModalHeader({
  step,
  onClose,
}: {
  step: 'configure' | 'preview';
  onClose: () => void;
}) {
  return (
    <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Export Expenses</h2>
        <div className="flex items-center gap-2 mt-2">
          <StepBadge num={1} label="Configure" active={step === 'configure'} done={step === 'preview'} />
          <div className="w-8 h-px bg-gray-300" />
          <StepBadge num={2} label="Preview & Export" active={step === 'preview'} done={false} />
        </div>
      </div>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition ml-4 flex-shrink-0"
        aria-label="Close"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

function StepBadge({
  num,
  label,
  active,
  done,
}: {
  num: number;
  label: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
          done
            ? 'bg-emerald-500 text-white'
            : active
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-500'
        }`}
      >
        {done ? '✓' : num}
      </div>
      <span
        className={`text-sm font-medium ${
          active ? 'text-gray-900' : done ? 'text-emerald-600' : 'text-gray-400'
        }`}
      >
        {label}
      </span>
    </div>
  );
}

// ─── ConfigurePanel ───────────────────────────────────────────────────────────

function ConfigurePanel({
  config,
  setConfig,
  toggleCategory,
  toggleAllCategories,
  previewCount,
  totalAmount,
}: {
  config: ExportConfig;
  setConfig: React.Dispatch<React.SetStateAction<ExportConfig>>;
  toggleCategory: (cat: Category) => void;
  toggleAllCategories: () => void;
  previewCount: number;
  totalAmount: number;
}) {
  return (
    <div className="px-6 py-5 space-y-6">
      {/* Live summary banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-2xl">📦</div>
          <div>
            <p className="text-sm font-semibold text-gray-800">
              {previewCount} record{previewCount !== 1 ? 's' : ''} selected
            </p>
            <p className="text-xs text-gray-500">
              Total value: {formatCurrency(totalAmount)}
            </p>
          </div>
        </div>
        {previewCount === 0 && (
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
            No records match
          </span>
        )}
      </div>

      {/* 1. Format selection */}
      <section>
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
          Export Format
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {(Object.keys(FORMAT_INFO) as ExportFormat[]).map((fmt) => {
            const info = FORMAT_INFO[fmt];
            const selected = config.format === fmt;
            return (
              <button
                key={fmt}
                onClick={() => setConfig((p) => ({ ...p, format: fmt }))}
                className={`relative rounded-xl border-2 p-3 text-left transition-all hover:shadow-md ${
                  selected
                    ? info.color + ' shadow-sm'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                {selected && (
                  <div className="absolute top-2 right-2 w-4 h-4 bg-current rounded-full flex items-center justify-center opacity-70">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                <div className="font-mono font-bold text-lg mb-1">{info.icon}</div>
                <div className="font-semibold text-sm">{info.label}</div>
                <div className="text-xs opacity-70 mt-0.5 leading-snug">{info.description}</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Date range */}
      <section>
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
          Date Range
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={config.dateFrom}
              max={config.dateTo || undefined}
              onChange={(e) => setConfig((p) => ({ ...p, dateFrom: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={config.dateTo}
              min={config.dateFrom || undefined}
              onChange={(e) => setConfig((p) => ({ ...p, dateTo: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>
        {(config.dateFrom || config.dateTo) && (
          <button
            onClick={() => setConfig((p) => ({ ...p, dateFrom: '', dateTo: '' }))}
            className="mt-2 text-xs text-blue-500 hover:text-blue-700 hover:underline"
          >
            Clear date range
          </button>
        )}
      </section>

      {/* 3. Category filter */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
            Categories
          </h3>
          <button
            onClick={toggleAllCategories}
            className="text-xs text-blue-500 hover:text-blue-700 hover:underline font-medium"
          >
            {config.categories.size === CATEGORIES.length ? 'Deselect all' : 'Select all'}
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const selected = config.categories.has(cat);
            const bgClass = CATEGORY_BG_COLORS[cat];
            return (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 text-sm font-medium transition-all ${
                  selected
                    ? bgClass + ' border-transparent shadow-sm scale-105'
                    : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'
                }`}
              >
                <span>{CATEGORY_ICONS[cat]}</span>
                <span>{cat}</span>
                {selected && <span className="text-xs">✓</span>}
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. Filename */}
      <section>
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
          Filename
        </h3>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={config.filename}
              onChange={(e) => setConfig((p) => ({ ...p, filename: e.target.value }))}
              placeholder="expenses_export"
              maxLength={80}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-16"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-mono pointer-events-none">
              .{config.format}
            </span>
          </div>
        </div>
        <p className="mt-1.5 text-xs text-gray-400">
          Special characters will be replaced with dashes.
        </p>
      </section>
    </div>
  );
}

// ─── PreviewPanel ─────────────────────────────────────────────────────────────

function PreviewPanel({
  expenses,
  totalAmount,
  format: fmt,
}: {
  expenses: Expense[];
  totalAmount: number;
  format: ExportFormat;
}) {
  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="text-5xl mb-4">🔍</div>
        <p className="text-gray-700 font-medium">No records match your filters</p>
        <p className="text-gray-400 text-sm mt-1">Go back and adjust the date range or categories.</p>
      </div>
    );
  }

  return (
    <div className="px-6 py-5 space-y-4">
      {/* Summary row */}
      <div className="flex gap-3">
        {[
          { label: 'Records', value: String(expenses.length) },
          { label: 'Total', value: formatCurrency(totalAmount) },
          {
            label: 'Average',
            value: formatCurrency(totalAmount / expenses.length),
          },
          { label: 'Format', value: FORMAT_INFO[fmt].label },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="flex-1 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-center"
          >
            <div className="text-xs text-gray-500 mb-0.5">{label}</div>
            <div className="text-sm font-bold text-gray-800">{value}</div>
          </div>
        ))}
      </div>

      {/* Preview table */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto max-h-72">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="text-left px-3 py-2.5 text-xs font-semibold uppercase tracking-wider">
                  Date
                </th>
                <th className="text-right px-3 py-2.5 text-xs font-semibold uppercase tracking-wider">
                  Amount
                </th>
                <th className="text-left px-3 py-2.5 text-xs font-semibold uppercase tracking-wider">
                  Category
                </th>
                <th className="text-left px-3 py-2.5 text-xs font-semibold uppercase tracking-wider">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e, i) => (
                <tr
                  key={e.id}
                  className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                >
                  <td className="px-3 py-2 text-gray-500 text-xs whitespace-nowrap">
                    {formatDate(e.date)}
                  </td>
                  <td className="px-3 py-2 text-right font-semibold text-gray-800 tabular-nums whitespace-nowrap">
                    {formatCurrency(e.amount)}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_BG_COLORS[e.category]}`}
                    >
                      <span>{CATEGORY_ICONS[e.category]}</span>
                      {e.category}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-gray-600 max-w-[200px] truncate">
                    {e.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Table footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-3 py-2 flex justify-between text-xs font-semibold text-gray-700">
          <span>{expenses.length} row{expenses.length !== 1 ? 's' : ''}</span>
          <span>{formatCurrency(totalAmount)}</span>
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center">
        This is a preview of what will be exported. Scroll to see all records.
      </p>
    </div>
  );
}

// ─── ModalFooter ──────────────────────────────────────────────────────────────

function ModalFooter({
  step,
  previewCount,
  isExporting,
  exportDone,
  format: fmt,
  onBack,
  onPreview,
  onExport,
  onClose,
}: {
  step: 'configure' | 'preview';
  previewCount: number;
  isExporting: boolean;
  exportDone: boolean;
  format: ExportFormat;
  onBack: () => void;
  onPreview: () => void;
  onExport: () => void;
  onClose: () => void;
}) {
  return (
    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
      <button
        onClick={step === 'configure' ? onClose : onBack}
        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition"
      >
        {step === 'configure' ? 'Cancel' : '← Back'}
      </button>

      <div className="flex items-center gap-3">
        {exportDone && (
          <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium animate-pulse-once">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Export started!
          </span>
        )}

        {step === 'configure' ? (
          <button
            onClick={onPreview}
            disabled={previewCount === 0}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm hover:shadow-md"
          >
            Preview
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <button
            onClick={exportDone ? onClose : onExport}
            disabled={isExporting || previewCount === 0}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-white text-sm font-semibold transition shadow-sm hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed ${
              exportDone
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isExporting ? (
              <>
                <svg
                  className="w-4 h-4 animate-spin"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Exporting…
              </>
            ) : exportDone ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Close
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 3v12" />
                </svg>
                Export {previewCount} record{previewCount !== 1 ? 's' : ''} as {FORMAT_INFO[fmt].label}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
