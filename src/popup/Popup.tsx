import { useState, useEffect } from 'react';
import { Settings, ExternalLink } from 'lucide-react';
import { getStorageData, setStorageData } from '../shared/storage';
import { getActiveTab } from '../shared/messaging';

export default function Popup() {
  const [apiKey, setApiKey] = useState('');
  const [businessContext, setBusinessContext] = useState('');
  const [tone, setTone] = useState('professional');
  const [isOnLinkedIn, setIsOnLinkedIn] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function initialize() {
      const storedData = await getStorageData();
      setApiKey(storedData.apiKey);
      setBusinessContext(storedData.businessContext);
      setTone(storedData.tone);

      const tab = await getActiveTab();
      setIsOnLinkedIn(tab?.url?.includes('linkedin.com/in/') || false);
    }
    initialize();
  }, []);

  const handleSave = async () => {
    await setStorageData({ apiKey, businessContext, tone });
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
          <p className="text-xs text-gray-500">Settings</p>
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

      {/* Settings */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <Settings className="w-4 h-4 text-gray-600" />
          <h2 className="font-semibold text-gray-900 text-sm">Configuration</h2>
        </div>

        <div className="space-y-3">
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
              Your Business Context
            </label>
            <textarea
              value={businessContext}
              onChange={(e) => setBusinessContext(e.target.value)}
              placeholder="e.g., I help B2B SaaS companies optimize their marketing..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Message Tone
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="professional">Professional</option>
              <option value="friendly">Friendly</option>
              <option value="casual">Casual</option>
              <option value="enthusiastic">Enthusiastic</option>
            </select>
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
          >
            {saved ? 'Saved!' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Footer */}
      <p className="text-xs text-gray-500 text-center mt-3">
        v1.0.0 - The widget appears on LinkedIn profile pages
      </p>
    </div>
  );
}
