ALTER TABLE pre_bookings ADD COLUMN status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE exchange_leads ADD COLUMN status TEXT NOT NULL DEFAULT 'new';

CREATE TABLE IF NOT EXISTS promotions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  text TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'badge-percent',
  active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

INSERT OR IGNORE INTO promotions (id, title, text, icon, active, sort_order, created_at) VALUES
('promo1','Exchange your old phone','Get an instant bonus of up to ₹5,000 extra on exchange of your old smartphone, any brand, any condition.','repeat',1,1,'2024-06-01T00:00:00.000Z'),
('promo2','No-cost EMI on select banks','Bring your HDFC, ICICI, SBI or Axis Bank card and split your purchase into easy monthly instalments with zero extra cost.','landmark',1,2,'2024-06-01T00:00:00.000Z'),
('promo3','Refer & earn ₹500','Refer a friend who buys a phone at Kesava Mobiles, Nagari, and both of you get a ₹500 accessory voucher.','badge-percent',1,3,'2024-06-01T00:00:00.000Z');
