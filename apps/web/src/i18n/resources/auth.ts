import type { Locale } from "@/i18n/config";
import { brand } from "@/brand";

const en = {
  signIn: {
    metadataTitle: `Sign in · ${brand.en.name}`,
    title: "Welcome back.",
    submit: "Sign in",
    alternate: `New to ${brand.en.name}?`,
    alternateAction: "Create an account",
    forgot: "Forgot your password?",
    google: "Continue with Google",
    or: "or",
  },
  register: {
    metadataTitle: `Create account · ${brand.en.name}`,
    title: "Create your account.",
    submit: "Create account",
    alternate: "Already have an account?",
    alternateAction: "Sign in",
  },
  verifyPending: {
    metadataTitle: `Verify email · ${brand.en.name}`,
    title: "Check your email.",
    description:
      "We sent you a link. It works once, for 30 minutes.",
    action: "Return to sign in",
  },
  verify: {
    metadataTitle: `Confirm email · ${brand.en.name}`,
    title: "Confirm your email address.",
    description: "This signs you out on other devices.",
    submit: "Confirm email",
    invalid: "This link is invalid, used or expired.",
  },
  resetRequest: {
    metadataTitle: `Reset password · ${brand.en.name}`,
    title: "Reset your password.",
    submit: "Send link",
    sentTitle: "Check your email.",
    sentDescription:
      "If that address has an account, we sent a link. It works once, for 30 minutes.",
    back: "Return to sign in",
  },
  resetConfirm: {
    metadataTitle: `Choose a new password · ${brand.en.name}`,
    title: "Choose a new password.",
    submit: "Set password",
    deadLink: "This link is invalid, used or expired.",
    newLink: "Send a new link",
  },
  fields: {
    name: "Name",
    namePlaceholder: "Your name",
    email: "Email",
    emailPlaceholder: "you@example.com",
    password: "Password",
    newPassword: "New password",
    passwordHint: "Use at least 12 characters.",
  },
  errors: {
    invalidEmail: "Enter a valid email address.",
    shortName: "Enter at least two characters.",
    weakPassword: "Use a password between 12 and 128 characters.",
    invalidCredentials: "Email or password is incorrect.",
    unverified: "Verify your email before signing in.",
    rateLimited: "Too many attempts. Try again in 15 minutes.",
    unavailable: "Sign-in is down. Try again later.",
    google: "Google sign-in failed. Try again or use email.",
  },
  logout: "Sign out",
};

export const authCopy = {
  en,
  ka: {
    signIn: {
      metadataTitle: `შესვლა · ${brand.ka.nominative}`,
      title: "გამარჯობა!",
      submit: "შესვლა",
      alternate: "ანგარიში არ გაქვს?",
      alternateAction: "ანგარიშის შექმნა",
      forgot: "დაგავიწყდა პაროლი?",
      google: "Google-ით გაგრძელება",
      or: "ან",
    },
    register: {
      metadataTitle: `ანგარიშის შექმნა · ${brand.ka.nominative}`,
      title: "შექმენი ანგარიში.",
      submit: "ანგარიშის შექმნა",
      alternate: "უკვე გაქვს ანგარიში?",
      alternateAction: "შესვლა",
    },
    verifyPending: {
      metadataTitle: `ელფოსტის დადასტურება · ${brand.ka.nominative}`,
      title: "შეამოწმე ელფოსტა.",
      description:
        "ბმული გამოგიგზავნეთ. მუშაობს ერთხელ, 30 წუთის განმავლობაში.",
      action: "შესვლაზე დაბრუნება",
    },
    verify: {
      metadataTitle: `ელფოსტის დადასტურება · ${brand.ka.nominative}`,
      title: "დაადასტურე ელფოსტა.",
      description:
        "სხვა მოწყობილობებიდან გამოხვალ.",
      submit: "ელფოსტის დადასტურება",
      invalid: "ბმული აღარ მუშაობს.",
    },
    resetRequest: {
      metadataTitle: `პაროლის აღდგენა · ${brand.ka.nominative}`,
      title: "აღადგინე პაროლი.",
      submit: "ბმულის გაგზავნა",
      sentTitle: "შეამოწმე ელფოსტა.",
      sentDescription:
        "თუ ამ მისამართზე ანგარიშია, ბმული გამოგიგზავნეთ. მუშაობს ერთხელ, 30 წუთის განმავლობაში.",
      back: "შესვლაზე დაბრუნება",
    },
    resetConfirm: {
      metadataTitle: `ახალი პაროლი · ${brand.ka.nominative}`,
      title: "აირჩიე ახალი პაროლი.",
      submit: "პაროლის შენახვა",
      deadLink: "ბმული აღარ მუშაობს.",
      newLink: "ახალი ბმულის გაგზავნა",
    },
    fields: {
      name: "სახელი",
      namePlaceholder: "შენი სახელი",
      email: "ელფოსტა",
      emailPlaceholder: "you@example.com",
      password: "პაროლი",
      newPassword: "ახალი პაროლი",
      passwordHint: "მინიმუმ 12 სიმბოლო.",
    },
    errors: {
      invalidEmail: "შეიყვანე სწორი ელფოსტა.",
      shortName: "შეიყვანე მინიმუმ ორი სიმბოლო.",
      weakPassword: "პაროლი 12-დან 128 სიმბოლომდე უნდა იყოს.",
      invalidCredentials: "ელფოსტა ან პაროლი არასწორია.",
      unverified: "შესვლამდე დაადასტურე ელფოსტა.",
      rateLimited: "ბევრი მცდელობაა. სცადე 15 წუთში.",
      unavailable: "შესვლა დროებით არ მუშაობს. მოგვიანებით სცადე.",
      google: "Google-ით შესვლა ვერ მოხერხდა. სცადე თავიდან ან შედი ელფოსტით.",
    },
    logout: "გასვლა",
  },
} as const satisfies Record<Locale, typeof en>;
