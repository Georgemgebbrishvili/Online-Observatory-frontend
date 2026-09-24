import type { Locale } from "@/i18n/config";

const en = {
  eyebrow: "SECURE ACCESS",
  signIn: {
    metadataTitle: "Sign in · Stellar",
    title: "Return to your observatory.",
    description: "Sign in to manage your missions and personal captures.",
    submit: "Sign in",
    alternate: "New to Stellar?",
    alternateAction: "Create an account",
  },
  register: {
    metadataTitle: "Create account · Stellar",
    title: "Begin your observing journey.",
    description: "Create a verified account before requesting telescope time.",
    submit: "Create account",
    alternate: "Already have an account?",
    alternateAction: "Sign in",
  },
  verifyPending: {
    metadataTitle: "Verify email · Stellar",
    title: "Check your email.",
    description:
      "We sent a one-time verification link. It expires in 30 minutes and can only be used once.",
    action: "Return to sign in",
  },
  verify: {
    metadataTitle: "Confirm email · Stellar",
    title: "Confirm your email address.",
    description:
      "This final check activates your account and creates a new secure session.",
    submit: "Confirm email",
    invalid: "This verification link is invalid or has expired.",
  },
  fields: {
    name: "Name",
    namePlaceholder: "Your name",
    email: "Email",
    emailPlaceholder: "you@example.com",
    password: "Password",
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
    eyebrow: "დაცული წვდომა",
    signIn: {
      metadataTitle: "შესვლა · სტელარი",
      title: "დაუბრუნდი შენს ობსერვატორიას.",
      description: "შედი ანგარიშში მისიებისა და პირადი გადაღებების სამართავად.",
      submit: "შესვლა",
      alternate: "ჯერ არ გაქვს სტელარის ანგარიში?",
      alternateAction: "ანგარიშის შექმნა",
    },
    register: {
      metadataTitle: "ანგარიშის შექმნა · სტელარი",
      title: "დაიწყე დაკვირვების გზა.",
      description: "ტელესკოპის დროის მოთხოვნამდე შექმენი და დაადასტურე ანგარიში.",
      submit: "ანგარიშის შექმნა",
      alternate: "უკვე გაქვს ანგარიში?",
      alternateAction: "შესვლა",
    },
    verifyPending: {
      metadataTitle: "ელფოსტის დადასტურება · სტელარი",
      title: "შეამოწმე ელფოსტა.",
      description:
        "გამოგიგზავნეთ ერთჯერადი დამადასტურებელი ბმული. ის 30 წუთში გაუქმდება და მხოლოდ ერთხელ იმუშავებს.",
      action: "შესვლაზე დაბრუნება",
    },
    verify: {
      metadataTitle: "ელფოსტის დადასტურება · სტელარი",
      title: "დაადასტურე ელფოსტის მისამართი.",
      description:
        "ეს ბოლო შემოწმება გაააქტიურებს ანგარიშს და შექმნის ახალ დაცულ სესიას.",
      submit: "ელფოსტის დადასტურება",
      invalid: "ეს დამადასტურებელი ბმული არასწორია ან ვადა გაუვიდა.",
    },
    fields: {
      name: "სახელი",
      namePlaceholder: "შენი სახელი",
      email: "ელფოსტა",
      emailPlaceholder: "you@example.com",
      password: "პაროლი",
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
      "შენი სესია სერვერზე მოწმდება. ობსერვატორიის მონაცემები ბრაუზერამდე არასოდეს აღწევს.",
    logout: "გასვლა",
  },
} as const satisfies Record<Locale, typeof en>;
