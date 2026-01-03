export const getLocalStorageByKey = async (key) => {
  return await chrome.storage.local.get([key]);
};
export const setLocalStorageByKey = async (key, state) => {
  return await chrome.storage.local.set({ [key]: state });
};

export const getSessionStorageByKey = async (key) => {
  try {
    const store = await chrome.storage.session.get([key]);

    return store[key];
  } catch (e) {
    return Promise.reject(e);
  }
};
export const setSessionStorageByKey = async (key, state) => {
  return await chrome.storage.session.set({ [key]: state });
};

export const getTabs = async (q = {}) => {
  return await chrome.tabs.query(q);
};
export const sendMessageToTab = async (id, msg) => {
  return await chrome.tabs.sendMessage(id, msg);
};
export const addTabsCreatedListener = (fn) => {
  chrome.tabs.onCreated.addListener(fn);
};

export const sendRuntimeMessage = async (msg, fn) => {
  await chrome.runtime.sendMessage(msg, fn);
};
export const addRuntimeMessageListener = (fn) => {
  chrome.runtime.onMessage.addListener(fn);
};
export const addRuntimeInstalledListener = (fn) => {
  chrome.runtime.onInstalled.addListener(fn);
};
export const addRuntimeStartupListener = (fn) => {
  chrome.runtime.onStartup.addListener(fn);
};

export const registerContentScripts = async (registrations) => {
  await chrome.scripting.registerContentScripts(registrations);
};
export const unregisterContentScripts = async (ids) => {
  await chrome.scripting.unregisterContentScripts({ ids });
};
