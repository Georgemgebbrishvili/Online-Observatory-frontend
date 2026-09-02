import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SignInForm } from "@/components/auth/auth-form";
import { AuthPage } from "@/components/auth/auth-page";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { authCopy } from "@/i18n/resources/auth";
import { privatePageMetadata } from "@/lib/seo";
import "@/styles/auth.css";

type SignInPageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: SignInPageProps): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale)
    ? { title: authCopy[locale].signIn.metadataTitle, ...privatePageMetadata }
    : {};
}

export default async function SignInPage({ params }: SignInPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dictionary = await getDictionary(locale);
  const copy = authCopy[locale];
  return (
    <div className="site-frame">
      <SiteHeader locale={locale} navigation={dictionary.navigation} />
      <AuthPage
        eyebrow={copy.eyebrow}
        title={copy.signIn.title}
        description={copy.signIn.description}
        securityNote={copy.securityNote}
      >
        <SignInForm copy={copy} locale={locale} />
      </AuthPage>
      <SiteFooter footer={dictionary.footer} locale={locale} path="sign-in" />
    </div>
  );
}
