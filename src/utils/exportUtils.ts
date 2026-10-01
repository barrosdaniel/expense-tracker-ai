/**
 * Advanced export utilities for Version 2.
 * Supports CSV, JSON, and PDF (via HTML canvas / print) formats,
 * all with a custom filename and the full Expense data set.
 */

import { format, parseISO } from 'date-fns';
import { Expense } from '@/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function sanitizeFilename(name: string, ext: string): string {
  // Strip illegal characters and append extension
  const safe = name.trim().replace(/[/\\?%*:|"<>]/g, '-').replace(/\s+/g, '_') || 'expenses';
  return safe.endsWith(`.${ext}`) ? safe : `${safe}.${ext}`;
}

// ─── CSV ──────────────────────────────────────────────────────────────────────

export function exportAsCSV(expenses: Expense[], filename: string): void {
  const headers = ['Date', 'Amount (USD)', 'Category', 'Description', 'Created At'];

  const rows = expenses.map((e) => [
    e.date,
    e.amount.toFixed(2),
    e.category,
    `"${e.description.replace(/"/g, '""')}"`,
    format(parseISO(e.createdAt), 'yyyy-MM-dd HH:mm:ss'),
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, sanitizeFilename(filename, 'csv'));
}

// ─── JSON ─────────────────────────────────────────────────────────────────────

export function exportAsJSON(expenses: Expense[], filename: string): void {
  const payload = {
    exportedAt: new Date().toISOString(),
    totalRecords: expenses.length,
    totalAmount: parseFloat(expenses.reduce((s, e) => s + e.amount, 0).toFixed(2)),
    expenses: expenses.map((e) => ({
      id: e.id,
      date: e.date,
      amount: e.amount,
      category: e.category,
      description: e.description,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    })),
  };

  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
  triggerDownload(blob, sanitizeFilename(filename, 'json'));
}

// ─── PDF ─────────────────────────────────────────────────────────────────────
// We generate a self-contained HTML document and open it in a new tab so the
// user can use the browser's native Print → Save as PDF.  No external PDF
// library needed – works everywhere.

export function exportAsPDF(expenses: Expense[], filename: string): void {
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const generatedAt = format(new Date(), 'MMMM d, yyyy HH:mm');

  const categoryColors: Record<string, string> = {
    Food: '#f97316',
    Transportation: '#3b82f6',
    Entertainment: '#a855f7',
    Shopping: '#ec4899',
    Bills: '#ef4444',
    Other: '#6b7280',
  };

  const rows = expenses
    .map(
      (e) => `
    <tr>
      <td>${e.date}</td>
      <td style="text-align:right; font-weight:600;">$${e.amount.toFixed(2)}</td>
      <td>
        <span style="
          background:${categoryColors[e.category] ?? '#6b7280'}22;
          color:${categoryColors[e.category] ?? '#6b7280'};
          padding:2px 8px;
          border-radius:999px;
          font-size:11px;
          font-weight:600;
          letter-spacing:0.02em;
        ">${e.category}</span>
      </td>
      <td style="color:#374151;">${e.description}</td>
    </tr>`
    )
    .join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${filename}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #111827; padding: 40px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; }
    .header h1 { font-size: 24px; font-weight: 700; color: #1d4ed8; }
    .header .meta { font-size: 12px; color: #6b7280; text-align: right; }
    .stats { display: flex; gap: 24px; margin-bottom: 28px; }
    .stat { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px 20px; flex: 1; }
    .stat .label { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
    .stat .value { font-size: 20px; font-weight: 700; color: #111827; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    thead tr { background: #1d4ed8; color: white; }
    thead th { padding: 10px 12px; text-align: left; font-weight: 600; letter-spacing: 0.03em; font-size: 11px; text-transform: uppercase; }
    tbody tr { border-bottom: 1px solid #f3f4f6; }
    tbody tr:nth-child(even) { background: #f9fafb; }
    tbody td { padding: 9px 12px; vertical-align: middle; }
    tfoot tr { background: #f3f4f6; font-weight: 700; border-top: 2px solid #e5e7eb; }
    tfoot td { padding: 10px 12px; }
    .footer { margin-top: 24px; font-size: 11px; color: #9ca3af; text-align: center; }
    @media print {
      body { padding: 20px; }
      @page { margin: 1cm; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>💰 Expense Report</h1>
      <p style="font-size:13px; color:#6b7280; margin-top:4px;">${filename}</p>
    </div>
    <div class="meta">
      <div>Generated: ${generatedAt}</div>
      <div style="margin-top:4px;">${expenses.length} record${expenses.length !== 1 ? 's' : ''}</div>
    </div>
  </div>

  <div class="stats">
    <div class="stat">
      <div class="label">Total Records</div>
      <div class="value">${expenses.length}</div>
    </div>
    <div class="stat">
      <div class="label">Total Amount</div>
      <div class="value">$${total.toFixed(2)}</div>
    </div>
    <div class="stat">
      <div class="label">Average Expense</div>
      <div class="value">$${expenses.length > 0 ? (total / expenses.length).toFixed(2) : '0.00'}</div>
    </div>
    <div class="stat">
      <div class="label">Date Range</div>
      <div class="value" style="font-size:13px;">${
        expenses.length > 0
          ? `${expenses[expenses.length - 1].date} → ${expenses[0].date}`
          : '—'
      }</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:110px;">Date</th>
        <th style="width:100px; text-align:right;">Amount</th>
        <th style="width:130px;">Category</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
    <tfoot>
      <tr>
        <td colspan="1">Total</td>
        <td style="text-align:right;">$${total.toFixed(2)}</td>
        <td colspan="2">${expenses.length} expense${expenses.length !== 1 ? 's' : ''}</td>
      </tr>
    </tfoot>
  </table>

  <div class="footer">Expense Tracker • Exported on ${generatedAt}</div>

  <script>
    // Auto-trigger print dialog for Save as PDF
    window.onload = function() { window.print(); };
  </script>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
