import type { CollectionFrameId } from "@/features/targets/homepage-data";

type CollectionFrameProps = {
  id: CollectionFrameId;
  name: string;
  catalog: string;
  demoLabel: string;
  visual: string;
};

export function CollectionFrame({
  catalog,
  demoLabel,
  id,
  name,
  visual,
}: CollectionFrameProps) {
  return (
    <figure className={`collection-frame collection-frame-${visual}`}>
      <div className="collection-placeholder" aria-hidden="true">
        <span className="collection-crosshair" />
        <span className="collection-object" />
        <code>{id.toUpperCase()}</code>
      </div>
      <figcaption>
        <div>
          <strong>{name}</strong>
          <span>{catalog}</span>
        </div>
        <span>{demoLabel}</span>
      </figcaption>
    </figure>
  );
}
