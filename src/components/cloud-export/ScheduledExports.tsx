'use client';

import { useState } from 'react';
import { ScheduledExport, ScheduleFrequency, EXPORT_TEMPLATES } from '@/types/cloudExport';
import { format, parseISO } from 'date-fns';

interface Props {
  schedules: ScheduledExport[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: (schedule: Omit<ScheduledExport, 'id'>) => void;
}

const FREQ_LABELS: Record<ScheduleFrequency, string> = {
  daily: 'Every day',
  weekly: 'Every week',
  monthly: 'Every month',
};

const DEST_ICONS: Record<string, string> = {
  download: '⬇',
  email: '📧',
  google_sheets: '📗',
  dropbox: '📦',
  onedrive: '☁️',
  link: '🔗',
};

function formatNextRun(isoStr: string): string {
  try {
    return format(parseISO(isoStr), 'MMM d, h:mm a');
  } catch {
    return isoStr;
  }
}

export default function ScheduledExports({ schedules, onToggle, onDelete, onAdd }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [newSchedule, setNewSchedule] = useState({
    name: '',
    templateId: EXPORT_TEMPLATES[0].id,
    frequency: 'weekly' as ScheduleFrequency,
    time: '08:00',
    recipient: '',
    destination: 'email' as ScheduledExport['destination'],
    format: 'pdf' as ScheduledExport['format'],
    dayOfWeek: 'monday' as ScheduledExport['dayOfWeek'],
    dayOfMonth: 1,
  });

  function handleAdd() {
    if (!newSchedule.name.trim()) return;
    const template = EXPORT_TEMPLATES.find((t) => t.id === newSchedule.templateId);
    const nextRun = new Date();
    nextRun.setDate(nextRun.getDate() + 7);
    nextRun.setHours(parseInt(newSchedule.time.split(':')[0]), parseInt(newSchedule.time.split(':')[1]), 0, 0);

    onAdd({
      name: newSchedule.name.trim(),
      templateId: newSchedule.templateId,
      destination: newSchedule.destination,
      format: newSchedule.format,
      frequency: newSchedule.frequency,
      dayOfWeek: newSchedule.frequency === 'weekly' ? newSchedule.dayOfWeek : undefined,
      dayOfMonth: newSchedule.frequency === 'monthly' ? newSchedule.dayOfMonth : undefined,
      time: newSchedule.time,
      enabled: true,
      nextRun: nextRun.toISOString(),
      recipient: newSchedule.destination === 'email' ? newSchedule.recipient : undefined,
    });

    setNewSchedule({
      name: '',
      templateId: EXPORT_TEMPLATES[0].id,
      frequency: 'weekly',
      time: '08:00',
      recipient: '',
      destination: 'email',
      format: 'pdf',
      dayOfWeek: 'monday',
      dayOfMonth: 1,
    });
    setShowForm(false);

    void template; // suppress lint
  }

  const activeCount = schedules.filter((s) => s.enabled).length;

  return (
    <div className="space-y-4">
      {/* Header stats */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-800">
            {schedules.length === 0
              ? 'No schedules yet'
              : `${schedules.length} schedule${schedules.length !== 1 ? 's' : ''}`}
          </p>
          {schedules.length > 0 && (
            <p className="text-xs text-gray-400 mt-0.5">
              {activeCount} active · {schedules.length - activeCount} paused
            </p>
          )}
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition"
        >
          {showForm ? '✕ Cancel' : '+ New schedule'}
        </button>
      </div>

      {/* New schedule form */}
      {showForm && (
        <div className="rounded-xl border-2 border-dashed border-purple-200 bg-purple-50 p-4 space-y-3">
          <h4 className="text-sm font-semibold text-purple-800">New recurring export</h4>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Schedule name</label>
            <input
              type="text"
              value={newSchedule.name}
              onChange={(e) => setNewSchedule((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Monthly Email Report"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Template</label>
              <select
                value={newSchedule.templateId}
                onChange={(e) => setNewSchedule((p) => ({ ...p, templateId: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-2 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                {EXPORT_TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.icon} {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Frequency</label>
              <select
                value={newSchedule.frequency}
                onChange={(e) =>
                  setNewSchedule((p) => ({ ...p, frequency: e.target.value as ScheduleFrequency }))
                }
                className="w-full rounded-lg border border-gray-200 px-2 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Send to</label>
              <select
                value={newSchedule.destination}
                onChange={(e) =>
                  setNewSchedule((p) => ({ ...p, destination: e.target.value as ScheduledExport['destination'] }))
                }
                className="w-full rounded-lg border border-gray-200 px-2 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="email">📧 Email</option>
                <option value="dropbox">📦 Dropbox</option>
                <option value="google_sheets">📗 Sheets</option>
                <option value="onedrive">☁️ OneDrive</option>
                <option value="download">⬇ Download</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Time</label>
              <input
                type="time"
                value={newSchedule.time}
                onChange={(e) => setNewSchedule((p) => ({ ...p, time: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-2 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
          </div>

          {newSchedule.destination === 'email' && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Recipient email
              </label>
              <input
                type="email"
                value={newSchedule.recipient}
                onChange={(e) => setNewSchedule((p) => ({ ...p, recipient: e.target.value }))}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
          )}

          <button
            onClick={handleAdd}
            disabled={!newSchedule.name.trim()}
            className="w-full py-2 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Create schedule
          </button>
        </div>
      )}

      {/* Schedule list */}
      {schedules.length === 0 && !showForm ? (
        <div className="text-center py-10 text-gray-400">
          <div className="text-4xl mb-3">🕐</div>
          <p className="text-sm">No schedules set up yet.</p>
          <p className="text-xs mt-1">Create one to automatically export your data on a recurring basis.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {schedules.map((schedule) => (
            <div
              key={schedule.id}
              className={`rounded-xl border p-3 transition ${
                schedule.enabled
                  ? 'border-gray-200 bg-white'
                  : 'border-gray-100 bg-gray-50 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Toggle */}
                <button
                  onClick={() => onToggle(schedule.id)}
                  title={schedule.enabled ? 'Pause' : 'Resume'}
                  className={`relative mt-0.5 flex-shrink-0 w-9 h-5 rounded-full transition-colors ${
                    schedule.enabled ? 'bg-purple-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      schedule.enabled ? 'translate-x-4' : 'translate-x-0.5'
                    }`}
                  />
                </button>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-800">{schedule.name}</span>
                    <span className="text-xs text-gray-400">
                      {DEST_ICONS[schedule.destination]}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5 text-xs text-gray-400">
                    <span>{FREQ_LABELS[schedule.frequency]}</span>
                    <span>at {schedule.time}</span>
                    {schedule.recipient && <span>→ {schedule.recipient}</span>}
                    {schedule.enabled && (
                      <span className="text-purple-500">
                        Next: {formatNextRun(schedule.nextRun)}
                      </span>
                    )}
                    {schedule.lastRun && (
                      <span>Last: {formatNextRun(schedule.lastRun)}</span>
                    )}
                  </div>
                </div>

                {/* Delete */}
                {confirmDelete === schedule.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => { onDelete(schedule.id); setConfirmDelete(null); }}
                      className="text-xs bg-red-500 text-white px-2 py-0.5 rounded"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="text-xs text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(schedule.id)}
                    className="text-gray-300 hover:text-red-400 transition text-xs p-1"
                  >
                    🗑
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
