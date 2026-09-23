"use client";

import type { PageMeta } from "@darkview/contracts";
import { useCallback, useEffect, useState } from "react";

import { ApiRequestError } from "@/lib/platform/browser";

type Page<T> = { items: T[]; page: PageMeta };

export type PagedList<T> = {
  items: T[];
  hasMore: boolean;
  loading: boolean;
  error: string | null;
  loadMore: () => void;
  replace: (item: T, matches: (candidate: T) => boolean) => void;
};

/**
 * Cursor paging for the operator's mission and audit lists. `load` must be stable --
 * wrap it in useCallback keyed on the filters, and changing a filter starts a fresh
 * first page rather than appending to the old one.
 */
export function usePagedList<T>(
  load: (cursor?: string) => Promise<Page<T>>,
): PagedList<T> {
  const [items, setItems] = useState<T[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadedFor, setLoadedFor] = useState(() => load);

  // A changed filter means a different list. Reset during render rather than in the
  // effect, so no frame shows the previous filter's rows as though they were current.
  if (loadedFor !== load) {
    setLoadedFor(() => load);
    setItems([]);
    setCursor(null);
    setHasMore(false);
    setLoading(true);
    setError(null);
  }

  useEffect(() => {
    let current = true;
    load()
      .then((page) => {
        if (!current) return;
        setItems(page.items);
        setCursor(page.page.nextCursor ?? null);
        setHasMore(page.page.hasMore);
      })
      .catch((cause: unknown) => {
        if (current) setError(describe(cause));
      })
      .finally(() => {
        if (current) setLoading(false);
      });
    return () => {
      current = false;
    };
  }, [load]);

  const loadMore = useCallback(() => {
    if (!cursor) return;
    setLoading(true);
    load(cursor)
      .then((page) => {
        setItems((previous) => [...previous, ...page.items]);
        setCursor(page.page.nextCursor ?? null);
        setHasMore(page.page.hasMore);
      })
      .catch((cause: unknown) => setError(describe(cause)))
      .finally(() => setLoading(false));
  }, [cursor, load]);

  const replace = useCallback((item: T, matches: (candidate: T) => boolean) => {
    setItems((previous) =>
      previous.map((candidate) => (matches(candidate) ? item : candidate)),
    );
  }, []);

  return { items, hasMore, loading, error, loadMore, replace };
}

export function describe(cause: unknown) {
  if (cause instanceof ApiRequestError) {
    return cause.error?.message ?? String(cause.status);
  }
  return cause instanceof Error ? cause.message : String(cause);
}
