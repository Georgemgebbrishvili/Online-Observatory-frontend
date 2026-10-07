import { afterEach, describe, expect, it, vi } from "vitest";

import { ApiRequestError, apiRequest, apiTimeoutMs } from "./browser";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("apiRequest", () => {
  it("gives up on an API that never answers, and asks again afresh", async () => {
    // The budget's own timer is the platform's, not one fake timers drive.
    const budgets: AbortController[] = [];
    const timeout = vi.spyOn(AbortSignal, "timeout").mockImplementation(() => {
      const budget = new AbortController();
      budgets.push(budget);
      return budget.signal;
    });
    const fetch = vi.fn(
      (_url: string, init: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init.signal?.addEventListener("abort", () => reject(init.signal?.reason));
        }),
    );
    vi.stubGlobal("fetch", fetch);

    const first = apiRequest("/me");
    budgets[0].abort(new DOMException("The operation timed out.", "TimeoutError"));
    await expect(first).rejects.toMatchObject({ name: "TimeoutError" });
    expect(timeout).toHaveBeenCalledWith(apiTimeoutMs);

    fetch.mockResolvedValueOnce(new Response(null, { status: 204 }));
    await expect(apiRequest("/me")).resolves.toBeUndefined();
    expect(budgets[1].signal.aborted).toBe(false);
  });

  it("still reads a refusal as the API's own error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json(
          { error: { code: "NOT_FOUND", message: "No such mission." } },
          { status: 404 },
        ),
      ),
    );

    const error = await apiRequest("/missions/x").catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(ApiRequestError);
    expect(error).toMatchObject({ status: 404 });
  });
});
