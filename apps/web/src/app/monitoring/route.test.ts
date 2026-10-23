import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "./route";

const DSN = "https://public@o1.ingest.sentry.io/42";

function envelope(dsn: string) {
  return `${JSON.stringify({ dsn, sent_at: "2026-10-23T00:00:00.000Z" })}\n{"type":"event"}\n{}`;
}

function post(body: string) {
  return POST(new Request("http://localhost/monitoring", { method: "POST", body }));
}

describe("POST /monitoring (ADR-064 §4)", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("is not there when no DSN is built in", async () => {
    vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", "");
    expect((await post(envelope(DSN))).status).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("forwards an envelope for our project to that project only", async () => {
    vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", DSN);
    fetchMock.mockResolvedValue(new Response("{}", { status: 200 }));

    expect((await post(envelope(DSN))).status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://o1.ingest.sentry.io/api/42/envelope/",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("refuses an envelope for any other project or host", async () => {
    vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", DSN);
    expect((await post(envelope("https://public@o1.ingest.sentry.io/43"))).status).toBe(
      400,
    );
    expect((await post(envelope("https://public@evil.test/42"))).status).toBe(400);
    expect((await post("not json")).status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("refuses an oversized body", async () => {
    vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", DSN);
    expect((await post(envelope(DSN) + "x".repeat(300 * 1024))).status).toBe(413);
  });
});
