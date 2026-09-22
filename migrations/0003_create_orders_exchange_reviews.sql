CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  order_code TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  total_amount REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS exchange_leads (
  id TEXT PRIMARY KEY,
  claim_code TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  old_brand TEXT NOT NULL,
  old_model TEXT NOT NULL,
  purchase_year INTEGER NOT NULL,
  condition TEXT NOT NULL,
  estimated_value REAL NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  rating INTEGER NOT NULL,
  comment TEXT NOT NULL,
  created_at TEXT NOT NULL
);

INSERT OR IGNORE INTO reviews (id, product_id, customer_name, rating, comment, created_at) VALUES
('r1','p1','Suresh N.',5,'Bought it from the Nagari store, staff helped set up everything. Camera is superb.','2024-06-05T10:00:00.000Z'),
('r2','p1','Lakshmi P.',4,'Great phone, battery could be a bit better but overall very happy.','2024-06-10T10:00:00.000Z'),
('r3','p7','Manikanta R.',5,'Best camera under 25k, zoom is crazy good. Kesava Mobiles gave a good exchange bonus too.','2024-05-20T10:00:00.000Z'),
('r4','p6','Divya S.',4,'Fast charging is a lifesaver, gaming performance is smooth.','2024-05-28T10:00:00.000Z');
