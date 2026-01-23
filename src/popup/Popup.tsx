import { useState, useEffect } from 'react';
import { Loader2, Settings } from 'lucide-react';
import type { ProfileData } from '../shared/types';
import { getStorageData, setStorageData } from '../shared/storage';
import { requestProfileData, requestMessageGeneration, isLinkedInProfilePage } from '../shared/messaging';
import SettingsPanel from './components/SettingsPanel';
import ProfileCard from './components/ProfileCard';
import MessageOutput from './components/MessageOutput';

export default function Popup() {
  const [apiKey, setApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [businessContext, setBusinessContext] = useState('');
  const [tone, setTone] = useState('professional');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isOnLinkedIn, setIsOnLinkedIn] = useState(false);
  const [error, setError] = useState('');

  // Load settings and profile data on mount
  useEffect(() => {
    async function initialize() {
      // Load stored settings
      const storedData = await getStorageData();
      setApiKey(storedData.apiKey);
      setBusinessContext(storedData.businessContext);
      setTone(storedData.tone);

      // Check if on LinkedIn and get profile data
      const onLinkedIn = await isLinkedInProfilePage();
      setIsOnLinkedIn(onLinkedIn);

      if (onLinkedIn) {
        const data = await requestProfileData();
        setProfileData(data);
      }

      setProfileLoading(false);
    }

    initialize();
  }, []);

  // Save settings when they change
  const handleApiKeyChange = async (value: string) => {
    setApiKey(value);
    await setStorageData({ apiKey: value });
  };

  const handleBusinessContextChange = async (value: string) => {
    setBusinessContext(value);
    await setStorageData({ businessContext: value });
  };

  const handleToneChange = async (value: string) => {
    setTone(value);
    await setStorageData({ tone: value });
  };

  const generateMessage = async () => {
    if (!apiKey) {
      setError('Please add your Anthropic API key in settings first.');
      setShowSettings(true);
      return;
    }

    if (!profileData) {
      setError('No profile data available. Please navigate to a LinkedIn profile page.');
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');

    const result = await requestMessageGeneration(profileData, businessContext, tone);

    if (result.error) {
      setError(result.error);
    } else if (result.message) {
      setMessage(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Relavo</h1>
            <p className="text-xs text-gray-600">
              Generate personalized LinkedIn messages
            </p>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <SettingsPanel
            apiKey={apiKey}
            businessContext={businessContext}
            tone={tone}
            onApiKeyChange={handleApiKeyChange}
            onBusinessContextChange={handleBusinessContextChange}
            onToneChange={handleToneChange}
            onClose={() => setShowSettings(false)}
          />
        )}
      </div>

      {/* Profile Card */}
      <ProfileCard
        profileData={profileData}
        isLoading={profileLoading}
        isOnLinkedIn={isOnLinkedIn}
      />

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 rounded-lg p-3 mb-4 border border-red-200">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Generate Button */}
      <div className="mb-4">
        <button
          onClick={generateMessage}
          disabled={loading || !isOnLinkedIn || !profileData}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate Message'
          )}
        </button>
      </div>

      {/* Generated Message */}
      <MessageOutput message={message} />
    </div>
  );
}
