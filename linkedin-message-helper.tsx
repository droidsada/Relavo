import React, { useState, useEffect } from 'react';
import { Copy, Check, Loader2, Settings, X } from 'lucide-react';

export default function LinkedInAIAssistant() {
  const [apiKey, setApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [businessContext, setBusinessContext] = useState('');
  const [tone, setTone] = useState('professional');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "Sarah Johnson",
    headline: "VP of Marketing at TechCorp | B2B SaaS Growth Expert",
    about: "Passionate about driving growth through data-driven marketing strategies. 10+ years experience scaling B2B SaaS companies from Series A to IPO.",
    experience: [
      "VP Marketing at TechCorp (2021-Present)",
      "Director of Growth at StartupXYZ (2018-2021)",
      "Marketing Manager at Enterprise Solutions (2015-2018)"
    ],
    location: "San Francisco Bay Area"
  });

  const generateMessage = async () => {
    if (!apiKey) {
      alert('Please add your Anthropic API key in settings first!');
      setShowSettings(true);
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          messages: [{
            role: 'user',
            content: `You are helping craft a personalized LinkedIn first message after a connection request was accepted.

Profile Information:
- Name: ${profileData.name}
- Headline: ${profileData.headline}
- About: ${profileData.about}
- Experience: ${profileData.experience.join(', ')}
- Location: ${profileData.location}

My Business Context: ${businessContext || 'Not provided'}

Tone: ${tone}

Create a personalized first message that:
1. References something specific from their profile
2. Is genuine and not salesy
3. Provides value or a clear reason for connecting
4. Is concise (2-3 sentences max)
5. Ends with a light question or call to action

Return ONLY the message text, no preamble or explanation.`
          }]
        })
      });

      const data = await response.json();
      const generatedMessage = data.content[0].text;
      setMessage(generatedMessage);
    } catch (error) {
      alert('Error generating message. Check your API key and try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🤖 LinkedIn AI Assistant
              </h1>
              <p className="text-gray-600">
                Generate personalized first messages for your LinkedIn connections
              </p>
            </div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Settings className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Settings</h3>
                <button onClick={() => setShowSettings(false)}>
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
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-ant-..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    onChange={(e) => setBusinessContext(e.target.value)}
                    placeholder="e.g., I help B2B SaaS companies optimize their marketing funnels..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message Tone
                  </label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="professional">Professional</option>
                    <option value="friendly">Friendly</option>
                    <option value="casual">Casual</option>
                    <option value="enthusiastic">Enthusiastic</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Demo Profile Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Demo Profile (In Chrome extension: reads actual LinkedIn page)
          </h2>
          <div className="space-y-3 text-sm">
            <div>
              <span className="font-medium text-gray-700">Name:</span>
              <span className="ml-2 text-gray-600">{profileData.name}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Headline:</span>
              <span className="ml-2 text-gray-600">{profileData.headline}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Location:</span>
              <span className="ml-2 text-gray-600">{profileData.location}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">About:</span>
              <span className="ml-2 text-gray-600">{profileData.about.substring(0, 100)}...</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Experience:</span>
              <div className="ml-6 mt-2 space-y-1">
                {profileData.experience.map((exp, idx) => (
                  <div key={idx} className="text-gray-600">• {exp}</div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <button
            onClick={generateMessage}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating personalized message...
              </>
            ) : (
              'Generate Message'
            )}
          </button>
        </div>

        {/* Generated Message */}
        {message && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Your Personalized Message
              </h3>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-gray-800 whitespace-pre-wrap">{message}</p>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                💡 <strong>Tip:</strong> Review and personalize further before sending!
              </p>
            </div>
          </div>
        )}

        {/* Installation Instructions */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            📦 How This Works as a Chrome Extension
          </h3>
          <p className="text-gray-700 mb-4">
            This demo shows the interface. The actual Chrome extension:
          </p>
          <ul className="space-y-2 text-sm text-gray-700 list-disc list-inside">
            <li>Adds a floating button on LinkedIn profile pages</li>
            <li>Automatically extracts profile data from the page</li>
            <li>Opens this sidebar when you click the button</li>
            <li>Generates personalized messages using Claude AI</li>
          </ul>
          
          <p className="mt-4 text-sm text-gray-600">
            Want the full extension files? I can provide all the code files (manifest.json, content.js, etc.) 
            ready to install in Chrome!
          </p>
        </div>
      </div>
    </div>
  );
}