const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const express = require('express');
const router = express.Router();
const User = require('./models/User');

// Subscription plans
const PLANS = {
    basic: {
        name: 'Basic',
        price: 0,
        features: [
            '5 Credits ต่อเดือน',
            'การสนับสนุนทางอีเมล',
            'การใช้งานพื้นฐาน',
            'เทมเพลต AI ครบทุกหมวดหมู่'
        ],
        limits: {
            creditsPerMonth: 5,
            contentLength: 1000
        }
    },
    pro: {
        name: 'Pro',
        price: 799,
        priceId: process.env.STRIPE_PRO_PRICE_ID,
        features: [
            'ใช้ได้ไม่จำกัด',
            'การสนับสนุนทางโทรศัพท์',
            'เทมเพลตพิเศษ',
            'การวิเคราะห์การใช้งาน',
            'การส่งออกไฟล์หลายรูปแบบ',
            'การรวมระบบ API'
        ],
        limits: {
            creditsPerMonth: -1, // Unlimited
            contentLength: -1 // Unlimited
        }
    }
};

// Get available plans
router.get('/plans', (req, res) => {
    res.json({
        success: true,
        plans: PLANS
    });
});

// Create checkout session
router.post('/create-checkout-session', async (req, res) => {
    try {
        const { planId, userId } = req.body;
        
        if (!PLANS[planId]) {
            return res.status(400).json({
                success: false,
                message: 'แผนการใช้งานไม่ถูกต้อง'
            });
        }

        const plan = PLANS[planId];
        
        if (plan.price === 0) {
            // Free plan - no payment required
            return res.json({
                success: true,
                message: 'คุณสามารถใช้งานแผนฟรีได้ทันที',
                isFree: true
            });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'thb',
                        product_data: {
                            name: `Prompt Template Lab - ${plan.name}`,
                            description: plan.features.join(', ')
                        },
                        unit_amount: plan.price * 100, // Convert to satang
                        recurring: {
                            interval: 'month'
                        }
                    },
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.FRONTEND_URL}/dashboard?success=true&plan=${planId}`,
            cancel_url: `${process.env.FRONTEND_URL}/dashboard?canceled=true`,
            customer_email: req.user?.email,
            metadata: {
                userId: userId || req.user?._id,
                planId: planId
            }
        });

        res.json({
            success: true,
            sessionId: session.id,
            url: session.url
        });

    } catch (error) {
        console.error('Create checkout session error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการสร้าง session การชำระเงิน'
        });
    }
});

// Handle successful payment
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            await handleSuccessfulPayment(session);
            break;
        case 'invoice.payment_succeeded':
            const invoice = event.data.object;
            await handleRecurringPayment(invoice);
            break;
        case 'customer.subscription.deleted':
            const subscription = event.data.object;
            await handleSubscriptionCancelled(subscription);
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({received: true});
});

// Handle successful payment
async function handleSuccessfulPayment(session) {
    try {
        const { userId, planId } = session.metadata;
        
        if (!userId || !planId) {
            console.error('Missing metadata in checkout session');
            return;
        }

        const user = await User.findById(userId);
        if (!user) {
            console.error('User not found:', userId);
            return;
        }

        // Update user subscription
        user.subscription.plan = planId;
        user.subscription.status = 'active';
        user.subscription.startDate = new Date();
        user.subscription.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
        user.subscription.usage = {
            templatesUsed: 0,
            contentCreated: 0,
            timeSaved: 0
        };

        await user.save();
        console.log(`User ${userId} upgraded to ${planId} plan`);

    } catch (error) {
        console.error('Error handling successful payment:', error);
    }
}

// Handle recurring payment
async function handleRecurringPayment(invoice) {
    try {
        const customerId = invoice.customer;
        const user = await User.findOne({ 'stripe.customerId': customerId });
        
        if (!user) {
            console.error('User not found for customer:', customerId);
            return;
        }

        // Extend subscription
        user.subscription.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
        user.subscription.status = 'active';
        user.subscription.usage.templatesUsed = 0; // Reset monthly usage

        await user.save();
        console.log(`Recurring payment processed for user ${user._id}`);

    } catch (error) {
        console.error('Error handling recurring payment:', error);
    }
}

// Handle subscription cancellation
async function handleSubscriptionCancelled(subscription) {
    try {
        const customerId = subscription.customer;
        const user = await User.findOne({ 'stripe.customerId': customerId });
        
        if (!user) {
            console.error('User not found for customer:', customerId);
            return;
        }

        // Downgrade to free plan
        user.subscription.plan = 'free';
        user.subscription.status = 'cancelled';
        user.subscription.endDate = new Date();

        await user.save();
        console.log(`Subscription cancelled for user ${user._id}`);

    } catch (error) {
        console.error('Error handling subscription cancellation:', error);
    }
}

// Get current subscription
router.get('/subscription', async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'ไม่พบผู้ใช้'
            });
        }

        res.json({
            success: true,
            subscription: user.subscription,
            plan: PLANS[user.subscription.plan]
        });

    } catch (error) {
        console.error('Get subscription error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการโหลดข้อมูลการสมัครสมาชิก'
        });
    }
});

// Cancel subscription
router.post('/cancel-subscription', async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        
        if (!user || !user.stripe?.customerId) {
            return res.status(400).json({
                success: false,
                message: 'ไม่พบข้อมูลการสมัครสมาชิก'
            });
        }

        // Cancel subscription in Stripe
        const subscriptions = await stripe.subscriptions.list({
            customer: user.stripe.customerId,
            status: 'active'
        });

        if (subscriptions.data.length > 0) {
            await stripe.subscriptions.cancel(subscriptions.data[0].id);
        }

        // Update user subscription
        user.subscription.status = 'cancelled';
        user.subscription.endDate = new Date();
        await user.save();

        res.json({
            success: true,
            message: 'ยกเลิกการสมัครสมาชิกสำเร็จ'
        });

    } catch (error) {
        console.error('Cancel subscription error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการยกเลิกการสมัครสมาชิก'
        });
    }
});

module.exports = router;
