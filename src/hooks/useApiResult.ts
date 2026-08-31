"use client";

import { useEffect, useState, useCallback } from "react";
import type { ApiResult } from "@/types/soc";

export type FetchState<T> =
  | { phase: "loading" }
  | { phase: "empty" }
  | { phase: "error"; message: string }
  | { phase: "ready"; data: T };

/**
 * Fetches `url` and maps our internal `ApiResult<T>` envelope onto a
 * `FetchState<T>` a component can render directly (loading / empty /
 * error / ready). Every SOC dashboard panel uses this hook so loading,
 * empty, and error UI stay consistent across the whole app.
 */
export function useApiResult<T>(url: string, deps: unknown[] = []) {
  const [state, setState] = useState<FetchState<T>>({ phase: "loading" });

  const load = useCallback(async () => {
    setState({ phase: "loading" });
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) {
        setState({
          phase: "error",
          message: "Something went wrong loading this data.",
        });
        return;
      }
      const result = (await res.json()) as ApiResult<T>;
      if (result.status === "ok") {
        setState({ phase: "ready", data: result.data });
      } else if (result.status === "empty") {
        setState({ phase: "empty" });
      } else {
        setState({ phase: "error", message: result.message });
      }
    } catch {
      setState({
        phase: "error",
        message: "Network error — check your connection and try again.",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { ...state, reload: load };
}
