import { describe, expect, it } from "vitest";

import { fieldOfView } from "./optics";

describe("fieldOfView", () => {
  it("gives the ASI585MC's field at the NexStar 6SE's native 1500 mm", () => {
    const field = fieldOfView(1500);
    expect(field.plateScaleArcsecPx).toBeCloseTo(0.399, 3);
    expect(field.widthArcmin).toBeCloseTo(25.5, 1);
    expect(field.heightArcmin).toBeCloseTo(14.4, 1);
  });

  it("halves the field when the focal length doubles", () => {
    expect(fieldOfView(3000).widthArcmin).toBeCloseTo(
      fieldOfView(1500).widthArcmin / 2,
      6,
    );
  });
});
