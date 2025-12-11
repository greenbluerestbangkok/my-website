const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const session = require('express-session');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));
app.use('/Image', express.static('Image'));

app.use(session({
  secret: 'siam-araya-secret-2025',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// สร้างโฟลเดอร์สำหรับอัปโหลด
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
if (!fs.existsSync('uploads/slips')) fs.mkdirSync('uploads/slips');
if (!fs.existsSync('uploads/vouchers')) fs.mkdirSync('uploads/vouchers');

// ตั้งค่า Multer สำหรับอัปโหลดไฟล์
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/slips/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// เชื่อมต่อ Database
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) console.error('Database connection error:', err);
  else console.log('Connected to SQLite database');
});

// สร้างตาราง
db.serialize(() => {
  // ตารางผู้ใช้
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    email TEXT,
    phone TEXT,
    is_member INTEGER DEFAULT 0,
    member_since TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  // ตาราง Gift Voucher
  db.run(`CREATE TABLE IF NOT EXISTS vouchers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE,
    purchase_amount REAL,
    credit_amount REAL,
    used_amount REAL DEFAULT 0,
    status TEXT DEFAULT 'pending',
    buyer_name TEXT,
    buyer_phone TEXT,
    buyer_email TEXT,
    slip_path TEXT,
    expiry_date TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  // ตารางสินค้า
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    category TEXT,
    price REAL,
    description TEXT,
    image TEXT,
    stock INTEGER DEFAULT 999,
    options TEXT
  )`);

  // ตารางคำสั่งซื้อ
  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    order_number TEXT UNIQUE,
    items TEXT,
    subtotal REAL,
    discount REAL DEFAULT 0,
    total REAL,
    voucher_code TEXT,
    payment_status TEXT DEFAULT 'pending',
    slip_path TEXT,
    shipping_address TEXT,
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  // ตารางสมาชิก
  db.run(`CREATE TABLE IF NOT EXISTS membership_payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    amount REAL DEFAULT 50,
    slip_path TEXT,
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  // เพิ่มสินค้าตัวอย่าง (เฉพาะเมื่อตารางว่าง)
  db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
    if (err || row.count > 0) return; // ถ้ามีสินค้าอยู่แล้วไม่ต้องเพิ่ม

    const sampleProducts = [
      ['เสื้อยืด ดี เก่ง กล้า (เขียวอารยะ)', 'tshirt', 200, 'เสื้อยืดคุณภาพดี ลาย ดี เก่ง กล้า', 'tshirt-thai.jpg', 100, JSON.stringify({ sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'], colors: ['เขียวอารยะ', 'เขียวไมโล', 'เขียวทหาร', 'เขียวมินท์'] })],
      ['เสื้อยืด GOOD SMART BRAVE (ดำ)', 'tshirt', 200, 'เสื้อยืดสีดำ ลายเส้นเขียวสะท้อนแสง', 'tshirt-eng.jpg', 100, JSON.stringify({ sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'], colors: ['ดำ'] })],
      ['เสื้อยืด CAN DO', 'tshirt', 200, 'เสื้อยืด CAN DO 4 เฉดเขียว', 'tshirt-cando.jpg', 100, JSON.stringify({ sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL'], colors: ['เขียว1', 'เขียว2', 'เขียว3', 'เขียว4'] })],
      ['กระเป๋าอารยะ', 'bag', 20, 'กระเป๋าอารยะ', 'bag1.jpg', 200, '{}'],
      ['กระเป๋าผูกเชือก (Pre-Order)', 'bag', 69, 'กระเป๋าผูกเชือก สุ่มลาย', 'bag2.jpg', 50, '{}'],
      ['กระเป๋าผ้า รักษ์โลก ใบเล็ก', 'bag', 69, 'กระเป๋าผ้า รักษ์โลก เลือกลายได้', 'bag3.jpg', 80, JSON.stringify({ patterns: ['ลาย1', 'ลาย2', 'ลาย3'] })],
      ['กระเป๋าผ้า รักษ์โลก ใบใหญ่ (Pre-Order)', 'bag', 120, 'กระเป๋าผ้า รักษ์โลก ใบใหญ่', 'bag4.jpg', 30, '{}'],
      ['กระบอกน้ำ Tumbler', 'souvenir', 299, 'กระบอกน้ำคุณภาพดี (ซื้อ 2 ใบ 500 บาท)', 'tumbler.jpg', 150, '{}'],
      ['สมุดโน้ต ดร.แดน', 'souvenir', 39, 'สมุดโน้ตปกกระดาษคราฟต์', 'notebook.jpg', 300, '{}'],
      ['หนังสือ Success Publisher', 'book', 250, 'หนังสือจาก Success Publisher (สมาชิกลด 15%)', 'book1.jpg', 50, '{}'],
      ['คอร์สฝึกอบรม', 'course', 1500, 'คอร์สฝึกอบรมออนไลน์', 'course.jpg', 999, '{}']
    ];

    const stmt = db.prepare('INSERT INTO products (name, category, price, description, image, stock, options) VALUES (?, ?, ?, ?, ?, ?, ?)');
    sampleProducts.forEach(product => stmt.run(product));
    stmt.finalize();
    console.log('✅ Sample products inserted');
  });
});

// ============ API Routes ============

// หน้าแรก
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ดึงข้อมูลสินค้า
app.get('/api/products', (req, res) => {
  const category = req.query.category;
  let query = 'SELECT * FROM products';
  if (category) query += ' WHERE category = ?';

  db.all(query, category ? [category] : [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// สร้างรหัส Voucher แบบใหม่
function generateVoucherCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // ไม่ใช้ 0, O, 1, I เพื่อป้องกันความสับสน
  let code1 = '';
  let code2 = '';
  for (let i = 0; i < 4; i++) {
    code1 += chars.charAt(Math.floor(Math.random() * chars.length));
    code2 += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `SA-69-${code1}-${code2}`;
}

// สร้าง Gift Voucher
app.post('/api/vouchers/create', upload.single('slip'), (req, res) => {
  const { purchase_amount, buyer_name, buyer_phone, buyer_email } = req.body;
  const credit_amount = parseFloat(purchase_amount) * 1.2;
  const code = generateVoucherCode();
  const expiry_date = '2026-01-31';
  const slip_path = req.file ? req.file.path : null;

  db.run(
    `INSERT INTO vouchers (code, purchase_amount, credit_amount, buyer_name, buyer_phone, buyer_email, slip_path, expiry_date) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [code, purchase_amount, credit_amount, buyer_name, buyer_phone, buyer_email, slip_path, expiry_date],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, voucher_id: this.lastID, code });
    }
  );
});

// ตรวจสอบ Voucher
app.get('/api/vouchers/check/:code', (req, res) => {
  db.get('SELECT * FROM vouchers WHERE code = ?', [req.params.code], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'ไม่พบรหัส Voucher' });

    const remaining = row.credit_amount - row.used_amount;
    res.json({ ...row, remaining });
  });
});

// สมัครสมาชิก
app.post('/api/membership/register', upload.single('slip'), (req, res) => {
  const { username, password, email, phone } = req.body;
  const slip_path = req.file ? req.file.path : null;

  db.run(
    'INSERT INTO users (username, password, email, phone) VALUES (?, ?, ?, ?)',
    [username, password, email, phone],
    function (err) {
      if (err) return res.status(500).json({ error: 'ชื่อผู้ใช้ซ้ำ' });

      const user_id = this.lastID;
      db.run(
        'INSERT INTO membership_payments (user_id, slip_path) VALUES (?, ?)',
        [user_id, slip_path],
        (err) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ success: true, message: 'รอการอนุมัติจากแอดมิน' });
        }
      );
    }
  );
});

// Login with phone
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(401).json({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });

    req.session.user = user;
    res.json({ success: true, user: { id: user.id, username: user.username, is_member: user.is_member } });
  });
});

// New Auth API - Register with phone
app.post('/api/auth/register', (req, res) => {
  const { fullname, phone, email, password } = req.body;

  // Check if phone already exists
  db.get('SELECT * FROM users WHERE phone = ?', [phone], (err, existing) => {
    if (err) return res.status(500).json({ error: err.message });
    if (existing) return res.status(400).json({ error: 'เบอร์โทรนี้ถูกใช้แล้ว' });

    // Insert new user
    db.run(
      'INSERT INTO users (username, password, email, phone) VALUES (?, ?, ?, ?)',
      [fullname, password, email || null, phone],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, user_id: this.lastID });
      }
    );
  });
});

// New Auth API - Login with phone
app.post('/api/auth/login', (req, res) => {
  const { phone, password } = req.body;

  db.get('SELECT * FROM users WHERE phone = ? AND password = ?', [phone, password], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(401).json({ error: 'เบอร์โทรหรือรหัสผ่านไม่ถูกต้อง' });

    req.session.user = user;
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        phone: user.phone,
        is_member: user.is_member
      }
    });
  });
});

// Logout
app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// ตรวจสอบ Session
app.get('/api/session', (req, res) => {
  if (req.session.user) {
    res.json({ logged_in: true, user: req.session.user });
  } else {
    res.json({ logged_in: false });
  }
});

// สร้างคำสั่งซื้อ
app.post('/api/orders/create', upload.single('slip'), (req, res) => {
  const { items, subtotal, discount, total, voucher_code, shipping_address } = req.body;
  const user_id = req.session.user ? req.session.user.id : null;
  const order_number = `ORD-${Date.now()}`;
  const slip_path = req.file ? req.file.path : null;

  db.run(
    `INSERT INTO orders (user_id, order_number, items, subtotal, discount, total, voucher_code, slip_path, shipping_address) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [user_id, order_number, items, subtotal, discount, total, voucher_code, slip_path, shipping_address],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      // ถ้าใช้ Voucher ให้อัปเดตยอดที่ใช้ไป
      if (voucher_code && total === 0) {
        db.run(
          'UPDATE vouchers SET used_amount = used_amount + ? WHERE code = ?',
          [subtotal, voucher_code]
        );
      }

      res.json({ success: true, order_id: this.lastID, order_number });
    }
  );
});

// ดึงคำสั่งซื้อ
app.get('/api/orders/:order_number', (req, res) => {
  db.get('SELECT * FROM orders WHERE order_number = ?', [req.params.order_number], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'ไม่พบคำสั่งซื้อ' });
    res.json(row);
  });
});

// ============ Admin Routes ============

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// ดึงรายการ Voucher ทั้งหมด
app.get('/api/admin/vouchers', (req, res) => {
  db.all('SELECT * FROM vouchers ORDER BY created_at DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// อนุมัติ Voucher
app.post('/api/admin/vouchers/:id/approve', (req, res) => {
  db.run('UPDATE vouchers SET status = ? WHERE id = ?', ['approved', req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// ดึงรายการคำสั่งซื้อทั้งหมด
app.get('/api/admin/orders', (req, res) => {
  db.all('SELECT * FROM orders ORDER BY created_at DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// อนุมัติคำสั่งซื้อ
app.post('/api/admin/orders/:id/approve', (req, res) => {
  const { status } = req.body;
  db.run('UPDATE orders SET payment_status = ?, status = ? WHERE id = ?', ['paid', status, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// ดึงรายการสมาชิกที่รออนุมัติ
app.get('/api/admin/memberships', (req, res) => {
  db.all(`SELECT mp.*, u.username, u.email, u.phone 
          FROM membership_payments mp 
          JOIN users u ON mp.user_id = u.id 
          WHERE mp.status = 'pending'
          ORDER BY mp.created_at DESC`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// อนุมัติสมาชิก
app.post('/api/admin/memberships/:id/approve', (req, res) => {
  db.get('SELECT user_id FROM membership_payments WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });

    const member_since = new Date().toISOString().split('T')[0];
    db.run('UPDATE users SET is_member = 1, member_since = ? WHERE id = ?', [member_since, row.user_id], (err) => {
      if (err) return res.status(500).json({ error: err.message });

      db.run('UPDATE membership_payments SET status = ? WHERE id = ?', ['approved', req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
      });
    });
  });
});

// ดึงรายการสมาชิกทั้งหมด
app.get('/api/admin/members', (req, res) => {
  db.all('SELECT * FROM users ORDER BY created_at DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// อนุมัติสมาชิกโดยตรง
app.post('/api/admin/members/:id/approve', (req, res) => {
  const member_since = new Date().toISOString().split('T')[0];
  db.run('UPDATE users SET is_member = 1, member_since = ? WHERE id = ?', [member_since, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// ใช้ Voucher (หักยอด)
app.post('/api/vouchers/use', (req, res) => {
  const { code, amount } = req.body;

  db.get('SELECT * FROM vouchers WHERE code = ? AND status = ?', [code, 'approved'], (err, voucher) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!voucher) return res.status(404).json({ error: 'ไม่พบ Voucher หรือยังไม่ได้อนุมัติ' });

    const remaining = voucher.credit_amount - voucher.used_amount;
    if (amount > remaining) {
      return res.status(400).json({ error: `ยอดเครดิตไม่พอ (คงเหลือ ฿${remaining})` });
    }

    const newUsedAmount = voucher.used_amount + parseFloat(amount);
    db.run('UPDATE vouchers SET used_amount = ? WHERE id = ?', [newUsedAmount, voucher.id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({
        success: true,
        used: amount,
        remaining: voucher.credit_amount - newUsedAmount
      });
    });
  });
});

// ตรวจสอบ Voucher Code ว่าถูกต้องและยังใช้ได้
app.get('/api/vouchers/validate/:code', (req, res) => {
  db.get('SELECT * FROM vouchers WHERE code = ?', [req.params.code], (err, voucher) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!voucher) return res.status(404).json({ valid: false, error: 'ไม่พบรหัส Voucher' });

    const remaining = voucher.credit_amount - voucher.used_amount;
    const isExpired = new Date(voucher.expiry_date) < new Date();

    res.json({
      valid: voucher.status === 'approved' && remaining > 0 && !isExpired,
      code: voucher.code,
      status: voucher.status,
      credit_amount: voucher.credit_amount,
      used_amount: voucher.used_amount,
      remaining: remaining,
      expiry_date: voucher.expiry_date,
      is_expired: isExpired
    });
  });
});

// เริ่มเซิร์ฟเวอร์
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📊 Admin panel at http://localhost:${PORT}/admin`);
});
