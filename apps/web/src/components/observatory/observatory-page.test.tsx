import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { ObservatoryPanelResult } from "@/features/home/read";

import { ObservatoryPage } from "./observatory-page";

const panel: ObservatoryPanelResult = {
  kind: "ok",
  observatory: {
    id: "10000000-0000-4000-8000-000000000001",
    slug: "tbilisi",
    kind: "FIRST_PARTY",
    nameEn: "Stellar Tbilisi",
    nameKa: "სტელარი თბილისი",
    city: "Tbilisi",
    countryCode: "GE",
    timezone: "Asia/Tbilisi",
    telescope: {
      manufacturer: "Celestron",
      model: "NexStar 6SE",
      apertureMm: 150,
      focalLengthMm: 1500,
    },
  },
  status: {
    observatoryId: "10000000-0000-4000-8000-000000000001",
    mode: "SIMULATED",
    link: "ONLINE",
    weather: {
      status: "CLEAR",
      source: "OPERATOR",
      holdActive: true,
      updatedAt: "2026-09-25T16:00:00Z",
    },
    missionInProgress: true,
    updatedAt: "2026-09-25T16:00:00Z",
  },
};

describe("ObservatoryPage", () => {
  it("states the network as one site, without inventing partners", () => {
    render(
      <ObservatoryPage
        locale="en"
        panel={{ kind: "unreachable" }}
        tonight={{ kind: "unreachable" }}
        conditions={null}
      />,
    );

    const network = within(screen.getByRole("region", { name: "One site today." }));
    expect(network.getByText(/One observatory, in Tbilisi/)).toBeVisible();
    expect(network.getByText(/None is connected/)).toBeVisible();
    expect(network.getByText("Not open.")).toBeVisible();
    expect(document.getElementById("network")).not.toBeNull();
  });

  it("reads as instrument, safety, then site, with the drawing captioned", () => {
    render(
      <ObservatoryPage
        locale="en"
        panel={{ kind: "unreachable" }}
        tonight={{ kind: "unreachable" }}
        conditions={null}
      />,
    );

    const sections = ["instrument", "safety", "site"].map((id) =>
      document.getElementById(id),
    );
    expect(sections.every(Boolean)).toBe(true);
    expect(
      sections[0]!.compareDocumentPosition(sections[2]!) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(screen.getByText("Sun avoidance")).toBeVisible();
    expect(screen.getByText("The observatory dials out")).toBeVisible();
    expect(screen.queryByText(/\b(cooled|cooling)\b/i)).toBeNull();
  });

  it("renders the Georgian network section", () => {
    render(
      <ObservatoryPage
        locale="ka"
        panel={{ kind: "unreachable" }}
        tonight={{ kind: "unreachable" }}
        conditions={null}
      />,
    );

    expect(screen.getByRole("heading", { name: "დღეს — ერთი ადგილი." })).toBeVisible();
  });

  it("draws the camera's frame on the Moon from the focal length, captioned", () => {
    render(
      <ObservatoryPage
        locale="en"
        panel={panel}
        tonight={{ kind: "unreachable" }}
        conditions={{
          observatoryId: panel.kind === "ok" ? panel.observatory.id : "",
          date: "2026-09-25",
          items: [],
        }}
      />,
    );

    expect(screen.getByText("Illustration — not telescope output")).toBeVisible();
    expect(screen.getAllByText("25.5′ × 14.4′")).toHaveLength(2);
    // A hold outranks the session that is running.
    expect(screen.getAllByText("Weather hold")).toHaveLength(2);
    expect(screen.getByText("No bookable hours tonight")).toBeVisible();
    expect(screen.getByText("No forecast yet")).toBeVisible();
  });

  it("links every way in to a page that exists", () => {
    render(
      <ObservatoryPage
        locale="ka"
        panel={panel}
        tonight={{ kind: "unreachable" }}
        conditions={null}
      />,
    );

    const dock = within(screen.getByRole("navigation", { name: "როგორ დაიწყო" }));
    expect(dock.getAllByRole("link").map((link) => link.getAttribute("href"))).toEqual([
      "/ka/app/book",
      "/ka/app/live",
      "/ka/app/missions",
      "/ka/status",
    ]);
  });
});
