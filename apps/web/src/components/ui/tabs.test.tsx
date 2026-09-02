import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Tabs } from "./tabs";

const items = [
  { id: "overview", label: "Overview", content: "Overview content" },
  { id: "visibility", label: "Visibility", content: "Visibility content" },
  { id: "equipment", label: "Equipment", content: "Equipment content" },
];

describe("Tabs", () => {
  it("switches panels with pointer input", () => {
    render(<Tabs ariaLabel="Target data" items={items} />);

    fireEvent.click(screen.getByRole("tab", { name: "Visibility" }));

    expect(screen.getByRole("tab", { name: "Visibility" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Visibility content");
  });

  it("supports arrow-key navigation", () => {
    render(<Tabs ariaLabel="Target data" items={items} />);
    const firstTab = screen.getByRole("tab", { name: "Overview" });

    firstTab.focus();
    fireEvent.keyDown(firstTab, { key: "ArrowRight" });

    expect(screen.getByRole("tab", { name: "Visibility" })).toHaveFocus();
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Visibility content");
  });
});
