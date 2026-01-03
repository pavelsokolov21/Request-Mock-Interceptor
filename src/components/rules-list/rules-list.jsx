import { METHODS_ARRAY } from "../../shared/constant/network";

export const RulesList = ({
  list,
  selectedRules,
  onSelectAll,
  onDeselectAll,
  onToggleRule,
  onRemoveRule,
  onUpdateRule,
  isReady,
}) => {
  return (
    <>
      <div className="mb-2 flex gap-2">
        <button
          className="px-3 py-1 rounded bg-gray-200"
          onClick={onSelectAll}
          disabled={!isReady}
        >
          Select all
        </button>
        <button
          className="px-3 py-1 rounded bg-gray-200"
          onClick={onDeselectAll}
          disabled={!isReady}
        >
          Cancel all
        </button>
      </div>
      <div className="border rounded">
        <div className="p-2 font-medium border-b">List of rules</div>
        <ul className="max-h-[360px] overflow-auto">
          {list.length === 0 ? (
            <li className="p-2 text-gray-500">List is empty</li>
          ) : (
            list.map((r) => {
              const checked = selectedRules.includes(r.id);

              return (
                <li key={r.id} className="p-2 border-b last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => onToggleRule(r.id)}
                        disabled={!isReady}
                      />
                      <span className="text-gray-700">Activate rule</span>
                    </label>

                    <button
                      className="px-2 py-1 rounded bg-red-500 text-white"
                      onClick={() => onRemoveRule(r.id)}
                      title="Удалить правило"
                    >
                      Delete
                    </button>
                  </div>

                  <div className="mb-2">
                    <label className="block text-xs text-gray-600 mb-1">
                      URL or part of the path
                    </label>
                    <input
                      className="border rounded px-2 py-1 w-full"
                      value={r.url}
                      onChange={(e) => {
                        onUpdateRule(r.id, "url", e.target.value);
                      }}
                      placeholder="Например: /api/users"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Method
                      </label>
                      <select
                        className="border rounded px-2 py-1 w-full"
                        value={r.method}
                        onChange={(e) => {
                          onUpdateRule(r.id, "method", e.target.value);
                        }}
                      >
                        {METHODS_ARRAY.map((method) => {
                          return <option key={method}>{method}</option>;
                        })}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Status
                      </label>
                      <input
                        className="border rounded px-2 py-1 w-full"
                        value={r.status}
                        onChange={(e) => {
                          onUpdateRule(r.id, "status", e.target.value);
                        }}
                        placeholder="200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Response
                    </label>
                    <textarea
                      className="border rounded px-2 py-1 w-full h-20"
                      value={r.response}
                      onChange={(e) => {
                        onUpdateRule(r.id, "response", e.target.value);
                      }}
                      placeholder='e.g. {"success":true}'
                    />
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </>
  );
};
