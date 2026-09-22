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
  assert.match(html, /styles\.css\?v=20260922-active-offers/);
  assert.match(html, /app\.js\?v=20260922-active-offers/);
  assert.match(headers, /X-Robots-Tag: noindex, nofollow, noarchive, nosnippet/);
  assert.match(headers, /\/chair-access-bh\/app\.js[\s\S]*Cache-Control: no-cache, must-revalidate/);
  assert.match(headers, /\/chair-access-bh\/styles\.css[\s\S]*Cache-Control: no-cache, must-revalidate/);
  assert.doesNotMatch(publicHome, /chair-access-bh/);
  assert.doesNotMatch(barberPage, /chair-access-bh/);
});

test("shows only the active minute and FLEX offers", async () => {
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
  assert.match(plans, /priceCents:\s*29900/);
  assert.match(plans, /priceCents:\s*39900/);
  assert.match(plans, /priceCents:\s*49900/);
  assert.match(plans, /SLOT_MINUTES = 15/);
  assert.match(plans, /priceCents:\s*125000/);
  assert.match(plans, /hidden:\s*true/);
  assert.match(client, /ACTIVE_OFFER_KEYS\.has\(plan\.key\)/);
  assert.match(client, /€0\.10\/min · min\. 60 min/);
  assert.match(client, /ACTIVE_FLEX_KEYS\.has\(plan\.key\)/);
  assert.match(client, /isAdmin \|\| !plan\?\.hidden/);
});

test("keeps the public barber offer aligned with flexible minute pricing", async () => {
  const page = await source("for-barbers.html");
  const localization = await source("js/for-barbers-v3-localization.js");

  assert.match(page, /https:\/\/reserve\.barbershub\.lv\/\?lang=en/);
  assert.match(page, /calc-plan-selectors/);
  assert.match(page, /data-plan="minute"/);
  assert.match(page, /data-plan="flex10"/);
  assert.match(page, /data-plan="flex15"/);
  assert.match(page, /data-plan="flex20"/);
  assert.match(page, /space-carousel-dot/);
  assert.match(page, /faq-accordion/);
  assert.doesNotMatch(page, /buy\.stripe\.com|forms\.gle|calendar\.app\.google/);
  assert.doesNotMatch(page, /Day Pass|EUR 50|EUR 10\/hour|EUR 35|Priority Calendar/);
  assert.doesNotMatch(await source("js/barbers-v2.min.js"), /Day Pass/);

  assert.match(page, /299 €/);
  assert.match(page, /399 €/);
  assert.match(page, /499 €/);
  assert.match(localization, /0,10 €/);
  assert.match(localization, /20 dien/);
  assert.doesNotMatch(localization, /400 €|525 €|650 €/);
});

test("shows the current FLEX pricing and the extra-client minute option in every language", async () => {
  const page = await source("for-barbers.html");
  const localization = await source("js/for-barbers-v3-localization.js");

  for (const price of ["299 €", "399 €", "499 €"]) {
    assert.match(page, new RegExp(price));
  }
  assert.match(page, /cost: 299/);
  assert.match(page, /cost: 399/);
  assert.match(page, /cost: 499/);
  assert.match(localization, /Vajag pieņemt papildu klientu ārpus FLEX dienām\?/);
  assert.match(localization, /Need to take an extra client outside your FLEX days\?/);
  assert.match(localization, /Нужно принять дополнительного клиента вне дней FLEX\?/);
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

  assert.match(database, /PRIMARY KEY \(location_id, chair_id, date, slot\)/);
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
  assert.match(database, /CREATE TABLE IF NOT EXISTS locations/);
  assert.match(database, /CREATE TABLE IF NOT EXISTS location_expenses/);
  assert.match(api, /action === "owner_recovery"/);
  assert.match(api, /action === "change_own_pin"/);
  assert.match(api, /FLEX_BUFFER_MINUTES = 15/);
  assert.match(client, /Location & resources/);
  assert.match(client, /Location expenses/);
  assert.match(client, /MonthCalendar/);
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
    "archive_member",
    "restore_member",
    "delete_member",
    "update_booking",
    "cancel_membership",
    "mark_due",
    "add_adjustment",
    "cancel_adjustment",
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
  assert.match(api, /cannot be permanently deleted\. Archive the member instead/);
  assert.match(api, /pending referral commission/);
  assert.match(api, /source_transaction_id = \? AND status = 'pending'/);
  assert.match(api, /A referral commission already exists/);

  for (const message of [
    "Edit member",
    "Edit booking",
    "Cancel plan",
    "Paid · Undo",
    "does not cancel the plan charge",
    "without creating a new charge",
    "Accountant XLSX",
    "Archive",
    "Discount or commission",
    "Export booking history",
  ]) {
    assert.match(client, new RegExp(message.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  for (const message of [
    "Edit member",
    "Edit booking",
    "Cancel plan",
    "does not cancel the plan charge",
    "without creating a new charge",
    "Accountant XLSX",
    "Discount or commission",
    "Export booking history",
  ]) {
    assert.match(bundle, new RegExp(message.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(bundle, /Paid \\xB7 Undo/);
});

test("allows administrators to record historical quick bookings without weakening member rules", async () => {
  const api = await source("functions/chair-access-bh/api.ts");
  const client = await source("chair-os-source/BookingOS.tsx");
  const bundle = await source("chair-access-bh/app.js");

  assert.match(api, /historicalAdminEntry = user\.role === "admin" && date < dateInRiga\(\)/);
  assert.match(api, /Minute-based bookings are managed through the public reservation flow/);
  assert.match(api, /SELECT id FROM users WHERE id = \? AND role = 'member' AND active = 1/);
  assert.match(api, /!historicalAdminEntry && zonedDateTimeEpoch/);
  assert.match(client, /user\.active && user\.role === "member" && !user\.archived/);
  assert.match(client, /Record current or historical minute-based access/);
  assert.match(client, /error && <div className="error-banner modal-error">/);
  assert.match(bundle, /current or historical minute-based access/);
});

test("stores complete accounting profiles and adjustable business settings", async () => {
  const database = await source("functions/_shared/os-db.ts");
  const migration = await source("migrations/0002_member_accounting.sql");
  const api = await source("functions/chair-access-bh/api.ts");
  const client = await source("chair-os-source/BookingOS.tsx");

  for (const content of [database, migration]) {
    assert.match(content, /CREATE TABLE IF NOT EXISTS member_profiles/);
    assert.match(content, /CREATE TABLE IF NOT EXISTS financial_adjustments/);
    assert.match(content, /default_referral_rate_bps', '2000'/);
    assert.match(content, /supplier_registration_number', '40203547922'/);
    assert.match(content, /supplier_iban', 'LV76HABA0551057160264'/);
  }
  assert.match(api, /registration_number/);
  assert.match(api, /agreement_number/);
  assert.match(api, /billing_notes/);
  assert.match(api, /invoiceLatePenaltyPercent/);
  assert.match(client, /Registration number or personal code/);
  assert.match(client, /Settings & invoice details/);
  assert.match(client, /Default referral commission/);
});

test("creates native Excel exports without exposing member credentials", async () => {
  const api = await source("functions/chair-access-bh/api.ts");
  const xlsx = await source("functions/_shared/xlsx.mjs");

  assert.match(api, /exportType === "all-history"/);
  assert.match(api, /exportType === "member-accounting"/);
  for (const sheet of ["Summary", "Bookings", "Transactions", "Adjustments", "Members", "Invoice Data"]) {
    assert.match(api, new RegExp(sheet));
  }
  assert.match(xlsx, /application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet/);
  assert.match(xlsx, /xl\/worksheets\/sheet/);
  assert.doesNotMatch(api.slice(api.indexOf("async function exportWorkbook"), api.indexOf("async function appState")), /access_code|pin_hash/);
});
