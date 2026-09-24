import type { AppDestinationKey } from "@/features/navigation/navigation-model";
import type { Dictionary } from "@/i18n/types";

type AppDestinationPreviewProps = {
  destination: AppDestinationKey;
  navigation: Dictionary["navigation"]["app"];
  /**
   * A planned destination is one the platform supports and this repository has not
   * built. It is reachable and navigable so the route map is honest, and it says
   * plainly that it does not work yet rather than showing an empty imitation of it.
   */
  planned?: boolean;
};

export function AppDestinationPreview({
  destination,
  navigation,
  planned = false,
}: AppDestinationPreviewProps) {
  return (
    <section
      className="app-preview"
      aria-labelledby="app-preview-title"
      data-planned={planned || undefined}
    >
      <p className="eyebrow">
        <span aria-hidden="true" />
        {planned ? navigation.plannedEyebrow : navigation.previewEyebrow}
      </p>
      <h1 id="app-preview-title">{navigation[destination]}</h1>
      <p>{planned ? navigation.plannedDescription : navigation.previewDescription}</p>
      <div className="app-preview-instrument" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </section>
  );
}
