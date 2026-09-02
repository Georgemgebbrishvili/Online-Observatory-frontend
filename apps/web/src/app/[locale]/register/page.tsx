import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RegistrationForm } from "@/components/auth/auth-form";
import { AuthPage } from "@/components/auth/auth-page";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { authCopy } from "@/i18n/resources/auth";
import { privatePageMetadata } from "@/lib/seo";
import "@/styles/auth.css";

type RegistrationPageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({
  params,
}: RegistrationPageProps): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale)
    ? { title: authCopy[locale].register.metadataTitle, ...privatePageMetadata }
    : {};
}

export default async function RegistrationPage({ params }: RegistrationPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dictionary = await getDictionary(locale);
  const copy = authCopy[locale];
  return (
    <div className="site-frame">
      <SiteHeader locale={locale} navigation={dictionary.navigation} />
      <AuthPage
        eyebrow={copy.eyebrow}
        title={copy.register.title}
        description={copy.register.description}
        securityNote={copy.securityNote}
      >
        <RegistrationForm copy={copy} locale={locale} />
      </AuthPage>
      <SiteFooter footer={dictionary.footer} locale={locale} path="register" />
    </div>
  );
}
