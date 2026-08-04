# BARBERS HUB member portal

The member portal is intentionally not linked from the public website.

- Member page: `/chair-access-bh/`
- Pages Function API: `/chair-access-bh/api`
- Client source: `/chair-os-source/`
- Cloudflare Pages Functions: `/functions/`

## Cloudflare bindings

The Pages project requires:

- D1 database binding named `DB`
- encrypted secret named `PIN_SALT`
- encrypted secret named `SETUP_KEY`

Use separate D1 databases and secrets for Preview and Production. The one-time
setup key creates the first owner account only while the user table is empty.

## Security

- Member and owner PINs must contain 6–8 digits.
- Five unsuccessful attempts from the same address against the same access code
  trigger a 15-minute lock.
- Session cookies are `HttpOnly`, `Secure`, `SameSite=Strict`, and scoped to the
  member-portal path.
- The portal carries `noindex`, `nofollow`, and `noarchive` directives.
- The page is unlisted, but the URL is not an access-control mechanism. Access
  codes and PINs remain mandatory.

## Administrator correction rules

- Editing a booking moves the existing booking and updates its existing unpaid
  booking transaction. It never creates a second charge.
- Cancelling an included plan day returns one day to the same active plan. It
  does not cancel the membership price.
- Cancelling a plan releases its current and future plan bookings. The unpaid
  plan transaction is cancelled only when no past confirmed plan days exist;
  paid charges and plans with past use remain in the financial record.
- A member cannot receive a second active plan with an overlapping term. Use
  remaining days or cancel the existing plan first.
- Deactivating a member removes login access while retaining operational and
  financial history. Permanent deletion is allowed only for an empty member
  record with no plan, booking, payment or add-on history.
- Member names and access codes can be corrected. PIN reset is optional and
  signs out the member's existing sessions.

## Rebuild the client

From `chair-os-source`:

1. Install dependencies.
2. Run `npm run build`.
3. Commit the generated `chair-access-bh/app.js`.

The public website has no navigation link to the member portal. Do not add the
portal to a sitemap or public menu.
