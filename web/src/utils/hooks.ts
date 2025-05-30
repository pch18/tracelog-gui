import { createGlobalStore, createStore } from "hox";
import { useEffect, useState } from "react";
import { request } from "./request";
import { useRequest } from "ahooks";
import { useLocation } from "react-router-dom";

export const useStateStore = <T>(value: T, key: string) => {
  const [state, setState] = useState<T>(() => {
    try {
      const res = localStorage.getItem(key);
      if (res) {
        return JSON.parse(res);
      }
    } catch {}
    return value;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [state]);

  return [state, setState] as const;
};

export const [useSys] = createGlobalStore(() => {
  const location = useLocation();
  const { data } = useRequest(request.getSys, {
    pollingInterval: 30000,
    ready: location.pathname !== "/login",
  });
  return data;
});
