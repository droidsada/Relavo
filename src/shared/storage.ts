import type { StorageData, LLMProvider, ApiKeys, SystemPrompts, WidgetPosition } from './types';
import { DEFAULT_SYSTEM_PROMPTS, AVAILABLE_MODELS } from './types';

const DEFAULT_STORAGE: StorageData = {
  // API Configuration
  activeProvider: 'anthropic',
  apiKeys: {},
  model: 'claude-sonnet-4-20250514',

  // Behavior Settings
  autoFetchProfile: true,
  widgetPosition: 'top-right',

  // Prompts
  systemPrompts: DEFAULT_SYSTEM_PROMPTS,

  // Message Generation Defaults
  businessContext: '',
  defaultVibe: 'professional',
  defaultRelationship: 'cold',
};

export async function getStorageData(): Promise<StorageData> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(DEFAULT_STORAGE, (result) => {
      // Merge with defaults to ensure all fields exist
      const merged = { ...DEFAULT_STORAGE, ...result };
      // Ensure nested objects are properly merged
      merged.apiKeys = { ...DEFAULT_STORAGE.apiKeys, ...result.apiKeys };
      merged.systemPrompts = { ...DEFAULT_STORAGE.systemPrompts, ...result.systemPrompts };
      resolve(merged as StorageData);
    });
  });
}

export async function setStorageData(data: Partial<StorageData>): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.sync.set(data, () => {
      resolve();
    });
  });
}

// Provider & API Key Management
export async function getActiveProvider(): Promise<LLMProvider> {
  const data = await getStorageData();
  return data.activeProvider;
}

export async function setActiveProvider(provider: LLMProvider): Promise<void> {
  // When switching providers, also update the model to the first available for that provider
  const defaultModel = AVAILABLE_MODELS[provider][0].id;
  await setStorageData({ activeProvider: provider, model: defaultModel });
}

export async function getApiKeys(): Promise<ApiKeys> {
  const data = await getStorageData();
  return data.apiKeys;
}

export async function setApiKey(provider: LLMProvider, apiKey: string): Promise<void> {
  const currentKeys = await getApiKeys();
  await setStorageData({
    apiKeys: { ...currentKeys, [provider]: apiKey },
  });
}

export async function getActiveApiKey(): Promise<string | undefined> {
  const data = await getStorageData();
  return data.apiKeys[data.activeProvider];
}

// Model Management
export async function getModel(): Promise<string> {
  const data = await getStorageData();
  return data.model;
}

export async function setModel(model: string): Promise<void> {
  await setStorageData({ model });
}

// Auto-fetch Setting
export async function getAutoFetchProfile(): Promise<boolean> {
  const data = await getStorageData();
  return data.autoFetchProfile;
}

export async function setAutoFetchProfile(autoFetch: boolean): Promise<void> {
  await setStorageData({ autoFetchProfile: autoFetch });
}

// Widget Position
export async function getWidgetPosition(): Promise<WidgetPosition> {
  const data = await getStorageData();
  return data.widgetPosition;
}

export async function setWidgetPosition(position: WidgetPosition): Promise<void> {
  await setStorageData({ widgetPosition: position });
}

// System Prompts
export async function getSystemPrompts(): Promise<SystemPrompts> {
  const data = await getStorageData();
  return data.systemPrompts;
}

export async function setSystemPrompts(prompts: Partial<SystemPrompts>): Promise<void> {
  const current = await getSystemPrompts();
  await setStorageData({
    systemPrompts: { ...current, ...prompts },
  });
}

export async function resetSystemPrompts(): Promise<void> {
  await setStorageData({ systemPrompts: DEFAULT_SYSTEM_PROMPTS });
}

// Business Context
export async function getBusinessContext(): Promise<string> {
  const data = await getStorageData();
  return data.businessContext;
}

export async function setBusinessContext(businessContext: string): Promise<void> {
  await setStorageData({ businessContext });
}

// Default Message Options
export async function getDefaultVibe(): Promise<string> {
  const data = await getStorageData();
  return data.defaultVibe;
}

export async function setDefaultVibe(vibe: string): Promise<void> {
  await setStorageData({ defaultVibe: vibe });
}

export async function getDefaultRelationship(): Promise<string> {
  const data = await getStorageData();
  return data.defaultRelationship;
}

export async function setDefaultRelationship(relationship: string): Promise<void> {
  await setStorageData({ defaultRelationship: relationship });
}

// Helper to check if provider is configured
export async function isProviderConfigured(provider?: LLMProvider): Promise<boolean> {
  const data = await getStorageData();
  const targetProvider = provider || data.activeProvider;
  const apiKey = data.apiKeys[targetProvider];
  return !!apiKey && apiKey.length > 0;
}
