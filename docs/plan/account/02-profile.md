# Account, slice 2 — the profile page

2026-10-06. Roadmap C4 (DV-079), less account deletion, which waits on platform request
[`account-deletion`](../../platform-requests/account-deletion.md) (#173). Built on
platform ADR-042 (PR #175, issue #172, request
[`account-profile`](../../platform-requests/account-profile.md)) and ADR-040's
`changePassword`.

`/{locale}/app/profile` replaces the "not yet available" page. Three panels, each its own
form, so a refusal in one never clears another.

## Contract trace

| On screen                   | Source                                                                                                 |
| --------------------------- | ------------------------------------------------------------------------------------------------------ |
| Name, email, language shown | `getCurrentUser` `GET /me` → `User.displayName`, `User.email`, `User.locale`, read on the server       |
| Save name and language      | `updateProfile` `PATCH /me` `{ displayName?, locale? }` → 200 `User`                                   |
| Name bounds                 | `UpdateProfileRequest.displayName`, 2–80, trimmed by the platform                                      |
| Email language              | `UpdateProfileRequest.locale`: the language the platform writes to the customer in, not the site's URL |
| Change email                | `changeEmail` `POST /me/email` `{ email, currentPassword }` → 202, whether or not the address is free  |
| The emailed link            | `APP_URL/{locale}/verify-email/{token}`, consumed by `verifyEmail`, which signs the opener in          |
| Change password             | `changePassword` `POST /me/password` `{ currentPassword, password }` → 204                             |
| Password bounds             | `ChangePasswordRequest.password`, 12–128                                                               |
| Wrong current password      | 422 `VALIDATION_FAILED`, `details.fields: ["currentPassword"]`, on both                                |
| Same address                | 422, `details.fields: ["email"]`                                                                       |
| Refusals                    | 401 (session ended), 403 (Origin), 429 `RATE_LIMITED`, 503 (email delivery)                            |

Handlers traced in `darkview-platform` at the PR head: `apps/api/src/features/auth/profile.ts`
and `password.ts`.

## States, en + ka

Informal Georgian, as the rest of the product.

| State             | Where it comes from      | en                                                                                                     | ka                                                                                                    |
| ----------------- | ------------------------ | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| Page              | `GET /me`                | Account · Your profile. · Your name, your email and your password.                                     | ანგარიში · შენი პროფილი. · შენი სახელი, ელფოსტა და პაროლი.                                            |
| Details           | panel 1                  | Name · Language for emails · Save                                                                      | სახელი · წერილების ენა · შენახვა                                                                      |
| Saved             | 200                      | Saved.                                                                                                 | შენახულია.                                                                                            |
| Short name        | client check, 422        | Use at least two characters.                                                                           | გამოიყენე მინიმუმ ორი სიმბოლო.                                                                        |
| Email             | panel 2                  | Your address is {email}. · New email · Current password · Send link                                    | შენი მისამართია {email}. · ახალი ელფოსტა · მიმდინარე პაროლი · ბმულის გაგზავნა                         |
| Email sent        | 202                      | Check {email}. Your address changes when you open the link we sent there. It works for 30 minutes.     | შეამოწმე {email}. მისამართი შეიცვლება, როცა იქ გაგზავნილ ბმულს გახსნი. ის 30 წუთი მოქმედებს.          |
| Same address      | 422 `email`              | That is already your address.                                                                          | ეს უკვე შენი მისამართია.                                                                              |
| Bad email         | client check, 422        | Enter a valid email address.                                                                           | შეიყვანე სწორი ელფოსტის მისამართი.                                                                    |
| Wrong password    | 422 `currentPassword`    | That is not your current password.                                                                     | ეს შენი მიმდინარე პაროლი არ არის.                                                                     |
| Password          | panel 3                  | Current password · New password · Change password                                                      | მიმდინარე პაროლი · ახალი პაროლი · პაროლის შეცვლა                                                      |
| Password changed  | 204                      | Password changed. You're signed out everywhere else.                                                   | პაროლი შეიცვალა. ყველა სხვა მოწყობილობაზე სესია დასრულდა.                                             |
| Weak password     | client check, 422        | Use a password between 12 and 128 characters.                                                          | გამოიყენე 12-დან 128-მდე სიმბოლოს პაროლი.                                                             |
| Rate limited      | 429                      | Too many attempts. Try again later.                                                                    | ცდების ლიმიტი ამოიწურა. მოგვიანებით სცადე.                                                            |
| Unavailable       | 503, no answer           | Account changes are unavailable right now. Try again later.                                            | ანგარიშის ცვლილება ახლა მიუწვდომელია. მოგვიანებით სცადე.                                              |
| Session ended     | 401                      | a full navigation to `/sign-in`                                                                        | სრული გადასვლა `/sign-in`-ზე                                                                          |
| Sending           | a request in flight      | the button's loading state                                                                             | ღილაკის ჩატვირთვის მდგომარეობა                                                                        |
| Confirm (link)    | `/verify-email/{token}`  | Confirm your email address. · Confirming signs you in here, and signs you out everywhere else.         | დაადასტურე ელფოსტის მისამართი. · დადასტურების შემდეგ აქ შეხვალ, ყველა სხვა მოწყობილობაზე კი გამოხვალ. |

The confirm page serves a registration link and a change link alike (ADR-042), so its
copy no longer says it activates the account.

Agent offline, weather hold and simulated do not apply: nothing here reads the
observatory. An unreachable platform on the first read is the `/app` shell's existing
signed-out redirect, as for every `/app` page.

## Evidence

- `e2e/fake-platform.mjs` answers `PATCH /me`, `POST /me/email` and `POST /me/password`,
  and prints the change link as it prints a verification link.
- `e2e/profile.spec.ts`: save a name and language; ask for a new address and follow the
  printed link; a wrong current password names the field; change a password and sign in
  with it. A user of its own, so no other test's sign-in depends on it.
- Shell contract and visual baselines for `/app/profile`, both languages.
