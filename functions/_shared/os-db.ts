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
      db.prepare("INSERT OR IGNORE INTO settings(key, value) VALUES('capacity_target', '128')"),
      db.prepare("INSERT OR IGNORE INTO settings(key, value) VALUES('monthly_cost_cents', '200000')"),
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
