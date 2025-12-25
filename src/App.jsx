import React, { useEffect, useState } from "react";

function useActiveTabId() {
  const [tabId, setTabId] = useState(null);
  useEffect(() => {
    chrome.runtime.sendMessage({ type: "getActiveTabId" }, (res) => {
      setTabId(res?.tabId ?? null);
    });
  }, []);
  return tabId;
}

export default function App() {
  const tabId = useActiveTabId();
  const [list, setList] = useState([]); // общий список правил
  const [enabled, setEnabled] = useState(false); // состояние для текущего таба
  const [selectedIds, setSelectedIds] = useState([]); // выбранные чекбоксы для текущего таба

  // Загрузка общего списка
  useEffect(() => {
    chrome.runtime.sendMessage({ type: "getList" }, (res) => {
      setList(Array.isArray(res?.list) ? res.list : []);
    });
  }, []);

  // Загрузка состояния текущего таба
  useEffect(() => {
    if (tabId == null) return;
    chrome.runtime.sendMessage({ type: "getTabState", tabId }, (res) => {
      const st = res?.state || { enabled: false, selectedIds: [] };
      setEnabled(!!st.enabled);
      setSelectedIds(Array.isArray(st.selectedIds) ? st.selectedIds : []);
    });
  }, [tabId]);

  // Сохранение состояния таба
  const persistTabState = (next) => {
    if (tabId == null) return;
    chrome.runtime.sendMessage(
      { type: "setTabState", tabId, state: next },
      () => {}
    );
  };

  // Обработчики состояния таба
  const toggleEnabled = () => {
    const next = !enabled;
    setEnabled(next);
    persistTabState({ enabled: next, selectedIds });
  };

  const onToggleItem = (id) => {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((x) => x !== id)
      : [...selectedIds, id];
    setSelectedIds(next);
    persistTabState({ enabled, selectedIds: next });
  };

  const selectAll = () => {
    const allIds = list.map((r) => r.id);
    setSelectedIds(allIds);
    persistTabState({ enabled, selectedIds: allIds });
  };

  const deselectAll = () => {
    setSelectedIds([]);
    persistTabState({ enabled, selectedIds: [] });
  };

  // Управление общим списком: добавление/редактирование/удаление
  const [draft, setDraft] = useState({
    url: "",
    method: "GET",
    response: "",
    status: "200",
  });

  const addRule = () => {
    const id = crypto.randomUUID();
    const rule = {
      id,
      url: String(draft.url || "").trim(),
      method: String(draft.method || "GET").toUpperCase(),
      response: String(draft.response || ""),
      status: String(draft.status || "200"),
    };
    const nextList = [...list, rule];
    setList(nextList);
    chrome.runtime.sendMessage({ type: "setList", list: nextList }, () => {});
    setDraft({ url: "", method: "GET", response: "", status: "200" });
  };

  const removeRule = (id) => {
    const nextList = list.filter((r) => r.id !== id);
    setList(nextList);
    chrome.runtime.sendMessage({ type: "setList", list: nextList }, () => {});
    if (selectedIds.includes(id)) {
      const nextSel = selectedIds.filter((x) => x !== id);
      setSelectedIds(nextSel);
      persistTabState({ enabled, selectedIds: nextSel });
    }
  };

  const updateRuleField = (id, field, value) => {
    const nextList = list.map((r) =>
      r.id === id ? { ...r, [field]: value } : r
    );
    setList(nextList);
    chrome.runtime.sendMessage({ type: "setList", list: nextList }, () => {});
  };

  const isReady = tabId != null;

  return (
    <div className="p-3 w-[360px] max-w-[360px] text-sm">
      {/* Заголовок + переключатель */}
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-base font-semibold">Перехват запросов</h1>
        <label className="inline-flex items-center cursor-pointer select-none">
          <span className="mr-2">Перехват</span>
          <input
            type="checkbox"
            className="peer sr-only"
            checked={enabled}
            onChange={toggleEnabled}
            disabled={!isReady}
          />
          <span
            className={`w-10 h-5 rounded-full transition-colors ${
              enabled ? "bg-green-500" : "bg-gray-300"
            } relative`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                enabled ? "translate-x-5" : ""
              }`}
            ></span>
          </span>
        </label>
      </div>

      {/* Блок добавления правила */}
      <div className="border rounded p-3 mb-3">
        <div className="font-medium mb-2">Добавить правило</div>

        <div className="space-y-2">
          <input
            className="border rounded px-2 py-1 w-full"
            placeholder="URL или часть пути"
            value={draft.url}
            onChange={(e) => setDraft({ ...draft, url: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-2">
            <select
              className="border rounded px-2 py-1 w-full"
              value={draft.method}
              onChange={(e) => setDraft({ ...draft, method: e.target.value })}
            >
              <option>GET</option>
              <option>POST</option>
              <option>PUT</option>
              <option>PATCH</option>
              <option>DELETE</option>
            </select>
            <input
              className="border rounded px-2 py-1 w-full"
              placeholder="Статус (например: 200)"
              value={draft.status}
              onChange={(e) => setDraft({ ...draft, status: e.target.value })}
            />
          </div>

          <textarea
            className="border rounded px-2 py-1 w-full h-24"
            placeholder='Response (например: {"ok":true})'
            value={draft.response}
            onChange={(e) => setDraft({ ...draft, response: e.target.value })}
          />
        </div>

        <div className="mt-2 flex gap-2">
          <button
            className="px-3 py-1 rounded bg-blue-600 text-white"
            onClick={addRule}
          >
            Добавить
          </button>
          <button
            className="px-3 py-1 rounded bg-gray-200"
            onClick={() =>
              setDraft({ url: "", method: "GET", response: "", status: "200" })
            }
          >
            Очистить
          </button>
        </div>
      </div>

      {/* Кнопки выбора */}
      <div className="mb-2 flex gap-2">
        <button
          className="px-3 py-1 rounded bg-gray-200"
          onClick={selectAll}
          disabled={!isReady}
        >
          Выбрать все
        </button>
        <button
          className="px-3 py-1 rounded bg-gray-200"
          onClick={deselectAll}
          disabled={!isReady}
        >
          Отменить все
        </button>
      </div>

      {/* Список правил */}
      <div className="border rounded">
        <div className="p-2 font-medium border-b">Список правил</div>
        <ul className="max-h-[360px] overflow-auto">
          {list.length === 0 ? (
            <li className="p-2 text-gray-500">Список пуст</li>
          ) : (
            list.map((r) => {
              const checked = selectedIds.includes(r.id);
              return (
                <li key={r.id} className="p-2 border-b last:border-b-0">
                  {/* Верхняя строка: чекбокс + кнопка удаления */}
                  <div className="flex items-center justify-between mb-2">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => onToggleItem(r.id)}
                        disabled={!isReady}
                      />
                      <span className="text-gray-700">
                        Активировать правило
                      </span>
                    </label>

                    <button
                      className="px-2 py-1 rounded bg-red-500 text-white"
                      onClick={() => removeRule(r.id)}
                      title="Удалить правило"
                    >
                      Удалить
                    </button>
                  </div>

                  {/* URL — отдельной строкой во всю ширину */}
                  <div className="mb-2">
                    <label className="block text-xs text-gray-600 mb-1">
                      URL или часть пути
                    </label>
                    <input
                      className="border rounded px-2 py-1 w-full"
                      value={r.url}
                      onChange={(e) =>
                        updateRuleField(r.id, "url", e.target.value)
                      }
                      placeholder="Например: /api/users"
                    />
                  </div>

                  {/* Метод и статус — компактная сетка */}
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Метод
                      </label>
                      <select
                        className="border rounded px-2 py-1 w-full"
                        value={r.method}
                        onChange={(e) =>
                          updateRuleField(r.id, "method", e.target.value)
                        }
                      >
                        <option>GET</option>
                        <option>POST</option>
                        <option>PUT</option>
                        <option>PATCH</option>
                        <option>DELETE</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Статус-код
                      </label>
                      <input
                        className="border rounded px-2 py-1 w-full"
                        value={r.status}
                        onChange={(e) =>
                          updateRuleField(r.id, "status", e.target.value)
                        }
                        placeholder="200"
                      />
                    </div>
                  </div>

                  {/* Response — отдельной строкой */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Response
                    </label>
                    <textarea
                      className="border rounded px-2 py-1 w-full h-20"
                      value={r.response}
                      onChange={(e) =>
                        updateRuleField(r.id, "response", e.target.value)
                      }
                      placeholder='Например: {"success":true}'
                    />
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </div>

      <div className="mt-3 text-xs text-gray-500">
        Перехват работает только в активном табе. Список правил общий для всех
        табов. Отмеченные чекбоксы — только для текущего таба.
      </div>
    </div>
  );
}
