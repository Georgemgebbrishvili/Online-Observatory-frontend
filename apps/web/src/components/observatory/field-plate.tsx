import { fieldOfView, moonMeanArcmin } from "@/features/observatory/optics";

type FieldPlateProps = {
  focalLengthMm: number;
  labels: {
    aria: string;
    sensor: string;
    moon: string;
    caption: string;
  };
  locale: "en" | "ka";
};

/**
 * The Moon with the camera's frame drawn over it to scale (ADR-041). A spec sheet's
 * 25′ × 14′ means little; a rectangle that plainly does not hold the Moon says the same
 * thing in one look. Every length is computed from the telescope's focal length and the
 * sensor; the Moon is drawn, not photographed, and the caption says so (ADR-039).
 */
export function FieldPlate({ focalLengthMm, labels, locale }: FieldPlateProps) {
  const field = fieldOfView(focalLengthMm);
  // The plate is a 100-unit square; the Moon is a disc 60 units across.
  const moon = 60;
  const sensorWidth = (field.widthArcmin / moonMeanArcmin) * moon;
  const sensorHeight = (field.heightArcmin / moonMeanArcmin) * moon;
  const number = new Intl.NumberFormat(locale === "ka" ? "ka-GE" : "en-GB", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  });

  return (
    <figure className="field-plate" aria-label={labels.aria}>
      <div className="field-plate-drawing">
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <circle className="field-plate-ring" cx="50" cy="50" r="42" />
          <circle
            className="field-plate-ring field-plate-ring-turning"
            cx="50"
            cy="50"
            r="46"
          />
          <g className="field-plate-ticks">
            <line x1="50" y1="2" x2="50" y2="6" />
            <line x1="50" y1="94" x2="50" y2="98" />
            <line x1="2" y1="50" x2="6" y2="50" />
            <line x1="94" y1="50" x2="98" y2="50" />
          </g>
          <circle className="field-plate-moon" cx="50" cy="50" r={moon / 2} />
          <rect
            className="field-plate-sensor"
            x={50 - sensorWidth / 2}
            y={50 - sensorHeight / 2}
            width={sensorWidth}
            height={sensorHeight}
          />
        </svg>
        <span
          className="field-plate-note field-plate-note-sensor"
          style={{ top: `${50 - sensorHeight / 2}%` }}
        >
          <b>
            {number.format(field.widthArcmin)}′ × {number.format(field.heightArcmin)}′
          </b>
          {labels.sensor}
        </span>
        <span className="field-plate-note field-plate-note-moon">
          <b>{number.format(moonMeanArcmin)}′</b>
          {labels.moon}
        </span>
      </div>
      <figcaption>{labels.caption}</figcaption>
    </figure>
  );
}
