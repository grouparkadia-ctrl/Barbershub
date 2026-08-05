export type RuntimeEnv = {
  DB: D1Database;
  PIN_SALT?: string;
  SETUP_KEY?: string;
};

let boundEnv: RuntimeEnv | null = null;

export function bindRuntimeEnv(env: RuntimeEnv): void {
  if (boundEnv?.DB !== env.DB) schemaReady = null;
  boundEnv = env;
}

export function runtimeEnv(): RuntimeEnv {
  if (!boundEnv?.DB) throw new Error("Member service is not configured yet.");
  return boundEnv;
}

let schemaReady: Promise<void> | null = null;

export function ensureSchema(): Promise<void> {
  if (schemaReady) return schemaReady;
  const db = runtimeEnv().DB;
  schemaReady = (async () => {
    await db.batch([
      db.prepare(`CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        access_code TEXT NOT NULL UNIQUE,
        pin_hash TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('admin','member')),
        active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL
      )`),
      db.prepare(`CREATE TABLE IF NOT EXISTS sessions (
        token_hash TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        created_at TEXT NOT NULL
      )`),
      db.prepare(`CREATE TABLE IF NOT EXISTS memberships (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        plan_key TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        credits_total INTEGER NOT NULL,
        credits_used INTEGER NOT NULL DEFAULT 0,
        price_cents INTEGER NOT NULL,
        preferred_chair INTEGER,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL
      )`),
      db.prepare(`CREATE TABLE IF NOT EXISTS bookings (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        membership_id TEXT,
        chair_id INTEGER NOT NULL CHECK(chair_id BETWEEN 1 AND 5),
        date TEXT NOT NULL,
        start_min INTEGER NOT NULL,
        end_min INTEGER NOT NULL,
        plan_key TEXT NOT NULL,
        amount_cents INTEGER NOT NULL DEFAULT 0,
        capacity REAL NOT NULL,
        status TEXT NOT NULL,
        notes TEXT NOT NULL DEFAULT '',
        created_by TEXT NOT NULL,
        created_at TEXT NOT NULL
      )`),
      db.prepare(`CREATE TABLE IF NOT EXISTS booking_slots (
        booking_id TEXT NOT NULL,
        chair_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        slot INTEGER NOT NULL,
        PRIMARY KEY (chair_id, date, slot)
      )`),
      db.prepare(`CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        kind TEXT NOT NULL,
        reference_id TEXT NOT NULL,
        description TEXT NOT NULL,
        amount_cents INTEGER NOT NULL,
        status TEXT NOT NULL,
        due_date TEXT NOT NULL,
        paid_at TEXT,
        created_at TEXT NOT NULL
      )`),
      db.prepare(`CREATE TABLE IF NOT EXISTS member_addons (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        addon_key TEXT NOT NULL CHECK(addon_key IN ('priority-calendar')),
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        price_cents INTEGER NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL
      )`),
      db.prepare(`CREATE TABLE IF NOT EXISTS member_profiles (
        user_id TEXT PRIMARY KEY,
        archived INTEGER NOT NULL DEFAULT 0,
        billing_type TEXT NOT NULL DEFAULT 'self_employed'
          CHECK(billing_type IN ('company','self_employed','individual','other')),
        legal_name TEXT NOT NULL DEFAULT '',
        registration_number TEXT NOT NULL DEFAULT '',
        legal_address TEXT NOT NULL DEFAULT '',
        email TEXT NOT NULL DEFAULT '',
        phone TEXT NOT NULL DEFAULT '',
        agreement_number TEXT NOT NULL DEFAULT '',
        service_description TEXT NOT NULL DEFAULT '',
        billing_notes TEXT NOT NULL DEFAULT '',
        updated_at TEXT NOT NULL
      )`),
      db.prepare(`CREATE TABLE IF NOT EXISTS financial_adjustments (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        transaction_id TEXT NOT NULL,
        source_user_id TEXT,
        source_transaction_id TEXT,
        adjustment_type TEXT NOT NULL
          CHECK(adjustment_type IN ('discount','referral_commission','manual_credit','manual_charge')),
        calculation_type TEXT NOT NULL
          CHECK(calculation_type IN ('fixed','percentage')),
        rate_bps INTEGER,
        basis_cents INTEGER NOT NULL,
        amount_cents INTEGER NOT NULL,
        description TEXT NOT NULL,
        effective_date TEXT NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('pending','active','cancelled')),
        created_by TEXT NOT NULL,
        created_at TEXT NOT NULL
      )`),
      db.prepare(`CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )`),
      db.prepare(`CREATE TABLE IF NOT EXISTS audit_log (
        id TEXT PRIMARY KEY,
        actor_id TEXT NOT NULL,
        action TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        detail TEXT NOT NULL,
        created_at TEXT NOT NULL
      )`),
      db.prepare(`CREATE TABLE IF NOT EXISTS login_attempts (
        attempt_key TEXT PRIMARY KEY,
        failed_count INTEGER NOT NULL,
        window_started_at TEXT NOT NULL,
        locked_until TEXT,
        updated_at TEXT NOT NULL
      )`),
      db.prepare("CREATE INDEX IF NOT EXISTS bookings_calendar_idx ON bookings(date, chair_id)"),
      db.prepare("CREATE INDEX IF NOT EXISTS bookings_user_idx ON bookings(user_id)"),
      db.prepare("CREATE INDEX IF NOT EXISTS transactions_user_idx ON transactions(user_id)"),
      db.prepare("CREATE INDEX IF NOT EXISTS memberships_user_idx ON memberships(user_id)"),
      db.prepare("CREATE INDEX IF NOT EXISTS member_addons_user_idx ON member_addons(user_id, start_date, end_date)"),
      db.prepare("CREATE INDEX IF NOT EXISTS member_profiles_archived_idx ON member_profiles(archived, user_id)"),
      db.prepare("CREATE INDEX IF NOT EXISTS financial_adjustments_user_idx ON financial_adjustments(user_id, effective_date)"),
      db.prepare("CREATE INDEX IF NOT EXISTS financial_adjustments_transaction_idx ON financial_adjustments(transaction_id, status)"),
      db.prepare("CREATE INDEX IF NOT EXISTS financial_adjustments_source_idx ON financial_adjustments(source_transaction_id, status)"),
      db.prepare("INSERT OR IGNORE INTO settings(key, value) VALUES('capacity_target', '128')"),
      db.prepare("INSERT OR IGNORE INTO settings(key, value) VALUES('monthly_cost_cents', '200000')"),
      db.prepare("INSERT OR IGNORE INTO settings(key, value) VALUES('invoice_due_days', '3')"),
      db.prepare("INSERT OR IGNORE INTO settings(key, value) VALUES('default_referral_rate_bps', '2000')"),
      db.prepare("INSERT OR IGNORE INTO settings(key, value) VALUES('supplier_name', 'Bronsons SIA')"),
      db.prepare("INSERT OR IGNORE INTO settings(key, value) VALUES('supplier_registration_number', '40203547922')"),
      db.prepare("INSERT OR IGNORE INTO settings(key, value) VALUES('supplier_legal_address', 'Tērbatas iela 8b-54, Rīga, LV-1050')"),
      db.prepare("INSERT OR IGNORE INTO settings(key, value) VALUES('supplier_service_address', 'Elizabetes iela 75, Rīga, LV-1050')"),
      db.prepare("INSERT OR IGNORE INTO settings(key, value) VALUES('supplier_bank_name', 'Swedbank AS')"),
      db.prepare("INSERT OR IGNORE INTO settings(key, value) VALUES('supplier_swift', 'HABALV22')"),
      db.prepare("INSERT OR IGNORE INTO settings(key, value) VALUES('supplier_iban', 'LV76HABA0551057160264')"),
      db.prepare("INSERT OR IGNORE INTO settings(key, value) VALUES('invoice_prefix', 'NOM')"),
      db.prepare("INSERT OR IGNORE INTO settings(key, value) VALUES('invoice_default_description', 'Darba vietas un saistīto pakalpojumu izmantošana')"),
      db.prepare("INSERT OR IGNORE INTO settings(key, value) VALUES('invoice_late_penalty_percent', '0.5')"),
      db.prepare("UPDATE memberships SET plan_key = 'flex-20' WHERE plan_key = 'shared'"),
      db.prepare("UPDATE bookings SET plan_key = 'flex-20' WHERE plan_key = 'shared'"),
    ]);
  })();
  return schemaReady;
}

export async function hashSecret(value: string): Promise<string> {
  const salt = runtimeEnv().PIN_SALT;
  if (!salt) throw new Error("PIN_SALT is not configured.");
  const bytes = new TextEncoder().encode(`${salt}:${value}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function newToken(bytes = 24): string {
  const data = crypto.getRandomValues(new Uint8Array(bytes));
  return [...data].map((value) => value.toString(16).padStart(2, "0")).join("");
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function addDays(date: string, days: number): string {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

export function monthRange(month: string): { start: string; end: string } {
  if (!/^\d{4}-\d{2}$/.test(month)) throw new Error("Invalid month.");
  const start = `${month}-01`;
  const date = new Date(`${start}T12:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() + 1);
  return { start, end: date.toISOString().slice(0, 10) };
}
