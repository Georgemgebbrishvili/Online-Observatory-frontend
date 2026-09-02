import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";

import { Modal } from "./dialog";

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute("open", "");
  };
});

describe("Modal", () => {
  it("opens from its trigger", () => {
    render(
      <Modal triggerLabel="Open modal" title="Observation details" closeLabel="Close">
        <p>Mission information</p>
      </Modal>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open modal" }));

    expect(screen.getByRole("dialog")).toHaveAttribute("open");
    expect(screen.getByText("Mission information")).toBeVisible();
  });
});
