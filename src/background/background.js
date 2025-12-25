const INJECT_ID = "inject-main";
const INJECT_FILE = "content-scripts/inject.js";

async function registerInject() {
  // Сначала удалим прежнюю регистрацию, если была
  try {
    await chrome.scripting.unregisterContentScripts({ ids: [INJECT_ID] });
  } catch (_) {}

  await chrome.scripting.registerContentScripts([
    {
      id: INJECT_ID,
      matches: ["<all_urls>"],
      js: [INJECT_FILE],
      runAt: "document_start",
      world: "MAIN",
    },
  ]);
}

// Регистрируем на установку и на старт браузера
chrome.runtime.onInstalled.addListener(registerInject);
chrome.runtime.onStartup.addListener(registerInject);

// Управляет общим списком (chrome.storage.local) и состоянием по табам (chrome.storage.session + runtime память).
// Координирует обмен между popup и content script.

const LIST_KEY = "interceptList"; // общий список правил
// tab state храним в storage.session под ключом tabState:<tabId>

const inMemoryTabState = new Map(); // { tabId: { enabled, selectedIds } }

function sessionKey(tabId) {
  return `tabState:${tabId}`;
}

async function getList() {
  const res = await chrome.storage.local.get([LIST_KEY]);
  const list = Array.isArray(res[LIST_KEY]) ? res[LIST_KEY] : [];
  return list;
}

async function setList(list) {
  await chrome.storage.local.set({ [LIST_KEY]: list });
  // всем табам отправим обновление
  const tabs = await chrome.tabs.query({});

  for (const t of tabs) {
    chrome.tabs.sendMessage(t.id, { type: "listUpdate", list });
  }
}

async function getTabState(tabId) {
  if (!tabId && tabId !== 0) return { enabled: false, selectedIds: [] };
  // приоритет: память -> session storage
  if (inMemoryTabState.has(tabId)) {
    return inMemoryTabState.get(tabId);
  }
  const key = sessionKey(tabId);
  const res = await chrome.storage.session.get([key]);
  const state = res[key] || { enabled: false, selectedIds: [] };
  inMemoryTabState.set(tabId, state);
  return state;
}

async function setTabState(tabId, state) {
  const safe = {
    enabled: !!state.enabled,
    selectedIds: Array.isArray(state.selectedIds) ? state.selectedIds : [],
  };
  inMemoryTabState.set(tabId, safe);
  const key = sessionKey(tabId);
  await chrome.storage.session.set({ [key]: safe });

  // уведомим контент-скрипт конкретного таба
  try {
    await chrome.tabs.sendMessage(tabId, { type: "stateUpdate", state: safe });
  } catch (e) {
    // таб мог не иметь контент-скрипт (например, chrome:// страницы) — игнорируем
  }
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  // Контент-скрипт при старте
  if (msg?.type === "content_init") {
    (async () => {
      const tabId = sender?.tab?.id;
      const [state, list] = await Promise.all([getTabState(tabId), getList()]);
      sendResponse({ state, list });
    })();
    return true; // async
  }

  // Popup: получить активный таб
  if (msg?.type === "getActiveTabId") {
    (async () => {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      sendResponse({ tabId: tab?.id });
    })();
    return true;
  }

  // Popup: получить общий список
  if (msg?.type === "getList") {
    (async () => {
      const list = await getList();
      sendResponse({ list });
    })();
    return true;
  }

  // Popup: сохранить общий список
  if (msg?.type === "setList") {
    (async () => {
      await setList(Array.isArray(msg.list) ? msg.list : []);
      sendResponse({ ok: true });
    })();
    return true;
  }

  // Popup: получить состояние таба
  if (msg?.type === "getTabState") {
    (async () => {
      const tabId = msg.tabId ?? sender?.tab?.id;
      const state = await getTabState(tabId);
      sendResponse({ state });
    })();
    return true;
  }

  // Popup: установить состояние таба
  if (msg?.type === "setTabState") {
    (async () => {
      const tabId = msg.tabId;
      await setTabState(tabId, msg.state || {});
      sendResponse({ ok: true });
    })();
    return true;
  }
});
