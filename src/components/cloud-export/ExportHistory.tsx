'use client';

import { ExportHistoryEntry, ExportStatus } from '@/types/cloudExport';

interface Props {
  history: ExportHistoryEntry[];
  onClear: () => void;
}

const DEST_ICONS: Record<ExportHistoryEntry['destination'], string> = {
  download: '⬇',
  email: '📧',
  google_sheets: '📗',
  dropbox: '📦',
  onedrive: '☁️',
  link: '🔗',
};

const DEST_LABELS: Record<ExportHistoryEntry['destination'], string> = {
  download: 'Downloaded',
  email: 'Emailed',
  google_sheets: 'Google Sheets',
  dropbox: 'Dropbox',
  onedrive: 'OneDrive',
  link: 'Share link',
};

const FORMAT_COLORS: Record<string, string> = {
  csv: 'bg-emerald-100 text-emerald-700',
  json: 'bg-blue-100 text-blue-700',
  pdf: 'bg-red-100 text-red-700',
  xlsx: 'bg-green-100 text-green-700',
};

function formatRelativeTime(isoStr: string): string {
  const diff = Date.now() - new Date(isoStr).getTime();
  const m = Math.floor(diff / 60_000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${d}d ago`;
}

function StatusBadge({ status }: { status: ExportStatus }) {
  const styles: Record<ExportStatus, string> = {
    success: 'bg-emerald-100 text-emerald-700',
    failed: 'bg-red-100 text-red-600',
    pending: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-600',
  };
  const labels: Record<ExportStatus, string> = {
    success: '✓ Success',
    failed: '✗ Failed',
    pending: '⏳ Pending',
    processing: '⚙ Processing',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${styles[status]}`}>
      {status === 'processing' && (
        <svg className="w-2.5 h-2.5 mr-1 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4A10 10 0 002 12h2z" />
        </svg>
      )}
      {labels[status]}
    </span>
  );
}

export default function ExportHistory({ history, onClear }: Props) {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-4">
        <div className="text-5xl mb-4">📭</div>
        <p className="font-semibold text-gray-700">No export history yet</p>
        <p className="text-sm text-gray-400 mt-1">
          Run a template or send an export to see your history here.
        </p>
      </div>
    );
  }

  const successCount = history.filter((h) => h.status === 'success').length;
  const totalRecords = history.filter((h) => h.status === 'success').reduce((s, h) => s + h.recordCount, 0);

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Total exports', value: String(history.length) },
          { label: 'Successful', value: String(successCount) },
          { label: 'Records sent', value: String(totalRecords) },
        ].map(({ label, value }) => (
          <div key={label} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
            <div className="text-lg font-bold text-gray-800">{value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* List header */}
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
          Recent exports
        </h4>
        <button
          onClick={onClear}
          className="text-xs text-gray-400 hover:text-red-500 hover:underline transition"
        >
          Clear history
        </button>
      </div>

      {/* History entries */}
      <div className="space-y-2">
        {history.map((entry) => (
          <div
            key={entry.id}
            className="rounded-xl border border-gray-100 bg-white p-3 hover:border-gray-200 transition"
          >
            <div className="flex items-start gap-3">
              {/* Dest icon */}
              <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-base flex-shrink-0">
                {DEST_ICONS[entry.destination]}
              </div>

              {/* Main info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center flex-wrap gap-1.5 mb-1">
                  <span className="font-medium text-gray-800 text-sm truncate max-w-[140px]">
                    {entry.templateName}
                  </span>
                  <StatusBadge status={entry.status} />
                  <span
                    className={`text-xs font-semibold px-1.5 py-0.5 rounded uppercase ${
                      FORMAT_COLORS[entry.format] ?? 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {entry.format}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-400">
                  <span>{DEST_LABELS[entry.destination]}</span>
                  {entry.status === 'success' && (
                    <>
                      <span>{entry.recordCount} records</span>
                      <span>{entry.fileSizeKb} KB</span>
                    </>
                  )}
                  {entry.recipient && <span>→ {entry.recipient}</span>}
                  <span className="ml-auto text-right">{formatRelativeTime(entry.timestamp)}</span>
                </div>
              </div>
            </div>

            {/* Quick actions for successful exports */}
            {entry.status === 'success' && (
              <div className="mt-2 pt-2 border-t border-gray-50 flex gap-3">
                {entry.destination === 'download' && (
                  <button className="text-xs text-blue-500 hover:text-blue-700 hover:underline">
                    Re-download
                  </button>
                )}
                {entry.sheetUrl && (
                  <a
                    href={entry.sheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-emerald-600 hover:underline"
                  >
                    Open in Sheets ↗
                  </a>
                )}
                {entry.shareLink && (
                  <button
                    onClick={() => navigator.clipboard?.writeText(entry.shareLink!)}
                    className="text-xs text-purple-500 hover:text-purple-700 hover:underline"
                  >
                    Copy link
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
