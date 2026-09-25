import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { brand } from "@/brand";

import { BrandLockup } from "./brand-lockup";

describe("BrandLockup", () => {
  it("renders the supplied text placeholder without inventing a logo", () => {
    render(
      <BrandLockup ariaLabel={brand.en.siteName} endorsement={brand.en.endorsement} />,
    );

    expect(screen.getByLabelText(brand.en.siteName)).toHaveTextContent(
      `${brand.en.name}${brand.en.endorsement}`,
    );
  });
});
