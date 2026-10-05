# Account, slice 1 — reset a forgotten password

2026-10-05. Roadmap C1/C4: a signed-out customer who forgot their password gets back in.
Built on platform [ADR-040](../../decisions/ADR-040-reset-a-forgotten-password-and-change-a-known-one.md)
(platform PR #174, issue #171; request
[`account-password`](../../platform-requests/account-password.md)). Changing a known
password while signed in (`POST /me/password`) waits for the profile page, slice 2.

## Contract trace

| On screen               | Source                                                                                                      |
| ----------------------- | ----------------------------------------------------------------------------------------------------------- |
| "Forgot your password?" | a link on `/{locale}/sign-in` to `/{locale}/reset-password`                                                 |
| Ask for a link          | `requestPasswordReset` `POST /auth/password-reset` `{ email, locale }` → 202, whatever the address          |
| The emailed link        | `APP_URL/{locale}/reset-password/{token}`, built by the platform                                            |
| Set the new password    | `confirmPasswordReset` `POST /auth/password-reset/confirm` `{ token, password }` → 200 `User`, sets cookies |
| A dead link             | 404 `NOT_FOUND`: unknown, used or expired (thirty minutes)                                                  |
| Password bounds         | `PasswordResetConfirmRequest.password`, 12–128, as `RegisterRequest`                                        |
| Refusals                | 422 `VALIDATION_FAILED`, 429 `RATE_LIMITED` (asking only), 503 delivery                                     |

Handler traced in `darkview-platform` at the PR head:
`apps/api/src/features/auth/password.ts`. Confirming verifies an address that was never
verified, so the page always lands in `/app`.

`/reset-password` is signed-out only, like sign-in: a signed-in visitor is sent to
`/app`. `/reset-password/{token}` is not: whoever opens a valid link is signed in as its
owner, and every other session ends.

## States, en + ka

The Georgian follows the auth pages' informal address.

| State         | Where it comes from       | en                                                                                                                  | ka                                                                                                                           |
| ------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Link          | sign-in                   | Forgot your password?                                                                                               | დაგავიწყდა პაროლი?                                                                                                           |
| Ask           | `/reset-password`         | Reset your password. · Enter the email you registered with. We'll send a link to set a new one. · Send link         | აღადგინე პაროლი. · შეიყვანე რეგისტრაციის ელფოსტა. გამოგიგზავნით ბმულს ახალი პაროლის დასაყენებლად. · ბმულის გაგზავნა          |
| Sending       | the request in flight     | the button's loading state                                                                                          | ღილაკის ჩატვირთვის მდგომარეობა                                                                                               |
| Sent          | 202                       | Check your email. · If an account uses that address, a link is on its way. It expires in 30 minutes and works once. | შეამოწმე ელფოსტა. · თუ ამ მისამართით ანგარიში არსებობს, ბმული უკვე გზაშია. ის 30 წუთში გაუქმდება და მხოლოდ ერთხელ იმუშავებს. |
| Bad email     | 422                       | Enter a valid email address.                                                                                        | შეიყვანე სწორი ელფოსტის მისამართი.                                                                                           |
| Rate limited  | 429                       | Too many attempts. Try again in 15 minutes.                                                                         | ცდების ლიმიტი ამოიწურა. სცადე 15 წუთში.                                                                                      |
| Unavailable   | 503, no answer            | Authentication is temporarily unavailable. Please try again later.                                                  | ავტორიზაცია დროებით მიუწვდომელია. მოგვიანებით სცადე.                                                                         |
| Set           | `/reset-password/{token}` | Choose a new password. · You'll be signed in, and signed out everywhere else. · Set password                        | აირჩიე ახალი პაროლი. · შეხვალ ანგარიშში, ყველა სხვა მოწყობილობაზე კი სესია დასრულდება. · პაროლის დაყენება                    |
| Weak password | client check, 422         | Use a password between 12 and 128 characters.                                                                       | გამოიყენე 12-დან 128-მდე სიმბოლოს პაროლი.                                                                                    |
| Dead link     | 404                       | This link is invalid, used or expired. · Send a new link                                                            | ეს ბმული არასწორია, გამოყენებულია ან ვადა გაუვიდა. · ახალი ბმულის გაგზავნა                                                   |
| Success       | 200                       | a full navigation to `/app`                                                                                         | სრული გადასვლა `/app`-ზე                                                                                                     |

Agent offline, weather hold and simulated do not apply: nothing here reads the
observatory.

## Evidence

- `e2e/fake-platform.mjs` answers both operations, printing the link as it prints a
  verification link.
- `e2e/auth.spec.ts`: ask, follow the printed link, set a password, sign in with it; a
  used link is refused with the way back; an unknown address gets the same "sent".
- Shell contract and visual baselines for `/reset-password` (signed out) and a
  `/reset-password/{token}` page, both languages.
