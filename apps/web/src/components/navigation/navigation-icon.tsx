import type { NavigationIconName } from "@/features/navigation/navigation-model";

type NavigationIconProps = {
  name: NavigationIconName;
};

export function NavigationIcon({ name }: NavigationIconProps) {
  if (name === "home") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="m4 10 8-6 8 6v9a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-9Z" />
      </svg>
    );
  }

  if (name === "missions") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="7" />
        <circle cx="12" cy="12" r="2.5" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
      </svg>
    );
  }

  if (name === "live") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="2.5" />
        <path d="M7.8 7.8a6 6 0 0 0 0 8.4M16.2 7.8a6 6 0 0 1 0 8.4M4.6 4.6a10.5 10.5 0 0 0 0 14.8M19.4 4.6a10.5 10.5 0 0 1 0 14.8" />
      </svg>
    );
  }

  if (name === "collection") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <circle cx="9" cy="9" r="1.5" />
        <path d="m6.5 17 4-4 2.5 2 2.5-3 2 2.5" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
    </svg>
  );
}
