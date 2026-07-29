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

## Rebuild the client

From `chair-os-source`:

1. Install dependencies.
2. Run `npm run build`.
3. Commit the generated `chair-access-bh/app.js`.

The public website has no navigation link to the member portal. Do not add the
portal to a sitemap or public menu.
