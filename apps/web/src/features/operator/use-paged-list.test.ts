import { act, renderHook, waitFor } from "@testing-library/react";
import { describe as suite, expect, it, vi } from "vitest";

import { usePagedList } from "./use-paged-list";

function page(items: string[], nextCursor: string | null) {
  return { items, page: { hasMore: nextCursor !== null, nextCursor } };
}

suite("usePagedList", () => {
  it("appends the next page rather than replacing the first", async () => {
    const load = vi.fn((cursor?: string) =>
      Promise.resolve(cursor ? page(["c"], null) : page(["a", "b"], "2")),
    );

    const { result } = renderHook(() => usePagedList(load));
    await waitFor(() => expect(result.current.items).toEqual(["a", "b"]));
    expect(result.current.hasMore).toBe(true);

    act(() => result.current.loadMore());
    await waitFor(() => expect(result.current.items).toEqual(["a", "b", "c"]));
    expect(result.current.hasMore).toBe(false);
  });

  it("starts a fresh first page when the loader changes", async () => {
    const first = vi.fn(() => Promise.resolve(page(["a", "b"], "2")));
    const second = vi.fn(() => Promise.resolve(page(["z"], null)));

    const { result, rerender } = renderHook(({ load }) => usePagedList(load), {
      initialProps: { load: first as (cursor?: string) => ReturnType<typeof first> },
    });
    await waitFor(() => expect(result.current.items).toEqual(["a", "b"]));

    // A changed filter must not leave the previous filter's rows on screen.
    rerender({ load: second as never });
    expect(result.current.items).toEqual([]);
    await waitFor(() => expect(result.current.items).toEqual(["z"]));
    expect(result.current.hasMore).toBe(false);
  });

  it("surfaces a failure instead of showing an empty list as though it were empty", async () => {
    const load = vi.fn(() => Promise.reject(new Error("platform down")));

    const { result } = renderHook(() => usePagedList(load));
    await waitFor(() => expect(result.current.error).toBe("platform down"));
    expect(result.current.loading).toBe(false);
    expect(result.current.items).toEqual([]);
  });

  it("replaces one row in place, leaving the rest", async () => {
    const load = vi.fn(() => Promise.resolve(page(["a", "b"], null)));

    const { result } = renderHook(() => usePagedList(load));
    await waitFor(() => expect(result.current.items).toEqual(["a", "b"]));

    act(() => result.current.replace("B", (candidate) => candidate === "b"));
    expect(result.current.items).toEqual(["a", "B"]);
  });
});
