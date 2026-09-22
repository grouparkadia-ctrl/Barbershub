CREATE TABLE IF NOT EXISTS locations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL DEFAULT '',
  chair_count INTEGER NOT NULL DEFAULT 5 CHECK(chair_count BETWEEN 1 AND 50),
  open_min INTEGER NOT NULL DEFAULT 540,
  close_min INTEGER NOT NULL DEFAULT 1260,
  working_days_week INTEGER NOT NULL DEFAULT 7 CHECK(working_days_week BETWEEN 1 AND 7),
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS location_expenses (
  id TEXT PRIMARY KEY,
  location_id TEXT NOT NULL,
  category TEXT NOT NULL,
  amount_cents INTEGER NOT NULL CHECK(amount_cents >= 0),
  note TEXT NOT NULL DEFAULT '',
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

INSERT OR IGNORE INTO locations(
  id, name, address, chair_count, open_min, close_min,
  working_days_week, active, created_at, updated_at
) VALUES(
  'elizabetes-75', 'BARBERS HUB Elizabetes', 'Elizabetes iela 75, Riga',
  5, 540, 1260, 7, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

ALTER TABLE bookings RENAME TO bookings_legacy;

CREATE TABLE bookings (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  membership_id TEXT,
  location_id TEXT NOT NULL DEFAULT 'elizabetes-75',
  chair_id INTEGER NOT NULL CHECK(chair_id BETWEEN 1 AND 50),
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
);

INSERT INTO bookings(
  id, user_id, membership_id, location_id, chair_id, date, start_min, end_min,
  plan_key, amount_cents, capacity, status, notes, created_by, created_at
)
SELECT
  id, user_id, membership_id, 'elizabetes-75', chair_id, date, start_min, end_min,
  plan_key, amount_cents, capacity, status, notes, created_by, created_at
FROM bookings_legacy;

DROP TABLE bookings_legacy;

ALTER TABLE memberships ADD COLUMN location_id TEXT NOT NULL DEFAULT 'elizabetes-75';

ALTER TABLE booking_slots RENAME TO booking_slots_legacy;

CREATE TABLE booking_slots (
  booking_id TEXT NOT NULL,
  location_id TEXT NOT NULL DEFAULT 'elizabetes-75',
  chair_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  slot INTEGER NOT NULL,
  PRIMARY KEY (location_id, chair_id, date, slot)
);

INSERT INTO booking_slots(booking_id, location_id, chair_id, date, slot)
SELECT booking_id, 'elizabetes-75', chair_id, date, slot
FROM booking_slots_legacy;

DROP TABLE booking_slots_legacy;

CREATE INDEX IF NOT EXISTS locations_active_idx ON locations(active, name);
CREATE INDEX IF NOT EXISTS location_expenses_location_idx ON location_expenses(location_id, active);
CREATE INDEX IF NOT EXISTS bookings_location_calendar_idx ON bookings(location_id, date, chair_id);
