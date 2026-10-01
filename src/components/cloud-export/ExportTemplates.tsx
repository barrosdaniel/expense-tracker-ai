'use client';

import { useState } from 'react';
import { Expense } from '@/types';
import { ExportTemplate, EXPORT_TEMPLATES, ExportHistoryEntry } from '@/types/cloudExport';

interface Props {
  expenses: Expense[];
  onRun: (
    templateId: string,
    templateName: string,
    destination: ExportHistoryEntry['destination'],
    format: ExportHistoryEntry['format'],
    recordCount: number,
    recipient?: string
  ) => Promise<void>;
}

const DATE_RANGE_LABELS: Record<ExportTemplate['dateRange'], string> = {
  this_month: 'This month',
  last_month: 'Last month',
  this_year: 'This year',
  last_year: 'Last year',
  all: 'All time',
  custom: 'Custom range',
};

const DEST_LABELS: Record<ExportHistoryEntry['destination'], string> = {
  download: '⬇ Download',
  email: '📧 Email',
  google_sheets: '📗 Sheets',
  dropbox: '📦 Dropbox',
  onedrive: '☁️ OneDrive',
  link: '🔗 Link',
};

export default function ExportTemplates({ expenses, onRun }: Props) {
  const [runningId, setRunningId] = useState<string | null>(null);
  const [doneId, setDoneId] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState('you@example.com');
  const [showEmailFor, setShowEmailFor] = useState<string | null>(null);

  async function handleRun(template: ExportTemplate) {
    if (runningId) return;

    if (template.defaultDestination === 'email' && !showEmailFor) {
      setShowEmailFor(template.id);
      return;
    }

    setShowEmailFor(null);
    setRunningId(template.id);

    // Compute record count based on template date range
    const now = new Date();
    let filtered = [...expenses];
    if (template.dateRange === 'this_month') {
      filtered = expenses.filter(
        (e) =>
          e.date.slice(0, 7) === now.toISOString().slice(0, 7)
      );
    } else if (template.dateRange === 'last_month') {
      const last = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      filtered = expenses.filter((e) => e.date.slice(0, 7) === last.toISOString().slice(0, 7));
    } else if (template.dateRange === 'this_year') {
      filtered = expenses.filter((e) => e.date.startsWith(String(now.getFullYear())));
    }

    if (template.includeCategories.length > 0) {
      filtered = filtered.filter((e) => template.includeCategories.includes(e.category));
    }

    await onRun(
      template.id,
      template.name,
      template.defaultDestination,
      template.defaultFormat,
      filtered.length,
      template.defaultDestination === 'email' ? emailInput : undefined
    );

    setRunningId(null);
    setDoneId(template.id);
    setTimeout(() => setDoneId(null), 2500);
  }

  const popular = EXPORT_TEMPLATES.filter((t) => t.popular);
  const rest = EXPORT_TEMPLATES.filter((t) => !t.popular);

  return (
    <div className="space-y-6">
      {/* Hero prompt */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-5 text-white">
        <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-widest opacity-75 mb-1">Smart Export</p>
          <h3 className="text-lg font-bold mb-1">One-click report templates</h3>
          <p className="text-sm opacity-80 leading-relaxed">
            Pre-configured exports tuned for real-world use cases. Pick one,
            review settings, and send it wherever you need.
          </p>
        </div>
        <div className="absolute -right-6 -top-6 text-8xl opacity-10 select-none pointer-events-none">
          📊
        </div>
      </div>

      {/* Popular */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
          ⭐ Popular templates
        </h4>
        <div className="grid grid-cols-1 gap-3">
          {popular.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              isRunning={runningId === t.id}
              isDone={doneId === t.id}
              showEmailInput={showEmailFor === t.id}
              emailInput={emailInput}
              onEmailChange={setEmailInput}
              onRun={handleRun}
            />
          ))}
        </div>
      </div>

      {/* More */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
          More templates
        </h4>
        <div className="grid grid-cols-1 gap-3">
          {rest.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              isRunning={runningId === t.id}
              isDone={doneId === t.id}
              showEmailInput={showEmailFor === t.id}
              emailInput={emailInput}
              onEmailChange={setEmailInput}
              onRun={handleRun}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function TemplateCard({
  template,
  isRunning,
  isDone,
  showEmailInput,
  emailInput,
  onEmailChange,
  onRun,
}: {
  template: ExportTemplate;
  isRunning: boolean;
  isDone: boolean;
  showEmailInput: boolean;
  emailInput: string;
  onEmailChange: (v: string) => void;
  onRun: (t: ExportTemplate) => void;
}) {
  const destLabel: Record<ExportHistoryEntry['destination'], string> = {
    download: '⬇ Download',
    email: '📧 Email',
    google_sheets: '📗 Sheets',
    dropbox: '📦 Dropbox',
    onedrive: '☁️ OneDrive',
    link: '🔗 Link',
  };

  return (
    <div
      className="group rounded-xl border border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm transition-all overflow-hidden"
      style={{ borderLeftColor: template.color, borderLeftWidth: 3 }}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ backgroundColor: template.color + '18' }}
          >
            {template.icon}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">{template.name}</h4>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                  {template.description}
                </p>
              </div>
              {/* Run button */}
              <button
                onClick={() => onRun(template)}
                disabled={isRunning}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isDone
                    ? 'bg-emerald-100 text-emerald-700'
                    : isRunning
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'text-white hover:opacity-90 active:scale-95'
                }`}
                style={!isDone && !isRunning ? { backgroundColor: template.color } : undefined}
              >
                {isRunning ? (
                  <>
                    <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4A10 10 0 002 12h2z" />
                    </svg>
                    Running…
                  </>
                ) : isDone ? (
                  '✓ Sent!'
                ) : (
                  'Run →'
                )}
              </button>
            </div>

            {/* Meta tags */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <MetaTag>{DATE_RANGE_LABELS[template.dateRange]}</MetaTag>
              <MetaTag>{template.defaultFormat.toUpperCase()}</MetaTag>
              <MetaTag>{destLabel[template.defaultDestination]}</MetaTag>
              {template.groupBy && <MetaTag>By {template.groupBy}</MetaTag>}
            </div>
          </div>
        </div>
      </div>

      {/* Email sub-panel */}
      {showEmailInput && (
        <div className="border-t border-gray-100 bg-red-50 px-4 py-3">
          <p className="text-xs text-gray-600 font-medium mb-2">📧 Send report to:</p>
          <div className="flex gap-2">
            <input
              type="email"
              value={emailInput}
              onChange={(e) => onEmailChange(e.target.value)}
              className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
              placeholder="you@example.com"
              autoFocus
            />
            <button
              onClick={() => onRun(template)}
              className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MetaTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-xs font-medium">
      {children}
    </span>
  );
}

// Suppress "unused" warnings for DATE_RANGE_LABELS/DEST_LABELS at module scope
void DATE_RANGE_LABELS;
void DEST_LABELS;
