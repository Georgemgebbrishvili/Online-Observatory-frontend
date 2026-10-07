import type { AccountDeletionBlocker } from "@darkview/contracts";

import { brand } from "@/brand";

/** Account slice 2 (DV-079, ADR-042): docs/plan/account/02-profile.md. */
type ProfileCopy = {
  metadataTitle: string;
  eyebrow: string;
  title: string;
  introduction: string;
  details: {
    title: string;
    name: string;
    language: string;
    languageHint: string;
    languages: Record<"en" | "ka", string>;
    submit: string;
    saved: string;
  };
  email: {
    title: string;
    current: (email: string) => string;
    newEmail: string;
    currentPassword: string;
    submit: string;
    sent: (email: string) => string;
  };
  password: {
    title: string;
    currentPassword: string;
    newPassword: string;
    newPasswordHint: string;
    submit: string;
    changed: string;
  };
  /** ADR-044: deleting the account. */
  deletion: {
    title: string;
    warning: string;
    consequences: string[];
    currentPassword: string;
    understand: string;
    submit: string;
    deleted: string;
    home: string;
    blocked: string;
    blockers: Record<AccountDeletionBlocker, string>;
    changed: string;
  };
  errors: {
    shortName: string;
    invalidEmail: string;
    sameEmail: string;
    wrongPassword: string;
    weakPassword: string;
    rateLimited: string;
    unavailable: string;
  };
};

export const profileCopy: Record<"en" | "ka", ProfileCopy> = {
  en: {
    metadataTitle: `Your profile · ${brand.en.name}`,
    eyebrow: "Account",
    title: "Your profile.",
    introduction: "Your name, your email and your password.",
    details: {
      title: "Details",
      name: "Name",
      language: "Language for emails",
      languageHint: "The language we write to you in.",
      languages: { en: "English", ka: "ქართული" },
      submit: "Save",
      saved: "Saved.",
    },
    email: {
      title: "Email",
      current: (email) => `Your address is ${email}.`,
      newEmail: "New email",
      currentPassword: "Current password",
      submit: "Send link",
      sent: (email) =>
        `Check ${email}. Your address changes when you open the link we sent there. It works for 30 minutes.`,
    },
    password: {
      title: "Password",
      currentPassword: "Current password",
      newPassword: "New password",
      newPasswordHint: "Between 12 and 128 characters.",
      submit: "Change password",
      changed: "Password changed. You're signed out everywhere else.",
    },
    deletion: {
      title: "Delete your account",
      warning: "Your account is deleted at once, and this cannot be undone.",
      consequences: [
        "Your captures and your Collection are deleted, and every link to them stops working.",
        "Your loyalty points are lost.",
        "Your bookings and payments are kept for our accounts, without your name or email.",
      ],
      currentPassword: "Current password",
      understand: "I understand that this cannot be undone.",
      submit: "Delete my account",
      deleted: "Your account has been deleted.",
      home: "Go to the home page",
      blocked: "Your account cannot be deleted yet:",
      blockers: {
        LIVE_MISSION: "An observation of yours is not over yet. Wait for it to end.",
        UPCOMING_BOOKING: "A paid slot of yours is still ahead. Wait for it to pass.",
        HELD_BOOKING:
          "A slot is held for you awaiting payment. Cancel it in your bookings.",
        OPEN_ENTITLEMENT:
          "A refund or a free slot is owed to you. Take it in your bookings.",
        OBSERVER_SEAT: "You have a seat on an observation that is not over yet.",
        SUBSCRIPTION: "Your subscription is still running. Cancel it first.",
        GIFT_VOUCHER: "A gift voucher you bought is still unused or unpaid.",
        NETWORK_NODE: "You own a telescope on the network. Contact us to close it.",
        OPERATOR: "An operator account is closed by another operator.",
      },
      changed: "Your account changed while it was being deleted. Try again.",
    },
    errors: {
      shortName: "Use at least two characters.",
      invalidEmail: "Enter a valid email address.",
      sameEmail: "That is already your address.",
      wrongPassword: "That is not your current password.",
      weakPassword: "Use a password between 12 and 128 characters.",
      rateLimited: "Too many attempts. Try again later.",
      unavailable: "Account changes are unavailable right now. Try again later.",
    },
  },
  ka: {
    metadataTitle: `შენი პროფილი · ${brand.ka.nominative}`,
    eyebrow: "ანგარიში",
    title: "შენი პროფილი.",
    introduction: "შენი სახელი, ელფოსტა და პაროლი.",
    details: {
      title: "მონაცემები",
      name: "სახელი",
      language: "წერილების ენა",
      languageHint: "ენა, რომელზეც მოგწერთ.",
      languages: { en: "English", ka: "ქართული" },
      submit: "შენახვა",
      saved: "შენახულია.",
    },
    email: {
      title: "ელფოსტა",
      current: (email) => `შენი მისამართია ${email}.`,
      newEmail: "ახალი ელფოსტა",
      currentPassword: "მიმდინარე პაროლი",
      submit: "ბმულის გაგზავნა",
      sent: (email) =>
        `შეამოწმე ${email}. მისამართი შეიცვლება, როცა იქ გაგზავნილ ბმულს გახსნი. ის 30 წუთი მოქმედებს.`,
    },
    password: {
      title: "პაროლი",
      currentPassword: "მიმდინარე პაროლი",
      newPassword: "ახალი პაროლი",
      newPasswordHint: "12-დან 128 სიმბოლომდე.",
      submit: "პაროლის შეცვლა",
      changed: "პაროლი შეიცვალა. ყველა სხვა მოწყობილობაზე სესია დასრულდა.",
    },
    deletion: {
      title: "ანგარიშის წაშლა",
      warning: "ანგარიში მაშინვე წაიშლება და ამის გაუქმება შეუძლებელია.",
      consequences: [
        "შენი კადრები და კოლექცია წაიშლება, მათი ყველა ბმული კი აღარ იმუშავებს.",
        "ლოიალობის ქულები დაიკარგება.",
        "შენი ჯავშნები და გადახდები ჩვენს ანგარიშებში დარჩება, შენი სახელისა და ელფოსტის გარეშე.",
      ],
      currentPassword: "მიმდინარე პაროლი",
      understand: "მესმის, რომ ამის გაუქმება შეუძლებელია.",
      submit: "ანგარიშის წაშლა",
      deleted: "შენი ანგარიში წაიშალა.",
      home: "მთავარ გვერდზე გადასვლა",
      blocked: "ანგარიშის წაშლა ჯერ შეუძლებელია:",
      blockers: {
        LIVE_MISSION: "შენი დაკვირვება ჯერ არ დასრულებულა. დაელოდე მის დასრულებას.",
        UPCOMING_BOOKING: "შენი გადახდილი დრო ჯერ წინ არის. დაელოდე, სანამ გავა.",
        HELD_BOOKING:
          "დრო შენთვის დაკავებულია და გადახდას ელოდება. გააუქმე ის ჯავშნებში.",
        OPEN_ENTITLEMENT: "თანხის დაბრუნება ან უფასო დრო გეკუთვნის. აიღე ის ჯავშნებში.",
        OBSERVER_SEAT: "გაქვს ადგილი დაკვირვებაზე, რომელიც ჯერ არ დასრულებულა.",
        SUBSCRIPTION: "შენი გამოწერა ჯერ მოქმედებს. ჯერ ის გააუქმე.",
        GIFT_VOUCHER:
          "შენ მიერ ნაყიდი სასაჩუქრე ვაუჩერი ჯერ გამოუყენებელი ან გადაუხდელია.",
        NETWORK_NODE: "ქსელში ტელესკოპი გეკუთვნის. მის დასახურად დაგვიკავშირდი.",
        OPERATOR: "ოპერატორის ანგარიშს სხვა ოპერატორი ხურავს.",
      },
      changed: "ანგარიში წაშლისას შეიცვალა. სცადე თავიდან.",
    },
    errors: {
      shortName: "გამოიყენე მინიმუმ ორი სიმბოლო.",
      invalidEmail: "შეიყვანე სწორი ელფოსტის მისამართი.",
      sameEmail: "ეს უკვე შენი მისამართია.",
      wrongPassword: "ეს შენი მიმდინარე პაროლი არ არის.",
      weakPassword: "გამოიყენე 12-დან 128-მდე სიმბოლოს პაროლი.",
      rateLimited: "ცდების ლიმიტი ამოიწურა. მოგვიანებით სცადე.",
      unavailable: "ანგარიშის ცვლილება ახლა მიუწვდომელია. მოგვიანებით სცადე.",
    },
  },
};
