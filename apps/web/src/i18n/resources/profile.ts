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
