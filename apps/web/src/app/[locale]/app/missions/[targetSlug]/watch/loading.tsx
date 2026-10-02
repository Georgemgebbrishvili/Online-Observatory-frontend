import { WatchView } from "@/components/room/mission-watch";
import { isLocale } from "@/i18n/config";
import { watchCopy } from "@/i18n/resources/watch";
import "@/styles/room.css";

/** The watch view's read in flight, inside the app shell. */
export default async function WatchLoading({
  params,
}: {
  params?: Promise<{ locale?: string }>;
}) {
  const requested = (await params)?.locale ?? "en";
  const locale = isLocale(requested) ? requested : "en";

  return (
    <div className="room">
      <WatchView phase="loading" copy={watchCopy[locale]} />
    </div>
  );
}
