import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { authCopy } from "@/i18n/resources/auth";
import { requireSession } from "@/lib/platform/session";
import { privatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = privatePageMetadata;

type AppLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AppLayout({ children, params }: AppLayoutProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const session = await requireSession(locale);
  const dictionary = await getDictionary(locale);

  return (
    <AppShell
      csrfToken={session.csrfToken}
      locale={locale}
      logoutLabel={authCopy[locale].logout}
      navigation={dictionary.navigation.app}
    >
      {children}
    </AppShell>
  );
}
