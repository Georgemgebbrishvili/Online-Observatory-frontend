import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { brand } from "@/brand";
import { captures } from "@/features/collection/captures";

import { CaptureDetail } from "./capture-detail";

vi.mock("react", async (importOriginal) => {
  const react = await importOriginal<typeof import("react")>();

  return {
    ...react,
    ViewTransition: ({ children }: { children: ReactNode }) => children,
  };
});

describe("CaptureDetail", () => {
  it("shows capture provenance and working privacy controls", () => {
    render(<CaptureDetail capture={captures[0]} locale="en" />);

    expect(screen.getByRole("heading", { name: "Saturn" })).toBeVisible();
    expect(screen.getByText("Captured by you")).toBeVisible();
    expect(screen.getByText(`${brand.en.name} Tbilisi Observatory`)).toBeVisible();
    expect(screen.getByRole("link", { name: "Download" })).toHaveAttribute(
      "href",
      "/captures/saturn-dv-0001.svg",
    );

    fireEvent.click(screen.getByRole("button", { name: "Make private" }));
    expect(screen.getByText("This capture is now private.")).toBeVisible();
    expect(screen.getByRole("button", { name: "Make public" })).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Share link" }));
    expect(screen.getByText("Make this capture public before sharing it.")).toBeVisible();
  });

  it("copies the public share URL", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    render(<CaptureDetail capture={captures[0]} locale="en" />);

    fireEvent.click(screen.getByRole("button", { name: "Share link" }));

    await waitFor(() => expect(writeText).toHaveBeenCalledOnce());
    expect(await screen.findByText("Share link copied")).toBeVisible();
  });
});
