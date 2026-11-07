import { LoadingState } from "@/components/ui/loading-state";
import { isLocale } from "@/i18n/config";
import { loyaltyCopy } from "@/i18n/resources/loyalty";

/** Inside the app shell, which already owns <main>. */
export default async function LoyaltyLoading({
  params,
}: {
  params?: Promise<{ locale?: string }>;
}) {
  const requested = (await params)?.locale ?? "en";
  const locale = isLocale(requested) ? requested : "en";

  return (
    <div className="club-page">
      <LoadingState label={loyaltyCopy[locale].loading} lines={4} />
    </div>
  );
}
