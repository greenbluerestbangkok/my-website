# 🚀 คู่มือ Deploy Good Content ขึ้นเว็บจริง

## 📋 ภาพรวม

คู่มือนี้จะแนะนำวิธีการ Deploy ระบบ Good Content ขึ้นเว็บจริงแบบครบถ้วน

## 🎯 ตัวเลือกการ Deploy

### 1. **VPS/Cloud Server (แนะนำ)**
- **DigitalOcean Droplet**
- **AWS EC2**
- **Google Cloud Platform**
- **Linode**
- **Vultr**

### 2. **Platform as a Service (PaaS)**
- **Heroku**
- **Railway**
- **Render**
- **Vercel**

### 3. **Container Platforms**
- **Docker + VPS**
- **Kubernetes**

---

## 🖥️ วิธีที่ 1: Deploy บน VPS/Cloud Server

### ขั้นตอนที่ 1: เตรียม VPS

#### 1.1 สร้าง VPS
```bash
# ตัวอย่าง: DigitalOcean Droplet
# - OS: Ubuntu 22.04 LTS
# - Size: 2GB RAM, 1 CPU (ขั้นต่ำ)
# - Storage: 25GB SSD
```

#### 1.2 เชื่อมต่อ VPS
```bash
ssh root@your-server-ip
```

#### 1.3 อัปเดตระบบ
```bash
apt update && apt upgrade -y
```

#### 1.4 ติดตั้ง Node.js
```bash
# ติดตั้ง Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# ตรวจสอบเวอร์ชัน
node --version
npm --version
```

#### 1.5 ติดตั้ง PM2 (Process Manager)
```bash
npm install -g pm2
```

#### 1.6 ติดตั้ง Nginx (Reverse Proxy)
```bash
apt install nginx -y
systemctl start nginx
systemctl enable nginx
```

#### 1.7 ติดตั้ง MongoDB
```bash
# ติดตั้ง MongoDB Community Edition
wget -qO - https://www.mongodb.org/static/asc/archive-key.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt update
apt install -y mongodb-org
systemctl start mongod
systemctl enable mongod
```

### ขั้นตอนที่ 2: Deploy Application

#### 2.1 Clone Repository
```bash
# สร้าง directory
mkdir -p /var/www/good-content
cd /var/www/good-content

# Clone code (หรือ upload ไฟล์)
git clone https://github.com/yourusername/good-content.git .
# หรือ
# scp -r /path/to/local/project/* root@your-server-ip:/var/www/good-content/
```

#### 2.2 ตั้งค่า Environment Variables
```bash
cd backend
cp .env.production .env

# แก้ไขไฟล์ .env
nano .env
```

**ตัวอย่าง .env สำหรับ Production:**
```env
NODE_ENV=production
PORT=8080
MONGODB_URI=mongodb://localhost:27017/good-content
JWT_SECRET=your-super-secure-jwt-secret-key-here
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
FRONTEND_URL=https://yourdomain.com
CORS_ORIGIN=https://yourdomain.com
```

#### 2.3 ติดตั้ง Dependencies
```bash
npm install --production
```

#### 2.4 เริ่ม Application
```bash
# ใช้ PM2
pm2 start server.js --name "good-content" --env production
pm2 save
pm2 startup

# ตรวจสอบสถานะ
pm2 status
pm2 logs good-content
```

### ขั้นตอนที่ 3: ตั้งค่า Nginx

#### 3.1 สร้าง Nginx Config
```bash
nano /etc/nginx/sites-available/good-content
```

**เนื้อหาไฟล์:**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;

    # Main application
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        proxy_pass http://localhost:8080;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### 3.2 เปิดใช้งาน Site
```bash
ln -s /etc/nginx/sites-available/good-content /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### ขั้นตอนที่ 4: ตั้งค่า SSL (HTTPS)

#### 4.1 ติดตั้ง Certbot
```bash
apt install certbot python3-certbot-nginx -y
```

#### 4.2 ขอ SSL Certificate
```bash
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

#### 4.3 ตั้งค่า Auto-renewal
```bash
crontab -e
# เพิ่มบรรทัดนี้:
0 12 * * * /usr/bin/certbot renew --quiet
```

---

## ☁️ วิธีที่ 2: Deploy บน Heroku

### ขั้นตอนที่ 1: เตรียม Application

#### 1.1 สร้างไฟล์ Procfile
```bash
echo "web: node backend/server.js" > Procfile
```

#### 1.2 สร้างไฟล์ app.json
```json
{
  "name": "good-content",
  "description": "Good Content - AI Content Generation Platform",
  "repository": "https://github.com/yourusername/good-content",
  "logo": "https://yourdomain.com/logo.png",
  "keywords": ["node", "express", "ai", "content", "generation"],
  "image": "heroku/nodejs",
  "stack": "heroku-22",
  "buildpacks": [
    {
      "url": "heroku/nodejs"
    }
  ],
  "env": {
    "NODE_ENV": {
      "description": "Environment",
      "value": "production"
    },
    "PORT": {
      "description": "Port",
      "value": "8080"
    }
  },
  "formation": {
    "web": {
      "quantity": 1,
      "size": "basic"
    }
  }
}
```

### ขั้นตอนที่ 2: Deploy บน Heroku

#### 2.1 ติดตั้ง Heroku CLI
```bash
# macOS
brew install heroku/brew/heroku

# Ubuntu
curl https://cli-assets.heroku.com/install.sh | sh
```

#### 2.2 Login และสร้าง App
```bash
heroku login
heroku create good-content-app
```

#### 2.3 ตั้งค่า Environment Variables
```bash
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your-mongodb-atlas-uri
heroku config:set JWT_SECRET=your-jwt-secret
heroku config:set EMAIL_HOST=smtp.gmail.com
heroku config:set EMAIL_USER=your-email@gmail.com
heroku config:set EMAIL_PASS=your-app-password
heroku config:set STRIPE_SECRET_KEY=your-stripe-secret
heroku config:set FRONTEND_URL=https://good-content-app.herokuapp.com
heroku config:set CORS_ORIGIN=https://good-content-app.herokuapp.com
```

#### 2.4 Deploy
```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

#### 2.5 เปิดใช้งาน
```bash
heroku open
```

---

## 🐳 วิธีที่ 3: Deploy ด้วย Docker

### ขั้นตอนที่ 1: สร้าง Docker Compose
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/good-content
      - JWT_SECRET=your-jwt-secret
    depends_on:
      - mongo
    restart: unless-stopped

  mongo:
    image: mongo:6.0
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  mongo_data:
```

### ขั้นตอนที่ 2: Deploy
```bash
docker-compose up -d
```

---

## 🔧 การตั้งค่าเพิ่มเติม

### 1. **ตั้งค่า Domain Name**

#### 1.1 ซื้อ Domain
- **Namecheap**
- **GoDaddy**
- **Cloudflare**

#### 1.2 ตั้งค่า DNS
```
A Record: @ -> your-server-ip
A Record: www -> your-server-ip
CNAME: api -> your-server-ip
```

### 2. **ตั้งค่า Database (MongoDB Atlas)**

#### 2.1 สร้าง MongoDB Atlas Account
1. ไปที่ [MongoDB Atlas](https://www.mongodb.com/atlas)
2. สร้างบัญชีใหม่
3. สร้าง Cluster ใหม่
4. ตั้งค่า Network Access (0.0.0.0/0)
5. สร้าง Database User
6. คัดลอก Connection String

#### 2.2 ใช้ Connection String
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/good-content
```

### 3. **ตั้งค่า Email Service**

#### 3.1 Gmail App Password
1. เปิด 2-Factor Authentication
2. ไปที่ Google Account Settings
3. Security > 2-Step Verification > App passwords
4. สร้าง password สำหรับ "Mail"

#### 3.2 ใช้ใน Environment
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 4. **ตั้งค่า Stripe**

#### 4.1 สร้าง Stripe Account
1. ไปที่ [Stripe](https://stripe.com)
2. สร้างบัญชีใหม่
3. ไปที่ Dashboard > Developers > API keys
4. คัดลอก Secret key และ Publishable key

#### 4.2 ตั้งค่า Webhook
1. Dashboard > Developers > Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events: `checkout.session.completed`, `invoice.payment_succeeded`
4. คัดลอก Webhook secret

### 5. **ตั้งค่า Google OAuth**

#### 5.1 Google Cloud Console
1. ไปที่ [Google Cloud Console](https://console.cloud.google.com)
2. สร้างโปรเจ็กต์ใหม่
3. เปิดใช้งาน Google+ API
4. ไปที่ Credentials > Create Credentials > OAuth 2.0 Client IDs
5. ตั้งค่า Authorized redirect URIs:
   - `https://yourdomain.com/api/auth/gmail/callback`

---

## 📊 การ Monitor และ Maintenance

### 1. **PM2 Monitoring**
```bash
# ดูสถานะ
pm2 status

# ดู logs
pm2 logs good-content

# Restart
pm2 restart good-content

# Stop
pm2 stop good-content
```

### 2. **Nginx Monitoring**
```bash
# ดู logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Test config
nginx -t

# Reload
systemctl reload nginx
```

### 3. **Database Monitoring**
```bash
# เชื่อมต่อ MongoDB
mongo

# ดู databases
show dbs

# ใช้ database
use good-content

# ดู collections
show collections
```

---

## 🚨 การแก้ไขปัญหา

### 1. **Server ไม่ทำงาน**
```bash
# ตรวจสอบ PM2
pm2 status

# ดู logs
pm2 logs good-content --lines 100

# Restart
pm2 restart good-content
```

### 2. **Nginx Error**
```bash
# ตรวจสอบ config
nginx -t

# ดู error logs
tail -f /var/log/nginx/error.log
```

### 3. **Database Connection Error**
```bash
# ตรวจสอบ MongoDB
systemctl status mongod

# ดู logs
journalctl -u mongod
```

### 4. **SSL Certificate Error**
```bash
# ตรวจสอบ certificate
certbot certificates

# Renew certificate
certbot renew --dry-run
```

---

## 📈 การ Scale และ Optimization

### 1. **เพิ่ม Server Resources**
- เพิ่ม RAM และ CPU
- ใช้ Load Balancer
- ตั้งค่า CDN

### 2. **Database Optimization**
- ใช้ MongoDB Atlas
- ตั้งค่า Indexes
- ใช้ Connection Pooling

### 3. **Caching**
- ใช้ Redis
- ตั้งค่า Nginx Caching
- ใช้ CDN

---

## ✅ Checklist ก่อน Deploy

- [ ] ตั้งค่า Environment Variables
- [ ] ตั้งค่า Database
- [ ] ตั้งค่า Email Service
- [ ] ตั้งค่า Stripe
- [ ] ตั้งค่า Google OAuth
- [ ] ตั้งค่า Domain และ DNS
- [ ] ตั้งค่า SSL Certificate
- [ ] ทดสอบ Application
- [ ] ตั้งค่า Monitoring
- [ ] ตั้งค่า Backup

---

## 🎉 เสร็จสิ้น!

หลังจากทำตามขั้นตอนทั้งหมด ระบบ Good Content จะพร้อมใช้งานบนเว็บจริงแล้ว!

**URLs ที่จะได้:**
- **Main App**: `https://yourdomain.com/Prompt Template Lab.html`
- **Login**: `https://yourdomain.com/auth.html`
- **Admin**: `https://yourdomain.com/admin.html`
- **API**: `https://yourdomain.com/api/health`

**ข้อมูลเข้าสู่ระบบ Admin:**
- อีเมล: `admin@prompttemplatelab.com`
- รหัสผ่าน: `admin123456`

---

## 📞 การสนับสนุน

หากมีปัญหาหรือคำถาม สามารถติดต่อได้ที่:
- **Email**: support@goodcontent.com
- **Documentation**: [GitHub Repository](https://github.com/yourusername/good-content)
- **Issues**: [GitHub Issues](https://github.com/yourusername/good-content/issues)

## 🚀 **แนะนำ Platform ที่ดีที่สุดสำหรับการขาย**

### 🥇 **ตัวเลือกที่ 1: Railway (แนะนำที่สุด)**

**ทำไม Railway ดีที่สุด:**
- ✅ **ง่ายที่สุด** - Deploy ใน 5 นาที
- ✅ **ฟรี** - $5 credit ต่อเดือน
- ✅ **Auto-deploy** - เชื่อม Git ได้เลย
- ✅ **Database** - มี PostgreSQL/MongoDB ให้
- ✅ **Custom Domain** - ใช้ domain ตัวเองได้
- ✅ **SSL** - HTTPS ฟรี
- ✅ **Scaling** - ขยายได้อัตโนมัติ

**วิธี Deploy:**
```bash
<code_block_to_apply_changes_from>
```

---

### 🥈 **ตัวเลือกที่ 2: Render**

**ข้อดี:**
- ✅ **ฟรี** - 750 ชั่วโมง/เดือน
- ✅ **Auto-deploy** - เชื่อม Git
- ✅ **Database** - มี MongoDB ให้
- ✅ **Custom Domain** - ฟรี
- ✅ **SSL** - HTTPS ฟรี

**วิธี Deploy:**
```bash
# 1. ไปที่ render.com
# 2. New > Web Service
# 3. Connect GitHub
# 4. ตั้งค่า Environment Variables
# 5. Deploy!
```

---

### 🥉 **ตัวเลือกที่ 3: Vercel**

**ข้อดี:**
- ✅ **เร็วที่สุด** - CDN ทั่วโลก
- ✅ **ฟรี** - 100GB bandwidth/เดือน
- ✅ **Auto-deploy** - เชื่อม Git
- ✅ **Custom Domain** - ฟรี
- ✅ **SSL** - HTTPS ฟรี

---

## 💰 **แนะนำสำหรับการขาย**

### **1. Railway + Stripe (แนะนำที่สุด)**

**ทำไมดีที่สุด:**
- 💳 **Stripe** - รับเงินได้ทันที
- 🔒 **ปลอดภัย** - HTTPS + Security headers
- 📊 **Monitor** - ดู logs ได้
- 💰 **ราคาถูก** - $5/เดือน

**ขั้นตอน:**
1. **Deploy บน Railway** (5 นาที)
2. **ตั้งค่า Stripe** (10 นาที)
3. **ซื้อ Domain** (5 นาที)
4. **เริ่มขายได้เลย!**

---

## 🛠️ **เตรียมไฟล์สำหรับ Railway**

### 1. **สร้างไฟล์ railway.json**
