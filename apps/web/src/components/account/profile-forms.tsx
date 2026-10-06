"use client";

import type { User } from "@darkview/contracts";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Dropdown } from "@/components/ui/dropdown";
import { Field, TextInput } from "@/components/ui/form";
import {
  changeEmailAction,
  changePasswordAction,
  updateProfileAction,
  type ProfileActionState,
} from "@/features/account/actions";
import type { Locale } from "@/i18n/config";
import { profileCopy } from "@/i18n/resources/profile";
import { navigateWithFreshSession } from "@/lib/platform/browser";

type ProfileCopy = (typeof profileCopy)[Locale];

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button loading={pending} type="submit">
      {label}
    </Button>
  );
}

/** The session ended under the form: sign in again, on fresh cookies. */
function useSignedOut(locale: Locale, state: ProfileActionState) {
  useEffect(() => {
    if (state.signedOut) navigateWithFreshSession(`/${locale}/sign-in`);
  }, [locale, state.signedOut]);
}

function Outcome({ state }: { state: ProfileActionState }) {
  if (state.message) {
    return (
      <p className="profile-outcome profile-outcome-error" role="alert">
        {state.message}
      </p>
    );
  }
  if (state.done) {
    return (
      <p className="profile-outcome" role="status">
        {state.done}
      </p>
    );
  }
  return null;
}

export function DetailsForm({ locale, user }: { locale: Locale; user: User }) {
  const copy: ProfileCopy = profileCopy[locale];
  const [state, action] = useActionState(updateProfileAction.bind(null, locale), {});
  useSignedOut(locale, state);
  const shown = state.user ?? user;

  return (
    <form action={action} className="profile-form">
      <Field htmlFor="profile-name" label={copy.details.name} error={state.errors?.name}>
        <TextInput
          autoComplete="name"
          defaultValue={shown.displayName ?? ""}
          id="profile-name"
          maxLength={80}
          name="name"
          required
        />
      </Field>
      <Dropdown
        aria-describedby="profile-language-hint"
        defaultValue={shown.locale}
        id="profile-language"
        label={copy.details.language}
        name="language"
        options={(["en", "ka"] as const).map((value) => ({
          label: copy.details.languages[value],
          value,
        }))}
      />
      <p className="field-message" id="profile-language-hint">
        {copy.details.languageHint}
      </p>
      <Outcome state={state} />
      <SubmitButton label={copy.details.submit} />
    </form>
  );
}

export function EmailForm({ locale, user }: { locale: Locale; user: User }) {
  const copy: ProfileCopy = profileCopy[locale];
  const [state, action] = useActionState(changeEmailAction.bind(null, locale), {});
  useSignedOut(locale, state);

  return (
    <form action={action} className="profile-form">
      <p className="profile-current">{copy.email.current(user.email)}</p>
      <Field htmlFor="profile-email" label={copy.email.newEmail} error={state.errors?.email}>
        <TextInput autoComplete="email" id="profile-email" name="email" required type="email" />
      </Field>
      <Field
        htmlFor="profile-email-password"
        label={copy.email.currentPassword}
        error={state.errors?.currentPassword}
      >
        <TextInput
          autoComplete="current-password"
          id="profile-email-password"
          name="currentPassword"
          required
          type="password"
        />
      </Field>
      <Outcome state={state} />
      <SubmitButton label={copy.email.submit} />
    </form>
  );
}

export function PasswordForm({ locale }: { locale: Locale }) {
  const copy: ProfileCopy = profileCopy[locale];
  const [state, action] = useActionState(changePasswordAction.bind(null, locale), {});
  useSignedOut(locale, state);

  return (
    <form action={action} className="profile-form">
      <Field
        htmlFor="profile-current-password"
        label={copy.password.currentPassword}
        error={state.errors?.currentPassword}
      >
        <TextInput
          autoComplete="current-password"
          id="profile-current-password"
          name="currentPassword"
          required
          type="password"
        />
      </Field>
      <Field
        htmlFor="profile-new-password"
        label={copy.password.newPassword}
        hint={copy.password.newPasswordHint}
        error={state.errors?.password}
      >
        <TextInput
          autoComplete="new-password"
          id="profile-new-password"
          maxLength={128}
          minLength={12}
          name="password"
          required
          type="password"
        />
      </Field>
      <Outcome state={state} />
      <SubmitButton label={copy.password.submit} />
    </form>
  );
}
