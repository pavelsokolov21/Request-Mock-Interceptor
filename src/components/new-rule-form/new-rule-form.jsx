import { useState } from "react";
import { INITIAL_DRAFT } from "./new-rule-form-constants";
import { METHODS_ARRAY } from "../../shared/constant/network";

export const NewRuleForm = ({ onAddRule: onAddRuleRaw }) => {
  const [draft, setDraft] = useState(INITIAL_DRAFT);

  const resetDraft = () => {
    setDraft(INITIAL_DRAFT);
  };

  const onResetDraft = () => resetDraft();

  const onChangeResponse = (e) => {
    setDraft((prev) => ({ ...prev, response: e.target.value }));
  };

  const onChangeStatus = (e) => {
    setDraft((prev) => ({ ...prev, status: e.target.value }));
  };

  const onChangeMethod = (e) => {
    setDraft((prev) => ({ ...prev, method: e.target.value }));
  };

  const onChangeURL = (e) => {
    setDraft((prev) => ({ ...prev, url: e.target.value }));
  };

  const onAddRule = () => {
    onAddRuleRaw(draft);
    resetDraft();
  };

  return (
    <div className="border rounded p-3 mb-3">
      <div className="font-medium mb-2">Add rule</div>

      <div className="space-y-2">
        <input
          className="border rounded px-2 py-1 w-full"
          placeholder="URL or part of the path"
          value={draft.url}
          onChange={onChangeURL}
        />

        <div className="grid grid-cols-2 gap-2">
          <select
            className="border rounded px-2 py-1 w-full"
            value={draft.method}
            onChange={onChangeMethod}
          >
            {METHODS_ARRAY.map((method) => {
              return <option key={method}>{method}</option>;
            })}
          </select>
          <input
            className="border rounded px-2 py-1 w-full"
            placeholder="Status, e.g 200"
            value={draft.status}
            onChange={onChangeStatus}
          />
        </div>

        <textarea
          className="border rounded px-2 py-1 w-full h-24"
          placeholder='Response, e.g. {"ok":true}'
          value={draft.response}
          onChange={onChangeResponse}
        />
      </div>

      <div className="mt-2 flex gap-2">
        <button
          className="px-3 py-1 rounded bg-blue-600 text-white"
          onClick={onAddRule}
        >
          Add
        </button>
        <button
          className="px-3 py-1 rounded bg-gray-200"
          onClick={onResetDraft}
        >
          Clear
        </button>
      </div>
    </div>
  );
};
