-- สร้าง SQL Schema สำหรับ Supabase

-- ตาราง users (ผู้ใช้)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE,
  password TEXT,
  email TEXT,
  phone TEXT UNIQUE,
  is_member INTEGER DEFAULT 0,
  member_since TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ตาราง vouchers (Gift Voucher)
CREATE TABLE vouchers (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  purchase_amount DECIMAL(10,2),
  credit_amount DECIMAL(10,2),
  used_amount DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'pending',
  buyer_name TEXT,
  buyer_phone TEXT,
  buyer_email TEXT,
  slip_path TEXT,
  expiry_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ตาราง products (สินค้า)
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  price DECIMAL(10,2),
  description TEXT,
  image TEXT,
  stock INTEGER DEFAULT 999,
  options TEXT
);

-- ตาราง orders (คำสั่งซื้อ)
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  order_number TEXT UNIQUE,
  items TEXT,
  subtotal DECIMAL(10,2),
  discount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2),
  voucher_code TEXT,
  payment_status TEXT DEFAULT 'pending',
  slip_path TEXT,
  shipping_address TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- ตาราง membership_payments (การชำระค่าสมาชิก)
CREATE TABLE membership_payments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  amount DECIMAL(10,2) DEFAULT 50,
  slip_path TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert ข้อมูลสินค้าตัวอย่าง
INSERT INTO products (name, category, price, description, image) VALUES
  ('เสื้อยืด SA SHOP สีขาว', 'tshirt', 250, 'เสื้อยืด Cotton 100%', '/Image/เสื้อยืดสีขาว.png'),
  ('เสื้อยืด SA SHOP สีดำ', 'tshirt', 250, 'เสื้อยืด Cotton 100%', '/Image/เสื้อยืดสีดำ.png'),
  ('กระเป๋าผ้า SA SHOP', 'bag', 150, 'กระเป๋าผ้าแคนวาส', '/Image/กระเป๋าผ้า.png'),
  ('แก้วน้ำ SA SHOP', 'souvenir', 180, 'แก้วน้ำสแตนเลส', '/Image/แก้วน้ำ.png'),
  ('หมวก SA SHOP', 'souvenir', 200, 'หมวกแก๊ปปักโลโก้', '/Image/หมวก.png'),
  ('พวงกุญแจ SA SHOP', 'souvenir', 50, 'พวงกุญแจโลหะ', '/Image/พวงกุญแจ.png'),
  ('Success Publisher - Marketing', 'book', 350, 'หนังสือการตลาด', '/Image/book1.png'),
  ('Success Publisher - Leadership', 'book', 400, 'หนังสือภาวะผู้นำ', '/Image/book2.png'),
  ('คอร์สออนไลน์ Marketing 101', 'book', 1500, 'คอร์สเรียนออนไลน์', '/Image/course1.png'),
  ('คอร์สออนไลน์ Business Growth', 'book', 2000, 'คอร์สเรียนออนไลน์', '/Image/course2.png'),
  ('Success Publisher - Money', 'book', 380, 'หนังสือการเงิน', '/Image/book3.png');
