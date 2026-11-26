import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PaymentNotice } from "./payment-notice";

describe("PaymentNotice (platform ADR-073)", () => {
  it("says nothing once paid", () => {
    const { container } = render(<PaymentNotice locale="en" query={{}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("gives the bank's reason for a decline, in Georgian, with a way back", () => {
    render(
      <PaymentNotice
        locale="ka"
        query={{ payment: "declined", code: "107" }}
        retryHref="/ka/app/book"
      />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "ბარათზე საკმარისი თანხა არ არის.",
    );
    expect(screen.getByRole("alert")).toHaveTextContent("თანხა არ ჩამოგეჭრა.");
    expect(screen.getByRole("link", { name: "თავიდან ცდა" })).toHaveAttribute(
      "href",
      "/ka/app/book",
    );
  });

  it("falls back to the bank's plain refusal for a code it does not know", () => {
    render(<PaymentNotice locale="en" query={{ payment: "declined", code: "122" }} />);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "the bank did not approve the payment.",
    );
  });

  it("tells an expired or still-pending payer so", () => {
    const { rerender } = render(
      <PaymentNotice locale="en" query={{ payment: "expired" }} />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("The payment window expired.");
    rerender(<PaymentNotice locale="en" query={{ payment: "pending" }} />);
    expect(screen.getByRole("status")).toHaveTextContent(
      "Refresh this page in a minute.",
    );
  });
});
