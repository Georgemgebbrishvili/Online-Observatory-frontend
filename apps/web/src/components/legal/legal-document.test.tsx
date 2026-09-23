import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { legalCopy, type LegalDocumentId } from "@/i18n/resources/legal";

import { LegalDocumentPage } from "./legal-document";

const documentIds: LegalDocumentId[] = ["terms", "privacy", "refunds"];

describe("LegalDocumentPage", () => {
  it("says on every document that it is not in force", () => {
    for (const id of documentIds) {
      const { unmount } = render(
        <LegalDocumentPage
          copy={legalCopy.en}
          document={legalCopy.en.documents[id]}
          locale="en"
        />,
      );

      expect(screen.getByRole("note")).toHaveTextContent(
        "These terms are not yet in force",
      );
      unmount();
    }
  });

  it("renders a pending section as pending, with no prose of its own", () => {
    render(
      <LegalDocumentPage
        copy={legalCopy.en}
        document={legalCopy.en.documents.privacy}
        locale="en"
      />,
    );

    const pending = screen
      .getByRole("heading", { name: /What Darkview collects/ })
      .closest("section");

    expect(pending).not.toBeNull();
    const body = within(pending as HTMLElement);
    expect(body.getByText("Awaiting legal review")).toBeVisible();
    // The only paragraph is the shared explanation. Anything else would be invented law.
    expect(pending?.querySelectorAll("p")).toHaveLength(1);
    expect(body.getByText(legalCopy.en.pendingDetail)).toBeVisible();
  });

  it("renders a settled section's decided text", () => {
    render(
      <LegalDocumentPage
        copy={legalCopy.en}
        document={legalCopy.en.documents.refunds}
        locale="en"
      />,
    );

    const settled = screen
      .getByRole("heading", { name: /Cancelling a subscription/ })
      .closest("section");

    const body = within(settled as HTMLElement);
    expect(body.getByText("Settled")).toBeVisible();
    expect(body.getByText(/refunds nothing/)).toBeVisible();
    expect(body.getByText(/expire at the end of the period/)).toBeVisible();
  });

  it("does not claim long-exposure astrophotography", () => {
    render(
      <LegalDocumentPage
        copy={legalCopy.en}
        document={legalCopy.en.documents.terms}
        locale="en"
      />,
    );

    expect(
      screen.getByText(/It is not a long-exposure astrophotography service/),
    ).toBeVisible();
  });
});
