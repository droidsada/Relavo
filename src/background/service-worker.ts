import type {
  ExtensionMessage,
  GenerateMessageRequest,
  GenerateMessageResponse,
} from '../shared/types';
import { getStorageData } from '../shared/storage';

chrome.runtime.onMessage.addListener(
  (
    message: ExtensionMessage,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: GenerateMessageResponse) => void
  ) => {
    if (message.type === 'GENERATE_MESSAGE') {
      handleGenerateMessage(message as GenerateMessageRequest)
        .then(sendResponse)
        .catch((error) => {
          sendResponse({
            type: 'GENERATE_MESSAGE_RESPONSE',
            error: error.message || 'Unknown error occurred',
          });
        });
      return true; // Keep message channel open for async response
    }

    return false;
  }
);

async function handleGenerateMessage(
  request: GenerateMessageRequest
): Promise<GenerateMessageResponse> {
  // Get settings from storage (content script may send empty values)
  const storedData = await getStorageData();
  const apiKey = storedData.apiKey;
  const businessContext = request.businessContext || storedData.businessContext;
  const tone = request.tone || storedData.tone;

  if (!apiKey) {
    return {
      type: 'GENERATE_MESSAGE_RESPONSE',
      error: 'API key not configured. Click the Relavo extension icon to add your Anthropic API key.',
    };
  }

  const { profileData } = request;

  const prompt = `You are helping craft a personalized LinkedIn first message after a connection request was accepted.

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

Return ONLY the message text, no preamble or explanation.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `API error: ${response.status}`;
      return {
        type: 'GENERATE_MESSAGE_RESPONSE',
        error: errorMessage,
      };
    }

    const data = await response.json();
    const generatedMessage = data.content[0]?.text;

    if (!generatedMessage) {
      return {
        type: 'GENERATE_MESSAGE_RESPONSE',
        error: 'No message generated. Please try again.',
      };
    }

    return {
      type: 'GENERATE_MESSAGE_RESPONSE',
      message: generatedMessage,
    };
  } catch (error) {
    console.error('Error generating message:', error);
    return {
      type: 'GENERATE_MESSAGE_RESPONSE',
      error: error instanceof Error ? error.message : 'Failed to generate message',
    };
  }
}
