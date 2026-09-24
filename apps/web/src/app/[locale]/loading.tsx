import { LoadingState } from "@/components/ui/loading-state";
import { isLocale } from "@/i18n/config";
import { feedbackCopy } from "@/i18n/resources/feedback";

/**
 * The shared loading state. A route with its own shape should add a `loading.tsx`
 * beside it; this is the floor, so no navigation ever lands on a blank page.
 */
export default async function RouteLoading({
  params,
}: {
  params?: Promise<{ locale?: string }>;
}) {
  const resolved = await params;
  const requested = resolved?.locale ?? "en";
  const locale = isLocale(requested) ? requested : "en";

  return (
    <main id="main-content" className="route-loading">
      <LoadingState label={feedbackCopy[locale].loading} lines={4} />
    </main>
  );
}
