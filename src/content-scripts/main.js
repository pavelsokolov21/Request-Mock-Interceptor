import {
  createInitEvent,
  createInterceptionStateEvent,
} from "../shared/events/event-creators";
import { MAIN_CONTENT_SCRIPT_EVENTS } from "../shared/events/events";
import {
  addRuntimeMessageListener,
  sendRuntimeMessage,
} from "../shared/external/chrome";
import { createTabState } from "../shared/states/state-creators";

(function () {
  let tabState = createTabState(false, []);
  let interceptList = [];

  function pushStateToPage() {
    window.postMessage(
      createInterceptionStateEvent({
        enabled: tabState.enabled,
        selectedIds: tabState.selectedIds,
        list: interceptList,
      }),
      "*",
    );
  }

  sendRuntimeMessage(createInitEvent(), (res) => {
    if (res?.state) {
      tabState = res.state;
    }
    if (Array.isArray(res?.list)) {
      interceptList = res.list;
    }

    pushStateToPage();
  });

  addRuntimeMessageListener((msg) => {
    if (msg?.type === MAIN_CONTENT_SCRIPT_EVENTS.UPDATE_TAB_STATE) {
      tabState = msg.payload ?? tabState;

      pushStateToPage();
    }

    if (msg?.type === MAIN_CONTENT_SCRIPT_EVENTS.UPDATE_INTERCEPTION_LIST) {
      interceptList = Array.isArray(msg.payload) ? msg.payload : interceptList;

      pushStateToPage();
    }
  });
})();
