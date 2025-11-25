// Quick script to manually seed wellness data
// Run this directly in MongoDB or via node with mongoose

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/job-portal';

async function quickSeed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Get models
        const WellbeingTip = mongoose.model('WellbeingTip');
        const MentalHealthResource = mongoose.model('MentalHealthResource');
        const ComplianceGuideline = mongoose.model('ComplianceGuideline');

        // Seed tips
        const tipData = [
            { dayOfWeek: 'Monday', tip: '💪 Start your week strong! Take 5-minute breaks every hour to stay energized and focused throughout the day.' },
            { dayOfWeek: 'Tuesday', tip: '🧘 Practice mindfulness today. Try a 10-minute meditation session during lunch to reduce stress and improve focus.' },
            { dayOfWeek: 'Wednesday', tip: '💧 Stay hydrated! Drink at least 8 glasses of water today. Keep a water bottle at your desk as a reminder.' },
            { dayOfWeek: 'Thursday', tip: '🚶 Take a walk! A quick 15-minute walk can boost your mood, creativity, and overall health.' },
            { dayOfWeek: 'Friday', tip: '🎉 Celebrate your wins! Reflect on what you accomplished this week and appreciate your hard work.' },
            { dayOfWeek: 'Saturday', tip: '😴 Prioritize rest. Aim for 7-9 hours of quality sleep to recharge your body and mind for the week ahead.' },
            { dayOfWeek: 'Sunday', tip: '📝 Plan ahead! Spend 20 minutes organizing your tasks for the upcoming week to reduce Monday stress.' }
        ];

        for (const tip of tipData) {
            await WellbeingTip.findOneAndUpdate(
                { dayOfWeek: tip.dayOfWeek },
                tip,
                { upsert: true, new: true }
            );
        }
        console.log('✓ Tips seeded');

        // Seed resources
        const resourceData = [
            {
                title: 'National Suicide Prevention Lifeline',
                description: '24/7 free and confidential support for people in distress.',
                phoneNumber: '1-800-273-8255',
                url: 'https://suicidepreventionlifeline.org',
                category: 'Crisis Support',
                isActive: true
            },
            {
                title: 'BetterHelp Online Therapy',
                description: 'Professional, affordable, and convenient online counseling.',
                url: 'https://www.betterhelp.com',
                category: 'Therapy',
                isActive: true
            },
            {
                title: 'Crisis Text Line',
                description: 'Free 24/7 support via text. Text HOME to 741741.',
                phoneNumber: 'Text HOME to 741741',
                url: 'https://www.crisistextline.org',
                category: 'Crisis Support',
                isActive: true
            }
        ];

        await MentalHealthResource.deleteMany({});
        await MentalHealthResource.insertMany(resourceData);
        console.log('✓ Resources seeded');

        // Seed one guideline
        const guidelineData = [{
            title: 'Workplace Safety Guidelines',
            content: 'Our company is committed to providing a safe and healthy work environment.\n\n**Your Rights:**\n- Right to a safe workplace\n- Right to safety training\n- Right to file complaints',
            category: 'Workplace Safety',
            displayOrder: 1,
            isActive: true
        }];

        await ComplianceGuideline.deleteMany({});
        await ComplianceGuideline.insertMany(guidelineData);
        console.log('✓ Guidelines seeded');

        console.log('\n✅ All data seeded!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

// Check if models are registered, if not define them
if (!mongoose.models.WellbeingTip) {
    const wellbeingTipSchema = new mongoose.Schema({
        dayOfWeek: { type: String, required: true, unique: true },
        tip: { type: String, required: true }
    });
    mongoose.model('WellbeingTip', wellbeingTipSchema);
}

if (!mongoose.models.MentalHealthResource) {
    const resourceSchema = new mongoose.Schema({
        title: String,
        description: String,
        url: String,
        phoneNumber: String,
        category: String,
        isActive: Boolean
    });
    mongoose.model('MentalHealthResource', resourceSchema);
}

if (!mongoose.models.ComplianceGuideline) {
    const guidelineSchema = new mongoose.Schema({
        title: String,
        content: String,
        category: String,
        displayOrder: Number,
        isActive: Boolean
    });
    mongoose.model('ComplianceGuideline', guidelineSchema);
}

quickSeed();
