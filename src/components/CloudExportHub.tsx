'use client';

import { useEffect, useCallback } from 'react';
import { Expense } from '@/types';
import { CloudExportTab } from '@/types/cloudExport';
import { useCloudExport } from '@/hooks/useCloudExport';
import ExportTemplates from './cloud-export/ExportTemplates';
import CloudIntegrations from './cloud-export/CloudIntegrations';
import ExportHistory from './cloud-export/ExportHistory';
import ScheduledExports from './cloud-export/ScheduledExports';
import ShareExport from './cloud-export/ShareExport';

interface Props {
  expenses: Expense[];
  isOpen: boolean;
  onClose: () => void;
}

// ─── Tab definitions ──────────────────────────────────────────────────────────

const TABS: {
  id: CloudExportTab;
  label: string;
  icon: string;
  description: string;
}[] = [
  { id: 'templates',    label: 'Templates',     icon: '⚡',  description: 'One-click report templates' },
  { id: 'integrations', label: 'Integrations',  icon: '🔌',  description: 'Connect cloud services' },
  { id: 'schedules',    label: 'Schedules',     icon: '🕐',  description: 'Recurring auto-exports' },
  { id: 'share',        label: 'Share',         icon: '🔗',  description: 'Links & QR codes' },
  { id: 'history',      label: 'History',       icon: '📋',  description: 'Past exports' },
];

// ─── Main component ───────────────────────────────────────────────────────────

export default function CloudExportHub({ expenses, isOpen, onClose }: Props) {
  const {
    state,
    setActiveTab,
    connectIntegration,
    disconnectIntegration,
    clearHistory,
    addSchedule,
    toggleSchedule,
    deleteSchedule,
    generateShareLink,
    revokeShareLink,
    runTemplateExport,
  } = useCloudExport();

  // Close on Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const connectedCount = state.integrations.filter((i) => i.status === 'connected').length;
  const activeScheduleCount = state.schedules.filter((s) => s.enabled).length;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Cloud Export Hub"
        className={`fixed inset-y-0 right-0 z-50 flex flex-col w-full max-w-lg bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* ── Drawer header ── */}
        <DrawerHeader
          onClose={onClose}
          connectedCount={connectedCount}
          activeScheduleCount={activeScheduleCount}
          historyCount={state.history.length}
        />

        {/* ── Tab bar ── */}
        <TabBar
          tabs={TABS}
          activeTab={state.activeTab}
          onSelect={setActiveTab}
          badges={{
            integrations: connectedCount > 0 ? connectedCount : undefined,
            schedules: activeScheduleCount > 0 ? activeScheduleCount : undefined,
            history: state.history.length > 0 ? state.history.length : undefined,
          }}
        />

        {/* ── Scrollable content ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5">
            {state.activeTab === 'templates' && (
              <ExportTemplates
                expenses={expenses}
                onRun={runTemplateExport}
              />
            )}
            {state.activeTab === 'integrations' && (
              <CloudIntegrations
                integrations={state.integrations}
                onConnect={connectIntegration}
                onDisconnect={disconnectIntegration}
              />
            )}
            {state.activeTab === 'history' && (
              <ExportHistory
                history={state.history}
                onClear={clearHistory}
              />
            )}
            {state.activeTab === 'schedules' && (
              <ScheduledExports
                schedules={state.schedules}
                onToggle={toggleSchedule}
                onDelete={deleteSchedule}
                onAdd={addSchedule}
              />
            )}
            {state.activeTab === 'share' && (
              <ShareExport
                expenses={expenses}
                shareLinks={state.shareLinks}
                onGenerate={generateShareLink}
                onRevoke={revokeShareLink}
              />
            )}
          </div>
        </div>

        {/* ── Drawer footer ── */}
        <DrawerFooter expenses={expenses} />
      </div>
    </>
  );
}

// ─── DrawerHeader ─────────────────────────────────────────────────────────────

function DrawerHeader({
  onClose,
  connectedCount,
  activeScheduleCount,
  historyCount,
}: {
  onClose: () => void;
  connectedCount: number;
  activeScheduleCount: number;
  historyCount: number;
}) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-5 py-4 flex-shrink-0">
      {/* Decorative orbs */}
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-violet-600 opacity-20 blur-2xl" />
      <div className="absolute -bottom-4 left-8 w-24 h-24 rounded-full bg-pink-500 opacity-15 blur-2xl" />

      <div className="relative flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">☁️</span>
            <h2 className="text-white font-bold text-lg">Cloud Export Hub</h2>
            <span className="text-xs bg-violet-500 text-white px-2 py-0.5 rounded-full font-semibold">
              v3
            </span>
          </div>
          <p className="text-slate-400 text-xs">
            Templates, integrations, schedules & sharing
          </p>

          {/* Live status pills */}
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {connectedCount > 0 && (
              <StatusPill color="emerald">
                <span className="relative flex h-1.5 w-1.5 mr-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                </span>
                {connectedCount} live
              </StatusPill>
            )}
            {activeScheduleCount > 0 && (
              <StatusPill color="violet">⏱ {activeScheduleCount} scheduled</StatusPill>
            )}
            {historyCount > 0 && (
              <StatusPill color="slate">{historyCount} exports</StatusPill>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition ml-4 flex-shrink-0"
          aria-label="Close drawer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function StatusPill({
  color,
  children,
}: {
  color: 'emerald' | 'violet' | 'slate';
  children: React.ReactNode;
}) {
  const styles: Record<string, string> = {
    emerald: 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/40',
    violet: 'bg-violet-900/60 text-violet-300 border border-violet-700/40',
    slate: 'bg-slate-700/60 text-slate-300 border border-slate-600/40',
  };
  return (
    <span
      className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${styles[color]}`}
    >
      {children}
    </span>
  );
}

// ─── TabBar ───────────────────────────────────────────────────────────────────

function TabBar({
  tabs,
  activeTab,
  onSelect,
  badges,
}: {
  tabs: typeof TABS;
  activeTab: CloudExportTab;
  onSelect: (t: CloudExportTab) => void;
  badges: Partial<Record<CloudExportTab, number>>;
}) {
  return (
    <div className="flex border-b border-gray-100 bg-white overflow-x-auto flex-shrink-0 scrollbar-hide">
      {tabs.map((tab) => {
        const active = tab.id === activeTab;
        const badge = badges[tab.id];
        return (
          <button
            key={tab.id}
            onClick={() => onSelect(tab.id)}
            className={`relative flex flex-col items-center gap-0.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap transition-colors border-b-2 ${
              active
                ? 'border-violet-600 text-violet-700 bg-violet-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="text-base leading-none">
              {tab.icon}
              {badge !== undefined && (
                <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-violet-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
            </span>
            <span className="text-[10px] leading-tight">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── DrawerFooter ─────────────────────────────────────────────────────────────

function DrawerFooter({ expenses }: { expenses: Expense[] }) {
  return (
    <div className="flex-shrink-0 border-t border-gray-100 bg-gray-50 px-5 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
        <span>{expenses.length} expenses available for export</span>
      </div>
      <span className="text-xs text-gray-300 font-mono">Cloud Export v3</span>
    </div>
  );
}
