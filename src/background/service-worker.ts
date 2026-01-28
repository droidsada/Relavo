import type {
  ExtensionMessage,
  GenerateMessageRequest,
  GenerateMessageResponse,
  AnalyzeProfileRequest,
  AnalyzeProfileResponse,
  ProfileData,
  ProfileAnalysis,
} from '../shared/types';
import { getStorageData } from '../shared/storage';

// In-memory cache for profile analyses
const analysisCache = new Map<string, { analysis: ProfileAnalysis; profileData: ProfileData; timestamp: number }>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

interface LLMRequest {
  systemPrompt: string;
  userPrompt: string;
  model: string;
}

// Multi-vendor LLM Handlers
async function callAnthropic(req: LLMRequest, apiKey: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: req.model,
      max_tokens: 1024,
      system: req.systemPrompt,
      messages: [{ role: 'user', content: req.userPrompt }],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Anthropic API error: ${response.status}`);
  }

  const data = await response.json();
  return data.content[0]?.text || '';
}

async function callOpenAI(req: LLMRequest, apiKey: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: req.model,
      messages: [
        { role: 'system', content: req.systemPrompt },
        { role: 'user', content: req.userPrompt },
      ],
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

async function callGemini(req: LLMRequest, apiKey: string): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${req.model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: req.systemPrompt }] },
        contents: [{ parts: [{ text: req.userPrompt }] }],
        generationConfig: { maxOutputTokens: 1024 },
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function callLLM(request: LLMRequest): Promise<string> {
  const { activeProvider, apiKeys, model } = await getStorageData();
  const apiKey = apiKeys[activeProvider];

  if (!apiKey) {
    throw new Error(`No API key configured for ${activeProvider}. Click the Relavo extension icon to add your API key.`);
  }

  const llmRequest = { ...request, model };

  switch (activeProvider) {
    case 'anthropic':
      return callAnthropic(llmRequest, apiKey);
    case 'openai':
      return callOpenAI(llmRequest, apiKey);
    case 'gemini':
      return callGemini(llmRequest, apiKey);
    default:
      throw new Error(`Unknown provider: ${activeProvider}`);
  }
}

// Profile Analysis Handler
async function handleAnalyzeProfile(request: AnalyzeProfileRequest): Promise<AnalyzeProfileResponse> {
  const { systemPrompts } = await getStorageData();
  const { profileData } = request;

  // Check cache first
  const cacheKey = `${profileData.name}-${profileData.headline}`;
  const cached = analysisCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return { type: 'ANALYZE_PROFILE_RESPONSE', analysis: cached.analysis };
  }

  const userPrompt = `Analyze this LinkedIn profile:
Name: ${profileData.name}
Headline: ${profileData.headline}
About: ${profileData.about || 'Not provided'}
Experience: ${profileData.experience.length > 0 ? profileData.experience.join(', ') : 'Not provided'}
Location: ${profileData.location || 'Not provided'}

Return a JSON object with "interests" (array of 3-5 short tags) and "alignmentSuggestion" (2-3 sentences).`;

  try {
    const response = await callLLM({
      systemPrompt: systemPrompts.profileAnalysis,
      userPrompt,
    } as LLMRequest);

    // Parse the JSON response
    let analysis: ProfileAnalysis;
    try {
      // Clean the response - remove markdown code blocks if present
      const cleanedResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysis = JSON.parse(cleanedResponse);
    } catch {
      // If parsing fails, try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse profile analysis response');
      }
    }

    // Validate the analysis structure
    if (!Array.isArray(analysis.interests) || typeof analysis.alignmentSuggestion !== 'string') {
      throw new Error('Invalid analysis structure');
    }

    // Cache the result
    analysisCache.set(cacheKey, { analysis, profileData, timestamp: Date.now() });

    return { type: 'ANALYZE_PROFILE_RESPONSE', analysis };
  } catch (error) {
    console.error('Error analyzing profile:', error);
    return {
      type: 'ANALYZE_PROFILE_RESPONSE',
      error: error instanceof Error ? error.message : 'Failed to analyze profile',
    };
  }
}

// Message Generation Handler
async function handleGenerateMessage(request: GenerateMessageRequest): Promise<GenerateMessageResponse> {
  const storedData = await getStorageData();
  const { profileData, profileAnalysis, vibe, relationship, channel, customContext, businessContext } = request;

  const contextToUse = businessContext || storedData.businessContext;

  // Build channel context
  const channelDescriptions: Record<string, string> = {
    'connect-note': 'This is a LinkedIn connection request note. MUST be under 300 characters. Be concise and punchy.',
    'inmail': 'This is a LinkedIn InMail message. Can be longer (3-5 sentences). More formal structure with clear value proposition.',
    'post-accept': 'This is a follow-up message after they accepted our connection. Be warm, reference the connection, and suggest a next step.',
  };

  // Build relationship context
  const relationshipDescriptions: Record<string, string> = {
    'cold': 'This is a cold outreach - we have no prior connection',
    'met-before': 'We have met before at an event or through work',
    'referral': 'I was referred to them by a mutual contact',
    'mutual-connection': 'We have mutual connections on LinkedIn',
  };

  const userPrompt = `Create a LinkedIn connection message for:

**Recipient Profile:**
- Name: ${profileData.name}
- Headline: ${profileData.headline}
- About: ${profileData.about || 'Not provided'}
- Experience: ${profileData.experience.length > 0 ? profileData.experience.join(', ') : 'Not provided'}
- Location: ${profileData.location || 'Not provided'}
${profileAnalysis ? `
**Profile Insights:**
- Interests: ${profileAnalysis.interests.join(', ')}
- Alignment Tip: ${profileAnalysis.alignmentSuggestion}
` : ''}
**Message Parameters:**
- Tone/Vibe: ${vibe}
- Relationship: ${relationshipDescriptions[relationship] || relationship}
- Channel: ${channelDescriptions[channel] || channel}
${contextToUse ? `- My Business Context: ${contextToUse}` : ''}
${customContext ? `- Additional Context: ${customContext}` : ''}

Write the message now.`;

  try {
    const response = await callLLM({
      systemPrompt: storedData.systemPrompts.messageGeneration,
      userPrompt,
    } as LLMRequest);

    if (!response) {
      return {
        type: 'GENERATE_MESSAGE_RESPONSE',
        error: 'No message generated. Please try again.',
      };
    }

    return {
      type: 'GENERATE_MESSAGE_RESPONSE',
      message: response.trim(),
    };
  } catch (error) {
    console.error('Error generating message:', error);
    return {
      type: 'GENERATE_MESSAGE_RESPONSE',
      error: error instanceof Error ? error.message : 'Failed to generate message',
    };
  }
}

// Get cached analysis
function handleGetCachedAnalysis(profileUrl: string) {
  // Extract profile identifier from URL
  const match = profileUrl.match(/linkedin\.com\/in\/([^\/\?]+)/);
  if (!match) return { type: 'CACHED_ANALYSIS_RESPONSE' as const };

  // Search cache for matching profile
  for (const [, value] of analysisCache.entries()) {
    if (Date.now() - value.timestamp < CACHE_TTL) {
      return {
        type: 'CACHED_ANALYSIS_RESPONSE' as const,
        analysis: value.analysis,
        profileData: value.profileData,
      };
    }
  }

  return { type: 'CACHED_ANALYSIS_RESPONSE' as const };
}

// Message Listener
chrome.runtime.onMessage.addListener(
  (
    message: ExtensionMessage,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: ExtensionMessage) => void
  ) => {
    switch (message.type) {
      case 'GENERATE_MESSAGE':
        handleGenerateMessage(message as GenerateMessageRequest)
          .then(sendResponse)
          .catch((error) => {
            sendResponse({
              type: 'GENERATE_MESSAGE_RESPONSE',
              error: error.message || 'Unknown error occurred',
            });
          });
        return true;

      case 'ANALYZE_PROFILE':
        handleAnalyzeProfile(message as AnalyzeProfileRequest)
          .then(sendResponse)
          .catch((error) => {
            sendResponse({
              type: 'ANALYZE_PROFILE_RESPONSE',
              error: error.message || 'Unknown error occurred',
            });
          });
        return true;

      case 'GET_CACHED_ANALYSIS':
        const cachedResponse = handleGetCachedAnalysis((message as { profileUrl: string }).profileUrl);
        sendResponse(cachedResponse);
        return false;

      default:
        return false;
    }
  }
);

console.log('Relavo service worker loaded - Multi-vendor LLM support enabled');
