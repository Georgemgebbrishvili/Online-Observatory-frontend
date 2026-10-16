import { notFound, redirect } from "next/navigation";

import { isLocale } from "@/i18n/config";

type ReservePageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ startAt?: string | string[]; reschedule?: string | string[] }>;
};

/**
 * The reserve page became a step of the booking board (ADR-053 §7). Old links land on
 * the board with their slot chosen, and a lost booking's offer kept.
 */
export default async function ReservePage({ params, searchParams }: ReservePageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const { startAt, reschedule } = await searchParams;
  const query = new URLSearchParams();
  if (typeof startAt === "string") query.set("startAt", startAt);
  if (typeof reschedule === "string") query.set("reschedule", reschedule);
  const search = query.toString();
  redirect(`/${locale}/app/book${search ? `?${search}` : ""}`);
}
