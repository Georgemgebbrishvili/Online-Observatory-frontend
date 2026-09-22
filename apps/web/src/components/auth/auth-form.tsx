"use client";

import Link from "next/link";
import { useActionState, useEffect, useTransition } from "react";
import { useFormStatus } from "react-dom";

import {
  registerAction,
  signInAction,
  verifyEmail,
  type AuthActionState,
} from "@/features/auth/actions";
import type { Locale } from "@/i18n/config";
import type { authCopy } from "@/i18n/resources/auth";
import { Button } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui/form";

type AuthResource = (typeof authCopy)[Locale];

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button className="auth-submit" loading={pending} size="large" type="submit">
      {label}
    </Button>
  );
}

// A full navigation once the API has answered: the next page is rendered afresh,
// on the cookies the API just set, with nothing from the router cache.
function useRedirect(state: AuthActionState) {
  useEffect(() => {
    if (state.redirectTo) window.location.assign(state.redirectTo);
  }, [state.redirectTo]);
}

function FormMessage({ state }: { state: AuthActionState }) {
  if (!state.message) return null;
  return (
    <p className="auth-form-error" role="alert">
      {state.message}
    </p>
  );
}

export function SignInForm({ copy, locale }: { copy: AuthResource; locale: Locale }) {
  const [state, action] = useActionState(signInAction.bind(null, locale), {});
  useRedirect(state);

  return (
    <form action={action} className="auth-form">
      <FormMessage state={state} />
      <Field htmlFor="email" label={copy.fields.email} error={state.errors?.email}>
        <TextInput
          autoComplete="email"
          id="email"
          name="email"
          placeholder={copy.fields.emailPlaceholder}
          required
          type="email"
        />
      </Field>
      <Field
        htmlFor="password"
        label={copy.fields.password}
        error={state.errors?.password}
      >
        <TextInput
          autoComplete="current-password"
          id="password"
          name="password"
          required
          type="password"
        />
      </Field>
      <SubmitButton label={copy.signIn.submit} />
      <p className="auth-alternate">
        {copy.signIn.alternate}{" "}
        <Link href={`/${locale}/register`}>{copy.signIn.alternateAction}</Link>
      </p>
    </form>
  );
}

export function RegistrationForm({
  copy,
  locale,
}: {
  copy: AuthResource;
  locale: Locale;
}) {
  const [state, action] = useActionState(registerAction.bind(null, locale), {});
  useRedirect(state);

  return (
    <form action={action} className="auth-form">
      <FormMessage state={state} />
      <Field htmlFor="name" label={copy.fields.name} error={state.errors?.name}>
        <TextInput
          autoComplete="name"
          id="name"
          name="name"
          placeholder={copy.fields.namePlaceholder}
          required
        />
      </Field>
      <Field htmlFor="email" label={copy.fields.email} error={state.errors?.email}>
        <TextInput
          autoComplete="email"
          id="email"
          name="email"
          placeholder={copy.fields.emailPlaceholder}
          required
          type="email"
        />
      </Field>
      <Field
        htmlFor="password"
        label={copy.fields.password}
        hint={copy.fields.passwordHint}
        error={state.errors?.password}
      >
        <TextInput
          autoComplete="new-password"
          id="password"
          maxLength={128}
          minLength={12}
          name="password"
          required
          type="password"
        />
      </Field>
      <SubmitButton label={copy.register.submit} />
      <p className="auth-alternate">
        {copy.register.alternate}{" "}
        <Link href={`/${locale}/sign-in`}>{copy.register.alternateAction}</Link>
      </p>
    </form>
  );
}

export function VerifyEmailForm({
  label,
  locale,
  token,
}: {
  label: string;
  locale: Locale;
  token: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        startTransition(async () => {
          try {
            await verifyEmail(token);
            window.location.assign(`/${locale}/app`);
          } catch {
            window.location.assign(
              `/${locale}/verify-email/${encodeURIComponent(token)}?invalid=1`,
            );
          }
        });
      }}
    >
      <Button loading={pending} size="large" type="submit">
        {label}
      </Button>
    </form>
  );
}
