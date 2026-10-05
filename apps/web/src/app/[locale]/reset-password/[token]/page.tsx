import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PasswordResetConfirmForm } from "@/components/auth/auth-form";
import { AuthPage } from "@/components/auth/auth-page";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { authCopy } from "@/i18n/resources/auth";
import { privatePageMetadata } from "@/lib/seo";
import "@/styles/auth.css";

type ResetPasswordTokenPageProps = { params: Promise<{ locale: string; token: string }> };

export async function generateMetadata({
  params,
}: ResetPasswordTokenPageProps): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale)
    ? {
        title: authCopy[locale].resetConfirm.metadataTitle,
        // The token is in this page's address; no link out may carry it.
        referrer: "no-referrer",
        ...privatePageMetadata,
      }
    : {};
}

// Not signed-out only: whoever opens a valid link is signed in as its owner, and every
// other session ends (ADR-040).
export default async function ResetPasswordTokenPage({
  params,
}: ResetPasswordTokenPageProps) {
  const { locale, token } = await params;
  if (!isLocale(locale)) notFound();

  const dictionary = await getDictionary(locale);
  const copy = authCopy[locale];
  return (
    <div className="site-frame">
      <SiteHeader locale={locale} navigation={dictionary.navigation} />
      <AuthPage
        eyebrow={copy.eyebrow}
        title={copy.resetConfirm.title}
        description={copy.resetConfirm.description}
        securityNote={copy.securityNote}
      >
        <PasswordResetConfirmForm copy={copy} locale={locale} token={token} />
      </AuthPage>
      <SiteFooter footer={dictionary.footer} locale={locale} />
    </div>
  );
}
