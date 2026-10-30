# gift-ease — giftee app + shared backend

See [../CLAUDE.md](../CLAUDE.md) first for how this repo relates to `gift-easy-sender`.

Next.js 13 (pages router) app branded **GiftEasy**. This is the giftee-facing UI **and** the backend for the whole product — `gift-easy-sender` has no database or real API of its own and calls into this repo's `pages/api/*` for everything.

## Stack

- Next.js 13 / React 18, `pages/` router (not app router)
- MongoDB via Mongoose (`utils/dbConnect.js`, connection cached on a module-level object)
- Auth0 (`@auth0/nextjs-auth0`) for giftee login — `pages/api/auth/[...auth0].js`, gated globally by `AuthWrapper` in `pages/_app.js` (redirects to `/login` if no session, except on the login/auth routes themselves)
- Stripe (Connect + PaymentIntents) for money movement
- AWS S3 (`@aws-sdk/client-s3`) for image uploads
- `cheerio` + `axios` for product-URL scraping (auto-fill a wish from a store link)
- styled-components for newer pages (`account.js`, `[id]/index.js`, `new.js`), plain CSS files for older pages (`index.js`, `Navbar.js`) — the codebase is mid-migration between the two styling approaches, expect both.

## Directory map

- `models/` — Mongoose schemas: `Account`, `Event`, `Note` (a wish), `Payment`, `Card`. See top-level CLAUDE.md for the shared data model table.
- `pages/api/` — 32 routes, the entire backend. Notable groups:
  - **Account/auth**: `auth/[...auth0].js`, `getAccountForThisUser/[user].js` (get-or-create — the entry point every session hits after login)
  - **Events**: `postNewEventForUser/[user].js`, `getEventsFor/[user].js`, `getEventBy/[uri].js`, `getEventUris.js`, `setCurrentToTrueForEvent/[id].js`, `deleteEvent/[id].js`
  - **Wishes (Notes)**: `notes/index.js`, `notes/[id].js`, `getWishesForThisEvent/[id].js`, `getNotesBy/[eventId].js`, `addUrlToEvent.js`
  - **Stripe Connect (giftee payouts)**: `createConnectAccount.js` (Express account), `stripeCustomOnboarding.js` (Custom account + `countryBankFormats.js` for country-specific bank fields), `checkOnboardingStatus.js`, `createPayoutLink.js`, `deleteStripeAccount.js`, `setAccountId.js`, `setPaymentSetupComplete.js`
  - **Payments (sender contributions)**: `createPaymentIntent.js`, `webhook.js`, `getStripePaymentsForAccount.js` / `ForEvent.js` / `ForGift.js`, `saveCardData.js`, `getCardData.js`
  - **Misc**: `convertToUsd.js` (display-only currency conversion), `fetchProductDetails.js` (scraping), `uploadToAWS.js`, `setAccountCurrency.js`
- `pages/` (giftee UI) — `index.js` (dashboard/wishlist), `[id]/index.js` (single wish detail + contribution chart), `[id]/edit.js` (looks stale/unused — hits a hardcoded `localhost:3000` URL, likely dead code from before the API routes were finalized), `new.js` (create a wish, with URL-scrape autofill and drag-drop image upload), `account.js` (Stripe onboarding + balance dashboard), `login.js`, `onboarding/success.js` + `onboarding/refresh.js` (Stripe Connect return URLs).
- `requests/` — client-side fetch wrappers called from pages (`getOrCreateNewAccount`, `postNewEvent`, `deleteThisEvent`, `setThisEventToCurrent`, etc.). One-to-one with specific API routes; not shared with gift-easy-sender despite similar filenames.
- `utils/dbConnect.js` — cached Mongoose connection. `utils/cors.js` — explicit CORS allowlist for cross-origin calls from gift-easy-sender.
- `countryBankFormats.js` — large per-country config (bank field names/formats, `createExternalAccount()` builders) used only by the Custom Connect onboarding flow.

## Things that will bite you

- **`pages/[id]/edit.js` calls `http://localhost:3000` directly** — this is leftover/dead code, not a real edit flow. The actual edit UI is inline in `[id]/index.js` (`isEditing` state + `PUT /api/notes/[id]`).
- **Two parallel Stripe onboarding flows exist**: `createConnectAccount.js` (Express, Stripe-hosted forms) vs `stripeCustomOnboarding.js` (Custom, this app's own form + `countryBankFormats.js`). `account.js` currently drives the Custom flow via `stripeCustomOnboarding`. Don't assume Express is wired into any current UI — verify before changing account creation logic.
- **`webhook.js` always returns 200**, even on internal processing errors (only signature-verification failures return 400). This is intentional (avoids Stripe retry storms) but means processing failures are silent unless you're watching logs — check server logs, not webhook delivery status, when a payment doesn't show up.
- **`user` string encoding**: several routes split a combined string on `||` (e.g. `getAccountForThisUser/[user].js` does `user.split('||')` to get `[auth0Sub, email]`). This is a homemade composite key, not a real serialization format — if either half of the Auth0 sub or email ever contains `||`, this breaks.
- **CORS allowlist in `utils/cors.js` is hardcoded** to three origins including `the-registry-web.site` — if you rename the sender deployment or add a preview URL, cross-origin calls from gift-easy-sender will silently fail (browser CORS error, not a clear API error) until this list is updated.
- **The product-URL scraper (`fetchProductDetails.js`) is fragile by nature** — it's CSS-selector scraping of third-party sites (Amazon, Target, Walmart, + a generic fallback strategy). Expect it to break silently when a retailer changes their markup; there's no test coverage or alerting for selector drift.
