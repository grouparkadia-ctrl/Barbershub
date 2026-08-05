CREATE TABLE IF NOT EXISTS member_profiles (
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
);

CREATE TABLE IF NOT EXISTS financial_adjustments (
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
);

CREATE INDEX IF NOT EXISTS member_profiles_archived_idx
  ON member_profiles(archived, user_id);
CREATE INDEX IF NOT EXISTS financial_adjustments_user_idx
  ON financial_adjustments(user_id, effective_date);
CREATE INDEX IF NOT EXISTS financial_adjustments_transaction_idx
  ON financial_adjustments(transaction_id, status);
CREATE INDEX IF NOT EXISTS financial_adjustments_source_idx
  ON financial_adjustments(source_transaction_id, status);

INSERT OR IGNORE INTO settings(key, value) VALUES('invoice_due_days', '3');
INSERT OR IGNORE INTO settings(key, value) VALUES('default_referral_rate_bps', '2000');
INSERT OR IGNORE INTO settings(key, value) VALUES('supplier_name', 'Bronsons SIA');
INSERT OR IGNORE INTO settings(key, value) VALUES('supplier_registration_number', '40203547922');
INSERT OR IGNORE INTO settings(key, value) VALUES('supplier_legal_address', 'Tērbatas iela 8b-54, Rīga, LV-1050');
INSERT OR IGNORE INTO settings(key, value) VALUES('supplier_service_address', 'Elizabetes iela 75, Rīga, LV-1050');
INSERT OR IGNORE INTO settings(key, value) VALUES('supplier_bank_name', 'Swedbank AS');
INSERT OR IGNORE INTO settings(key, value) VALUES('supplier_swift', 'HABALV22');
INSERT OR IGNORE INTO settings(key, value) VALUES('supplier_iban', 'LV76HABA0551057160264');
INSERT OR IGNORE INTO settings(key, value) VALUES('invoice_prefix', 'NOM');
INSERT OR IGNORE INTO settings(key, value) VALUES('invoice_default_description', 'Darba vietas un saistīto pakalpojumu izmantošana');
INSERT OR IGNORE INTO settings(key, value) VALUES('invoice_late_penalty_percent', '0.5');
