import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AuthPage } from "@/components/auth/auth-page";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { verifyEmailAction } from "@/features/auth/actions";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { authCopy } from "@/i18n/resources/auth";
import { privatePageMetadata } from "@/lib/seo";
import "@/styles/auth.css";

type VerifyEmailPageProps = {
  params: Promise<{ locale: string; token: string }>;
  searchParams: Promise<{ invalid?: string }>;
};

export async function generateMetadata({
  params,
}: VerifyEmailPageProps): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale)
    ? {
        title: authCopy[locale].verify.metadataTitle,
        referrer: "no-referrer",
        ...privatePageMetadata,
      }
    : {};
}

export default async function VerifyEmailPage({
  params,
  searchParams,
}: VerifyEmailPageProps) {
  const { locale, token } = await params;
  const { invalid } = await searchParams;
  if (!isLocale(locale)) notFound();

  const dictionary = await getDictionary(locale);
  const copy = authCopy[locale];
  const action = verifyEmailAction.bind(null, locale, token);
  return (
    <div className="site-frame">
      <SiteHeader locale={locale} navigation={dictionary.navigation} />
      <AuthPage
        eyebrow={copy.eyebrow}
        title={copy.verify.title}
        description={copy.verify.description}
        securityNote={copy.securityNote}
      >
        {invalid && (
          <p className="auth-form-error" role="alert">
            {copy.verify.invalid}
          </p>
        )}
        <form action={action}>
          <Button size="large" type="submit">
            {copy.verify.submit}
          </Button>
        </form>
      </AuthPage>
      <SiteFooter footer={dictionary.footer} locale={locale} />
    </div>
  );
}
