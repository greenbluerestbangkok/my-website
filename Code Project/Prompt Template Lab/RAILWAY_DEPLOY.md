# 🚀 คู่มือ Deploy บน Railway - Step by Step

## 📋 ภาพรวม
คู่มือนี้จะแนะนำการ Deploy ระบบ Good Content บน Railway แบบทีละขั้นตอน

## 🎯 ขั้นตอนการ Deploy

### ขั้นตอนที่ 1: เตรียม Repository

#### 1.1 สร้าง GitHub Repository
```bash
# 1. ไปที่ GitHub.com
# 2. คลิก "New repository"
# 3. ตั้งชื่อ: good-content
# 4. เลือก Public
# 5. คลิก "Create repository"
```

#### 1.2 Upload Code ไป GitHub
```bash
# 1. เปิด Terminal
# 2. ไปที่ folder โปรเจ็กต์
cd "/Users/nattagid/Code Project/Prompt Template Lab"

# 3. Initialize Git
git init

# 4. Add files
git add .

# 5. Commit
git commit -m "Initial commit - Good Content"

# 6. Add remote
git remote add origin https://github.com/yourusername/good-content.git

# 7. Push to GitHub
git branch -M main
git push -u origin main
```

### ขั้นตอนที่ 2: Deploy บน Railway

#### 2.1 สร้างบัญชี Railway
1. **ไปที่ [railway.app](https://railway.app)**
2. **คลิก "Login"**
3. **เลือก "Login with GitHub"**
4. **อนุญาต Railway เข้าถึง GitHub**

#### 2.2 สร้าง Project ใหม่
1. **คลิก "New Project"**
2. **เลือก "Deploy from GitHub repo"**
3. **เลือก repository "good-content"**
4. **คลิก "Deploy Now"**

#### 2.3 ตั้งค่า Environment Variables
1. **ไปที่ Project Dashboard**
2. **คลิก "Variables" tab**
3. **เพิ่ม Environment Variables ตามนี้:**

```
NODE_ENV=production
PORT=8080
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/good-content
JWT_SECRET=good-content-super-secure-jwt-secret-key-2024-production
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
STRIPE_SECRET_KEY=sk_test_your_stripe_test_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_test_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://your-app.railway.app/api/auth/gmail/callback
SESSION_SECRET=good-content-session-secret-key-2024-production
GOOGLE_AI_API_KEY=your-google-ai-api-key
FRONTEND_URL=https://your-app.railway.app
CORS_ORIGIN=https://your-app.railway.app
```

#### 2.4 ตั้งค่า Database
1. **คลิก "New" > "Database"**
2. **เลือก "MongoDB"**
3. **คลิก "Deploy"**
4. **คัดลอก Connection String**
5. **ไปที่ Variables และอัปเดต MONGODB_URI**

#### 2.5 ตั้งค่า Custom Domain (Optional)
1. **ไปที่ "Settings" > "Domains"**
2. **คลิก "Custom Domain"**
3. **เพิ่ม domain ของคุณ**
4. **ตั้งค่า DNS ตามที่ Railway แนะนำ**

### ขั้นตอนที่ 3: ทดสอบระบบ

#### 3.1 ตรวจสอบ Health Check
```bash
# เปิด URL ที่ Railway ให้
# ตัวอย่าง: https://good-content-production.railway.app/api/health
# ควรได้ response: {"success":true,"message":"Server is running"}
```

#### 3.2 ทดสอบ Main App
```bash
# เปิด URL: https://your-app.railway.app/Prompt Template Lab.html
# ควรเห็นหน้าเว็บหลัก
```

#### 3.3 ทดสอบ Admin
```bash
# เปิด URL: https://your-app.railway.app/admin.html
# ใช้ข้อมูลเข้าสู่ระบบ:
# Email: admin@prompttemplatelab.com
# Password: admin123456
```

#### 3.4 ทดสอบ API
```bash
# ทดสอบ Registration
curl -X POST https://your-app.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstname":"Test","lastname":"User","email":"test@example.com","password":"password123"}'

# ทดสอบ Login
curl -X POST https://your-app.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### ขั้นตอนที่ 4: ตั้งค่า Stripe

#### 4.1 สร้าง Stripe Account
1. **ไปที่ [stripe.com](https://stripe.com)**
2. **คลิก "Start now"**
3. **กรอกข้อมูลบัญชี**
4. **ยืนยันอีเมล**

#### 4.2 ตั้งค่า API Keys
1. **ไปที่ Dashboard > Developers > API keys**
2. **คัดลอก Secret key และ Publishable key**
3. **ไปที่ Railway Variables และอัปเดต:**
   ```
   STRIPE_SECRET_KEY=sk_test_your_stripe_test_secret_key
   STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_test_publishable_key
   ```

#### 4.3 ตั้งค่า Webhook
1. **ไปที่ Dashboard > Developers > Webhooks**
2. **คลิก "Add endpoint"**
3. **URL: https://your-app.railway.app/api/webhooks/stripe**
4. **เลือก events:**
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.subscription.deleted`
5. **คลิก "Add endpoint"**
6. **คัดลอก Webhook secret**
7. **ไปที่ Railway Variables และอัปเดต:**
   ```
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   ```

### ขั้นตอนที่ 5: ตั้งค่า Email Service

#### 5.1 ตั้งค่า Gmail App Password
1. **เปิด Gmail**
2. **ไปที่ Google Account Settings**
3. **Security > 2-Step Verification**
4. **App passwords > Mail**
5. **สร้าง password ใหม่**
6. **คัดลอก password**

#### 5.2 ตั้งค่าใน Railway
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### ขั้นตอนที่ 6: ตั้งค่า Google OAuth

#### 6.1 สร้าง Google Cloud Project
1. **ไปที่ [console.cloud.google.com](https://console.cloud.google.com)**
2. **สร้างโปรเจ็กต์ใหม่**
3. **เปิดใช้งาน Google+ API**

#### 6.2 สร้าง OAuth Credentials
1. **ไปที่ Credentials > Create Credentials > OAuth 2.0 Client IDs**
2. **Application type: Web application**
3. **Authorized redirect URIs:**
   - `https://your-app.railway.app/api/auth/gmail/callback`
4. **คัดลอก Client ID และ Client Secret**

#### 6.3 ตั้งค่าใน Railway
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://your-app.railway.app/api/auth/gmail/callback
```

### ขั้นตอนที่ 7: ตั้งค่า Google AI API

#### 7.1 สร้าง Google AI API Key
1. **ไปที่ [aistudio.google.com](https://aistudio.google.com)**
2. **คลิก "Get API Key"**
3. **สร้าง API Key ใหม่**
4. **คัดลอก API Key**

#### 7.2 ตั้งค่าใน Railway
```
GOOGLE_AI_API_KEY=your-google-ai-api-key
```

## 🎉 เสร็จสิ้น!

หลังจากทำตามขั้นตอนทั้งหมด ระบบ Good Content จะพร้อมใช้งานบน Railway แล้ว!

### URLs ที่จะได้:
- **Main App**: `https://your-app.railway.app/Prompt Template Lab.html`
- **Login**: `https://your-app.railway.app/auth.html`
- **Admin**: `https://your-app.railway.app/admin.html`
- **API**: `https://your-app.railway.app/api/health`

### ข้อมูลเข้าสู่ระบบ Admin:
- **Email**: `admin@prompttemplatelab.com`
- **Password**: `admin123456`

## 🔧 การแก้ไขปัญหา

### 1. **Deploy ไม่สำเร็จ**
- ตรวจสอบ logs ใน Railway Dashboard
- ตรวจสอบ Environment Variables
- ตรวจสอบ package.json

### 2. **Database Connection Error**
- ตรวจสอบ MONGODB_URI
- ตรวจสอบ Network Access ใน MongoDB Atlas

### 3. **Stripe ไม่ทำงาน**
- ตรวจสอบ API Keys
- ตรวจสอบ Webhook URL
- ตรวจสอบ Events ที่เลือก

### 4. **Email ไม่ส่ง**
- ตรวจสอบ Gmail App Password
- ตรวจสอบ 2-Factor Authentication
- ตรวจสอบ SMTP Settings

## 📊 การ Monitor

### 1. **Railway Dashboard**
- ดู logs
- ดู performance
- ดู errors
- ดู metrics

### 2. **Stripe Dashboard**
- ดูการขาย
- ดูรายได้
- ดู customers
- ดู webhooks

### 3. **MongoDB Atlas**
- ดู database usage
- ดู performance
- ดู logs

## 🚀 Next Steps

1. **ทดสอบระบบทั้งหมด**
2. **ตั้งค่า Custom Domain**
3. **เริ่ม Marketing**
4. **เก็บ Feedback**
5. **ปรับปรุงระบบ**

---

**ระบบพร้อมขายแล้ว!** 🎉
