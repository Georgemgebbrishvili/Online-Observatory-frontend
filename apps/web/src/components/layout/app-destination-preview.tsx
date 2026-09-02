import type { AppDestinationKey } from "@/features/navigation/navigation-model";
import type { Dictionary } from "@/i18n/types";

type AppDestinationPreviewProps = {
  destination: AppDestinationKey;
  navigation: Dictionary["navigation"]["app"];
};

export function AppDestinationPreview({
  destination,
  navigation,
}: AppDestinationPreviewProps) {
  return (
    <section className="app-preview" aria-labelledby="app-preview-title">
      <p className="eyebrow">
        <span aria-hidden="true" />
        {navigation.previewEyebrow}
      </p>
      <h1 id="app-preview-title">{navigation[destination]}</h1>
      <p>{navigation.previewDescription}</p>
      <div className="app-preview-instrument" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </section>
  );
}
