import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function source(path) {
  return readFile(new URL(path, root), "utf8");
}

test("keeps the member portal unlisted and excluded from search indexing", async () => {
  const html = await source("chair-access-bh/index.html");
  const headers = await source("_headers");
  const publicHome = await source("index.html");
  const barberPage = await source("for-barbers.html");

  assert.match(html, /noindex, nofollow, noarchive, nosnippet/);
  assert.match(html, /styles\.css\?v=20260804-corrections/);
  assert.match(html, /app\.js\?v=20260804-corrections/);
  assert.match(headers, /X-Robots-Tag: noindex, nofollow, noarchive, nosnippet/);
  assert.match(headers, /\/chair-access-bh\/app\.js[\s\S]*Cache-Control: no-cache, must-revalidate/);
  assert.match(headers, /\/chair-access-bh\/styles\.css[\s\S]*Cache-Control: no-cache, must-revalidate/);
  assert.doesNotMatch(publicHome, /chair-access-bh/);
  assert.doesNotMatch(barberPage, /chair-access-bh/);
});

test("uses the complete approved pricing model", async () => {
  const plans = await source("functions/_shared/os-plans.ts");
  const client = await source("chair-os-source/BookingOS.tsx");

  for (const name of [
    "Hourly access",
    "Morning shift",
    "Evening shift",
    "Day Pass",
    "Early access extension",
    "Late access extension",
    "Flex 10",
    "Flex 15",
    "Flex 20",
    "Dedicated 24/7 Pro",
  ]) {
    assert.match(plans, new RegExp(name.replace("/", "\\/")));
  }
  assert.match(plans, /priceCents:\s*3500/);
  assert.match(plans, /priceCents:\s*65000/);
  assert.match(plans, /priceCents:\s*125000/);
  assert.match(plans, /hidden:\s*true/);
  assert.match(client, /isAdmin \? plans : plans\.filter\(\(plan\) => !plan\.hidden\)/);
  assert.match(client, /isAdmin \|\| !plan\?\.hidden/);
});

test("keeps the public ladder clear and the premium offer private", async () => {
  const page = await source("for-barbers.html");
  const english = await source("lang/en.json");
  const latvian = await source("lang/lv.json");
  const russian = await source("lang/ru.json");

  for (const content of [page, english, latvian, russian]) {
    assert.match(content, /EUR 650/);
    assert.match(content, /09:00-21:00|9\.00-21\.00/);
    assert.doesNotMatch(content, /1,250|Dedicated 24\/7 Pro|Personīgā vieta 24\/7|Персональное место 24\/7/);
  }
  assert.match(page, /v2_member_priority_title/);
  assert.match(page, /v2_member_extensions_title/);
  assert.match(page, /v2_faq_q16/);
});

test("provides every barber-page message in English, Latvian and Russian", async () => {
  const page = await source("for-barbers.html");
  const keys = new Set(
    [...page.matchAll(/data-i18n(?:-alt)?="([^"]+)"/g)].map((match) => match[1]),
  );
  for (const language of ["en", "lv", "ru"]) {
    const messages = JSON.parse(await source(`lang/${language}.json`));
    const missing = [...keys].filter((key) => !(key in messages));
    assert.deepEqual(missing, [], `${language} is missing ${missing.join(", ")}`);
  }
});

test("protects bookings, PIN access, and login attempts", async () => {
  const database = await source("functions/_shared/os-db.ts");
  const api = await source("functions/chair-access-bh/api.ts");
  const client = await source("chair-os-source/BookingOS.tsx");

  assert.match(database, /PRIMARY KEY \(chair_id, date, slot\)/);
  assert.match(database, /capacity_target', '128'/);
  assert.match(database, /monthly_cost_cents', '200000'/);
  assert.match(api, /\\d\{6,8\}/);
  assert.match(client, /\\d\{6,8\}/);
  assert.match(api, /LOGIN_MAX_FAILURES = 5/);
  assert.match(api, /LOGIN_LOCK_MS = 15 \* 60 \* 1000/);
  assert.match(api, /HttpOnly; Secure; SameSite=Strict/);
  assert.match(api, /PRIORITY_CALENDAR_LIMIT = 3/);
  assert.match(api, /STANDARD_BOOKING_WINDOW_DAYS = 21/);
  assert.match(api, /PRIORITY_BOOKING_WINDOW_DAYS = 30/);
  assert.match(api, /EXTENSION_NOTICE_MS = 24 \* 60 \* 60 \* 1000/);
  assert.match(api, /Book a regular working period on that date before adding an extension/);
  assert.match(database, /CREATE TABLE IF NOT EXISTS member_addons/);
});

test("build output points only to the scoped member API", async () => {
  const bundle = await source("chair-access-bh/app.js");

  assert.match(bundle, /\/chair-access-bh\/api/);
  assert.match(bundle, /Member service is temporarily unavailable/);
  assert.doesNotMatch(bundle, /\/api\/os/);
});

test("supports safe member, booking, plan, and payment corrections", async () => {
  const api = await source("functions/chair-access-bh/api.ts");
  const client = await source("chair-os-source/BookingOS.tsx");
  const bundle = await source("chair-access-bh/app.js");

  for (const action of [
    "update_member",
    "deactivate_member",
    "reactivate_member",
    "delete_member",
    "update_booking",
    "cancel_membership",
    "mark_due",
  ]) {
    assert.match(api, new RegExp(`action === ["']${action}["']`));
  }

  assert.match(api, /already has an active/);
  assert.match(api, /occupiedSlotsExcluding/);
  assert.match(api, /DELETE FROM booking_slots WHERE booking_id = \?/);
  assert.match(api, /UPDATE transactions SET description = \?, amount_cents = \?, due_date = \?/);
  assert.match(api, /UPDATE transactions SET status = 'cancelled'.*status = 'due'/s);
  assert.match(api, /This plan already has a booking on that date/);
  assert.match(api, /accessCode\.length < 4 && accessCode !== member\.access_code/);
  assert.match(api, /cannot be permanently deleted\. Deactivate access instead/);

  for (const message of [
    "Edit member",
    "Edit booking",
    "Cancel plan",
    "Paid · Undo",
    "does not cancel the plan charge",
    "without creating a new charge",
  ]) {
    assert.match(client, new RegExp(message.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  for (const message of [
    "Edit member",
    "Edit booking",
    "Cancel plan",
    "does not cancel the plan charge",
    "without creating a new charge",
  ]) {
    assert.match(bundle, new RegExp(message.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(bundle, /Paid \\xB7 Undo/);
});
