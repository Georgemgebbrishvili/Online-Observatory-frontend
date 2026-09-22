"use client";

import { useTransition } from "react";

import { signOut } from "@/features/auth/actions";
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
            // A 401 means the session had already ended; either way, leave.
            await signOut().catch(() => undefined);
            window.location.assign(`/${locale}/sign-in`);
          })
        }
      >
        {label}
      </button>
    </div>
  );
}
