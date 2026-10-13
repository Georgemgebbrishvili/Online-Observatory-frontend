import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { brand } from "@/brand";

import { BrandLockup } from "./brand-lockup";

describe("BrandLockup", () => {
  it("shows the supplied comet mark beside the name", () => {
    const { container } = render(<BrandLockup ariaLabel={brand.en.siteName} />);

    expect(screen.getByLabelText(brand.en.siteName)).toHaveTextContent(brand.en.name);
    // The kit's own file, and silent: the lockup's label already names it.
    expect(container.querySelector("img")).toHaveAttribute("src", "/brand/logo-mark.svg");
    expect(container.querySelector("img")).toHaveAttribute("alt", "");
  });

  it("signs off with the endorsement only where it is given", () => {
    render(
      <BrandLockup ariaLabel={brand.en.siteName} endorsement={brand.en.endorsement} />,
    );

    expect(screen.getByLabelText(brand.en.siteName)).toHaveTextContent(
      `${brand.en.name}${brand.en.endorsement}`,
    );
  });
});
