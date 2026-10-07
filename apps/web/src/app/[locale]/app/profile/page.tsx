import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  DeleteAccountForm,
  DetailsForm,
  EmailForm,
  PasswordForm,
} from "@/components/account/profile-forms";
import { isLocale } from "@/i18n/config";
import { profileCopy } from "@/i18n/resources/profile";
import { requireUser } from "@/lib/platform/session";
import "@/styles/profile.css";

type ProfilePageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? { title: profileCopy[locale].metadataTitle } : {};
}

/** DV-079, account slice 2: docs/plan/account/02-profile.md. */
export default async function ProfilePage({ params }: ProfilePageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const user = await requireUser(locale);
  const copy = profileCopy[locale];

  return (
    <div className="profile-page">
      <header className="profile-hero">
        <p className="kicker">{copy.eyebrow}</p>
        <h1>{copy.title}</h1>
        <p>{copy.introduction}</p>
      </header>
      <section className="surface-panel profile-panel" aria-labelledby="profile-details-title">
        <h2 id="profile-details-title">{copy.details.title}</h2>
        <DetailsForm locale={locale} user={user} />
      </section>
      <section className="surface-panel profile-panel" aria-labelledby="profile-email-title">
        <h2 id="profile-email-title">{copy.email.title}</h2>
        <EmailForm locale={locale} user={user} />
      </section>
      <section className="surface-panel profile-panel" aria-labelledby="profile-password-title">
        <h2 id="profile-password-title">{copy.password.title}</h2>
        <PasswordForm locale={locale} />
      </section>
      <section className="surface-panel profile-panel" aria-labelledby="profile-delete-title">
        <h2 id="profile-delete-title">{copy.deletion.title}</h2>
        <DeleteAccountForm locale={locale} />
      </section>
    </div>
  );
}
