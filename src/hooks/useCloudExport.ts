'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  CloudExportState,
  CloudExportTab,
  ExportHistoryEntry,
  IntegrationId,
  ScheduledExport,
  ShareLink,
  DEFAULT_INTEGRATIONS,
  SEED_HISTORY,
  SEED_SCHEDULES,
} from '@/types/cloudExport';

const STORAGE_KEY = 'expense_tracker_cloud_export_v3';

function loadState(): Partial<CloudExportState> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveState(state: CloudExportState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // silent
  }
}

export function useCloudExport() {
  const [state, setState] = useState<CloudExportState>(() => {
    const saved = loadState();
    return {
      history: saved.history ?? SEED_HISTORY,
      schedules: saved.schedules ?? SEED_SCHEDULES,
      integrations: saved.integrations ?? DEFAULT_INTEGRATIONS,
      shareLinks: saved.shareLinks ?? [],
      activeTab: 'templates',
    };
  });

  // Persist whenever state changes
  useEffect(() => {
    saveState(state);
  }, [state]);

  // ─── Tab navigation ──────────────────────────────────────────────────────

  const setActiveTab = useCallback((tab: CloudExportTab) => {
    setState((s) => ({ ...s, activeTab: tab }));
  }, []);

  // ─── Integrations ────────────────────────────────────────────────────────

  const connectIntegration = useCallback(
    async (id: IntegrationId): Promise<void> => {
      // Simulate "connecting" state
      setState((s) => ({
        ...s,
        integrations: s.integrations.map((i) =>
          i.id === id ? { ...i, status: 'connecting' } : i
        ),
      }));

      // Simulate OAuth round-trip (1.5 s)
      await new Promise((r) => setTimeout(r, 1500));

      const mockAccounts: Record<IntegrationId, string> = {
        google_sheets: 'daniel@gmail.com',
        gmail: 'daniel@gmail.com',
        dropbox: 'daniel@dropbox.com',
        onedrive: 'daniel@outlook.com',
        notion: 'daniel@notion.so',
        airtable: 'daniel@airtable.com',
        slack: 'daniel@slack.com',
      };

      setState((s) => ({
        ...s,
        integrations: s.integrations.map((i) =>
          i.id === id
            ? {
                ...i,
                status: 'connected',
                connectedAccount: mockAccounts[id],
                lastSync: new Date().toISOString(),
              }
            : i
        ),
      }));
    },
    []
  );

  const disconnectIntegration = useCallback((id: IntegrationId) => {
    setState((s) => ({
      ...s,
      integrations: s.integrations.map((i) =>
        i.id === id
          ? { ...i, status: 'disconnected', connectedAccount: undefined, lastSync: undefined }
          : i
      ),
    }));
  }, []);

  // ─── Export history ──────────────────────────────────────────────────────

  const addHistoryEntry = useCallback((entry: Omit<ExportHistoryEntry, 'id' | 'timestamp'>) => {
    const newEntry: ExportHistoryEntry = {
      ...entry,
      id: `h${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setState((s) => ({
      ...s,
      history: [newEntry, ...s.history],
    }));
  }, []);

  const clearHistory = useCallback(() => {
    setState((s) => ({ ...s, history: [] }));
  }, []);

  // ─── Scheduled exports ────────────────────────────────────────────────────

  const addSchedule = useCallback((schedule: Omit<ScheduledExport, 'id'>) => {
    setState((s) => ({
      ...s,
      schedules: [{ ...schedule, id: `sched_${Date.now()}` }, ...s.schedules],
    }));
  }, []);

  const toggleSchedule = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      schedules: s.schedules.map((sc) =>
        sc.id === id ? { ...sc, enabled: !sc.enabled } : sc
      ),
    }));
  }, []);

  const deleteSchedule = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      schedules: s.schedules.filter((sc) => sc.id !== id),
    }));
  }, []);

  // ─── Share links ──────────────────────────────────────────────────────────

  const generateShareLink = useCallback(
    async (recordCount: number): Promise<ShareLink> => {
      // Simulate server round-trip
      await new Promise((r) => setTimeout(r, 800));

      const shortCode = Math.random().toString(36).slice(2, 8).toUpperCase();
      const link: ShareLink = {
        id: `lnk_${Date.now()}`,
        shortCode,
        url: `https://expenses.app/s/${shortCode}`,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        viewCount: 0,
        isPasswordProtected: false,
        allowDownload: true,
        recordCount,
        format: 'csv',
      };

      setState((s) => ({
        ...s,
        shareLinks: [link, ...s.shareLinks],
      }));

      return link;
    },
    []
  );

  const revokeShareLink = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      shareLinks: s.shareLinks.filter((l) => l.id !== id),
    }));
  }, []);

  // ─── Simulate a template export ───────────────────────────────────────────

  const runTemplateExport = useCallback(
    async (
      templateId: string,
      templateName: string,
      destination: ExportHistoryEntry['destination'],
      format: ExportHistoryEntry['format'],
      recordCount: number,
      recipient?: string
    ): Promise<void> => {
      // Optimistically add a "processing" entry
      const processingId = `h${Date.now()}`;
      const processing: ExportHistoryEntry = {
        id: processingId,
        timestamp: new Date().toISOString(),
        templateId,
        templateName,
        destination,
        format,
        status: 'processing',
        recordCount,
        fileSizeKb: 0,
        recipient,
      };
      setState((s) => ({ ...s, history: [processing, ...s.history] }));

      // Simulate async export
      await new Promise((r) => setTimeout(r, 1200));

      setState((s) => ({
        ...s,
        history: s.history.map((h) =>
          h.id === processingId
            ? {
                ...h,
                status: 'success',
                fileSizeKb: Math.floor(recordCount * 0.8 + Math.random() * 50),
              }
            : h
        ),
      }));
    },
    []
  );

  return {
    state,
    setActiveTab,
    connectIntegration,
    disconnectIntegration,
    addHistoryEntry,
    clearHistory,
    addSchedule,
    toggleSchedule,
    deleteSchedule,
    generateShareLink,
    revokeShareLink,
    runTemplateExport,
  };
}
