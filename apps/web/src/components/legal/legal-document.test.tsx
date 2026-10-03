import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { brand } from "@/brand";
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

  it("renders a pending section as one muted line, with no prose of its own", () => {
    render(
      <LegalDocumentPage
        copy={legalCopy.en}
        document={legalCopy.en.documents.privacy}
        locale="en"
      />,
    );

    const pending = screen
      .getByRole("heading", { name: new RegExp(`What ${brand.en.name} collects`) })
      .closest("section");

    expect(pending).not.toBeNull();
    expect(
      within(pending as HTMLElement).getByText("Awaiting legal review"),
    ).toBeVisible();
    // No paragraph at all. Anything else would be invented law.
    expect(pending?.querySelectorAll("p")).toHaveLength(0);
  });

  it("says once, at the top, how many sections await review", () => {
    render(
      <LegalDocumentPage
        copy={legalCopy.en}
        document={legalCopy.en.documents.privacy}
        locale="en"
      />,
    );

    const note = screen.getByRole("note");
    expect(note).toHaveTextContent("7 of 8 sections are awaiting legal review.");
    expect(note).toHaveTextContent(legalCopy.en.pendingDetail);
    expect(
      screen.getAllByText(legalCopy.en.pendingDetail, { exact: false }),
    ).toHaveLength(1);
  });

  it("lists every section in the contents, linked to it", () => {
    render(
      <LegalDocumentPage
        copy={legalCopy.en}
        document={legalCopy.en.documents.terms}
        locale="en"
      />,
    );

    const contents = within(screen.getByRole("navigation", { name: "Contents" }));
    const links = contents.getAllByRole("link");
    expect(links).toHaveLength(legalCopy.en.documents.terms.sections.length);
    expect(links[0]).toHaveAttribute("href", "#section-1");
    expect(document.getElementById("section-1")).not.toBeNull();
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
