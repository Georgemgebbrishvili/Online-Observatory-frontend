import { useCallback, useEffect, useState } from "react";

import { PlatformError } from "./api";

export type Resource<T> =
  | { state: "loading" }
  | { state: "ready"; value: T }
  | { state: "not-found" }
  | { state: "unauthorized" }
  | { state: "unavailable" };

/**
 * One read from the platform, with retry. A 404 and a 401 are states of their own, not
 * failures: a missing thing, and a session the platform no longer honours.
 */
export function useResource<T>(read: () => Promise<T>, key: string) {
  const [resource, setResource] = useState<Resource<T>>({ state: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let current = true;
    setResource({ state: "loading" });
    read().then(
      (value) => current && setResource({ state: "ready", value }),
      (error: unknown) =>
        current &&
        setResource({
          state:
            error instanceof PlatformError && error.status === 404
              ? "not-found"
              : error instanceof PlatformError && error.status === 401
                ? "unauthorized"
                : "unavailable",
        }),
    );
    return () => {
      current = false;
    };
    // `read` is rebuilt every render; `key` names what it reads.
  }, [key, attempt]);

  const retry = useCallback(() => setAttempt((count) => count + 1), []);
  return { resource, retry };
}
