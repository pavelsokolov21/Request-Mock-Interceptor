import { useEffect, useState, memo } from "react";
import { RulesList } from "../../components/rules-list/rules-list";
import { sendRuntimeMessage } from "../../shared/external/chrome";
import {
  createGetInterceptionListEvent,
  createGetTabStateEvent,
  createSetInterceptionListEvent,
  createSetTabInterceptionListEvent,
} from "../../shared/events/event-creators";
import { createTabState } from "../../shared/states/state-creators";
import { useIsReadyExtension } from "../../shared/hooks/app";
import { isNil } from "../../shared/utils/boolean";
import { useActiveTabId } from "../../shared/hooks/tab";
import { noop } from "../../shared/utils/functions";

export const StatefulRulesList = memo(
  ({ onListChange = noop, onSelectedRulesIdsChange = noop }) => {
    const [list, setList] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);

    const tabId = useActiveTabId();

    useEffect(() => {
      sendRuntimeMessage(createGetInterceptionListEvent(), (res) => {
        setList(Array.isArray(res?.list) ? res.list : []);
      });
    });

    useEffect(() => {
      if (isNil(tabId)) {
        return;
      }

      sendRuntimeMessage(createGetTabStateEvent(tabId), (res) => {
        const state = res?.state ?? createTabState(false, []);

        setSelectedIds(
          Array.isArray(state.selectedIds) ? state.selectedIds : [],
        );
      });
    }, [tabId]);

    useEffect(() => {
      onListChange(list);
    }, [list, onListChange]);

    useEffect(() => {
      onSelectedRulesIdsChange(selectedIds);
    }, [selectedIds, onSelectedRulesIdsChange]);

    const persistTabState = (list) => {
      if (isNil(tabId)) {
        return;
      }

      sendRuntimeMessage(createSetTabInterceptionListEvent({ tabId, list }));
    };

    const onToggleRule = (id) => {
      const next = selectedIds.includes(id)
        ? selectedIds.filter((x) => x !== id)
        : [...selectedIds, id];

      setSelectedIds(next);
      persistTabState(next);
    };

    const onSelectAll = () => {
      const allIds = list.map((r) => r.id);

      setSelectedIds(allIds);
      persistTabState(allIds);
    };

    const onDeselectAll = () => {
      setSelectedIds([]);
      persistTabState([]);
    };

    const onRemoveRule = (id) => {
      const nextList = list.filter((r) => r.id !== id);

      setList(nextList);
      sendRuntimeMessage(createSetInterceptionListEvent(nextList));

      if (selectedIds.includes(id)) {
        const nextSelected = selectedIds.filter((x) => x !== id);

        setSelectedIds(nextSelected);
        persistTabState(nextSelected);
      }
    };

    const onUpdateRule = (id, field, value) => {
      const nextList = list.map((r) => {
        return r.id === id ? { ...r, [field]: value } : r;
      });

      setList(nextList);
      sendRuntimeMessage(createSetInterceptionListEvent(nextList));
    };

    const isReady = useIsReadyExtension();

    return (
      <RulesList
        list={list}
        selectedRules={selectedIds}
        onToggleRule={onToggleRule}
        onSelectAll={onSelectAll}
        onDeselectAll={onDeselectAll}
        onUpdateRule={onUpdateRule}
        onRemoveRule={onRemoveRule}
        isReady={isReady}
      />
    );
  },
);
