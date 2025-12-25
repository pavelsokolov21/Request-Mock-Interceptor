(function () {
  let tabState = { enabled: false, selectedIds: [] };
  let interceptList = [];

  function pushStateToPage() {
    window.postMessage(
      {
        type: "intercept:update",
        payload: {
          enabled: tabState.enabled,
          selectedIds: tabState.selectedIds,
          list: interceptList,
        },
      },
      "*"
    );
  }

  // Инициализация: запросить у background
  chrome.runtime.sendMessage({ type: "content_init" }, (res) => {
    if (res?.state) tabState = res.state;
    if (Array.isArray(res?.list)) interceptList = res.list;
    pushStateToPage();
  });

  // Обновления из background
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg?.type === "stateUpdate") {
      tabState = msg.state || tabState;
      pushStateToPage();
    }
    if (msg?.type === "listUpdate") {
      interceptList = Array.isArray(msg.list) ? msg.list : interceptList;
      pushStateToPage();
    }
  });
})();
