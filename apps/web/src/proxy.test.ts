import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { sessionCookieName } from "@/lib/platform/config";
import { proxy } from "@/proxy";

describe("authentication proxy", () => {
  it("redirects an unauthenticated app request to the localized sign-in page", () => {
    const response = proxy(new NextRequest("https://darkview.ge/ka/app/missions"));
    expect(response.headers.get("location")).toBe("https://darkview.ge/ka/sign-in");
  });

  it("lets a session-bearing request reach the secure server-side verifier", () => {
    const request = new NextRequest("https://darkview.ge/en/app", {
      headers: { cookie: `${sessionCookieName}=opaque-token` },
    });
    const response = proxy(request);
    expect(response.headers.get("location")).toBeNull();
  });
});
