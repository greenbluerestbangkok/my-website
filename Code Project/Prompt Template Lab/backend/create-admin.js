const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// User Schema (same as in server.js)
const userSchema = new mongoose.Schema({
    firstname: { type: String, required: true, trim: true },
    lastname: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8 },
    phone: { type: String, trim: true },
    company: { type: String, trim: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isEmailVerified: { type: Boolean, default: true }, // Admin is auto-verified
    subscription: {
        plan: { type: String, enum: ['free', 'basic', 'premium', 'enterprise'], default: 'enterprise' },
        status: { type: String, enum: ['active', 'inactive', 'cancelled'], default: 'active' },
        startDate: { type: Date, default: Date.now },
        endDate: Date,
        usage: {
            templatesUsed: { type: Number, default: 0 },
            contentCreated: { type: Number, default: 0 },
            timeSaved: { type: Number, default: 0 }
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
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

const User = mongoose.model('User', userSchema);

async function createAdmin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/prompt-template-lab', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ role: 'admin' });
        if (existingAdmin) {
            console.log('Admin user already exists:', existingAdmin.email);
            process.exit(0);
        }

        // Create admin user
        const adminData = {
            firstname: 'Admin',
            lastname: 'User',
            email: 'admin@prompttemplatelab.com',
            password: 'admin123456',
            phone: '000-000-0000',
            company: 'Prompt Template Lab',
            role: 'admin',
            isEmailVerified: true,
            subscription: {
                plan: 'enterprise',
                status: 'active',
                startDate: new Date(),
                usage: {
                    templatesUsed: 0,
                    contentCreated: 0,
                    timeSaved: 0
                }
            }
        };

        const admin = new User(adminData);
        await admin.save();

        console.log('✅ Admin user created successfully!');
        console.log('📧 Email:', admin.email);
        console.log('🔑 Password: admin123456');
        console.log('⚠️  Please change the password after first login!');

    } catch (error) {
        console.error('❌ Error creating admin user:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed');
        process.exit(0);
    }
}

// Run the script
createAdmin();
