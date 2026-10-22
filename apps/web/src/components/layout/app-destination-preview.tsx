import type { AppDestinationKey } from "@/features/navigation/navigation-model";
import type { Dictionary } from "@/i18n/types";
import { StatePanel } from "@/components/ui/state-panel";

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
            data-planned={planned || undefined}
    >
      <StatePanel
        headingLevel={1}
        title={navigation[destination]}
        description={planned ? navigation.plannedDescription : navigation.previewDescription}
      />
    </section>
  );
}
