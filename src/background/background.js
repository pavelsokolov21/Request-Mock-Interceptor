import { DEFAULT_INTERCEPTION_STATE } from "../shared/constant/state";
import {
  createUpdateInterceptionListEvent,
  createUpdateTabStateEvent,
} from "../shared/events/event-creators";
import { BACKGROUND_EVENTS } from "../shared/events/events";
import {
  addRuntimeInstalledListener,
  addRuntimeMessageListener,
  addRuntimeStartupListener,
  getLocalStorageByKey,
  getSessionStorageByKey,
  getTabs,
  registerContentScripts,
  sendMessageToTab,
  setLocalStorageByKey,
  setSessionStorageByKey,
  unregisterContentScripts,
} from "../shared/external/chrome";
import { createTabState } from "../shared/states/state-creators";
import { withPrefix } from "../shared/utils/string";

const INJECT_ID = "inject-main";
const INJECT_FILE = "js/injections/main.js";

const registerInject = async () => {
  try {
    await unregisterContentScripts();
  } catch (e) {
    console.error(e);
  }

  await registerContentScripts([
    {
      id: INJECT_ID,
      matches: ["<all_urls>"],
      js: [INJECT_FILE],
      runAt: "document_start",
      world: "MAIN",
    },
  ]);
};

addRuntimeInstalledListener(registerInject);
addRuntimeStartupListener(registerInject);

const LIST_KEY = "interceptList";

const inMemoryTabState = new Map();

const getSessionKey = (tabId) => {
  return withPrefix("tabState", tabId);
};

const getList = async () => {
  const res = await getLocalStorageByKey(LIST_KEY);
  const list = Array.isArray(res[LIST_KEY]) ? res[LIST_KEY] : [];

  return list;
};

const setList = async (list) => {
  await setLocalStorageByKey(LIST_KEY, list);

  const tabs = await getTabs();

  for (const tab of tabs) {
    sendMessageToTab(tab.id, createUpdateInterceptionListEvent(list));
  }
};

const getTabState = async (tabId) => {
  if (!tabId && tabId !== 0) {
    return DEFAULT_INTERCEPTION_STATE;
  }
  // приоритет: память -> session storage
  if (inMemoryTabState.has(tabId)) {
    return inMemoryTabState.get(tabId);
  }

  const key = getSessionKey(tabId);
  const res = await getSessionStorageByKey(key);
  const state = res ?? DEFAULT_INTERCEPTION_STATE;

  inMemoryTabState.set(tabId, state);

  return state;
};

const setTabState = async (tabId, state) => {
  const nextTabState = createTabState(
    !!state.enabled,
    Array.isArray(state.selectedIds) ? state.selectedIds : [],
  );
  const key = getSessionKey(tabId);

  inMemoryTabState.set(tabId, nextTabState);

  await setSessionStorageByKey(key, nextTabState);

  try {
    await sendMessageToTab(tabId, createUpdateTabStateEvent(nextTabState));
  } catch (e) {
    console.error(e);
  }
};

const setTabInterceptionEnabled = async (tabId, enabled) => {
  const key = getSessionKey(tabId);

  inMemoryTabState.set(tabId, {
    ...(inMemoryTabState.get(tabId) ?? DEFAULT_INTERCEPTION_STATE),
    enabled,
  });

  try {
    const state = await getSessionStorageByKey(key);
    const newState = { ...state, enabled };

    await setSessionStorageByKey(key, newState);
    await sendMessageToTab(tabId, createUpdateTabStateEvent(newState));
  } catch (e) {
    console.error(e);
  }
};

const setTabInterceptionList = async (tabId, list) => {
  const key = getSessionKey(tabId);

  inMemoryTabState.set(tabId, {
    ...(inMemoryTabState.get(tabId) ?? DEFAULT_INTERCEPTION_STATE),
    selectedIds: list,
  });

  try {
    const state = await getSessionStorageByKey(key);
    const newState = { ...state, selectedIds: list };

    await setSessionStorageByKey(key, newState);
    await sendMessageToTab(tabId, createUpdateTabStateEvent(newState));
  } catch (e) {
    console.error(e);
  }
};

addRuntimeMessageListener((msg, sender, sendResponse) => {
  if (msg?.type === BACKGROUND_EVENTS.INIT) {
    (async () => {
      const tabId = sender?.tab?.id;
      const [state, list] = await Promise.all([getTabState(tabId), getList()]);

      sendResponse({ state, list });
    })();

    return true;
  }

  if (msg?.type === BACKGROUND_EVENTS.GET_ACTIVE_TAB_ID) {
    (async () => {
      const [tab] = await getTabs({
        active: true,
        currentWindow: true,
      });

      sendResponse({ tabId: tab?.id });
    })();

    return true;
  }

  if (msg?.type === BACKGROUND_EVENTS.GET_INTERCEPTION_LIST) {
    (async () => {
      const list = await getList();

      sendResponse({ list });
    })();

    return true;
  }

  if (msg?.type === BACKGROUND_EVENTS.SET_INTERCEPTION_LIST) {
    (async () => {
      await setList(Array.isArray(msg.payload) ? msg.payload : []);
      sendResponse({ ok: true });
    })();

    return true;
  }

  if (msg?.type === BACKGROUND_EVENTS.GET_TAB_STATE) {
    (async () => {
      const tabId = msg.payload ?? sender?.tab?.id;
      const state = await getTabState(tabId);

      sendResponse({ state });
    })();

    return true;
  }

  if (msg?.type === BACKGROUND_EVENTS.SET_TAB_STATE) {
    (async () => {
      const tabId = msg.payload.tabId ?? sender?.tab?.id;

      await setTabState(tabId, msg.payload.state ?? {});
      sendResponse({ ok: true });
    })();

    return true;
  }

  if (msg?.type === BACKGROUND_EVENTS.SET_TAB_INTERCEPTION_STATUS) {
    (async () => {
      const tabId = msg.payload.tabId ?? sender?.tab?.id;

      await setTabInterceptionEnabled(tabId, msg.payload.enabled);
      sendResponse({ ok: true });
    })();

    return true;
  }

  if (msg?.type === BACKGROUND_EVENTS.SET_TAB_INTERCEPTION_LIST) {
    (async () => {
      const tabId = msg.payload.tabId ?? sender?.tab?.id;

      await setTabInterceptionList(tabId, msg.payload.list);
      sendResponse({ ok: true });
    })();

    return true;
  }
});
