import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ObservatoryPage } from "./observatory-page";

describe("ObservatoryPage", () => {
  it("states the network as one site, without inventing partners", () => {
    render(
      <ObservatoryPage
        locale="en"
        panel={{ kind: "unreachable" }}
        tonight={{ kind: "unreachable" }}
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
    expect(screen.getByText("Illustration — not telescope output")).toBeVisible();
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
      />,
    );

    expect(screen.getByRole("heading", { name: "დღეს — ერთი ადგილი." })).toBeVisible();
  });
});
