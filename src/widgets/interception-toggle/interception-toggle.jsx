import { useEffect, useState } from "react";
import cn from "classnames";
import { useActiveTabId } from "../../shared/hooks/tab";
import { sendRuntimeMessage } from "../../shared/external/chrome";
import {
  createGetTabStateEvent,
  createSetTabInterceptionStatusEvent,
} from "../../shared/events/event-creators";
import { createTabState } from "../../shared/states/state-creators";
import { useIsReadyExtension } from "../../shared/hooks/app";

export const InterceptionToggle = () => {
  const [enabled, setEnabled] = useState(false);

  const isReady = useIsReadyExtension();

  const toggleEnabled = () => {
    if (!isReady) {
      return;
    }

    const next = !enabled;

    setEnabled(next);

    sendRuntimeMessage(
      createSetTabInterceptionStatusEvent({ tabId, enabled: next }),
    );
  };

  const tabId = useActiveTabId();

  useEffect(() => {
    if (!isReady) {
      return;
    }

    sendRuntimeMessage(createGetTabStateEvent(tabId), (res) => {
      const state = res?.state ?? createTabState(false, []);

      setEnabled(!!state.enabled);
    });
  }, [isReady, tabId]);

  return (
    <div className="flex items-center justify-between mb-3">
      <h1 className="text-base font-semibold">Request Mock Interceptor</h1>
      <label className="inline-flex items-center cursor-pointer select-none">
        <span className="mr-2">Intercept</span>
        <input
          type="checkbox"
          className="peer sr-only"
          checked={enabled}
          onChange={toggleEnabled}
          disabled={!isReady}
        />
        <span
          className={cn("w-10 h-5 rounded-full transition-colors relative", {
            "bg-green-500": enabled,
            "bg-gray-300": !enabled,
          })}
        >
          <span
            className={cn(
              "absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform",
              {
                "translate-x-5": enabled,
              },
            )}
          ></span>
        </span>
      </label>
    </div>
  );
};
