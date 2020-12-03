import EventEmitter from "eventemitter3";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const INTERNAL_DEFAULT_ID = "__INTERNAL_DEFAULT_ID__";
const em = new EventEmitter();
const states = new Map();
const actions = new Map();

const createKey = (name, id) => [name, id].join(".");

export const createNode = (name, initialValue, originalActions) => {
  const subscribe = (id) => {
    const key = createKey(name, id);
    const state = states.get(key);

    if (state) {
      return {
        state: states.get(key),
        actions: actions.get(key)
      };
    }

    let newActions = {};
    Object.keys(originalActions).forEach((actionName) => {
      const originalAction = originalActions[actionName];

      const updateState = (state) => {
        states.set(key, state);
        em.emit("update", { key, state });
      };

      newActions[actionName] = function (...args) {
        if (Array.isArray(originalAction)) {
          const [preFn, postFn] = originalAction;

          const preFnResult = preFn(...args);

          const handleResult = (result) => {
            const prevState = states.get(key);
            const nextState = postFn(prevState, result);
            updateState(nextState);
          };

          if (typeof preFnResult.then === "function") {
            return preFn(...args).then(handleResult);
          } else {
            handleResult(preFnResult);
          }
        } else {
          const prevState = states.get(key);
          const nextState = originalAction(prevState, ...args);
          updateState(nextState);
        }
      };
    });

    states.set(key, initialValue);
    actions.set(key, newActions);

    return {
      state: states.get(key),
      actions: actions.get(key)
    };
  };

  const getState = (key) => states.get(key);

  return { name, states, actions, subscribe, getState };
};

const useSubscribedNode = (node, id) => {
  return useMemo(() => node.subscribe(id), [node, id]);
};

const useSelectorRef = (localState, select = (a) => a) => {
  const selectRef = useRef(select);
  return useMemo(() => selectRef.current(localState), [localState]);
};

const useUpdater = (node, key, onChange) => {
  const onUpdate = useCallback(
    ({ key: updatedKey, state }) => {
      if (updatedKey === key) {
        return onChange(state);
      }
    },
    [key, onChange]
  );

  useEffect(() => {
    em.on("update", onUpdate);

    return () => {
      em.off("update", onUpdate);
    };
  }, [node, key, onUpdate]);

  useEffect(() => {
    const state = node.getState(key);
    onChange(state);
  }, [key, node, onChange]);
};

export const useNodeReader = (...args) => {
  const [state] = useNode(...args);
  
  return state;
};

export const useNodeActions = (...args) => {
  const [state, actions] = useNode(...args);
  
  return actions;
};

export const useNode = (node, id = INTERNAL_DEFAULT_ID, select = (a) => a) => {
  const key = createKey(node.name, id);
  const { state, actions } = useSubscribedNode(node, id);
  const [localState, setLocalState] = useState(state);
  const selectedLocalState = useSelectorRef(localState, select);
  useUpdater(node, key, (state) => setLocalState(state));

  return [selectedLocalState, actions];
};
