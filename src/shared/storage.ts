import type { StorageData } from './types';

const DEFAULT_STORAGE: StorageData = {
  apiKey: '',
  businessContext: '',
  tone: 'professional',
};

export async function getStorageData(): Promise<StorageData> {
  return new Promise((resolve) => {
    chrome.storage.sync.get(DEFAULT_STORAGE, (result) => {
      resolve(result as StorageData);
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

export async function getApiKey(): Promise<string> {
  const data = await getStorageData();
  return data.apiKey;
}

export async function setApiKey(apiKey: string): Promise<void> {
  await setStorageData({ apiKey });
}

export async function getBusinessContext(): Promise<string> {
  const data = await getStorageData();
  return data.businessContext;
}

export async function setBusinessContext(businessContext: string): Promise<void> {
  await setStorageData({ businessContext });
}

export async function getTone(): Promise<string> {
  const data = await getStorageData();
  return data.tone;
}

export async function setTone(tone: string): Promise<void> {
  await setStorageData({ tone });
}
