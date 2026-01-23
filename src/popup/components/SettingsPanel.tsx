import { X } from 'lucide-react';

interface SettingsPanelProps {
  apiKey: string;
  businessContext: string;
  tone: string;
  onApiKeyChange: (value: string) => void;
  onBusinessContextChange: (value: string) => void;
  onToneChange: (value: string) => void;
  onClose: () => void;
}

export default function SettingsPanel({
  apiKey,
  businessContext,
  tone,
  onApiKeyChange,
  onBusinessContextChange,
  onToneChange,
  onClose,
}: SettingsPanelProps) {
  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">Settings</h3>
        <button onClick={onClose} className="hover:bg-gray-200 rounded p-1">
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Anthropic API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
            placeholder="sk-ant-..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            Get your API key at console.anthropic.com
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Business Context
          </label>
          <textarea
            value={businessContext}
            onChange={(e) => onBusinessContextChange(e.target.value)}
            placeholder="e.g., I help B2B SaaS companies optimize their marketing funnels..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message Tone
          </label>
          <select
            value={tone}
            onChange={(e) => onToneChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="professional">Professional</option>
            <option value="friendly">Friendly</option>
            <option value="casual">Casual</option>
            <option value="enthusiastic">Enthusiastic</option>
          </select>
        </div>
      </div>
    </div>
  );
}
