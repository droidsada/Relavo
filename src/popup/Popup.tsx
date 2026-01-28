import { useState, useEffect } from 'react';
import {
  ExternalLink,
  CheckCircle,
  RotateCcw,
  Key,
  MessageSquare,
  Sliders,
} from 'lucide-react';
import { getStorageData, setStorageData, setApiKey, setActiveProvider, resetSystemPrompts, resetMessageOptions } from '../shared/storage';
import { getActiveTab } from '../shared/messaging';
import {
  AVAILABLE_MODELS,
  DEFAULT_SYSTEM_PROMPTS,
  DEFAULT_MESSAGE_OPTIONS,
  type LLMProvider,
  type StorageData,
  type WidgetPosition,
} from '../shared/types';

export default function Popup() {
  // Settings state
  const [storageData, setStorageDataState] = useState<StorageData | null>(null);
  const [isOnLinkedIn, setIsOnLinkedIn] = useState(false);
  const [saved, setSaved] = useState(false);

  // Modal states
  const [isApiKeysModalOpen, setIsApiKeysModalOpen] = useState(false);
  const [isPromptsModalOpen, setIsPromptsModalOpen] = useState(false);
  const [isMessageOptionsModalOpen, setIsMessageOptionsModalOpen] = useState(false);

  // Editable states for modals
  const [editedPrompts, setEditedPrompts] = useState({
    profileAnalysis: '',
    messageGeneration: '',
  });
  const [editedMessageOptions, setEditedMessageOptions] = useState({
    vibes: '',
    relationships: '',
    channels: '',
  });

  useEffect(() => {
    async function initialize() {
      const data = await getStorageData();
      setStorageDataState(data);
      setEditedPrompts({
        profileAnalysis: data.systemPrompts.profileAnalysis,
        messageGeneration: data.systemPrompts.messageGeneration,
      });
      setEditedMessageOptions({
        vibes: data.messageOptions.vibes.join(', '),
        relationships: data.messageOptions.relationships.join(', '),
        channels: data.messageOptions.channels.join(', '),
      });

      // Check if API key is configured - open modal if not
      const hasApiKey = data.apiKeys[data.activeProvider];
      if (!hasApiKey) {
        setIsApiKeysModalOpen(true);
      }

      const tab = await getActiveTab();
      const isProfile = tab?.url?.includes('linkedin.com/in/') || false;
      setIsOnLinkedIn(isProfile);
    }
    initialize();
  }, []);

  const handleProviderChange = async (provider: LLMProvider) => {
    await setActiveProvider(provider);
    const updated = await getStorageData();
    setStorageDataState(updated);
    showSaved();
  };

  const handleApiKeyChange = async (provider: LLMProvider, key: string) => {
    await setApiKey(provider, key);
    const updated = await getStorageData();
    setStorageDataState(updated);
  };

  const handleModelChange = async (model: string) => {
    await setStorageData({ model });
    const updated = await getStorageData();
    setStorageDataState(updated);
    showSaved();
  };

  const handleAutoFetchToggle = async () => {
    if (!storageData) return;
    await setStorageData({ autoFetchProfile: !storageData.autoFetchProfile });
    const updated = await getStorageData();
    setStorageDataState(updated);
    showSaved();
  };

  const handleWidgetPositionChange = async (position: WidgetPosition) => {
    await setStorageData({ widgetPosition: position });
    const updated = await getStorageData();
    setStorageDataState(updated);
    showSaved();
  };

  const handleSavePrompts = async () => {
    await setStorageData({
      systemPrompts: {
        profileAnalysis: editedPrompts.profileAnalysis,
        messageGeneration: editedPrompts.messageGeneration,
      },
    });
    const updated = await getStorageData();
    setStorageDataState(updated);
    setIsPromptsModalOpen(false);
    showSaved();
  };

  const handleResetPrompts = async () => {
    await resetSystemPrompts();
    const updated = await getStorageData();
    setStorageDataState(updated);
    setEditedPrompts({
      profileAnalysis: DEFAULT_SYSTEM_PROMPTS.profileAnalysis,
      messageGeneration: DEFAULT_SYSTEM_PROMPTS.messageGeneration,
    });
    showSaved();
  };

  const handleSaveMessageOptions = async () => {
    const vibes = editedMessageOptions.vibes.split(',').map(s => s.trim()).filter(s => s.length > 0);
    const relationships = editedMessageOptions.relationships.split(',').map(s => s.trim()).filter(s => s.length > 0);
    const channels = editedMessageOptions.channels.split(',').map(s => s.trim()).filter(s => s.length > 0);

    await setStorageData({
      messageOptions: { vibes, relationships, channels },
    });
    const updated = await getStorageData();
    setStorageDataState(updated);
    setIsMessageOptionsModalOpen(false);
    showSaved();
  };

  const handleResetMessageOptions = async () => {
    await resetMessageOptions();
    const updated = await getStorageData();
    setStorageDataState(updated);
    setEditedMessageOptions({
      vibes: DEFAULT_MESSAGE_OPTIONS.vibes.join(', '),
      relationships: DEFAULT_MESSAGE_OPTIONS.relationships.join(', '),
      channels: DEFAULT_MESSAGE_OPTIONS.channels.join(', '),
    });
    showSaved();
  };

  const showSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const openLinkedIn = () => {
    chrome.tabs.create({ url: 'https://www.linkedin.com' });
  };

  if (!storageData) {
    return (
      <div className="w-96 bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
        <div className="text-center text-gray-500">Loading...</div>
      </div>
    );
  }

  const currentProvider = storageData.activeProvider;
  const currentApiKey = storageData.apiKeys[currentProvider];
  const availableModels = AVAILABLE_MODELS[currentProvider];

  return (
    <div className="w-96 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 max-h-[600px] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">R</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Relavo</h1>
            <p className="text-xs text-gray-500">LinkedIn AI Assistant</p>
          </div>
        </div>
        {saved && (
          <span className="text-xs text-green-600 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Saved
          </span>
        )}
      </div>

      {/* Status Banner */}
      {isOnLinkedIn ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <p className="text-sm text-green-800">
              You're on a LinkedIn profile. Use the Relavo widget on the page.
            </p>
          </div>
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

      {/* AI Provider Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-3">
        <h2 className="font-semibold text-gray-900 text-sm mb-3">AI Provider</h2>

        {/* Provider Selection */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Provider
          </label>
          <select
            value={currentProvider}
            onChange={(e) => handleProviderChange(e.target.value as LLMProvider)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="anthropic">Anthropic (Claude)</option>
            <option value="openai">OpenAI (GPT-4)</option>
            <option value="gemini">Google (Gemini)</option>
          </select>
        </div>

        {/* Model Selection */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Model
          </label>
          <select
            value={storageData.model}
            onChange={(e) => handleModelChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            {availableModels.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* API Key Status & Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${currentApiKey ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-xs text-gray-600">
              {currentApiKey ? 'API Key configured' : 'API Key required'}
            </span>
          </div>
          <button
            onClick={() => setIsApiKeysModalOpen(true)}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
          >
            <Key className="w-3 h-3" />
            Configure
          </button>
        </div>
      </div>

      {/* Widget Settings Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-3">
        <h2 className="font-semibold text-gray-900 text-sm mb-3">Widget Settings</h2>

        {/* Auto-analyze Toggle */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-medium text-gray-700">Auto-analyze profiles</p>
            <p className="text-xs text-gray-500">Analyze when visiting profiles</p>
          </div>
          <button
            onClick={handleAutoFetchToggle}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              storageData.autoFetchProfile ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform"
              style={{ transform: storageData.autoFetchProfile ? 'translateX(18px)' : 'translateX(2px)' }}
            />
          </button>
        </div>

        {/* Widget Position */}
        <div>
          <p className="text-xs font-medium text-gray-700 mb-2">Widget Position</p>
          <div className="grid grid-cols-4 gap-1">
            {(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as WidgetPosition[]).map((pos) => (
              <button
                key={pos}
                onClick={() => handleWidgetPositionChange(pos)}
                className={`p-2 rounded text-xs font-medium transition-colors ${
                  storageData.widgetPosition === pos
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {pos === 'top-left' && '↖'}
                {pos === 'top-right' && '↗'}
                {pos === 'bottom-left' && '↙'}
                {pos === 'bottom-right' && '↘'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Customization Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-3">
        <h2 className="font-semibold text-gray-900 text-sm mb-3">Customization</h2>

        <div className="space-y-2">
          <button
            onClick={() => setIsMessageOptionsModalOpen(true)}
            className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">Message Options</span>
            </div>
            <span className="text-xs text-gray-400">Vibes & Relationships</span>
          </button>

          <button
            onClick={() => setIsPromptsModalOpen(true)}
            className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">System Prompts</span>
            </div>
            <span className="text-xs text-gray-400">AI Instructions</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <p className="text-xs text-gray-500 text-center">
        v2.1.0 - Customizable message options
      </p>

      {/* API Keys Modal */}
      {isApiKeysModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-[90%] max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">API Keys</h3>
              <button
                onClick={() => setIsApiKeysModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* Anthropic Key */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Anthropic</label>
                <input
                  type="password"
                  value={storageData.apiKeys.anthropic || ''}
                  onChange={(e) => handleApiKeyChange('anthropic', e.target.value)}
                  placeholder="sk-ant-..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* OpenAI Key */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">OpenAI</label>
                <input
                  type="password"
                  value={storageData.apiKeys.openai || ''}
                  onChange={(e) => handleApiKeyChange('openai', e.target.value)}
                  placeholder="sk-..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Gemini Key */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Gemini</label>
                <input
                  type="password"
                  value={storageData.apiKeys.gemini || ''}
                  onChange={(e) => handleApiKeyChange('gemini', e.target.value)}
                  placeholder="AIza..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <p className="text-xs text-gray-500">
                Get keys from{' '}
                <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Anthropic
                </a>
                ,{' '}
                <a href="https://platform.openai.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  OpenAI
                </a>
                , or{' '}
                <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Google AI
                </a>
              </p>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setIsApiKeysModalOpen(false)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message Options Modal */}
      {isMessageOptionsModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-[90%] max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Message Options</h3>
              <button
                onClick={() => setIsMessageOptionsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Vibes (comma-separated)
                </label>
                <input
                  type="text"
                  value={editedMessageOptions.vibes}
                  onChange={(e) => setEditedMessageOptions({ ...editedMessageOptions, vibes: e.target.value })}
                  placeholder="casual, professional, enthusiastic, friendly"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Tone options for generated messages</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Relationships (comma-separated)
                </label>
                <input
                  type="text"
                  value={editedMessageOptions.relationships}
                  onChange={(e) => setEditedMessageOptions({ ...editedMessageOptions, relationships: e.target.value })}
                  placeholder="cold, met-before, referral, mutual-connection"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Relationship types for context</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Channels (comma-separated)
                </label>
                <input
                  type="text"
                  value={editedMessageOptions.channels}
                  onChange={(e) => setEditedMessageOptions({ ...editedMessageOptions, channels: e.target.value })}
                  placeholder="connect-note, inmail, post-accept"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Message channel types (connect note, InMail, post-accept)</p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handleResetMessageOptions}
                  className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-800"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset to Defaults
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsMessageOptionsModalOpen(false)}
                    className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveMessageOptions}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* System Prompts Modal */}
      {isPromptsModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-[90%] max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">System Prompts</h3>
              <button
                onClick={() => setIsPromptsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Profile Analysis Prompt
                </label>
                <textarea
                  value={editedPrompts.profileAnalysis}
                  onChange={(e) => setEditedPrompts({ ...editedPrompts, profileAnalysis: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Message Generation Prompt
                </label>
                <textarea
                  value={editedPrompts.messageGeneration}
                  onChange={(e) => setEditedPrompts({ ...editedPrompts, messageGeneration: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-mono"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handleResetPrompts}
                  className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-800"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset to Defaults
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsPromptsModalOpen(false)}
                    className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSavePrompts}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
