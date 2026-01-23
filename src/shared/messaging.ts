import type {
  ExtensionMessage,
  ProfileData,
  GenerateMessageResponse,
  ProfileDataResponseMessage
} from './types';

export function sendMessageToBackground(
  message: ExtensionMessage
): Promise<GenerateMessageResponse> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, (response: GenerateMessageResponse) => {
      resolve(response);
    });
  });
}

export async function sendMessageToContentScript(
  tabId: number,
  message: ExtensionMessage
): Promise<ProfileDataResponseMessage> {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, message, (response: ProfileDataResponseMessage) => {
      resolve(response);
    });
  });
}

export async function getActiveTab(): Promise<chrome.tabs.Tab | null> {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      resolve(tabs[0] || null);
    });
  });
}

export async function isLinkedInProfilePage(): Promise<boolean> {
  const tab = await getActiveTab();
  if (!tab?.url) return false;
  return tab.url.includes('linkedin.com/in/');
}

export async function requestProfileData(): Promise<ProfileData | null> {
  const tab = await getActiveTab();
  if (!tab?.id || !tab.url?.includes('linkedin.com/in/')) {
    return null;
  }

  try {
    const response = await sendMessageToContentScript(tab.id, { type: 'GET_PROFILE_DATA' });
    return response?.data || null;
  } catch (error) {
    console.error('Error getting profile data:', error);
    return null;
  }
}

export async function requestMessageGeneration(
  profileData: ProfileData,
  businessContext: string,
  tone: string
): Promise<{ message?: string; error?: string }> {
  const response = await sendMessageToBackground({
    type: 'GENERATE_MESSAGE',
    profileData,
    businessContext,
    tone,
  });

  return {
    message: response?.message,
    error: response?.error,
  };
}
