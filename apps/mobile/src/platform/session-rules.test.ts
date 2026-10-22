import type { NativeSession } from "@darkview/contracts";
import { describe, expect, it } from "vitest";

import { PlatformError } from "./api";
import { failureOf, isCurrent } from "./session-rules";

describe("failureOf", () => {
  it("names each refusal the native sign-in can give", () => {
    expect(failureOf(new PlatformError("x", 401, "UNAUTHENTICATED"))).toBe("wrong");
    expect(failureOf(new PlatformError("x", 403, "EMAIL_UNVERIFIED"))).toBe("unverified");
    expect(failureOf(new PlatformError("x", 429, "RATE_LIMITED"))).toBe("limited");
  });

  it("treats anything else, and a network failure, as the servers not answering", () => {
    expect(failureOf(new PlatformError("x", 403, "FORBIDDEN"))).toBe("unavailable");
    expect(failureOf(new PlatformError("x", 500, "INTERNAL"))).toBe("unavailable");
    expect(failureOf(new TypeError("Network request failed"))).toBe("unavailable");
  });
});

describe("isCurrent", () => {
  const session = { expiresAt: "2026-10-29T12:00:00.000Z" } as NativeSession;

  it("holds a session until the instant it lapses", () => {
    expect(isCurrent(session, Date.parse("2026-10-29T11:59:59.000Z"))).toBe(true);
    expect(isCurrent(session, Date.parse("2026-10-29T12:00:00.000Z"))).toBe(false);
  });
});
