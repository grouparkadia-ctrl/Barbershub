CREATE TABLE IF NOT EXISTS member_addons (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  addon_key TEXT NOT NULL CHECK(addon_key IN ('priority-calendar')),
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS member_addons_user_idx
  ON member_addons(user_id, start_date, end_date);

UPDATE memberships SET plan_key = 'flex-20' WHERE plan_key = 'shared';
UPDATE bookings SET plan_key = 'flex-20' WHERE plan_key = 'shared';
