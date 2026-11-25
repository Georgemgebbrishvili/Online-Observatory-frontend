import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { SignInForm } from "@/components/auth/auth-form";
import { AuthPage } from "@/components/auth/auth-page";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { bookingReturn } from "@/features/auth/next";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { authCopy } from "@/i18n/resources/auth";
import { getCurrentUser } from "@/lib/platform/session";
import { privatePageMetadata } from "@/lib/seo";
import "@/styles/auth.css";

type SignInPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; next?: string | string[] }>;
};

export async function generateMetadata({ params }: SignInPageProps): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale)
    ? { title: authCopy[locale].signIn.metadataTitle, ...privatePageMetadata }
    : {};
}

export default async function SignInPage({ params, searchParams }: SignInPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const { error, next: asked } = await searchParams;
  // ADR-106: a visitor who chose a slot before signing in goes back to it.
  const next = bookingReturn(asked, locale);
  if (await getCurrentUser()) redirect(next ?? `/${locale}/app`);

  const dictionary = await getDictionary(locale);
  const copy = authCopy[locale];
  // Platform ADR-048: every Google failure lands here as `error=google`.
  const message = error === "google" ? copy.errors.google : undefined;
  return (
    <div className="site-frame">
      <SiteHeader locale={locale} navigation={dictionary.navigation} />
      <AuthPage
        title={copy.signIn.title}
      >
        <SignInForm copy={copy} locale={locale} message={message} next={next} />
      </AuthPage>
      <SiteFooter footer={dictionary.footer} locale={locale} path="sign-in" />
    </div>
  );
}
