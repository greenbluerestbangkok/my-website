# คู่มือสำหรับผู้พัฒนา - Good Content

## 🏗️ สถาปัตยกรรมระบบ

### Frontend Architecture
```
Frontend (HTML/CSS/JavaScript)
├── auth.html              # ระบบสมัครสมาชิก/เข้าสู่ระบบ
├── dashboard.html         # หน้าจัดการบัญชีผู้ใช้
├── admin.html            # หน้าจัดการแอดมิน
├── Prompt Template Lab.html # แอปหลัก
└── assets/               # ไฟล์ CSS, JS, Images
```

### Backend Architecture
```
Backend (Node.js/Express)
├── server.js             # Main server file
├── payment.js            # Payment processing
├── models/               # Database models
├── routes/               # API routes
├── middleware/           # Custom middleware
├── utils/                # Utility functions
└── tests/                # Test files
```

### Database Schema
```javascript
// User Schema
{
  _id: ObjectId,
  firstname: String,
  lastname: String,
  email: String (unique),
  password: String (hashed, optional for OAuth users),
  phone: String,
  company: String,
  isEmailVerified: Boolean,
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  googleId: String (for Google OAuth),
  provider: String (email, google),
  avatar: String (profile picture URL),
  subscription: {
    plan: String, // 'free', 'basic', 'premium', 'enterprise'
    status: String, // 'active', 'inactive', 'cancelled'
    startDate: Date,
    endDate: Date,
    usage: {
      templatesUsed: Number,
      contentCreated: Number,
      timeSaved: Number
    }
  },
  preferences: {
    language: String,
    timezone: String,
    notifications: {
      email: Boolean,
      push: Boolean
    }
  },
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}

// Usage Schema
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  templateId: String,
  templateName: String,
  contentLength: Number,
  processingTime: Number,
  createdAt: Date
}
```

## 🔧 การพัฒนา

### 1. การตั้งค่า Development Environment

```bash
# Clone repository
git clone <repository-url>
cd good-content

# ติดตั้ง dependencies
cd backend
npm install

# ตั้งค่า environment
cp env.example .env
# แก้ไข .env ตามต้องการ

# เริ่ม MongoDB
mongod

# เริ่ม development server
npm run dev
```

### 2. การตั้งค่า Google OAuth

```javascript
// 1. ติดตั้ง dependencies
npm install passport passport-google-oauth20 express-session

// 2. ตั้งค่าใน server.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');

// 3. ตั้งค่า session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

// 4. ตั้งค่า Passport
app.use(passport.initialize());
app.use(passport.session());

// 5. ตั้งค่า Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_REDIRECT_URI
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // หาผู้ใช้ที่มีอยู่
        let user = await User.findOne({ googleId: profile.id });
        
        if (user) {
            return done(null, user);
        }
        
        // ตรวจสอบว่ามีอีเมลนี้อยู่แล้วหรือไม่
        user = await User.findOne({ email: profile.emails[0].value });
        
        if (user) {
            // เชื่อมต่อบัญชี Google กับบัญชีที่มีอยู่
            user.googleId = profile.id;
            user.provider = 'google';
            user.avatar = profile.photos[0].value;
            await user.save();
            return done(null, user);
        }
        
        // สร้างผู้ใช้ใหม่
        user = new User({
            googleId: profile.id,
            firstname: profile.name.givenName,
            lastname: profile.name.familyName,
            email: profile.emails[0].value,
            provider: 'google',
            avatar: profile.photos[0].value,
            isEmailVerified: true
        });
        
        await user.save();
        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
}));

// 6. Serialization
passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});
```

### 3. การเพิ่ม Feature ใหม่

#### Frontend
1. สร้าง HTML file ใหม่
2. เพิ่ม CSS styling
3. เพิ่ม JavaScript logic
4. เชื่อมต่อกับ API

#### Backend
1. สร้าง route ใหม่ใน `server.js`
2. เพิ่ม validation
3. เพิ่ม error handling
4. เพิ่ม tests

### 4. การเพิ่ม API Endpoint

```javascript
// ตัวอย่างการเพิ่ม endpoint ใหม่
app.post('/api/new-endpoint', authenticateToken, async (req, res) => {
    try {
        // 1. Validate input
        const { param1, param2 } = req.body;
        if (!param1 || !param2) {
            return res.status(400).json({
                success: false,
                message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
            });
        }

        // 2. Business logic
        const result = await someFunction(param1, param2);

        // 3. Return response
        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('New endpoint error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในระบบ'
        });
    }
});
```

### 5. การเพิ่ม Database Model

```javascript
// ตัวอย่างการเพิ่ม model ใหม่
const newModelSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
});

const NewModel = mongoose.model('NewModel', newModelSchema);
```

## 🧪 การทดสอบ

### 1. Unit Tests

```javascript
// tests/user.test.js
const request = require('supertest');
const app = require('../server');

describe('User API', () => {
    test('POST /api/auth/register - should create new user', async () => {
        const userData = {
            firstname: 'Test',
            lastname: 'User',
            email: 'test@example.com',
            password: 'password123'
        };

        const response = await request(app)
            .post('/api/auth/register')
            .send(userData);

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
    });
});
```

### 2. Integration Tests

```javascript
// tests/integration.test.js
describe('Authentication Flow', () => {
    test('Complete registration and login flow', async () => {
        // 1. Register user
        const registerResponse = await request(app)
            .post('/api/auth/register')
            .send(userData);

        expect(registerResponse.status).toBe(201);

        // 2. Login user
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({
                email: userData.email,
                password: userData.password
            });

        expect(loginResponse.status).toBe(200);
        expect(loginResponse.body.token).toBeDefined();
    });
});
```

### 3. การรัน Tests

```bash
# รัน tests ทั้งหมด
npm test

# รัน tests แบบ watch mode
npm run test:watch

# รัน tests พร้อม coverage
npm run test:coverage
```

## 🔒 Security Best Practices

### 1. Input Validation

```javascript
const { body, validationResult } = require('express-validator');

// Validation middleware
const validateUser = [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
    body('firstname').trim().isLength({ min: 1, max: 50 }),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'ข้อมูลไม่ถูกต้อง',
                errors: errors.array()
            });
        }
        next();
    }
];
```

### 2. Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

// Different rate limits for different endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: 'Too many login attempts, please try again later'
});

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100 // 100 requests per window
});

app.use('/api/auth/login', authLimiter);
app.use('/api/', apiLimiter);
```

### 3. Password Security

```javascript
const bcrypt = require('bcryptjs');

// Hash password
const saltRounds = 12;
const hashedPassword = await bcrypt.hash(password, saltRounds);

// Compare password
const isMatch = await bcrypt.compare(candidatePassword, hashedPassword);
```

## 📊 Monitoring & Logging

### 1. Logging

```javascript
const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

// Usage
logger.info('User registered', { userId: user._id, email: user.email });
logger.error('Database connection failed', { error: error.message });
```

### 2. Health Checks

```javascript
app.get('/api/health', async (req, res) => {
    const health = {
        uptime: process.uptime(),
        message: 'OK',
        timestamp: Date.now(),
        database: 'unknown'
    };

    try {
        // Check database connection
        await mongoose.connection.db.admin().ping();
        health.database = 'connected';
    } catch (error) {
        health.database = 'disconnected';
        health.message = 'Database connection failed';
    }

    res.status(health.database === 'connected' ? 200 : 503).json(health);
});
```

## 🚀 Performance Optimization

### 1. Database Indexing

```javascript
// Add indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ 'subscription.plan': 1 });
userSchema.index({ createdAt: -1 });

usageSchema.index({ userId: 1, createdAt: -1 });
usageSchema.index({ templateId: 1 });
```

### 2. Caching

```javascript
const redis = require('redis');
const client = redis.createClient();

// Cache user data
const getUserFromCache = async (userId) => {
    const cached = await client.get(`user:${userId}`);
    return cached ? JSON.parse(cached) : null;
};

const setUserCache = async (userId, userData) => {
    await client.setex(`user:${userId}`, 3600, JSON.stringify(userData));
};
```

### 3. API Response Optimization

```javascript
// Pagination
app.get('/api/users', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
        .skip(skip)
        .limit(limit)
        .select('-password') // Exclude password
        .sort({ createdAt: -1 });

    const total = await User.countDocuments();

    res.json({
        success: true,
        data: users,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    });
});
```

## 🔄 CI/CD Pipeline

### 1. GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: |
        cd backend
        npm ci
        
    - name: Run tests
      run: |
        cd backend
        npm test
        
    - name: Run linting
      run: |
        cd backend
        npm run lint

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Deploy to Heroku
      uses: akhileshns/heroku-deploy@v3.12.12
      with:
        heroku_api_key: ${{secrets.HEROKU_API_KEY}}
        heroku_app_name: "your-app-name"
        heroku_email: "your-email@example.com"
```

### 2. Environment Management

```bash
# Development
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/prompt-template-lab-dev

# Staging
NODE_ENV=staging
MONGODB_URI=mongodb://localhost:27017/prompt-template-lab-staging

# Production
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/prompt-template-lab
```

## 📱 Mobile App Integration

### 1. API for Mobile

```javascript
// Mobile-specific endpoints
app.get('/api/mobile/user/profile', authenticateToken, (req, res) => {
    res.json({
        success: true,
        user: {
            id: req.user._id,
            name: `${req.user.firstname} ${req.user.lastname}`,
            email: req.user.email,
            subscription: req.user.subscription.plan,
            avatar: req.user.avatar || null
        }
    });
});
```

### 2. Push Notifications

```javascript
const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./path/to/serviceAccountKey.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

// Send push notification
const sendPushNotification = async (token, title, body) => {
    const message = {
        notification: { title, body },
        token: token
    };

    try {
        const response = await admin.messaging().send(message);
        console.log('Successfully sent message:', response);
    } catch (error) {
        console.error('Error sending message:', error);
    }
};
```

## 🔧 Debugging

### 1. Debug Mode

```javascript
// Enable debug mode
if (process.env.NODE_ENV === 'development') {
    app.use(require('morgan')('dev'));
    mongoose.set('debug', true);
}
```

### 2. Error Tracking

```javascript
const Sentry = require('@sentry/node');

Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV
});

app.use(Sentry.requestHandler());
app.use(Sentry.errorHandler());
```

## 📚 Resources

### 1. Documentation
- [Express.js](https://expressjs.com/)
- [MongoDB](https://docs.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)
- [Stripe API](https://stripe.com/docs/api)

### 2. Tools
- [Postman](https://www.postman.com/) - API testing
- [MongoDB Compass](https://www.mongodb.com/products/compass) - Database GUI
- [VS Code](https://code.visualstudio.com/) - Code editor

### 3. Best Practices
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [REST API Design](https://restfulapi.net/)
- [Security Guidelines](https://owasp.org/www-project-top-ten/)

## 🆕 การเปลี่ยนแปลงล่าสุด

### v2.0.0 - Good Content Update

#### 1. เปลี่ยนชื่อระบบ
- เปลี่ยนจาก "Prompt Template Lab" เป็น "Good Content"
- อัปเดต title และ meta tags ในทุกหน้า
- ปรับปรุง branding และ UI

#### 2. Google OAuth Integration
- เพิ่มการสมัครสมาชิกและเข้าสู่ระบบด้วย Gmail
- ใช้ Passport.js สำหรับ OAuth flow
- รองรับการเชื่อมต่อบัญชี Google กับบัญชีที่มีอยู่

#### 3. Template Access Control
- Basic users สามารถดูเทมเพลตได้ทั้งหมด
- แสดงข้อความแนะนำให้อัปเกรดเมื่อใช้งานเทมเพลตที่ล็อค
- ปรับปรุง UX สำหรับการแสดงสิทธิ์การใช้งาน

#### 4. Platform Icons
- เพิ่มไอคอนแพลตฟอร์มสำหรับเทมเพลต
- รองรับ X (Twitter), Facebook, Instagram, YouTube, TikTok
- แสดงไอคอนในหน้า Library และ Detail

#### 5. UI/UX Improvements
- ย้ายสัญลักษณ์ล็อคไปหน้าชื่อเทมเพลต
- ปรับปรุงการแสดงผลในหน้า Login
- เพิ่มปุ่มกลับหน้าแรกในทุกหน้า

#### 6. Security Enhancements
- เพิ่ม session management
- ปรับปรุงการจัดการ OAuth tokens
- เพิ่มการตรวจสอบสิทธิ์การใช้งาน

### v1.5.0 - Template System
- ระบบควบคุมการเข้าถึงเทมเพลต
- การแสดงสัญลักษณ์ล็อค
- ระบบแนะนำให้อัปเกรด

### v1.0.0 - Initial Release
- ระบบสมาชิกพื้นฐาน
- ระบบการชำระเงิน
- Dashboard และการจัดการบัญชี

## 🔧 การแก้ไขปัญหา

### Google OAuth ไม่ทำงาน
1. ตรวจสอบ Google Cloud Console settings
2. ตรวจสอบ redirect URI
3. ตรวจสอบ environment variables
4. ดู console logs สำหรับ error messages

### Template Access Issues
1. ตรวจสอบ user subscription plan
2. ตรวจสอบ template permissions
3. ตรวจสอบ frontend logic

### Platform Icons ไม่แสดง
1. ตรวจสอบ template platform mapping
2. ตรวจสอบ platformIcons object
3. ตรวจสอบ getPlatformIcons function

---

**หมายเหตุ:** คู่มือนี้จะอัปเดตตามการพัฒนาของระบบ หากมีคำถามหรือข้อเสนอแนะ กรุณาติดต่อทีมพัฒนา
