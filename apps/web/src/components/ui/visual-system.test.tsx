import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { OpticalRing } from "@/components/astronomy/optical-ring";
import { TargetQuality, targetQualities } from "@/components/astronomy/target-quality";
import { MissionStatus, missionStatuses } from "@/components/missions/mission-status";
import {
  ObservatoryStatus,
  observatoryStatuses,
} from "@/components/observatory/observatory-status";

import { Button } from "./button";
import { StatePanel } from "./state-panel";

describe("operational status components", () => {
  it("renders every observatory state", () => {
    render(
      <div>
        {observatoryStatuses.map((status) => (
          <ObservatoryStatus key={status} status={status} label={status} />
        ))}
      </div>,
    );

    for (const status of observatoryStatuses) {
      expect(screen.getByText(status)).toBeVisible();
    }
  });

  it("renders every target quality and mission state", () => {
    render(
      <div>
        {targetQualities.map((quality) => (
          <TargetQuality key={quality} quality={quality} label={quality} />
        ))}
        {missionStatuses.map((status) => (
          <MissionStatus key={status} status={status} label={status} />
        ))}
      </div>,
    );

    for (const quality of targetQualities) {
      expect(screen.getByText(quality)).toBeVisible();
    }
    for (const status of missionStatuses) {
      expect(screen.getByText(status)).toBeVisible();
    }
  });
});

describe("visual primitives", () => {
  it("gives a labeled optical motif an image role", () => {
    render(<OpticalRing label="Target lock" active />);
    expect(screen.getByRole("img", { name: "Target lock" })).toBeVisible();
  });

  it("exposes loading and error states semantically", () => {
    render(
      <>
        <Button loading>Checking sky</Button>
        <StatePanel variant="error" title="Connection lost" description="Retry" />
      </>,
    );

    expect(screen.getByRole("button", { name: "Checking sky" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Checking sky" })).toHaveAttribute(
      "aria-busy",
      "true",
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Connection lost");
  });
});
