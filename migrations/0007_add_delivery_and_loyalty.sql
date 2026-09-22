ALTER TABLE orders ADD COLUMN delivery_mode TEXT NOT NULL DEFAULT 'pickup';
ALTER TABLE orders ADD COLUMN delivery_address TEXT;
ALTER TABLE orders ADD COLUMN delivery_fee REAL NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN delivery_status TEXT;

CREATE TABLE IF NOT EXISTS loyalty_accounts (
  id TEXT PRIMARY KEY,
  phone TEXT NOT NULL UNIQUE,
  points INTEGER NOT NULL DEFAULT 0,
  referral_code TEXT NOT NULL UNIQUE,
  used_referral_code TEXT,
  created_at TEXT NOT NULL
);
