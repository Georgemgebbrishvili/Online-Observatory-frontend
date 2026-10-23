import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { sessionCookieName } from "@/lib/platform/config";
import { proxy } from "@/proxy";

describe("authentication proxy", () => {
  it("redirects an unauthenticated app request to the localized sign-in page", async () => {
    const response = await proxy(new NextRequest("https://darkview.ge/ka/app/missions"));
    expect(response.headers.get("location")).toBe("https://darkview.ge/ka/sign-in");
  });

  it("lets a session-bearing request reach the secure server-side verifier", async () => {
    const request = new NextRequest("https://darkview.ge/en/app", {
      headers: { cookie: `${sessionCookieName}=opaque-token` },
    });
    const response = await proxy(request);
    expect(response.headers.get("location")).toBeNull();
  });

  it("leaves the sign-in page to the server even when a session cookie is present", async () => {
    // A cookie proves nothing here. Redirecting on it looped forever for a stale or
    // half-present session: the server sent /app back to sign-in, and this sent it on.
    const request = new NextRequest("https://darkview.ge/en/sign-in", {
      headers: { cookie: `${sessionCookieName}=stale-token` },
    });
    expect((await proxy(request)).headers.get("location")).toBeNull();
  });
});

describe("a shared capture's page (ADR-065)", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("is rewritten to a real 404 when the platform has no such shared capture", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(null, { status: 404 })),
    );
    const response = await proxy(new NextRequest("https://darkview.ge/en/c/abc-123"));
    expect(response.headers.get("x-middleware-rewrite")).toBe(
      "https://darkview.ge/en/c/abc-123/missing",
    );
    expect(response.status).toBe(404);
  });

  it("is left to the page when the capture is shared, or the platform cannot be asked", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("{}", { status: 200 })),
    );
    expect(
      (await proxy(new NextRequest("https://darkview.ge/en/c/abc-123"))).headers.get(
        "x-middleware-rewrite",
      ),
    ).toBeNull();

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Promise.reject(new Error("down"))),
    );
    expect(
      (await proxy(new NextRequest("https://darkview.ge/en/c/abc-123"))).headers.get(
        "x-middleware-rewrite",
      ),
    ).toBeNull();
  });

  it("asks nothing for the capture's image or any other page", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await proxy(new NextRequest("https://darkview.ge/en/c/abc-123/opengraph-image"));
    await proxy(new NextRequest("https://darkview.ge/en/status"));
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
