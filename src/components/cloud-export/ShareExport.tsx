'use client';

import { useState } from 'react';
import { ShareLink } from '@/types/cloudExport';
import { Expense } from '@/types';
import { format, parseISO } from 'date-fns';

interface Props {
  expenses: Expense[];
  shareLinks: ShareLink[];
  onGenerate: (recordCount: number) => Promise<ShareLink>;
  onRevoke: (id: string) => void;
}

function QRCodeMockup({ value }: { value: string }) {
  // Deterministic pattern from the short code
  const seed = value.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const grid = Array.from({ length: 9 }, (_, row) =>
    Array.from({ length: 9 }, (_, col) => {
      // Always fill corners (finder patterns) for realism
      const cornerTL = row < 3 && col < 3;
      const cornerTR = row < 3 && col > 5;
      const cornerBL = row > 5 && col < 3;
      if (cornerTL || cornerTR || cornerBL) return true;
      return ((seed * (row + 1) * (col + 1)) % 7) > 3;
    })
  );

  return (
    <div className="inline-block p-2 bg-white border border-gray-200 rounded-xl shadow-sm">
      <div className="grid gap-0.5" style={{ gridTemplateColumns: 'repeat(9, 1fr)' }}>
        {grid.flat().map((filled, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-sm ${filled ? 'bg-gray-900' : 'bg-white'}`}
          />
        ))}
      </div>
    </div>
  );
}

function timeUntil(isoStr: string): string {
  const diff = new Date(isoStr).getTime() - Date.now();
  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h`;
  return 'soon';
}

export default function ShareExport({ expenses, shareLinks, onGenerate, onRevoke }: Props) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [newLink, setNewLink] = useState<ShareLink | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmRevoke, setConfirmRevoke] = useState<string | null>(null);

  async function handleGenerate() {
    setIsGenerating(true);
    setNewLink(null);
    try {
      const link = await onGenerate(expenses.length);
      setNewLink(link);
    } finally {
      setIsGenerating(false);
    }
  }

  function copyLink(link: ShareLink) {
    navigator.clipboard?.writeText(link.url).catch(() => {});
    setCopiedId(link.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500 via-rose-500 to-orange-500 p-5 text-white">
        <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-widest opacity-75 mb-1">Secure sharing</p>
          <h3 className="text-lg font-bold mb-1">Share your expense data</h3>
          <p className="text-sm opacity-80 leading-relaxed">
            Generate a secure, time-limited link. Share it with your accountant, partner,
            or team. No account required to view.
          </p>
        </div>
        <div className="absolute -right-4 -bottom-4 text-8xl opacity-10 select-none pointer-events-none">🔗</div>
      </div>

      {/* Generate button */}
      <div className="rounded-xl border-2 border-dashed border-pink-200 bg-pink-50 p-4 text-center">
        <p className="text-sm text-gray-600 mb-3">
          Creates a shareable link for all{' '}
          <strong className="text-gray-800">{expenses.length} expenses</strong>. Valid for 7 days.
        </p>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-pink-600 text-white text-sm font-semibold hover:bg-pink-700 disabled:opacity-50 transition shadow-md hover:shadow-lg"
        >
          {isGenerating ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4A10 10 0 002 12h2z" />
              </svg>
              Generating secure link…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Generate share link + QR code
            </>
          )}
        </button>
      </div>

      {/* Freshly generated link */}
      {newLink && (
        <div className="rounded-xl border border-pink-200 bg-white p-4 space-y-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-pink-500" />
            </span>
            <span className="text-sm font-semibold text-gray-800">New link created!</span>
            <span className="text-xs text-gray-400 ml-auto">
              Expires in {newLink.expiresAt ? timeUntil(newLink.expiresAt) : '∞'}
            </span>
          </div>

          <div className="flex gap-4 items-start">
            {/* QR code */}
            <QRCodeMockup value={newLink.shortCode} />

            {/* Link + copy */}
            <div className="flex-1 space-y-2">
              <div className="font-mono text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 break-all text-gray-600">
                {newLink.url}
              </div>
              <button
                onClick={() => copyLink(newLink)}
                className={`w-full py-2 rounded-lg text-sm font-semibold transition ${
                  copiedId === newLink.id
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-gray-800 text-white hover:bg-gray-700'
                }`}
              >
                {copiedId === newLink.id ? '✓ Copied!' : '📋 Copy link'}
              </button>
              <div className="flex gap-2">
                <span className="flex-1 text-center text-xs bg-blue-50 text-blue-600 py-1 rounded-lg">
                  {newLink.recordCount} records
                </span>
                <span className="flex-1 text-center text-xs bg-purple-50 text-purple-600 py-1 rounded-lg">
                  {newLink.format.toUpperCase()}
                </span>
                <span className="flex-1 text-center text-xs bg-green-50 text-green-600 py-1 rounded-lg">
                  Download OK
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Existing links */}
      {shareLinks.length > 0 && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
            Active links ({shareLinks.length})
          </h4>
          <div className="space-y-2">
            {shareLinks.map((link) => {
              const expired = link.expiresAt ? new Date(link.expiresAt) < new Date() : false;
              return (
                <div
                  key={link.id}
                  className={`rounded-xl border p-3 ${
                    expired ? 'border-gray-100 bg-gray-50 opacity-60' : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-xl">{expired ? '🔒' : '🔗'}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-gray-700 font-semibold">
                          /s/{link.shortCode}
                        </span>
                        {expired ? (
                          <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                            Expired
                          </span>
                        ) : (
                          <span className="text-xs bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5 flex gap-3">
                        <span>{link.recordCount} records</span>
                        <span>{link.viewCount} views</span>
                        {link.expiresAt && (
                          <span>
                            {expired
                              ? `Expired ${format(parseISO(link.expiresAt), 'MMM d')}`
                              : `Expires in ${timeUntil(link.expiresAt)}`}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      {!expired && (
                        <button
                          onClick={() => copyLink(link)}
                          className={`text-xs px-2 py-1 rounded transition ${
                            copiedId === link.id
                              ? 'bg-emerald-100 text-emerald-600'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {copiedId === link.id ? '✓' : '📋'}
                        </button>
                      )}
                      {confirmRevoke === link.id ? (
                        <>
                          <button
                            onClick={() => { onRevoke(link.id); setConfirmRevoke(null); }}
                            className="text-xs bg-red-500 text-white px-2 py-1 rounded"
                          >
                            Revoke
                          </button>
                          <button
                            onClick={() => setConfirmRevoke(null)}
                            className="text-xs text-gray-400 hover:text-gray-600 px-1"
                          >
                            ✕
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setConfirmRevoke(link.id)}
                          className="text-xs text-gray-300 hover:text-red-400 px-2 py-1 rounded transition"
                          title="Revoke link"
                        >
                          🗑
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Privacy note */}
      <div className="rounded-xl bg-gray-50 border border-gray-100 p-3 flex gap-2.5">
        <span className="text-lg flex-shrink-0">🔐</span>
        <div>
          <p className="text-xs font-semibold text-gray-700">Privacy & security</p>
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
            Links are read-only snapshots. They expire automatically. You can revoke any link
            at any time. Personal data is never shared without your explicit action.
          </p>
        </div>
      </div>
    </div>
  );
}
