import { OpticalRing } from "@/components/astronomy/optical-ring";

type TargetPreviewProps = {
  /** A plate from /plates, or null for a target with none. */
  plate: string | null;
  name: string;
  /** "Illustration — not telescope output". Shown with every plate, never without. */
  caption: string;
  note: string;
};

/**
 * What stands in the feed's place before there is a stream (ADR-027 §6): the target's
 * plate, always captioned as an illustration, or the optical ring when it has none.
 */
export function TargetPreview({ caption, name, note, plate }: TargetPreviewProps) {
  return (
    <figure className="target-preview" data-plate={plate ? "true" : "false"}>
      <div className="target-preview-stage">
        {plate ? (
          // A small static WebP from /public, shown at one size: next/image adds nothing.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={plate} alt="" width={388} height={555} />
        ) : (
          <OpticalRing size="large" label={name} />
        )}
      </div>
      <figcaption>
        {plate && <span className="target-preview-caption">{caption}</span>}
        <span>{note}</span>
      </figcaption>
    </figure>
  );
}
