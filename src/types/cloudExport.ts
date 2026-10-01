/**
 * Cloud Export V3 — TypeScript types for the entire cloud integration layer.
 */

// ─── Export History ──────────────────────────────────────────────────────────

export type ExportStatus = 'success' | 'pending' | 'failed' | 'processing';
export type ExportDestination =
  | 'download'
  | 'email'
  | 'google_sheets'
  | 'dropbox'
  | 'onedrive'
  | 'link';
export type ExportFormat = 'csv' | 'json' | 'pdf' | 'xlsx';

export interface ExportHistoryEntry {
  id: string;
  timestamp: string;          // ISO
  templateId: string | null;
  templateName: string;
  destination: ExportDestination;
  format: ExportFormat;
  status: ExportStatus;
  recordCount: number;
  fileSizeKb: number;
  shareLink?: string;
  recipient?: string;         // email
  sheetUrl?: string;          // google sheets
}

// ─── Export Templates ────────────────────────────────────────────────────────

export type TemplateCategory = 'tax' | 'summary' | 'analysis' | 'custom';

export interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: TemplateCategory;
  defaultFormat: ExportFormat;
  defaultDestination: ExportDestination;
  includeCategories: string[];  // empty = all
  dateRange: 'this_month' | 'last_month' | 'this_year' | 'last_year' | 'all' | 'custom';
  groupBy?: 'category' | 'month' | 'week';
  includeCharts: boolean;
  fields: string[];
  color: string;
  popular: boolean;
}

// ─── Cloud Integrations ──────────────────────────────────────────────────────

export type IntegrationStatus = 'connected' | 'disconnected' | 'connecting' | 'error';
export type IntegrationId =
  | 'google_sheets'
  | 'dropbox'
  | 'onedrive'
  | 'gmail'
  | 'slack'
  | 'airtable'
  | 'notion';

export interface CloudIntegration {
  id: IntegrationId;
  name: string;
  description: string;
  icon: string;           // emoji or image url
  status: IntegrationStatus;
  connectedAccount?: string;
  lastSync?: string;      // ISO
  color: string;          // brand color hex
  features: string[];
  comingSoon?: boolean;
}

// ─── Scheduled Export ────────────────────────────────────────────────────────

export type ScheduleFrequency = 'daily' | 'weekly' | 'monthly';
export type ScheduleDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface ScheduledExport {
  id: string;
  name: string;
  templateId: string;
  destination: ExportDestination;
  format: ExportFormat;
  frequency: ScheduleFrequency;
  dayOfWeek?: ScheduleDay;  // for weekly
  dayOfMonth?: number;      // 1-28, for monthly
  time: string;             // "HH:MM"
  enabled: boolean;
  nextRun: string;          // ISO
  lastRun?: string;         // ISO
  recipient?: string;
}

// ─── Share Link ───────────────────────────────────────────────────────────────

export interface ShareLink {
  id: string;
  url: string;
  shortCode: string;
  createdAt: string;
  expiresAt: string | null;
  viewCount: number;
  isPasswordProtected: boolean;
  allowDownload: boolean;
  recordCount: number;
  format: ExportFormat;
}

// ─── Hook State ──────────────────────────────────────────────────────────────

export interface CloudExportState {
  history: ExportHistoryEntry[];
  schedules: ScheduledExport[];
  integrations: CloudIntegration[];
  shareLinks: ShareLink[];
  activeTab: CloudExportTab;
}

export type CloudExportTab = 'templates' | 'integrations' | 'history' | 'schedules' | 'share';

// ─── Mock seed data ───────────────────────────────────────────────────────────

export const EXPORT_TEMPLATES: ExportTemplate[] = [
  {
    id: 'tax-report',
    name: 'Tax Report',
    description: 'IRS-ready annual summary with deductible categories, totals by month, and formatted notes.',
    icon: '🧾',
    category: 'tax',
    defaultFormat: 'pdf',
    defaultDestination: 'download',
    includeCategories: ['Bills', 'Other'],
    dateRange: 'this_year',
    groupBy: 'month',
    includeCharts: true,
    fields: ['date', 'amount', 'category', 'description', 'receipt_note'],
    color: '#ef4444',
    popular: true,
  },
  {
    id: 'monthly-summary',
    name: 'Monthly Summary',
    description: "Clean overview of last month's spending with category breakdown and trend indicators.",
    icon: '📅',
    category: 'summary',
    defaultFormat: 'pdf',
    defaultDestination: 'email',
    includeCategories: [],
    dateRange: 'last_month',
    groupBy: 'category',
    includeCharts: true,
    fields: ['date', 'amount', 'category', 'description'],
    color: '#3b82f6',
    popular: true,
  },
  {
    id: 'category-analysis',
    name: 'Category Analysis',
    description: 'Deep-dive into spending patterns by category with percentage breakdowns and averages.',
    icon: '📊',
    category: 'analysis',
    defaultFormat: 'xlsx',
    defaultDestination: 'google_sheets',
    includeCategories: [],
    dateRange: 'last_month',
    groupBy: 'category',
    includeCharts: true,
    fields: ['category', 'total', 'count', 'average', 'percentage', 'trend'],
    color: '#8b5cf6',
    popular: false,
  },
  {
    id: 'budget-tracker',
    name: 'Budget Tracker',
    description: 'Export raw data to Sheets and track against budget targets in real time.',
    icon: '💰',
    category: 'analysis',
    defaultFormat: 'csv',
    defaultDestination: 'google_sheets',
    includeCategories: [],
    dateRange: 'this_month',
    groupBy: undefined,
    includeCharts: false,
    fields: ['date', 'amount', 'category', 'description'],
    color: '#10b981',
    popular: false,
  },
  {
    id: 'expense-backup',
    name: 'Full Data Backup',
    description: 'Complete JSON backup of all expense data. Perfect for migrating or safe-keeping.',
    icon: '☁️',
    category: 'custom',
    defaultFormat: 'json',
    defaultDestination: 'dropbox',
    includeCategories: [],
    dateRange: 'all',
    groupBy: undefined,
    includeCharts: false,
    fields: ['id', 'date', 'amount', 'category', 'description', 'createdAt', 'updatedAt'],
    color: '#0061ff',
    popular: false,
  },
  {
    id: 'weekly-digest',
    name: 'Weekly Digest',
    description: 'Auto-send a brief weekly summary to your inbox every Monday morning.',
    icon: '📬',
    category: 'summary',
    defaultFormat: 'pdf',
    defaultDestination: 'email',
    includeCategories: [],
    dateRange: 'last_month',
    groupBy: 'week',
    includeCharts: false,
    fields: ['date', 'amount', 'category', 'description'],
    color: '#f97316',
    popular: false,
  },
];

export const DEFAULT_INTEGRATIONS: CloudIntegration[] = [
  {
    id: 'google_sheets',
    name: 'Google Sheets',
    description: 'Sync expenses to a live spreadsheet. Auto-updates with every new entry.',
    icon: '📗',
    status: 'disconnected',
    color: '#34a853',
    features: ['Live sync', 'Two-way edit', 'Formula support', 'Charts'],
  },
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Send export reports directly to any email address, including yourself.',
    icon: '📧',
    status: 'disconnected',
    color: '#ea4335',
    features: ['PDF attachments', 'Scheduled sends', 'Custom subject', 'CC support'],
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    description: 'Automatically back up exports to a dedicated /ExpenseTracker folder.',
    icon: '📦',
    status: 'disconnected',
    color: '#0061ff',
    features: ['Auto-backup', 'Version history', 'File sharing', 'Offline access'],
  },
  {
    id: 'onedrive',
    name: 'OneDrive',
    description: 'Save exports to Microsoft OneDrive and access them from any device.',
    icon: '☁️',
    status: 'disconnected',
    color: '#0078d4',
    features: ['Office 365 sync', 'Auto-save', 'Share links', 'Mobile access'],
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Push expenses as a Notion database — filter, sort, and build dashboards.',
    icon: '⬛',
    status: 'disconnected',
    color: '#000000',
    features: ['Database sync', 'Custom views', 'Page templates', 'Team sharing'],
    comingSoon: true,
  },
  {
    id: 'airtable',
    name: 'Airtable',
    description: 'Send expenses to an Airtable base with rich field types and gallery views.',
    icon: '🗂️',
    status: 'disconnected',
    color: '#fcb400',
    features: ['Rich fields', 'Gallery view', 'Automations', 'API access'],
    comingSoon: true,
  },
];

export const SEED_HISTORY: ExportHistoryEntry[] = [
  {
    id: 'h1',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    templateId: 'monthly-summary',
    templateName: 'Monthly Summary',
    destination: 'email',
    format: 'pdf',
    status: 'success',
    recordCount: 23,
    fileSizeKb: 84,
    recipient: 'you@example.com',
  },
  {
    id: 'h2',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    templateId: 'category-analysis',
    templateName: 'Category Analysis',
    destination: 'google_sheets',
    format: 'csv',
    status: 'success',
    recordCount: 47,
    fileSizeKb: 12,
    sheetUrl: 'https://docs.google.com/spreadsheets/d/mock-id',
  },
  {
    id: 'h3',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    templateId: 'expense-backup',
    templateName: 'Full Data Backup',
    destination: 'dropbox',
    format: 'json',
    status: 'success',
    recordCount: 89,
    fileSizeKb: 48,
  },
  {
    id: 'h4',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    templateId: 'tax-report',
    templateName: 'Tax Report',
    destination: 'download',
    format: 'pdf',
    status: 'success',
    recordCount: 156,
    fileSizeKb: 320,
  },
  {
    id: 'h5',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    templateId: null,
    templateName: 'Custom Export',
    destination: 'link',
    format: 'csv',
    status: 'failed',
    recordCount: 0,
    fileSizeKb: 0,
    shareLink: undefined,
  },
];

export const SEED_SCHEDULES: ScheduledExport[] = [
  {
    id: 's1',
    name: 'Monthly Report Email',
    templateId: 'monthly-summary',
    destination: 'email',
    format: 'pdf',
    frequency: 'monthly',
    dayOfMonth: 1,
    time: '08:00',
    enabled: true,
    nextRun: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1, 8, 0).toISOString(),
    lastRun: new Date(new Date().getFullYear(), new Date().getMonth(), 1, 8, 0).toISOString(),
    recipient: 'you@example.com',
  },
  {
    id: 's2',
    name: 'Weekly Dropbox Backup',
    templateId: 'expense-backup',
    destination: 'dropbox',
    format: 'json',
    frequency: 'weekly',
    dayOfWeek: 'monday',
    time: '02:00',
    enabled: false,
    nextRun: (() => {
      const d = new Date();
      d.setDate(d.getDate() + ((1 - d.getDay() + 7) % 7 || 7));
      d.setHours(2, 0, 0, 0);
      return d.toISOString();
    })(),
  },
];
