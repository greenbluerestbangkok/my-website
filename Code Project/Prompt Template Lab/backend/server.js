const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const morgan = require('morgan');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

// CORS Configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:8080',
    credentials: true
}));

app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'คำขอมากเกินไป กรุณาลองใหม่ในภายหลัง'
    }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 auth requests per windowMs
    message: {
        success: false,
        message: 'พยายามเข้าสู่ระบบมากเกินไป กรุณาลองใหม่ใน 15 นาที'
    }
});

app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);

// Serve static files from parent directory
app.use(express.static('../'));

// Email Service Configuration
const createEmailTransporter = () => {
    if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT || 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }
    return null;
};

const emailTransporter = createEmailTransporter();

// Email sending function
const sendEmail = async (to, subject, html) => {
    if (!emailTransporter) {
        console.log('Email service not configured. Email would be sent to:', to);
        console.log('Subject:', subject);
        console.log('Content:', html);
        return true;
    }

    try {
        await emailTransporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            html
        });
        return true;
    } catch (error) {
        console.error('Email sending failed:', error);
        return false;
    }
};

// Remove duplicate limiter - already defined above
app.use('/api/', limiter);

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/prompt-template-lab', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// User Schema
const userSchema = new mongoose.Schema({
    firstname: { type: String, required: true, trim: true },
    lastname: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, minlength: 8 }, // Made optional for OAuth users
    phone: { type: String, trim: true },
    company: { type: String, trim: true },
    role: { type: String, enum: ['user', 'admin', 'enterprise'], default: 'user' },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: String,
    passwordResetToken: String,
    passwordResetExpires: Date,
    // OAuth fields
    googleId: String,
    provider: { type: String, enum: ['local', 'google'], default: 'local' },
    avatar: String,
    subscription: {
        plan: { type: String, enum: ['basic', 'pro', 'enterprise'], default: 'basic' },
        status: { type: String, enum: ['active', 'inactive', 'cancelled'], default: 'active' },
        startDate: { type: Date, default: Date.now },
        endDate: Date,
        credits: {
            total: { type: Number, default: 5 }, // Basic = 5 credits, Pro = unlimited
            used: { type: Number, default: 0 },
            resetDate: { type: Date, default: Date.now }
        },
        usage: {
            templatesUsed: { type: Number, default: 0 },
            contentCreated: { type: Number, default: 0 },
            timeSaved: { type: Number, default: 0 } // in hours
        }
    },
    preferences: {
        language: { type: String, default: 'th' },
        timezone: { type: String, default: 'Asia/Bangkok' },
        notifications: {
            email: { type: Boolean, default: true },
            push: { type: Boolean, default: true }
        }
    },
    lastLogin: Date,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password') || !this.password) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token
userSchema.methods.generateAuthToken = function() {
    return jwt.sign(
        { 
            userId: this._id, 
            email: this.email,
            role: this.role,
            subscription: this.subscription.plan
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
    );
};

const User = mongoose.model('User', userSchema);

// Usage tracking schema
const usageSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    templateId: { type: String, required: true },
    templateName: { type: String, required: true },
    contentLength: { type: Number, required: true },
    processingTime: { type: Number, required: true }, // in seconds
    createdAt: { type: Date, default: Date.now }
});

const Usage = mongoose.model('Usage', usageSchema);

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Access token required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User.findById(decoded.userId);
        
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid token' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    }
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Server is running', timestamp: new Date() });
});

// Register
app.post('/api/auth/register', [
    body('firstname').trim().isLength({ min: 1 }).withMessage('ชื่อเป็นข้อมูลที่จำเป็น'),
    body('lastname').trim().isLength({ min: 1 }).withMessage('นามสกุลเป็นข้อมูลที่จำเป็น'),
    body('email').isEmail().normalizeEmail().withMessage('รูปแบบอีเมลไม่ถูกต้อง'),
    body('password').isLength({ min: 8 }).withMessage('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'),
    body('phone').optional().isMobilePhone('th-TH').withMessage('รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง')
], async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'ข้อมูลไม่ถูกต้อง',
                errors: errors.array()
            });
        }

        const { firstname, lastname, email, password, phone, company } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'อีเมลนี้ถูกใช้งานแล้ว'
            });
        }

        // Create new user
        const user = new User({
            firstname,
            lastname,
            email,
            password,
            phone,
            company
        });

        await user.save();

        // Generate verification token
        const verificationToken = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        user.emailVerificationToken = verificationToken;
        await user.save();

        // Send verification email
        const verificationUrl = `${process.env.FRONTEND_URL}/auth.html?verify=${verificationToken}`;
        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #4F46E5;">ยืนยันอีเมลของคุณ</h2>
                <p>สวัสดี ${firstname} ${lastname},</p>
                <p>ขอบคุณที่สมัครสมาชิกกับ Good Content กรุณาคลิกปุ่มด้านล่างเพื่อยืนยันอีเมลของคุณ:</p>
                <a href="${verificationUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">ยืนยันอีเมล</a>
                <p>หรือคัดลอกลิงค์นี้ไปยังเบราว์เซอร์: ${verificationUrl}</p>
                <p>ลิงค์นี้จะหมดอายุใน 24 ชั่วโมง</p>
            </div>
        `;

        await sendEmail(email, 'ยืนยันอีเมล - Good Content', emailHtml);

        res.status(201).json({
            success: true,
            message: 'สมัครสมาชิกสำเร็จ กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี',
            user: {
                id: user._id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการสมัครสมาชิก'
        });
    }
});

// Email Verification
app.get('/api/auth/verify-email', async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Token ไม่ถูกต้อง'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'ไม่พบผู้ใช้'
            });
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        await user.save();

        res.json({
            success: true,
            message: 'ยืนยันอีเมลสำเร็จ'
        });

    } catch (error) {
        console.error('Email verification error:', error);
        res.status(400).json({
            success: false,
            message: 'Token ไม่ถูกต้องหรือหมดอายุ'
        });
    }
});

// Forgot Password
app.post('/api/auth/forgot-password', [
    body('email').isEmail().normalizeEmail().withMessage('รูปแบบอีเมลไม่ถูกต้อง')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'ข้อมูลไม่ถูกต้อง',
                errors: errors.array()
            });
        }

        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'ไม่พบอีเมลนี้ในระบบ'
            });
        }

        // Generate reset token
        const resetToken = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '1h' }
        );

        user.passwordResetToken = resetToken;
        user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await user.save();

        // Send reset email
        const resetUrl = `${process.env.FRONTEND_URL}/auth.html?reset=${resetToken}`;
        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #4F46E5;">รีเซ็ตรหัสผ่าน</h2>
                <p>สวัสดี ${user.firstname} ${user.lastname},</p>
                <p>คุณได้ขอรีเซ็ตรหัสผ่าน กรุณาคลิกปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่:</p>
                <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">รีเซ็ตรหัสผ่าน</a>
                <p>หรือคัดลอกลิงค์นี้ไปยังเบราว์เซอร์: ${resetUrl}</p>
                <p>ลิงค์นี้จะหมดอายุใน 1 ชั่วโมง</p>
                <p>หากคุณไม่ได้ขอรีเซ็ตรหัสผ่าน กรุณาเพิกเฉยต่ออีเมลนี้</p>
            </div>
        `;

        await sendEmail(email, 'รีเซ็ตรหัสผ่าน - Good Content', emailHtml);

        res.json({
            success: true,
            message: 'ส่งลิงค์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว'
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการส่งอีเมล'
        });
    }
});

// Reset Password
app.post('/api/auth/reset-password', [
    body('token').notEmpty().withMessage('Token เป็นข้อมูลที่จำเป็น'),
    body('password').isLength({ min: 8 }).withMessage('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'ข้อมูลไม่ถูกต้อง',
                errors: errors.array()
            });
        }

        const { token, password } = req.body;

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User.findOne({
            _id: decoded.userId,
            passwordResetToken: token,
            passwordResetExpires: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Token ไม่ถูกต้องหรือหมดอายุ'
            });
        }

        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        res.json({
            success: true,
            message: 'รีเซ็ตรหัสผ่านสำเร็จ'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(400).json({
            success: false,
            message: 'Token ไม่ถูกต้องหรือหมดอายุ'
        });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'กรุณากรอกอีเมลและรหัสผ่าน'
            });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate token
        const token = user.generateAuthToken();

        res.json({
            success: true,
            message: 'เข้าสู่ระบบสำเร็จ',
            token,
            user: {
                id: user._id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                role: user.role,
                subscription: user.subscription
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ'
        });
    }
});

// Verify token
app.get('/api/auth/verify', authenticateToken, (req, res) => {
    res.json({
        success: true,
        user: {
            id: req.user._id,
            firstname: req.user.firstname,
            lastname: req.user.lastname,
            email: req.user.email,
            subscription: req.user.subscription
        }
    });
});

// Forgot password
app.post('/api/auth/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'ไม่พบผู้ใช้ที่ใช้อีเมลนี้'
            });
        }

        // Generate reset token
        const resetToken = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '1h' }
        );

        user.passwordResetToken = resetToken;
        user.passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour
        await user.save();

        // TODO: Send reset email
        console.log(`Password reset token for ${email}: ${resetToken}`);

        res.json({
            success: true,
            message: 'ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว'
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการส่งลิงก์รีเซ็ต'
        });
    }
});

// Get user stats
app.get('/api/user/stats', authenticateToken, async (req, res) => {
    try {
        const userId = req.user._id;

        // Get usage statistics
        const usageStats = await Usage.aggregate([
            { $match: { userId: userId } },
            {
                $group: {
                    _id: null,
                    totalTemplates: { $sum: 1 },
                    totalContent: { $sum: '$contentLength' },
                    totalTime: { $sum: '$processingTime' }
                }
            }
        ]);

        const stats = usageStats[0] || {
            totalTemplates: 0,
            totalContent: 0,
            totalTime: 0
        };

        res.json({
            success: true,
            stats: {
                templatesUsed: stats.totalTemplates,
                contentCreated: stats.totalContent,
                timeSaved: Math.round(stats.totalTime / 3600), // Convert to hours
                currentPlan: req.user.subscription.plan
            }
        });

    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการโหลดข้อมูล'
        });
    }
});

// Check credits before usage
app.get('/api/user/credits', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        
        // Reset credits if it's a new month
        const now = new Date();
        const resetDate = new Date(user.subscription.credits.resetDate);
        const isNewMonth = now.getMonth() !== resetDate.getMonth() || now.getFullYear() !== resetDate.getFullYear();
        
        if (isNewMonth && user.subscription.plan === 'basic') {
            user.subscription.credits.used = 0;
            user.subscription.credits.resetDate = now;
            await user.save();
        }

        const remainingCredits = user.subscription.plan === 'pro' ? -1 : (user.subscription.credits.total - user.subscription.credits.used);
        const canUse = user.subscription.plan === 'pro' || remainingCredits > 0;

        res.json({
            success: true,
            credits: {
                total: user.subscription.credits.total,
                used: user.subscription.credits.used,
                remaining: remainingCredits,
                canUse: canUse,
                plan: user.subscription.plan
            }
        });

    } catch (error) {
        console.error('Get credits error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการโหลดข้อมูล Credit'
        });
    }
});

// Use credit
app.post('/api/user/use-credit', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        
        // Check if user can use credit
        if (user.subscription.plan === 'pro') {
            return res.json({
                success: true,
                message: 'Pro plan - ไม่จำกัดการใช้งาน',
                credits: {
                    total: -1,
                    used: user.subscription.credits.used,
                    remaining: -1,
                    canUse: true,
                    plan: user.subscription.plan
                }
            });
        }

        const remainingCredits = user.subscription.credits.total - user.subscription.credits.used;
        
        if (remainingCredits <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Credit หมดแล้ว กรุณาอัปเกรดเป็น Pro plan',
                credits: {
                    total: user.subscription.credits.total,
                    used: user.subscription.credits.used,
                    remaining: 0,
                    canUse: false,
                    plan: user.subscription.plan
                }
            });
        }

        // Use credit
        user.subscription.credits.used += 1;
        await user.save();

        res.json({
            success: true,
            message: 'ใช้ Credit สำเร็จ',
            credits: {
                total: user.subscription.credits.total,
                used: user.subscription.credits.used,
                remaining: user.subscription.credits.total - user.subscription.credits.used,
                canUse: true,
                plan: user.subscription.plan
            }
        });

    } catch (error) {
        console.error('Use credit error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการใช้ Credit'
        });
    }
});

// Track usage
app.post('/api/usage/track', authenticateToken, async (req, res) => {
    try {
        const { templateId, templateName, contentLength, processingTime } = req.body;

        const usage = new Usage({
            userId: req.user._id,
            templateId,
            templateName,
            contentLength,
            processingTime
        });

        await usage.save();

        // Update user subscription usage
        req.user.subscription.usage.templatesUsed += 1;
        req.user.subscription.usage.contentCreated += contentLength;
        req.user.subscription.usage.timeSaved += Math.round(processingTime / 3600);
        await req.user.save();

        res.json({
            success: true,
            message: 'บันทึกการใช้งานสำเร็จ'
        });

    } catch (error) {
        console.error('Track usage error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการบันทึกการใช้งาน'
        });
    }
});

// Get user profile
app.get('/api/user/profile', authenticateToken, (req, res) => {
    res.json({
        success: true,
        user: {
            id: req.user._id,
            firstname: req.user.firstname,
            lastname: req.user.lastname,
            email: req.user.email,
            phone: req.user.phone,
            company: req.user.company,
            subscription: req.user.subscription,
            preferences: req.user.preferences,
            createdAt: req.user.createdAt,
            lastLogin: req.user.lastLogin
        }
    });
});

// Update user profile
app.put('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        const { firstname, lastname, phone, company, preferences } = req.body;

        const updateData = {};
        if (firstname) updateData.firstname = firstname;
        if (lastname) updateData.lastname = lastname;
        if (phone) updateData.phone = phone;
        if (company) updateData.company = company;
        if (preferences) updateData.preferences = { ...req.user.preferences, ...preferences };

        updateData.updatedAt = new Date();

        await User.findByIdAndUpdate(req.user._id, updateData);

        res.json({
            success: true,
            message: 'อัปเดตโปรไฟล์สำเร็จ'
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์'
        });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์'
    });
});

// ===== ADMIN ROUTES =====
// Admin authentication middleware
const authenticateAdmin = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Admin access token required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // Check if user is admin (you can add admin role to user schema)
        if (decoded.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }

        const admin = await User.findById(decoded.userId);
        if (!admin) {
            return res.status(401).json({ success: false, message: 'Invalid admin token' });
        }

        req.admin = admin;
        next();
    } catch (error) {
        return res.status(403).json({ success: false, message: 'Invalid or expired admin token' });
    }
};

// Admin stats
app.get('/api/admin/stats', authenticateAdmin, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ 'subscription.status': 'active' });
        const totalTemplates = await Usage.countDocuments();
        
        // Calculate total revenue (simplified)
        const revenueUsers = await User.find({ 
            'subscription.plan': 'pro',
            'subscription.status': 'active'
        });
        
        const planPrices = { pro: 799 };
        const totalRevenue = revenueUsers.reduce((sum, user) => {
            return sum + (planPrices[user.subscription.plan] || 0);
        }, 0);

        res.json({
            success: true,
            stats: {
                totalUsers,
                activeUsers,
                totalTemplates,
                totalRevenue
            }
        });

    } catch (error) {
        console.error('Get admin stats error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการโหลดสถิติ'
        });
    }
});

// Get all users
app.get('/api/admin/users', authenticateAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', plan = '', status = '' } = req.query;
        
        const query = {};
        
        if (search) {
            query.$or = [
                { firstname: { $regex: search, $options: 'i' } },
                { lastname: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (plan) {
            query['subscription.plan'] = plan;
        }
        
        if (status) {
            query['subscription.status'] = status;
        }

        const users = await User.find(query)
            .select('-password -emailVerificationToken -passwordResetToken')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await User.countDocuments(query);

        res.json({
            success: true,
            users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้'
        });
    }
});

// Get user details
app.get('/api/admin/users/:id', authenticateAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password -emailVerificationToken -passwordResetToken');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'ไม่พบผู้ใช้'
            });
        }

        res.json({
            success: true,
            user
        });

    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้'
        });
    }
});

// Update user
app.put('/api/admin/users/:id', authenticateAdmin, async (req, res) => {
    try {
        const { firstname, lastname, email, subscription } = req.body;
        
        const updateData = {};
        if (firstname) updateData.firstname = firstname;
        if (lastname) updateData.lastname = lastname;
        if (email) updateData.email = email;
        if (subscription) updateData.subscription = { ...subscription };

        updateData.updatedAt = new Date();

        const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true })
            .select('-password -emailVerificationToken -passwordResetToken');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'ไม่พบผู้ใช้'
            });
        }

        res.json({
            success: true,
            message: 'อัปเดตข้อมูลผู้ใช้สำเร็จ',
            user
        });

    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลผู้ใช้'
        });
    }
});

// Delete user
app.delete('/api/admin/users/:id', authenticateAdmin, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'ไม่พบผู้ใช้'
            });
        }

        // Also delete user's usage records
        await Usage.deleteMany({ userId: req.params.id });

        res.json({
            success: true,
            message: 'ลบผู้ใช้สำเร็จ'
        });

    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการลบผู้ใช้'
        });
    }
});

// Admin verify
app.get('/api/admin/verify', authenticateAdmin, (req, res) => {
    res.json({
        success: true,
        admin: {
            id: req.admin._id,
            name: `${req.admin.firstname} ${req.admin.lastname}`,
            email: req.admin.email,
            role: 'admin'
        }
    });
});

// Admin recent activity
app.get('/api/admin/activity', authenticateAdmin, async (req, res) => {
    try {
        // Mock data for recent activity
        const activities = [
            {
                type: 'login',
                description: 'ผู้ใช้เข้าสู่ระบบ',
                createdAt: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
            },
            {
                type: 'template',
                description: 'สร้างเทมเพลตใหม่',
                createdAt: new Date(Date.now() - 1000 * 60 * 60) // 1 hour ago
            },
            {
                type: 'login',
                description: 'ผู้ใช้เข้าสู่ระบบ',
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
            }
        ];

        res.json({
            success: true,
            data: activities
        });
    } catch (error) {
        console.error('Get admin activity error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการโหลดกิจกรรม'
        });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'ไม่พบ API endpoint ที่ต้องการ'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
