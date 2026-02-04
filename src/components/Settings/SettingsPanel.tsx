import React, { useEffect, useState } from 'react';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const MODEL_OPTIONS = [
  'GPT-4',
  'GPT-4o',
  'Claude 3.5 Sonnet',
  'Claude 3 Opus',
];

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const { aiModel, aiApiKey, setAiModel, setApiKey } = useSettingsStore();
  const [draftModel, setDraftModel] = useState(aiModel);
  const [draftKey, setDraftKey] = useState(aiApiKey);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDraftModel(aiModel);
      setDraftKey(aiApiKey);
      setStatus(null);
    }
  }, [isOpen, aiModel, aiApiKey]);

  const handleSave = () => {
    setAiModel(draftModel);
    setApiKey(draftKey);
    setStatus({ type: 'success', message: 'Settings saved to your browser.' });
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setStatus(null);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Connection test',
          sessionId: null,
          context: {},
          model: draftModel,
          apiKey: draftKey,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Unable to reach the chat service.');
      }

      setStatus({ type: 'success', message: 'Connection successful.' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Connection failed.';
      setStatus({ type: 'error', message });
    } finally {
      setIsTesting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <button
        type="button"
        aria-label="Close settings"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      <div className="relative ml-auto flex h-full w-full max-w-md flex-col border-l border-gray-800 bg-gray-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-800 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-white">AI Settings</h2>
            <p className="text-sm text-gray-400">Configure your model and credentials.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-800 hover:text-white"
            aria-label="Close settings panel"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-200">AI Model</label>
            <select
              value={draftModel}
              onChange={(event) => setDraftModel(event.target.value)}
              className="w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            >
              {MODEL_OPTIONS.map((option) => (
                <option key={option} value={option} className="bg-gray-800">
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-200">API Key</label>
            <input
              type="password"
              value={draftKey}
              onChange={(event) => setDraftKey(event.target.value)}
              placeholder="sk-..."
              className="w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-gray-100 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
            <p className="text-xs text-gray-500">Stored locally in your browser.</p>
          </div>

          {status && (
            <div
              className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${
                status.type === 'success'
                  ? 'border-emerald-700/60 bg-emerald-900/30 text-emerald-200'
                  : 'border-rose-700/60 bg-rose-900/30 text-rose-200'
              }`}
            >
              {status.type === 'success' ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4" />
              ) : (
                <AlertCircle className="mt-0.5 h-4 w-4" />
              )}
              <span>{status.message}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-gray-800 px-6 py-5">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting}
            className="w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-sm font-medium text-gray-200 transition hover:border-gray-600 hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isTesting ? 'Testing connection...' : 'Test connection'}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-blue-600 hover:to-purple-700"
          >
            Save settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
