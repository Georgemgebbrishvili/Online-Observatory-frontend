// The ZWO ASI585MC's sensor, from its datasheet: 3840 × 2160 pixels of 2.9 µm.
export const asi585mc = { widthPx: 3840, heightPx: 2160, pixelMicrons: 2.9 } as const;

// The Moon's mean apparent diameter. Its true size tonight varies by about seven per
// cent either side; the plate says "mean" rather than inventing tonight's figure.
export const moonMeanArcmin = 31.1;

const arcsecPerRadian = 206_264.806;

export type FieldOfView = {
  widthArcmin: number;
  heightArcmin: number;
  plateScaleArcsecPx: number;
};

/** The camera's field at a focal length: what one frame holds, in arcminutes. */
export function fieldOfView(focalLengthMm: number, sensor = asi585mc): FieldOfView {
  const plateScaleArcsecPx =
    (sensor.pixelMicrons / 1000 / focalLengthMm) * arcsecPerRadian;
  return {
    widthArcmin: (plateScaleArcsecPx * sensor.widthPx) / 60,
    heightArcmin: (plateScaleArcsecPx * sensor.heightPx) / 60,
    plateScaleArcsecPx,
  };
}
