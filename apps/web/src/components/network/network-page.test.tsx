import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { NetworkPage } from "./network-page";

describe("NetworkPage", () => {
  it("shows the single current Stellar node without inventing partners", () => {
    render(<NetworkPage locale="en" />);

    expect(
      screen.getByRole("heading", { name: "Stellar Tbilisi Observatory" }),
    ).toBeVisible();
    expect(screen.getByText("1 active node")).toBeVisible();
    expect(
      screen.getByText(
        "No external partner observatories are represented as active today.",
      ),
    ).toBeVisible();
    expect(screen.getByText("Applications are not open")).toBeVisible();
    expect(
      screen.queryByRole("button", { name: /pay|buy|connect now/i }),
    ).not.toBeInTheDocument();
  });

  it("renders the future concept naturally in Georgian", () => {
    render(<NetworkPage locale="ka" />);

    expect(
      screen.getByRole("heading", { name: "დააკავშირეთ თქვენი ობსერვატორია" }),
    ).toBeVisible();
    expect(screen.getByText("განაცხადების მიღება ჯერ არ დაწყებულა")).toBeVisible();
  });
});
