"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { Locale } from "@/i18n/config";
import type { OperatorCopy } from "@/i18n/resources/operator";

export function OperatorNavigation({
  copy,
  locale,
}: {
  copy: OperatorCopy["navigation"];
  locale: Locale;
}) {
  const pathname = usePathname();
  const links = [
    { href: `/${locale}/admin`, label: copy.overview },
    { href: `/${locale}/admin/control`, label: copy.control },
  ];

  return (
    <nav aria-label={copy.label} className="operator-navigation">
      {links.map((link) => (
        <Link
          aria-current={pathname === link.href ? "page" : undefined}
          href={link.href}
          key={link.href}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
