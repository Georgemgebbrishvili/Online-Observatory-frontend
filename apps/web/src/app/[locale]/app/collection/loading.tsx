import { LoadingState } from "@/components/ui/loading-state";
import { isLocale } from "@/i18n/config";
import { collectionGalleryCopy } from "@/i18n/resources/collection";

/** Inside the app shell, which already owns <main>. */
export default async function CollectionLoading({
  params,
}: {
  params?: Promise<{ locale?: string }>;
}) {
  const requested = (await params)?.locale ?? "en";
  const locale = isLocale(requested) ? requested : "en";

  return (
    <div className="collection-page">
      <LoadingState label={collectionGalleryCopy[locale].loading} lines={4} />
    </div>
  );
}
