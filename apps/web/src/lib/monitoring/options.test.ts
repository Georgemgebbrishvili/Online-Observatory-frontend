import { describe, expect, it } from "vitest";

import { envelopeUrl, monitoringOptions } from "./options";
import { SCRUBBED, scrubEvent, scrubText } from "./scrub";

describe("error reporting (ADR-064)", () => {
  it("is off without a DSN", () => {
    expect(monitoringOptions(undefined, undefined)).toBeNull();
    expect(monitoringOptions(" ", "demo")).toBeNull();
  });

  it("sends no default PII and no traces", () => {
    expect(monitoringOptions("https://k@o1.ingest.sentry.io/42", "demo")).toMatchObject({
      environment: "demo",
      sendDefaultPii: false,
      tracesSampleRate: 0,
    });
  });

  it("names the envelope URL of the one project a DSN names", () => {
    expect(envelopeUrl("https://k@o1.ingest.de.sentry.io/42")).toBe(
      "https://o1.ingest.de.sentry.io/api/42/envelope/",
    );
    expect(envelopeUrl("https://o1.ingest.sentry.io/42")).toBeNull();
    expect(envelopeUrl("https://k@o1.ingest.sentry.io/not-a-project")).toBeNull();
    expect(envelopeUrl("not a url")).toBeNull();
  });

  it("scrubs a browser event the way the platform does", () => {
    expect(scrubText("reset for a@b.co?code=123")).not.toContain("a@b.co");
    expect(
      scrubEvent({
        user: { ip_address: "1.2.3.4" },
        request: {
          url: "https://x.test/en/verify-email?token=t",
          headers: { Referer: "r" },
        },
      }),
    ).toEqual({ request: { url: "https://x.test/en/verify-email" } });
    expect(SCRUBBED).toBe("[scrubbed]");
  });
});
