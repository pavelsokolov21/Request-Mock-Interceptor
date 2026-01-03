import { isNil } from "../utils/boolean";
import { useActiveTabId } from "./tab";

export const useIsReadyExtension = () => {
  const tabId = useActiveTabId();

  return !isNil(tabId);
};
