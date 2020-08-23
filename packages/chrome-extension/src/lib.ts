
export const writeStorage = (key: string, val: any) => chrome.storage.local.set({ [key]: val });

export const readStorage = (key: string) =>
  new Promise(resolve => chrome.storage.local.get(key, (items: any) => resolve(items[key])));