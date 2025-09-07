# คู่มือการตั้งค่า Google AI API Key

## 🎯 ภาพรวม

Google AI API Key เป็นกุญแจสำคัญในการใช้งาน Google Gemini AI models ในระบบ Prompt Template Lab โดยจะใช้สำหรับการสร้างเนื้อหาต่างๆ ตามเทมเพลตที่กำหนด

## 🔑 วิธีสร้าง Google AI API Key

### ขั้นตอนที่ 1: เข้าสู่ Google AI Studio

1. **เปิดเบราว์เซอร์** และไปที่ [Google AI Studio](https://aistudio.google.com)
2. **คลิกที่ "Get API Key"** หรือไปที่ [API Keys page](https://aistudio.google.com/app/apikey) โดยตรง

### ขั้นตอนที่ 2: เข้าสู่ระบบ

1. **คลิก "Sign in"** หรือ "เข้าสู่ระบบ"
2. **ใช้บัญชี Google** ของคุณเข้าสู่ระบบ
   - หากยังไม่มีบัญชี Google ให้สร้างใหม่ที่ [accounts.google.com](https://accounts.google.com)
3. **ยอมรับข้อกำหนดการใช้งาน** หากมี

### ขั้นตอนที่ 3: สร้าง API Key

1. **คลิก "Create API Key"** หรือ "สร้าง API Key"
2. **เลือกโปรเจ็กต์ Google Cloud**:
   - หากมีโปรเจ็กต์อยู่แล้ว ให้เลือกโปรเจ็กต์ที่ต้องการ
   - หากยังไม่มี ให้คลิก "Create a new project" และตั้งชื่อโปรเจ็กต์
3. **ตั้งชื่อ API Key** (เช่น "Prompt Template Lab API Key")
4. **คลิก "Create"** หรือ "สร้าง"

### ขั้นตอนที่ 4: คัดลอก API Key

1. **คัดลอก API Key** ที่แสดงขึ้นมา
2. **เก็บ API Key ไว้อย่างปลอดภัย** - อย่าแชร์ให้ผู้อื่น
3. **บันทึก API Key** ไว้ในที่ปลอดภัย

## 💻 วิธีใช้ API Key ในระบบ

### สำหรับผู้ใช้ทั่วไป

1. **เปิดระบบ Prompt Template Lab**
2. **วาง API Key** ในช่อง "Google AI API Key"
3. **คลิก "บันทึก"** หรือ "Save"
4. **เริ่มใช้งาน** ระบบได้ทันที

### สำหรับผู้พัฒนา

1. **สร้างไฟล์ `.env`** ในโฟลเดอร์ `backend/`
2. **เพิ่ม API Key** ในไฟล์ `.env`:
   ```env
   GOOGLE_AI_API_KEY=your-google-ai-api-key-here
   ```
3. **รีสตาร์ทเซิร์ฟเวอร์** เพื่อให้การตั้งค่าใหม่มีผล

## 🔒 ความปลอดภัย

### ข้อมูลสำคัญ

- **API Key จะถูกเก็บไว้ในเบราว์เซอร์เท่านั้น** - ไม่ส่งไปยังเซิร์ฟเวอร์อื่น
- **อย่าแชร์ API Key** ให้ผู้อื่น
- **อย่าใส่ API Key** ในโค้ดที่เปิดเผยต่อสาธารณะ
- **ตรวจสอบการใช้งาน** เป็นประจำใน Google Cloud Console

### การจัดการ API Key

1. **เปลี่ยน API Key** หากสงสัยว่าถูกแชร์
2. **ลบ API Key เก่า** ที่ไม่ได้ใช้แล้ว
3. **ตั้งค่าขีดจำกัด** การใช้งานหากต้องการ

## 💰 ราคาและขีดจำกัด

### ราคา

- **ฟรี** สำหรับการใช้งานในระดับเริ่มต้น
- **ดูรายละเอียดราคา** ที่ [Google AI Pricing](https://ai.google.dev/pricing)

### ขีดจำกัด

- **15 requests per minute** สำหรับการใช้งานทั่วไป
- **1 million tokens per minute** สำหรับการประมวลผล
- **ดูขีดจำกัดทั้งหมด** ที่ [Quotas & Limits](https://ai.google.dev/gemini-api/docs/quotas)

## 🛠️ การแก้ไขปัญหา

### ปัญหาที่พบบ่อย

#### 1. API Key ไม่ทำงาน

**สาเหตุที่เป็นไปได้:**
- API Key ไม่ถูกต้อง
- API Key หมดอายุ
- ยังไม่ได้เปิดใช้งาน Gemini API

**วิธีแก้ไข:**
1. ตรวจสอบ API Key ว่าถูกต้อง
2. สร้าง API Key ใหม่
3. ตรวจสอบใน Google Cloud Console ว่าเปิดใช้งาน Gemini API แล้ว

#### 2. ข้อผิดพลาด "Quota exceeded"

**สาเหตุ:**
- ใช้ API เกินขีดจำกัดที่กำหนด

**วิธีแก้ไข:**
1. รอให้ขีดจำกัดรีเซ็ต (15 นาที)
2. อัปเกรดแผนการใช้งาน
3. ตรวจสอบการใช้งานใน Google Cloud Console

#### 3. ข้อผิดพลาด "API key not valid"

**สาเหตุ:**
- API Key ไม่ถูกต้องหรือหมดอายุ

**วิธีแก้ไข:**
1. ตรวจสอบ API Key ว่าถูกต้อง
2. สร้าง API Key ใหม่
3. ตรวจสอบว่า API Key ยังไม่หมดอายุ

### การตรวจสอบสถานะ API

1. **ไปที่ Google Cloud Console**
2. **เลือกโปรเจ็กต์** ที่ใช้ API Key
3. **ไปที่ "APIs & Services" > "Credentials"**
4. **ตรวจสอบ API Key** และสถานะการใช้งาน

## 📚 ข้อมูลเพิ่มเติม

### ลิงค์ที่เป็นประโยชน์

- [Google AI Studio](https://aistudio.google.com) - สร้างและจัดการ API Keys
- [Google AI Documentation](https://ai.google.dev/docs) - คู่มือการใช้งาน
- [Google Cloud Console](https://console.cloud.google.com) - จัดการโปรเจ็กต์และ API
- [Gemini API Pricing](https://ai.google.dev/pricing) - ราคาและขีดจำกัด
- [Gemini API Quotas](https://ai.google.dev/gemini-api/docs/quotas) - ขีดจำกัดการใช้งาน

### การสนับสนุน

หากมีปัญหาหรือคำถามเกี่ยวกับ Google AI API:

1. **ตรวจสอบ Documentation** ของ Google AI
2. **ดูใน Google Cloud Console** สำหรับข้อมูลการใช้งาน
3. **ติดต่อ Google Support** หากเป็นปัญหาทางเทคนิค
4. **ตรวจสอบ Community Forums** สำหรับคำตอบจากผู้ใช้คนอื่น

---

**หมายเหตุ:** คู่มือนี้จะอัปเดตตามการเปลี่ยนแปลงของ Google AI API หากมีคำถามเพิ่มเติม กรุณาติดต่อทีมพัฒนา
