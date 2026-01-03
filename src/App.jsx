import { useCallback, useState } from "react";
import { createSetInterceptionListEvent } from "./shared/events/event-creators";
import { sendRuntimeMessage } from "./shared/external/chrome";
import { METHODS } from "./shared/constant/network";
import { NewRuleForm } from "./components/new-rule-form/new-rule-form";
import { StatefulRulesList } from "./widgets/stateful-rules-list/stateful-rules-list";
import { InterceptionToggle } from "./widgets/interception-toggle/interception-toggle";

export default function App() {
  const [list, setList] = useState([]);

  const onAddRule = (draft) => {
    const id = crypto.randomUUID();
    const rule = {
      id,
      url: String(draft.url || "").trim(),
      method: String(draft.method || METHODS.GET).toUpperCase(),
      response: String(draft.response || ""),
      status: String(draft.status || "200"),
    };
    const nextList = [rule, ...list];

    setList(nextList);
    sendRuntimeMessage(createSetInterceptionListEvent(nextList));
  };

  const onListChange = useCallback((list) => {
    setList(list);
  }, []);

  return (
    <div className="p-3 w-[360px] max-w-[360px] text-sm">
      <InterceptionToggle />
      <NewRuleForm onAddRule={onAddRule} />
      <StatefulRulesList onListChange={onListChange} />
      <div className="mt-3 text-xs text-gray-500">
        Interception only works in the active tab. The list of rules is the same
        for all tabs. Checked checkboxes apply only to the current tab.
      </div>
    </div>
  );
}
