ALTER TABLE orders ADD COLUMN sim_carrier TEXT;
ALTER TABLE orders ADD COLUMN sim_plan TEXT;
ALTER TABLE orders ADD COLUMN sim_status TEXT;
ALTER TABLE orders ADD COLUMN sim_number TEXT;
CREATE TABLE IF NOT EXISTS service_photos (id TEXT PRIMARY KEY, booking_id TEXT NOT NULL REFERENCES service_bookings(id), storage_key TEXT NOT NULL, file_name TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS service_photos_booking ON service_photos(booking_id);
