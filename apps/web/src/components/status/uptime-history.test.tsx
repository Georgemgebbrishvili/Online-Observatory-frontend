import type { ObservatoryUptime } from "@darkview/contracts";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { statusCopy } from "@/i18n/resources/status";

import { UptimeHistory, uptimeTone } from "./uptime-history";

const base: ObservatoryUptime = {
  observatoryId: "10000000-0000-4000-8000-000000000001",
  timezone: "Asia/Tbilisi",
  from: "2026-08-24T20:00:00.000Z",
  to: "2026-09-23T19:00:00.000Z",
  uptimePercent: 99.17,
  days: [
    { date: "2026-09-22", measuredSeconds: 0, onlineSeconds: 0, uptimePercent: null },
    {
      date: "2026-09-23",
      measuredSeconds: 86400,
      onlineSeconds: 85680,
      uptimePercent: 99.17,
    },
  ],
  incidents: [
    { lostAt: "2026-09-23T18:40:00.000Z", restoredAt: "2026-09-23T18:52:00.000Z" },
    { lostAt: "2026-09-23T19:00:00.000Z", restoredAt: null },
  ],
};

describe("UptimeHistory", () => {
  it("colours a day by its share, and never draws an unmeasured day as up", () => {
    expect(uptimeTone(100)).toBe("up");
    expect(uptimeTone(99.5)).toBe("up");
    expect(uptimeTone(99.17)).toBe("partial");
    expect(uptimeTone(42)).toBe("down");
    expect(uptimeTone(null)).toBe("unmeasured");
  });

  it("states the share, each day for a screen reader, and the interruptions", () => {
    const { container } = render(
      <UptimeHistory
        copy={statusCopy.en.uptime}
        locale="en"
        timezone="Asia/Tbilisi"
        uptime={base}
      />,
    );

    expect(container.querySelector(".uptime-summary")?.textContent).toBe(
      "99.2% connected over the last 30 days",
    );
    expect(screen.getByText("22 Sept: Not measured")).toBeTruthy();
    expect(screen.getByText("23 Sept: 99.2%")).toBeTruthy();
    expect(screen.getByText("23 Sept, 22:40, for 12 min")).toBeTruthy();
    expect(screen.getByText("Since 23 Sept, 23:00, still offline")).toBeTruthy();
  });

  it("says nothing was measured rather than showing 100", () => {
    const { container } = render(
      <UptimeHistory
        copy={statusCopy.ka.uptime}
        locale="ka"
        timezone="Asia/Tbilisi"
        uptime={{ ...base, uptimePercent: null, incidents: [] }}
      />,
    );

    expect(container.querySelector("[data-uptime]")?.getAttribute("data-uptime")).toBe(
      "unmeasured",
    );
    expect(container.textContent).not.toContain("100");
    expect(container.textContent).toContain(statusCopy.ka.uptime.notMeasured);
  });

  it("says the history could not be read", () => {
    render(
      <UptimeHistory
        copy={statusCopy.en.uptime}
        locale="en"
        timezone="Asia/Tbilisi"
        uptime={null}
      />,
    );
    expect(screen.getByText(statusCopy.en.uptime.unavailable)).toBeTruthy();
  });
});
