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
  assert.match(headers, /X-Robots-Tag: noindex, nofollow, noarchive, nosnippet/);
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
    "Flex 10",
    "Flex 15",
    "Full-Time Shared",
    "Dedicated 24/7 Pro",
  ]) {
    assert.match(plans, new RegExp(name.replace("/", "\\/")));
  }
  assert.match(plans, /priceCents:\s*3500/);
  assert.match(plans, /priceCents:\s*77000/);
  assert.match(plans, /priceCents:\s*125000/);
  assert.match(plans, /hidden:\s*true/);
  assert.match(client, /isAdmin \? plans : plans\.filter\(\(plan\) => !plan\.hidden\)/);
  assert.match(client, /isAdmin \|\| !plan\?\.hidden/);
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
});

test("build output points only to the scoped member API", async () => {
  const bundle = await source("chair-access-bh/app.js");

  assert.match(bundle, /\/chair-access-bh\/api/);
  assert.match(bundle, /Member service is temporarily unavailable/);
  assert.doesNotMatch(bundle, /\/api\/os/);
});
