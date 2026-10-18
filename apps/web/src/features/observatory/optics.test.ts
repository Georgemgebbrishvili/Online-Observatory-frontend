import { describe, expect, it } from "vitest";

import { fieldOfView } from "./optics";

describe("fieldOfView", () => {
  it("gives the ASI585MC's field at the NexStar 8SE's native 2032 mm", () => {
    const field = fieldOfView(2032);
    expect(field.plateScaleArcsecPx).toBeCloseTo(0.294, 3);
    expect(field.widthArcmin).toBeCloseTo(18.8, 1);
    expect(field.heightArcmin).toBeCloseTo(10.6, 1);
  });

  it("halves the field when the focal length doubles", () => {
    expect(fieldOfView(4064).widthArcmin).toBeCloseTo(
      fieldOfView(2032).widthArcmin / 2,
      6,
    );
  });
});
