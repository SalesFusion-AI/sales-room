import React, { useEffect, useState, memo, useCallback, useMemo } from 'react';
import { X, CheckCircle2, AlertCircle, Play } from 'lucide-react';
import { useAiModel, useAiApiKey, useSettingsActions } from '../../store/settingsStore';
import { useChatActions } from '../../store/chatStore';

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
  const aiModel = useAiModel();
  const aiApiKey = useAiApiKey();
  const { setAiModel, setApiKey } = useSettingsActions();
  const { loadDemoScenario } = useChatActions();
  const [draftModel, setDraftModel] = useState(aiModel);
  const [draftKey, setDraftKey] = useState(aiApiKey);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDraftModel(aiModel);
      setDraftKey(aiApiKey);
      setStatus(null);
    }
  }, [isOpen, aiModel, aiApiKey]);

  const handleSave = useCallback(() => {
    setAiModel(draftModel);
    setApiKey(draftKey);
    setStatus({ type: 'success', message: 'Settings saved to your browser.' });
  }, [draftModel, draftKey, setAiModel, setApiKey]);

  const handleTestConnection = useCallback(async () => {
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
  }, [draftModel, draftKey]);

  const handleLoadDemo = useCallback(async () => {
    setIsLoadingDemo(true);
    setStatus(null);

    try {
      await loadDemoScenario();

      setStatus({
        type: 'success',
        message: 'Hot lead demo loaded! You can now demo the qualification flow. Check Transcripts for more scenarios.',
      });

      // Auto-close settings panel after successful load
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load demo scenarios.';
      setStatus({ type: 'error', message });
    } finally {
      setIsLoadingDemo(false);
    }
  }, [loadDemoScenario, onClose]);

  // Memoize model options to prevent recreation
  const modelOptions = useMemo(() => MODEL_OPTIONS, []);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <button
        type="button"
        aria-label="Close settings"
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative ml-auto flex h-full w-full max-w-md flex-col border-l border-[#222] bg-[#0b0b0b]/95 backdrop-blur-[24px] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#222] px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-white font-display">AI Settings</h2>
            <p className="text-sm text-gray-400">Configure your model and credentials.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-[#1a1a1a] hover:text-white"
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
              className="w-full rounded-xl border border-[#222] bg-[#111] px-4 py-3 text-sm text-gray-100 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10"
            >
              {modelOptions.map((option) => (
                <option key={option} value={option} className="bg-[#111]">
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
              className="w-full rounded-xl border border-[#222] bg-[#111] px-4 py-3 text-sm text-gray-100 placeholder:text-gray-500 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/10"
            />
            <p className="text-xs text-gray-500">Stored locally in your browser.</p>
          </div>

          {status && (
            <div
              className="flex items-start gap-2 rounded-xl border border-[#222] bg-[#111]/70 px-4 py-3 text-sm text-gray-200"
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

        <div className="flex flex-col gap-3 border-t border-[#222] px-6 py-5">
          <button
            type="button"
            onClick={handleLoadDemo}
            disabled={isLoadingDemo}
            className="w-full rounded-xl border border-[#222] bg-[#111] px-4 py-3 text-sm font-medium text-gray-200 transition hover:border-white/20 hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <Play className="h-4 w-4" />
            {isLoadingDemo ? 'Loading demo scenarios...' : 'Load Demo Scenario'}
          </button>
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting}
            className="w-full rounded-xl border border-[#222] bg-[#111] px-4 py-3 text-sm font-medium text-gray-200 transition hover:border-white/20 hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isTesting ? 'Testing connection...' : 'Test connection'}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black shadow-lg transition hover:bg-[#f5f5f5]"
          >
            Save settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(SettingsPanel);
