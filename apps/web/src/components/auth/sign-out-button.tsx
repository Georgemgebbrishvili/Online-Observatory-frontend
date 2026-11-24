"use client";

import { useTransition } from "react";

import type { Locale } from "@/i18n/config";

type SignOutButtonProps = { className: string; label: string; locale: Locale };

// A button, not a form: before hydration a form would submit itself as a GET.
export function SignOutButton({ className, label, locale }: SignOutButtonProps) {
  const [pending, startTransition] = useTransition();

  return (
    <div className={className}>
      <button
        disabled={pending}
        type="button"
        onClick={() =>
          startTransition(async () => {
            // The sign-out call and the platform module (with the validator they carry)
            // load on the click, not with every page's header (ADR-104).
            // A 401 means the session had already ended; either way, leave.
            await import("@/features/auth/actions")
              .then(({ signOut }) => signOut())
              .catch(() => undefined);
            const { navigateWithFreshSession } = await import("@/lib/platform/browser");
            navigateWithFreshSession(`/${locale}/sign-in`);
          })
        }
      >
        {label}
      </button>
    </div>
  );
}
