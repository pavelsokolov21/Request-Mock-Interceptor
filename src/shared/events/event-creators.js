import {
  BACKGROUND_EVENTS,
  MAIN_CONTENT_SCRIPT_EVENTS,
  WINDOW_EVENTS,
} from "./events";

const createEvent = (type, payload) => ({
  type,
  payload,
});

const withPayloadEvent = (type) => (payload) => createEvent(type, payload);

export const createInitEvent = withPayloadEvent(BACKGROUND_EVENTS.INIT);
export const createGetActiveTabEvent = withPayloadEvent(
  BACKGROUND_EVENTS.GET_ACTIVE_TAB_ID,
);
export const createGetInterceptionListEvent = withPayloadEvent(
  BACKGROUND_EVENTS.GET_INTERCEPTION_LIST,
);
export const createSetInterceptionListEvent = withPayloadEvent(
  BACKGROUND_EVENTS.SET_INTERCEPTION_LIST,
);
export const createGetTabStateEvent = withPayloadEvent(
  BACKGROUND_EVENTS.GET_TAB_STATE,
);
export const createSetTabStateEvent = withPayloadEvent(
  BACKGROUND_EVENTS.SET_TAB_STATE,
);
export const createSetTabInterceptionStatusEvent = withPayloadEvent(
  BACKGROUND_EVENTS.SET_TAB_INTERCEPTION_STATUS,
);
export const createSetTabInterceptionListEvent = withPayloadEvent(
  BACKGROUND_EVENTS.SET_TAB_INTERCEPTION_LIST,
);

export const createUpdateInterceptionListEvent = withPayloadEvent(
  MAIN_CONTENT_SCRIPT_EVENTS.UPDATE_INTERCEPTION_LIST,
);
export const createUpdateTabStateEvent = withPayloadEvent(
  MAIN_CONTENT_SCRIPT_EVENTS.UPDATE_TAB_STATE,
);

export const createInterceptionStateEvent = withPayloadEvent(
  WINDOW_EVENTS.UPDATE_INTERCEPTION_STATE,
);
