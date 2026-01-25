import type {
  ExtensionMessage,
  ProfileData,
  ProfileAnalysis,
  GenerateMessageResponse,
  ProfileDataResponseMessage,
  AnalyzeProfileResponse,
} from './types';

export function sendMessageToBackground<T = ExtensionMessage>(
  message: ExtensionMessage
): Promise<T> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, (response: T) => {
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

export async function requestProfileData(tabId?: number): Promise<ProfileData | null> {
  let targetTabId = tabId;

  if (!targetTabId) {
    const tab = await getActiveTab();
    if (!tab?.id || !tab.url?.includes('linkedin.com/in/')) {
      return null;
    }
    targetTabId = tab.id;
  }

  try {
    const response = await sendMessageToContentScript(targetTabId, { type: 'GET_PROFILE_DATA' });
    return response?.data || null;
  } catch (error) {
    console.error('Error getting profile data:', error);
    return null;
  }
}

export async function requestProfileAnalysis(
  profileData: ProfileData
): Promise<{ analysis?: ProfileAnalysis; error?: string }> {
  const response = await sendMessageToBackground<AnalyzeProfileResponse>({
    type: 'ANALYZE_PROFILE',
    profileData,
  });

  return {
    analysis: response?.analysis,
    error: response?.error,
  };
}

export async function requestMessageGeneration(
  profileData: ProfileData,
  options: {
    vibe: string;
    relationship: string;
    customContext: string;
    businessContext?: string;
    profileAnalysis?: ProfileAnalysis;
  }
): Promise<{ message?: string; error?: string }> {
  const response = await sendMessageToBackground<GenerateMessageResponse>({
    type: 'GENERATE_MESSAGE',
    profileData,
    profileAnalysis: options.profileAnalysis,
    vibe: options.vibe,
    relationship: options.relationship,
    customContext: options.customContext,
    businessContext: options.businessContext,
  });

  return {
    message: response?.message,
    error: response?.error,
  };
}
