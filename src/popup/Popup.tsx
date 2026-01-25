import { useState, useEffect } from 'react';
import { Settings, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { getStorageData, setStorageData } from '../shared/storage';
import { getActiveTab } from '../shared/messaging';
import { AVAILABLE_MODELS } from '../shared/types';

export default function Popup() {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('claude-sonnet-4-20250514');
  const [isOnLinkedIn, setIsOnLinkedIn] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isConfigExpanded, setIsConfigExpanded] = useState(true);

  useEffect(() => {
    async function initialize() {
      const storedData = await getStorageData();
      setApiKey(storedData.apiKey);
      setModel(storedData.model || 'claude-sonnet-4-20250514');
      // Collapse config by default if API key is already set
      setIsConfigExpanded(!storedData.apiKey);

      const tab = await getActiveTab();
      setIsOnLinkedIn(tab?.url?.includes('linkedin.com/in/') || false);
    }
    initialize();
  }, []);

  const handleSave = async () => {
    await setStorageData({ apiKey, model });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const openLinkedIn = () => {
    chrome.tabs.create({ url: 'https://www.linkedin.com' });
  };

  return (
    <div className="w-80 bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">R</span>
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Relavo</h1>
          <p className="text-xs text-gray-500">LinkedIn AI Assistant</p>
        </div>
      </div>

      {/* Status */}
      {isOnLinkedIn ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-green-800">
            Widget is active on this LinkedIn profile. Drag it anywhere on the page!
          </p>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-yellow-800 mb-2">
            Navigate to a LinkedIn profile to use Relavo.
          </p>
          <button
            onClick={openLinkedIn}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
          >
            <ExternalLink className="w-3 h-3" />
            Open LinkedIn
          </button>
        </div>
      )}

      {/* Configuration - Collapsible */}
      <div className="bg-white rounded-lg border border-gray-200 mb-3">
        <button
          onClick={() => setIsConfigExpanded(!isConfigExpanded)}
          className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-gray-600" />
            <h2 className="font-semibold text-gray-900 text-sm">API Configuration</h2>
          </div>
          {isConfigExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>

        {isConfigExpanded && (
          <div className="px-4 pb-4 space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Anthropic API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-ant-..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Get your key at{' '}
                <a
                  href="https://console.anthropic.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  console.anthropic.com
                </a>
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                AI Model
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                {AVAILABLE_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSave}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
            >
              {saved ? 'Saved!' : 'Save Settings'}
            </button>
          </div>
        )}
      </div>

      {/* Info about widget settings */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
        <p className="text-xs text-blue-800">
          <strong>Tip:</strong> Business context and message tone can be adjusted directly in the widget using the gear icon.
        </p>
      </div>

      {/* Footer */}
      <p className="text-xs text-gray-500 text-center">
        v1.0.0 - The widget appears on LinkedIn profile pages
      </p>
    </div>
  );
}
