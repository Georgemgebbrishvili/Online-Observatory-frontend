import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { PasswordResetRequestForm } from "@/components/auth/auth-form";
import { AuthPage } from "@/components/auth/auth-page";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { authCopy } from "@/i18n/resources/auth";
import { getCurrentUser } from "@/lib/platform/session";
import { privatePageMetadata } from "@/lib/seo";
import "@/styles/auth.css";

type ResetPasswordPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ sent?: string }>;
};

export async function generateMetadata({
  params,
}: ResetPasswordPageProps): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale)
    ? { title: authCopy[locale].resetRequest.metadataTitle, ...privatePageMetadata }
    : {};
}

// ADR-040. The answer is the same whether or not the address holds an account, so
// "sent" never says which it was.
export default async function ResetPasswordPage({
  params,
  searchParams,
}: ResetPasswordPageProps) {
  const { locale } = await params;
  const { sent } = await searchParams;
  if (!isLocale(locale)) notFound();
  if (await getCurrentUser()) redirect(`/${locale}/app`);

  const dictionary = await getDictionary(locale);
  const copy = authCopy[locale];
  return (
    <div className="site-frame">
      <SiteHeader locale={locale} navigation={dictionary.navigation} />
      <AuthPage
        eyebrow={copy.eyebrow}
        title={sent ? copy.resetRequest.sentTitle : copy.resetRequest.title}
        description={
          sent ? copy.resetRequest.sentDescription : copy.resetRequest.description
        }
        securityNote={copy.securityNote}
      >
        {sent ? (
          <Link
            className="button button-primary button-large"
            href={`/${locale}/sign-in`}
          >
            <span>{copy.resetRequest.back}</span>
          </Link>
        ) : (
          <PasswordResetRequestForm copy={copy} locale={locale} />
        )}
      </AuthPage>
      <SiteFooter footer={dictionary.footer} locale={locale} path="reset-password" />
    </div>
  );
}
