import { withPrefix } from "../utils/string";

const withKeyPrefix = (obj, prefix) => {
  const newObj = {};

  for (const key in obj) {
    newObj[key] = withPrefix(obj[key], prefix);
  }

  return newObj;
};

export const BACKGROUND_EVENTS = withKeyPrefix(
  {
    INIT: "init",
    GET_ACTIVE_TAB_ID: "getActiveTabId",
    GET_INTERCEPTION_LIST: "getInterceptionList",
    SET_INTERCEPTION_LIST: "setInterceptionList",
    GET_TAB_STATE: "getTabState",
    SET_TAB_STATE: "setTabState",
    SET_TAB_INTERCEPTION_STATUS: "setTabInterceptionStatus",
    SET_TAB_INTERCEPTION_LIST: "setTabInterceptionList",
  },
  "background",
);

export const MAIN_CONTENT_SCRIPT_EVENTS = withKeyPrefix(
  {
    UPDATE_INTERCEPTION_LIST: "updateInterceptionList",
    UPDATE_TAB_STATE: "updateTabState",
  },
  "mainContentScript",
);

export const WINDOW_EVENTS = withKeyPrefix(
  {
    UPDATE_INTERCEPTION_STATE: "updateInterceptionState",
  },
  "window",
);
