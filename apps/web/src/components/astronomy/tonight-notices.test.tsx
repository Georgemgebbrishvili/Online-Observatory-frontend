import type { TonightTarget } from "@darkview/contracts";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TonightNotices } from "./tonight-notices";

function line(
  observable: boolean,
  blockReasons: TonightTarget["visibility"]["blockReasons"],
) {
  return {
    target: {
      id: "30000000-0000-4000-8000-000000000006",
      slug: "saturn",
      type: "PLANET",
      nameEn: "Saturn",
      nameKa: "სატურნი",
      positionSource: "EPHEMERIS",
      angularSizeArcmin: 0.3,
      magnitude: 0.6,
      opticalConfig: "F20_BARLOW",
      imagingProfile: "PLANETARY",
      minAltitudeDegrees: 25,
      expectedMissionMinutes: 15,
      enabled: true,
    },
    visibility: {
      observable,
      evaluatedAt: "2026-09-25T18:00:00Z",
      horizontal: { altitudeDegrees: 38, azimuthDegrees: 160 },
      sunAltitudeDegrees: -24,
      moonSeparationDegrees: 70,
      blockReasons,
    },
  } satisfies TonightTarget;
}

const observatory = { name: "Tbilisi Observatory", timezone: "Asia/Tbilisi" };

describe("TonightNotices", () => {
  it("says why nothing can be observed, from the reason that decides", () => {
    render(
      <TonightNotices
        locale="en"
        result={{
          kind: "ok",
          observatory: { ...observatory, mode: "REAL" },
          items: [line(false, ["SAFETY_ENVELOPE_UNMEASURED", "SUN_TOO_HIGH"])],
        }}
      />,
    );
    expect(
      screen.getByRole("heading", { name: "No target can be observed right now" }),
    ).toBeVisible();
    expect(
      screen.getByText("Reason: The telescope's safety limits are not measured yet."),
    ).toBeVisible();
  });

  it("badges a simulated observatory, and stays quiet when something is observable", () => {
    render(
      <TonightNotices
        locale="ka"
        result={{
          kind: "ok",
          observatory: { ...observatory, mode: "SIMULATED" },
          items: [line(true, [])],
        }}
      />,
    );
    expect(screen.getByRole("note")).toHaveTextContent("SIMULATED OBSERVATORY");
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("tells an unreachable platform apart from a missing observatory", () => {
    const { rerender } = render(
      <TonightNotices locale="en" result={{ kind: "unreachable" }} />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Tonight's sky could not be read",
    );

    rerender(<TonightNotices locale="en" result={{ kind: "no-observatory" }} />);
    expect(screen.getByRole("status")).toHaveTextContent(
      "No observatory is taking missions",
    );
  });
});
