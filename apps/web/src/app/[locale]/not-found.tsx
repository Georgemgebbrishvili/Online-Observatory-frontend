import Link from "next/link";

import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

export default async function NotFound({ params }: { params?: { locale?: string } }) {
  const requestedLocale = params?.locale ?? "en";
  const locale = isLocale(requestedLocale) ? requestedLocale : "en";
  const dictionary = await getDictionary(locale);

  return (
    <main id="main-content" className="not-found">
      <p>404</p>
      <h1>{dictionary.notFound.title}</h1>
      <Link href={`/${locale}`}>{dictionary.notFound.action}</Link>
    </main>
  );
}
