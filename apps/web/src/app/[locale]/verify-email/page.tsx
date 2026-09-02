import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AuthPage } from "@/components/auth/auth-page";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { authCopy } from "@/i18n/resources/auth";
import { privatePageMetadata } from "@/lib/seo";
import "@/styles/auth.css";

type VerificationPendingPageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({
  params,
}: VerificationPendingPageProps): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale)
    ? { title: authCopy[locale].verifyPending.metadataTitle, ...privatePageMetadata }
    : {};
}

export default async function VerificationPendingPage({
  params,
}: VerificationPendingPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dictionary = await getDictionary(locale);
  const copy = authCopy[locale];
  return (
    <div className="site-frame">
      <SiteHeader locale={locale} navigation={dictionary.navigation} />
      <AuthPage
        eyebrow={copy.eyebrow}
        title={copy.verifyPending.title}
        description={copy.verifyPending.description}
        securityNote={copy.securityNote}
      >
        <Link className="button button-primary button-large" href={`/${locale}/sign-in`}>
          <span>{copy.verifyPending.action}</span>
        </Link>
      </AuthPage>
      <SiteFooter footer={dictionary.footer} locale={locale} path="verify-email" />
    </div>
  );
}
