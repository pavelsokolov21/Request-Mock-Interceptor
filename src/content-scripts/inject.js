(function () {
  if (window.__interceptFetchInstalled) return;
  window.__interceptFetchInstalled = true;

  const originalFetch = window.fetch;

  const state = {
    enabled: false,
    selectedIds: [],
    list: [],
  };

  const normalizeMethod = (m) => (m || "GET").toUpperCase();

  const matchesRule = (rule, url, method) => {
    try {
      const ruleMethod = normalizeMethod(rule.method);
      const reqMethod = normalizeMethod(method);
      if (ruleMethod !== reqMethod) return false;
      if (!rule.url) return false;
      return url.includes(rule.url);
    } catch {
      return false;
    }
  };

  async function interceptedFetch(input, init = {}) {
    const url = typeof input === "string" ? input : input && input.url;
    const method =
      (init && init.method) ||
      (typeof input !== "string" && input && input.method) ||
      "GET";

    if (
      state.enabled &&
      Array.isArray(state.selectedIds) &&
      state.selectedIds.length > 0 &&
      typeof url === "string"
    ) {
      const candidates = state.list.filter((r) =>
        state.selectedIds.includes(r.id)
      );
      const rule = candidates.find((r) => matchesRule(r, url, method));
      if (rule) {
        const bodyText = rule.response || "";
        const statusCode = Number(rule.status) || 200;
        const headers = new Headers({ "Content-Type": "application/json" });
        return Promise.resolve(
          new Response(bodyText, { status: statusCode, headers })
        );
      }
    }

    return originalFetch(input, init);
  }

  try {
    window.fetch = interceptedFetch;
  } catch (e) {
    console.warn("Failed to override fetch:", e);
  }

  // Получаем обновления состояния от контент-скрипта
  window.addEventListener("message", (event) => {
    if (event.source !== window) return;
    const msg = event.data;
    if (!msg || typeof msg !== "object") return;
    if (msg.type === "intercept:update") {
      const p = msg.payload || {};
      state.enabled = !!p.enabled;
      state.selectedIds = Array.isArray(p.selectedIds) ? p.selectedIds : [];
      state.list = Array.isArray(p.list) ? p.list : state.list;
    }
  });
})();
