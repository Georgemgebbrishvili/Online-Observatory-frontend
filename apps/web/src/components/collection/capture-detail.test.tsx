import type { Capture } from "@darkview/contracts";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { CaptureResult } from "@/features/collection/read";

import { CaptureDetail } from "./capture-detail";

vi.mock("react", async (importOriginal) => {
  const react = await importOriginal<typeof import("react")>();
  return {
    ...react,
    ViewTransition: ({ children }: { children: ReactNode }) => children,
  };
});

const capture: Capture = {
  id: "40000000-0000-4000-8000-000000000001",
  missionId: "20000000-0000-4000-8000-000000000001",
  userId: "00000000-0000-4000-8000-000000000001",
  targetId: "30000000-0000-4000-8000-000000000006",
  capturedAt: "2026-09-25T18:40:00Z",
  imagingProfile: "PLANETARY",
  opticalConfig: "F20_BARLOW",
  exposureMilliseconds: 12,
  gain: 300,
  framesStacked: 400,
  integrationSeconds: 4.8,
  widthPx: 1920,
  heightPx: 1080,
  fitsAvailable: false,
  visibility: "PRIVATE",
  mode: "SIMULATED",
  thumbnailUrl: null,
};

function result(
  overrides: Partial<Extract<CaptureResult, { kind: "ok" }>> = {},
): Extract<CaptureResult, { kind: "ok" }> {
  return {
    kind: "ok",
    entry: { capture, target: null, retired: true, thumbnail: null },
    image: { kind: "ok", url: "http://storage.test/image/1" },
    observatory: null,
    timezone: "Asia/Tbilisi",
    ...overrides,
  };
}

afterEach(() => vi.unstubAllGlobals());

describe("CaptureDetail", () => {
  it("states what the platform recorded, and that it is simulated", () => {
    render(<CaptureDetail result={result()} locale="en" />);

    // No target in the catalogue: the imaging profile stands as the title.
    expect(screen.getByRole("heading", { level: 1, name: "Planetary" })).toBeVisible();
    expect(screen.getByText("A target no longer in the catalogue")).toBeVisible();
    expect(screen.getByText("Simulated capture")).toBeVisible();
    expect(screen.getByText("Simulator, not the telescope")).toBeVisible();
    expect(screen.getByText("3000 mm · f/20, with Barlow")).toBeVisible();
    expect(screen.getByText("400 frames")).toBeVisible();
    expect(screen.getByText("1920 × 1080 px")).toBeVisible();
    expect(screen.getByRole("img")).toHaveAttribute("src", "http://storage.test/image/1");
    expect(screen.getByText("FITS was not recorded for this capture")).toBeVisible();
    expect(screen.queryByRole("button", { name: /make public|share/i })).toBeNull();
  });

  it("says so when the image failed, and when there is none", () => {
    const { unmount } = render(
      <CaptureDetail result={result({ image: { kind: "failed" } })} locale="en" />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "The full image could not be loaded. Try again.",
    );
    unmount();

    render(<CaptureDetail result={result({ image: { kind: "none" } })} locale="ka" />);
    expect(screen.getByText("ამ კადრს მინიატურა არ აქვს")).toBeVisible();
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("does not call a target retired when the catalogue could not be read", () => {
    render(
      <CaptureDetail
        result={result({
          entry: { capture, target: null, retired: false, thumbnail: null },
        })}
        locale="en"
      />,
    );
    expect(screen.getByRole("heading", { level: 1, name: "Planetary" })).toBeVisible();
    expect(screen.queryByText("A target no longer in the catalogue")).toBeNull();
  });

  it("mints the download link on the click and reports a failure", async () => {
    const fetch = vi.fn().mockResolvedValue(new Response("{}", { status: 503 }));
    vi.stubGlobal("fetch", fetch);
    render(
      <CaptureDetail
        result={result({
          entry: {
            capture: { ...capture, fitsAvailable: true },
            target: null,
            retired: true,
            thumbnail: null,
          },
        })}
        locale="en"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Download FITS" }));

    await waitFor(() =>
      expect(fetch).toHaveBeenCalledWith(
        `/api/captures/${capture.id}/download?kind=FITS`,
        expect.objectContaining({ method: "GET" }),
      ),
    );
    expect(
      await screen.findByText("The download link could not be created. Try again."),
    ).toBeVisible();
  });
});
