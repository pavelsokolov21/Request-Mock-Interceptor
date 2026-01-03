import { useEffect, useState } from "react";
import { createGetActiveTabEvent } from "../events/event-creators";
import { sendRuntimeMessage } from "../external/chrome";

export const useActiveTabId = () => {
  const [tabId, setTabId] = useState(null);

  useEffect(() => {
    sendRuntimeMessage(createGetActiveTabEvent(), (res) => {
      setTabId(res?.tabId ?? null);
    });
  }, []);

  return tabId;
};
