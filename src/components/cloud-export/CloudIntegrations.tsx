'use client';

import { useState } from 'react';
import { CloudIntegration, IntegrationId } from '@/types/cloudExport';
import { formatDate } from '@/utils';

interface Props {
  integrations: CloudIntegration[];
  onConnect: (id: IntegrationId) => Promise<void>;
  onDisconnect: (id: IntegrationId) => void;
}

export default function CloudIntegrations({ integrations, onConnect, onDisconnect }: Props) {
  const [confirmDisconnect, setConfirmDisconnect] = useState<IntegrationId | null>(null);

  const connected = integrations.filter((i) => i.status === 'connected');
  const available = integrations.filter((i) => i.status !== 'connected');

  return (
    <div className="space-y-6">
      {/* Live sync banner */}
      {connected.length > 0 && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-sm font-semibold text-emerald-800">
              {connected.length} service{connected.length !== 1 ? 's' : ''} connected
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {connected.map((i) => (
              <span
                key={i.id}
                className="inline-flex items-center gap-1.5 bg-white border border-emerald-200 text-emerald-700 text-xs font-medium px-2.5 py-1 rounded-full"
              >
                <span>{i.icon}</span>
                {i.name}
                <span className="text-emerald-400">✓</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Connected integrations */}
      {connected.length > 0 && (
        <section>
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
            Connected
          </h4>
          <div className="space-y-2">
            {connected.map((integration) => (
              <IntegrationCard
                key={integration.id}
                integration={integration}
                confirmingDisconnect={confirmDisconnect === integration.id}
                onConnect={onConnect}
                onDisconnect={() => {
                  onDisconnect(integration.id);
                  setConfirmDisconnect(null);
                }}
                onRequestDisconnect={() => setConfirmDisconnect(integration.id)}
                onCancelDisconnect={() => setConfirmDisconnect(null)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Available integrations */}
      <section>
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
          {connected.length > 0 ? 'Add more' : 'Available integrations'}
        </h4>
        <div className="space-y-2">
          {available.map((integration) => (
            <IntegrationCard
              key={integration.id}
              integration={integration}
              confirmingDisconnect={false}
              onConnect={onConnect}
              onDisconnect={() => {}}
              onRequestDisconnect={() => {}}
              onCancelDisconnect={() => {}}
            />
          ))}
        </div>
      </section>

      {/* Footer note */}
      <p className="text-xs text-center text-gray-400">
        🔐 Connections use OAuth 2.0. Your credentials are never stored here.
      </p>
    </div>
  );
}

function IntegrationCard({
  integration,
  confirmingDisconnect,
  onConnect,
  onDisconnect,
  onRequestDisconnect,
  onCancelDisconnect,
}: {
  integration: CloudIntegration;
  confirmingDisconnect: boolean;
  onConnect: (id: IntegrationId) => Promise<void>;
  onDisconnect: () => void;
  onRequestDisconnect: () => void;
  onCancelDisconnect: () => void;
}) {
  const isConnected = integration.status === 'connected';
  const isConnecting = integration.status === 'connecting';
  const isError = integration.status === 'error';

  return (
    <div className={`rounded-xl border bg-white p-4 transition-all ${
      isConnected ? 'border-gray-200 shadow-sm' : 'border-gray-100 hover:border-gray-200'
    }`}>
      <div className="flex items-center gap-3">
        {/* Brand icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 text-white font-bold"
          style={{ backgroundColor: integration.color }}
        >
          {integration.icon}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900 text-sm">{integration.name}</span>
            {integration.comingSoon && (
              <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">
                Soon
              </span>
            )}
            {isConnected && (
              <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-medium">
                ✓ Live
              </span>
            )}
          </div>
          {isConnected ? (
            <p className="text-xs text-gray-500 mt-0.5">
              {integration.connectedAccount}
              {integration.lastSync && (
                <span className="ml-2 text-emerald-600">
                  · synced {formatDate(integration.lastSync)}
                </span>
              )}
            </p>
          ) : (
            <p className="text-xs text-gray-400 mt-0.5">{integration.description}</p>
          )}
        </div>

        {/* Action button */}
        <div className="flex-shrink-0">
          {integration.comingSoon ? (
            <span className="text-xs text-gray-300 font-medium">Coming soon</span>
          ) : confirmingDisconnect ? (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-red-600">Disconnect?</span>
              <button
                onClick={onDisconnect}
                className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition"
              >
                Yes
              </button>
              <button
                onClick={onCancelDisconnect}
                className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300 transition"
              >
                No
              </button>
            </div>
          ) : isConnected ? (
            <button
              onClick={onRequestDisconnect}
              className="text-xs text-gray-400 hover:text-red-500 px-2 py-1 rounded-lg hover:bg-red-50 transition"
            >
              Disconnect
            </button>
          ) : isConnecting ? (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4A10 10 0 002 12h2z" />
              </svg>
              Connecting…
            </div>
          ) : (
            <button
              onClick={() => onConnect(integration.id)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border-2 transition hover:text-white"
              style={{
                borderColor: integration.color,
                color: integration.color,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = integration.color;
                (e.currentTarget as HTMLButtonElement).style.color = 'white';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                (e.currentTarget as HTMLButtonElement).style.color = integration.color;
              }}
            >
              Connect
            </button>
          )}
        </div>
      </div>

      {/* Feature pills - show for unconnected */}
      {!isConnected && !integration.comingSoon && (
        <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-50">
          {integration.features.map((f) => (
            <span
              key={f}
              className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full"
            >
              {f}
            </span>
          ))}
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="mt-2 text-xs text-red-500 flex items-center gap-1">
          ⚠ Connection failed.{' '}
          <button onClick={() => onConnect(integration.id)} className="underline">
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
