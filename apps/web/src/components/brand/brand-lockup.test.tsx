import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BrandLockup } from "./brand-lockup";

describe("BrandLockup", () => {
  it("renders the supplied text placeholder without inventing a logo", () => {
    render(<BrandLockup ariaLabel="Darkview by Astroman" endorsement="by Astroman" />);

    expect(screen.getByLabelText("Darkview by Astroman")).toHaveTextContent(
      "Darkviewby Astroman",
    );
  });
});
