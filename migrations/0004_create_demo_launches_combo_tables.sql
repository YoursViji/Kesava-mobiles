CREATE TABLE IF NOT EXISTS demo_bookings (
  id TEXT PRIMARY KEY,
  booking_code TEXT NOT NULL UNIQUE,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  preferred_date TEXT NOT NULL,
  preferred_time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS pre_launches (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  expected_price TEXT NOT NULL,
  token_amount REAL NOT NULL,
  expected_date TEXT NOT NULL,
  description TEXT NOT NULL,
  color_from TEXT NOT NULL,
  color_to TEXT NOT NULL,
  image_url TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS pre_bookings (
  id TEXT PRIMARY KEY,
  booking_code TEXT NOT NULL UNIQUE,
  launch_id TEXT NOT NULL,
  launch_name TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  token_amount REAL NOT NULL,
  created_at TEXT NOT NULL
);

ALTER TABLE service_bookings ADD COLUMN delivery_mode TEXT NOT NULL DEFAULT 'store_dropoff';
ALTER TABLE service_bookings ADD COLUMN pickup_address TEXT;

INSERT OR IGNORE INTO pre_launches (id, name, brand, expected_price, token_amount, expected_date, description, color_from, color_to, image_url, created_at) VALUES
('L1','iPhone 16','Apple','Expected around ₹79,900',999,'Launching soon','The next iPhone with a redesigned camera system and the latest Apple chip. Reserve now to be first in line at our Nagari store.','from-neutral-800','to-black',NULL,'2024-06-01T00:00:00.000Z'),
('L2','Galaxy S25','Samsung','Expected around ₹74,999',999,'Launching soon','Samsung''s next flagship with a brighter display and improved Galaxy AI features. Pre-book to skip the wait when stock arrives.','from-blue-600','to-indigo-800',NULL,'2024-06-02T00:00:00.000Z'),
('L3','OnePlus 13','OnePlus','Expected around ₹54,999',499,'Launching soon','OnePlus''s upcoming flagship with faster charging and a refined Hasselblad camera. Token amount adjusted fully against your purchase.','from-red-600','to-rose-800',NULL,'2024-06-03T00:00:00.000Z');
