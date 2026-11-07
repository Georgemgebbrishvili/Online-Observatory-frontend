import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { RegistrationForm } from "@/components/auth/auth-form";
import { AuthPage } from "@/components/auth/auth-page";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { authCopy } from "@/i18n/resources/auth";
import { getCurrentUser } from "@/lib/platform/session";
import { privatePageMetadata } from "@/lib/seo";
import "@/styles/auth.css";

type RegistrationPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ ref?: string | string[] }>;
};

/** DV-096: a member's code from `?ref=`, in the contract's shape, or none. */
function referralCode(value: string | string[] | undefined) {
  const code = typeof value === "string" ? value.trim() : "";
  return code.length >= 6 && code.length <= 16 ? code : null;
}

export async function generateMetadata({
  params,
}: RegistrationPageProps): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale)
    ? { title: authCopy[locale].register.metadataTitle, ...privatePageMetadata }
    : {};
}

export default async function RegistrationPage({
  params,
  searchParams,
}: RegistrationPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  if (await getCurrentUser()) redirect(`/${locale}/app`);

  const ref = referralCode((await searchParams).ref);
  const dictionary = await getDictionary(locale);
  const copy = authCopy[locale];
  return (
    <div className="site-frame">
      <SiteHeader locale={locale} navigation={dictionary.navigation} />
      <AuthPage
        title={copy.register.title}
      >
        <RegistrationForm copy={copy} locale={locale} referralCode={ref} />
      </AuthPage>
      <SiteFooter footer={dictionary.footer} locale={locale} path="register" />
    </div>
  );
}
