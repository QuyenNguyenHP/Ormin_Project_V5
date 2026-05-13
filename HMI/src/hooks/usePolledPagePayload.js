import { useEffect, useEffectEvent, useState } from "react";
import { fetchPagePayload } from "../services/pidMonitorApi";

const DEFAULT_POLL_INTERVAL_MS = 2000;

export const usePolledPagePayload = (pageName) => {
  const [payload, setPayload] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [pollIntervalMs, setPollIntervalMs] = useState(DEFAULT_POLL_INTERVAL_MS);

  const loadPagePayload = useEffectEvent(async () => {
    try {
      const nextPayload = await fetchPagePayload(pageName);
      setPayload(nextPayload);
      setLastUpdated(new Date());
      setPollIntervalMs(nextPayload?.meta?.pollIntervalMs ?? DEFAULT_POLL_INTERVAL_MS);
      setError("");
      return nextPayload;
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : `Failed to load ${pageName} data.`);
      return null;
    } finally {
      setIsLoading(false);
    }
  });

  useEffect(() => {
    let isActive = true;
    let timeoutId;

    const poll = async () => {
      if (!isActive) {
        return;
      }

      const nextPayload = await loadPagePayload();

      if (!isActive) {
        return;
      }

      const pollIntervalMs = nextPayload?.meta?.pollIntervalMs ?? DEFAULT_POLL_INTERVAL_MS;

      timeoutId = window.setTimeout(poll, pollIntervalMs);
    };

    setIsLoading(true);
    setPayload(null);
    setError("");
    poll();

    return () => {
      isActive = false;
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [loadPagePayload, pageName]);

  return {
    payload,
    isLoading,
    error,
    lastUpdated,
    pollIntervalMs,
  };
};

export default usePolledPagePayload;
