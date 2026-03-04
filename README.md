# Barbershub

Landing page for [Barbers Hub](https://barbershub.lv) — a co-working barbershop in Riga.

**Dev:** https://dev.barbershub.pages.dev  
**Prod:** https://barbershub.pages.dev

---

## ⚠️ Critical: Source Files vs Compiled Bundles

This project uses **pre-compiled minified bundles**. The browser loads these files — NOT the source modules.

| Source (do NOT edit for fixes) | Compiled bundle (edit this) |
|---|---|
| `js/modules/nav.js` | `js/common.min.js` |
| `js/modules/*.js` | `js/common.min.js`, `js/index.min.js` |
| `js/pages/*.js` | `js/about.min.js`, `js/contacts.min.js` |

### What this means

**If you fix a bug in `js/modules/nav.js` — the fix will NOT appear in the browser.** The browser only loads `js/common.min.js` and the other `.min.js` files listed in `index.html`.

**Always check `index.html` script tags to find which files are actually loaded:**
```html
<script src="js/common.min.js"></script>
<script src="js/index.min.js"></script>
<script src="js/about.min.js"></script>
<script src="js/contacts.min.js"></script>
```

### Workflow for JS fixes

1. Find the relevant logic in the `.min.js` bundle (use `grep`)
2. Apply the fix directly to the minified bundle
3. Optionally mirror the fix in the source module for reference
4. Commit both files

### Finding code in minified bundles

```bash
# Find nav-related code in the bundle
grep -n "header_nav\|closeMenu\|menuTrigger" js/common.min.js

# Find where a specific function lives
grep -o 'someFunction[^}]*}' js/common.min.js
```

---

## Branches

| Branch | URL | Purpose |
|---|---|---|
| `main` | https://barbershub.pages.dev | Production |
| `dev` | https://dev.barbershub.pages.dev | Development / staging |

---

## Known Issues & Fixes

### Mobile burger menu nav link freeze (Chrome)

**Symptom:** After tapping a nav link from the burger menu on mobile Chrome, page freezes — cannot scroll or tap anything.

**Root cause:** The nav menu hides via a 500ms CSS `max-height` transition. During those 500ms, the menu element is still in the paint layer with `overflow-y: scroll`, intercepting all Chrome touch events. Telegram/WebView browsers are more lenient about this; Chrome is strict.

**Fix location:** `js/common.min.js` — the `const f = function()` block (standalone nav init).

**Fix applied:**
- `stopPropagation()` on nav link clicks to prevent burger toggle re-firing
- `pointer-events: none` on the nav immediately on close, restored after 550ms
- `scrollIntoView` delayed 520ms to fire after menu has fully collapsed

See: [Issue #5](https://github.com/grouparkadia-ctrl/Barbershub/issues/5)
