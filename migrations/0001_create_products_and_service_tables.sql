CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  category TEXT NOT NULL,
  price REAL NOT NULL,
  original_price REAL NOT NULL,
  discount_percent INTEGER NOT NULL DEFAULT 0,
  tag TEXT,
  ram TEXT NOT NULL,
  storage TEXT NOT NULL,
  display TEXT NOT NULL,
  camera TEXT NOT NULL,
  battery TEXT NOT NULL,
  processor TEXT NOT NULL,
  os TEXT NOT NULL,
  color_from TEXT NOT NULL,
  color_to TEXT NOT NULL,
  rating REAL NOT NULL DEFAULT 4.3,
  reviews_count INTEGER NOT NULL DEFAULT 0,
  in_stock INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS service_bookings (
  id TEXT PRIMARY KEY,
  tracking_code TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  device_brand TEXT NOT NULL,
  device_model TEXT NOT NULL,
  service_type TEXT NOT NULL,
  issue_description TEXT NOT NULL,
  preferred_date TEXT NOT NULL,
  preferred_time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'received',
  quote_amount REAL,
  payment_status TEXT NOT NULL DEFAULT 'unpaid',
  user_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS service_updates (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL,
  status TEXT NOT NULL,
  note TEXT,
  created_at TEXT NOT NULL
);

INSERT OR IGNORE INTO products (id, name, brand, category, price, original_price, discount_percent, tag, ram, storage, display, camera, battery, processor, os, color_from, color_to, rating, reviews_count, in_stock, created_at) VALUES
('p1','iPhone 15 (128GB)','Apple','Smartphone',68999,74900,8,'Bestseller','6GB','128GB','6.1-inch Super Retina XDR OLED','48MP + 12MP dual camera','3349 mAh','Apple A16 Bionic','iOS 17','from-neutral-800','to-black',4.7,2318,1,'2024-06-01T00:00:00.000Z'),
('p2','iPhone 14 (128GB)','Apple','Smartphone',52999,59900,12,NULL,'6GB','128GB','6.1-inch Super Retina XDR OLED','12MP + 12MP dual camera','3279 mAh','Apple A15 Bionic','iOS 16','from-slate-700','to-neutral-900',4.6,1876,1,'2024-05-20T00:00:00.000Z'),
('p3','Galaxy S24','Samsung','Smartphone',69999,79999,13,'New Launch','8GB','256GB','6.2-inch Dynamic AMOLED 2X','50MP + 12MP + 10MP triple camera','4000 mAh','Exynos 2400','Android 14, One UI 6.1','from-blue-600','to-indigo-800',4.6,942,1,'2024-06-10T00:00:00.000Z'),
('p4','Galaxy M14 5G','Samsung','Smartphone',12999,16999,24,'Great Battery','6GB','128GB','6.6-inch PLS LCD, 90Hz','50MP + 5MP + 2MP triple camera','6000 mAh','Exynos 1330','Android 13, One UI 5','from-blue-400','to-cyan-600',4.3,5231,1,'2024-03-15T00:00:00.000Z'),
('p5','Nord CE4','OnePlus','Smartphone',24999,26999,7,NULL,'8GB','128GB','6.7-inch AMOLED, 120Hz','50MP + 8MP dual camera','5500 mAh','Snapdragon 7 Gen 3','OxygenOS 14','from-red-600','to-rose-800',4.4,1120,1,'2024-04-02T00:00:00.000Z'),
('p6','OnePlus 12R','OnePlus','Smartphone',39999,45999,13,'Bestseller','12GB','256GB','6.78-inch AMOLED, 120Hz','50MP + 8MP + 2MP triple camera','5500 mAh','Snapdragon 8 Gen 2','OxygenOS 14','from-red-500','to-red-800',4.6,2044,1,'2024-02-10T00:00:00.000Z'),
('p7','Redmi Note 13 Pro','Xiaomi','Smartphone',21999,25999,15,'Top Rated','8GB','256GB','6.67-inch AMOLED, 120Hz','200MP + 8MP + 2MP triple camera','5100 mAh','Snapdragon 7s Gen 2','Android 13, HyperOS','from-orange-500','to-amber-700',4.5,6890,1,'2024-01-18T00:00:00.000Z'),
('p8','Redmi 13C','Xiaomi','Smartphone',8999,10999,18,'Budget Pick','4GB','128GB','6.74-inch HD+, 90Hz','50MP + 2MP dual camera','5000 mAh','MediaTek Helio G85','Android 13, HyperOS','from-amber-400','to-orange-600',4.2,9021,1,'2024-01-05T00:00:00.000Z'),
('p9','realme 12 Pro+','realme','Smartphone',27999,29999,7,NULL,'8GB','256GB','6.7-inch curved AMOLED, 120Hz','50MP periscope + 8MP + 32MP triple camera','5000 mAh','Snapdragon 7s Gen 2','Android 14, realme UI 5','from-yellow-400','to-orange-500',4.4,780,1,'2024-05-01T00:00:00.000Z'),
('p10','realme Narzo N65','realme','Smartphone',13999,15999,13,NULL,'6GB','128GB','6.67-inch AMOLED, 120Hz','50MP main camera','5000 mAh','MediaTek Dimensity 6300','Android 14, realme UI 5','from-yellow-300','to-yellow-600',4.3,410,1,'2024-05-25T00:00:00.000Z'),
('p11','Vivo V30','vivo','Smartphone',33999,35999,6,'New Launch','8GB','256GB','6.78-inch AMOLED, 120Hz','50MP + 50MP dual camera with Aura Light','5500 mAh','Snapdragon 7 Gen 3','Android 14, FunTouch OS 14','from-sky-400','to-blue-600',4.5,650,1,'2024-06-05T00:00:00.000Z'),
('p12','Vivo Y28','vivo','Smartphone',12999,14999,13,NULL,'6GB','128GB','6.68-inch HD+, 90Hz','50MP main camera','6000 mAh','MediaTek Helio G85','Android 14, FunTouch OS 14','from-sky-300','to-sky-600',4.2,1300,1,'2024-04-15T00:00:00.000Z'),
('p13','iQOO Z9','iQOO','Smartphone',17999,19999,10,'Gamer''s Choice','8GB','128GB','6.67-inch AMOLED, 120Hz','50MP OIS main camera','5000 mAh','MediaTek Dimensity 7200','Android 14, FunTouch OS 14','from-purple-600','to-fuchsia-800',4.4,2200,1,'2024-03-28T00:00:00.000Z'),
('p14','POCO X6 5G','POCO','Smartphone',22999,25999,12,'Trending','8GB','256GB','6.67-inch AMOLED, 120Hz','64MP OIS main camera','5100 mAh','Snapdragon 7s Gen 2','Android 14, HyperOS','from-yellow-400','to-yellow-700',4.5,3400,1,'2024-02-20T00:00:00.000Z');

INSERT OR IGNORE INTO service_bookings (id, tracking_code, customer_name, phone, email, device_brand, device_model, service_type, issue_description, preferred_date, preferred_time, status, quote_amount, payment_status, user_id, created_at, updated_at) VALUES
('b-demo1','KM-DEMO01','Ravi Kumar','9042112233',NULL,'Samsung','Galaxy M31','Screen Repair','Screen cracked after a fall, touch still working near edges.','2024-06-15','11:00 AM','quoted',1499,'unpaid',NULL,'2024-06-12T05:00:00.000Z','2024-06-13T06:00:00.000Z');

INSERT OR IGNORE INTO service_updates (id, booking_id, status, note, created_at) VALUES
('u-demo1','b-demo1','received','Device received at Kesava Mobiles, Nagari.','2024-06-12T05:00:00.000Z'),
('u-demo2','b-demo1','diagnosed','Diagnosed: display module needs replacement.','2024-06-12T09:00:00.000Z'),
('u-demo3','b-demo1','quoted','Quote shared: ₹1,499 for original display module replacement.','2024-06-13T06:00:00.000Z');
