import type { AccountDeletionBlocker } from "@darkview/contracts";

import { brand } from "@/brand";

/** Account slice 2 (DV-079, ADR-042): docs/plan/account/02-profile.md. */
type ProfileCopy = {
  metadataTitle: string;
  title: string;
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
    title: "Your profile.",
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
        `Check ${email}. Open the link within 30 minutes to switch.`,
    },
    password: {
      title: "Password",
      currentPassword: "Current password",
      newPassword: "New password",
      newPasswordHint: "Between 12 and 128 characters.",
      submit: "Change password",
      changed: "Password changed. Other devices are signed out.",
    },
    deletion: {
      title: "Delete your account",
      warning: "This is instant and cannot be undone.",
      consequences: [
        "Your captures, Collection and their links are deleted.",
        "Your loyalty points are lost.",
        "Bookings and payments stay in our records, without your name or email.",
      ],
      currentPassword: "Current password",
      understand: "I understand this cannot be undone.",
      submit: "Delete my account",
      deleted: "Your account has been deleted.",
      home: "Go to the home page",
      blocked: "Your account cannot be deleted yet:",
      blockers: {
        LIVE_MISSION: "A session is running. Wait for it to end.",
        UPCOMING_BOOKING: "You have a paid session ahead. Wait for it to pass.",
        HELD_BOOKING:
          "A session awaits payment. Cancel it in your bookings.",
        OPEN_ENTITLEMENT:
          "You are owed a refund or free session. Claim it in your bookings.",
        OBSERVER_SEAT: "You have a seat on a session that hasn't ended. Wait for it to end.",
        SUBSCRIPTION: "Your subscription is still running. Cancel it first.",
        GIFT_VOUCHER: "A gift voucher you bought is unused or unpaid. Contact us.",
        NETWORK_NODE: "You own a telescope on the network. Contact us to close it.",
        OPERATOR: "An operator account is closed by another operator.",
      },
      changed: "Your account changed. Try again.",
    },
    errors: {
      shortName: "Use at least two characters.",
      invalidEmail: "Enter a valid email address.",
      sameEmail: "That is already your address.",
      wrongPassword: "That is not your current password.",
      weakPassword: "Use a password between 12 and 128 characters.",
      rateLimited: "Too many attempts. Try again later.",
      unavailable: "Unavailable right now. Try again later.",
    },
  },
  ka: {
    metadataTitle: `შენი პროფილი · ${brand.ka.nominative}`,
    title: "შენი პროფილი.",
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
      currentPassword: "ახლანდელი პაროლი",
      submit: "ბმულის გაგზავნა",
      sent: (email) =>
        `შეამოწმე ${email}. შესაცვლელად 30 წუთში გახსენი ბმული.`,
    },
    password: {
      title: "პაროლი",
      currentPassword: "ახლანდელი პაროლი",
      newPassword: "ახალი პაროლი",
      newPasswordHint: "12-დან 128 სიმბოლომდე.",
      submit: "პაროლის შეცვლა",
      changed: "პაროლი შეიცვალა. სხვა მოწყობილობებიდან გამოხვედი.",
    },
    deletion: {
      title: "ანგარიშის წაშლა",
      warning: "ანგარიში მაშინვე წაიშლება. ამას ვეღარ დააბრუნებ.",
      consequences: [
        "წაიშლება შენი კადრები, კოლექცია და მათი ბმულები.",
        "ერთგულების ქულები დაიკარგება.",
        "ჯავშნები და გადახდები ჩვენთან დარჩება, სახელისა და ელფოსტის გარეშე.",
      ],
      currentPassword: "ახლანდელი პაროლი",
      understand: "მესმის, რომ ამას ვეღარ დავაბრუნებ.",
      submit: "ანგარიშის წაშლა",
      deleted: "შენი ანგარიში წაიშალა.",
      home: "მთავარ გვერდზე გადასვლა",
      blocked: "ანგარიშის წაშლა ჯერ შეუძლებელია:",
      blockers: {
        LIVE_MISSION: "სეანსი ჯერ მიმდინარეობს. დაელოდე დასრულებას.",
        UPCOMING_BOOKING: "გადახდილი სეანსი ჯერ წინაა. დაელოდე მის დასრულებას.",
        HELD_BOOKING:
          "სეანსი გადახდას ელოდება. გააუქმე ჯავშნებში.",
        OPEN_ENTITLEMENT: "გეკუთვნის თანხა ან უფასო სეანსი. მიიღე ჯავშნებში.",
        OBSERVER_SEAT: "გაქვს ადგილი სეანსზე, რომელიც ჯერ არ დასრულებულა. დაელოდე დასრულებას.",
        SUBSCRIPTION: "შენი გამოწერა ჯერ მოქმედებს. ჯერ ის გააუქმე.",
        GIFT_VOUCHER:
          "შენი ნაყიდი სასაჩუქრე ვაუჩერი გამოუყენებელი ან გადაუხდელია. დაგვიკავშირდი.",
        NETWORK_NODE: "ქსელში შენი ტელესკოპია. გასათიშად დაგვიკავშირდი.",
        OPERATOR: "ოპერატორის ანგარიშს სხვა ოპერატორი შლის.",
      },
      changed: "ანგარიში შეიცვალა. სცადე თავიდან.",
    },
    errors: {
      shortName: "გამოიყენე მინიმუმ ორი სიმბოლო.",
      invalidEmail: "შეიყვანე სწორი ელფოსტა.",
      sameEmail: "ეს უკვე შენი მისამართია.",
      wrongPassword: "პაროლი არასწორია.",
      weakPassword: "პაროლი 12-დან 128 სიმბოლომდე უნდა იყოს.",
      rateLimited: "ბევრი მცდელობაა. მოგვიანებით სცადე.",
      unavailable: "ახლა არ მუშაობს. მოგვიანებით სცადე.",
    },
  },
};
