import { useState, useEffect } from 'react';
import {
  Settings,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Edit3,
  RotateCcw,
} from 'lucide-react';
import { getStorageData, setStorageData, setApiKey, setActiveProvider, resetSystemPrompts } from '../shared/storage';
import { getActiveTab } from '../shared/messaging';
import {
  AVAILABLE_MODELS,
  DEFAULT_SYSTEM_PROMPTS,
  type LLMProvider,
  type StorageData,
  type WidgetPosition,
} from '../shared/types';

export default function Popup() {
  // Settings state
  const [storageData, setStorageDataState] = useState<StorageData | null>(null);
  const [isOnLinkedIn, setIsOnLinkedIn] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false);
  const [isPromptsModalOpen, setIsPromptsModalOpen] = useState(false);
  const [isApiKeysExpanded, setIsApiKeysExpanded] = useState(false);

  // Editable prompts state
  const [editedPrompts, setEditedPrompts] = useState({
    profileAnalysis: '',
    messageGeneration: '',
  });

  useEffect(() => {
    async function initialize() {
      const data = await getStorageData();
      setStorageDataState(data);
      setEditedPrompts({
        profileAnalysis: data.systemPrompts.profileAnalysis,
        messageGeneration: data.systemPrompts.messageGeneration,
      });

      // Check if API key is configured - expand settings if not
      const hasApiKey = data.apiKeys[data.activeProvider];
      setIsSettingsExpanded(!hasApiKey);

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
              You're on a LinkedIn profile. Use the Relavo widget on the page to analyze and generate messages.
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

      {/* Settings Panel - Collapsible */}
      <div className="bg-white rounded-lg border border-gray-200 mb-3">
        <button
          onClick={() => setIsSettingsExpanded(!isSettingsExpanded)}
          className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-gray-600" />
            <h2 className="font-semibold text-gray-900 text-sm">Settings</h2>
          </div>
          {isSettingsExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>

        {isSettingsExpanded && (
          <div className="px-4 pb-4 space-y-4">
            {/* Provider Selection */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                AI Provider
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
            <div>
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

            {/* API Keys Section */}
            <div>
              <button
                onClick={() => setIsApiKeysExpanded(!isApiKeysExpanded)}
                className="flex items-center justify-between w-full text-xs font-medium text-gray-700 mb-2"
              >
                <span>API Keys</span>
                {isApiKeysExpanded ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>

              {isApiKeysExpanded && (
                <div className="space-y-3 pl-2 border-l-2 border-gray-200">
                  {/* Anthropic Key */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Anthropic</label>
                    <input
                      type="password"
                      value={storageData.apiKeys.anthropic || ''}
                      onChange={(e) => handleApiKeyChange('anthropic', e.target.value)}
                      placeholder="sk-ant-..."
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* OpenAI Key */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">OpenAI</label>
                    <input
                      type="password"
                      value={storageData.apiKeys.openai || ''}
                      onChange={(e) => handleApiKeyChange('openai', e.target.value)}
                      placeholder="sk-..."
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Gemini Key */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Gemini</label>
                    <input
                      type="password"
                      value={storageData.apiKeys.gemini || ''}
                      onChange={(e) => handleApiKeyChange('gemini', e.target.value)}
                      placeholder="AIza..."
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                </div>
              )}
            </div>

            {/* Auto-analyze Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-700">Auto-analyze profiles</p>
                <p className="text-xs text-gray-500">Automatically analyze when visiting profiles</p>
              </div>
              <button
                onClick={handleAutoFetchToggle}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  storageData.autoFetchProfile ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    storageData.autoFetchProfile ? 'translate-x-4.5' : 'translate-x-1'
                  }`}
                  style={{ transform: storageData.autoFetchProfile ? 'translateX(18px)' : 'translateX(2px)' }}
                />
              </button>
            </div>

            {/* Widget Position */}
            <div>
              <p className="text-xs font-medium text-gray-700 mb-2">Widget Position</p>
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => handleWidgetPositionChange('top-left')}
                  className={`p-2 rounded text-xs font-medium transition-colors ${
                    storageData.widgetPosition === 'top-left'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ↖ TL
                </button>
                <button
                  onClick={() => handleWidgetPositionChange('top-right')}
                  className={`p-2 rounded text-xs font-medium transition-colors ${
                    storageData.widgetPosition === 'top-right'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ↗ TR
                </button>
                <button
                  onClick={() => handleWidgetPositionChange('bottom-left')}
                  className={`p-2 rounded text-xs font-medium transition-colors ${
                    storageData.widgetPosition === 'bottom-left'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ↙ BL
                </button>
                <button
                  onClick={() => handleWidgetPositionChange('bottom-right')}
                  className={`p-2 rounded text-xs font-medium transition-colors ${
                    storageData.widgetPosition === 'bottom-right'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ↘ BR
                </button>
              </div>
            </div>

            {/* System Prompts */}
            <div>
              <button
                onClick={() => setIsPromptsModalOpen(true)}
                className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800"
              >
                <Edit3 className="w-3 h-3" />
                Edit System Prompts
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
        <p className="text-xs text-blue-800">
          <strong>Tip:</strong> The widget on LinkedIn profile pages lets you analyze profiles and generate personalized messages.
        </p>
      </div>

      {/* Footer */}
      <p className="text-xs text-gray-500 text-center">
        v2.0.0 - Multi-vendor LLM support
      </p>

      {/* System Prompts Modal */}
      {isPromptsModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-[90%] max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Edit System Prompts</h3>
              <button
                onClick={() => setIsPromptsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* Profile Analysis Prompt */}
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

              {/* Message Generation Prompt */}
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
                    Save Prompts
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
