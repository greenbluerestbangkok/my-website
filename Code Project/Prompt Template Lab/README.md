# Good Content - ระบบสมาชิก

ระบบจัดการสมาชิกสำหรับ Good Content ที่ให้ผู้ใช้สามารถใช้งานเทมเพลต AI ได้ไม่จำกัด

## 🚀 คุณสมบัติ

- **ระบบสมัครสมาชิก** - สมัครสมาชิกด้วยอีเมลและรหัสผ่าน
- **ระบบเข้าสู่ระบบ** - เข้าสู่ระบบด้วย JWT Token
- **Google OAuth** - สมัครสมาชิกและเข้าสู่ระบบด้วย Gmail
- **Dashboard** - หน้าจัดการบัญชีผู้ใช้
- **ระบบการชำระเงิน** - ชำระเงินด้วย Stripe
- **การติดตามการใช้งาน** - บันทึกสถิติการใช้งาน
- **ระบบแผนการใช้งาน** - Free, Basic, Premium, Enterprise
- **Template Access Control** - ควบคุมการเข้าถึงเทมเพลตตามแผนการใช้งาน
- **Platform Icons** - แสดงไอคอนแพลตฟอร์มสำหรับเทมเพลต

## 📁 โครงสร้างไฟล์

```
Good Content/
├── auth.html                 # หน้าสมัครสมาชิกและเข้าสู่ระบบ
├── dashboard.html            # หน้าจัดการบัญชีผู้ใช้
├── Prompt Template Lab.html  # แอปหลัก
├── admin.html               # หน้าจัดการแอดมิน
├── backend/
│   ├── server.js            # API Server
│   ├── payment.js           # ระบบการชำระเงิน
│   ├── create-admin.js      # สร้างแอดมิน
│   ├── package.json         # Dependencies
│   └── env.example          # ตัวอย่างการตั้งค่า
├── docker-compose.yml       # Docker configuration
├── Dockerfile              # Docker image
├── nginx.conf              # Nginx configuration
├── deploy.sh               # Deploy script
├── GOOGLE_API_SETUP.md     # คู่มือตั้งค่า Google API
├── DEVELOPER_GUIDE.md      # คู่มือสำหรับผู้พัฒนา
└── README.md               # คู่มือนี้
```

## 🛠️ การติดตั้ง

### 1. ติดตั้ง Dependencies

```bash
cd backend
npm install
```

### 2. ตั้งค่าฐานข้อมูล

#### ตัวเลือกที่ 1: MongoDB Local
```bash
# ติดตั้ง MongoDB
# macOS
brew install mongodb-community

# Ubuntu
sudo apt-get install mongodb

# เริ่ม MongoDB
mongod
```

#### ตัวเลือกที่ 2: MongoDB Atlas (Cloud)
1. สร้างบัญชีที่ [MongoDB Atlas](https://www.mongodb.com/atlas)
2. สร้าง Cluster ใหม่
3. ตั้งค่า Network Access และ Database User
4. คัดลอก Connection String

### 3. ตั้งค่า Environment Variables

```bash
cd backend
cp env.example .env
```

แก้ไขไฟล์ `.env`:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/good-content
# หรือใช้ MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/good-content

# JWT Secret (เปลี่ยนเป็นค่าที่ปลอดภัย)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/gmail/callback

# Session Secret
SESSION_SECRET=your-session-secret-key

# Google AI API
GOOGLE_AI_API_KEY=your-google-ai-api-key

# Frontend URL
FRONTEND_URL=http://localhost:8080
```

### 4. เริ่มต้น Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

Server จะทำงานที่ `http://localhost:3000`

## 🔧 การตั้งค่าเพิ่มเติม

### 1. ตั้งค่า Email (Gmail)

1. เปิด 2-Factor Authentication ใน Gmail
2. สร้าง App Password:
   - ไปที่ Google Account Settings
   - Security > 2-Step Verification > App passwords
   - สร้าง password สำหรับ "Mail"
3. ใช้ App Password ใน `EMAIL_PASS`

### 2. ตั้งค่า Google OAuth

1. ไปที่ [Google Cloud Console](https://console.cloud.google.com)
2. สร้างโปรเจ็กต์ใหม่หรือเลือกโปรเจ็กต์ที่มีอยู่
3. เปิดใช้งาน Google+ API
4. ไปที่ Credentials > Create Credentials > OAuth 2.0 Client IDs
5. ตั้งค่า Application type เป็น "Web application"
6. เพิ่ม Authorized redirect URIs:
   - `http://localhost:3000/api/auth/gmail/callback` (สำหรับ development)
   - `https://yourdomain.com/api/auth/gmail/callback` (สำหรับ production)
7. คัดลอก Client ID และ Client Secret

### 3. ตั้งค่า Stripe

1. สร้างบัญชีที่ [Stripe](https://stripe.com)
2. ไปที่ Dashboard > Developers > API keys
3. คัดลอก Secret key และ Publishable key
4. ตั้งค่า Webhook:
   - Dashboard > Developers > Webhooks
   - Add endpoint: `https://yourdomain.com/api/payment/webhook`
   - Events: `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.deleted`

### 4. ตั้งค่า Google AI API

#### วิธีสร้าง Google AI API Key

1. **ไปที่ Google AI Studio**
   - เปิดเบราว์เซอร์และไปที่ [Google AI Studio](https://aistudio.google.com)
   - หรือไปที่ [Google AI Studio API Keys](https://aistudio.google.com/app/apikey) โดยตรง

2. **เข้าสู่ระบบ Google**
   - ใช้บัญชี Google ของคุณเข้าสู่ระบบ
   - หากยังไม่มีบัญชี Google ให้สร้างใหม่ที่ [accounts.google.com](https://accounts.google.com)

3. **สร้าง API Key ใหม่**
   - คลิก "Create API Key" หรือ "สร้าง API Key"
   - เลือกโปรเจ็กต์ Google Cloud (หรือสร้างใหม่)
   - ตั้งชื่อ API Key (เช่น "Prompt Template Lab")
   - คลิก "Create" หรือ "สร้าง"

4. **คัดลอก API Key**
   - คัดลอก API Key ที่สร้างขึ้นมา
   - ⚠️ **สำคัญ**: เก็บ API Key ไว้อย่างปลอดภัย อย่าแชร์ให้ผู้อื่น

5. **เพิ่มในไฟล์ .env**
   ```env
   GOOGLE_AI_API_KEY=your-google-ai-api-key-here
   ```

#### ข้อมูลเพิ่มเติมเกี่ยวกับ Google AI API

- **ราคา**: ฟรีสำหรับการใช้งานในระดับเริ่มต้น (ดูรายละเอียดที่ [Google AI Pricing](https://ai.google.dev/pricing))
- **ขีดจำกัด**: มีขีดจำกัดการใช้งานต่อวัน (ดูที่ [Quotas & Limits](https://ai.google.dev/gemini-api/docs/quotas))
- **ความปลอดภัย**: API Key จะถูกเก็บไว้ในเบราว์เซอร์เท่านั้น ไม่ส่งไปยังเซิร์ฟเวอร์อื่น
- **การใช้งาน**: ใช้สำหรับเรียกใช้ Google Gemini AI models

#### การแก้ไขปัญหา Google API

**หาก API Key ไม่ทำงาน:**
1. ตรวจสอบว่า API Key ถูกต้องและยังไม่หมดอายุ
2. ตรวจสอบว่าได้เปิดใช้งาน Gemini API ใน Google Cloud Console
3. ตรวจสอบขีดจำกัดการใช้งาน (Quotas)
4. ลองสร้าง API Key ใหม่

**ลิงค์ที่เป็นประโยชน์:**
- [Google AI Studio](https://aistudio.google.com) - สร้างและจัดการ API Keys
- [Google AI Documentation](https://ai.google.dev/docs) - คู่มือการใช้งาน
- [Google Cloud Console](https://console.cloud.google.com) - จัดการโปรเจ็กต์และ API
- [Gemini API Pricing](https://ai.google.dev/pricing) - ราคาและขีดจำกัด

📖 **คู่มือการตั้งค่า Google API Key แบบละเอียด**: ดูไฟล์ [GOOGLE_API_SETUP.md](./GOOGLE_API_SETUP.md) สำหรับคำแนะนำแบบทีละขั้นตอนพร้อมการแก้ไขปัญหา

## 🌐 การ Deploy

### 1. Deploy Backend (Heroku)

```bash
# ติดตั้ง Heroku CLI
# สร้าง Heroku app
heroku create your-app-name

# ตั้งค่า Environment Variables
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-jwt-secret
heroku config:set STRIPE_SECRET_KEY=your-stripe-secret
# ... ตั้งค่าตัวแปรอื่นๆ

# Deploy
git add .
git commit -m "Initial commit"
git push heroku main
```

### 2. Deploy Frontend (Netlify/Vercel)

1. อัปโหลดไฟล์ HTML ไปยัง Netlify หรือ Vercel
2. ตั้งค่า Environment Variables
3. เปลี่ยน `FRONTEND_URL` ใน Backend

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - สมัครสมาชิก
- `POST /api/auth/login` - เข้าสู่ระบบ
- `GET /api/auth/verify` - ตรวจสอบ Token
- `POST /api/auth/forgot-password` - ลืมรหัสผ่าน
- `GET /api/auth/gmail` - เริ่มต้น Google OAuth
- `GET /api/auth/gmail/callback` - Google OAuth callback

### User Management
- `GET /api/user/profile` - ดูโปรไฟล์
- `PUT /api/user/profile` - อัปเดตโปรไฟล์
- `GET /api/user/stats` - ดูสถิติการใช้งาน

### Payment
- `GET /api/payment/plans` - ดูแผนการใช้งาน
- `POST /api/payment/create-checkout-session` - สร้าง session ชำระเงิน
- `POST /api/payment/webhook` - Webhook จาก Stripe
- `GET /api/payment/subscription` - ดูสถานะการสมัครสมาชิก

### Usage Tracking
- `POST /api/usage/track` - บันทึกการใช้งาน

## 🔒 Security Features

- **JWT Authentication** - ระบบยืนยันตัวตนที่ปลอดภัย
- **Password Hashing** - เข้ารหัสรหัสผ่านด้วย bcrypt
- **Google OAuth** - การยืนยันตัวตนด้วย Google
- **Rate Limiting** - จำกัดจำนวนคำขอต่อ IP
- **CORS Protection** - ป้องกันการเข้าถึงข้ามโดเมน
- **Helmet** - Security headers
- **Input Validation** - ตรวจสอบข้อมูลที่ส่งเข้ามา
- **Session Management** - จัดการ session อย่างปลอดภัย

## 📱 การใช้งาน

### 1. สมัครสมาชิก
1. เปิด `auth.html`
2. คลิก "สมัครสมาชิก"
3. กรอกข้อมูลที่จำเป็น หรือคลิก "สมัครสมาชิกด้วย Gmail"
4. ตรวจสอบอีเมลเพื่อยืนยันบัญชี

### 2. เข้าสู่ระบบ
1. เปิด `auth.html`
2. กรอกอีเมลและรหัสผ่าน หรือคลิก "เข้าสู่ระบบด้วย Gmail"
3. ระบบจะ redirect ไปยัง `dashboard.html`

### 3. ใช้งานเทมเพลต
1. จาก Dashboard คลิก "เทมเพลต"
2. หรือไปที่ `Prompt Template Lab.html`
3. ระบบจะตรวจสอบสิทธิ์การใช้งานอัตโนมัติ
4. Basic users สามารถดูเทมเพลตได้ แต่ต้องอัปเกรดเพื่อใช้งาน

### 4. การจัดการบัญชี
1. ไปที่ `dashboard.html` เพื่อดูข้อมูลบัญชี
2. ดูสถิติการใช้งาน
3. จัดการการสมัครสมาชิก
4. อัปเดตข้อมูลส่วนตัว

## 🐛 การแก้ไขปัญหา

### 1. ไม่สามารถเชื่อมต่อฐานข้อมูล
```bash
# ตรวจสอบว่า MongoDB ทำงานอยู่
mongosh
# หรือ
mongo
```

### 2. JWT Token ไม่ถูกต้อง
- ตรวจสอบ `JWT_SECRET` ใน `.env`
- ตรวจสอบว่า Token ยังไม่หมดอายุ

### 3. Stripe Payment ไม่ทำงาน
- ตรวจสอบ API Keys
- ตรวจสอบ Webhook URL
- ดู Log ใน Stripe Dashboard

### 4. Email ไม่ส่ง
- ตรวจสอบ Gmail App Password
- ตรวจสอบ SMTP settings
- ดู Log ใน Console

## 📈 การ Monitor

### 1. ดู Log
```bash
# Development
npm run dev

# Production
pm2 logs
```

### 2. ตรวจสอบ Database
```bash
mongosh
use prompt-template-lab
db.users.find()
db.usages.find()
```

### 3. ตรวจสอบ Stripe
- ไปที่ Stripe Dashboard
- ดู Events และ Logs

## 🔄 การอัปเดต

### 1. อัปเดต Dependencies
```bash
npm update
```

### 2. อัปเดต Database Schema
```bash
# ตรวจสอบ migration scripts
# อัปเดต schema ใน server.js
```

### 3. อัปเดต Frontend
- อัปโหลดไฟล์ HTML ใหม่
- ตรวจสอบ API endpoints

## 🆕 การเปลี่ยนแปลงล่าสุด

### v2.0.0 - Good Content Update
- **เปลี่ยนชื่อ**: จาก "Prompt Template Lab" เป็น "Good Content"
- **Google OAuth**: เพิ่มการสมัครสมาชิกและเข้าสู่ระบบด้วย Gmail
- **Template Access Control**: Basic users สามารถดูเทมเพลตได้ แต่ต้องอัปเกรดเพื่อใช้งาน
- **Platform Icons**: เพิ่มไอคอนแพลตฟอร์มสำหรับเทมเพลต (X, Facebook, Instagram, YouTube, etc.)
- **UI Improvements**: ปรับปรุงการแสดงผลและ UX
- **Security Enhancements**: เพิ่มความปลอดภัยและ session management

### v1.5.0 - Template System
- **Lock Symbols**: ย้ายสัญลักษณ์ล็อคไปหน้าชื่อเทมเพลต
- **Basic User Access**: อนุญาตให้ Basic users ดูเทมเพลตได้
- **Upgrade Prompts**: แสดงข้อความแนะนำให้อัปเกรดเมื่อใช้งานเทมเพลตที่ล็อค

### v1.0.0 - Initial Release
- ระบบสมาชิกพื้นฐาน
- ระบบการชำระเงิน
- Dashboard และการจัดการบัญชี

## 📞 การสนับสนุน

หากมีปัญหาหรือคำถาม:

1. ตรวจสอบ Log files
2. ดู Documentation
3. สร้าง Issue ใน GitHub
4. ติดต่อทีมพัฒนา

## 📄 License

MIT License - ดูรายละเอียดในไฟล์ LICENSE

---

**หมายเหตุ:** ระบบนี้เป็นตัวอย่างสำหรับการพัฒนา ควรปรับแต่งและเพิ่มความปลอดภัยก่อนใช้งานจริง
