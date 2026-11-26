import Link from "next/link";

import { StatePanel } from "@/components/ui/state-panel";
import type { Locale } from "@/i18n/config";
import { paymentCopy } from "@/i18n/resources/payment";

type PaymentNoticeProps = {
  locale: Locale;
  /** The page's search params, as the platform's bank return sets them. */
  query: { payment?: string | string[]; code?: string | string[] };
  /** Where a declined payer starts again. */
  retryHref?: string;
};

function one(value: string | string[] | undefined) {
  return typeof value === "string" ? value : undefined;
}

/**
 * Platform ADR-073: the payer is back from Bank of Georgia and the payment is not
 * captured. Says why, as the bank put it, and where to try again. Nothing once paid:
 * the platform then adds no `payment` to the address.
 */
export function PaymentNotice({ locale, query, retryHref }: PaymentNoticeProps) {
  const copy = paymentCopy[locale];
  const payment = one(query.payment);

  if (payment === "pending") {
    return (
      <StatePanel headingLevel={2} title={copy.pendingTitle} description={copy.pending} />
    );
  }
  if (payment !== "declined" && payment !== "expired") return null;

  const code = one(query.code);
  const head =
    payment === "expired"
      ? copy.expired
      : copy.declined((code && copy.reasons[code]) || copy.otherReason);

  return (
    <StatePanel
      variant="error"
      headingLevel={2}
      title={copy.failedTitle}
      description={`${head} ${copy.notCharged} ${copy.retry}`}
      action={
        retryHref ? (
          <Link className="page-link" href={retryHref}>
            {copy.retryAction}
          </Link>
        ) : undefined
      }
    />
  );
}
