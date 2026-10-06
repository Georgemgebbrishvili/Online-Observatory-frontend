import type { Locale } from "@/i18n/config";
import { brand } from "@/brand";

const en = {
  eyebrow: "Account",
  signIn: {
    metadataTitle: `Sign in · ${brand.en.name}`,
    title: "Welcome back.",
    description: "Sign in to manage your missions and personal captures.",
    submit: "Sign in",
    alternate: `New to ${brand.en.name}?`,
    alternateAction: "Create an account",
    forgot: "Forgot your password?",
  },
  register: {
    metadataTitle: `Create account · ${brand.en.name}`,
    title: "Begin your observing journey.",
    description: "Create a verified account before requesting telescope time.",
    submit: "Create account",
    alternate: "Already have an account?",
    alternateAction: "Sign in",
  },
  verifyPending: {
    metadataTitle: `Verify email · ${brand.en.name}`,
    title: "Check your email.",
    description:
      "We sent a one-time verification link. It expires in 30 minutes and can only be used once.",
    action: "Return to sign in",
  },
  verify: {
    metadataTitle: `Confirm email · ${brand.en.name}`,
    title: "Confirm your email address.",
    description: "Confirming signs you in here, and signs you out everywhere else.",
    submit: "Confirm email",
    invalid: "This link is invalid, used or expired.",
  },
  resetRequest: {
    metadataTitle: `Reset password · ${brand.en.name}`,
    title: "Reset your password.",
    description:
      "Enter the email you registered with. We'll send a link to set a new one.",
    submit: "Send link",
    sentTitle: "Check your email.",
    sentDescription:
      "If an account uses that address, a link is on its way. It expires in 30 minutes and works once.",
    back: "Return to sign in",
  },
  resetConfirm: {
    metadataTitle: `Choose a new password · ${brand.en.name}`,
    title: "Choose a new password.",
    description: "You'll be signed in, and signed out everywhere else.",
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
    unavailable: "Authentication is temporarily unavailable. Please try again later.",
  },
  securityNote:
    "Your session is verified on the server. Observatory credentials never reach this browser.",
  logout: "Sign out",
};

export const authCopy = {
  en,
  ka: {
    eyebrow: "ანგარიში",
    signIn: {
      metadataTitle: `შესვლა · ${brand.ka.nominative}`,
      title: "კეთილი იყოს შენი დაბრუნება.",
      description: "შედი ანგარიშში მისიებისა და პირადი კადრების სამართავად.",
      submit: "შესვლა",
      alternate: `ჯერ არ გაქვს ${brand.ka.genitive} ანგარიში?`,
      alternateAction: "ანგარიშის შექმნა",
      forgot: "დაგავიწყდა პაროლი?",
    },
    register: {
      metadataTitle: `ანგარიშის შექმნა · ${brand.ka.nominative}`,
      title: "დაიწყე დაკვირვების გზა.",
      description: "ტელესკოპის დროის მოთხოვნამდე შექმენი და დაადასტურე ანგარიში.",
      submit: "ანგარიშის შექმნა",
      alternate: "უკვე გაქვს ანგარიში?",
      alternateAction: "შესვლა",
    },
    verifyPending: {
      metadataTitle: `ელფოსტის დადასტურება · ${brand.ka.nominative}`,
      title: "შეამოწმე ელფოსტა.",
      description:
        "გამოგიგზავნეთ ერთჯერადი დამადასტურებელი ბმული. ის 30 წუთში გაუქმდება და მხოლოდ ერთხელ იმუშავებს.",
      action: "შესვლაზე დაბრუნება",
    },
    verify: {
      metadataTitle: `ელფოსტის დადასტურება · ${brand.ka.nominative}`,
      title: "დაადასტურე ელფოსტის მისამართი.",
      description:
        "დადასტურების შემდეგ აქ შეხვალ, ყველა სხვა მოწყობილობაზე კი გამოხვალ.",
      submit: "ელფოსტის დადასტურება",
      invalid: "ეს ბმული არასწორია, გამოყენებულია ან ვადა გაუვიდა.",
    },
    resetRequest: {
      metadataTitle: `პაროლის აღდგენა · ${brand.ka.nominative}`,
      title: "აღადგინე პაროლი.",
      description:
        "შეიყვანე რეგისტრაციის ელფოსტა. გამოგიგზავნით ბმულს ახალი პაროლის დასაყენებლად.",
      submit: "ბმულის გაგზავნა",
      sentTitle: "შეამოწმე ელფოსტა.",
      sentDescription:
        "თუ ამ მისამართით ანგარიში არსებობს, ბმული უკვე გზაშია. ის 30 წუთში გაუქმდება და მხოლოდ ერთხელ იმუშავებს.",
      back: "შესვლაზე დაბრუნება",
    },
    resetConfirm: {
      metadataTitle: `ახალი პაროლი · ${brand.ka.nominative}`,
      title: "აირჩიე ახალი პაროლი.",
      description: "შეხვალ ანგარიშში, ყველა სხვა მოწყობილობაზე კი სესია დასრულდება.",
      submit: "პაროლის დაყენება",
      deadLink: "ეს ბმული არასწორია, გამოყენებულია ან ვადა გაუვიდა.",
      newLink: "ახალი ბმულის გაგზავნა",
    },
    fields: {
      name: "სახელი",
      namePlaceholder: "შენი სახელი",
      email: "ელფოსტა",
      emailPlaceholder: "you@example.com",
      password: "პაროლი",
      newPassword: "ახალი პაროლი",
      passwordHint: "გამოიყენე მინიმუმ 12 სიმბოლო.",
    },
    errors: {
      invalidEmail: "შეიყვანე სწორი ელფოსტის მისამართი.",
      shortName: "შეიყვანე მინიმუმ ორი სიმბოლო.",
      weakPassword: "გამოიყენე 12-დან 128-მდე სიმბოლოს პაროლი.",
      invalidCredentials: "ელფოსტა ან პაროლი არასწორია.",
      unverified: "შესვლამდე დაადასტურე ელფოსტა.",
      rateLimited: "ცდების ლიმიტი ამოიწურა. სცადე 15 წუთში.",
      unavailable: "ავტორიზაცია დროებით მიუწვდომელია. მოგვიანებით სცადე.",
    },
    securityNote:
      "შენი სესია სერვერზე მოწმდება. ობსერვატორიის წვდომის მონაცემები ბრაუზერამდე არასოდეს აღწევს.",
    logout: "გასვლა",
  },
} as const satisfies Record<Locale, typeof en>;
