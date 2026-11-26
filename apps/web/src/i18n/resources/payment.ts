/**
 * Platform ADR-073 (gateway v1.3.0): what a payer back from Bank of Georgia is told
 * when the payment did not go through. The reasons are the bank's result codes, worded
 * as astroman.ge's checkout words them.
 */
export const paymentCopy = {
  en: {
    pendingTitle: "Checking your payment",
    pending: "The bank is still confirming the payment. Refresh this page in a minute.",
    failedTitle: "Payment not completed",
    notCharged: "You were not charged.",
    expired: "The payment window expired.",
    declined: (why: string) => `The payment did not go through: ${why}`,
    reasons: {
      "101": "online payments are restricted on this card. Contact your card issuer.",
      "103": "the card details are invalid.",
      "104": "the card's transaction limit was reached.",
      "105": "the card has expired.",
      "106": "the card's amount limit was reached.",
      "107": "there are not enough funds on the card.",
      "108": "card verification (SMS code / 3D Secure) failed.",
      "111": "card verification (SMS code) timed out.",
    } as Record<string, string>,
    otherReason: "the bank did not approve the payment.",
    retry:
      "Try again. On the Bank of Georgia page you can also pay with the BOG mobile bank.",
    retryAction: "Try again",
  },
  ka: {
    pendingTitle: "გადახდა მოწმდება",
    pending: "ბანკი ჯერ ადასტურებს გადახდას. განაახლე გვერდი ერთ წუთში.",
    failedTitle: "გადახდა არ დასრულდა",
    notCharged: "თანხა არ ჩამოგეჭრა.",
    expired: "გადახდის დრო ამოიწურა.",
    declined: (why: string) => `გადახდა ვერ განხორციელდა: ${why}`,
    reasons: {
      "101": "ბარათით ონლაინ გადახდა შეზღუდულია. დაუკავშირდი ბარათის გამცემ ბანკს.",
      "103": "ბარათის მონაცემები არასწორია.",
      "104": "ბარათზე ტრანზაქციების ლიმიტი ამოიწურა.",
      "105": "ბარათს ვადა გაუვიდა.",
      "106": "ბარათზე თანხის ლიმიტი ამოიწურა.",
      "107": "ბარათზე საკმარისი თანხა არ არის.",
      "108": "ბარათის დადასტურება (SMS კოდი / 3D Secure) ვერ მოხერხდა.",
      "111": "ბარათის დადასტურების (SMS კოდის) დრო ამოიწურა.",
    } as Record<string, string>,
    otherReason: "ბანკმა გადახდა არ დაადასტურა.",
    retry: "სცადე თავიდან. საქართველოს ბანკის გვერდზე შეგიძლია მობაილბანკითაც გადაიხადო.",
    retryAction: "თავიდან ცდა",
  },
} as const;
