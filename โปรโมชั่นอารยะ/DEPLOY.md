# 🚀 Deploy สยามอารยะ บน Netlify + Supabase

## ขั้นตอนที่ 1: สร้าง Supabase Project

1. ไปที่ <https://supabase.com>
2. Sign up / Login (ใช้ GitHub account ได้)
3. กด "New Project"
   - Organization: สร้างใหม่หรือเลือก existing
   - Name: `siam-araya-shop`
   - Database Password: ตั้งรหัสที่จำได้
   - Region: `Southeast Asia (Singapore)`
4. รอ 2-3 นาที ให้ Database สร้างเสร็จ

## ขั้นตอนที่ 2: Run SQL Schema

1. ใน Supabase Dashboard → ไปที่ **SQL Editor**
2. กด "+ New Query"
3. คัดลอกเนื้อหาจากไฟล์ `supabase-schema.sql`
4. Paste แล้วกด **RUN**
5. ตรวจสอบว่า Tables ถูกสร้างแล้วที่ **Table Editor**

## ขั้นตอนที่ 3: เก็บ API Keys

1. ใน Supabase Dashboard → ไปที่ **Settings > API**
2. คัดลอกข้อมูลเหล่านี้:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...`
   - **service_role key**: `eyJhbGc...` (ใช้แค่ฝั่ง server)

## ขั้นตอนที่ 4: Deploy บน Netlify

### 4.1 สร้าง GitHub Repository (หากยังไม่มี)

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/siam-araya.git
git push -u origin main
```

### 4.2 Deploy ผ่าน Netlify Dashboard

1. ไปที่ <https://app.netlify.com>
2. กด "Add new site" → "Import an existing project"
3. เลือก "Deploy with GitHub"
4. เลือก Repository `siam-araya`
5. Configure Build Settings:
   - **Build command**: `npm install`
   - **Publish directory**: `public`
   - **Functions directory**: `netlify/functions`

### 4.3 ตั้งค่า Environment Variables

ใน Netlify Dashboard → Site settings → Environment variables

เพิ่ม variables เหล่านี้:

```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc...
SESSION_SECRET=random-secret-key-here
```

6. กด "Deploy site"

## ขั้นตอนที่ 5: ทดสอบเว็บไซต์

1. รอ Deploy เสร็จ (ประมาณ 1-2 นาที)
2. เปิดลิงก์ที่ Netlify ให้มา (เช่น `https://siam-araya.netlify.app`)
3. ทดสอบฟีเจอร์:
   - ✅ ดู Gift Voucher
   - ✅ สมัครสมาชิก
   - ✅ เข้าสู่ระบบ
   - ✅ ซื้อสินค้า

## 🎉 เสร็จสิ้น

เว็บไซต์ของคุณพร้อมใช้งานแล้ว

---

## 📝 หมายเหตุ

- **Admin Panel**: ไปที่ `https://your-site.netlify.app/admin.html`
- **ฐานข้อมูล**: จัดการได้ที่ Supabase Dashboard
- **Logs**: ดูได้ที่ Netlify Dashboard → Functions

## 🔧 หากมีปัญหา

1. ตรวจสอบ Environment Variables ว่าถูกต้อง
2. ดู Logs ที่ Netlify → Functions
3. ตรวจสอบ SQL Schema ว่ารันสำเร็จ
