
export const writeStorage = (key: string, val: any) => chrome.storage.local.set({ [key]: val });

export const readStorage = (key: string) =>
  new Promise<any>(resolve => chrome.storage.local.get(key, (items: any) => resolve(items[key])));

const METAMASK_ID = 'nkbihfbeogaeaoehlefnkodbefgpgknn';

export const metamaskExists = () => new Promise<boolean>(resolve => {
  const port = chrome.runtime.connect(METAMASK_ID);
  port.onDisconnect.addListener(() => {
    if (chrome.runtime.lastError
      && chrome.runtime.lastError.message === 'Could not establish connection. Receiving end does not exist.') {
      resolve(false);
    }
  });
  setTimeout(() => resolve(true), 1);
});
